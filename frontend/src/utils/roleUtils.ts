import React from 'react';
import {
  AdminPanelSettings,
  SupervisorAccount,
  Person,
  Business,
  Engineering
} from '@mui/icons-material';

export type UserRole = 'admin' | 'manager' | 'supervisor' | 'user' | 'employee' | 'guest';

export const hasAdminPrivileges = (role: UserRole): boolean => {
  return ['admin', 'manager', 'supervisor'].includes(role);
};

export const canAssignTasks = (role: UserRole): boolean => {
  return ['admin', 'manager', 'supervisor'].includes(role);
};

export const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return AdminPanelSettings;
    case 'manager':
      return SupervisorAccount;
    case 'supervisor':
      return Engineering;
    case 'employee':
    case 'user':
      return Person;
    default:
      return Person;
  }
};

export const getRoleBadgeColor = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)';
    case 'manager':
      return 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)';
    case 'supervisor':
      return 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)';
    case 'employee':
    case 'user':
      return 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)';
    default:
      return 'linear-gradient(135deg, #757575 0%, #9e9e9e 100%)';
  }
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'manager':
      return 'Manager';
    case 'supervisor':
      return 'Supervisor';
    case 'employee':
      return 'Employee';
    case 'user':
      return 'User';
    case 'guest':
      return 'Guest';
    default:
      return 'User';
  }
};

export const getRolePermissions = (role: UserRole) => {
  const permissions = {
    canViewAllTasks: false,
    canAssignTasks: false,
    canManageUsers: false,
    canAccessAdminPanel: false,
    canDeleteTasks: false,
    canEditAnyTask: false,
  };

  switch (role) {
    case 'admin':
      return {
        ...permissions,
        canViewAllTasks: true,
        canAssignTasks: true,
        canManageUsers: true,
        canAccessAdminPanel: true,
        canDeleteTasks: true,
        canEditAnyTask: true,
      };
    case 'manager':
      return {
        ...permissions,
        canViewAllTasks: true,
        canAssignTasks: true,
        canAccessAdminPanel: true,
        canEditAnyTask: true,
      };
    case 'supervisor':
      return {
        ...permissions,
        canViewAllTasks: true,
        canAssignTasks: true,
        canAccessAdminPanel: true,
      };
    default:
      return permissions;
  }
};
