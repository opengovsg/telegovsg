import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SgidCallbackCookieDto } from './auth.dto';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { SgidAuthStatus } from './auth.constants';

const SGID_PO_COOKIE_NAME = 'SGID_PO_COOKIE_NAME';
const TELEGRAM_PREFIX = `https://t.me`;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectBot() private readonly bot: Telegraf<Context>,
  ) {}
  @Get('sgid/auth-url')
  generateSgIdAuthUrl(
    @Query('chatId') chatId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { codeVerifier, codeChallenge, nonce } =
      this.authService.generateSgidLoginParams();
    const url = this.authService.createSgidAuthUrl({
      chatId,
      codeChallenge,
      nonce,
    });
    const cookie = JSON.stringify({
      codeVerifier,
      nonce,
    });

    res.cookie(SGID_PO_COOKIE_NAME, cookie, { httpOnly: true });
    res.redirect(url);
  }

  @Get('sgid/callback')
  async sgidCallback(
    @Req() req: Request,
    @Query('code') code: string,
    @Query('state') chatId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    // One time validity
    res.clearCookie(SGID_PO_COOKIE_NAME);

    const rawCookie = req.cookies[SGID_PO_COOKIE_NAME];
    if (typeof rawCookie !== 'string') {
      throw new UnauthorizedException(
        "You're not authorised to access this link.",
      );
    }

    // Extract & Validate cookie
    const cookie = JSON.parse(rawCookie);
    const cookieInstance = plainToInstance(SgidCallbackCookieDto, cookie);
    const errors = validateSync(cookieInstance);
    if (errors.length > 0) {
      throw new UnauthorizedException(
        "You're not authorised to access this link.",
      );
    }

    const authStatus = await this.authService.verifyUserFromAuthCode({
      code,
      nonce: cookieInstance.nonce,
      codeVerifier: cookieInstance.codeVerifier,
    });

    // TODO - Have the bot send different messages depending on outcome
    if (authStatus === SgidAuthStatus.AUTHENTICATED_PUBLIC_OFFICER) {
      await this.bot.telegram.sendMessage(
        chatId,
        'Authenticated Public Officer',
      );
    } else if (authStatus === SgidAuthStatus.AUTHENTICATED_USER) {
      await this.bot.telegram.sendMessage(
        chatId,
        'Authenticated, but not Public Officer',
      );
    } else {
      await this.bot.telegram.sendMessage(chatId, 'Not authenticated');
    }

    // Redirect to telegram bot
    const { username: botName } = await this.bot.telegram.getMe();
    res.redirect(`${TELEGRAM_PREFIX}/${botName}`);
  }
}
