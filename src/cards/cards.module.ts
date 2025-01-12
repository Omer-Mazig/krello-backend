import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { Card } from './entities/card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  controllers: [CardsController],
  providers: [CardsService, EventEmitter2],
  imports: [TypeOrmModule.forFeature([Card])],
})
export class CardsModule {}
