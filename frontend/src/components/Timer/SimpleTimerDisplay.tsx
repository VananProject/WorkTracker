import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Timer as TimerIcon, PlayArrow, Pause, Stop } from '@mui/icons-material';

interface SimpleTimerDisplayProps {
  elapsedTime: number;
  currentTask: any;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
}

const SimpleTimerDisplay: React.FC<SimpleTimerDisplayProps> = ({
  elapsedTime,
  currentTask,
  isRunning,
  formatTime,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 4,
      }}
    >
      <TimerIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
      
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
          fontWeight: 'bold',
          color: isRunning ? 'primary.main' : 'text.secondary',
          fontFamily: 'monospace',
          mb: 2,
        }}
      >
        {formatTime(elapsedTime)}
      </Typography>

      {currentTask ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={isRunning ? <PlayArrow /> : <Pause />}
            label={isRunning ? 'Running' : 'Paused'}
            color={isRunning ? 'success' : 'warning'}
            variant="filled"
          />
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
            {currentTask.taskName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {currentTask.type === 'meeting' ? '📅 Meeting' : '📋 Task'}
          </Typography>
        </Box>
      ) : (
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          No active task
        </Typography>
      )}
    </Box>
  );
};

export default React.memo(SimpleTimerDisplay);
