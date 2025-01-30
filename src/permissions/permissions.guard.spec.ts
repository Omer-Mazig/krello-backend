import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from './permissions.guard';
import { Reflector } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardMember } from '../board-members/entities/board-member.entity';
import { Board } from '../boards/entities/board.entity';
import { ExecutionContext } from '@nestjs/common';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let workspaceMemberRepo: any;
  let boardMemberRepo: any;
  let boardRepo: any;

  // Mock repositories
  const mockWorkspaceMemberRepo = {
    findOne: jest.fn(),
  };
  const mockBoardMemberRepo = {
    findOne: jest.fn(),
  };
  const mockBoardRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        Reflector,
        {
          provide: getRepositoryToken(WorkspaceMember),
          useValue: mockWorkspaceMemberRepo,
        },
        {
          provide: getRepositoryToken(BoardMember),
          useValue: mockBoardMemberRepo,
        },
        {
          provide: getRepositoryToken(Board),
          useValue: mockBoardRepo,
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
    workspaceMemberRepo = module.get(getRepositoryToken(WorkspaceMember));
    boardMemberRepo = module.get(getRepositoryToken(BoardMember));
    boardRepo = module.get(getRepositoryToken(Board));
  });

  // Helper function to mock execution context
  const createMockExecutionContext = (
    userId: string,
    params: any = {},
    body: any = {},
  ) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub: userId },
          params,
          body,
        }),
      }),
      getHandler: () => ({}),
    } as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no permission is required', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    const context = createMockExecutionContext('user123');

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user is not authenticated', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue('removeWorkspace');
    const context = createMockExecutionContext('');

    expect(await guard.canActivate(context)).toBe(false);
  });

  // Test workspace permission
  it('should check workspace permission correctly', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue('createWorkspaceMember');
    const context = createMockExecutionContext('user123', {
      workspaceId: 'workspace123',
    });

    workspaceMemberRepo.findOne.mockResolvedValue({
      role: 'member',
    });

    expect(await guard.canActivate(context)).toBe(true);
  });

  // Test board permission for public board
  it('should allow access to public board when appropriate', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue('viewBoard');
    const context = createMockExecutionContext('user123', {
      boardId: 'board123',
    });

    boardRepo.findOne.mockResolvedValue({
      id: 'board123',
      visibility: 'public',
      workspace: { id: 'workspace123' },
    });

    boardMemberRepo.findOne.mockResolvedValue(null);
    workspaceMemberRepo.findOne.mockResolvedValue(null);

    expect(await guard.canActivate(context)).toBe(true);
  });
});
