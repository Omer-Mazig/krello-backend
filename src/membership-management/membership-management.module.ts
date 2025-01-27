import { Module } from '@nestjs/common';
import { MembershipManagerProvider } from './providers/membership-manager-provider';

@Module({
  providers: [MembershipManagerProvider],
  exports: [MembershipManagerProvider],
})
export class MembershipManagementModule {}
