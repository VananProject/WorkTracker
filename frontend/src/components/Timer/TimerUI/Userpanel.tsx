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
  Person,
  Dashboard,
  Pause,
  PlayArrow,
  Refresh,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import UserAnalyticsDialog from './userpanel Dashboard/UserAnalyticsDialog';
import UserProfileDialog from './userpanel Dashboard/UserProfileDialog';
import UserQuickActions from './userpanel Dashboard/UserQuickActions';
import UserRecentActivity from './userpanel Dashboard/UserRecentActivity';
import UserStatisticsCards from './userpanel Dashboard/UserStatisticsCards';


interface UserPanelProps {
  userTasks: any[];
  currentUser: any;
  onCreateTask: () => void;
  onRefresh?: () => void;
}

const UserPanel: React.FC<UserPanelProps> = ({
  userTasks,
  currentUser,
  onCreateTask,
  onRefresh
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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

  // Calculate user-specific statistics
  const stats = useMemo(() => {
    const totalTasks = userTasks.length;
    const activeTasks = userTasks.filter(t => ['started', 'paused', 'resumed'].includes(t.status));
    const completedTasks = userTasks.filter(t => t.status === 'ended');
    const pausedTasks = userTasks.filter(t => t.status === 'paused');
    const assignedTasks = userTasks.filter(t => t.isAssigned);
    const totalHours = Math.round(userTasks.reduce((sum, task) => sum + (task.totalDuration || 0), 0) / 3600 * 10) / 10;

    // Task categorization by duration (in minutes)
    const microTasks = userTasks.filter(task => {
      const durationMinutes = (task.totalDuration || 0) / 60;
      return durationMinutes > 0 && durationMinutes < 7;
    });

    const mediumTasks = userTasks.filter(task => {
      const durationMinutes = (task.totalDuration || 0) / 60;
      return durationMinutes >= 7 && durationMinutes <= 17;
    });

    const largeTasks = userTasks.filter(task => {
      const durationMinutes = (task.totalDuration || 0) / 60;
      return durationMinutes > 17;
    });

    // Task categorization by work type
    const taskWork = userTasks.filter(task => task.type === 'task' || !task.type);
    const meetingWork = userTasks.filter(task => task.type === 'meeting');

    // Productivity metrics
    const todayTasks = userTasks.filter(task => {
      const today = new Date().toDateString();
      return new Date(task.startDate).toDateString() === today;
    });

    const thisWeekTasks = userTasks.filter(task => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(task.startDate) >= weekAgo;
    });

    return {
      // Basic stats
      totalTasks,
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      pausedTasks: pausedTasks.length,
      assignedTasks: assignedTasks.length,
      totalHours,
      completionRate: totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0,
      
      // Duration-based categorization
      microTasks: microTasks.length,
      mediumTasks: mediumTasks.length,
      largeTasks: largeTasks.length,
      
      // Work type categorization
      taskWork: taskWork.length,
      meetingWork: meetingWork.length,
      
      // Productivity metrics
      todayTasks: todayTasks.length,
      thisWeekTasks: thisWeekTasks.length,
      
      // Additional data
      activeTasksData: activeTasks,
      recentTasks: userTasks.slice(-10).reverse()
    };
  }, [userTasks]);

  // Chart data preparation
  const pieChartData = [
    { name: 'Completed', value: stats.completedTasks, color: theme.palette.success.main },
    { name: 'Active', value: stats.activeTasks, color: theme.palette.primary.main },
    { name: 'Paused', value: stats.pausedTasks, color: theme.palette.warning.main }
  ].filter(item => item.value > 0);

  const barChartData = [
    { type: 'Tasks', count: stats.taskWork, fill: theme.palette.primary.main },
    { type: 'Meetings', count: stats.meetingWork, fill: theme.palette.secondary.main }
  ];

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
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: { xs: 44, sm: 52 },
                height: { xs: 44, sm: 52 },
                mr: { xs: 0, sm: 2 },
                mb: { xs: 1, sm: 0 }
              }}
            >
              <Person sx={{ fontSize: { xs: 24, sm: 28 } }} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                fontWeight="bold"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                My Dashboard
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  maxWidth: { xs: '100%', sm: '400px' }
                }}
              >
                Welcome back, {currentUser?.username}! Track your productivity and manage your tasks.
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: { xs: 2, sm: 0 }
            }}>
              <Chip
                icon={<Dashboard />}
                label="User Panel"
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              />
              <Tooltip title="Refresh Dashboard">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleRefresh}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

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
                    <UserQuickActions
                      onCreateTask={onCreateTask}
                      onShowAnalytics={() => setShowAnalytics(true)}
                      onShowProfile={() => setShowProfile(true)}
                      onRefresh={handleRefresh}
                      activeTasks={stats.activeTasks}
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
                      My Statistics
                    </Typography>
                    {expandedSection === 'stats' ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                </Box>
                <Collapse in={expandedSection === 'stats'}>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <UserStatisticsCards stats={stats} />
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
                      <UserRecentActivity recentTasks={stats.recentTasks} />
                    </Box>
                  </Collapse>
                </Paper>
              )}
            </Box>
          ) : (
            /* Desktop/Tablet Layout */
            <Box>
              {/* Statistics Section */}
              <UserStatisticsCards stats={stats} />

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
                  <UserQuickActions
                    onCreateTask={onCreateTask}
                    onShowAnalytics={() => setShowAnalytics(true)}
                    onShowProfile={() => setShowProfile(true)}
                    onRefresh={handleRefresh}
                    activeTasks={stats.activeTasks}
                  />
                </Box>

                {/* Recent Activity */}
                <Box>
                  <UserRecentActivity recentTasks={stats.recentTasks} />
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
      <UserAnalyticsDialog
        open={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        pieChartData={pieChartData}
        barChartData={barChartData}
        userStats={stats}
        currentUser={currentUser}
      />

      {/* Profile Dialog */}
      <UserProfileDialog
        open={showProfile}
        onClose={() => setShowProfile(false)}
        currentUser={currentUser}
        userStats={stats}
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

export default UserPanel;

