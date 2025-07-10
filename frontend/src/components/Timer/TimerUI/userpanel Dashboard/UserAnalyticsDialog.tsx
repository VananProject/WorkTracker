import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Close,
  Analytics,
  AccessTime,
  TrendingUp,
  Assignment,
  CheckCircle
} from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

interface UserAnalyticsDialogProps {
  open: boolean;
  onClose: () => void;
  pieChartData: any[];
  barChartData: any[];
  userStats: any;
  currentUser: any;
}

const UserAnalyticsDialog: React.FC<UserAnalyticsDialogProps> = ({
  open,
  onClose,
  pieChartData,
  barChartData,
  userStats,
  currentUser
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Sample productivity data for the week
  const weeklyData = [
    { day: 'Mon', hours: 6.5, tasks: 4 },
    { day: 'Tue', hours: 7.2, tasks: 5 },
    { day: 'Wed', hours: 5.8, tasks: 3 },
    { day: 'Thu', hours: 8.1, tasks: 6 },
    { day: 'Fri', hours: 7.5, tasks: 5 },
    { day: 'Sat', hours: 3.2, tasks: 2 },
    { day: 'Sun', hours: 2.1, tasks: 1 }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Analytics sx={{ mr: 1, color: 'primary.main' }} />
          <Typography 
            variant="h6"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            My Analytics Dashboard
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={3}>
          {/* Performance Overview Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Assignment color="primary" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {userStats.totalTasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Tasks
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <CheckCircle color="success" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {userStats.completedTasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <AccessTime color="info" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {userStats.totalHours}h
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Hours
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <TrendingUp color="warning" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {userStats.completionRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Task Status Distribution */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: { xs: 2, sm: 2.5 }, 
                height: { xs: 280, sm: 320 },
                borderRadius: 2
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Task Status Distribution
              </Typography>
              <Box sx={{ height: { xs: 220, sm: 260 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 30 : 40}
                      outerRadius={isMobile ? 60 : 80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Work Types */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: { xs: 2, sm: 2.5 }, 
                height: { xs: 280, sm: 320 },
                borderRadius: 2
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem',                sm: '1.25rem' } }}
              >
                Work Types
              </Typography>
              <Box sx={{ height: { xs: 220, sm: 260 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="type" 
                      fontSize={isMobile ? 10 : 12}
                    />
                    <YAxis fontSize={isMobile ? 10 : 12} />
                    <RechartsTooltip />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Weekly Productivity Trend */}
          <Grid item xs={12}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Weekly Productivity Trend
              </Typography>
              <Box sx={{ height: { xs: 250, sm: 300 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" fontSize={isMobile ? 10 : 12} />
                    <YAxis fontSize={isMobile ? 10 : 12} />
                    <RechartsTooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="hours" 
                      stackId="1"
                      stroke={theme.palette.primary.main}
                      fill={theme.palette.primary.main}
                      fillOpacity={0.6}
                      name="Hours Worked"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tasks" 
                      stroke={theme.palette.secondary.main}
                      strokeWidth={3}
                      name="Tasks Completed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Progress Indicators */}
          <Grid item xs={12}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Progress Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="600">
                        Task Completion Rate
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userStats.completionRate}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={userStats.completionRate} 
                      sx={{ height: 8, borderRadius: 4 }}
                      color="success"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="600">
                        Weekly Goal Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.min(Math.round((userStats.totalHours / 40) * 100), 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(Math.round((userStats.totalHours / 40) * 100), 100)} 
                      sx={{ height: 8, borderRadius: 4 }}
                      color="primary"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="600">
                        Active Tasks Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userStats.activeTasks > 0 ? Math.round((userStats.activeTasks / userStats.totalTasks) * 100) : 0}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={userStats.activeTasks > 0 ? Math.round((userStats.activeTasks / userStats.totalTasks) * 100) : 0} 
                      sx={{ height: 8, borderRadius: 4 }}
                      color="warning"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="600">
                        Productivity Score
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.min(Math.round((userStats.completionRate + (userStats.totalHours * 2)) / 3), 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(Math.round((userStats.completionRate + (userStats.totalHours * 2)) / 3), 100)} 
                      sx={{ height: 8, borderRadius: 4 }}
                      color="info"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default UserAnalyticsDialog;

