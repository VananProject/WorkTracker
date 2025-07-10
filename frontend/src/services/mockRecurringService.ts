// Mock service to simulate backend recurring functionality
// This can be replaced with real backend calls later

export interface RecurringTaskData {
  taskId: string;
  isRecurring: boolean;
  recurringType: 'schedule' | 'trigger';
  recurringStatus: 'active' | 'paused' | 'completed';
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    time?: string;
    workingDaysOnly?: boolean;
    skipWeekends?: boolean;
  };
  triggerConditions?: {
    onCompletion?: boolean;
    onDueDate?: boolean;
    manual?: boolean;
  };
  endConditions?: {
    never?: boolean;
    afterRuns?: number;
    endDate?: string;
  };
  recurringCount?: number;
  nextRun?: string;
  lastRun?: string;
  createdAt: string;
  updatedAt: string;
}

class MockRecurringService {
  static triggerRecurringTask(taskId: string) {
    throw new Error('Method not implemented.');
  }
  static getRecurringHistory(taskId: string) {
    throw new Error('Method not implemented.');
  }
  private static STORAGE_KEY = 'recurringTasks';

  // Get all recurring tasks from localStorage
  static getAllRecurringTasks(): Record<string, RecurringTaskData> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading recurring tasks:', error);
      return {};
    }
  }
static validateRecurringSettings(settings: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!settings.isRecurring) {
    return { isValid: true, errors: [] };
  }

  // Check recurring pattern structure
  if (settings.recurringPattern) {
    if (!settings.recurringPattern.frequency) {
      errors.push('Frequency is required');
    }
  } else if (settings.recurringType === 'schedule') {
    errors.push('Recurring pattern is required for schedule-based tasks');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

  // Save recurring task settings
  static saveRecurringTask(taskId: string, recurringData: Partial<RecurringTaskData>): Promise<RecurringTaskData> {
    return new Promise((resolve, reject) => {
      try {
        const existingTasks = this.getAllRecurringTasks();
        const now = new Date().toISOString();
        
        const taskData: RecurringTaskData = {
          taskId,
          isRecurring: recurringData.isRecurring ?? false,
          recurringType: recurringData.recurringType ?? 'schedule',
          recurringStatus: recurringData.recurringStatus ?? 'active',
          recurringPattern: recurringData.recurringPattern,
          triggerConditions: recurringData.triggerConditions,
          endConditions: recurringData.endConditions,
          recurringCount: recurringData.recurringCount ?? 0,
          nextRun: recurringData.nextRun ?? this.calculateNextRun(recurringData),
          lastRun: recurringData.lastRun,
          createdAt: existingTasks[taskId]?.createdAt ?? now,
          updatedAt: now
        };

        existingTasks[taskId] = taskData;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingTasks));
        
        console.log('✅ Mock: Recurring task saved:', taskData);
        resolve(taskData);
      } catch (error) {
        console.error('❌ Mock: Error saving recurring task:', error);
        reject(error);
      }
    });
  }

  // Calculate next run time based on pattern
  private static calculateNextRun(recurringData: Partial<RecurringTaskData>): string | undefined {
    if (!recurringData.isRecurring || !recurringData.recurringPattern) {
      return undefined;
    }

    const now = new Date();
    const pattern = recurringData.recurringPattern;
    let nextRun = new Date(now);

    switch (pattern.frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + (pattern.interval || 1));
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + (7 * (pattern.interval || 1)));
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + (pattern.interval || 1));
        break;
      case 'custom':
        if (pattern.interval) {
          nextRun.setDate(nextRun.getDate() + pattern.interval);
        }
        break;
    }

    // Handle working days only
    if (pattern.workingDaysOnly) {
      while (nextRun.getDay() === 0 || nextRun.getDay() === 6) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    }

    // Handle skip weekends
    if (pattern.skipWeekends && (nextRun.getDay() === 0 || nextRun.getDay() === 6)) {
      nextRun.setDate(nextRun.getDate() + (nextRun.getDay() === 0 ? 1 : 2));
    }

    return nextRun.toISOString();
  }

  // Get recurring task by ID
  static getRecurringTask(taskId: string): RecurringTaskData | null {
    const allTasks = this.getAllRecurringTasks();
    return allTasks[taskId] || null;
  }

  // Delete recurring task
  static deleteRecurringTask(taskId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const existingTasks = this.getAllRecurringTasks();
        delete existingTasks[taskId];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingTasks));
        console.log('✅ Mock: Recurring task deleted:', taskId);
        resolve(true);
      } catch (error) {
        console.error('❌ Mock: Error deleting recurring task:', error);
        reject(error);
      }
    });
  }

  // Update recurring task status
  static updateRecurringStatus(taskId: string, status: 'active' | 'paused' | 'completed'): Promise<RecurringTaskData> {
    return new Promise((resolve, reject) => {
      try {
        const existingTasks = this.getAllRecurringTasks();
        const task = existingTasks[taskId];
        
        if (!task) {
          reject(new Error('Recurring task not found'));
          return;
        }

        task.recurringStatus = status;
        task.updatedAt = new Date().toISOString();
        
        existingTasks[taskId] = task;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingTasks));
        
        console.log('✅ Mock: Recurring task status updated:', { taskId, status });
        resolve(task);
      } catch (error) {
        console.error('❌ Mock: Error updating recurring task status:', error);
        reject(error);
      }
    });
  }

  // Increment run count
  static incrementRunCount(taskId: string): Promise<RecurringTaskData> {
    return new Promise((resolve, reject) => {
      try {
        const existingTasks = this.getAllRecurringTasks();
        const task = existingTasks[taskId];
        
        if (!task) {
          reject(new Error('Recurring task not found'));
          return;
        }

        task.recurringCount = (task.recurringCount || 0) + 1;
        task.lastRun = new Date().toISOString();
        task.nextRun = this.calculateNextRun(task);
        task.updatedAt = new Date().toISOString();
        
        // Check if we've reached the end condition
        if (task.endConditions?.afterRuns && task.recurringCount >= task.endConditions.afterRuns) {
          task.recurringStatus = 'completed';
        }
        
        existingTasks[taskId] = task;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingTasks));
        
        console.log('✅ Mock: Recurring task run count incremented:', task);
        resolve(task);
      } catch (error) {
        console.error('❌ Mock: Error incrementing run count:', error);
        reject(error);
      }
    });
  }

  // Get tasks that are due to run
  static getTasksDueToRun(): RecurringTaskData[] {
    const allTasks = this.getAllRecurringTasks();
    const now = new Date();
    
    return Object.values(allTasks).filter(task => {
      if (!task.isRecurring || task.recurringStatus !== 'active') {
        return false;
      }
      
      if (!task.nextRun) {
        return false;
      }
      
      const nextRunDate = new Date(task.nextRun);
      return nextRunDate <= now;
    });
  }

  // Simulate backend validation
