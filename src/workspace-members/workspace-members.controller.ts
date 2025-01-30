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

  @Delete(':workspaceId/:memberId')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('removeWorkspaceMember')
  remove(@Param('memberId') memberId: string) {
    return this.workspaceMembersService.remove(memberId);
  }

  @Post(':workspaceId/:memberId/role')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('changeWorkspaceMemberRole')
  changeRole(
    @Param('memberId') memberId: string,
    @Body('role') role: 'admin' | 'member',
  ) {
    return this.workspaceMembersService.changeRole(memberId, role);
  }
}
