import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { User } from '../entities/user.entity';
import { WorkspaceMember } from 'src/workspaces/entities/workspace-member.entity';
import { Board } from 'src/boards/entities/board.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { BoardMember } from 'src/boards/entities/board-member.entity';

@Injectable()
export class UserDeletionProvider {
  constructor(private readonly dataSource: DataSource) {}

  async deleteUser(user: User): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      if (adminCount <= 1) {
        if (members.length === 1) {
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

      if (adminCount <= 1) {
        if (members.length === 1) {
          // Delete the board if this user is the only member
          await queryRunner.manager
            .getRepository(Board)
            .delete({ id: board.id });
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
}
