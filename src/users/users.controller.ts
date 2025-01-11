import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
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
  public async findAll() {
    return this.usersService.findAll();
  }

  @Get('active')
  @UseInterceptors(ClassSerializerInterceptor)
  public async findActive(@ActiveUser() activeUser: ActiveUserData) {
    return this.usersService.findOneById(activeUser.sub);
  }

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(AuthType.None)
  public create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
