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
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('AccessTokenGuard: Checking token...');

    const token = this._extractTokenFromHeader(request);
    if (!token) {
      console.log('AccessTokenGuard: No token found');
      throw new UnauthorizedException(
        'Authorization header is missing or invalid',
      );
    }

    console.log('AccessTokenGuard: Token found, verifying...');
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      console.log('AccessTokenGuard: Verification result:', payload);

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user) {
        console.log('AccessTokenGuard: User not found in database');
        throw new UnauthorizedException('User not found');
      }

      if (payload.type !== 'access') {
        throw new UnauthorizedException(
          'Invalid token type - access token required',
        );
      }

      request[REQUEST_USER_KEY] = payload;
      return true;
    } catch (error) {
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
