import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { BoardMember } from './entities/board-member.entity';
import { ActivityEventEmitter } from 'src/activities/providers/activity-event-emitter.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService, ActivityEventEmitter, EventEmitter2],
  imports: [TypeOrmModule.forFeature([Board, BoardMember])],
  exports: [BoardsService],
})
export class BoardsModule {}
