import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { User } from './entities/user.entity';
import { UserDeletionProvider } from './providers/user-deletion.provider';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserDeletionProvider],
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  exports: [UsersService],
})
export class UsersModule {}
