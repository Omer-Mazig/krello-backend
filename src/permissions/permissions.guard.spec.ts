import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from './permissions.guard';
import { Reflector } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { BoardMember } from '../board-members/entities/board-member.entity';
import { Board } from '../boards/entities/board.entity';
import { PermissionsLogger } from './permissions.logger';
import { ExecutionContext } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let workspaceMemberRepo: Repository<WorkspaceMember>;
  let boardMemberRepo: Repository<BoardMember>;
  let boardRepo: Repository<Board>;
  let permissionsLogger: PermissionsLogger;

  const mockExecutionContext = (
    userId: string | null,
    permission: string | null,
    params: any = {},
    body: any = {},
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: userId ? { sub: userId } : null,
          params,
          body,
        }),
      }),
      getHandler: () => ({}),
    }) as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceMember),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BoardMember),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Board),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: PermissionsLogger,
          useValue: {
            logPermissionCheck: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
    workspaceMemberRepo = module.get<Repository<WorkspaceMember>>(
      getRepositoryToken(WorkspaceMember),
    );
    boardMemberRepo = module.get<Repository<BoardMember>>(
      getRepositoryToken(BoardMember),
    );
    boardRepo = module.get<Repository<Board>>(getRepositoryToken(Board));
    permissionsLogger = module.get<PermissionsLogger>(PermissionsLogger);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('No Permission Required', () => {
    it('should allow access when no permission is required', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(null);
      const context = mockExecutionContext('user-123', null);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('Anonymous Access', () => {
    it('should deny access for anonymous users when permission is required', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('viewBoard');
      const context = mockExecutionContext(null, 'viewBoard');

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });
  });

  describe('Workspace Permissions', () => {
    describe('removeWorkspace', () => {
      it('should allow workspace admin to remove workspace', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeWorkspace');
        const workspaceMember = {
          id: 'member-1',
          role: 'admin',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'removeWorkspace', {
          workspaceId: 'workspace-1',
        });

        expect(await guard.canActivate(context)).toBe(true);
      });

      it('should deny workspace member from removing workspace', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeWorkspace');
        const workspaceMember = {
          id: 'member-1',
          role: 'member',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'removeWorkspace', {
          workspaceId: 'workspace-1',
        });

        expect(await guard.canActivate(context)).toBe(false);
      });

      it('should deny non-member from removing workspace', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeWorkspace');
        jest.spyOn(workspaceMemberRepo, 'findOne').mockResolvedValue(null);

        const context = mockExecutionContext('user-123', 'removeWorkspace', {
          workspaceId: 'workspace-1',
        });

        expect(await guard.canActivate(context)).toBe(false);
      });
    });

    describe('createWorkspaceMember', () => {
      it('should allow workspace admin to create workspace member', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('createWorkspaceMember');
        const workspaceMember = {
          id: 'member-1',
          role: 'admin',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext(
          'user-123',
          'createWorkspaceMember',
          {
            workspaceId: 'workspace-1',
          },
        );

        expect(await guard.canActivate(context)).toBe(true);
      });

      it('should allow workspace member to create workspace member', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('createWorkspaceMember');
        const workspaceMember = {
          id: 'member-1',
          role: 'member',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext(
          'user-123',
          'createWorkspaceMember',
          {
            workspaceId: 'workspace-1',
          },
        );

        expect(await guard.canActivate(context)).toBe(true);
      });

      it('should deny non-member from creating workspace member', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('createWorkspaceMember');
        jest.spyOn(workspaceMemberRepo, 'findOne').mockResolvedValue(null);

        const context = mockExecutionContext(
          'user-123',
          'createWorkspaceMember',
          {
            workspaceId: 'workspace-1',
          },
        );

        expect(await guard.canActivate(context)).toBe(false);
      });
    });

    describe('removeWorkspaceMember', () => {
      it('should allow workspace admin to remove workspace member', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeWorkspaceMember');
        const workspaceMember = {
          id: 'member-1',
          role: 'admin',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext(
          'user-123',
          'removeWorkspaceMember',
          {
            workspaceId: 'workspace-1',
            memberId: 'other-member',
          },
        );

        expect(await guard.canActivate(context)).toBe(true);
      });

      it('should deny workspace member from removing other members', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeWorkspaceMember');
        const workspaceMember = {
          id: 'member-1',
          role: 'member',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext(
          'user-123',
          'removeWorkspaceMember',
          {
            workspaceId: 'workspace-1',
            memberId: 'other-member',
          },
        );

        expect(await guard.canActivate(context)).toBe(false);
      });

      it('should allow member to remove themselves', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeWorkspaceMember');
        const workspaceMember = {
          id: 'member-1',
          role: 'member',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext(
          'user-123',
          'removeWorkspaceMember',
          {
            workspaceId: 'workspace-1',
            memberId: 'member-1',
          },
        );

        expect(await guard.canActivate(context)).toBe(true);
      });
    });

    it('should allow member to create workspace member', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('createWorkspaceMember');
      const workspaceMember = {
        id: 'member-1',
        role: 'member',
        user: { id: 'user-123' },
        workspace: { id: 'workspace-1' },
      };

      jest
        .spyOn(workspaceMemberRepo, 'findOne')
        .mockResolvedValue(workspaceMember as WorkspaceMember);

      const context = mockExecutionContext(
        'user-123',
        'createWorkspaceMember',
        {
          workspaceId: 'workspace-1',
        },
      );

      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should allow admin to change workspace member role', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('changeWorkspaceMemberRole');
      const workspaceMember = {
        id: 'member-1',
        role: 'admin',
        user: { id: 'user-123' },
        workspace: { id: 'workspace-1' },
      };

      jest
        .spyOn(workspaceMemberRepo, 'findOne')
        .mockResolvedValue(workspaceMember as WorkspaceMember);

      const context = mockExecutionContext(
        'user-123',
        'changeWorkspaceMemberRole',
        {
          workspaceId: 'workspace-1',
        },
      );

      expect(await guard.canActivate(context)).toBe(true);
    });
  });

  describe('Board Permissions', () => {
    it('should grant access for public board viewing', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('viewBoard');

      const board = {
        id: 'board-1',
        visibility: 'public',
        workspace: { id: 'workspace-1' },
      };

      jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
      jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(workspaceMemberRepo, 'findOne').mockResolvedValue(null);

      const context = mockExecutionContext('user-123', 'viewBoard', {
        boardId: 'board-1',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should grant access for board admin', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('removeBoard');

      const board = {
        id: 'board-1',
        visibility: 'private',
        workspace: { id: 'workspace-1' },
      };

      const boardMember = {
        id: 'member-1',
        role: 'admin',
        user: { id: 'user-123' },
        board: { id: 'board-1' },
      };

      jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
      jest
        .spyOn(boardMemberRepo, 'findOne')
        .mockResolvedValue(boardMember as BoardMember);
      jest.spyOn(workspaceMemberRepo, 'findOne').mockResolvedValue(null);

      const context = mockExecutionContext('user-123', 'removeBoard', {
        boardId: 'board-1',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow member to remove themselves from board', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('removeBoardMember');

      const board = {
        id: 'board-1',
        visibility: 'private',
        workspace: { id: 'workspace-1' },
      };

      const boardMember = {
        id: 'member-1',
        role: 'member',
        user: { id: 'user-123' },
        board: { id: 'board-1' },
      };

      jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
      jest
        .spyOn(boardMemberRepo, 'findOne')
        .mockImplementation((options: any) => {
          if (options.where.id === 'member-1') {
            return Promise.resolve(boardMember as BoardMember);
          }
          return Promise.resolve(boardMember as BoardMember);
        });

      const context = mockExecutionContext('user-123', 'removeBoardMember', {
        boardId: 'board-1',
        memberId: 'member-1',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    describe('Private Board', () => {
      it('should deny user with no memberships from viewing private board', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('viewBoard');
        const board = {
          id: 'board-1',
          visibility: 'private',
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null);
        jest.spyOn(workspaceMemberRepo, 'findOne').mockResolvedValue(null);

        const context = mockExecutionContext('user-123', 'viewBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(false);
      });

      it('should deny workspace member from viewing private board', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('viewBoard');
        const board = {
          id: 'board-1',
          visibility: 'private',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'member',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null);
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'viewBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(false);
      });

      it('should allow workspace admin to view private board', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('viewBoard');
        const board = {
          id: 'board-1',
          visibility: 'private',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'admin',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null);
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'viewBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(true);
      });

      it('should deny workspace member from editing private board', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('editBoard');
        const board = {
          id: 'board-1',
          visibility: 'private',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'member',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null);
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'editBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(false);
      });

      it('should deny workspace admin from editing private board without board membership', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('editBoard');
        const board = {
          id: 'board-1',
          visibility: 'private',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'admin',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null);
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'editBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(false);
      });
    });

    describe('Workspace Board', () => {
      it('should allow workspace member to view workspace board', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('viewBoard');
        const board = {
          id: 'board-1',
          visibility: 'workspace',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'member',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null);
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'viewBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(true);
      });
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    describe('Missing or Invalid Data', () => {
      it('should deny access when workspaceId is missing', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeWorkspace');
        const context = mockExecutionContext('user-123', 'removeWorkspace', {
          // workspaceId missing
        });

        expect(await guard.canActivate(context)).toBe(false);
      });

      it('should deny access when boardId is missing', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('viewBoard');
        const context = mockExecutionContext('user-123', 'viewBoard', {
          // boardId missing
        });

        expect(await guard.canActivate(context)).toBe(false);
      });

      it('should deny access when board does not exist', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('viewBoard');
        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(null);

        const context = mockExecutionContext('user-123', 'viewBoard', {
          boardId: 'non-existent-board',
        });

        expect(await guard.canActivate(context)).toBe(false);
      });
    });

    describe('Member Removal Edge Cases', () => {
      it('should deny member from removing another member', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeBoardMember');

        const board = {
          id: 'board-1',
          visibility: 'private',
          workspace: { id: 'workspace-1' },
        };

        const boardMember = {
          id: 'member-1',
          role: 'member',
          user: { id: 'user-123' },
          board: { id: 'board-1' },
        };

        const targetMember = {
          id: 'member-2',
          role: 'member',
          user: { id: 'other-user' },
          board: { id: 'board-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest
          .spyOn(boardMemberRepo, 'findOne')
          .mockImplementation((options: any) => {
            if (options.where.id === 'member-2') {
              return Promise.resolve(targetMember as BoardMember);
            }
            return Promise.resolve(boardMember as BoardMember);
          });
        jest.spyOn(workspaceMemberRepo, 'findOne').mockResolvedValue(null);

        const context = mockExecutionContext('user-123', 'removeBoardMember', {
          boardId: 'board-1',
          memberId: 'member-2',
        });

        expect(await guard.canActivate(context)).toBe(false);
      });

      it('should deny member from removing themselves if they are the last admin', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeBoardMember');

        const board = {
          id: 'board-1',
          visibility: 'private',
          workspace: { id: 'workspace-1' },
        };

        const boardMember = {
          id: 'member-1',
          role: 'admin',
          user: { id: 'user-123' },
          board: { id: 'board-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest
          .spyOn(boardMemberRepo, 'findOne')
          .mockResolvedValue(boardMember as BoardMember);
        jest.spyOn(workspaceMemberRepo, 'findOne').mockResolvedValue(null);

        const context = mockExecutionContext('user-123', 'removeBoardMember', {
          boardId: 'board-1',
          memberId: 'member-1',
        });

        expect(await guard.canActivate(context)).toBe(true); // They can still remove themselves
      });
    });

    describe('Role Hierarchy Cases', () => {
      it('should allow workspace admin to manage board even without board membership', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeBoard');

        const board = {
          id: 'board-1',
          visibility: 'private',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'admin',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null);
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'removeBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(true);
      });

      it('should deny workspace member from managing private board without membership', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('editBoard');

        const board = {
          id: 'board-1',
          visibility: 'private',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'member',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null);
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'editBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(false);
      });

      it('should allow workspace admin to remove board in their workspace without board membership', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeBoard');

        const board = {
          id: 'board-1',
          visibility: 'workspace',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'admin',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null); // Not a board member
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'removeBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(true);
      });

      it('should allow workspace admin to remove private board in their workspace without board membership', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeBoard');

        const board = {
          id: 'board-1',
          visibility: 'private',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'admin',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null); // Not a board member
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'removeBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(true);
      });

      it('should deny workspace member from removing board in their workspace without board membership', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeBoard');

        const board = {
          id: 'board-1',
          visibility: 'workspace',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'member', // Regular workspace member
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null); // Not a board member
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'removeBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(false);
      });

      it('should allow workspace admin to remove workspace-visible board without board membership', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeBoard');

        const board = {
          id: 'board-1',
          visibility: 'workspace',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'admin',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null); // Not a board member
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'removeBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(true);
      });

      it('should allow workspace admin to remove private board without board membership', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('removeBoard');

        const board = {
          id: 'board-1',
          visibility: 'private',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'admin',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null); // Not a board member
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'removeBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(true);
      });
    });

    describe('Board Visibility Transitions', () => {
      it('should allow workspace member to edit workspace-visible board', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('editBoard');

        const board = {
          id: 'board-1',
          visibility: 'workspace',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'member',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null);
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'editBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(true);
      });

      it('should allow workspace member to edit public board', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue('editBoard');

        const board = {
          id: 'board-1',
          visibility: 'public',
          workspace: { id: 'workspace-1' },
        };

        const workspaceMember = {
          id: 'member-1',
          role: 'member',
          user: { id: 'user-123' },
          workspace: { id: 'workspace-1' },
        };

        jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
        jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null);
        jest
          .spyOn(workspaceMemberRepo, 'findOne')
          .mockResolvedValue(workspaceMember as WorkspaceMember);

        const context = mockExecutionContext('user-123', 'editBoard', {
          boardId: 'board-1',
        });

        expect(await guard.canActivate(context)).toBe(true);
      });
    });
  });

  describe('Board Creation Cases', () => {
    it('should allow workspace member to create board in their workspace', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('createBoard');
      const workspaceMember = {
        id: 'member-1',
        role: 'member',
        user: { id: 'user-123' },
        workspace: { id: 'workspace-1' },
      };

      jest
        .spyOn(workspaceMemberRepo, 'findOne')
        .mockResolvedValue(workspaceMember as WorkspaceMember);

      const context = mockExecutionContext('user-123', 'createBoard', {
        workspaceId: 'workspace-1',
      });

      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should deny workspace member from creating board in another workspace', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('createBoard');
      const workspaceMember = {
        id: 'member-1',
        role: 'member',
        user: { id: 'user-123' },
        workspace: { id: 'workspace-1' },
      };

      // Mock that user is member of workspace-1 but trying to create in workspace-2
      jest
        .spyOn(workspaceMemberRepo, 'findOne')
        .mockImplementation(async (options: any) => {
          if (options.where.workspace.id === 'workspace-1') {
            return workspaceMember as WorkspaceMember;
          }
          return null;
        });

      const context = mockExecutionContext('user-123', 'createBoard', {
        workspaceId: 'workspace-2', // Different workspace
      });

      expect(await guard.canActivate(context)).toBe(false);
    });

    it('should deny non-workspace-member from creating board', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('createBoard');
      jest.spyOn(workspaceMemberRepo, 'findOne').mockResolvedValue(null);

      const context = mockExecutionContext('user-123', 'createBoard', {
        workspaceId: 'workspace-1',
      });

      expect(await guard.canActivate(context)).toBe(false);
    });

    it('should deny workspace member from creating board when workspaceId is missing', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('createBoard');
      const workspaceMember = {
        id: 'member-1',
        role: 'member',
        user: { id: 'user-123' },
        workspace: { id: 'workspace-1' },
      };

      jest
        .spyOn(workspaceMemberRepo, 'findOne')
        .mockResolvedValue(workspaceMember as WorkspaceMember);

      const context = mockExecutionContext('user-123', 'createBoard', {
        // workspaceId missing
      });

      expect(await guard.canActivate(context)).toBe(false);
    });

    it('should allow workspace admin to create board in their workspace', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('createBoard');
      const workspaceMember = {
        id: 'member-1',
        role: 'admin',
        user: { id: 'user-123' },
        workspace: { id: 'workspace-1' },
      };

      jest
        .spyOn(workspaceMemberRepo, 'findOne')
        .mockResolvedValue(workspaceMember as WorkspaceMember);

      const context = mockExecutionContext('user-123', 'createBoard', {
        workspaceId: 'workspace-1',
      });

      expect(await guard.canActivate(context)).toBe(true);
    });
  });

  describe('New Tests', () => {
    it('should deny workspace admin from removing workspace-visible board without board membership', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('removeBoard');

      const board = {
        id: 'board-1',
        visibility: 'workspace',
        workspace: { id: 'workspace-1' },
      };

      const workspaceMember = {
        id: 'member-1',
        role: 'admin',
        user: { id: 'user-123' },
        workspace: { id: 'workspace-1' },
      };

      jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
      jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null); // Not a board member
      jest
        .spyOn(workspaceMemberRepo, 'findOne')
        .mockResolvedValue(workspaceMember as WorkspaceMember);

      const context = mockExecutionContext('user-123', 'removeBoard', {
        boardId: 'board-1',
      });

      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should deny workspace admin from removing private board without board membership', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('removeBoard');

      const board = {
        id: 'board-1',
        visibility: 'private',
        workspace: { id: 'workspace-1' },
      };

      const workspaceMember = {
        id: 'member-1',
        role: 'admin',
        user: { id: 'user-123' },
        workspace: { id: 'workspace-1' },
      };

      jest.spyOn(boardRepo, 'findOne').mockResolvedValue(board as Board);
      jest.spyOn(boardMemberRepo, 'findOne').mockResolvedValue(null); // Not a board member
      jest
        .spyOn(workspaceMemberRepo, 'findOne')
        .mockResolvedValue(workspaceMember as WorkspaceMember);

      const context = mockExecutionContext('user-123', 'removeBoard', {
        boardId: 'board-1',
      });

      expect(await guard.canActivate(context)).toBe(true);
    });
  });
});
