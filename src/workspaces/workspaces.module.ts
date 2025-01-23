import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';

@Module({
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  imports: [TypeOrmModule.forFeature([Workspace])],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
