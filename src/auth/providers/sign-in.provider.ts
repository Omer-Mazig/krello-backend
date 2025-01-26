import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from '../dtos/signin.dto';
import { HashingProvider } from './hashing.provider';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { UsersFinderProvider } from 'src/users/providers/users-finder.provider';

@Injectable()
export class SignInProvider {
  constructor(
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
    private readonly usersFinderProvider: UsersFinderProvider,
  ) {}

  public async signIn(signInDto: SignInDto) {
    const userWithPassword = await this.usersFinderProvider.findOneWithPassword(
      signInDto.email,
    );

    if (!userWithPassword) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    let isEqual = false;

    try {
      isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        userWithPassword.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare passwords',
      });
    }

    if (!isEqual) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    return await this.generateTokensProvider.generateTokens(userWithPassword);
  }
}
