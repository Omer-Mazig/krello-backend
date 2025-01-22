import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find();
      return users;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  async findOneById(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('The user ID does not exist');
      }
      return user;
    } catch (error) {
      console.error(`Error finding one by ID ${id}:`, error);
      throw error;
    }
  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException('The user email does not exist');
      }
      return user;
    } catch (error) {
      console.error(`Error finding one by email ${email}:`, error);
      throw error;
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
        throw new NotFoundException('The user email does not exist');
      }

      return userWithPassword;
    } catch (error) {
      console.error(`Error finding one with password ${email}:`, error);
      throw error;
    }
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(userId: string): Promise<void> {
    try {
      const user = await this.findOneById(userId);
      await this.userDeletionProvider.deleteUser(user);
    } catch (error) {
      console.error(`Error removing by with ID ${userId}:`, error);
      throw error;
    }
  }
}
