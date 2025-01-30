export const WORKSPACE_PERMISSION_MATRIX = {
  removeWorkspace: ['admin'], // Admins can remove workspaces
  createWorkspaceMember: ['member', 'admin'], // Workspace members and admins
  removeWorkspaceMember: ['admin'], // Admins can remove others
  changeWorkspaceMemberRole: ['admin'], // Only admins can change roles
  createBoard: ['member', 'admin'], // Workspace members and admins
  viewWorkspace: ['member', 'admin'], // Workspace members and admins
};

export const BOARD_PERMISSION_MATRIX = {
  removeBoard: ['admin'],
  createBoardMember: ['member', 'admin'], // Board members and admins
  removeBoardMember: ['admin'], // Admins can remove members
  changeBoardMemberRole: ['admin'], // Only admins can change roles
  editBoard: {
    private: ['member', 'admin'], // Only board members
    workspace: ['member', 'admin'], // Workspace members
    public: ['anyone'], // Public
  },
  viewBoard: {
    private: ['member', 'admin'], // Only board members
    workspace: ['member', 'admin'], // Workspace members
    public: ['anyone'], // Public
  },
};
