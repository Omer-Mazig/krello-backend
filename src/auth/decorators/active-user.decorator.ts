import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { REQUEST_USER_KEY } from '../constants/auth.constants';

/**
 * A custom decorator to access the currently authenticated user's data from the request.
 *
 * The user data is expected to be attached to the request object using the `REQUEST_USER_KEY` constant.
 *
 * @example
 * // Retrieve the entire user object
 * @Get()
 * myRoute(@ActiveUser() user: ActiveUserData) {
 *   console.log(user);
 * }
 *
 * @example
 * // Retrieve a specific field from the user object (e.g., `sub`)
 * @Get()
 * myRoute(@ActiveUser('sub') userId: string) {
 *   console.log(userId);
 * }
 */
export const ActiveUser = createParamDecorator(
  /**
   * Retrieves the authenticated user's data or a specific field from it.
   *
   * @param field - (Optional) A specific field of the user object to retrieve.
   * @param ctx - The execution context of the request.
   * @returns The full user object or the value of the specified field, or `undefined` if the user is not authenticated.
   */
  (field: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    // Extract the request object from the execution context.
    const request = ctx.switchToHttp().getRequest();

    // Retrieve the user data from the request.
    const user: ActiveUserData = request[REQUEST_USER_KEY];

    // Return the specified field or the entire user object.
    return field ? user?.[field] : user;
  },
);
