import { Module } from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { WorkspaceMembersController } from './workspace-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { UsersService } from 'src/users/users.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserDeletionProvider } from 'src/users/providers/user-deletion.provider';

@Module({
  controllers: [WorkspaceMembersController],
  providers: [
    WorkspaceMembersService,
    UsersService,
    WorkspacesService,
    UserDeletionProvider, // dont use it this module
  ],
  imports: [
    TypeOrmModule.forFeature([WorkspaceMember, User, Workspace]),
    AuthModule, // dont use it this module
  ],
})
export class WorkspaceMembersModule {}
