import { IsString } from 'class-validator'

export class SgidCallbackCookieDto {
  @IsString()
  codeVerifier: string

  @IsString()
  nonce: string
}
