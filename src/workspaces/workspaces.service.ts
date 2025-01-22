import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  FindManyOptions,
  getRepository,
  Repository,
} from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateWorkspaceMemberDto } from './dto/create-workspace-member.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    { name }: CreateWorkspaceDto,
    userId: string,
  ): Promise<Workspace> {
    const queryRunner = this.dataSource.createQueryRunner();

    // Connect the query runner to a transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Create the workspace
      const newWorkspace = queryRunner.manager
        .getRepository(Workspace)
        .create({ name }); // Set the createdBy field

      await queryRunner.manager.getRepository(Workspace).save(newWorkspace);

      // Step 2: Create the workspace member
      const workspaceMember = queryRunner.manager
        .getRepository(WorkspaceMember)
        .create({
          workspace: newWorkspace,
          user: { id: userId },
          role: 'admin',
        });

      await queryRunner.manager
        .getRepository(WorkspaceMember)
        .save(workspaceMember);

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Step 3: Fetch and return the workspace with its members
      const workspaceToReturn = await this.findOne(newWorkspace.id);

      return workspaceToReturn;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      console.error('Error creating workspace:', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async findAllUserWorkspaces(userId: string): Promise<Workspace[]> {
    const query: FindManyOptions<Workspace> = {
      where: {
        members: {
          user: { id: userId },
        },
      },
    };
    return this.findAll(query);
  }

  async findAll(query: FindManyOptions<Workspace>): Promise<Workspace[]> {
    try {
      const workspaces = await this.workspaceRepository.find(query);
      return workspaces;
    } catch (error) {
      console.error(`Error finding workspaces`, error);
      throw error;
    }
  }

  async findOne(workspaceId: string): Promise<Workspace> {
    try {
      const workspace = await this.workspaceRepository.findOne({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException(
          `Workspace with ID ${workspaceId} not found.`,
        );
      }

      return workspace;
    } catch (error) {
      console.error(`Error finding workspace by ID ${workspaceId}:`, error);
      throw error;
    }
  }

  async delete(workspaceId: string) {
    try {
      const workspaceToDelete = await this.findOne(workspaceId);
      await this.workspaceRepository.remove(workspaceToDelete);
    } catch (error) {
      console.error(`Error deleting workspace by ID ${workspaceId}:`, error);
      throw error;
    }
  }

  async addMember(
    createWorkspaceMemberDto: CreateWorkspaceMemberDto,
  ): Promise<WorkspaceMember> {
    try {
      // Validate workspace
      const workspace = await this.workspaceRepository.findOne({
        where: { id: createWorkspaceMemberDto.workspaceId },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      // Validate user
      const user = await this.userRepository.findOne({
        where: { id: createWorkspaceMemberDto.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Ensure the user to be added is not already a member
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

      // Add the new member
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

  // TODO: promote member to be an admin if no admin.
  // TODO: remove the workspace if no members
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
