import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateWorkspaceMemberDto } from 'src/workspace-members/dto/create-workspace-member.dto';
import { AuthType } from 'src/auth/enums/auth-type.enum';

@Controller('workspace-members')
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @Post('/members')
  @Auth(AuthType.WorkspaceMember)
  addWorkspaceMember(
    @Body() createWorkspaceMemberDto: CreateWorkspaceMemberDto,
  ) {
    return this.workspaceMembersService.addMember(createWorkspaceMemberDto);
  }

  @Delete(':workspaceId/members/:memberId')
  @Auth(AuthType.WorkspaceAdmin)
  removeWorkspaceMember(
    @Param('workspaceId') workspaceId: string, // for guard
    @Param('memberId') memberId: string,
  ) {
    return this.workspaceMembersService.removeMember(memberId);
  }
}
