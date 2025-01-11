import { AuthType } from '../enums/auth-type.enum';
import { SetMetadata } from '@nestjs/common';

/**
 * The metadata key used to store authentication types for a route or class.
 * Guards can use this key to determine which authentication methods to apply.
 */
export const AUTH_TYPE_KEY = 'authType';

/**
 * A custom decorator to specify the authentication types required for a route or class.
 *
 * This decorator sets metadata (`AUTH_TYPE_KEY`) that can be read by guards (e.g., `AuthGuard`)
 * to determine the applicable authentication logic.
 *
 * @example
 * // Apply bearer token authentication
 * @Auth(AuthType.Bearer)
 * @Get('secure-route')
 * secureRoute() {
 *   return 'This route requires a valid bearer token';
 * }
 *
 * @example
 * // Apply multiple authentication types
 * @Auth(AuthType.Bearer, AuthType.BoardSuperAdmin)
 * @Delete('delete-route')
 * deleteRoute() {
 *   return 'This route requires both authentication and super admin privileges';
 * }
 *
 * @param authTypes - One or more `AuthType` values specifying the authentication methods required.
 * @returns A custom decorator that sets the `AUTH_TYPE_KEY` metadata.
 */
export const Auth = (...authTypes: AuthType[]) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);
