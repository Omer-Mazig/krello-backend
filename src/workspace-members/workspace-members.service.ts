import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { CreateWorkspaceMemberDto } from './dto/create-workspace-member.dto';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

@Injectable()
export class WorkspaceMembersService {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMembersRepository: Repository<WorkspaceMember>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createWorkspaceMemberDto: CreateWorkspaceMemberDto,
  ): Promise<WorkspaceMember> {
    try {
      const { workspaceId, userId } = createWorkspaceMemberDto;

      // Check if the user is already a member of the workspace
      const existingMember = await this.workspaceMembersRepository.findOne({
        where: {
          workspace: { id: workspaceId },
          user: { id: userId },
        },
      });

      if (existingMember) {
        throw new BadRequestException(
          'User is already a member of this workspace',
        );
      }

      // Create the new WorkspaceMember
      const newMember = this.workspaceMembersRepository.create({
        workspace: { id: workspaceId },
        user: { id: userId },
      });

      return await this.workspaceMembersRepository.save(newMember);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid user or workspace ID');
      }

      console.error(`Error adding workspace member`, error);
      throw error;
    }
  }

  async remove(memberId: string): Promise<void> {
    try {
      const member = await this.workspaceMembersRepository.findOne({
        where: { id: memberId },
        relations: {
          workspace: {
            members: true,
          },
        },
      });

      if (!member) {
        throw new NotFoundException('Member not found');
      }

      const otherMembers = member.workspace.members.filter((m) => {
        return m.id !== member.id;
      });

      if (otherMembers.length === 0) {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
          await queryRunner.connect();
          await queryRunner.startTransaction();

          await queryRunner.manager
            .getRepository(Workspace)
            .delete({ id: member.workspace.id });

          await queryRunner.manager
            .getRepository(WorkspaceMember)
            .delete({ id: member.id });

          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      } else {
        if (!otherMembers.some((m) => m.role === 'admin')) {
          const queryRunner = this.dataSource.createQueryRunner();

          try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            // TODO: prompt the oldest
            const { ...memberToMakeAdmin } = otherMembers[0];
            memberToMakeAdmin.role = 'admin';

            await queryRunner.manager
              .getRepository(WorkspaceMember)
              .update(memberToMakeAdmin.id, memberToMakeAdmin);

            await queryRunner.manager
              .getRepository(WorkspaceMember)
              .delete({ id: member.id });

            await queryRunner.commitTransaction();
          } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
          } finally {
            await queryRunner.release();
          }
        } else {
          await this.workspaceMembersRepository.remove(member);
        }
      }
    } catch (error) {
      console.error(`Error removing workspace member`, error);
      throw error;
    }
  }
}
