import { Injectable, Logger } from '@nestjs/common';
import {
  BoardAction,
  WorkspaceAction,
} from './decorators/requires-permission.decorator';

@Injectable()
export class PermissionsLogger extends Logger {
  constructor() {
    super('Permissions');
  }

  logPermissionCheck(
    userId: string,
    requiredPermission: BoardAction | WorkspaceAction | null,
    context: {
      workspaceId?: string;
      boardId?: string;
      visibility?: string;
      memberRole?: string;
      workspaceRole?: string;
      error?: string;
    },
    isGranted: boolean,
  ) {
    const logMessage = {
      timestamp: new Date().toISOString(),
      userId,
      requiredPermission,
      context,
      isGranted,
    };

    if (isGranted) {
      this.log(JSON.stringify(logMessage));
    } else {
      this.warn(JSON.stringify(logMessage));
    }
  }
}
