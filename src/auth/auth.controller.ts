import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { validateSync } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { SgidCallbackCookieDto } from './auth.dto'
import { InjectBot } from 'nestjs-telegraf'
import { Context, Telegraf } from 'telegraf'
import { SgidAuthStatus } from './auth.constants'
import { DatabaseService } from '../database/database.service'

const SGID_PO_COOKIE_NAME = 'SGID_PO_COOKIE_NAME'
const TELEGRAM_PREFIX = `https://t.me`

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly databaseService: DatabaseService,
    @InjectBot() private readonly bot: Telegraf<Context>,
  ) {}
  @Get('sgid/auth-url')
  generateSgIdAuthUrl(
    @Query('userId') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { codeVerifier, codeChallenge, nonce } =
      this.authService.generateSgidLoginParams()
    const url = this.authService.createSgidAuthUrl({
      userId,
      codeChallenge,
      nonce,
    })
    const cookie = JSON.stringify({
      codeVerifier,
      nonce,
    })

    res.cookie(SGID_PO_COOKIE_NAME, cookie, { httpOnly: true })
    res.redirect(url)
  }

  @Get('sgid/callback')
  async sgidCallback(
    @Req() req: Request,
    @Query('code') code: string,
    @Query('state') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    // One time validity
    res.clearCookie(SGID_PO_COOKIE_NAME)

    const rawCookie = req.cookies[SGID_PO_COOKIE_NAME]
    if (typeof rawCookie !== 'string') {
      throw new UnauthorizedException(
        "You're not authorised to access this link.",
      )
    }

    // Extract & Validate cookie
    const cookie = JSON.parse(rawCookie)
    const cookieInstance = plainToInstance(SgidCallbackCookieDto, cookie)
    const errors = validateSync(cookieInstance)
    if (errors.length > 0) {
      throw new UnauthorizedException(
        "You're not authorised to access this link.",
      )
    }

    const authDetails = await this.authService.verifyUserFromAuthCode({
      code,
      nonce: cookieInstance.nonce,
      codeVerifier: cookieInstance.codeVerifier,
    })

    let message = ''
    if (authDetails.status === SgidAuthStatus.AUTHENTICATED_PUBLIC_OFFICER) {
      const verifiedMessage = [`You are verified with the following details:`]
      for (const poDetail of authDetails.poDetails) {
        verifiedMessage.push(
          `<b>Agency: </b>${poDetail.agency_name}\n<b>Department: </b>${poDetail.department_name}\n<b>Title: </b>${poDetail.employment_title}`,
        )
      }
      verifiedMessage.push(`\n/logout to log out`)

      const poDetails = authDetails.poDetails.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ work_email: _discarded, ...details }) => details,
      )

      await this.databaseService.store.set(userId, {
        name: authDetails.name,
        verified_date: new Date(),
        poDetails,
      })

      message = `<b>Authenticated Public Officer</b>\n\n${verifiedMessage.join(
        '\n',
      )}`
    } else if (authDetails.status === SgidAuthStatus.AUTHENTICATED_USER) {
      message = 'Authenticated, but not Public Officer'
    } else {
      message = 'Not authenticated'
    }

    // In 1-1 chats between user and bot, `chatId` is identical to `userId`
    const chatId = userId
    if (message.length) {
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        disable_notification: true,
      })
    }

    // Redirect to telegram bot
    const { username: botName } = await this.bot.telegram.getMe()
    res.redirect(`${TELEGRAM_PREFIX}/${botName}`)
  }
}
