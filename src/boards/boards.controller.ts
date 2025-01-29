import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { PermissionsGuard } from 'src/permissions/permissions.guard';
import { RequiresPermission } from 'src/permissions/decorators/requires-permission.decorator';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequiresPermission('createBoard')
  create(
    @Body() createBoardDto: CreateBoardDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.boardsService.create(createBoardDto, user.sub);
  }

  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

  @Get(':workspaceId')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('viewBoard')
  findBoardsByWorkspaceId(@Param('workspaceId') workspaceId: string) {
    return this.boardsService.findBoardsByWorkspaceId(workspaceId);
  }

  @Get(':boardId')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('viewBoard')
  findOne(@Param('boardId') boardId: string) {
    return this.boardsService.findOneWithRelations(boardId, 'all');
  }

  @Delete(':boardId')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('removeBoard')
  async remove(@Param('boardId') boardId: string) {
    return this.boardsService.remove(boardId);
  }
}
