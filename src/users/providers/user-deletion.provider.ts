import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { User } from '../entities/user.entity';
import { WorkspaceMember } from 'src/workspaces/entities/workspace-member.entity';
import { Board } from 'src/boards/entities/board.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { BoardMember } from 'src/boards/entities/board-member.entity';

@Injectable()
export class UserDeletionProvider {
  constructor(private readonly dataSource: DataSource) {}

  async deleteUser(userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.fetchUser(queryRunner, userId);

      // Handle workspaces and boards
      await this.handleUserWorkspaces(queryRunner, user);
      await this.handleUserBoards(queryRunner, user);

      // Remove memberships
      await this.removeUserMemberships(queryRunner, user);

      // Delete the user
      await queryRunner.manager.getRepository(User).remove(user);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error deleting user:', error);
      throw new InternalServerErrorException(
        'Failed to delete user. Please try again later.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async fetchUser(
    queryRunner: QueryRunner,
    userId: string,
  ): Promise<User> {
    const user = await queryRunner.manager.getRepository(User).findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return user;
  }

  private async handleUserWorkspaces(
    queryRunner: QueryRunner,
    user: User,
  ): Promise<void> {
    const workspaceMembers = await queryRunner.manager
      .getRepository(WorkspaceMember)
      .find({ where: { user }, relations: ['workspace'] });

    for (const member of workspaceMembers) {
      const { workspace } = member;

      const adminCount = await queryRunner.manager
        .getRepository(WorkspaceMember)
        .count({ where: { workspace: { id: workspace.id }, role: 'admin' } });

      const members = await queryRunner.manager
        .getRepository(WorkspaceMember)
        .find({
          where: { workspace: { id: workspace.id } },
          order: { createdAt: 'ASC' },
        });

      if (adminCount <= 1) {
        if (members.length === 1) {
          // Delete the workspace if this user is the only member
          await queryRunner.manager.getRepository(Board).delete({ workspace });
          await queryRunner.manager.getRepository(Workspace).delete(workspace);
        } else {
          // Promote the oldest member to admin
          const newAdmin = members.find((m) => m.user.id !== user.id);
          if (newAdmin) {
            newAdmin.role = 'admin';
            await queryRunner.manager
              .getRepository(WorkspaceMember)
              .save(newAdmin);
          }
        }
      }
    }
  }

  private async handleUserBoards(
    queryRunner: QueryRunner,
    user: User,
  ): Promise<void> {
    const boardMembers = await queryRunner.manager
      .getRepository(BoardMember)
      .find({ where: { user }, relations: ['board'] });

    for (const member of boardMembers) {
      const { board } = member;

      const adminCount = await queryRunner.manager
        .getRepository(BoardMember)
        .count({ where: { board: { id: board.id }, role: 'admin' } });

      const members = await queryRunner.manager
        .getRepository(BoardMember)
        .find({
          where: { board: { id: board.id } },
          order: { createdAt: 'ASC' },
        });

      if (adminCount <= 1) {
        if (members.length === 1) {
          // Delete the board if this user is the only member
          await queryRunner.manager.getRepository(Board).delete(board);
        } else {
          // Promote the oldest member to admin
          const newAdmin = members.find((m) => m.user.id !== user.id);
          if (newAdmin) {
            newAdmin.role = 'admin';
            await queryRunner.manager.getRepository(BoardMember).save(newAdmin);
          }
        }
      }
    }
  }

  private async removeUserMemberships(
    queryRunner: QueryRunner,
    user: User,
  ): Promise<void> {
    await queryRunner.manager.getRepository(WorkspaceMember).delete({ user });
    await queryRunner.manager.getRepository(BoardMember).delete({ user });
  }
}
