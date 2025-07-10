import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
   Alert,
  Snackbar,
} from '@mui/material';
import { 
  LogoutOutlined, 
  PersonOutline,
  Assignment,
  Dashboard as DashboardIcon} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Import the TaskTimerDialogs component
import TaskTimerDialogs from './Timer/TimerUI/TimerDialog/TaskTimerDialogs';

// FIXED: Import paths
import { useAuth } from '../hooks/AuthContext';
import { authAPI, taskAPI } from '../services/api';
import { type UserRole, hasAdminPrivileges, getRoleIcon, getRoleBadgeColor, getRoleDisplayName } from './Timer/TableUI/utils/roleUtils';

interface AssignTaskData {
  taskName: string;
  type: 'task' | 'meeting';
  assignedToEmail: string;
  description: string;
  estimatedTime: string;
  dueDate: Date | null;
  estimatedHours?: string;
  estimatedMinutes?: string;
  isRecurring?: boolean;
   approvalNeeded?: boolean;
  recurringOptions?: {
    skipWeekends?: boolean;
    workingDaysOnly?: boolean;
    statusOptions?: string[];
    repeatType?: 'schedule' | 'trigger';
    repeatInterval?: 'daily' | 'weekly' | 'monthly' | 'custom';
    repeatCount?: number;
    endCondition?: 'never' | 'after' | 'on';
    specificDays?: number[];
    monthlyOption?: 'date' | 'day';
    customInterval?: number;
    endDate?: Date | null;
  };
}

interface AppBarProps {
  showAdminPanel: boolean;
  onToggleAdminPanel: () => void;
  // New props for navigation
  currentPage?: 'dashboard' | 'activity';
  onNavigateToDashboard?: () => void;
  onNavigateToActivity?: () => void;
  // New props for assigned tasks
  showAssignedTasks?: boolean;
  onToggleAssignedTasks?: () => void;
  assignedTasksCount?: number;
  hasRunningTask?: boolean;
  // New props for TaskTimerDialogs
  onCreateTask?: () => void;
  onSetAlarm?: (minutes: number) => void;
  onTestAlarmSound?: () => void;
  // New prop for task assignment success callback
  onTaskAssigned?: () => void;
}

