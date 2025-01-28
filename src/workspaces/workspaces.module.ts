import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { BoardMembersService } from 'src/board-members/board-members.service';
import { BoardMember } from 'src/board-members/entities/board-member.entity';
import { MembershipManagerProvider } from 'src/membership-management/providers/membership-manager-provider';
import { WorkspaceMembersService } from 'src/workspace-members/workspace-members.service';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';

@Module({
  controllers: [WorkspacesController],
  providers: [
    WorkspacesService,
    WorkspaceMembersService,
    BoardMembersService,
    MembershipManagerProvider,
  ],
  imports: [
    TypeOrmModule.forFeature([Workspace, WorkspaceMember, BoardMember]),
  ],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
