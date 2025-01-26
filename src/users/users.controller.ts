import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersFinderProvider } from './providers/users-finder.provider';
import { UserCreatorProvider } from './providers/users-creator.provider';
import { UsersDeleterProvider } from './providers/users-deleter.provider';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersFinderProvider: UsersFinderProvider,
    private readonly userCreatorProvider: UserCreatorProvider,
    private readonly usersDeleterProvider: UsersDeleterProvider,
  ) {}

  @Get('')
  @Auth(AuthType.None) // JUST FOR TESTING!!!
  findAll() {
    return this.usersFinderProvider.findAll();
  }

  @Get('active')
  @UseInterceptors(ClassSerializerInterceptor)
  findActive(@ActiveUser() activeUser: ActiveUserData) {
    return this.usersFinderProvider.findOneById(activeUser.sub);
  }

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(AuthType.None)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userCreatorProvider.create(createUserDto);
  }

  // TODO: Just for development!
  @Auth(AuthType.None)
  @Delete()
  remove(@Param('userId') userId: string) {
    return this.usersDeleterProvider.delete(userId);
  }
}
