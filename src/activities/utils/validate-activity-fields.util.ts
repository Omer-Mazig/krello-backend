import { BadRequestException } from '@nestjs/common';
import { Activity } from '../entities/activity.entity';

/**
 * Validates that the specified fields in an `Activity` object are not `null` or `undefined`.
 *
 * This utility function ensures type safety by refining the `Activity` type to include the specified fields as non-nullable.
 * If any of the required fields are missing, a `BadRequestException` is thrown with an appropriate error message.
 *
 * @template T - The keys of the `Activity` object that need to be validated.
 * @param {Activity} activity - The `Activity` object to validate.
 * @param {T[]} requiredFields - An array of keys in the `Activity` object that must not be `null` or `undefined`.
 * @param {string} className - The name of the class invoking this function, used for contextual error messages.
 * @throws {BadRequestException} If any of the required fields are `null` or `undefined`.
 *
 */
export function validateActivityFields<T extends keyof Activity>(
  activity: Activity,
  requiredFields: T[],
  className: string,
): asserts activity is Activity & { [K in T]: NonNullable<Activity[K]> } {
  for (const field of requiredFields) {
    if (activity[field] == null) {
      // Check for null or undefined
      const message = `[${className}] Missing property [${field}] on activity: ${activity.type}`;
      console.log(message);
      throw new BadRequestException(message);
    }
  }
}
