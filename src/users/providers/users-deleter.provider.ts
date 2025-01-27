import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersFinderProvider } from './users-finder.provider';
import { MembershipManagerProvider } from 'src/membership-management/providers/membership-manager-provider';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { BoardMember } from 'src/board-members/entities/board-member.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersDeleterProvider {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersFinderProvider: UsersFinderProvider,
    private readonly membershipManager: MembershipManagerProvider,
  ) {}

  async delete(userId: string): Promise<void> {
    const user = await this.usersFinderProvider.findOneById(userId);

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Handle workspace memberships
      const workspaceMembers = await queryRunner.manager
        .getRepository(WorkspaceMember)
        .find({
          where: { user: { id: user.id } },
          relations: { workspace: true },
        });

      for (const member of workspaceMembers) {
        await this.membershipManager.handleWorkspaceMembers(
          queryRunner,
          member.workspace,
          user.id,
        );
      }

      // Handle board memberships
      const boardMembers = await queryRunner.manager
        .getRepository(BoardMember)
        .find({ where: { user: { id: user.id } }, relations: { board: true } });

      for (const member of boardMembers) {
        await this.membershipManager.handleBoardMembers(
          queryRunner,
          member.board,
          user.id,
        );
      }

      // Delete the user
      await queryRunner.manager.getRepository(User).remove(user);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
