import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { Board } from 'src/boards/entities/board.entity';
import { BoardMember } from 'src/board-members/entities/board-member.entity';

@Injectable()
export class MembershipManagerProvider {
  async handleWorkspaceMembers(
    queryRunner: QueryRunner,
    memberToDelete: WorkspaceMember,
  ): Promise<void> {
    const [members, adminCount] = await Promise.all([
      queryRunner.manager.getRepository(WorkspaceMember).find({
        where: { workspace: { id: memberToDelete.workspace.id } },
        relations: { user: true },
        order: { createdAt: 'ASC' },
      }),
      queryRunner.manager.getRepository(WorkspaceMember).count({
        where: {
          workspace: { id: memberToDelete.workspace.id },
          role: 'admin',
        },
      }),
    ]);

    const isLastAdmin = adminCount <= 1;
    const isLastMember = members.length === 1;

    if (isLastMember) {
      // Delete workspace and related boards
      await queryRunner.manager.getRepository(Board).delete({
        workspace: { id: memberToDelete.workspace.id },
      });
      await queryRunner.manager.getRepository(Workspace).delete({
        id: memberToDelete.workspace.id,
      });
      return;
    }

    if (isLastAdmin) {
      const newAdmin = members.find((m) => m.id !== memberToDelete.id);
      if (newAdmin) {
        newAdmin.role = 'admin';
        await queryRunner.manager.getRepository(WorkspaceMember).save(newAdmin);
      }
    }
  }

  async handleBoardMembers(
    queryRunner: QueryRunner,
    memberToDelete: BoardMember,
  ): Promise<void> {
    const [members, adminCount] = await Promise.all([
      queryRunner.manager.getRepository(BoardMember).find({
        where: { board: { id: memberToDelete.board.id } },
        relations: { user: true },
        order: { createdAt: 'ASC' },
      }),
      queryRunner.manager.getRepository(BoardMember).count({
        where: { board: { id: memberToDelete.board.id }, role: 'admin' },
      }),
    ]);

    const isLastAdmin = adminCount <= 1;
    const isLastMember = members.length === 1;

    if (isLastMember) {
      // Delete the board
      await queryRunner.manager.getRepository(Board).delete({
        id: memberToDelete.board.id,
      });
      return;
    }

    if (isLastAdmin) {
      const newAdmin = members.find((m) => m.id !== memberToDelete.id);
      if (newAdmin) {
        newAdmin.role = 'admin';
        await queryRunner.manager.getRepository(BoardMember).save(newAdmin);
      }
    }
  }
}
