import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { User } from './entities/user.entity';
import { UsersDeleterProvider } from './providers/users-deleter.provider';
import { UsersFinderProvider } from './providers/users-finder.provider';
import { UserCreatorProvider } from './providers/users-creator.provider';

@Module({
  controllers: [UsersController],
  providers: [UsersFinderProvider, UserCreatorProvider, UsersDeleterProvider],
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  exports: [UsersFinderProvider],
})
export class UsersModule {}
