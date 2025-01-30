import { SetMetadata } from '@nestjs/common';
import {
  BOARD_PERMISSION_MATRIX,
  WORKSPACE_PERMISSION_MATRIX,
} from '../permissions-matrix';

export type WorkspaceAction = keyof typeof WORKSPACE_PERMISSION_MATRIX;
export type BoardAction = keyof typeof BOARD_PERMISSION_MATRIX;

export const RequiresPermission = (action: WorkspaceAction | BoardAction) =>
  SetMetadata('action', action);
