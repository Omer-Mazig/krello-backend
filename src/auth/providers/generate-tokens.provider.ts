import { Inject, Injectable } from '@nestjs/common';
import jwtConfig from '../config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class GenerateTokensProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly JwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      // Access Token
      this._signToken<Partial<ActiveUserData>>(
        user.id,
        this.JwtConfiguration.accessTokenTtl,
        'access',
        {
          email: user.email,
        },
      ),

      // Refresh Token
      this._signToken(
        user.id,
        this.JwtConfiguration.refreshTokenTtl,
        'refresh',
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async _signToken<T>(
    userId: string,
    expiresIn: number,
    type: 'access' | 'refresh',
    payload?: T,
  ) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        type,
        ...payload,
      },
      {
        audience: this.JwtConfiguration.audience,
        issuer: this.JwtConfiguration.issuer,
        secret: this.JwtConfiguration.secret,
        expiresIn: expiresIn,
      },
    );
  }
}
