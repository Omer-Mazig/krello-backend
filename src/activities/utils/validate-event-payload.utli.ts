// import { ZodError } from 'zod';
// import {
//   EventPayloadMap,
//   EventSchemas,
//   EventPayloadUnion,
// } from '../events/event-schemas';

// /**
//  * Validates the payload of an event against its schema.
//  *
//  * This function uses the `type` field in the payload to determine the appropriate schema
//  * for validation. Ensures runtime validation and type safety.
//  *
//  * @template T - The event name (key of `EventPayloadMap`).
//  * @param {T} event - The event name (e.g., 'BOARD_ADDED').
//  * @param {unknown} payload - The payload to validate.
//  * @returns {EventPayloadMap[T]} - The validated payload.
//  * @throws {Error} - Throws if validation fails or the type is invalid.
//  */
// export function validateEventPayload<T extends keyof EventPayloadMap>(
//   event: T,
//   payload: unknown,
// ): EventPayloadMap[T] {
//   // Ensure the payload is an object
//   if (typeof payload !== 'object' || payload === null) {
//     throw new Error(
//       `Invalid payload for event "${event}": Payload must be an object.`,
//     );
//   }

//   // Extract and validate the type field
//   const { type } = payload as Partial<EventPayloadUnion>;
//   if (!type || !(type in EventSchemas)) {
//     throw new Error(
//       `Invalid payload for event "${event}": Missing or invalid "type" field.`,
//     );
//   }

//   const schema = EventSchemas[event];
//   try {
//     // Parse and validate the payload against the schema
//     return schema.parse(payload);
//   } catch (error) {
//     if (error instanceof ZodError) {
//       throw new Error(
//         `Validation failed for event "${event}": ${error.errors
//           .map((e) => `${e.path.join('.')} - ${e.message}`)
//           .join(', ')}`,
//       );
//     }
//     throw new Error(`Unexpected error during validation: ${error.message}`);
//   }
// }
