import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { BoardMember } from 'src/board-members/entities/board-member.entity';
import { Board } from 'src/boards/entities/board.entity';

@Module({
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  imports: [
    TypeOrmModule.forFeature([Workspace, WorkspaceMember, BoardMember, Board]),
  ],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
