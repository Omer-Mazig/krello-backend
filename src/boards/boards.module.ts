import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { BoardMember } from './entities/board-member.entity';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService],
  imports: [TypeOrmModule.forFeature([Board, BoardMember])],
  exports: [BoardsService],
})
export class BoardsModule {}
