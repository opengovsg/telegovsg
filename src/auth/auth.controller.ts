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

const SGID_PO_COOKIE_NAME = 'SGID_PO_COOKIE_NAME';
const SGID_DEMO_BOT_URL = 'https://t.me/sgid_demo_bot';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('sgid/auth-url')
  generateSgIdAuthUrl(
    @Query('chatId') chatId: string,
    @Res({ passthrough: true }) res: Response,
  ): string {
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
    return url;
  }

  @Get('sgid/callback')
  async sgidCallback(
    @Req() req: Request,
    @Query('code') code: string,
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

    // TODO: Insert custom flow depending on the authentication status.

    // Redirect to telegram bot
    res.redirect(SGID_DEMO_BOT_URL);
  }
}
