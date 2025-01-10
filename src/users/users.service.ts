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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
