import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  useMediaQuery,
  Collapse,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import {
  AdminPanelSettings,
  Dashboard,
  Pause,
  PlayArrow,
  Refresh,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import AnalyticsDialog from './Adminpanel Dashboard/AnalyticsDialog';
import QuickActions from './Adminpanel Dashboard/QuickActions';
import RecentActivity from './Adminpanel Dashboard/RecentActivity';
import StatisticsCards from './Adminpanel Dashboard/StatisticsCards';
import UserManagementDialog from './Adminpanel Dashboard/UserManagementDialog';

interface AdminPanelProps {
  users: any[];
  allTasks: any[];
  onShowAssignDialog: () => void;
  onRefresh?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  allTasks,
  onShowAssignDialog,
  onRefresh
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalTasks = allTasks.length;
    const activeTasks = allTasks.filter(t => ['started', 'paused', 'resumed'].includes(t.status));
    const completedTasks = allTasks.filter(t => t.status === 'ended');
    const assignedTasks = allTasks.filter(t => t.isAssigned);
    const pausedTasks = allTasks.filter(t => t.status === 'paused');
    const totalHours = Math.round(allTasks.reduce((sum, task) => sum + (task.totalDuration || 0), 0) / 3600 * 10) / 10;

    // Task categorization by duration (in minutes)
    const microTasks = allTasks.filter(task => {
      const durationMinutes = (task.totalDuration || 0) / 60;
      return durationMinutes > 0 && durationMinutes < 7;
    });

    const mediumTasks = allTasks.filter(task => {
      const durationMinutes = (task.totalDuration || 0) / 60;
      return durationMinutes >= 7 && durationMinutes <= 17;
    });

    const largeTasks = allTasks.filter(task => {
      const durationMinutes = (task.totalDuration || 0) / 60;
      return durationMinutes > 17;
    });

    // Task categorization by work type
    const taskWork = allTasks.filter(task => task.type === 'task' || !task.type);
    const meetingWork = allTasks.filter(task => task.type === 'meeting');

    // Task distribution by type
    const taskTypes = allTasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // User productivity
    const userProductivity = users.map(user => {
      const userTasks = allTasks.filter(task =>
        task.userEmail === user.email || task.assignedToEmail === user.email
      );
      const completedUserTasks = userTasks.filter(task => task.status === 'ended');
      const totalTime = userTasks.reduce((sum, task) => sum + (task.totalDuration || 0), 0);

      return {
        ...user,
        taskCount: userTasks.length,
        completedTasks: completedUserTasks.length,
        totalTime: Math.round(totalTime / 3600 * 10) / 10,
        completionRate: userTasks.length > 0 ? Math.round((completedUserTasks.length / userTasks.length) * 100) : 0
      };
    });

    return {
      // Basic stats
      totalUsers,
      totalTasks,
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      assignedTasks: assignedTasks.length,
      pausedTasks: pausedTasks.length,
      totalHours,
      completionRate: totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0,
      
      // Duration-based categorization (required by StatisticsCards)
      microTasks: microTasks.length,
      mediumTasks: mediumTasks.length,
      largeTasks: largeTasks.length,
      
      // Work type categorization (required by StatisticsCards)
      taskWork: taskWork.length,
      meetingWork: meetingWork.length,
      
      // Additional data for other components
      taskTypes,
      userProductivity,
      activeTasksData: activeTasks,
      recentTasks: allTasks.slice(-10).reverse()
    };
  }, [users, allTasks]);

  // Chart data preparation
  const pieChartData = [
    { name: 'Completed', value: stats.completedTasks, color: theme.palette.success.main },
    { name: 'Active', value: stats.activeTasks, color: theme.palette.primary.main },
    { name: 'Paused', value: stats.pausedTasks, color: theme.palette.warning.main },
    { name: 'Assigned', value: stats.assignedTasks, color: theme.palette.info.main }
  ].filter(item => item.value > 0);

  const barChartData = Object.entries(stats.taskTypes).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
    fill: type === 'task' ? theme.palette.primary.main : theme.palette.secondary.main
  }));

  const handleRefresh = async () => {
    try {
      if (onRefresh) {
        await onRefresh();
        setNotification({
          open: true,
          message: 'Data refreshed successfully!',
          severity: 'success'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to refresh data',
        severity: 'error'
      });
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Handler functions for StatisticsCards
  const handleMicroTaskClick = () => {
    console.log('Show micro tasks (< 7 min)');
    // You can implement navigation or filtering logic here
  };

  const handleMediumTaskClick = () => {
    console.log('Show medium tasks (7-17 min)');
    // You can implement navigation or filtering logic here
  };

  const handleLargeTaskClick = () => {
    console.log('Show large tasks (> 17 min)');
    // You can implement navigation or filtering logic here
  };

  const handleTaskWorkClick = () => {
    console.log('Show task work activities');
    // You can implement navigation or filtering logic here
  };

  const handleMeetingWorkClick = () => {
    console.log('Show meeting work activities');
    // You can implement navigation or filtering logic here
  };

  return (
    <>
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: theme.shadows[3],
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header */}
      

          {/* Mobile Collapsible Layout */}
          {isMobile ? (
            <Box>
              {/* Quick Actions Mobile */}
              <Paper elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
                <Box
                  sx={{ p: 2, cursor: 'pointer' }}
                  onClick={() => toggleSection('actions')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="600">
                      Quick Actions
                    </Typography>
                    {expandedSection === 'actions' ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                </Box>
                <Collapse in={expandedSection === 'actions'}>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <QuickActions
                      onAssignTask={onShowAssignDialog}
                      onShowAnalytics={() => setShowAnalytics(true)}
                      onShowUserManagement={() => setShowUserManagement(true)}
                      onRefresh={handleRefresh}
                      totalUsers={stats.totalUsers}
                    />
                  </Box>
                </Collapse>
              </Paper>

              {/* Statistics Mobile */}
              <Paper elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
                <Box
                  sx={{ p: 2, cursor: 'pointer' }}
                  onClick={() => toggleSection('stats')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="600">
                      Statistics
                    </Typography>
                    {expandedSection === 'stats' ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                </Box>
                <Collapse in={expandedSection === 'stats'}>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <StatisticsCards
                      stats={stats}
                      onUserClick={() => setShowUserManagement(true)}
                      onTaskClick={() => setShowAnalytics(true)}
                      onMicroTaskClick={handleMicroTaskClick}
                      onMediumTaskClick={handleMediumTaskClick}
                      onLargeTaskClick={handleLargeTaskClick}
                      onTaskWorkClick={handleTaskWorkClick}
                      onMeetingWorkClick={handleMeetingWorkClick}
                    />
                  </Box>
                </Collapse>
              </Paper>

              {/* Recent Activity Mobile */}
              {stats.recentTasks.length > 0 && (
                <Paper elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
                  <Box
                    sx={{ p: 2, cursor: 'pointer' }}
                    onClick={() => toggleSection('activity')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight="600">
                        Recent Activity
                      </Typography>
                      {expandedSection === 'activity' ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  </Box>
                  <Collapse in={expandedSection === 'activity'}>
                                        <Box sx={{ px: 2, pb: 2 }}>
                      <RecentActivity recentTasks={stats.recentTasks} />
                    </Box>
                  </Collapse>
                </Paper>
              )}
            </Box>
          ) : (
            /* Desktop/Tablet Layout */
            <Box>
              {/* Statistics Section */}
              <StatisticsCards
                stats={stats}
                onUserClick={() => setShowUserManagement(true)}
                onTaskClick={() => setShowAnalytics(true)}
                onMicroTaskClick={handleMicroTaskClick}
                onMediumTaskClick={handleMediumTaskClick}
                onLargeTaskClick={handleLargeTaskClick}
                onTaskWorkClick={handleTaskWorkClick}
                onMeetingWorkClick={handleMeetingWorkClick}
              />

              {/* Main Content Grid */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                  sm: '1fr',
                  md: '300px 1fr',
                  lg: '320px 1fr'
                },
                gap: 3,
                mt: 3
              }}>
                {/* Quick Actions Sidebar */}
                <Box>
                  <QuickActions
                    onAssignTask={onShowAssignDialog}
                    onShowAnalytics={() => setShowAnalytics(true)}
                    onShowUserManagement={() => setShowUserManagement(true)}
                    onRefresh={handleRefresh}
                    totalUsers={stats.totalUsers}
                  />
                </Box>

                {/* Recent Activity */}
                <Box>
                  <RecentActivity recentTasks={stats.recentTasks} />
                </Box>
              </Box>
            </Box>
          )}

          {/* Summary Section */}
          <Box sx={{
            mt: 4,
            pt: 3,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}>
                {stats.pausedTasks > 0 && (
                  <Chip
                    icon={<Pause />}
                    label={`${stats.pausedTasks} Paused`}
                    color="warning"
                    size="small"
                    variant="outlined"
                  />
                )}
                <Chip
                  label={`${stats.completionRate}% Complete`}
                  color="success"
                  size="small"
                  variant="outlined"
                />
                {stats.activeTasks > 0 && (
                  <Chip
                    icon={<PlayArrow />}
                    label={`${stats.activeTasks} Running`}
                    color="primary"
                    size="small"
                    variant="filled"
                  />
                )}
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  textAlign: { xs: 'center', sm: 'right' }
                }}
              >
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Analytics Dialog */}
      <AnalyticsDialog
        open={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        pieChartData={pieChartData}
        barChartData={barChartData}
        userProductivity={stats.userProductivity}
      />

      {/* User Management Dialog */}
      <UserManagementDialog
        open={showUserManagement}
        onClose={() => setShowUserManagement(false)}
        userProductivity={stats.userProductivity}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(AdminPanel);

