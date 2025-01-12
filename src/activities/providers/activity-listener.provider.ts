import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivitiesService } from '../activities.service';
import { BOARD_ADDED } from 'src/events/event.constants';

/**
 * Handles activity events and delegates actions to the `ActivitiesService`.
 *
 * This listener is designed to handle multiple actions based on the same event,
 * providing flexibility for event-driven workflows.
 */
@Injectable()
export class ActivityListener {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // @OnEvent(BOARD_ADDED)
  handleAddingBoardEvent(payload: any) {
    // fix any
    this.activitiesService.createActivity(payload);
  }
}
