import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { BoardMember } from 'src/board-members/entities/board-member.entity';
import { Board } from 'src/boards/entities/board.entity';
import { PermissionsGuard } from './permissions.guard';
import { PermissionsLogger } from './permissions.logger';
import { List } from 'src/lists/entities/list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceMember, BoardMember, Board])],
  providers: [PermissionsGuard, PermissionsLogger],
  exports: [PermissionsGuard, PermissionsLogger],
})
export class PermissionsModule {}
