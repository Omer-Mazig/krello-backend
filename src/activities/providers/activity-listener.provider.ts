import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivitiesService } from '../activities.service';
import { ActivityType } from '../enums/activity-type.enum';
import { ActivityPayloadMap } from '../types/activity-payload.type';
import { BOARD_ADDED } from 'src/events/board.event';
import { CARD_ADDED } from 'src/events/card.event';

/**
 * Handles activity events and delegates actions to the `ActivitiesService`.
 *
 * This listener is designed to handle multiple actions based on the same event,
 * providing flexibility for event-driven workflows.
 */
@Injectable()
export class ActivityListener {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @OnEvent(BOARD_ADDED)
  handleAddingBoardEvent(
    payload: ActivityPayloadMap[ActivityType.BOARD_ADDED],
  ) {
    this.activitiesService.createActivity<
      ActivityPayloadMap[ActivityType.BOARD_ADDED]
    >(payload);
  }

  @OnEvent(CARD_ADDED)
  handleAddingCardEvent(payload: ActivityPayloadMap[ActivityType.CARD_ADDED]) {
    console.log('ActivityListener', payload);

    this.activitiesService.createActivity<
      ActivityPayloadMap[ActivityType.CARD_ADDED]
    >(payload);
  }
}
