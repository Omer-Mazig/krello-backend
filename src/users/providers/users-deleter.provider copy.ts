import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { User } from '../entities/user.entity';
import { Board } from 'src/boards/entities/board.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { UsersFinderProvider } from './users-finder.provider';
import { BoardMember } from 'src/board-members/entities/board-member.entity';

// TODO: swap if and else to early return
@Injectable()
export class UsersDeleterProvider {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersFinderProvider: UsersFinderProvider,
  ) {}

  async delete(userId: string): Promise<void> {
    const user = await this.usersFinderProvider.findOneById(userId);

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Handle workspaces and boards
      await this.handleUserWorkspaces(queryRunner, user);
      await this.handleUserBoards(queryRunner, user);

      // Delete the user
      await queryRunner.manager.getRepository(User).remove(user);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async handleUserWorkspaces(
    queryRunner: QueryRunner,
    user: User,
  ): Promise<void> {
    const workspaceMembers = await queryRunner.manager
      .getRepository(WorkspaceMember)
      .find({
        where: { user: { id: user.id } },
        relations: {
          user: true,
          workspace: true,
        },
      });

    for (const member of workspaceMembers) {
      const { workspace } = member;

      // Check the number of current admins in the workspace
      const adminCount = await queryRunner.manager
        .getRepository(WorkspaceMember)
        .count({ where: { workspace: { id: workspace.id }, role: 'admin' } });

      // Retrieve all workspace members sorted by createdAt
      const members = await queryRunner.manager
        .getRepository(WorkspaceMember)
        .find({
          where: { workspace: { id: workspace.id } },
          relations: {
            user: true,
          },
          order: { createdAt: 'ASC' },
        });

      const isLastAdmin = adminCount <= 1;

      if (!isLastAdmin) {
        return;
      }

      const isLastMember = members.length === 1;

      if (isLastMember) {
        // If this user is the only member, delete the workspace
        await queryRunner.manager
          .getRepository(Board)
          .delete({ workspace: { id: workspace.id } });
        await queryRunner.manager
          .getRepository(Workspace)
          .delete({ id: workspace.id });
      } else {
        // Promote the oldest member (excluding the user being deleted) to admin
        const newAdmin = members.find((m) => m.user.id !== user.id);

        if (!newAdmin) {
          return;
        }

        newAdmin.role = 'admin';
        await queryRunner.manager.getRepository(WorkspaceMember).save(newAdmin);
      }
    }
  }

  private async handleUserBoards(
    queryRunner: QueryRunner,
    user: User,
  ): Promise<void> {
    const boardMembers = await queryRunner.manager
      .getRepository(BoardMember)
      .find({
        where: { user: { id: user.id } },
        relations: {
          user: true,
          board: true,
        },
      });

    for (const member of boardMembers) {
      const { board } = member;

      const adminCount = await queryRunner.manager
        .getRepository(BoardMember)
        .count({ where: { board: { id: board.id }, role: 'admin' } });

      const members = await queryRunner.manager
        .getRepository(BoardMember)
        .find({
          where: { board: { id: board.id } },
          relations: {
            user: true,
          },
          order: { createdAt: 'ASC' },
        });

      const isLastAdmin = adminCount <= 1;

      if (!isLastAdmin) {
        return;
      }

      const isLastMember = members.length === 1;

      if (isLastMember) {
        // Delete the board if this user is the only member
        await queryRunner.manager.getRepository(Board).delete({ id: board.id });
      } else {
        // Promote the oldest member to admin
        const newAdmin = members.find((m) => m.user.id !== user.id);

        if (!newAdmin) {
          return;
        }

        newAdmin.role = 'admin';
        await queryRunner.manager.getRepository(BoardMember).save(newAdmin);
      }
    }
  }
}
