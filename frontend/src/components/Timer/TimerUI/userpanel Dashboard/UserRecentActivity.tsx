import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import {
  CheckCircle,
  PlayArrow,
  Pause,
  AccessTime,
  Assignment
} from '@mui/icons-material';

interface UserRecentActivityProps {
  recentTasks: any[];
  maxItems?: number;
}

const UserRecentActivity: React.FC<UserRecentActivityProps> = ({ 
  recentTasks, 
  maxItems = 5 
}) => {
  const theme = useTheme();

  if (!recentTasks.length) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography 
          variant="h6" 
          fontWeight="600" 
          sx={{ 
            mb: 2,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          Recent Activity
        </Typography>
        <Paper 
          elevation={1} 
          sx={{ 
            borderRadius: 2,
            p: 3,
            textAlign: 'center'
          }}
        >
          <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No recent activity found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start working on tasks to see your activity here
          </Typography>
        </Paper>
      </Box>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ended':
        return <CheckCircle />;
      case 'paused':
        return <Pause />;
      default:
        return <PlayArrow />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ended':
        return 'success.main';
      case 'paused':
        return 'warning.main';
      default:
        return 'primary.main';
    }
  };

  const tasksToShow = recentTasks.slice(0, maxItems);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography 
        variant="h6" 
        fontWeight="600" 
        sx={{ 
          mb: 2,
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}
      >
        Recent Activity
      </Typography>
      <Paper 
        elevation={1} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          maxHeight: maxItems <= 3 ? 'auto' : '270px'
        }}
      >
        <Box
          sx={{
            maxHeight: maxItems <= 3 ? 'auto' : '270px',
            overflowY: tasksToShow.length > 3 ? 'auto' : 'visible',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.grey[100],
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.grey[400],
              borderRadius: '3px',
              '&:hover': {
                background: theme.palette.grey[600],
              },
            },
          }}
        >
          <List dense>
            {tasksToShow.map((task, index) => (
              <React.Fragment key={task.taskId}>
                <ListItem sx={{ py: 1.5 }}>
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36,
                        bgcolor: getStatusColor(task.status)
                      }}
                    >
                      {getStatusIcon(task.status)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography 
                        variant="body2" 
                        fontWeight="600"
                        sx={{ 
                          fontSize: { xs: '0.85rem', sm: '0.875rem' },
                          mb: 0.5
                        }}
                      >
                        {task.taskName}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        flexWrap: 'wrap'
                      }}>
                        <Chip
                          label={task.status}
                          size="small"
                          color={
                            task.status === 'ended' ? 'success' :
                            task.status === 'paused' ? 'warning' : 'primary'
                          }
                          variant="outlined"
                        />
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        >
                          {task.type} • {new Date(task.startDate).toLocaleDateString()}
                        </Typography>
                        {task.totalDuration && (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'text.secondary'
                          }}>
                            <AccessTime sx={{ fontSize: 12, mr: 0.5 }} />
                            <Typography variant="caption">
                              {Math.round(task.totalDuration / 3600 * 10) / 10}h
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < tasksToShow.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserRecentActivity;

