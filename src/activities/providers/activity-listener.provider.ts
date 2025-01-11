import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivitiesService } from '../activities.service';
import { ActivityEvent } from '../enums/activity-event.enum';
import { ActivityPayloadMap } from '../types/activity-payload.type';

/**
 * Handles activity events and delegates actions to the `ActivitiesService`.
 *
 * This listener is designed to handle multiple actions based on the same event,
 * providing flexibility for event-driven workflows.
 */
@Injectable()
export class ActivityListener {
  constructor(private readonly activityService: ActivitiesService) {}

  /**
   * Handles the `CARD_ADDED` activity event.
   *
   * This method is triggered whenever a `CARD_ADDED` event is emitted.
   * It delegates the creation of the corresponding activity to the `ActivitiesService`.
   *
   * @param {ActivityPayloadMap[ActivityEvent.CARD_ADDED]} payload -
   *   The payload for the `CARD_ADDED` event. Its type is inferred from the
   *   `ActivityPayloadMap` based on the event name.
   *
   * ### Example Payload
   * ```typescript
   * {
   *   type: ActivityEvent.CARD_ADDED,
   *   userId: 'user123',
   *   sourceBoardId: 'board456',
   *   cardId: 'card789',
   *   sourceListTitle: 'To Do'
   * }
   * ```
   */
  @OnEvent(ActivityEvent.CARD_ADDED)
  async handleAddingCardEvent(
    payload: ActivityPayloadMap[ActivityEvent.CARD_ADDED],
  ) {
    await this.activityService.createActivity<
      ActivityPayloadMap[ActivityEvent.CARD_ADDED]
    >(payload);
  }
}
