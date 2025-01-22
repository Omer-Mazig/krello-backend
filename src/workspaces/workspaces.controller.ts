import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { CreateWorkspaceMemberDto } from './dto/create-workspace-member.dto';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.workspacesService.create(createWorkspaceDto, user.sub);
  }

  @Get()
  findAllActiveUserWorkspaces(@ActiveUser() user: ActiveUserData) {
    return this.workspacesService.findAllUserWorkspaces(user.sub);
  }

  @Post('/members')
  @Auth(AuthType.WorkspaceMember)
  addWorkspaceMember(
    @Body() createWorkspaceMemberDto: CreateWorkspaceMemberDto,
  ) {
    return this.workspacesService.addMember(createWorkspaceMemberDto);
  }

  // TODO: allow only admin to remove
  @Delete(':workspaceId')
  @Auth(AuthType.WorkspaceMember)
  delete(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.delete(workspaceId);
  }
}
