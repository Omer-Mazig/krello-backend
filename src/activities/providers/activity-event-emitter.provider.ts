import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityPayloadMap } from '../types/activity-payload.type';

/**
 * The `ActivityEventEmitter` class provides a strongly-typed wrapper around the `EventEmitter2`
 * to emit activity events with payload validation based on the event type.
 */
@Injectable()
export class ActivityEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Emits an activity event with the corresponding payload.
   *
   * This method ensures that the `eventName` and `payload` are strongly typed and aligned.
   * By specifying the `eventName`, the method automatically infers the correct payload type
   * from `ActivityPayloadMap`, providing compile-time validation and preventing mismatches.
   *
   * @template K - The specific event name from the `ActivityPayloadMap`.
   * @param {K} eventName - The name of the event to emit. Must be a key in `ActivityPayloadMap`.
   * @param {ActivityPayloadMap[K]} payload - The payload for the event, inferred based on `eventName`.
   *
   * ### Example
   * ```typescript
   * this.activityEventEmitter.emitActivity(ActivityEvent.CARD_ADDED, {
   *   type: ActivityEvent.CARD_ADDED,
   *   userId: 'user123',
   *   sourceBoardId: 'board456',
   *   cardId: 'card789',
   *   sourceListTitle: 'To Do',
   * });
   * ```
   *
   * @throws {Error} If the event name or payload is invalid or does not match the defined types.
   */
  emitActivity<K extends keyof ActivityPayloadMap>(
    eventName: K,
    payload: ActivityPayloadMap[K],
  ) {
    console.log(eventName, payload);

    this.eventEmitter.emit(eventName, payload);
  }
}
