import { 
  Person, 
  ManageAccounts, 
  AdminPanelSettings 
} from '@mui/icons-material';

export type UserRole = 'user' | 'manager' | 'admin';

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'user':
      return 'Standard User';
    case 'manager':
      return 'Team Manager';
    case 'admin':
      return 'Administrator';
    default:
      return 'Unknown Role';
  }
};

export const getRoleDescription = (role: UserRole): string => {
  switch (role) {
    case 'user':
      return 'Regular employee access';
    case 'manager':
      return 'Team management access';
    case 'admin':
      return 'Full system access';
    default:
      return 'Unknown role';
  }
};

export const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'user':
      return Person;
    case 'manager':
      return ManageAccounts;
    case 'admin':
      return AdminPanelSettings;
    default:
      return Person;
  }
};

export const getRoleBadgeColor = (role: UserRole): string => {
  switch (role) {
    case 'user':
      return 'linear-gradient(135deg, #4caf50, #8bc34a)';
    case 'manager':
      return 'linear-gradient(135deg, #ff9800, #ffc107)';
    case 'admin':
      return 'linear-gradient(135deg, #f44336, #e91e63)';
    default:
      return 'linear-gradient(135deg, #4caf50, #8bc34a)';
  }
};

export const hasAdminPrivileges = (role: UserRole): boolean => {
  return ['admin'].includes(role);
};

export const canAssignTasks = (role: UserRole): boolean => {
  return ['admin', 'manager', 'user'].includes(role); // All users can assign tasks
};

export const canManageUsers = (role: UserRole): boolean => {
  return role === 'admin'; // Only admins can manage user roles
};

export const canViewAllTasks = (role: UserRole): boolean => {
  return ['admin', 'manager'].includes(role);
};
