import React from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';
import { Alarm } from '@mui/icons-material';
import { timerStyles } from '../../../styles/TaskTimer.styles';
import { calculateTaskElapsedTime } from '../TableUI/utils/timeUtils';
// import { timerStyles } from '../../styles/TaskTimer.styles';

interface TimerDisplayProps {
  elapsedTime: number;
  currentTask: any;
  alarmTime: number | null;
  formatTime: (seconds: number) => string;
  onTestAlarmSound: () => void;
}
const isCurrentUserTask = (task: any): boolean => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.email || !task) return false;
    
    return task.createdBy === currentUser.email || 
           task.assignedToEmail === currentUser.email ||
           task.userEmail === currentUser.email;
  } catch (error) {
    return false;
  }
};
const TimerDisplay: React.FC<TimerDisplayProps> = ({
  elapsedTime,
  currentTask,
  alarmTime,
  formatTime,
  onTestAlarmSound
}) => {
  const displayTime = (currentTask && isCurrentUserTask(currentTask)) 
    ? calculateTaskElapsedTime(currentTask) 
    : elapsedTime;
  
  // Don't show timer if not user's task
  if (currentTask && !isCurrentUserTask(currentTask)) {
    return (
      <Box sx={timerStyles.timerDisplay}>
        <Typography variant="h6" color="text.secondary">
          No active timer
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={timerStyles.timerDisplay}>
      <Typography variant="h2" sx={timerStyles.timeText}>
        {formatTime(displayTime)}
      </Typography>
      
      {currentTask && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip 
            label={currentTask.type} 
            color="primary" 
            size="small" 
          />
          <Chip 
            label={currentTask.status} 
            color={
              currentTask.status === 'started' ? 'success' :
              currentTask.status === 'paused' ? 'warning' :
              currentTask.status === 'resumed' ? 'info' : 'default'
            }
            size="small" 
          />
          {currentTask.taskName && (
            <Chip 
              label={currentTask.taskName} 
              variant="outlined" 
              size="small" 
            />
          )}
          {currentTask.isAssigned && (
            <Chip 
              label="Assigned Task" 
              color="secondary" 
              size="small" 
              icon={<Alarm />}
            />
          )}
        </Box>
      )}

      {alarmTime && (
        <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Chip 
            icon={<Alarm />}
            label={`Alarm: Every ${alarmTime} min`}
            color="secondary"
            size="small"
          />
          <Button
            size="small"
            variant="outlined"
            onClick={onTestAlarmSound}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            🔊 Test
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TimerDisplay;
