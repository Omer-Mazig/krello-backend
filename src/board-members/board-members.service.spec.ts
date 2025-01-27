import { Test, TestingModule } from '@nestjs/testing';
import { BoardMembersService } from './board-members.service';

describe('BoardMembersService', () => {
  let service: BoardMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardMembersService],
    }).compile();

    service = module.get<BoardMembersService>(BoardMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
