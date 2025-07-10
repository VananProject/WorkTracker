import React from 'react';
import {
  Grid,
  Paper,
  Box,
  Avatar,
  Typography,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  People,
  Task,
  PlayArrow,
  CheckCircle,
  AssignmentTurnedIn,
  Schedule,
  TrendingUp,
  Timer,
  AccessTime,
  Work,
  MeetingRoom
} from '@mui/icons-material';

interface StatisticsCardsProps {
  stats: {
    totalUsers: number;
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    assignedTasks: number;
    totalHours: number;
    microTasks: number;
    mediumTasks: number;
    largeTasks: number;
    taskWork: number;
    meetingWork: number;
  };
  onUserClick?: () => void;
  onTaskClick?: () => void;
  onMicroTaskClick?: () => void;
  onMediumTaskClick?: () => void;
  onLargeTaskClick?: () => void;
  onTaskWorkClick?: () => void;
  onMeetingWorkClick?: () => void;
}

const StatCard = ({ icon, title, value, color, subtitle, onClick }: any) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Paper
      elevation={2}
      onClick={onClick}
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        height: { xs: '130px', sm: '150px', md: '170px' },
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden', // Prevent any overflow from the card
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
          borderColor: alpha(color, 0.3)
        } : {}
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        gap: { xs: 0.5, sm: 1, md: 1.5 },
        height: '100%',
        justifyContent: 'center'
      }}>
        <Avatar
          sx={{
            bgcolor: color,
            width: { xs: 28, sm: 36, md: 44 },
            height: { xs: 28, sm: 36, md: 44 },
            flexShrink: 0
          }}
        >
          {icon}
        </Avatar>
        
        <Box sx={{ 
          flexGrow: 1, 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden' // Contain text within this box
        }}>
          {/* Value */}
          <Typography 
            variant={isMobile ? "h6" : isTablet ? "h5" : "h4"} 
            fontWeight="bold" 
            color={color}
            sx={{ 
              lineHeight: 1.1,
              fontSize: { 
                xs: '1.1rem', 
                sm: '1.3rem', 
                md: '1.5rem'
              },
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {value || title}
          </Typography>
          
          {/* Title */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
              fontWeight: 500,
              lineHeight: 1.2,
              mb: subtitle ? 0.3 : 0,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2, // Allow up to 2 lines
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word'
            }}
          >
            {value ? title : ''}
          </Typography>
          
          {/* Subtitle */}
          {subtitle && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' },
                lineHeight: 1.1,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 1, // Single line for subtitle
                WebkitBoxOrient: 'vertical',
                wordBreak: 'break-word'
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ 
  stats, 
  onUserClick, 
  onTaskClick,
  onMicroTaskClick,
  onMediumTaskClick,
  onLargeTaskClick,
  onTaskWorkClick,
  onMeetingWorkClick
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="h6" 
        fontWeight="600" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}
      >
        <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
        System Statistics
      </Typography>

      <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
        {/* Row 1: Basic Stats */}
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<People />}
            title="Users"
            value={stats.totalUsers}
            color={theme.palette.primary.main}
            subtitle="Registered"
            onClick={onUserClick}
          />
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<Task />}
            title="Tasks"
            value={stats.totalTasks}
            color={theme.palette.info.main}
            subtitle="All time"
            onClick={onTaskClick}
          />
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<PlayArrow />}
            title="Active"
            value={stats.activeTasks}
            color={theme.palette.success.main}
            subtitle="Running"
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<CheckCircle />}
            title="Done"
            value={stats.completedTasks}
            color={theme.palette.secondary.main}
            subtitle="Finished"
          />
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<AssignmentTurnedIn />}
            title="Assigned"
            value={stats.assignedTasks}
            color={theme.palette.warning.main}
            subtitle="By admin"
          />
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<Schedule />}
            title="Hours"
            value={`${stats.totalHours}h`}
            color={theme.palette.error.main}
            subtitle="Total"
          />
        </Grid>

        {/* Row 2: Task Duration Categories */}
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<Timer />}
            title="Micro"
            value={stats.microTasks}
            color={theme.palette.success.light}
            subtitle="< 7 min"
            onClick={onMicroTaskClick}
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<AccessTime />}
            title="Medium"
            value={stats.mediumTasks}
            color={theme.palette.warning.light}
            subtitle="7-17 min"
            onClick={onMediumTaskClick}
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<Schedule />}
            title="Large"
            value={stats.largeTasks}
            color={theme.palette.error.light}
            subtitle="> 17 min"
            onClick={onLargeTaskClick}
          />
        </Grid>

        {/* Row 3: Work Type Categories */}
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<Work />}
            title="Tasks"
            value={stats.taskWork}
            color={theme.palette.primary.light}
            subtitle="Regular"
            onClick={onTaskWorkClick}
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<MeetingRoom />}
            title="Meetings"
            value={stats.meetingWork}
            color={theme.palette.secondary.light}
            subtitle="Sessions"
            onClick={onMeetingWorkClick}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatisticsCards;