//   static validateRecurringSettings(recurringData: Partial<RecurringTaskData>): { isValid: boolean; errors: string[] } {
//     const errors: string[] = [];
    
//     if (!recurringData.isRecurring) {
//       return { isValid: true, errors: [] };
//     }
    
//     if (!recurringData.recurringType) {
//       errors.push('Recurring type is required');
//     }
    
//     if (recurringData.recurringType === 'schedule' && !recurringData.recurringPattern) {
//       errors.push('Recurring pattern is required for schedule-based tasks');
//     }
    
//     if (recurringData.recurringType === 'trigger' && !recurringData.triggerConditions) {
//       errors.push('Trigger conditions are required for trigger-based tasks');
//     }
    
//     if (recurringData.recurringPattern) {
//       const pattern = recurringData.recurringPattern;
      
//       if (!pattern.frequency) {
//         errors.push('Frequency is required');
//       }
      
//       if (pattern.frequency === 'custom' && !pattern.interval) {
//         errors.push('Interval is required for custom frequency');
//       }
      
//       if (pattern.frequency === 'weekly' && (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0)) {
//         errors.push('Days of week are required for weekly frequency');
//       }
      
//       if (pattern.frequency === 'monthly' && !pattern.dayOfMonth) {
//         errors.push('Day of month is required for monthly frequency');
//       }
//     }
    
//     if (recurringData.endConditions) {
//       const endConditions = recurringData.endConditions;
//       const conditionCount = [endConditions.never, endConditions.afterRuns, endConditions.endDate].filter(Boolean).length;
      
//       if (conditionCount === 0) {
//         errors.push('At least one end condition must be specified');
//       }
      
//       if (conditionCount > 1) {
//         errors.push('Only one end condition can be specified');
//       }
      
//       if (endConditions.afterRuns && endConditions.afterRuns <= 0) {
//         errors.push('Number of runs must be greater than 0');
//       }
      
//       if (endConditions.endDate) {
//         const endDate = new Date(endConditions.endDate);
//         if (endDate <= new Date()) {
//           errors.push('End date must be in the future');
//         }
//       }
//     }
    
//     return {
//       isValid: errors.length === 0,
//       errors
//     };
//   }
}

export default MockRecurringService;
