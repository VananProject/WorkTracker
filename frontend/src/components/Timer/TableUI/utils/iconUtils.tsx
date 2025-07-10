import React from 'react';
import {
  PlayCircle, PauseCircle, StopCircle, Assignment, Timeline
} from '@mui/icons-material';

// Helper function to get activity icon
export const getActivityIcon = (action: string) => {
  switch (action) {
    case 'started':
      return <PlayCircle color="success" fontSize="small" />;
    case 'paused':
      return <PauseCircle color="warning" fontSize="small" />;
    case 'resumed':
      return <PlayCircle color="info" fontSize="small" />;
    case 'ended':
      return <StopCircle color="error" fontSize="small" />;
    case 'assigned':
      return <Assignment color="secondary" fontSize="small" />;
    default:
      return <Timeline fontSize="small" />;
  }
};
