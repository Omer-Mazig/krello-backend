import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';
import { WorkspacesService } from 'src/workspaces/workspaces.service';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(private readonly workspacesService: WorkspacesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY];
    const workspaceId = request.params?.workspaceId;

    if (!workspaceId || !user.sub) {
      throw new ForbiddenException('Workspace ID and User ID are required');
    }

    const isMember = await this.workspacesService.isMember(
      workspaceId,
      user.sub,
    );
    if (!isMember) {
      throw new ForbiddenException(
        'You must be a workspace member to perform this action',
      );
    }

    return true;
  }
}
