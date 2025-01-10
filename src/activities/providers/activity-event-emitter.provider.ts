import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityEvent } from '../enums/activity-event.enum';

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
