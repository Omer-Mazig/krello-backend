import { SetMetadata } from '@nestjs/common';
import {
  BOARD_PERMISSION_MATRIX,
  WORKSPACE_PERMISSION_MATRIX,
} from '../permissions-matrix';

/**
 * Action types for workspace and board operations
 */
export type WorkspaceAction = keyof typeof WORKSPACE_PERMISSION_MATRIX;
export type BoardAction = keyof typeof BOARD_PERMISSION_MATRIX;

/**
 * Decorator that enforces permission requirements for workspace and board actions.
 *
 * @param action - The action to check permissions for
 *
 * For Workspace actions, permissions are defined in {@link WORKSPACE_PERMISSION_MATRIX}:

 *
 * For Board actions, permissions are defined in {@link BOARD_PERMISSION_MATRIX}:
 
 */
export const RequiresPermission = (action: WorkspaceAction | BoardAction) =>
  SetMetadata('requires-permission', action);
