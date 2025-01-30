import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { UsersModule } from 'src/users/users.module';
import { SignInProvider } from './providers/sign-in.provider';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { GenerateTokensProvider } from './providers/generate-tokens.provider';
import { RefreshTokensProvider } from './providers/refresh-tokens.provider';
import { CookieProvider } from './providers/cookie.provider';
import { UsersFinderProvider } from 'src/users/providers/users-finder.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AccessTokenGuard } from './guards/access-token/access-token.guard';

// TODO: LOOK AT APP MODULE CONFIG. WE MIGHT REMOE SOME CONFIG HERE

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    // The HashingProvider is an abstract class, so we need to specify
    // which concrete class should be used when it is inject
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    SignInProvider,
    GenerateTokensProvider,
    RefreshTokensProvider,
    CookieProvider,
    UsersFinderProvider,
    AccessTokenGuard,
  ],
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => UsersModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  exports: [HashingProvider, AccessTokenGuard],
})
export class AuthModule {}
