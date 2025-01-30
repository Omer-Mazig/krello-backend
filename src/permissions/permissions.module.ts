import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { BoardMember } from 'src/board-members/entities/board-member.entity';
import { Board } from 'src/boards/entities/board.entity';
import { PermissionsGuard } from './permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceMember, BoardMember, Board])],
  providers: [PermissionsGuard],
  exports: [PermissionsGuard],
})
export class PermissionsModule {}
