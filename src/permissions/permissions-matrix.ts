export const WORKSPACE_PERMISSION_MATRIX = {
  removeWorkspace: ['admin'],
  createWorkspaceMember: ['member', 'admin'], // Workspace members and admins
  removeWorkspaceMember: ['admin'], // Admins can remove others
  changeWorkspaceMemberRole: ['admin'], // Only admins can change roles
  createBoard: ['member', 'admin'], // Workspace members and admins
};

export const BOARD_PERMISSION_MATRIX = {
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
