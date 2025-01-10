import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityEvent } from '../enums/activity-event.enum';

/**
 * this provider will be useful when we have more than one actions base on the same event
 */
@Injectable()
export class ActivityEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitActivity<TActivityPayload>(
    eventName: ActivityEvent,
    payload: TActivityPayload,
  ) {
    this.eventEmitter.emit(eventName, payload);
  }
}
