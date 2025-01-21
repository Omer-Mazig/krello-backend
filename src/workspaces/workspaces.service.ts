import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { InjectRepository } from '@nestjs/typeorm';

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

    // Connect the query runner to a transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Create the workspace
      const user = { id: userId }; // Reference to the user creating the workspace
      const newWorkspace = queryRunner.manager
        .getRepository(Workspace)
        .create({ name, createdBy: user }); // Set the createdBy field

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
      throw new InternalServerErrorException(
        'Failed to create workspace. Please try again later.',
      );
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async findOne(workspaceId: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(`Board with ID ${workspaceId} not found.`);
    }

    return workspace;
  }
}
