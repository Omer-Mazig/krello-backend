import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityPayload } from '../types/activity-payload.type';

@Injectable()
export class ActivityEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitActivity(eventName: string, payload: ActivityPayload) {
    this.eventEmitter.emit(eventName, payload);
  }
}
