import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    { name }: CreateWorkspaceDto,
    userId: string,
  ): Promise<Workspace> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newWorkspace = queryRunner.manager
        .getRepository(Workspace)
        .create({ name });

      await queryRunner.manager.getRepository(Workspace).save(newWorkspace);

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

      await queryRunner.commitTransaction();

      const workspaceToReturn = await this.findOne(newWorkspace.id);

      return workspaceToReturn;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating workspace:', error);
      throw error;
    } finally {
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
      const workspaces = await this.workspaceRepository.find({
        relations: {
          boards: {
            members: {
              user: true,
            },
          },
          members: {
            user: true,
          },
        },
      });
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

  async findWorkspacesByUser(userId: string) {
    return this.workspaceRepository.find({
      where: {
        members: {
          user: { id: userId },
        },
      },
      relations: {
        members: {
          user: true,
        },
      },
    });
  }
}
