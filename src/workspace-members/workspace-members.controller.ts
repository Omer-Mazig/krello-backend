import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { CreateWorkspaceMemberDto } from 'src/workspace-members/dto/create-workspace-member.dto';
import { PermissionsGuard } from 'src/permissions/permissions.guard';
import { RequiresPermission } from 'src/permissions/decorators/requires-permission.decorator';

@Controller('workspace-members')
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequiresPermission('createWorkspaceMember')
  create(@Body() createWorkspaceMemberDto: CreateWorkspaceMemberDto) {
    return this.workspaceMembersService.create(createWorkspaceMemberDto);
  }

  @Delete(':memberId/:workspaceId')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('removeWorkspaceMember')
  remove(
    @Param('memberId') memberId: string,
    @Param('workspaceId') workspaceId: string, // for guard
  ) {
    return this.workspaceMembersService.remove(memberId);
  }
}
