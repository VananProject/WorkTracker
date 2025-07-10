import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Collapse
} from '@mui/material';
import { Schedule } from '@mui/icons-material';
import {
  Timeline,
  AccessTime,
  Person
} from '@mui/icons-material';
import { formatActivityTime } from '../utils/dateUtils';
import { getActivityIcon } from '../utils/iconUtils';
import type { Task, Activity } from '../types/TaskHistoryTypes';

interface ActivityTimelineProps {
  task: Task;
  isExpanded: boolean;
  formatTime: (seconds: number) => string;
  onDurationCalculated?: (taskId: string, duration: number) => void;
}

// Update the helper function to handle undefined activities
const calculateAccurateDuration = (activities: Activity[] | undefined): number => {
  // Add null/undefined check at the beginning
  if (!activities || activities.length === 0) {
    return 0;
  }

  let totalDuration = 0;
  let sessionStart: Date | null = null;
  
  // Sort activities by timestamp
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  sortedActivities.forEach((activity) => {
    const activityTime = new Date(activity.timestamp);
    
    switch (activity.action) {
      case 'started':
      case 'resumed':
        sessionStart = activityTime;
        break;
        
      case 'paused':
      case 'ended':
        if (sessionStart) {
          const sessionDuration = activityTime.getTime() - sessionStart.getTime();
          totalDuration += Math.floor(sessionDuration / 1000); // Convert to seconds
          sessionStart = null;
        }
        break;
    }
  });
  
  return totalDuration;
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  task,
  isExpanded,
  formatTime,
  onDurationCalculated
}) => {
  if (!task.activities || task.activities.length === 0) {
    return null;
  }

  // Calculate accurate duration and notify parent
  const calculatedDuration = React.useMemo(() => {
    const duration = calculateAccurateDuration(task.activities); // Now handles undefined
    // Call the callback to pass duration back to parent
    if (onDurationCalculated) {
      onDurationCalculated(task.taskId, duration);
    }
    return duration;
  }, [task.activities, task.taskId, onDurationCalculated]);

  return (
    <Collapse in={isExpanded}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Timeline fontSize="small" />
          Activity Timeline ({task.activities.length} activities)
        </Typography>
        
        <Box sx={{ pl: 2 }}>
          {task.activities.map((activity: Activity, actIndex: number) => {
            const activityTime = formatActivityTime(activity.timestamp);
            const isLastActivity = actIndex === task.activities!.length - 1; // Use non-null assertion since we checked above
            
            // Calculate session duration for this specific activity
            let sessionDuration = 0;
            if (activity.action === 'paused' || activity.action === 'ended') {
              // Find the previous start/resume activity
              for (let i = actIndex - 1; i >= 0; i--) {
                const prevActivity = task.activities![i]; // Use non-null assertion
                if (prevActivity.action === 'started' || prevActivity.action === 'resumed') {
                  const startTime = new Date(prevActivity.timestamp).getTime();
                  const endTime = new Date(activity.timestamp).getTime();
                  sessionDuration = Math.floor((endTime - startTime) / 1000);
                  break;
                }
              }
            }

            return (
              <Box 
                key={actIndex} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  py: 1,
                  borderLeft: !isLastActivity ? '2px solid #e0e0e0' : 'none',
                  ml: 1,
                  pl: 2,
                  position: 'relative',
                  '&::before': !isLastActivity ? {
                    content: '""',
                    position: 'absolute',
                    left: -5,
                    top: '50%',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: activity.action === 'started' ? 'success.main' :
                            activity.action === 'paused' ? 'warning.main' :
                            activity.action === 'resumed' ? 'info.main' :
                            activity.action === 'ended' ? 'error.main' : 'grey.500'
                  } : {}
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                  {getActivityIcon(activity.action)}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      color: activity.action === 'started' ? 'success.main' :
                            activity.action === 'paused' ? 'warning.main' :
                            activity.action === 'resumed' ? 'info.main' :
                            activity.action === 'ended' ? 'error.main' : 'text.primary'
                    }}
                  >
                    {activity.action}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {activityTime.date}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {activityTime.time}
                    </Typography>
                  </Box>
                  
                  {/* Show session duration for pause/end activities */}
                  {(activity.action === 'paused' || activity.action === 'ended') && sessionDuration > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
                        +{formatTime(sessionDuration)}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Show total duration for end activity */}
                  {activity.action === 'ended' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Schedule fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                        Total: {formatTime(calculatedDuration)}
                      </Typography>
                    </Box>
                  )}
                  
                  {activity.action === 'assigned' && (task as any).assignedBy && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="caption" color="textSecondary">
                        by {(task as any).assignedBy.username || (task as any).assignedBy.email}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
        
        {/* Show calculated total duration for completed tasks */}
        {task.activities.some((a: Activity) => a.action === 'ended') && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'primary.50', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <Typography variant="body2" sx={{ 
              fontFamily: 'monospace', 
              fontWeight: 600, 
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Schedule fontSize="small" />
              Calculated Total Duration: {formatTime(calculatedDuration)}
            </Typography>
          </Box>
        )}
        
        {/* Activity Summary */}
        <Box sx={{ mt: 2, p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="textSecondary" gutterBottom>
            Activity Summary:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['started', 'paused', 'resumed', 'ended', 'assigned'].map(action => {
              const count = task.activities!.filter((a: Activity) => a.action === action).length; // Use non-null assertion
              if (count > 0) {
                return (
                  <Chip
                    key={action}
                    label={`${action}: ${count}`}
                    size="small"
                    variant="outlined"
                    color={
                      action === 'started' ? 'success' :
                      action === 'paused' ? 'warning' :
                      action === 'resumed' ? 'info' :
                      action === 'ended' ? 'error' : 'default'
                    }
                  />
                );
              }
              return null;
            })}
          </Box>
        </Box>
      </Box>
    </Collapse>
  );
};

export default ActivityTimeline;
