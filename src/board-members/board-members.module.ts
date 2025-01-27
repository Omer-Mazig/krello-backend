import { Module } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { BoardMembersController } from './board-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMember } from './entities/board-member.entity';
import { BoardsService } from 'src/boards/boards.service';
import { Board } from 'src/boards/entities/board.entity';

@Module({
  controllers: [BoardMembersController],
  providers: [BoardMembersService, BoardsService],
  imports: [TypeOrmModule.forFeature([BoardMember, Board])],
})
export class BoardMembersModule {}
