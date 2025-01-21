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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  @Auth(AuthType.None) // JUST FOR TESTING!!!
  findAll() {
    return this.usersService.findAll();
  }

  @Get('active')
  @UseInterceptors(ClassSerializerInterceptor)
  findActive(@ActiveUser() activeUser: ActiveUserData) {
    return this.usersService.findOneById(activeUser.sub);
  }

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(AuthType.None)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // TODO: Just for development!
  @Auth(AuthType.None)
  @Delete()
  remove(@Param('userId') userId: string) {
    return this.usersService.remove(userId);
  }
}
