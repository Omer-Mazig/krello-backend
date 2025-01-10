import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { Card } from './entities/card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEventEmitter } from 'src/activities/providers/activity-event-emitter.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  controllers: [CardsController],
  providers: [CardsService, ActivityEventEmitter, EventEmitter2],
  imports: [TypeOrmModule.forFeature([Card])],
})
export class CardsModule {}
