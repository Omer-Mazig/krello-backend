import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersFinderProvider {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

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
}
