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
    
    // Filter today's tasks
    const todaysTasks = tasks.filter(task => {
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
              if (sessionStart) {
                const sessionDuration = (activityTime.getTime() - sessionStart.getTime()) / 1000;
                taskTotalSeconds += sessionDuration;
                sessionStart = null;
              }
              break;
          }
        });

        if (sessionStart && ['started', 'resumed'].includes(task.status)) {
          const currentDuration = (currentTime.getTime() - sessionStart.getTime()) / 1000;
          taskTotalSeconds += currentDuration;
        }
      }

      if (taskTotalSeconds === 0 && task.totalDuration) {
        const createdToday = task.createdAt && 
          safeToDate(task.createdAt) && 
          safeToDate(task.createdAt)! >= todayStart && 
          safeToDate(task.createdAt)! <= todayEnd;
        
        if (createdToday) {
          taskTotalSeconds = task.totalDuration;
        }
      }

      if (taskTotalSeconds > 0) {
        const taskMinutes = Math.round(taskTotalSeconds / 60);
        const isActive = ['started', 'resumed'].includes(task.status) && 
                        (currentTask?.taskId === task.taskId || isRunning);

        taskSummaries.push({
          taskName: task.taskName,
          taskId: task.taskId,
          type: task.type,
          totalMinutes: taskMinutes,
          totalSeconds: taskTotalSeconds,
          status: task.status,
          isActive,
          lastActivity: lastActivityTime
        });

        if (task.type === 'meeting') {
          totalMeetingMinutes += taskMinutes;
          totalMeetingSeconds += taskTotalSeconds;
        } else {
          totalTaskMinutes += taskMinutes;
          totalTaskSeconds += taskTotalSeconds;
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
