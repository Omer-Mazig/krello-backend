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
    // Pre-query all necessary data
    const user = await this.fetchUserDirectly(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const workspaceMemberships = await this.getWorkspaceMemberships(user);
    const boardMemberships = await this.getBoardMemberships(user);

    const orphanedWorkspaces = await this.getOrphanedWorkspaces();
    const orphanedBoards = await this.getOrphanedBoards();

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Handle user-specific workspace operations
      await this.handleUserWorkspaces(queryRunner, workspaceMemberships, user);

      // Handle user-specific board operations
      await this.handleUserBoards(queryRunner, boardMemberships, user);

      // Remove user memberships
      await this.removeUserMemberships(queryRunner, user);

      // Clean up orphaned workspaces and boards
      await this.cleanupSpecificOrphanedWorkspaces(
        queryRunner,
        orphanedWorkspaces,
      );
      await this.cleanupSpecificOrphanedBoards(queryRunner, orphanedBoards);

      // Delete the user
      await queryRunner.manager.getRepository(User).remove(user);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Log the error for debugging
      console.error('Error occurred during user deletion:', {
        userId,
        error: error.message,
        stack: error.stack,
      });

      // Re-throw specific or general errors with additional context
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to delete user with ID ${userId}. Reason: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Pre-query helper methods
  private async fetchUserDirectly(userId: string): Promise<User | null> {
    return this.dataSource.getRepository(User).findOne({
      where: { id: userId },
    });
  }

  private async getWorkspaceMemberships(user: User) {
    return this.dataSource.getRepository(WorkspaceMember).find({
      where: { user },
      relations: ['workspace'],
    });
  }

  private async getBoardMemberships(user: User) {
    return this.dataSource.getRepository(BoardMember).find({
      where: { user },
      relations: ['board'],
    });
  }

  private async getOrphanedWorkspaces() {
    return this.dataSource.getRepository(Workspace).find({
      relations: ['members'],
    });
  }

  private async getOrphanedBoards() {
    return this.dataSource.getRepository(Board).find({
      relations: ['members'],
    });
  }

  // Mutation methods
  private async handleUserWorkspaces(
    queryRunner: QueryRunner,
    workspaceMemberships: WorkspaceMember[],
    user: User,
  ): Promise<void> {
    for (const member of workspaceMemberships) {
      const { workspace } = member;

      const adminCount = await queryRunner.manager
        .getRepository(WorkspaceMember)
        .count({ where: { workspace: { id: workspace.id }, role: 'admin' } });

      const members = workspaceMemberships.filter(
        (m) => m.workspace.id === workspace.id,
      );

      if (adminCount <= 1) {
        if (members.length === 1) {
          // Delete workspace if this user is the only member
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
    boardMemberships: BoardMember[],
    user: User,
  ): Promise<void> {
    for (const member of boardMemberships) {
      const { board } = member;

      const adminCount = await queryRunner.manager
        .getRepository(BoardMember)
        .count({ where: { board: { id: board.id }, role: 'admin' } });

      const members = boardMemberships.filter((m) => m.board.id === board.id);

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

  private async cleanupSpecificOrphanedWorkspaces(
    queryRunner: QueryRunner,
    orphanedWorkspaces: Workspace[],
  ): Promise<void> {
    for (const workspace of orphanedWorkspaces) {
      if (workspace.members.length === 0) {
        await queryRunner.manager.getRepository(Board).delete({ workspace });
        await queryRunner.manager.getRepository(Workspace).delete(workspace.id);
      }
    }
  }

  private async cleanupSpecificOrphanedBoards(
    queryRunner: QueryRunner,
    orphanedBoards: Board[],
  ): Promise<void> {
    for (const board of orphanedBoards) {
      if (board.members.length === 0) {
        await queryRunner.manager.getRepository(Board).delete(board.id);
      }
    }
  }
}
