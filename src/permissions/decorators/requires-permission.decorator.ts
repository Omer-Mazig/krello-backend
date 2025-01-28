import { SetMetadata } from '@nestjs/common';

export const RequiresPermission = (action: string) =>
  SetMetadata('action', action);
