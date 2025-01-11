import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AUTH_TYPE_KEY } from 'src/auth/decorators/auth.decorator';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { Reflector } from '@nestjs/core';
import { BoardSuperAdminGuard } from '../boards/board-super-admin/board-super-admin-guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  > = {
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.None]: { canActivate: () => true },
    [AuthType.BoardSuperAdmin]: [
      this.accessTokenGuard,
      this.boardSuperAdminGuard,
    ],
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly boardSuperAdminGuard: BoardSuperAdminGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();

    let lastError: Error | null = null;

    for (const instance of guards) {
      try {
        const canActivate = await Promise.resolve(
          instance.canActivate(context),
        );
        if (!canActivate) {
          throw new UnauthorizedException(
            'One of the guards failed to authorize the request.',
          );
        }
      } catch (err) {
        lastError = err;
        break;
      }
    }

    if (lastError) {
      throw lastError;
    }

    return true;
  }
}
