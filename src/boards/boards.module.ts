import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { BoardMember } from 'src/board-members/entities/board-member.entity';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService],
  imports: [
    TypeOrmModule.forFeature([Board, BoardMember, WorkspaceMember]),
    PermissionsModule,
  ],
  exports: [BoardsService],
})
export class BoardsModule {}
