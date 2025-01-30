import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkspaceMember } from './entities/workspace-member.entity';
import {
  DataSource,
  FindOptionsRelations,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { CreateWorkspaceMemberDto } from './dto/create-workspace-member.dto';
import { MembershipManagerProvider } from 'src/membership-management/providers/membership-manager-provider';
import { UpdateWorkspaceMemberDto } from './dto/update-workspace-member.dto';

@Injectable()
export class WorkspaceMembersService {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMembersRepository: Repository<WorkspaceMember>,
    private readonly membershipManager: MembershipManagerProvider,
    private readonly dataSource: DataSource,
  ) {}

  async findOneByWorkspaceAndUser(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null> {
    return this.workspaceMembersRepository.findOne({
      where: { workspace: { id: workspaceId }, user: { id: userId } },
      relations: ['workspace'],
    });
  }

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
      console.error(`Error adding workspace member`, error);

      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid user or workspace ID');
      }

      throw error;
    }
  }

  async findOneWithRelations(
    memberId: string,
    relations: FindOptionsRelations<WorkspaceMember>,
  ) {
    try {
      const member = await this.workspaceMembersRepository.findOne({
        where: { id: memberId },
        relations,
      });

      if (!member) {
        throw new NotFoundException('Member not found');
      }

      return member;
    } catch (error) {
      console.error(`Error finding workspace member`, error);
      throw error;
    }
  }

  async remove(memberId: string): Promise<void> {
    const member = await this.findOneWithRelations(memberId, {
      workspace: true,
    });

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.membershipManager.handleWorkspaceMembers(queryRunner, member);

      await queryRunner.manager.getRepository(WorkspaceMember).remove(member);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    memberId: string,
    updateWorkspaceMemberDto: UpdateWorkspaceMemberDto,
  ): Promise<WorkspaceMember> {
    const member = await this.findOneWithRelations(memberId, {});

    // Apply updates from DTO
    Object.assign(member, updateWorkspaceMemberDto);

    return await this.workspaceMembersRepository.save(member);
  }
}
