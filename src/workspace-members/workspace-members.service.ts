import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateWorkspaceMemberDto } from './dto/create-workspace-member.dto';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

@Injectable()
export class WorkspaceMembersService {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly dataSource: DataSource,
  ) {}

  async addMember(
    createWorkspaceMemberDto: CreateWorkspaceMemberDto,
  ): Promise<WorkspaceMember> {
    try {
      const workspace = await this.workspaceRepository.findOne({
        where: { id: createWorkspaceMemberDto.workspaceId },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const user = await this.userRepository.findOne({
        where: { id: createWorkspaceMemberDto.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingMember = await this.workspaceMemberRepository.findOne({
        where: {
          workspace: { id: createWorkspaceMemberDto.workspaceId },
          user: { id: createWorkspaceMemberDto.userId },
        },
      });

      if (existingMember) {
        throw new BadRequestException(
          'User is already a member of this workspace',
        );
      }

      const newMember = this.workspaceMemberRepository.create({
        workspace,
        user,
      });

      return await this.workspaceMemberRepository.save(newMember);
    } catch (error) {
      console.error(`Error adding workspace member`, error);
      throw error;
    }
  }

  async removeMember(memberId: string): Promise<void> {
    try {
      const member = await this.workspaceMemberRepository.findOne({
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
          await this.workspaceMemberRepository.remove(member);
        }
      }
    } catch (error) {
      console.error(`Error removing workspace member`, error);
      throw error;
    }
  }
}
