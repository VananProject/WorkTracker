
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

// Simplified utility function for calculating elapsed time
// export const calculateTaskElapsedTime = (task: any): number => {
//   if (!task) {
//     return 0;
//   }
  
//   const now = new Date();
//   const previousDuration = typeof task.duration === 'number' ? task.duration : 0;
  
//   // If task is currently running
//   if (task.status === 'started' || task.status === 'resumed') {
//     // Try to get the most recent start time
//     let startTimeString = task.lastStartTime || task.startTime || task.createdAt;
    
//     if (!startTimeString) {
//       return previousDuration;
//     }
    
//     const startTime = new Date(startTimeString);
    
//     if (isNaN(startTime.getTime())) {
//       return previousDuration;
//     }
    
//     const currentSessionElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    
//     // Ensure we don't get negative values
//     const validSessionElapsed = Math.max(0, currentSessionElapsed);
    
//     return previousDuration + validSessionElapsed;
//   }
  
//   // If task is paused or stopped, return accumulated duration
//   return previousDuration;
// };
// Update calculateTaskElapsedTime function
// Add helper function to get current user
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

// Update calculateTaskElapsedTime function
export const calculateTaskElapsedTime = (task: any): number => {
  if (!task) {
    return 0;
  }
  
  // Check if task belongs to current user
  if (!isCurrentUserTask(task)) {
    return 0;
  }
  
  const now = new Date();
  const previousDuration = typeof task.totalDuration === 'number' ? task.totalDuration : 0;
  
  // If task is currently running
  if (task.status === 'started' || task.status === 'resumed') {
    let startTimeString = task.lastStartTime || task.startDate || task.createdAt;
    
    if (!startTimeString) {
      return previousDuration;
    }
    
    const startTime = new Date(startTimeString);
    
    if (isNaN(startTime.getTime())) {
      return previousDuration;
    }
    
    const currentSessionElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const validSessionElapsed = Math.max(0, currentSessionElapsed);
    
    return previousDuration + validSessionElapsed;
  }
  
  return previousDuration;
};


// Utility to get real-time duration for display
export const getRealTimeDuration = (task: any): number => {
  return calculateTaskElapsedTime(task);
};
