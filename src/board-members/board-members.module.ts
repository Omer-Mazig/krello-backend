import { Module } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { BoardMembersController } from './board-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMember } from './entities/board-member.entity';
import { BoardsService } from 'src/boards/boards.service';
import { Board } from 'src/boards/entities/board.entity';
import { MembershipManagerProvider } from 'src/membership-management/providers/membership-manager-provider';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';

@Module({
  controllers: [BoardMembersController],
  providers: [BoardMembersService, BoardsService, MembershipManagerProvider],
  imports: [TypeOrmModule.forFeature([BoardMember, Board, WorkspaceMember])],
})
export class BoardMembersModule {}
