import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
  Avatar,
  Stack,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Today,
  Timer,
  Task as TaskIcon,
  Business as MeetingIcon,
  TrendingUp,
  Schedule
} from '@mui/icons-material';
import type { Task } from '../TableUI/types/TaskHistoryTypes';

interface DailyTimeTrackingCardProps {
  tasks: Task[];
  formatTime: (seconds: number) => string;
  currentUser: any;
  isRunning?: boolean;
  currentTask?: Task | null;
}

interface DailyTaskSummary {
  taskName: string;
  taskId: string;
  type: 'task' | 'meeting';
  totalMinutes: number;
  totalSeconds: number;
  status: string;
  activities: any[];
  isActive: boolean;
  lastActivity?: string;
}

// Updated helper function to format time as HH:MM:SS
const formatTimeSimple = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper functions
const safeToDate = (timestamp: string | number | Date | undefined): Date | null => {
  if (!timestamp) return null;
  try {
    if (timestamp instanceof Date) return timestamp;
    return new Date(timestamp);
  } catch (error) {
    console.warn('Invalid timestamp:', timestamp);
    return null;
  }
};

const safeToString = (timestamp: string | number | Date | undefined): string | undefined => {
  if (!timestamp) return undefined;
  try {
    if (typeof timestamp === 'string') return timestamp;
    if (timestamp instanceof Date) return timestamp.toISOString();
    if (typeof timestamp === 'number') return new Date(timestamp).toISOString();
    return undefined;
  } catch (error) {
    console.warn('Invalid timestamp for string conversion:', timestamp);
    return undefined;
  }
};

