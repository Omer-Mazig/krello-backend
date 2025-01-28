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
    workspace: Workspace,
    memberToDeleteId: string,
  ): Promise<void> {
    const [members, adminCount] = await Promise.all([
      queryRunner.manager.getRepository(WorkspaceMember).find({
        where: { workspace: { id: workspace.id } },
        relations: { user: true },
        order: { createdAt: 'ASC' },
      }),
      queryRunner.manager.getRepository(WorkspaceMember).count({
        where: { workspace: { id: workspace.id }, role: 'admin' },
      }),
    ]);

    const isLastAdmin = adminCount <= 1;
    const isLastMember = members.length === 1;

    if (isLastMember) {
      // Delete workspace and related boards
      await queryRunner.manager.getRepository(Board).delete({
        workspace: { id: workspace.id },
      });
      await queryRunner.manager.getRepository(Workspace).delete({
        id: workspace.id,
      });
      return;
    }

    if (isLastAdmin) {
      const newAdmin = members.find((m) => m.id !== memberToDeleteId);
      if (newAdmin) {
        newAdmin.role = 'admin';
        await queryRunner.manager.getRepository(WorkspaceMember).save(newAdmin);
      }
    }
  }

  async handleBoardMembers(
    queryRunner: QueryRunner,
    board: Board,
    memberToDeleteId: string,
  ): Promise<void> {
    const [members, adminCount] = await Promise.all([
      queryRunner.manager.getRepository(BoardMember).find({
        where: { board: { id: board.id } },
        relations: { user: true },
        order: { createdAt: 'ASC' },
      }),
      queryRunner.manager.getRepository(BoardMember).count({
        where: { board: { id: board.id }, role: 'admin' },
      }),
    ]);

    const isLastAdmin = adminCount <= 1;
    const isLastMember = members.length === 1;

    if (isLastMember) {
      // Delete the board
      await queryRunner.manager.getRepository(Board).delete({
        id: board.id,
      });
      return;
    }

    if (isLastAdmin) {
      const newAdmin = members.find((m) => m.id !== memberToDeleteId);
      if (newAdmin) {
        newAdmin.role = 'admin';
        await queryRunner.manager.getRepository(BoardMember).save(newAdmin);
      }
    }
  }
}
