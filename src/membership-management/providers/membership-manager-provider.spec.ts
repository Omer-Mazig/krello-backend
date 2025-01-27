import { Test, TestingModule } from '@nestjs/testing';
import { MembershipManagerProvider } from './membership-manager-provider';

describe('MembershipManagerProvider', () => {
  let provider: MembershipManagerProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembershipManagerProvider],
    }).compile();

    provider = module.get<MembershipManagerProvider>(MembershipManagerProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