const DailyTimeTrackingCard: React.FC<DailyTimeTrackingCardProps> = ({
  tasks,
  formatTime,
  currentUser,
  isRunning = false,
  currentTask = null
}) => {
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const todayStart = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const todayEnd = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  }, []);

  const todaysTasks = useMemo(() => {
    const userEmail = currentUser?.email || currentUser?.userEmail;
    
    if (!userEmail) {
      console.warn('No current user email found');
      return [];
    }
    
    return tasks.filter(task => {
      // STRICT: Only show tasks that belong to the current user
      const isUserTask = task.userEmail === userEmail || 
                        (task as any).assignedToEmail === userEmail;
      
      if (!isUserTask) return false;

      const hasActivityToday = task.activities?.some((activity: any) => {
        const activityDate = safeToDate(activity.timestamp);
        return activityDate && activityDate >= todayStart && activityDate <= todayEnd;
      });

      const createdToday = task.createdAt && 
        safeToDate(task.createdAt) && 
        safeToDate(task.createdAt)! >= todayStart && 
        safeToDate(task.createdAt)! <= todayEnd;

      return hasActivityToday || createdToday;
    });
  }, [tasks, currentUser, todayStart, todayEnd]);

  const dailySummary = useMemo(() => {
    const taskSummaries: DailyTaskSummary[] = [];
    let totalTaskMinutes = 0;
    let totalMeetingMinutes = 0;
    let totalTaskSeconds = 0;
    let totalMeetingSeconds = 0;

    todaysTasks.forEach(task => {
      let taskTotalSeconds = 0;
      let lastActivityTime: string | undefined;

      if (task.activities && task.activities.length > 0) {
        const todayActivities = task.activities.filter((activity: any) => {
          const activityDate = safeToDate(activity.timestamp);
          return activityDate && activityDate >= todayStart && activityDate <= todayEnd;
        });

        todayActivities.sort((a: any, b: any) => {
          const dateA = safeToDate(a.timestamp);
          const dateB = safeToDate(b.timestamp);
          if (!dateA || !dateB) return 0;
          return dateA.getTime() - dateB.getTime();
        });

        let sessionStart = null as Date | null;
        
        todayActivities.forEach((activity: any) => {
          const activityTime = safeToDate(activity.timestamp);
          if (!activityTime) return;
          
          lastActivityTime = safeToString(activity.timestamp);

          switch (activity.action) {
            case 'started':
            case 'resumed':
              sessionStart = activityTime;
              break;
            
            case 'paused':
            case 'ended':
              if (sessionStart !== null && activityTime) {
                const sessionDuration = (activityTime.getTime() - sessionStart.getTime()) / 1000;
                taskTotalSeconds += Math.floor(sessionDuration);
                sessionStart = null;
              }
              break;
          }
        });

        if (sessionStart !== null && ['started', 'resumed'].includes(task.status)) {
          const currentDuration = (currentTime.getTime() - sessionStart.getTime()) / 1000;
          taskTotalSeconds += Math.floor(currentDuration);
        }
      }

      if (taskTotalSeconds === 0 && task.totalDuration) {
        const createdToday = task.createdAt && 
          safeToDate(task.createdAt) && 
          safeToDate(task.createdAt)! >= todayStart && 
          safeToDate(task.createdAt)! <= todayEnd;
        
        if (createdToday) {
          taskTotalSeconds = Math.floor(task.totalDuration);
        }
      }

      if (taskTotalSeconds > 0) {
        const taskMinutes = Math.floor(taskTotalSeconds / 60);
        const isActive = ['started', 'resumed'].includes(task.status) && 
                        (currentTask?.taskId === task.taskId || isRunning);

        taskSummaries.push({
          taskName: task.taskName,
          taskId: task.taskId,
          type: task.type,
          totalMinutes: taskMinutes,
          totalSeconds: Math.floor(taskTotalSeconds),
          status: task.status,
          activities: task.activities || [],
          isActive,
          lastActivity: lastActivityTime
        });

        if (task.type === 'meeting') {
          totalMeetingMinutes += taskMinutes;
          totalMeetingSeconds += Math.floor(taskTotalSeconds);
        } else {
          totalTaskMinutes += taskMinutes;
          totalTaskSeconds += Math.floor(taskTotalSeconds);
        }
      }
    });

    taskSummaries.sort((a, b) => b.totalSeconds - a.totalSeconds);

    return {
      taskSummaries,
      totalTaskMinutes,
      totalMeetingMinutes,
      totalTaskSeconds,
      totalMeetingSeconds,
      totalMinutes: totalTaskMinutes + totalMeetingMinutes,
      totalSeconds: totalTaskSeconds + totalMeetingSeconds
    };
  }, [todaysTasks, currentTime, currentTask, isRunning, todayStart, todayEnd]);

  const workdayProgress = (dailySummary.totalMinutes / 480) * 100;

  const getStatusColor = (status: string, isActive: boolean) => {
    if (isActive) return '#10b981';
    switch (status) {
      case 'started': return '#10b981';
      case 'resumed': return '#3b82f6';
      case 'paused': return '#f59e0b';
      case 'ended': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (dailySummary.totalSeconds === 0) {
    return (
      <Card 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
          mb: 2
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Today />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Daily Tracking
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                No activity today yet
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 3,
        mb: 2,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          pb: 2,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
              <Timer sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {formatTimeSimple(dailySummary.totalSeconds)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Today • {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {Math.min(workdayProgress, 100).toFixed(0)}%
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              of 8h goal
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ px: 3, pb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(workdayProgress, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                bgcolor: workdayProgress >= 100 ? '#10b981' : 
                        workdayProgress >= 75 ? '#f59e0b' : '#ffffff',
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* Stats Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: 2, 
          px: 3, 
          pb: 2 
        }}>
          <Box sx={{ 
            bgcolor: 'rgba(255,255,255,0.15)', 
            borderRadius: 2, 
            p: 2,
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TaskIcon sx={{ fontSize: 16, opacity: 0.8 }} />
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>
                Tasks
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
              {formatTimeSimple(dailySummary.totalTaskSeconds)}
            </Typography>
          </Box>

          <Box sx={{ 
            bgcolor: 'rgba(255,255,255,0.15)', 
            borderRadius: 2, 
            p: 2,
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MeetingIcon sx={{ fontSize: 16, opacity: 0.8 }} />
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>
                Meetings
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
              {formatTimeSimple(dailySummary.totalMeetingSeconds)}
            </Typography>
          </Box>

          <Box sx={{ 
            bgcolor: 'rgba(255,255,255,0.15)', 
            borderRadius: 2, 
            p: 2,
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Schedule sx={{ fontSize: 16, opacity: 0.8 }} />
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>
                Tasks
              </Typography>
            </Box>
                       <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {dailySummary.taskSummaries.length}
            </Typography>
          </Box>
        </Box>

        {/* Active Task Alert */}
        {isRunning && currentTask && (
          <Box sx={{ 
            mx: 3, 
            mb: 2, 
            p: 2, 
            bgcolor: 'rgba(16, 185, 129, 0.2)', 
            borderRadius: 2,
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: '#10b981',
                  animation: 'pulse 2s infinite'
                }} 
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                <strong>Active:</strong> {currentTask.taskName}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Expandable Details */}
        <Box sx={{ 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          bgcolor: 'rgba(255,255,255,0.05)'
        }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              py: 1.5,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
            onClick={() => setExpanded(!expanded)}
          >
            <Typography variant="body2" sx={{ mr: 1, fontWeight: 500 }}>
              {expanded ? 'Less Details' : 'More Details'}
            </Typography>
            <IconButton size="small" sx={{ color: 'white' }}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={expanded}>
            <Box sx={{ bgcolor: 'rgba(0,0,0,0.1)', p: 3 }}>
              {/* Task Breakdown */}
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Task Breakdown
              </Typography>
              
              <Stack spacing={1.5}>
                {dailySummary.taskSummaries.slice(0, 5).map((taskSummary, index) => (
                  <Box 
                    key={taskSummary.taskId}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderRadius: 2,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: getStatusColor(taskSummary.status, taskSummary.isActive),
                          fontSize: 14
                        }}
                      >
                        {taskSummary.type === 'meeting' ? 
                          <MeetingIcon sx={{ fontSize: 16 }} /> : 
                          <TaskIcon sx={{ fontSize: 16 }} />
                        }
                      </Avatar>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px'
                            }}
                          >
                            {taskSummary.taskName}
                          </Typography>
                          
                          {taskSummary.isActive && (
                            <Chip
                              label="LIVE"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                bgcolor: '#10b981',
                                color: 'white',
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          )}
                        </Box>
                        
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {taskSummary.status} • {taskSummary.type}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        fontWeight: 600,
                        minWidth: 'fit-content'
                      }}
                    >
                      {formatTimeSimple(taskSummary.totalSeconds)}
                    </Typography>
                  </Box>
                ))}
                
                {dailySummary.taskSummaries.length > 5 && (
                  <Box sx={{ textAlign: 'center', pt: 1 }}>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      +{dailySummary.taskSummaries.length - 5} more tasks
                    </Typography>
                  </Box>
                )}
              </Stack>

              {/* Quick Stats */}
              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: 2 
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {dailySummary.taskSummaries.length > 0 
                      ? formatTimeSimple(dailySummary.totalSeconds / dailySummary.taskSummaries.length)
                      : '0:00'
                    }
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Avg per Task
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {dailySummary.totalTaskMinutes > 0 || dailySummary.totalMeetingMinutes > 0
                      ? `${Math.round((dailySummary.totalTaskMinutes / (dailySummary.totalTaskMinutes + dailySummary.totalMeetingMinutes)) * 100)}%`
                      : '0%'
                    }
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Task Focus
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <TrendingUp sx={{ fontSize: 16 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {workdayProgress >= 100 ? 'Excellent' : 
                       workdayProgress >= 75 ? 'Good' : 
                       workdayProgress >= 50 ? 'Average' : 'Low'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Productivity
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </Box>
      </CardContent>
      
      {/* Add CSS animation for pulse effect */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Card>
  );
};

export default React.memo(DailyTimeTrackingCard);

