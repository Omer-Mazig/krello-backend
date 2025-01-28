// export const PERMISSION_MATRIX = {
//   workspace: {
//     createMember: ['member', 'admin'], // Workspace members and admins
//     createAdmin: ['admin'], // Only admins can promote members to admins
//     removeMember: ['admin'], // Admins can remove others
//     changeMemberRole: ['admin'], // Only admins can change roles
//     createBoard: ['member', 'admin'], // Workspace members and admins
//   },
//   board: {
//     createMember: ['member', 'admin'], // Board members and admins
//     removeMember: ['admin'], // Admins can remove members
//     changeMemberRole: ['admin'], // Only admins can change roles
//     edit: {
//       private: ['member', 'admin'], // Only board members
//       workspace: ['member', 'admin'], // Workspace members
//       public: ['anyone'], // Public
//     },
//     view: {
//       private: ['member', 'admin'], // Only board members
//       workspace: ['member', 'admin'], // Workspace members
//       public: ['anyone'], // Public
//     },
//   },
// };

export const WORKSPACE_PERMISSION_MATRIX = {
  createMember: ['member', 'admin'], // Workspace members and admins
  createAdmin: ['admin'], // Only admins can promote members to admins
  removeMember: ['admin'], // Admins can remove others
  changeMemberRole: ['admin'], // Only admins can change roles
  createBoard: ['member', 'admin'], // Workspace members and admins
};

export const BOARD_PERMISSION_MATRIX = {
  createMember: ['member', 'admin'], // Board members and admins
  removeMember: ['admin'], // Admins can remove members
  changeMemberRole: ['admin'], // Only admins can change roles
  edit: {
    private: ['member', 'admin'], // Only board members
    workspace: ['member', 'admin'], // Workspace members
    public: ['anyone'], // Public
  },
  view: {
    private: ['member', 'admin'], // Only board members
    workspace: ['member', 'admin'], // Workspace members
    public: ['anyone'], // Public
  },
};
