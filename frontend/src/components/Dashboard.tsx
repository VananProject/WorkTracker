import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  IconButton,
  Tooltip,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  Assignment
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import '../styles/dashboard.css';
import { useAuth } from '../hooks/AuthContext';
import TaskTimer from './Timer/functionality/TaskTimer';
import { type UserRole, hasAdminPrivileges, canAssignTasks, getRoleIcon, getRoleBadgeColor } from './Timer/TableUI/utils/roleUtils';
import CustomAppBar from './AppBar';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAssignedTasks, setShowAssignedTasks] = useState(false);
  const [assignedTasksCount, setAssignedTasksCount] = useState(0);
  const [hasRunningTask, setHasRunningTask] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Check user privileges using role utilities
  const userRole = user?.role as UserRole || 'user';
  const hasAdminPrivs = hasAdminPrivileges(userRole);
  const canAssign = canAssignTasks(userRole);
  const RoleIcon = getRoleIcon(userRole);

  const handleToggleAdminPanel = () => {
    console.log('🔧 Dashboard: Toggling admin panel from', showAdminPanel, 'to', !showAdminPanel);
    setShowAdminPanel(!showAdminPanel);
  };

  const handleToggleAssignedTasks = () => {
    console.log('📋 Dashboard: Toggling assigned tasks from', showAssignedTasks, 'to', !showAssignedTasks);
    setShowAssignedTasks(!showAssignedTasks);
  };

  // AppBar event handlers
  const handleCreateTask = () => {
    console.log('✅ Dashboard: Creating task from AppBar');
    // You can add logic here to create a task or delegate to TaskTimer
  };

  const handleSetAlarm = (minutes: number) => {
    console.log('⏰ Dashboard: Setting alarm for', minutes, 'minutes');
    // You can add logic here to set an alarm or delegate to TaskTimer
  };

  const handleTestAlarmSound = () => {
    console.log('🔊 Dashboard: Testing alarm sound');
    // You can add logic here to test alarm sound or delegate to TaskTimer
  };

  const handleTaskAssigned = () => {
    console.log('✅ Dashboard: Task assigned successfully');
    // You can add logic here to refresh data or show notifications
    // For example, refresh the task list or update assigned tasks count
    setAssignedTasksCount(prev => prev + 1);
  };

  // Calculate AppBar height for different screen sizes
  const appBarHeight = {
    xs: 64, // Mobile
    sm: 70, // Tablet
    md: 80, // Desktop
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        overflow: 'hidden' // Prevent body scroll
      }}>
        {/* Custom AppBar Component */}
        <CustomAppBar 
          showAdminPanel={showAdminPanel}
          onToggleAdminPanel={handleToggleAdminPanel}
          currentPage="dashboard"
          onNavigateToDashboard={() => console.log('Navigate to dashboard')}
          onNavigateToActivity={() => console.log('Navigate to activity')}
          showAssignedTasks={showAssignedTasks}
          onToggleAssignedTasks={handleToggleAssignedTasks}
          assignedTasksCount={assignedTasksCount}
          hasRunningTask={hasRunningTask}
          onCreateTask={handleCreateTask}
          onSetAlarm={handleSetAlarm}
          onTestAlarmSound={handleTestAlarmSound}
          onTaskAssigned={handleTaskAssigned}
        />

        {/* Scrollable Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: `calc(100vh - ${appBarHeight.xs}px)`, // Mobile
            [theme.breakpoints.up('sm')]: {
              height: `calc(100vh - ${appBarHeight.sm}px)`, // Tablet
            },
            [theme.breakpoints.up('md')]: {
              height: `calc(100vh - ${appBarHeight.md}px)`, // Desktop
            },
            overflow: 'auto',
            position: 'relative',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            // INCREASED WIDTH - Remove default margins and padding
            width: '100vw', // Full viewport width
            margin: 0,
            padding: 0,
            // Custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: { xs: 4, sm: 6, md: 8 },
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: 10,
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 10,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              },
            },
            '&::-webkit-scrollbar-corner': {
              background: 'transparent',
            },
          }}
        >
          {/* Content Container - MAXIMIZED WIDTH */}
          <Container
            maxWidth={false}
            disableGutters // Remove default gutters for maximum width
            sx={{
              py: { xs: 1, sm: 2, md: 3 }, // Reduced vertical padding
              px: { xs: 0.5, sm: 1, md: 1.5 }, // Minimal horizontal padding
              // MAXIMUM WIDTH SETTINGS
              maxWidth: '100% !important', // Force 100% width
              width: '100%',
              minWidth: '100%',
              // Remove any width constraints
              margin: 0,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              minHeight: '100%',
              // Override MUI Container default max-widths
              '&.MuiContainer-root': {
                maxWidth: '100% !important',
                paddingLeft: { xs: '4px', sm: '8px', md: '12px' },
                paddingRight: { xs: '4px', sm: '8px', md: '12px' },
              },
            }}
          >
            {/* Background Pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.03,
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, #667eea 0%, transparent 50%),
                  radial-gradient(circle at 75% 75%, #764ba2 0%, transparent 50%)
                `,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {/* Main Content - FULL WIDTH */}
            <Paper
              elevation={0}
              sx={{
                position: 'relative',
                zIndex: 1,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: { xs: 1, sm: 2, md: 3 }, // Reduced border radius for more space
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                // FULL WIDTH AND HEIGHT
                width: '100%',
                minWidth: '100%',
                minHeight: {
                  xs: 'calc(100vh - 100px)', // Increased height
                  sm: 'calc(100vh - 120px)',
                  md: 'calc(100vh - 140px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  zIndex: 1,
                },
              }}
            >
              {/* Content Wrapper - MAXIMUM SPACE UTILIZATION */}
              <Box
                sx={{
                  p: { xs: 0.5, sm: 1, md: 1.5, lg: 2 }, // Minimal padding for maximum space
                  height: '100%',
                  overflow: 'auto',
                  position: 'relative',
                  width: '100%',
                  // Responsive content scaling
                  '& .MuiTypography-h4': {
                    fontSize: {
                      xs: '1.5rem',
                      sm: '1.75rem',
                      md: '2rem',
                      lg: '2.125rem',
                    },
                  },
                  '& .MuiTypography-h5': {
                    fontSize: {
                      xs: '1.25rem',
                      sm: '1.375rem',
                      md: '1.5rem',
                    },
                  },
                  '& .MuiTypography-h6': {
                    fontSize: {
                      xs: '1rem',
                      sm: '1.125rem',
                      md: '1.25rem',
                    },
                  },
                  // Responsive button sizing
                  '& .MuiButton-root': {
                    fontSize: {
                      xs: '0.8rem',
                      sm: '0.875rem',
                      md: '0.9rem',
                    },
                    padding: {
                      xs: '6px 12px',
                      sm: '8px 16px',
                      md: '10px 20px',
                    },
                  },
                  // Responsive card spacing - reduced for more space
                  '& .MuiCard-root': {
                    marginBottom: {
                      xs: 1,
                      sm: 2,
                      md: 3,
                    },
                  },
                }}
              >
                {/* TaskTimer Component - FULL WIDTH UTILIZATION */}
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'visible',
                    position: 'relative',
                    // ENHANCED WIDTH FOR TASK TIMER
                    minWidth: '100%',
                    // Enhanced responsive behavior for TaskTimer
                    '& .timer-container': {
                      padding: {
                        xs: '4px',
                        sm: '8px',
                        md: '12px',
                        lg: '16px',
                      },
                      width: '100%',
                      maxWidth: '100%',
                    },
                    // Admin panel responsive adjustments - FULL WIDTH
                    '& .admin-panel': {
                      width: '100% !important',
                      maxWidth: '100% !important',
                      minWidth: '100%',
                      transform: 'none', // Remove scaling to preserve full width
                      transformOrigin: 'top left',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    // Table responsive adjustments - FULL WIDTH
                    '& .MuiTableContainer-root': {
                      width: '100%',
                      maxWidth: '100%',
                      minWidth: '100%',
                      overflowX: 'auto',
                      '&::-webkit-scrollbar': {
                        height: { xs: 4, sm: 6 },
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(0, 0, 0, 0.05)',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 3,
                      },
                    },
                    // Card responsive adjustments - FULL WIDTH
                    '& .MuiCard-root': {
                      width: '100%',
                      maxWidth: '100%',
                      borderRadius: {
                        xs: 1,
                        sm: 2,
                        md: 3,
                      },
                      boxShadow: {
                        xs: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        sm: '0 8px 24px rgba(0, 0, 0, 0.1)',
                        md: '0 12px 36px rgba(0, 0, 0, 0.1)',
                      },
                    },
                    // Button group responsive adjustments
                    '& .button-group': {
                      flexDirection: {
                        xs: 'column',
                        sm: 'row',
                      },
                      gap: {
                        xs: 1,
                        sm: 2,
                        md: 3,
                      },
                      width: '100%',
                    },
                    // Form responsive adjustments - FULL WIDTH
                    '& .MuiTextField-root': {
                      marginBottom: {
                        xs: 1,
                        sm: 2,
                      },
                      width: '100%',
                    },
                    // Dialog responsive adjustments
                    // Dialog responsive adjustments - MAXIMUM WIDTH
                    '& .MuiDialog-paper': {
                      margin: {
                        xs: 0.5,
                        sm: 1,
                        md: 1.5,
                      },
                      maxWidth: {
                        xs: 'calc(100vw - 8px)',
                        sm: 'calc(100vw - 16px)',
                        md: 'calc(100vw - 32px)',
                        lg: 'calc(100vw - 64px)',
                        xl: 'calc(100vw - 128px)',
                      },
                      width: {
                        xs: 'calc(100vw - 8px)',
                        sm: 'calc(100vw - 16px)',
                        md: 'calc(100vw - 32px)',
                        lg: 'calc(100vw - 64px)',
                        xl: 'calc(100vw - 128px)',
                      },
                    },
                    // GRID AND LAYOUT ADJUSTMENTS FOR MAXIMUM WIDTH
                    '& .MuiGrid-container': {
                      width: '100%',
                      maxWidth: '100%',
                      margin: 0,
                    },
                    '& .MuiGrid-item': {
                      paddingLeft: { xs: '2px', sm: '4px', md: '6px' },
                      paddingTop: { xs: '2px', sm: '4px', md: '6px' },
                    },
                    // CONTAINER ADJUSTMENTS
                    '& .MuiContainer-root': {
                      maxWidth: '100% !important',
                      width: '100%',
                      paddingLeft: { xs: '2px', sm: '4px', md: '8px' },
                      paddingRight: { xs: '2px', sm: '4px', md: '8px' },
                    },
                  }}
                >
                  <TaskTimer
                    showAdminPanelFromAppBar={showAdminPanel}
                    onToggleAdminPanelFromAppBar={handleToggleAdminPanel}
                    // Pass additional props to TaskTimer if needed
                    showAssignedTasks={showAssignedTasks}
                    onTaskCountChange={setAssignedTasksCount}
                    onRunningTaskChange={setHasRunningTask}
                  />
                </Box>
              </Box>
            </Paper>
          </Container>

          {/* Floating Action Button for Mobile Admin/Manager Toggle */}
          {hasAdminPrivs && isMobile && (
            <Box
              sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                zIndex: theme.zIndex.fab,
              }}
            >
              <Tooltip title={showAdminPanel ? "Hide Management Panel" : "Show Management Panel"} arrow>
                <IconButton
                  onClick={handleToggleAdminPanel}
                  sx={{
                    width: 56,
                    height: 56,
                    background: showAdminPanel 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : getRoleBadgeColor(userRole),
                    color: 'white',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: 'fabPulse 3s ease-in-out infinite',
                    '&:hover': {
                      transform: 'scale(1.1) translateY(-3px)',
                      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
                      background: showAdminPanel 
                        ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                        : getRoleBadgeColor(userRole),
                    },
                    '&:active': {
                      transform: 'scale(1.05) translateY(-1px)',
                    },
                    '@keyframes fabPulse': {
                      '0%, 100%': { 
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                      },
                      '50%': { 
                        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
                      },
                    },
                  }}
                >
                  <RoleIcon 
                    sx={{ 
                      fontSize: 28,
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                      animation: showAdminPanel ? 'fabSpin 0.6s ease-in-out' : 'none',
                      '@keyframes fabSpin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }} 
                  />
                  
                  {/* Notification Ring */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: showAdminPanel 
                        ? 'linear-gradient(135deg, #4caf50, #8bc34a)'
                        : 'linear-gradient(135deg, #ff9800, #ffc107)',
                      border: '2px solid white',
                      animation: 'fabNotification 2s ease-in-out infinite',
                      '@keyframes fabNotification': {
                        '0%, 100%': { 
                          transform: 'scale(1)',
                          opacity: 1,
                        },
                        '50%': { 
                          transform: 'scale(1.2)',
                          opacity: 0.8,
                        },
                      },
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Floating Action Button for Mobile Assign Task */}
          

          {/* Scroll to Top Button */}
          <Box
            sx={{
              position: 'fixed',
              bottom: isMobile && hasAdminPrivs ? 90 : 20,
              right: isMobile ? 90 : 20, // Adjust position to avoid FAB overlap
              zIndex: theme.zIndex.fab - 1,
            }}
          >
            <IconButton
              onClick={() => {
                const mainContent = document.querySelector('main');
                if (mainContent) {
                  mainContent.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              sx={{
                width: { xs: 45, sm: 50 },
                height: { xs: 45, sm: 50 },
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                color: 'primary.main',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: 0.7,
                '&:hover': {
                  opacity: 1,
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                  background: 'rgba(255, 255, 255, 0.95)',
                },
              }}
            >
              <Box
                sx={{
                  transform: 'rotate(-90deg)',
                  fontSize: { xs: 20, sm: 24 },
                }}
              >
                ➤
              </Box>
            </IconButton>
          </Box>
        </Box>

        {/* Loading Overlay for Smooth Transitions */}
        <Collapse in={false}>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: theme.zIndex.modal + 1,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                border: '4px solid rgba(102, 126, 234, 0.2)',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'loadingSpin 1s linear infinite',
                '@keyframes loadingSpin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          </Box>
        </Collapse>
      </Box>
    </LocalizationProvider>
  );
};

export default React.memo(Dashboard);


// import React, { useState } from 'react';
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   Container,
//   Paper,
//   Box,
//   Avatar,
//   Badge,
//   IconButton,
//   Tooltip,
//   Collapse,
//   useTheme,
//   useMediaQuery,
// } from '@mui/material';
// import { 
//   AccessTime, 
//   LogoutOutlined, 
//   MoreVert, 
//   PersonOutline,
//   AdminPanelSettings 
// } from '@mui/icons-material';

// import '../styles/dashboard.css';
// import { useAuth } from '../hooks/AuthContext';
// import TaskTimer from './Timer/functionality/TaskTimer';

// const Dashboard: React.FC = () => {
//   const { user, logout } = useAuth();
//   const [showAdminPanel, setShowAdminPanel] = useState(false);
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const isTablet = useMediaQuery(theme.breakpoints.down('md'));

//   // Check if user is admin
//   const isAdmin = user?.role === 'admin';

//   const handleLogout = () => {
//     logout();
//   };

//   const handleToggleAdminPanel = () => {
//     setShowAdminPanel(!showAdminPanel);
//   };

//   // Calculate AppBar height for different screen sizes
//   const appBarHeight = {
//     xs: 64, // Mobile
//     sm: 70, // Tablet
//     md: 80, // Desktop
//   };

//   return (
//     <Box sx={{ 
//       display: 'flex', 
//       flexDirection: 'column', 
//       height: '100vh',
//       overflow: 'hidden' // Prevent body scroll
//     }}>
//       {/* Sticky AppBar */}
//       <AppBar 
//         position="sticky"
//         sx={{
//           background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
//           boxShadow: '0 8px 32px rgba(30, 60, 114, 0.3)',
//           backdropFilter: 'blur(20px)',
//           borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
//           zIndex: theme.zIndex.appBar,
//           height: {
//             xs: `${appBarHeight.xs}px`,
//             sm: `${appBarHeight.sm}px`, 
//             md: `${appBarHeight.md}px`
//           },
//           '&::before': {
//             content: '""',
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
//             animation: 'shimmer 3s infinite',
//           },
//           '@keyframes shimmer': {
//             '0%': { transform: 'translateX(-100%)' },
//             '100%': { transform: 'translateX(100%)' },
//           },
//         }}
//       >
//         <Toolbar 
//           sx={{ 
//             py: { xs: 1, sm: 1.5, md: 2 }, 
//             px: { xs: 2, sm: 3, md: 4 },
//             minHeight: {
//               xs: `${appBarHeight.xs}px !important`,
//               sm: `${appBarHeight.sm}px !important`,
//               md: `${appBarHeight.md}px !important`
//             },
//             height: '100%'
//           }}
//         >
//           {/* Left Side - Brand */}
//           <Box sx={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             gap: { xs: 1.5, sm: 2 }, 
//             flexGrow: 1,
//             animation: 'slideInLeft 0.8s ease-out',
//             '@keyframes slideInLeft': {
//               '0%': {
//                 opacity: 0,
//                 transform: 'translateX(-30px)',
//               },
//               '100%': {
//                 opacity: 1,
//                 transform: 'translateX(0)',
//               },
//             },
//           }}>
//             {/* Brand Logo */}
//             <Box
//               sx={{
//                 width: { xs: 40, sm: 44, md: 48 },
//                 height: { xs: 40, sm: 44, md: 48 },
//                 borderRadius: 2,
//                 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
//                 backdropFilter: 'blur(10px)',
//                 border: '1px solid rgba(255, 255, 255, 0.2)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 position: 'relative',
//                 overflow: 'hidden',
//                 transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//                 animation: 'logoPulse 3s ease-in-out infinite',
//                 '&:hover': {
//                   transform: 'scale(1.05) rotate(5deg)',
//                   boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)',
//                 },
//                 '@keyframes logoPulse': {
//                   '0%, 100%': { 
//                     boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1)',
//                   },
//                   '50%': { 
//                     boxShadow: '0 6px 20px rgba(255, 255, 255, 0.2)',
//                   },
//                 },
//               }}
//             >
//               <AccessTime 
//                 sx={{ 
//                   color: 'white', 
//                   fontSize: { xs: 20, sm: 24, md: 28 },
//                   filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
//                 }} 
//               />
//             </Box>

//             {/* Brand Text */}
//             <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
//               <Typography 
//                 variant="h5" 
//                 component="div" 
//                 sx={{
//                   fontWeight: 700,
//                   background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)',
//                   backgroundClip: 'text',
//                   WebkitBackgroundClip: 'text',
//                   WebkitTextFillColor: 'transparent',
//                   letterSpacing: '-0.5px',
//                   fontSize: { sm: '1.3rem', md: '1.5rem' },
//                   lineHeight: 1.2,
//                   textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//                 }}
//               >
//                 VANAN
//               </Typography>
//               <Typography 
//                 variant="caption" 
//                 sx={{ 
//                   color: 'rgba(255, 255, 255, 0.8)',
//                   fontWeight: 500,
//                   fontSize: { sm: '0.7rem', md: '0.75rem' },
//                   letterSpacing: '0.5px',
//                   textTransform: 'uppercase',
//                   display: { xs: 'none', md: 'block' }
//                 }}
//               >
//                 Work Tracker
//               </Typography>
//             </Box>
//           </Box>

//           {/* Right Side - User Section */}
//           <Box sx={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             gap: { xs: 0.5, sm: 1, md: 2 },
//             animation: 'slideInRight 0.8s ease-out',
//             '@keyframes slideInRight': {
//               '0%': {
//                 opacity: 0,
//                 transform: 'translateX(30px)',
//               },
//               '100%': {
//                 opacity: 1,
//                 transform: 'translateX(0)',
//               },
//             },
//           }}>
//             {/* Admin Panel Icon - Only show for admins */}
//             {isAdmin && (
//               <Tooltip 
//                 title={showAdminPanel ? "Hide Admin Panel" : "Show Admin Panel"}
//                 arrow
//                 placement="bottom"
//               >
//                 <IconButton
//                   onClick={handleToggleAdminPanel}
//                   sx={{
//                     color: 'white',
//                     background: showAdminPanel 
//                       ? 'linear-gradient(135deg, rgba(156, 39, 176, 0.3) 0%, rgba(156, 39, 176, 0.2) 100%)'
//                       : 'rgba(255, 255, 255, 0.1)',
//                     backdropFilter: 'blur(10px)',
//                     border: showAdminPanel 
//                       ? '2px solid rgba(156, 39, 176, 0.5)'
//                       : '1px solid rgba(255, 255, 255, 0.2)',
//                     width: { xs: 36, sm: 40, md: 48 },
//                     height: { xs: 36, sm: 40, md: 48 },
//                     transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//                     position: 'relative',
//                     overflow: 'hidden',
//                     '&::before': {
//                       content: '""',
//                       position: 'absolute',
//                       top: 0,
//                       left: showAdminPanel ? 0 : '-100%',
//                       width: '100%',
//                       height: '100%',
//                       background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2) 0%, rgba(156, 39, 176, 0.3) 100%)',
//                       transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//                       zIndex: -1,
//                     },
//                     '&:hover': {
//                       background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.25) 0%, rgba(156, 39, 176, 0.15) 100%)',
//                       transform: 'translateY(-3px) scale(1.1)',
//                       boxShadow: '0 12px 35px rgba(156, 39, 176, 0.4)',
//                       borderColor: 'rgba(156, 39, 176, 0.6)',
//                       '&::before': {
//                         left: 0,
//                       },
//                     },
//                     '&:active': {
//                       transform: 'translateY(-1px) scale(1.05)',
//                     },
//                   }}
//                 >
//                   <AdminPanelSettings 
//                     sx={{ 
//                       fontSize: { xs: 18, sm: 20, md: 24 },
//                       filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
//                       animation: showAdminPanel ? 'adminSpin 0.6s ease-in-out' : 'none',
//                       '@keyframes adminSpin': {
//                         '0%': { transform: 'rotate(0deg)' },
//                         '100%': { transform: 'rotate(360deg)' },
//                       },
//                     }} 
//                   />
                  
//                   {/* Notification Badge for Admin */}
//                   <Box
//                     sx={{
//                       position: 'absolute',
//                       top: { xs: 4, sm: 5, md: 6 },
//                       right: { xs: 4, sm: 5, md: 6 },
//                       width: { xs: 6, sm: 7, md: 8 },
//                       height: { xs: 6, sm: 7, md: 8 },
//                       borderRadius: '50%',
//                       background: showAdminPanel 
//                         ? 'linear-gradient(135deg, #4caf50, #8bc34a)'
//                         : 'linear-gradient(135deg, #ff9800, #ffc107)',
//                       animation: 'adminPulse 2s ease-in-out infinite',
//                       '@keyframes adminPulse': {
//                         '0%, 100%': { 
//                           transform: 'scale(1)',
//                           boxShadow: '0 0 0 0 rgba(156, 39, 176, 0.7)',
//                         },
//                         '50%': { 
//                           transform: 'scale(1.3)',
//                           boxShadow: '0 0 0 4px rgba(156, 39, 176, 0)',
//                         },
//                       },
//                     }}
//                   />
//                 </IconButton>
//               </Tooltip>
//             )}

//             {/* User Info Card */}
//             <Box
//               sx={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: { xs: 1, sm: 1.5 },
//                 px: { xs: 1, sm: 1.5, md: 2 },
//                 py: { xs: 0.5, sm: 0.75, md: 1 },
//                 borderRadius: 3,
//                 background: 'rgba(255, 255, 255, 0.1)',
//                 backdropFilter: 'blur(10px)',
//                 border: '1px solid rgba(255, 255, 255, 0.2)',
//                 transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//                 cursor: 'pointer',
//                 '&:hover': {
//                   background: 'rgba(255, 255, 255, 0.15)',
//                   transform: 'translateY(-2px)',
//                   boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
//                 },
//               }}
//             >
//               {/* User Avatar */}
//               <Badge
//                 overlap="circular"
//                 anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//                 badgeContent={
//                   <Box
//                     sx={{
//                       width: { xs: 8, sm: 10, md: 12 },
//                       height: { xs: 8, sm: 10, md: 12 },
//                       borderRadius: '50%',
//                       background: 'linear-gradient(135deg, #4caf50, #8bc34a)',
//                       border: '2px solid white',
//                       animation: 'statusPulse 2s ease-in-out infinite',
//                       '@keyframes statusPulse': {
//                         '0%, 100%': { 
//                           transform: 'scale(1)',
//                           boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)',
//                         },
//                         '50%': { 
//                           transform: 'scale(1.1)',
//                           boxShadow: '0 0 0 4px rgba(76, 175, 80, 0)',
//                         },
//                       },
//                     }}
//                   />
//                 }
//               >
//                 <Avatar 
//                   sx={{ 
//                     bgcolor: isAdmin ? 'secondary.main' : 'primary.main',
//                     width: { xs: 32, sm: 36, md: 40 },
//                     height: { xs: 32, sm: 36, md: 40 },
//                     fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
//                     fontWeight: 600,
//                     border: '2px solid rgba(255, 255, 255, 0.3)',
//                     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
//                     transition: 'all 0.3s ease',
//                     '&:hover': {
//                       transform: 'scale(1.1)',
//                       boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
//                     }
//                   }}
//                 >
//                   <PersonOutline />
//                 </Avatar>
//               </Badge>

//               {/* User Details - Hidden on mobile */}
//               <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
//                 <Typography 
//                   variant="body2" 
//                   sx={{ 
//                     color: 'white',
//                     fontWeight: 600,
//                     fontSize: { sm: '0.85rem', md: '0.9rem' },
//                     lineHeight: 1.2,
//                     textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
//                   }}
//                 >
//                   {user?.username || 'User'}
//                 </Typography>
//                 <Typography 
//                   variant="caption" 
//                   sx={{ 
//                     color: 'rgba(255, 255, 255, 0.8)',
//                     fontSize: { sm: '0.7rem', md: '0.75rem' },
//                     fontWeight: 500,
//                     textTransform: 'capitalize',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: 0.5,
//                   }}
//                 >
//                   {isAdmin && (
//                     <Box
//                       sx={{
//                         width: 6,
//                         height: 6,
//                         borderRadius: '50%',
//                         background: 'linear-gradient(135deg, #ff9800, #ffc107)',
//                         animation: 'rolePulse 1.5s ease-in-out infinite',
//                         '@keyframes rolePulse': {
//                           '0%, 100%': { opacity: 1 },
//                           '50%': { opacity: 0.6 },
//                         },
//                       }}
//                     />
//                   )}
//                   {user?.role || 'user'}
//                 </Typography>
//               </Box>
//             </Box>

//             {/* Logout Button */}
//             <Tooltip title="Logout" arrow placement="bottom">
//               <IconButton
//                 onClick={handleLogout}
//                 sx={{
//                   color: 'white',
//                   background: 'rgba(244, 67, 54, 0.1)',
//                   backdropFilter: 'blur(10px)',
//                   border: '1px solid rgba(244, 67, 54, 0.3)',
//                   width: { xs: 36, sm: 40, md: 48 },
//                   height: { xs: 36, sm: 40, md: 48 },
//                   transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//                   position: 'relative',
//                   overflow: 'hidden',
//                   '&::before': {
//                     content: '""',
//                     position: 'absolute',
//                     top: 0,
//                     left: '-100%',
//                     width: '100%',
//                     height: '100%',
//                     background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(244, 67, 54, 0.3) 100%)',
//                     transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//                     zIndex: -1,
//                   },
//                   '&:hover': {
//                     background: 'rgba(244, 67, 54, 0.2)',
//                     transform: 'translateY(-3px) scale(1.1)',
//                     boxShadow: '0 12px 35px rgba(244, 67, 54, 0.4)',
//                     borderColor: 'rgba(244, 67, 54, 0.6)',
//                     '&::before': {
//                       left: 0,
//                     },
//                   },
//                   '&:active': {
//                     transform: 'translateY(-1px) scale(1.05)',
//                   },
//                 }}
//               >
//                 <LogoutOutlined 
//                   sx={{ 
//                     fontSize: { xs: 18, sm: 20, md: 24 },
//                     filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
//                   }} 
//                 />
//               </IconButton>
//             </Tooltip>
//           </Box>
//         </Toolbar>
//       </AppBar>

//       {/* Scrollable Content Area */}
//             {/* Scrollable Content Area - INCREASED WIDTH */}
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           height: `calc(100vh - ${appBarHeight.xs}px)`, // Mobile
//           [theme.breakpoints.up('sm')]: {
//             height: `calc(100vh - ${appBarHeight.sm}px)`, // Tablet
//           },
//           [theme.breakpoints.up('md')]: {
//             height: `calc(100vh - ${appBarHeight.md}px)`, // Desktop
//           },
//           overflow: 'auto',
//           position: 'relative',
//           background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
//           // INCREASED WIDTH - Remove default margins and padding
//           width: '100vw', // Full viewport width
//           margin: 0,
//           padding: 0,
//           // Custom scrollbar styling
//           '&::-webkit-scrollbar': {
//             width: { xs: 4, sm: 6, md: 8 },
//           },
//           '&::-webkit-scrollbar-track': {
//             background: 'rgba(0, 0, 0, 0.05)',
//             borderRadius: 10,
//           },
//           '&::-webkit-scrollbar-thumb': {
//             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//             borderRadius: 10,
//             border: '1px solid rgba(255, 255, 255, 0.2)',
//             '&:hover': {
//               background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
//             },
//           },
//           '&::-webkit-scrollbar-corner': {
//             background: 'transparent',
//           },
//         }}
//       >
//         {/* Content Container - MAXIMIZED WIDTH */}
//         <Container
//           maxWidth={false}
//           disableGutters // Remove default gutters for maximum width
//           sx={{
//             py: { xs: 1, sm: 2, md: 3 }, // Reduced vertical padding
//             px: { xs: 0.5, sm: 1, md: 1.5 }, // Minimal horizontal padding
//             // MAXIMUM WIDTH SETTINGS
//             maxWidth: '100% !important', // Force 100% width
//             width: '100%',
//             minWidth: '100%',
//             // Remove any width constraints
//             margin: 0,
//             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//             position: 'relative',
//             minHeight: '100%',
//             // Override MUI Container default max-widths
//             '&.MuiContainer-root': {
//               maxWidth: '100% !important',
//               paddingLeft: { xs: '4px', sm: '8px', md: '12px' },
//               paddingRight: { xs: '4px', sm: '8px', md: '12px' },
//             },
//           }}
//         >
//           {/* Background Pattern */}
//           <Box
//             sx={{
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               opacity: 0.03,
//               backgroundImage: `
//                 radial-gradient(circle at 25% 25%, #667eea 0%, transparent 50%),
//                 radial-gradient(circle at 75% 75%, #764ba2 0%, transparent 50%)
//               `,
//               pointerEvents: 'none',
//               zIndex: 0,
//             }}
//           />

//           {/* Main Content - FULL WIDTH */}
//           <Paper
//             elevation={0}
//             sx={{
//               position: 'relative',
//               zIndex: 1,
//               background: 'rgba(255, 255, 255, 0.9)',
//               backdropFilter: 'blur(20px)',
//               borderRadius: { xs: 1, sm: 2, md: 3 }, // Reduced border radius for more space
//               border: '1px solid rgba(255, 255, 255, 0.2)',
//               boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
//               overflow: 'hidden',
//               // FULL WIDTH AND HEIGHT
//               width: '100%',
//               minWidth: '100%',
//               minHeight: {
//                 xs: 'calc(100vh - 100px)', // Increased height
//                 sm: 'calc(100vh - 120px)',
//                 md: 'calc(100vh - 140px)',
//               },
//               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//               '&::before': {
//                 content: '""',
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 height: '2px',
//                 background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
//                 zIndex: 1,
//               },
//             }}
//           >
//             {/* Content Wrapper - MAXIMUM SPACE UTILIZATION */}
//             <Box
//               sx={{
//                 p: { xs: 0.5, sm: 1, md: 1.5, lg: 2 }, // Minimal padding for maximum space
//                 height: '100%',
//                 overflow: 'auto',
//                 position: 'relative',
//                 width: '100%',
//                 // Responsive content scaling
//                 '& .MuiTypography-h4': {
//                   fontSize: {
//                     xs: '1.5rem',
//                     sm: '1.75rem',
//                     md: '2rem',
//                     lg: '2.125rem',
//                   },
//                 },
//                 '& .MuiTypography-h5': {
//                   fontSize: {
//                     xs: '1.25rem',
//                     sm: '1.375rem',
//                     md: '1.5rem',
//                   },
//                 },
//                 '& .MuiTypography-h6': {
//                   fontSize: {
//                     xs: '1rem',
//                     sm: '1.125rem',
//                     md: '1.25rem',
//                   },
//                 },
//                 // Responsive button sizing
//                 '& .MuiButton-root': {
//                   fontSize: {
//                     xs: '0.8rem',
//                     sm: '0.875rem',
//                     md: '0.9rem',
//                   },
//                   padding: {
//                     xs: '6px 12px',
//                     sm: '8px 16px',
//                     md: '10px 20px',
//                   },
//                 },
//                 // Responsive card spacing - reduced for more space
//                 '& .MuiCard-root': {
//                   marginBottom: {
//                     xs: 1,
//                     sm: 2,
//                     md: 3,
//                   },
//                 },
//               }}
//             >
//               {/* TaskTimer Component - FULL WIDTH UTILIZATION */}
//               <Box
//                 sx={{
//                   width: '100%',
//                   maxWidth: '100%',
//                   overflow: 'visible',
//                   position: 'relative',
//                   // ENHANCED WIDTH FOR TASK TIMER
//                   minWidth: '100%',
//                   // Enhanced responsive behavior for TaskTimer
//                   '& .timer-container': {
//                     padding: {
//                       xs: '4px',
//                       sm: '8px',
//                       md: '12px',
//                       lg: '16px',
//                     },
//                     width: '100%',
//                     maxWidth: '100%',
//                   },
//                   // Admin panel responsive adjustments - FULL WIDTH
//                   '& .admin-panel': {
//                     width: '100% !important',
//                     maxWidth: '100% !important',
//                     minWidth: '100%',
//                     transform: 'none', // Remove scaling to preserve full width
//                     transformOrigin: 'top left',
//                     transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//                   },
//                   // Table responsive adjustments - FULL WIDTH
//                   '& .MuiTableContainer-root': {
//                     width: '100%',
//                     maxWidth: '100%',
//                     minWidth: '100%',
//                     overflowX: 'auto',
//                     '&::-webkit-scrollbar': {
//                       height: { xs: 4, sm: 6 },
//                     },
//                     '&::-webkit-scrollbar-track': {
//                       background: 'rgba(0, 0, 0, 0.05)',
//                     },
//                     '&::-webkit-scrollbar-thumb': {
//                       background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
//                       borderRadius: 3,
//                     },
//                   },
//                   // Card responsive adjustments - FULL WIDTH
//                   '& .MuiCard-root': {
//                     width: '100%',
//                     maxWidth: '100%',
//                     borderRadius: {
//                       xs: 1,
//                       sm: 2,
//                       md: 3,
//                     },
//                     boxShadow: {
//                       xs: '0 4px 12px rgba(0, 0, 0, 0.1)',
//                       sm: '0 8px 24px rgba(0, 0, 0, 0.1)',
//                       md: '0 12px 36px rgba(0, 0, 0, 0.1)',
//                     },
//                   },
//                   // Button group responsive adjustments
//                   '& .button-group': {
//                     flexDirection: {
//                       xs: 'column',
//                       sm: 'row',
//                     },
//                     gap: {
//                       xs: 1,
//                       sm: 2,
//                       md: 3,
//                     },
//                     width: '100%',
//                   },
//                   // Form responsive adjustments - FULL WIDTH
//                   '& .MuiTextField-root': {
//                     marginBottom: {
//                       xs: 1,
//                       sm: 2,
//                     },
//                     width: '100%',
//                   },
//                   // Dialog responsive adjustments - MAXIMUM WIDTH
//                   '& .MuiDialog-paper': {
//                     margin: {
//                       xs: 0.5,
//                       sm: 1,
//                       md: 1.5,
//                     },
//                     maxWidth: {
//                       xs: 'calc(100vw - 8px)',
//                       sm: 'calc(100vw - 16px)',
//                       md: 'calc(100vw - 32px)',
//                       lg: 'calc(100vw - 64px)',
//                       xl: 'calc(100vw - 128px)',
//                     },
//                     width: {
//                       xs: 'calc(100vw - 8px)',
//                       sm: 'calc(100vw - 16px)',
//                       md: 'calc(100vw - 32px)',
//                       lg: 'calc(100vw - 64px)',
//                       xl: 'calc(100vw - 128px)',
//                     },
//                   },
//                   // GRID AND LAYOUT ADJUSTMENTS FOR MAXIMUM WIDTH
//                   '& .MuiGrid-container': {
//                     width: '100%',
//                     maxWidth: '100%',
//                     margin: 0,
//                   },
//                   '& .MuiGrid-item': {
//                     paddingLeft: { xs: '2px', sm: '4px', md: '6px' },
//                     paddingTop: { xs: '2px', sm: '4px', md: '6px' },
//                   },
//                   // CONTAINER ADJUSTMENTS
//                   '& .MuiContainer-root': {
//                     maxWidth: '100% !important',
//                     width: '100%',
//                     paddingLeft: { xs: '2px', sm: '4px', md: '8px' },
//                     paddingRight: { xs: '2px', sm: '4px', md: '8px' },
//                   },
//                 }}
//               >
//                 <TaskTimer
//                   showAdminPanelFromAppBar={showAdminPanel}
//                   onToggleAdminPanelFromAppBar={handleToggleAdminPanel}
//                 />
//               </Box>
//             </Box>
//           </Paper>
//         </Container>

//         {/* Floating Action Button for Mobile Admin Toggle */}
//         {isAdmin && isMobile && (
//           <Box
//             sx={{
//               position: 'fixed',
//               bottom: 20,
//               right: 20,
//               zIndex: theme.zIndex.fab,
//             }}
//           >
//             <Tooltip title={showAdminPanel ? "Hide Admin Panel" : "Show Admin Panel"} arrow>
//               <IconButton
//                 onClick={handleToggleAdminPanel}
//                 sx={{
//                   width: 56,
//                   height: 56,
//                   background: showAdminPanel 
//                     ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
//                     : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
//                   color: 'white',
//                   boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
//                   backdropFilter: 'blur(10px)',
//                   border: '2px solid rgba(255, 255, 255, 0.2)',
//                   transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//                   animation: 'fabPulse 3s ease-in-out infinite',
//                   '&:hover': {
//                     transform: 'scale(1.1) translateY(-3px)',
//                     boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
//                     background: showAdminPanel 
//                       ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
//                       : 'linear-gradient(135deg, #ff8a80 0%, #f8bbd9 100%)',
//                   },
//                   '&:active': {
//                     transform: 'scale(1.05) translateY(-1px)',
//                   },
//                   '@keyframes fabPulse': {
//                     '0%, 100%': { 
//                       boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
//                     },
//                     '50%': { 
//                       boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
//                     },
//                   },
//                 }}
//               >
//                 <AdminPanelSettings 
//                   sx={{ 
//                     fontSize: 28,
//                     filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
//                     animation: showAdminPanel ? 'fabSpin 0.6s ease-in-out' : 'none',
//                     '@keyframes fabSpin': {
//                       '0%': { transform: 'rotate(0deg)' },
//                       '100%': { transform: 'rotate(360deg)' },
//                     },
//                   }} 
//                 />
                
//                 {/* Notification Ring */}
//                 <Box
//                   sx={{
//                                        position: 'absolute',
//                     top: -2,
//                     right: -2,
//                     width: 16,
//                     height: 16,
//                     borderRadius: '50%',
//                     background: showAdminPanel 
//                       ? 'linear-gradient(135deg, #4caf50, #8bc34a)'
//                       : 'linear-gradient(135deg, #ff9800, #ffc107)',
//                     border: '2px solid white',
//                     animation: 'fabNotification 2s ease-in-out infinite',
//                     '@keyframes fabNotification': {
//                       '0%, 100%': { 
//                         transform: 'scale(1)',
//                         opacity: 1,
//                       },
//                       '50%': { 
//                         transform: 'scale(1.2)',
//                         opacity: 0.8,
//                       },
//                     },
//                   }}
//                 />
//               </IconButton>
//             </Tooltip>
//           </Box>
//         )}

//         {/* Scroll to Top Button */}
//         <Box
//           sx={{
//             position: 'fixed',
//             bottom: isMobile && isAdmin ? 90 : 20,
//             left: 20,
//             zIndex: theme.zIndex.fab - 1,
//           }}
//         >
//           <IconButton
//             onClick={() => {
//               const mainContent = document.querySelector('main');
//               if (mainContent) {
//                 mainContent.scrollTo({ top: 0, behavior: 'smooth' });
//               }
//             }}
//             sx={{
//               width: { xs: 45, sm: 50 },
//               height: { xs: 45, sm: 50 },
//               background: 'rgba(255, 255, 255, 0.9)',
//               backdropFilter: 'blur(10px)',
//               border: '1px solid rgba(0, 0, 0, 0.1)',
//               color: 'primary.main',
//               boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
//               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//               opacity: 0.7,
//               '&:hover': {
//                 opacity: 1,
//                 transform: 'translateY(-3px) scale(1.05)',
//                 boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
//                 background: 'rgba(255, 255, 255, 0.95)',
//               },
//             }}
//           >
//             <Box
//               sx={{
//                 transform: 'rotate(-90deg)',
//                 fontSize: { xs: 20, sm: 24 },
//               }}
//             >
//               ➤
//             </Box>
//           </IconButton>
//         </Box>
//       </Box>

//       {/* Loading Overlay for Smooth Transitions */}
//       <Collapse in={false}>
//         <Box
//           sx={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: 'rgba(255, 255, 255, 0.9)',
//             backdropFilter: 'blur(10px)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             zIndex: theme.zIndex.modal + 1,
//           }}
//         >
//           <Box
//             sx={{
//               width: 60,
//               height: 60,
//               border: '4px solid rgba(102, 126, 234, 0.2)',
//               borderTop: '4px solid #667eea',
//               borderRadius: '50%',
//               animation: 'loadingSpin 1s linear infinite',
//               '@keyframes loadingSpin': {
//                 '0%': { transform: 'rotate(0deg)' },
//                 '100%': { transform: 'rotate(360deg)' },
//               },
//             }}
//           />
//         </Box>
//       </Collapse>
//     </Box>
//   );
// };

// export default Dashboard;
