import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import SgidClient, {
  generatePkcePair,
  generateNonce,
} from '@opengovsg/sgid-client'
import { SgidAuthStatus } from './auth.constants'

const SGID_SCOPE_NAME = 'myinfo.name'
const SGID_SCOPE_PUBLIC_OFFICER_DETAILS = 'pocdex.public_officer_details'
const SGID_SCOPE_TO_ACCESS = [
  'openid',
  SGID_SCOPE_PUBLIC_OFFICER_DETAILS,
  SGID_SCOPE_NAME,
]

export interface PublicOfficerDetails {
  work_email: string
  agency_name: string
  department_name: string
  employment_type: string
  employment_title: string
}

@Injectable()
export class AuthService {
  private readonly sgidClient: SgidClient
  constructor(private configService: ConfigService) {
    this.sgidClient = new SgidClient({
      redirectUri: `${this.configService.get<string>(
        'bot.domain',
      )}/auth/sgid/callback`,
      clientId: this.configService.get<string>('sgid.client_id'),
      clientSecret: this.configService.get<string>('sgid.client_secret'),
      privateKey: this.configService.get<string>('sgid.private_key'),
    })
  }

  generateSgidLoginParams(): {
    codeVerifier: string
    codeChallenge: string
    nonce: string
  } {
    const { codeChallenge, codeVerifier } = generatePkcePair()
    const nonce = generateNonce()
    return { codeChallenge, codeVerifier, nonce }
  }

  createSgidAuthUrl({
    userId,
    nonce,
    codeChallenge,
  }: {
    nonce: string
    userId: string
    codeChallenge: string
  }): string {
    const { url } = this.sgidClient.authorizationUrl({
      nonce: nonce,
      state: userId,
      codeChallenge,
      scope: SGID_SCOPE_TO_ACCESS,
    })
    return url
  }

  async verifyUserFromAuthCode({
    code,
    codeVerifier,
    nonce,
  }: {
    code: string
    codeVerifier: string
    nonce: string
  }): Promise<{
    name?: string
    status: SgidAuthStatus
    poDetails?: PublicOfficerDetails[]
  }> {
    const { accessToken, sub } = await this.sgidClient.callback({
      code,
      codeVerifier,
      nonce,
    })
    try {
      const userInfo = await this.sgidClient.userinfo({ sub, accessToken })
      const rawPoDetails =
        userInfo.data[SGID_SCOPE_PUBLIC_OFFICER_DETAILS] ?? null
      const poDetails: PublicOfficerDetails[] = JSON.parse(rawPoDetails)
      if (!poDetails || poDetails.length === 0) {
        return { status: SgidAuthStatus.AUTHENTICATED_USER }
      }
      return {
        poDetails,
        name: userInfo.data[SGID_SCOPE_NAME],
        status: SgidAuthStatus.AUTHENTICATED_PUBLIC_OFFICER,
      }
    } catch (err) {
      return { status: SgidAuthStatus.NOT_AUTHENTICATED }
    }
  }
}
