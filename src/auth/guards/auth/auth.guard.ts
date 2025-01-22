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
import { BoardAdminGuard } from '../boards/board-admin-guard';
import { WorkspaceMemberGuard } from '../workspaces/workspace-member-guard';
import { WorkspaceAdminGuard } from '../workspaces/workspace-admin-guard';

/**
 * AuthGuard dynamically executes a set of guards based on the `AuthType` specified
 * using the `@Auth` decorator. It allows combining multiple guards and ensures that all
 * specified guards are evaluated.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * The default auth type to use if none is specified.
   */
  private static readonly defaultAuthType = AuthType.Bearer;

  /**
   * A map of `AuthType` to their respective guards.
   * - `AuthType.None`: No authentication required.
   * - `AuthType.Bearer`: Executes the `AccessTokenGuard`.
   * - `AuthType.BoardSuperAdmin`: Executes both `AccessTokenGuard` and `BoardSuperAdminGuard`.
   */
  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  > = {
    [AuthType.None]: { canActivate: () => true },
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.WorkspaceAdmin]: [
      this.accessTokenGuard,
      this.workspaceAdminGuard,
    ],
    [AuthType.WorkspaceMember]: [
      this.accessTokenGuard,
      this.workspaceMemberGuard,
    ],
    [AuthType.BoardAdmin]: [this.accessTokenGuard, this.boardAdminGuard],
  };

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
    private readonly workspaceAdminGuard: WorkspaceAdminGuard,
    private readonly workspaceMemberGuard: WorkspaceMemberGuard,
    private readonly boardAdminGuard: BoardAdminGuard,
  ) {}

  /**
   * Determines if the request can proceed by evaluating the specified guards for the current route or class.
   *
   * @param context - The execution context of the request.
   * @returns A promise that resolves to `true` if all required guards pass; otherwise, throws an error.
   * @throws Exception if any guard fails to authorize the request.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Retrieve the list of `AuthType` for the route/class, or use the default.
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthGuard.defaultAuthType];

    // Map `AuthType` to the corresponding guards.
    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();

    let lastError: Error | null = null;

    // Evaluate each guard in sequence.
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
        lastError = err; // Capture the last error encountered.
        break;
      }
    }

    // If any guard failed, throw the captured error.
    if (lastError) {
      throw lastError;
    }

    // All guards passed.
    return true;
  }
}
