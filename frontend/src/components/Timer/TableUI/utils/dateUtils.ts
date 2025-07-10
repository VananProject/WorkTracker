// Helper function to safely format dates
export const formatSafeDate = (dateValue: any): string => {
  if (!dateValue) return 'N/A';
  
  try {
    let date: Date;
    
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      // Handle different string formats
      if (dateValue.includes('T') || dateValue.includes('Z')) {
        date = new Date(dateValue);
      } else {
        // Try parsing as ISO string or timestamp
        date = new Date(dateValue);
      }
    } else if (typeof dateValue === 'number') {
      // Handle timestamp
      date = new Date(dateValue);
    } else {
      return 'Invalid Date';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', dateValue);
      return 'Invalid Date';
    }
    
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting date:', error, 'Value:', dateValue);
    return 'Invalid Date';
  }
};

// Helper function to get the latest activity timestamp
export const getLastActivityTime = (task: any): string => {
  try {
    // Check for activities array
    if (task.activities && Array.isArray(task.activities) && task.activities.length > 0) {
      const lastActivity = task.activities[task.activities.length - 1];
      if (lastActivity && lastActivity.timestamp) {
        return formatSafeDate(lastActivity.timestamp);
      }
    }
    
    // Fallback to updatedAt or createdAt
    if (task.updatedAt) {
      return formatSafeDate(task.updatedAt);
    }
    
    if (task.createdAt) {
      return formatSafeDate(task.createdAt);
    }
    
    if (task.startDate) {
      return formatSafeDate(task.startDate);
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Error getting last activity time:', error, 'Task:', task);
    return 'N/A';
  }
};

// Helper function to format activity timestamp
export const formatActivityTime = (timestamp: string | Date | number) => {
  try {
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return {
        date: 'Invalid Date',
        time: 'Invalid Time'
      };
    }
    
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  } catch (error) {
    console.error('Error formatting activity time:', error, 'Timestamp:', timestamp);
    return {
      date: 'Invalid Date',
      time: 'Invalid Time'
    };
  }
};