const CustomAppBar: React.FC<AppBarProps> = ({ 
  showAdminPanel, 
  onToggleAdminPanel,
  currentPage = 'dashboard',
  onNavigateToDashboard = () => {},
  onNavigateToActivity = () => {},
  // New props
  showAssignedTasks = false,
  onToggleAssignedTasks = () => {},
  assignedTasksCount = 0,
  hasRunningTask = false,
  // TaskTimerDialogs props
  onCreateTask = () => {},
  onSetAlarm = () => {},
  onTestAlarmSound = () => {},
  onTaskAssigned = () => {},
}) => {
  const { user, logout } = useAuth();
 
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  
  // TaskTimerDialogs state
  const [showTaskTimerDialogs, setShowTaskTimerDialogs] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [taskTimerState, setTaskTimerState] = useState({
    showTaskNameInput: false,
    showAlarmDialog: false,
    taskType: 'task' as 'task' | 'meeting',
    taskName: '',
  });
  // Update the initial assignTaskData state
const [assignTaskData, setAssignTaskData] = useState<AssignTaskData>({
  taskName: '',
  type: 'task',
  assignedToEmail: '',
  description: '',
  estimatedTime: '',
  dueDate: null,
  isRecurring: false,
  approvalNeeded: false, // Start with false so toggle can work
  recurringOptions: {
    skipWeekends: false,
    workingDaysOnly: false,
    statusOptions: ['todo'],
    repeatType: 'schedule',
    repeatInterval: 'weekly',
    repeatCount: 5,
    endCondition: 'after',
    specificDays: [],
    monthlyOption: 'date',
    customInterval: 1,
    endDate: null
  }
});
  // Assignment state
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Check user privileges using role utilities
  const userRole = user?.role as UserRole || 'user';
  const hasAdminPrivs = hasAdminPrivileges(userRole);

  const RoleIcon = getRoleIcon(userRole);

  const handleLogout = () => {
    logout();
  };

  const loadUsers = async () => {
    console.log('🔄 Loading users...');
    setLoadingUsers(true);
    setUserError(null);
    try {
      const response = await authAPI.getPublicUsers();
      const userData = response.data;
      
      let userList = [];
      if (Array.isArray(userData)) {
        userList = userData;
      } else if (userData && Array.isArray(userData.users)) {
        userList = userData.users;
      }
      
      console.log('✅ Users loaded:', userList);
      setUsers(userList);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setUserError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load users when component mounts if user has admin privileges
  useEffect(() => {
  // Load users for all authenticated users, not just admins
  if (user?.email) {
    loadUsers();
  }
}, [user?.email]);

  // TaskTimerDialogs handlers
  const handleShowTaskTimerDialogs = () => {
    console.log('🆕 Opening task creation dialog');
    setShowTaskTimerDialogs(true);
    setTaskTimerState(prev => ({ ...prev, showTaskNameInput: true }));
  };

  const handleHideTaskTimerDialogs = () => {
    console.log('❌ Closing task creation dialog');
    setShowTaskTimerDialogs(false);
    setTaskTimerState({
      showTaskNameInput: false,
      showAlarmDialog: false,
      taskType: 'task',
      taskName: '',
    });
  };

  const handleShowAssignDialog = () => {
    console.log('📋 Opening assign task dialog');
    setShowAssignDialog(true);
    setAssignmentError(null);
    setAssignmentSuccess(null);
    // Load users if not already loaded
    if (users.length === 0 && !loadingUsers) {
      loadUsers();
    }
  };

const handleHideAssignDialog = () => {
  console.log('❌ Closing assign task dialog');
  setShowAssignDialog(false);
  setAssignTaskData({
    taskName: '',
    type: 'task',
    assignedToEmail: '',
    description: '',
    estimatedTime: '',
    dueDate: null,
    isRecurring: false,
    approvalNeeded: false, // Reset to false
    recurringOptions: {
      skipWeekends: false,
      workingDaysOnly: false,
      statusOptions: ['todo'],
      repeatType: 'schedule',
      repeatInterval: 'weekly',
      repeatCount: 5,
      endCondition: 'after',
      specificDays: [],
      monthlyOption: 'date',
      customInterval: 1,
      endDate: null
    }
  });
  setAssignmentError(null);
  setAssignmentSuccess(null);
  setIsAssigning(false);
};


  const handleShowAlarmDialog = () => {
    console.log('⏰ Opening alarm dialog');
    setTaskTimerState(prev => ({ ...prev, showAlarmDialog: true }));
  };

  const handleTaskTimerDispatch = (action: any) => {
    console.log('🔄 TaskTimer dispatch:', action);
    switch (action.type) {
      case 'HIDE_TASK_INPUT':
        setTaskTimerState(prev => ({ ...prev, showTaskNameInput: false }));
        setShowTaskTimerDialogs(false);
        break;
      case 'SET_TASK_NAME':
        setTaskTimerState(prev => ({ ...prev, taskName: action.payload }));
        break;
      case 'HIDE_ALARM_DIALOG':
        setTaskTimerState(prev => ({ ...prev, showAlarmDialog: false }));
        break;
      case 'SHOW_ALARM_DIALOG':
        setTaskTimerState(prev => ({ ...prev, showAlarmDialog: true }));
        break;
      default:
        break;
    }
  };

  const handleCreateTask = () => {
    console.log('✅ Creating task:', taskTimerState.taskName);
    onCreateTask();
    handleHideTaskTimerDialogs();
  };

const handleAssignTask = async () => {
  console.log('📋 Starting task assignment...');
  setIsAssigning(true);
  setAssignmentError(null);
  
  try {
    // Validate required fields
    if (!assignTaskData.taskName.trim()) {
      setAssignmentError('Task name is required');
      return;
    }
    
    if (!assignTaskData.assignedToEmail) {
      setAssignmentError('Please select a user to assign the task to');
      return;
    }

    // Use the actual toggle value from assignTaskData
   
    const taskPayload = {
      taskName: assignTaskData.taskName.trim(),
      type: assignTaskData.type,
      assignedToEmail: assignTaskData.assignedToEmail,
      description: assignTaskData.description?.trim() || '',
      estimatedTime: assignTaskData.estimatedTime || '',
      dueDate: assignTaskData.dueDate ? assignTaskData.dueDate.toISOString() : null,
      assignedBy: user?.email || '',
      approvalNeeded: Boolean(assignTaskData.approvalNeeded),
      
      // Add recurring data if present
      isRecurring: assignTaskData.isRecurring || false,
      ...(assignTaskData.isRecurring && assignTaskData.recurringOptions && {
        recurringOptions: {
          ...assignTaskData.recurringOptions,
          endDate: assignTaskData.recurringOptions.endDate 
            ? assignTaskData.recurringOptions.endDate.toISOString() 
            : null
        }
      })
    };

    console.log('📡 Sending task assignment request:', taskPayload);
    console.log('🔍 Approval needed value:', {
      original: assignTaskData.approvalNeeded,
      type: typeof assignTaskData.approvalNeeded,
      boolean: Boolean(assignTaskData.approvalNeeded),
      payload: taskPayload.approvalNeeded
    });

    const response = await taskAPI.createTaskAssignment(taskPayload);

    console.log('✅ Task assignment response:', response.data);

    if (response.data.success) {
      const assignedUser = users.find(u => u.email === assignTaskData.assignedToEmail);
      const approvalText = assignTaskData.approvalNeeded ? ' (Approval Required)' : ' (No Approval Required)';
      const successMessage = assignTaskData.isRecurring 
        ? `Recurring task "${assignTaskData.taskName}" assigned successfully to ${assignedUser?.username || assignTaskData.assignedToEmail}!${approvalText}`
        : `Task "${assignTaskData.taskName}" assigned successfully to ${assignedUser?.username || assignTaskData.assignedToEmail}!${approvalText}`;
      
      setAssignmentSuccess(successMessage);
      
      // Close dialog and reset form AFTER success
      handleHideAssignDialog();
      
      // Call the callback to refresh data if provided
      onTaskAssigned();
      
      console.log('✅ Task assigned successfully');
    } else {
      throw new Error(response.data.message || 'Failed to assign task');
    }
  } catch (error: any) {
    console.error('❌ Error assigning task:', error);
    
    let errorMessage = 'Failed to assign task. Please try again.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setAssignmentError(errorMessage);
  } finally {
    setIsAssigning(false);
  }
};



const handleAssignTaskDataChange = (field: string, value: string | Date | null | boolean) => {
  console.log('📝 Updating assign task data:', { field, value, type: typeof value });
  
  if (field === 'approvalNeeded') {
    console.log('🔄 Setting approval needed in AppBar:', {
      currentValue: assignTaskData.approvalNeeded,
      newValue: value,
      booleanValue: Boolean(value)
    });
  }
  
  setAssignTaskData(prev => {
    const updated = {
      ...prev,
      [field]: value // This should work correctly
    };
    console.log('📝 Updated assignTaskData in AppBar:', updated);
    return updated;
  });
};

  // Calculate AppBar height for different screen sizes
  const appBarHeight = {
    xs: 64, // Mobile
    sm: 70, // Tablet
    md: 80, // Desktop
  };

  // Navigation button style generator
  const getNavigationButtonStyle = (isActive: boolean) => ({
    color: 'white',
    background: isActive 
      ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(76, 175, 80, 0.2) 100%)'
      : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: isActive 
      ? '2px solid rgba(76, 175, 80, 0.5)'
      : '1px solid rgba(255, 255, 255, 0.2)',
    width: { xs: 36, sm: 40, md: 48 },
    height: { xs: 36, sm: 40, md: 48 },
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: isActive ? 0 : '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.3) 100%)',
      transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: -1,
    },
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(76, 175, 80, 0.15) 100%)',
      transform: 'translateY(-3px) scale(1.1)',
      boxShadow: '0 12px 35px rgba(76, 175, 80, 0.4)',
      borderColor: 'rgba(76, 175, 80, 0.6)',
      '&::before': {
        left: 0,
      },
    },
    '&:active': {
      transform: 'translateY(-1px) scale(1.05)',
    },
  });

  // TaskTimer Dialog button style
  const getTaskTimerButtonStyle = () => ({
    color: 'white',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    width: { xs: 36, sm: 40, md: 48 },
    height: { xs: 36, sm: 40, md: 48 },
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.25) 0%, rgba(33, 150, 243, 0.15) 100%)',
      transform: 'translateY(-3px) scale(1.1)',
           boxShadow: '0 12px 35px rgba(33, 150, 243, 0.4)',
      borderColor: 'rgba(33, 150, 243, 0.6)',
    },
    '&:active': {
      transform: 'translateY(-1px) scale(1.05)',
    },
  });

  // Assigned Tasks button style
  const getAssignedTasksButtonStyle = (isActive: boolean) => ({
    color: 'white',
    background: isActive 
      ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.3) 0%, rgba(255, 193, 7, 0.2) 100%)'
      : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: isActive 
      ? '2px solid rgba(255, 152, 0, 0.5)'
      : '1px solid rgba(255, 255, 255, 0.2)',
    width: { xs: 36, sm: 40, md: 48 },
    height: { xs: 36, sm: 40, md: 48 },
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: isActive ? 0 : '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 193, 7, 0.3) 100%)',
      transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: -1,
    },
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.25) 0%, rgba(255, 193, 7, 0.15) 100%)',
      transform: 'translateY(-3px) scale(1.1)',
      boxShadow: '0 12px 35px rgba(255, 152, 0, 0.4)',
      borderColor: 'rgba(255, 152, 0, 0.6)',
      '&::before': {
        left: 0,
      },
    },
    '&:active': {
      transform: 'translateY(-1px) scale(1.05)',
    },
  });

  // Debug logging
  console.log('🔍 AppBar Debug Info:', {
    hasAdminPrivs,
    showAssignDialog,
    users: users.length,
    loadingUsers,
    userError,
    isAssigning,
    assignmentError,
    assignmentSuccess
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppBar 
        position="sticky"
        sx={{
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          boxShadow: '0 8px 32px rgba(30, 60, 114, 0.3)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: theme.zIndex.appBar,
          height: {
            xs: `${appBarHeight.xs}px`,
            sm: `${appBarHeight.sm}px`, 
            md: `${appBarHeight.md}px`
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
            animation: 'shimmer 3s infinite',
          },
          '@keyframes shimmer': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' },
          },
        }}
      >
        <Toolbar 
          sx={{ 
            py: { xs: 1, sm: 1.5, md: 2 }, 
            px: { xs: 2, sm: 3, md: 4 },
            minHeight: {
              xs: `${appBarHeight.xs}px !important`,
              sm: `${appBarHeight.sm}px !important`,
              md: `${appBarHeight.md}px !important`
            },
            height: '100%'
          }}
        >
          {/* Left Side - Brand */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1.5, sm: 2 }, 
            flexGrow: 1,
            animation: 'slideInLeft 0.8s ease-out',
            '@keyframes slideInLeft': {
              '0%': {
                opacity: 0,
                transform: 'translateX(-30px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateX(0)',
              },
            },
          }}>
            {/* Brand Logo */}
            <Box
              component="img"
              src="/assert/ChatGPT_Image_Jun_10__2025__09_20_55_AM-removebg-preview.png"
              alt="Vanan Online Services Logo"
              sx={{
                width: 64,
                height: 64,
                mb: 0.5,
                filter: 'brightness(0) invert(1) brightness(1.2)', // Makes it white and bright
              }}
            />
            
            {/* Brand Text */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography 
                variant="h5" 
                component="div" 
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                  fontSize: { sm: '1.3rem', md: '1.5rem' },
                  lineHeight: 1.2,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                VANAN
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 500,
                  fontSize: { sm: '0.7rem', md: '0.75rem' },
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  display: { xs: 'none', md: 'block' }
                }}
              >
                Work Tracker
              </Typography>
            </Box>
          </Box>

          {/* Center - Navigation Icons */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, sm: 1, md: 1.5 },
            mx: { xs: 1, sm: 2, md: 3 },
            animation: 'slideInUp 0.8s ease-out 0.2s both',
            '@keyframes slideInUp': {
              '0%': {
                opacity: 0,
                transform: 'translateY(20px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}>
            {/* Dashboard Navigation Icon */}
            <Tooltip title="Dashboard" arrow placement="bottom">
              <IconButton
                onClick={onNavigateToDashboard}
                sx={getNavigationButtonStyle(currentPage === 'dashboard')}
              >
                <DashboardIcon 
                  sx={{ 
                    fontSize: { xs: 18, sm: 20, md: 24 },
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                    animation: currentPage === 'dashboard' ? 'dashboardPulse 2s ease-in-out infinite' : 'none',
                    '@keyframes dashboardPulse': {
                      '0%, 100%': { 
                        transform: 'scale(1)',
                      },
                      '50%': { 
                        transform: 'scale(1.1)',
                      },
                    },
                  }} 
                />
                
                {/* Active Indicator */}
                {currentPage === 'dashboard' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: { xs: 2, sm: 3, md: 4 },
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: { xs: 16, sm: 20, md: 24 },
                      height: 2,
                      borderRadius: 1,
                      background: 'linear-gradient(135deg, #4caf50, #8bc34a)',
                      animation: 'activeIndicator 1.5s ease-in-out infinite',
                      '@keyframes activeIndicator': {
                        '0%, 100%': { 
                          opacity: 1,
                          transform: 'translateX(-50%) scaleX(1)',
                        },
                        '50%': { 
                          opacity: 0.7,
                          transform: 'translateX(-50%) scaleX(1.2)',
                        },
                      },
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>

          

            {/* Admin Assign Task Icon - Only show if user has admin privileges */}
           
              <Tooltip title="Assign Task to User" arrow placement="bottom">
                <IconButton
                  onClick={handleShowAssignDialog}
                  disabled={isAssigning}
                  sx={{
                    color: 'white',
                    background: isAssigning 
                      ? 'rgba(156, 39, 176, 0.2)'
                      : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    width: { xs: 36, sm: 40, md: 48 },
                    height: { xs: 36, sm: 40, md: 48 },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isAssigning ? 0.7 : 1,
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.25) 0%, rgba(156, 39, 176, 0.15) 100%)',
                      transform: isAssigning ? 'none' : 'translateY(-3px) scale(1.1)',
                      boxShadow: '0 12px 35px rgba(156, 39, 176, 0.4)',
                      borderColor: 'rgba(156, 39, 176, 0.6)',
                    },
                    '&:disabled': {
                      color: 'rgba(255, 255, 255, 0.5)',
                      cursor: 'not-allowed',
                    },
                  }}
                >
                  <Assignment 
                    sx={{ 
                      fontSize: { xs: 18, sm: 20, md: 24 },
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                      animation: isAssigning ? 'assigningPulse 1s ease-in-out infinite' : 'none',
                      '@keyframes assigningPulse': {
                        '0%, 100%': { 
                          transform: 'scale(1)',
                          opacity: 1,
                        },
                        '50%': { 
                          transform: 'scale(1.1)',
                          opacity: 0.7,
                        },
                      },
                    }} 
                  />
                  
                  {/* Loading indicator */}
                  {isAssigning && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '50%',
                        border: '2px solid transparent',
                        borderTop: '2px solid rgba(156, 39, 176, 0.8)',
                        animation: 'assigningSpin 1s linear infinite',
                        '@keyframes assigningSpin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                      }}
                    />
                  )}
                </IconButton>
              </Tooltip>
          
          </Box>

          {/* Right Side - User Actions */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, sm: 1, md: 1.5 },
            animation: 'slideInRight 0.8s ease-out 0.4s both',
            '@keyframes slideInRight': {
              '0%': {
                opacity: 0,
                transform: 'translateX(30px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateX(0)',
              },
            },
          }}>
            {/* Admin Panel Toggle - Only show if user has admin privileges */}
            {hasAdminPrivs && (
              <Tooltip title={showAdminPanel ? "Hide Admin Panel" : "Show Admin Panel"} arrow placement="bottom">
                <IconButton
                  onClick={onToggleAdminPanel}
                  sx={{
                    color: 'white',
                    background: showAdminPanel 
                      ? 'linear-gradient(135deg, rgba(156, 39, 176, 0.3) 0%, rgba(233, 30, 99, 0.3) 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: showAdminPanel 
                      ? '2px solid rgba(156, 39, 176, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    width: { xs: 36, sm: 40, md: 44 },
                    height: { xs: 36, sm: 40, md: 44 },
                    transition: 'all 0.3s ease',
                    animation: showAdminPanel ? 'adminGlow 2s ease-in-out infinite' : 'none',
                    '@keyframes adminGlow': {
                      '0%, 100%': { 
                        boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
                      },
                      '50%': { 
                        boxShadow: '0 6px 20px rgba(156, 39, 176, 0.5)',
                      },
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.4) 0%, rgba(233, 30, 99, 0.4) 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(156, 39, 176, 0.4)',
                    },
                  }}
                >
                  <RoleIcon sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                </IconButton>
              </Tooltip>
            )}

            {/* User Profile */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 1.5 },
              ml: { xs: 0.5, sm: 1 }
            }}>
              {/* User Info - Hide on mobile */}
              {!isMobile && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'white',
                      fontWeight: 600,
                      fontSize: { sm: '0.85rem', md: '0.9rem' },
                      lineHeight: 1.2,
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {user?.username || 'User'}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: { sm: '0.7rem', md: '0.75rem' },
                      fontWeight: 500,
                      textTransform: 'capitalize',
                    }}
                  >
                    {getRoleDisplayName(userRole)}
                  </Typography>
                </Box>
              )}

              {/* User Avatar with Role Badge */}
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: { xs: 16, sm: 18, md: 20 },
                      height: { xs: 16, sm: 18, md: 20 },
                      borderRadius: '50%',
                      background: getRoleBadgeColor(userRole),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <RoleIcon 
                      sx={{ 
                        fontSize: { xs: 8, sm: 10, md: 12 }, 
                        color: 'white',
                        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                      }} 
                    />
                  </Box>
                }
              >
                <Avatar
                  sx={{
                    width: { xs: 36, sm: 40, md: 44 },
                    height: { xs: 36, sm: 40, md: 44 },
                    background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                    border: '3px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                    },
                  }}
                >
                  <PersonOutline sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                </Avatar>
              </Badge>

              {/* Logout Button */}
              <Tooltip title="Logout" arrow placement="bottom">
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    color: 'white',
                    background: 'rgba(244, 67, 54, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    width: { xs: 36, sm: 40, md: 44 },
                    height: { xs: 36, sm: 40, md: 44 },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(244, 67, 54, 0.3)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(244, 67, 54, 0.4)',
                    },
                  }}
                >
                  <LogoutOutlined sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* TaskTimerDialogs Component - Task Creation */}
      {showTaskTimerDialogs && (
        <TaskTimerDialogs
          state={taskTimerState}
          dispatch={handleTaskTimerDispatch}
          showAssignDialog={false}
          users={[]}
          loadingUsers={false}
          userError={null}
          assignTaskData={assignTaskData}
          
          onCreateTask={handleCreateTask}
          onHideAssignDialog={() => {}}
          onAssignTask={() => {}}
          onAssignTaskDataChange={() => {}}
          onLoadUsers={() => {}}
          onSetAlarm={onSetAlarm}
          onTestAlarmSound={onTestAlarmSound}
        />
      )}

      {/* TaskTimerDialogs Component - Assign Task (Admin Only) */}
      {showAssignDialog && (
        <TaskTimerDialogs
          state={{ 
            showTaskNameInput: false, 
            showAlarmDialog: false, 
            taskType: 'task', 
            taskName: '' 
          }}
          dispatch={() => {}}
          showAssignDialog={showAssignDialog}
          users={users}
          loadingUsers={loadingUsers}
          userError={userError}
          assignTaskData={assignTaskData}
          onCreateTask={() => {}}
          onHideAssignDialog={handleHideAssignDialog}
          onAssignTask={handleAssignTask}
          onAssignTaskDataChange={handleAssignTaskDataChange}
          onLoadUsers={loadUsers}
          onSetAlarm={() => {}}
          onTestAlarmSound={() => {}}
        />
      )}

      {/* TaskTimerDialogs Component - Alarm Dialog */}
      {taskTimerState.showAlarmDialog && (
        <TaskTimerDialogs
          state={taskTimerState}
          dispatch={handleTaskTimerDispatch}
          showAssignDialog={false}
          users={[]}
          loadingUsers={false}
          userError={null}
          assignTaskData={assignTaskData}
          onCreateTask={() => {}}
          onHideAssignDialog={() => {}}
          onAssignTask={() => {}}
          onAssignTaskDataChange={() => {}}
          onLoadUsers={() => {}}
          onSetAlarm={onSetAlarm}
          onTestAlarmSound={onTestAlarmSound}
        />
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!assignmentSuccess}
        autoHideDuration={6000}
        onClose={() => setAssignmentSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAssignmentSuccess(null)} 
          severity="success" 
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '0.9rem',
              fontWeight: 500,
            }
          }}
        >
          {assignmentSuccess}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!assignmentError}
               autoHideDuration={8000}
        onClose={() => setAssignmentError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAssignmentError(null)} 
          severity="error" 
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '0.9rem',
              fontWeight: 500,
            }
          }}
        >
          {assignmentError}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default CustomAppBar;



