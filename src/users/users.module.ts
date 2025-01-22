import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { User } from './entities/user.entity';
import { UserDeletionProvider } from './providers/user-deletion.provider';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserDeletionProvider],
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  exports: [UsersService],
})
export class UsersModule {}
