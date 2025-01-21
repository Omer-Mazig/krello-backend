import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserDeletionProvider } from 'src/users/providers/user-deletion.provider';

// TODO: figure out WHY we need AuthModule and UserDeletionProvider here...
@Module({
  controllers: [WorkspacesController],
  providers: [WorkspacesService, UsersService, UserDeletionProvider],
  imports: [
    TypeOrmModule.forFeature([Workspace, WorkspaceMember, User]),
    UsersModule,
    AuthModule,
  ],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
