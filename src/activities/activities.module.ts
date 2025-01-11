import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { ActivityListener } from './providers/activity-listener.provider';
import { ActivityEventEmitter } from './providers/activity-event-emitter.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  controllers: [ActivitiesController],
  providers: [
    ActivitiesService,
    ActivityListener,
    ActivityEventEmitter,
    EventEmitter2,
  ],
  imports: [TypeOrmModule.forFeature([Activity])],
})
export class ActivitiesModule {}
