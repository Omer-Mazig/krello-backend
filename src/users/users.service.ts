import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { UserDeletionProvider } from './providers/user-deletion.provider';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly hashingProvider: HashingProvider,
    private readonly userDeletionProvider: UserDeletionProvider,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (existingUser) {
        throw new BadRequestException(
          'The user already exists, please check your email.',
        );
      }

      const hashedPassword = await this.hashingProvider.hashPassword(
        createUserDto.password,
      );
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
      );
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find();
      return users;
    } catch (error) {
      throw new RequestTimeoutException('Error connecting to the database');
    }
  }

  async findOneById(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new BadRequestException('The user ID does not exist');
      }
      return user;
    } catch (error) {
      throw new RequestTimeoutException('Error connecting to the database');
    }
  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new BadRequestException('The user email does not exist');
      }
      return user;
    } catch (error) {
      throw new RequestTimeoutException('Error connecting to the database');
    }
  }

  async findOneWithPassword(email: string) {
    try {
      const userWithPassword = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email', { email })
        .getOne();

      if (!userWithPassword) {
        throw new BadRequestException('The user email does not exist');
      }

      return userWithPassword;
    } catch (error) {
      throw new RequestTimeoutException('Error connecting to the database');
    }
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(userId: string): Promise<void> {
    await this.userDeletionProvider.deleteUser(userId);
  }

  // async remove(userId: string): Promise<void> {
  //   const queryRunner = this.dataSource.createQueryRunner();

  //   // Connect the query runner to a transaction
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     // Step 1: Fetch the user by ID
  //     const user = await queryRunner.manager.getRepository(User).findOne({
  //       where: { id: userId },
  //     });

  //     if (!user) {
  //       throw new NotFoundException(`User with ID ${userId} not found.`);
  //     }

  //     // Step 2: Handle related workspace memberships
  //     const workspaceMembers = await queryRunner.manager
  //       .getRepository(WorkspaceMember)
  //       .find({ where: { user }, relations: ['workspace'] });

  //     for (const member of workspaceMembers) {
  //       const { workspace } = member;

  //       // Count remaining admins in the workspace
  //       const adminCount = await queryRunner.manager
  //         .getRepository(WorkspaceMember)
  //         .count({ where: { workspace: { id: workspace.id }, role: 'admin' } });

  //       if (adminCount <= 1) {
  //         // Delete all boards in the workspace
  //         await queryRunner.manager
  //           .getRepository(Board)
  //           .delete({ workspace: { id: workspace.id } });

  //         // Delete the workspace if this user is the last admin
  //         await queryRunner.manager
  //           .getRepository(Workspace)
  //           .delete(workspace.id);
  //       }
  //     }

  //     // Step 3: Handle related board memberships
  //     const boardMembers = await queryRunner.manager
  //       .getRepository(BoardMember)
  //       .find({ where: { user }, relations: ['board'] });

  //     for (const member of boardMembers) {
  //       const { board } = member;

  //       // Count remaining admins in the board
  //       const adminCount = await queryRunner.manager
  //         .getRepository(BoardMember)
  //         .count({ where: { board: { id: board.id }, role: 'admin' } });

  //       if (adminCount <= 1) {
  //         // Delete the board if this user is the last admin
  //         await queryRunner.manager.getRepository(Board).delete(board.id);
  //       }
  //     }

  //     // Step 4: Remove workspace and board memberships
  //     await queryRunner.manager.getRepository(WorkspaceMember).delete({ user });
  //     await queryRunner.manager.getRepository(BoardMember).delete({ user });

  //     // Step 5: Remove the user
  //     await queryRunner.manager.getRepository(User).remove(user);

  //     // Commit the transaction
  //     await queryRunner.commitTransaction();
  //   } catch (error) {
  //     // Rollback the transaction in case of error
  //     await queryRunner.rollbackTransaction();
  //     console.error('Error removing user:', error);
  //     throw new InternalServerErrorException(
  //       'Failed to remove user. Please try again later.',
  //     );
  //   } finally {
  //     // Release the query runner
  //     await queryRunner.release();
  //   }
  // }
}
