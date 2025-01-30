export const WORKSPACE_PERMISSION_MATRIX = {
  removeWorkspace: ['admin'], // Admins can remove workspaces
  createWorkspaceMember: ['member', 'admin'], // Workspace members and admins
  removeWorkspaceMember: ['admin'], // Admins can remove others
  changeWorkspaceMemberRole: ['admin'], // Only admins can change roles
  createBoard: ['member', 'admin'], // Workspace members and admins
  viewWorkspace: ['member', 'admin'], // Workspace members and admins
};

export const BOARD_PERMISSION_MATRIX = {
  removeBoard: {
    private: ['workspace:admin', 'admin'], // Workspace and board admins
    workspace: ['workspace:admin', 'admin'], // Workspace and board admins
    public: ['workspace:admin', 'admin'], // Workspace and board admins
  },
  createBoardMember: {
    private: ['admin', 'member'], // Board admins and members
    workspace: ['admin', 'member'], // Board admins and members
    public: ['admin', 'member'], // Board admins and members
  },
  removeBoardMember: {
    private: ['workspace:admin', 'admin'], // Workspace and board admins
    workspace: ['workspace:admin', 'admin'], // Workspace and board admins
    public: ['workspace:admin', 'admin'], // Workspace and board admins
  },
  changeBoardMemberRole: {
    private: ['admin'], // Only board admins
    workspace: ['admin'], // Only board admins
    public: ['admin'], // Only board admins
  },
  editBoard: {
    private: ['member', 'admin'], // Board members and admins
    workspace: ['workspace:member', 'workspace:admin', 'member', 'admin'], // Workspace members and admins
    public: ['workspace:member', 'workspace:admin', 'member', 'admin'], // Workspace members and admins
  },
  viewBoard: {
    private: ['workspace:admin', 'member', 'admin'], // Workspace and board admins
    workspace: ['workspace:member', 'workspace:admin', 'member', 'admin'], // Workspace members and admins
    public: ['workspace:member', 'workspace:admin', 'member', 'admin'], // Workspace members and admins
  },
};
