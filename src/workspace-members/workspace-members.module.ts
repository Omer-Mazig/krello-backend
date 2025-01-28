import { Module } from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { WorkspaceMembersController } from './workspace-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { MembershipManagerProvider } from 'src/membership-management/providers/membership-manager-provider';
import { BoardMember } from 'src/board-members/entities/board-member.entity';

@Module({
  controllers: [WorkspaceMembersController],
  providers: [WorkspaceMembersService, MembershipManagerProvider],
  imports: [TypeOrmModule.forFeature([WorkspaceMember, BoardMember])],
})
export class WorkspaceMembersModule {}
