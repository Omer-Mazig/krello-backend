import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { PermissionsGuard } from 'src/permissions/permissions.guard';
import { RequiresPermission } from 'src/permissions/decorators/requires-permission.decorator';

@Controller('board-members')
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequiresPermission('createBoardMember')
  create(@Body() createBoardMemberDto: CreateBoardMemberDto) {
    return this.boardMembersService.create(createBoardMemberDto);
  }
}
