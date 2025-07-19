interface PauseSession {
  pausedAt: string;
  resumedAt?: string;
  duration?: number;
}
export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
  
  return parts.join(' ');
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return 'Invalid Date';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatTime = (seconds: number): string => {
  // Robust validation and fallback
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '00:00:00';
  }
  
  // Ensure we're working with integers
  const totalSeconds = Math.floor(seconds);
  
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getRelativeTime = (dateString: string): string => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDateTime(dateString);
};
const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Add helper function to check if task belongs to current user
const isCurrentUserTask = (task: any): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser || !task) return false;
  
  return task.createdBy === currentUser.email || 
         task.assignedToEmail === currentUser.email ||
         task.userEmail === currentUser.email;
};
export const calculateTaskElapsedTime = (task: any): number => {
  if (!task) {
    return 0;
  }
  
  // Check if task belongs to current user
  if (!isCurrentUserTask(task)) {
    return 0;
  }
  
  const now = new Date();
  
  // Get task start time
  const taskStartTime = new Date(task.startTime || task.startDate || task.createdAt);
  if (isNaN(taskStartTime.getTime())) {
    return task.totalDuration || 0;
  }
  
  // If task is ended, return stored duration
  if (task.status === 'ended' || task.status === 'completed') {
    return task.totalDuration || 0;
  }
  
  // Calculate total elapsed time from start to now
  const totalElapsedFromStart = Math.floor((now.getTime() - taskStartTime.getTime()) / 1000);
  
  // Get pause sessions from localStorage
  const pauseSessionsKey = `task_${task.taskId}_pauseSessions`;
  let pauseSessions: PauseSession[] = [];
  
  try {
    const stored = localStorage.getItem(pauseSessionsKey);
    pauseSessions = stored ? JSON.parse(stored) : [];
  } catch (error) {
    pauseSessions = [];
  }
  
  // Calculate total pause time
  let totalPauseTime = 0;
  
  pauseSessions.forEach(session => {
    if (session.pausedAt && session.resumedAt) {
      // Completed pause session
      const pausedAt = new Date(session.pausedAt);
      const resumedAt = new Date(session.resumedAt);
      
      if (!isNaN(pausedAt.getTime()) && !isNaN(resumedAt.getTime())) {
        const pauseDuration = Math.floor((resumedAt.getTime() - pausedAt.getTime()) / 1000);
        totalPauseTime += Math.max(0, pauseDuration);
      }
    } else if (session.pausedAt && task.status === 'paused') {
      // Currently paused - calculate pause time up to now
      const pausedAt = new Date(session.pausedAt);
      if (!isNaN(pausedAt.getTime())) {
        const currentPauseDuration = Math.floor((now.getTime() - pausedAt.getTime()) / 1000);
        totalPauseTime += Math.max(0, currentPauseDuration);
      }
    }
  });
  
  // Calculate actual working time
  const actualWorkingTime = Math.max(0, totalElapsedFromStart - totalPauseTime);
  
  console.log('⏱️ Accurate time calculation:', {
    taskName: task.taskName,
    status: task.status,
    totalElapsedFromStart,
    totalPauseTime,
    actualWorkingTime,
    pauseSessionsCount: pauseSessions.length
  });
  
  return actualWorkingTime;
};
// Utility to get real-time duration for display
export const getRealTimeDuration = (task: any): number => {
  return calculateTaskElapsedTime(task);
};
