import type { Task } from '../types/TaskHistoryTypes';

export type RecurringType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type RecurringStatus = 'active' | 'paused' | 'disabled';

export const createRecurringTask = (
  task: Task, 
  type: RecurringType, 
  interval: number = 1,
  customPattern?: string
): Task => {
  return {
    ...task,
    isRecurring: true,
    recurringType: type,
    recurringStatus: 'active' as RecurringStatus,
    recurringPattern: getRecurringPattern(type, interval, customPattern),
    recurringCount: task.recurringCount || 0,
    nextRun: calculateNextRun(type, interval),
    recurringInterval: interval
  };
};

export const disableRecurringTask = (task: Task): Task => {
  return {
    ...task,
    isRecurring: false,
    recurringType: undefined,
    recurringStatus: 'disabled' as RecurringStatus,
    recurringPattern: undefined,
    nextRun: undefined
  };
};

export const toggleRecurringStatus = (task: Task): Task => {
  const currentStatus = task.recurringStatus || 'active';
  const newStatus: RecurringStatus = currentStatus === 'active' ? 'paused' : 'active';
  
  return {
    ...task,
    recurringStatus: newStatus,
    nextRun: newStatus === 'active' ? calculateNextRun(task.recurringType || 'daily', task.recurringInterval || 1) : undefined
  };
};

export const getRecurringPattern = (
  type: RecurringType, 
  interval: number = 1, 
  customPattern?: string
): string => {
  switch (type) {
    case 'daily':
      return interval === 1 ? 'Every day' : `Every ${interval} days`;
    case 'weekly':
      return interval === 1 ? 'Every week' : `Every ${interval} weeks`;
    case 'monthly':
      return interval === 1 ? 'Every month' : `Every ${interval} months`;
    case 'custom':
      return customPattern || 'Custom pattern';
    default:
      return 'Unknown pattern';
  }
};

export const calculateNextRun = (type: RecurringType, interval: number = 1): string => {
  const now = new Date();
  const nextRun = new Date(now);
  
  switch (type) {
    case 'daily':
      nextRun.setDate(now.getDate() + interval);
      break;
    case 'weekly':
      nextRun.setDate(now.getDate() + (7 * interval));
      break;
    case 'monthly':
      nextRun.setMonth(now.getMonth() + interval);
      break;
    case 'custom':
      nextRun.setDate(now.getDate() + 1); // Default to tomorrow
      break;
  }
  
  return nextRun.toISOString();
};

export const isRecurringTaskDue = (task: Task): boolean => {
  if (!task.isRecurring || !task.nextRun || task.recurringStatus !== 'active') {
    return false;
  }
  
  const now = new Date();
  const nextRun = new Date(task.nextRun);
  
  return now >= nextRun;
};

export const incrementRecurringCount = (task: Task): Task => {
  return {
    ...task,
    recurringCount: (task.recurringCount || 0) + 1,
    lastRun: new Date().toISOString(),
    nextRun: calculateNextRun(task.recurringType || 'daily', task.recurringInterval || 1)
  };
};
