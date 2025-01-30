import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/auth/config/jwt.config';
import { Request } from 'express';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this._extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(
        'Authorization header is missing or invalid',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      if (payload.type !== 'access') {
        throw new UnauthorizedException(
          'Invalid token type - access token required',
        );
      }

      request[REQUEST_USER_KEY] = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Log the actual error for debugging (optional)
      console.error('Token validation error:', error);

      throw new UnauthorizedException(
        error.name === 'JsonWebTokenError'
          ? 'Invalid token'
          : error.name === 'TokenExpiredError'
            ? 'Token has expired'
            : 'Invalid or malformed token',
      );
    }
  }

  private _extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
