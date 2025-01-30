import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { RequiresPermission } from 'src/permissions/decorators/requires-permission.decorator';
import { PermissionsGuard } from 'src/permissions/permissions.guard';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  create(
    @Body() createListDto: CreateListDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.listsService.create(createListDto, user.sub);
  }

  @Patch(':listId')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('editBoard')
  update(
    @Param('listId') listId: string,
    @Body() updateListDto: UpdateListDto,
  ) {
    return 'update';
  }
}
