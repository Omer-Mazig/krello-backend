import { Module } from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { WorkspaceMembersController } from './workspace-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

@Module({
  controllers: [WorkspaceMembersController],
  providers: [WorkspaceMembersService],
  imports: [TypeOrmModule.forFeature([WorkspaceMember, User, Workspace])],
})
export class WorkspaceMembersModule {}
