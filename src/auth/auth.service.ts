import { ImATeapotException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SgidClient, {
  generatePkcePair,
  generateNonce,
} from '@opengovsg/sgid-client';

const REDIRECT_URL = 'http://localhost:3000/auth/sgid/callback'; // For development only, please update to your deployed server url.
const SGID_SCOPE_PUBLIC_OFFICER_DETAILS = 'pocdex.public_officer_details';
const SGID_SCOPE_TO_ACCESS = ['openid', SGID_SCOPE_PUBLIC_OFFICER_DETAILS];

interface PublicOfficerDetails {
  work_email: string;
  agency_name: string;
  department_name: string;
  employment_type: string;
  employment_title: string;
}

@Injectable()
export class AuthService {
  private readonly sgidClient: SgidClient;
  constructor(private configService: ConfigService) {
    this.sgidClient = new SgidClient({
      redirectUri: REDIRECT_URL,
      clientId: this.configService.get<string>('SGID_CLIENT_ID'),
      clientSecret: this.configService.get<string>('SGID_CLIENT_SECRET'),
      privateKey: this.configService.get<string>('SGID_CLIENT_PRIVATE_KEY'),
    });
  }

  generateSgidLoginParams(): {
    codeVerifier: string;
    codeChallenge: string;
    nonce: string;
  } {
    const { codeChallenge, codeVerifier } = generatePkcePair();
    const nonce = generateNonce();
    return { codeChallenge, codeVerifier, nonce };
  }

  createSgidAuthUrl({
    chatId,
    nonce,
    codeChallenge,
  }: {
    nonce: string;
    chatId: string;
    codeChallenge: string;
  }): string {
    const { url } = this.sgidClient.authorizationUrl({
      nonce: nonce,
      state: chatId,
      codeChallenge,
      scope: SGID_SCOPE_TO_ACCESS,
    });
    return url;
  }

  async verifyPoFromAuthCode({
    code,
    codeVerifier,
    nonce,
  }: {
    code: string;
    codeVerifier: string;
    nonce: string;
  }) {
    const { accessToken, sub } = await this.sgidClient.callback({
      code,
      codeVerifier,
      nonce,
    });

    const userInfo = await this.sgidClient.userinfo({ sub, accessToken });
    const rawPoDetails =
      userInfo.data[SGID_SCOPE_PUBLIC_OFFICER_DETAILS] ?? null;
    const poDetails: PublicOfficerDetails[] = JSON.parse(rawPoDetails);

    if (!poDetails || poDetails.length === 0) {
      return 'You are not authorised to join this channel.';
    } else {
      // TODO: Send invite code via telegram bot.
      return 'You have been verified, the invite link has been sent via our telegram bot.';
    }
  }
}
