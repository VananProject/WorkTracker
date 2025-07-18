import { useMemo, useState, useEffect } from 'react';
import type { Task } from '../TableUI/types/TaskHistoryTypes';

interface DailyTimeTrackingData {
  totalTaskMinutes: number;
  totalMeetingMinutes: number;
  totalTaskSeconds: number;
  totalMeetingSeconds: number;
  totalMinutes: number;
  totalSeconds: number;
  taskSummaries: Array<{
    taskName: string;
    taskId: string;
    type: 'task' | 'meeting';
    totalMinutes: number;
    totalSeconds: number;
    status: string;
    isActive: boolean;
    lastActivity?: string;
  }>;
  workdayProgress: number;
  todaysTasks: Task[];
}
// Add the same helper function to useDailyTimeTracking.ts if needed
const formatTimeSimple = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to safely convert timestamp to Date
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

// Helper function to safely convert timestamp to string
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

export const useDailyTimeTracking = (
  tasks: Task[],
  currentUser: any,
  isRunning: boolean = false,
  currentTask: Task | null = null
): DailyTimeTrackingData => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for live tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Get start and end of today
  const { todayStart, todayEnd } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    
    return { todayStart: start, todayEnd: end };
  }, []);

  return useMemo(() => {
    const userEmail = currentUser?.email || currentUser?.userEmail;
    
    if (!userEmail) {
      console.warn('No current user email found for daily tracking');
      return {
        taskSummaries: [],
        totalTaskMinutes: 0,
        totalMeetingMinutes: 0,
        totalTaskSeconds: 0,
        totalMeetingSeconds: 0,
        totalMinutes: 0,
        totalSeconds: 0,
        workdayProgress: 0,
        todaysTasks: []
      };
    }
    
    // Filter today's tasks - ONLY for current user
    const todaysTasks = tasks.filter(task => {
      // STRICT: Only include tasks that belong to the current user
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

    // Calculate summary data
    const taskSummaries: any[] = [];
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
                // Round to remove milliseconds
                taskTotalSeconds += Math.floor(sessionDuration);
                sessionStart = null;
              }
              break;
          }
        });

        if (sessionStart !== null && ['started', 'resumed'].includes(task.status)) {
          const currentDuration = (currentTime.getTime() - sessionStart.getTime()) / 1000;
          // Round to remove milliseconds
          taskTotalSeconds += Math.floor(currentDuration);
        }
      }

      if (taskTotalSeconds === 0 && task.totalDuration) {
        const createdToday = task.createdAt && 
          safeToDate(task.createdAt) && 
          safeToDate(task.createdAt)! >= todayStart && 
          safeToDate(task.createdAt)! <= todayEnd;
        
                if (createdToday) {
          // Round to remove milliseconds
          taskTotalSeconds = Math.floor(task.totalDuration);
        }
      }

      if (taskTotalSeconds > 0) {
        const taskMinutes = Math.floor(taskTotalSeconds / 60); // Use Math.floor instead of Math.round
        const isActive = ['started', 'resumed'].includes(task.status) && 
                        (currentTask?.taskId === task.taskId || isRunning);

        taskSummaries.push({
          taskName: task.taskName,
          taskId: task.taskId,
          type: task.type,
          totalMinutes: taskMinutes,
          totalSeconds: Math.floor(taskTotalSeconds), // Ensure no decimals
          status: task.status,
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

    const totalMinutes = totalTaskMinutes + totalMeetingMinutes;
    const totalSeconds = totalTaskSeconds + totalMeetingSeconds;
    const workdayProgress = (totalMinutes / 480) * 100; // 480 minutes = 8 hours

    return {
      taskSummaries,
      totalTaskMinutes,
      totalMeetingMinutes,
      totalTaskSeconds,
      totalMeetingSeconds,
      totalMinutes,
      totalSeconds,
      workdayProgress,
      todaysTasks
    };
  }, [tasks, currentUser, currentTime, currentTask, isRunning, todayStart, todayEnd]);
};

