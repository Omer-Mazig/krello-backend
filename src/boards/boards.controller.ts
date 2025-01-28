import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
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
  @Auth(AuthType.WorkspaceMember)
  findBoardsByWorkspaceId(@Param('workspaceId') workspaceId: string) {
    return this.boardsService.findBoardsByWorkspaceId(workspaceId);
  }

  @Get(':boardId')
  findOne(@Param('boardId') boardId: string) {
    return this.boardsService.findOneWithRelations(boardId, 'all');
  }

  @Delete(':boardId')
  @Auth(AuthType.BoardAdmin)
  async remove(@Param('boardId') boardId: string) {
    return this.boardsService.remove(boardId);
  }
}
