import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { SignInDto } from './dtos/signin.dto';
import { SignInProvider } from './providers/sign-in.provider';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RefreshTokensProvider } from './providers/refresh-tokens.provider';
import { Response } from 'express';
import { CookieProvider } from './providers/cookie.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly signInProvider: SignInProvider,
    private readonly refreshTokensProvider: RefreshTokensProvider,
    private readonly cookieProvider: CookieProvider,
  ) {}

  public async signIn(signInDto: SignInDto, res: Response) {
    const { accessToken, refreshToken } =
      await this.signInProvider.signIn(signInDto);

    this.cookieProvider.setRefreshToken(res, refreshToken);

    return { accessToken };
  }

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokensProvider.refreshTokens(refreshTokenDto);
  }
}
