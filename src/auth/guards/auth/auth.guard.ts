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

/**
 * AuthGuard dynamically executes a set of guards based on the `AuthType` specified
 * using the `@Auth` decorator. It allows combining multiple guards and ensures that all
 * specified guards are evaluated.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * The default auth type to use if none is specified.
   * This ensures all routes require authentication by default
   */
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  >;

  /**
   * Constructs the `AuthGuard` with its dependencies.
   *
   * @param reflector - A utility to access metadata set by decorators.
   * @param accessTokenGuard - Guard responsible for validating access tokens.
   * @param boardAdminGuard - Guard responsible for ensuring the user has `admin` privileges on the board.
   */
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    // Initialize the map in the constructor instead of as a property
    this.authTypeGuardMap = {
      [AuthType.None]: { canActivate: () => true },
      [AuthType.Bearer]: this.accessTokenGuard,
    };
  }

  /**
   * Determines if the request can proceed by evaluating the specified guards for the current route or class.
   *
   * @param context - The execution context of the request.
   * @returns A promise that resolves to `true` if all required guards pass; otherwise, throws an error.
   * @throws Exception if any guard fails to authorize the request.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthGuard.defaultAuthType]; // This will make Bearer auth the default

    // Map `AuthType` to the corresponding guards.
    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();

    // Evaluate each guard in sequence
    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((error) => {
        // Re-throw any caught errors
        throw error;
      });

      if (!canActivate) {
        throw new UnauthorizedException('Guard rejected the request');
      }
    }

    return true;
  }
}
