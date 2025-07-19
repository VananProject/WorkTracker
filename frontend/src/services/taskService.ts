
import type { Task } from '../components/Timer/TableUI/types/TaskHistoryTypes';
import { taskAPI } from './api';
import MockRecurringService from './mockRecurringService';
import { addDays, addWeeks, addMonths, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday, nextSunday, startOfDay } from 'date-fns';
export interface TaskData {
  taskName: string;
  type: 'task' | 'meeting';
  description?: string;
  estimatedTime?: string;
  dueDate?: Date | null;
}
interface StartTaskPayload {
  taskId: string;
  taskName: string;
  type: 'task' | 'meeting';
  description?: string;
  estimatedTime?: string;
  dueDate?: string | null;
  status?: string;
  totalDuration?: number;
   startDate: string;
  isRecurring?: boolean;
  recurringType?: string;
  recurringStatus?: string;
  recurringPattern?: any;
  recurringCount?: number;
  nextRun?: string;
  lastRun?: string;
  recurringInterval?: number;
  recurringCron?: string;
}
export interface AssignTaskData extends TaskData {
  assignedToEmail: string;
  approvalNeeded?: boolean;
}

// Internal interface for API calls (with string dates)
interface TaskDataForAPI {
  taskName: string;
  type: 'task' | 'meeting';
  description?: string;
  estimatedTime?: string;
  dueDate?: string; // String for API
}

interface AssignTaskDataForAPI extends TaskDataForAPI {
  assignedToEmail: string;
}

export class TaskService {
  static updateRecurringTask(taskId: string, updatedTask: {
    recurringCount: number; lastRun: string; nextRun: string; status: string; taskId: string; isRecurring: boolean; recurringType: "schedule" | "trigger"; recurringStatus: "active" | "paused" | "completed"; recurringPattern?: {
      frequency: "daily" | "weekly" | "monthly" | "custom"; interval?: number; daysOfWeek?: number[]; dayOfMonth?: number; time

        ? //   type: 'task' | 'meeting';
        : string; workingDaysOnly
    
      ?: boolean; skipWeekends
     
      ? //   estimatedTime?: string;
      : boolean;
    }; triggerConditions?: { onCompletion?: boolean; onDueDate?: boolean; manual?: boolean; }; endConditions?: { never?: boolean; afterRuns?: number; endDate?: string; }; createdAt: string; updatedAt: string;
  }) {
    throw new Error('Method not implemented.');
  }
static async updateRecurringSettings(taskId: string, recurringData: any) {
  try {
    console.log('🔄 TaskService.updateRecurringSettings:', { taskId, recurringData });
    
    // Try backend first
    try {
      const response = await taskAPI.updateTask(taskId, recurringData);
      console.log('✅ Backend update successful');
      return {
        success: true,
        message: 'Recurring settings saved successfully',
        data: response.data,
        isLocal: false
      };
    } catch (backendError: any) {
      console.log('⚠️ Backend error:', backendError.response?.data || backendError.message);
      
      // Fallback to mock service
      const mockResult = await MockRecurringService.saveRecurringTask(taskId, recurringData);
      
      return {
        success: true,
        message: 'Recurring settings saved locally (backend integration pending)',
        data: mockResult,
        isLocal: true
      };
    }
  } catch (error) {
    console.error('❌ Error updating recurring settings:', error);
    throw error;
  }
}



  // Get recurring settings (with fallback)
  static async getRecurringSettings(taskId: string) {
    try {
      // Try backend first
      try {
        const response = await taskAPI.getTaskById(taskId);
        if (response.data.isRecurring) {
          return response.data;
        }
      } catch (backendError) {
        console.log('⚠️ Backend not available for recurring settings');
      }
      
      // Fallback to mock service
      return MockRecurringService.getRecurringTask(taskId);
    } catch (error) {
      console.error('Error getting recurring settings:', error);
      return null;
    }
  }

  // Get all recurring settings (enhanced)
  static getAllRecurringSettings(): Record<string, any> {
    try {
      // For now, just return mock service data
      // In the future, this could combine backend + local data
      return MockRecurringService.getAllRecurringTasks();
    } catch (error) {
      console.error('Error getting all recurring settings:', error);
      return {};
    }
  }

  // Check for due recurring tasks
  static getTasksDueToRun() {
    try {
      return MockRecurringService.getTasksDueToRun();
    } catch (error) {
      console.error('Error getting tasks due to run:', error);
      return [];
    }
  }


  // Helper method to calculate next occurrence
  static calculateNextOccurrence(recurringSettings: any): Date | null {
    if (!recurringSettings.isRecurring) return null;

    const now = new Date();
    const startDate = new Date(recurringSettings.scheduleStartDate || now);

    if (recurringSettings.recurrenceType === 'schedule') {
      switch (recurringSettings.schedulePattern) {
        case 'daily':
          const nextDaily = new Date(startDate);
          nextDaily.setDate(nextDaily.getDate() + (recurringSettings.scheduleInterval || 1));
          
          // Skip weekends if enabled
          if (recurringSettings.skipWeekends) {
            while (nextDaily.getDay() === 0 || nextDaily.getDay() === 6) {
              nextDaily.setDate(nextDaily.getDate() + 1);
            }
          }
          
          return nextDaily;

        case 'weekly':
          const nextWeekly = new Date(startDate);
          nextWeekly.setDate(nextWeekly.getDate() + (recurringSettings.scheduleInterval * 7));
          return nextWeekly;

        case 'monthly':
          const nextMonthly = new Date(startDate);
          
          if (recurringSettings.workingDaysOnly && recurringSettings.monthlyWorkingDay) {
            // Calculate the Nth working day of next month
            const nextMonth = new Date(nextMonthly.getFullYear(), nextMonthly.getMonth() + 1, 1);
            let workingDayCount = 0;
            let currentDate = new Date(nextMonth);
            
            while (workingDayCount < recurringSettings.monthlyWorkingDay) {
              if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) { // Monday to Friday
                workingDayCount++;
              }
              if (workingDayCount < recurringSettings.monthlyWorkingDay) {
                currentDate.setDate(currentDate.getDate() + 1);
              }
            }
            
            return currentDate;
          } else {
            nextMonthly.setMonth(nextMonthly.getMonth() + (recurringSettings.scheduleInterval || 1));
            return nextMonthly;
          }

        default:
          return null;
      }
    } else if (recurringSettings.recurrenceType === 'trigger') {
      // For trigger-based, next occurrence depends on when the trigger event happens
      const delay = recurringSettings.triggerDelay || 1;
      const unit = recurringSettings.triggerDelayUnit || 'days';
      
      const nextTrigger = new Date(now);
      
      switch (unit) {
        case 'minutes':
          nextTrigger.setMinutes(nextTrigger.getMinutes() + delay);
          break;
        case 'hours':
          nextTrigger.setHours(nextTrigger.getHours() + delay);
          break;
        case 'days':
          nextTrigger.setDate(nextTrigger.getDate() + delay);
          break;
        case 'weeks':
          nextTrigger.setDate(nextTrigger.getDate() + (delay * 7));
          break;
      }
      
      return nextTrigger;
    }

    return null;
  }
 // Add method to get user by email
  static async getUserByEmail(email: string) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`/api/users/email/${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  // Add method to get telegram number for a task's assigned user
  static async getTaskAssignedUserTelegram(task: any): Promise<string | null> {
    try {
      const assignedToEmail = task.assignedToEmail;
      const assignedByEmail = task.assignedByEmail;
      const currentUserEmail = JSON.parse(localStorage.getItem('user') || '{}').email;
      
      let targetEmail = '';
      
      // Determine which user's telegram to fetch
      if (assignedToEmail && assignedToEmail !== currentUserEmail) {
        // Task is assigned to someone else - get their telegram
        targetEmail = assignedToEmail;
      } else if (assignedByEmail && assignedByEmail !== currentUserEmail) {
        // Task is assigned by someone else - get their telegram
        targetEmail = assignedByEmail;
      } else {
        // Self-assigned task - get current user's telegram
        targetEmail = currentUserEmail;
      }
      
      if (!targetEmail) return null;
      
      console.log(`🔍 Fetching telegram for assigned user: ${targetEmail}`);
      
      const user = await this.getUserByEmail(targetEmail);
      const telegramNumber = user?.telegramNumber || user?.telegram || user?.phone;
      
      console.log(`📱 Found telegram for ${targetEmail}:`, telegramNumber);
      
      return telegramNumber || null;
    } catch (error) {
      console.error('Error getting assigned user telegram:', error);
      return null;
    }
  }
 static async getTaskContactTelegram(task: any): Promise<string | null> {
    try {
      const assignedToEmail = task.assignedToEmail;
      const assignedByEmail = task.assignedByEmail;
      const currentUserEmail = JSON.parse(localStorage.getItem('user') || '{}').email;
      
      let contactEmail = '';
      
      // Determine who to contact via telegram
      if (assignedByEmail && assignedByEmail !== currentUserEmail) {
        // Task assigned BY someone else - contact the assigner
        contactEmail = assignedByEmail;
      } else if (assignedToEmail && assignedToEmail !== currentUserEmail) {
        // Task assigned TO someone else - contact the assignee  
        contactEmail = assignedToEmail;
      } else {
        // Self-assigned task - no telegram needed
        return null;
      }
      
      console.log(`🔍 Getting telegram for contact: ${contactEmail}`);
      
      // Fetch user's telegram number
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`/api/auth/users/email/${contactEmail}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch user ${contactEmail}:`, response.statusText);
        return null;
      }
      
      const result = await response.json();
      const user = result.data || result;
      const telegramNumber = user?.telegramNumber || user?.telegram || user?.phone;
      
      console.log(`📱 Found telegram for ${contactEmail}:`, telegramNumber);
      return telegramNumber || null;
      
    } catch (error) {
      console.error('Error getting task contact telegram:', error);
      return null;
    }
  }

  // Helper method to validate recurring settings
  static validateRecurringSettings(settings: any): string[] {
    const errors: string[] = [];

    if (!settings.isRecurring) return errors;

    if (!settings.recurrenceType) {
      errors.push('Recurrence type is required');
    }

    if (settings.recurrenceType === 'schedule') {
      if (!settings.schedulePattern) {
        errors.push('Schedule pattern is required');
      }
      
      if (!settings.scheduleStartDate) {
        errors.push('Start date is required');
      }
      
      if (settings.scheduleInterval < 1) {
        errors.push('Schedule interval must be at least 1');
      }
      
      if (settings.schedulePattern === 'weekly' && settings.scheduleWeekdays.length === 0) {
        errors.push('At least one weekday must be selected for weekly recurrence');
      }
    }

    if (settings.recurrenceType === 'trigger') {
      if (!settings.triggerEvent) {
                errors.push('Trigger event is required');
      }
      
      if (settings.triggerDelay < 1) {
        errors.push('Trigger delay must be at least 1');
      }
    }

    if (settings.endCondition === 'after_count' && settings.endCount < 1) {
      errors.push('End count must be at least 1');
    }

    if (settings.endCondition === 'on_date' && !settings.endDate) {
      errors.push('End date is required');
    }

    if (settings.endCondition === 'on_date' && settings.endDate) {
      const endDate = new Date(settings.endDate);
      const startDate = new Date(settings.scheduleStartDate || new Date());
      
      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }
    }

    return errors;
  }

  // Helper method to generate cron expression for backend scheduling
  static generateCronExpression(settings: any): string {
    if (!settings.isRecurring || settings.recurrenceType !== 'schedule') {
      return '';
    }

    const time = new Date(settings.scheduleTime || new Date());
    const minute = time.getMinutes();
    const hour = time.getHours();

    switch (settings.schedulePattern) {
      case 'daily':
        if (settings.workingDaysOnly || settings.skipWeekends) {
          return `${minute} ${hour} * * 1-5`; // Monday to Friday
        }
        return `${minute} ${hour} */${settings.scheduleInterval} * *`;
      
      case 'weekly':
        if (settings.scheduleWeekdays && settings.scheduleWeekdays.length > 0) {
          const days = settings.scheduleWeekdays.join(',');
          return `${minute} ${hour} * * ${days}`;
        }
        return `${minute} ${hour} * * 0`; // Default to Sunday
      
      case 'monthly':
        if (settings.workingDaysOnly && settings.monthlyWorkingDay) {
          // This would need special handling in the backend for "Nth working day"
          return `${minute} ${hour} * * 1-5#${settings.monthlyWorkingDay}`;
        }
        return `${minute} ${hour} 1 */${settings.scheduleInterval} *`;
      
      default:
        return '';
    }
  }

  // Helper method to format recurring description for display
  static formatRecurringDescription(settings: any): string {
    if (!settings.isRecurring) return 'Not recurring';

    let description = '';

    if (settings.recurrenceType === 'schedule') {
      switch (settings.schedulePattern) {
        case 'daily':
          if (settings.workingDaysOnly) {
            description = `Every ${settings.scheduleInterval} working day${settings.scheduleInterval > 1 ? 's' : ''}`;
          } else {
            description = `Every ${settings.scheduleInterval} day${settings.scheduleInterval > 1 ? 's' : ''}`;
          }
          break;
        
        case 'weekly':
          if (settings.scheduleWeekdays && settings.scheduleWeekdays.length > 0) {
            const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const days = settings.scheduleWeekdays.map((d: number) => weekdays[d]).join(', ');
            description = `Weekly on ${days}`;
          } else {
            description = `Every ${settings.scheduleInterval} week${settings.scheduleInterval > 1 ? 's' : ''}`;
          }
          break;
        
        case 'monthly':
          if (settings.workingDaysOnly && settings.monthlyWorkingDay) {
            const ordinal = this.getOrdinalSuffix(settings.monthlyWorkingDay);
            description = `${settings.monthlyWorkingDay}${ordinal} working day of each month`;
          } else {
            description = `Every ${settings.scheduleInterval} month${settings.scheduleInterval > 1 ? 's' : ''}`;
          }
          break;
        
        default:
          description = 'Custom schedule';
      }

      // Add time information
      if (settings.scheduleTime) {
        const time = new Date(settings.scheduleTime);
        description += ` at ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }

    } else if (settings.recurrenceType === 'trigger') {
      const eventMap = {
        completion: 'task completion',
        due_date: 'due date',
        manual: 'manual trigger'
      };
      
      description = `On ${eventMap[settings.triggerEvent as keyof typeof eventMap] || 'event'}, repeat after ${settings.triggerDelay} ${settings.triggerDelayUnit}`;
    }

    // Add end condition
    if (settings.endCondition === 'after_count') {
      description += ` (${settings.endCount} times)`;
    } else if (settings.endCondition === 'on_date' && settings.endDate) {
      const endDate = new Date(settings.endDate);
      description += ` (until ${endDate.toLocaleDateString()})`;
    }

    return description;
  }

  // Helper method to get ordinal suffix
  private static getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  // Method to check if a recurring task should run
  static shouldRecurringTaskRun(task: any): boolean {
    if (!task.isRecurring || task.recurringStatus !== 'active') {
      return false;
    }

    const now = new Date();
    const nextRun = task.nextRun ? new Date(task.nextRun) : null;

    if (!nextRun) return false;

    // Check if it's time to run
    if (now >= nextRun) {
      // Additional checks for end conditions
      if (task.recurrenceSettings?.endCondition === 'after_count') {
        return (task.recurringCount || 0) < (task.recurrenceSettings.endCount || 0);
      }
      
      if (task.recurrenceSettings?.endCondition === 'on_date') {
        const endDate = new Date(task.recurrenceSettings.endDate);
        return now <= endDate;
      }
      
      return true; // 'never' end condition or no specific end condition
    }

    return false;
  }

  // Method to update recurring task after execution
  static async updateRecurringTaskAfterRun(taskId: string, settings: any) {
    try {
      const nextOccurrence = this.calculateNextOccurrence(settings);
      const updateData = {
        recurringCount: (settings.recurringCount || 0) + 1,
        lastRun: new Date().toISOString(),
        nextRun: nextOccurrence?.toISOString() || null,
        status: settings.resetStatus || 'todo'
      };

      // Check if we should stop recurring based on end conditions
      if (settings.endCondition === 'after_count' && updateData.recurringCount >= settings.endCount) {
        // updateData.recurringStatus = 'completed';
        updateData.nextRun = null;
      }

      if (settings.endCondition === 'on_date' && nextOccurrence && nextOccurrence > new Date(settings.endDate)) {
        // updateData.recurringStatus = 'completed';
        updateData.nextRun = null;
      }

      return await this.updateRecurringSettings(taskId, updateData);
    } catch (error) {
      console.error('❌ Error updating recurring task after run:', error);
      throw error;
    }
  }

 

  // Trigger a recurring task run
  static async triggerRecurringTask(taskId: string) {
    try {
      console.log('🔄 Triggering recurring task:', taskId);
      
      // Increment run count
      const updatedTask = await MockRecurringService.incrementRunCount(taskId);
      
      // You could also trigger the actual task start here
      // await this.startAssignedTask(taskId);
      
      return {
        success: true,
        message: 'Recurring task triggered successfully',
        data: updatedTask
      };
    } catch (error) {
      console.error('❌ Error triggering recurring task:', error);
      throw error;
    }
  }
static async startTask(taskData: any) {
  try {
    console.log('🚀 TaskService.startTask called with:', taskData);
    
    // Create a clean payload that matches backend expectations
    const payload: StartTaskPayload = {
      taskId: taskData.taskId || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskName: taskData.taskName || 'Untitled Task',
      type: taskData.type || 'task',
      description: taskData.description || '',
      estimatedTime: taskData.estimatedTime || '',
      dueDate: taskData.dueDate || null,
      status: 'started',
      totalDuration: taskData.totalDuration || 0,
      startDate: new Date().toISOString() // Add required startDate field
    };

    // Add recurring fields if present
    if (taskData.isRecurring) {
      payload.isRecurring = taskData.isRecurring;
      payload.recurringType = taskData.recurringType;
      payload.recurringStatus = taskData.recurringStatus || 'active';
      payload.recurringPattern = taskData.recurringPattern;
      payload.recurringCount = taskData.recurringCount || 0;
      payload.nextRun = taskData.nextRun;
      payload.lastRun = taskData.lastRun;
      payload.recurringInterval = taskData.recurringInterval;
      payload.recurringCron = taskData.recurringCron;
    }

    console.log('📦 Final payload for /tasks/start:', payload);

    // If this is an existing task, use different endpoints
    if (taskData.taskId && taskData.status) {
      if (taskData.status === 'paused') {
        console.log('🔄 Resuming paused task');
        return await this.resumeTask(taskData.taskId, taskData.totalDuration || 0);
      } else if (taskData.status === 'ended') {
        console.log('🔄 Starting ended task');
        return await this.startAssignedTask(taskData.taskId);
      }
    }

    // For new tasks or explicit start requests
    const response = await taskAPI.startTask(payload);
    console.log('✅ Task started successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error starting task:', error);
    
    throw error;
  }
}


  // Helper method to convert Date to ISO string for API
  private static convertDateForAPI(date: Date | null | undefined): string | undefined {
    if (!date) return undefined;
    return date instanceof Date ? date.toISOString() : undefined;
  }

  // Helper method to convert TaskData to API format
  private static convertToAPIFormat(taskData: TaskData): TaskDataForAPI {
    return {
      taskName: taskData.taskName,
      type: taskData.type,
      description: taskData.description,
      estimatedTime: taskData.estimatedTime,
      dueDate: this.convertDateForAPI(taskData.dueDate)
    };
  }

  // Helper method to convert AssignTaskData to API format
  private static convertAssignTaskToAPIFormat(taskData: AssignTaskData): AssignTaskDataForAPI {
    return {
      taskName: taskData.taskName,
      type: taskData.type,
      assignedToEmail: taskData.assignedToEmail,
      description: taskData.description,
      estimatedTime: taskData.estimatedTime,
      dueDate: this.convertDateForAPI(taskData.dueDate)
    };
  }

  // Create a new task
  static async createTask(taskData: TaskData) {
    try {
      const apiData = this.convertToAPIFormat(taskData);
      const response = await taskAPI.createTask(apiData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

 static async createCompletedTask(taskData: any) {
    try {
      console.log('📡 Creating completed task via API:', taskData);
      const response = await taskAPI.createCompletedTask(taskData);
      return response.data;
    } catch (error: any) {
      console.error('❌ TaskService.createCompletedTask error:', error);
      throw error;
    }
  }
  // Assign task to user (using existing assignTask endpoint)
 static async assignTask(taskData: any) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      console.log('📝 Assigning task:', {
        taskName: taskData.taskName,
        assignedToEmail: taskData.assignedToEmail,
        isRecurring: taskData.isRecurring
      });

      const response = await fetch('/api/tasks/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign task');
      }

      const result = await response.json();
            // ✅ Log telegram info from response
      if (result.telegramInfo) {
        console.log('📱 Task assigned with telegram info:', {
          taskId: result.data?.taskId,
          taskName: result.data?.taskName,
          assignedByTelegram: result.telegramInfo.assignedByTelegram || 'Not available',
          assignedToTelegram: result.telegramInfo.assignedToTelegram || 'Not available',
          telegramIncluded: result.telegramInfo.telegramIncluded
        });
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
        telegramInfo: result.telegramInfo
      };
    } catch (error) {
      console.error('Error assigning task:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to assign task',
        error
      };
    }
  }

  // ✅ Enhanced createTaskAssignment method
  static async createTaskAssignment(taskData: any) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      console.log('📝 Creating task assignment:', {
        taskName: taskData.taskName,
        assignedToEmail: taskData.assignedToEmail,
        isRecurring: taskData.isRecurring,
         approvalNeeded: taskData.approvalNeeded, 
      });

      const response = await fetch('/api/tasks/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...taskData,
          approvalNeeded: taskData.approvalNeeded || false // Ensure this is included
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task assignment');
      }

      const result = await response.json();
          if (result.data) {
        console.log('📱 Task assignment created with approval setting:', {
          taskId: result.data?.taskId,
          taskName: result.data?.taskName,
          approvalNeeded: result.data?.approvalNeeded,
          assignedToEmail: result.data?.assignedToEmail
        });
      }
      // ✅ Log telegram info from response
      if (result.telegramInfo) {
        console.log('📱 Task assignment created with telegram info:', {
          taskId: result.data?.taskId,
          taskName: result.data?.taskName,
          assignedByTelegram: result.telegramInfo.assignedByTelegram || 'Not available',
          assignedToTelegram: result.telegramInfo.assignedToTelegram || 'Not available',
          telegramIncluded: result.telegramInfo.telegramIncluded
        });
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
        telegramInfo: result.telegramInfo
      };
    } catch (error) {
      console.error('Error creating task assignment:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create task assignment',
        error
      };
    }
  }





// ✅ REPLACE the existing approval methods with these:

// ✅ Enhanced approval methods with better error handling
static async getPendingApprovalTasks() {
  try {
    console.log('🔍 Fetching pending approval tasks...');
    const response = await taskAPI.getPendingApprovalTasks();
    console.log('✅ Pending approval tasks fetched:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching pending approval tasks:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        headers: error.config?.headers
      }
    });
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to fetch pending approval tasks',
      data: []
    };
  }
}

static async approveTask(taskId: string, approvedBy: string, comments?: string) {
  try {
    console.log('🚀 Approving task:', { 
      taskId, 
      approvedBy, 
      comments,
      endpoint: `/tasks/${taskId}/approve`
    });
    
    const requestData = { approvedBy, comments };
    console.log('📦 Request data:', requestData);
    
    const response = await taskAPI.approveTask(taskId, requestData);
    
    console.log('✅ Task approved successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error approving task:', {
      taskId,
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to approve task' 
    };
  }
}

static async rejectTask(taskId: string, rejectedBy: string, reason?: string) {
  try {
    console.log('🚀 Rejecting task:', { 
      taskId, 
      rejectedBy, 
      reason,
      endpoint: `/tasks/${taskId}/reject`
    });
    
    const requestData = { rejectedBy, reason };
    console.log('📦 Request data:', requestData);
    
    const response = await taskAPI.rejectTask(taskId, requestData);
    
    console.log('✅ Task rejected successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error rejecting task:', {
      taskId,
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to reject task' 
    };
  }
}


// Update the getAllTasks method
// static async getAllTasks() {
//   try {
//     // Try to determine user role and use appropriate endpoint
//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//     const isAdmin = user.role === 'admin';
    
//     let response;
//     if (isAdmin) {
//       response = await taskAPI.getAdminTasks();
//     } else {
//       response = await taskAPI.getUserTasks();
//     }
    
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching tasks:', error);
//     throw error;
//   }
// }

  // Get all tasks
  static async getAllTasks() {
    try {
      const response = await taskAPI.getAllTasks();
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Get user-specific tasks
  static async getUserTasks() {
    try {
      const response = await taskAPI.getUserTasks();
      return response.data;
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  }

  // Get admin tasks
  static async getAdminTasks() {
    try {
      const response = await taskAPI.getAdminTasks();
      return response.data;
    } catch (error) {
      console.error('Error fetching admin tasks:', error);
      throw error;
    }
  }

  // Get assigned tasks
  static async getAssignedTasks(userEmail: any) {
    try {
      const response = await taskAPI.getAssignedTasks();
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
      throw error;
    }
  }

  // Get active tasks
  static async getActiveTasks() {
    try {
      const response = await taskAPI.getActiveTasks();
      return response.data;
    } catch (error) {
      console.error('Error fetching active tasks:', error);
      throw error;
    }
  }

  // Start assigned task
  static async startAssignedTask(taskId: string) {
    try {
      const response = await taskAPI.startAssignedTask(taskId);
      return response.data;
    } catch (error) {
      console.error('Error starting assigned task:', error);
      throw error;
    }
  }

  // Pause task
  static async pauseTask(taskId: string, elapsedTime: number) {
    try {
      console.log('🔄 TaskService.pauseTask:', { taskId, elapsedTime });
      const response = await taskAPI.pauseTask(taskId, { 
        elapsedTime,
        pausedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error pausing task:', error);
      throw error;
    }
  }

  // Resume task
  static async resumeTask(taskId: string, elapsedTime: number = 0) {
    try {
      console.log('🔄 TaskService.resumeTask:', { taskId, elapsedTime });
      const response = await taskAPI.resumeTask(taskId, {
        elapsedTime,
        resumedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error resuming task:', error);
      throw error;
    }
  }

static async endTask(taskId: string, elapsedTime: number, description?: string) {
  try {
    console.log('🔄 TaskService.endTask:', { taskId, elapsedTime, description });
    
    const payload = {
      elapsedTime,
      endedAt: new Date().toISOString(),
      // Only include description if it's provided and not empty
      ...(description && description.trim().length > 0 && { description: description.trim() })
    };
    
    const response = await taskAPI.endTask(taskId, payload);
    return response.data;
  } catch (error) {
    console.error('Error ending task:', error);
    throw error;
  }
}

  // Get tasks by date range
  static async getTasksByDateRange(startDate: string, endDate: string) {
    try {
      const response = await taskAPI.getTasksByDateRange({ startDate, endDate });
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks by date range:', error);
      throw error;
    }
  }

  static async getTaskById(taskId: string) {
    try {
      const response = await taskAPI.getTaskById(taskId);
      return response.data;
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      throw error;
    }
  }

  // Utility methods (keeping existing ones)
  static formatTaskData(taskData: Partial<TaskData>): TaskData {
    return {
      taskName: taskData.taskName || '',
      type: taskData.type || 'task',
      description: taskData.description || '',
      estimatedTime: taskData.estimatedTime || '',
      dueDate: taskData.dueDate || null
    };
  }

  static formatAssignTaskData(taskData: Partial<AssignTaskData>): AssignTaskData {
    return {
      taskName: taskData.taskName || '',
      type: taskData.type || 'task',
      assignedToEmail: taskData.assignedToEmail || '',
      description: taskData.description || '',
      estimatedTime: taskData.estimatedTime || '',
      dueDate: taskData.dueDate || null,
       approvalNeeded: taskData.approvalNeeded || false

    };
  }

  static validateTaskData(taskData: Partial<TaskData>): string[] {
    const errors: string[] = [];

    if (!taskData.taskName || taskData.taskName.trim() === '') {
      errors.push('Task name is required');
    }

    if (!taskData.type || !['task', 'meeting'].includes(taskData.type)) {
      errors.push('Valid task type is required (task or meeting)');
    }

    if (taskData.dueDate) {
      const dueDate = taskData.dueDate instanceof Date ? taskData.dueDate : new Date(taskData.dueDate);
      const now = new Date();
      
      if (isNaN(dueDate.getTime())) {
        errors.push('Invalid due date format');
      } else if (dueDate < now) {
        errors.push('Due date cannot be in the past');
      }
    }

    return errors;
  }

  static validateAssignTaskData(taskData: Partial<AssignTaskData>): string[] {
    const errors = this.validateTaskData(taskData);

    if (!taskData.assignedToEmail || taskData.assignedToEmail.trim() === '') {
      errors.push('Assigned user email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (taskData.assignedToEmail && !emailRegex.test(taskData.assignedToEmail)) {
      errors.push('Invalid email format');
    }
 console.log('🔍 Validation - Approval needed:', taskData.approvalNeeded);
    return errors;
  }

  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  static formatEstimatedTime(estimatedTime?: string): string {
    if (!estimatedTime) return 'Not specified';
    return estimatedTime;
  }

  static formatDueDate(dueDate?: Date | string | null): string {
    if (!dueDate) return 'No deadline';
    
    try {
      const date = dueDate instanceof Date ? dueDate : new Date(dueDate);
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  }

  static isTaskOverdue(dueDate?: Date | string | null): boolean {
    if (!dueDate) return false;
    
    try {
      const due = dueDate instanceof Date ? dueDate : new Date(dueDate);
      const now = new Date();
      return due < now;
    } catch (error) {
      return false;
    }
  }

  static getTimeUntilDue(dueDate?: Date | string | null): string {
    if (!dueDate) return '';
    
    try {
      const due = dueDate instanceof Date ? dueDate : new Date(dueDate);
      const now = new Date();
      const diff = due.getTime() - now.getTime();
      
      if (diff < 0) return 'Overdue';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `${days}d ${hours}h remaining`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m remaining`;
      } else {
        return `${minutes}m remaining`;
      }
    } catch (error) {
      return '';
    }
  }

  static getTaskPriority(dueDate?: Date | string | null): 'high' | 'medium' | 'low' | 'none' {
    if (!dueDate) return 'none';
    
    try {
      const due = dueDate instanceof Date ? dueDate : new Date(dueDate);
      const now = new Date();
      const diff = due.getTime() - now.getTime();
      const hoursUntilDue = diff / (1000 * 60 * 60);
      
      if (hoursUntilDue < 0) return 'high';
      if (hoursUntilDue < 24) return 'high';
      if (hoursUntilDue < 72) return 'medium';
      return 'low';
    } catch (error) {
      return 'none';
    }
  }

  static getPriorityColor(priority: 'high' | 'medium' | 'low' | 'none'): string {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  }

 private static getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }
}
// Add these methods to your existing TaskService class

// Task Mapping Methods
export const getTaskMappings = async (userEmail: string) => {
  try {
    const response = await taskAPI.getTaskMappings(userEmail);
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error: any) {
    console.error('Error fetching task mappings:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch task mappings'
    };
  }
};

export const saveTaskMapping = async (mappingData: {
  taskName: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  category?: string;
  description?: string;
}) => {
  try {
    const response = await taskAPI.saveTaskMapping(mappingData);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Error saving task mapping:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to save task mapping'
    };
  }
};

export const updateTaskMapping = async (id: string, mappingData: {
  taskName?: string;
  level?: 'L1' | 'L2' | 'L3' | 'L4';
  category?: string;
  description?: string;
}) => {
  try {
    const response = await taskAPI.updateTaskMapping(id, mappingData);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Error updating task mapping:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update task mapping'
    };
  }
};

export const deleteTaskMapping = async (id: string) => {
  try {
    const response = await taskAPI.deleteTaskMapping(id);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error deleting task mapping:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete task mapping'
    };
  }
};

export const getTaskLevelStats = async (userEmail: string) => {
  try {
    const response = await taskAPI.getTaskLevelStats(userEmail);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Error fetching task level stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch task level stats'
    };
  }
};

export const exportTaskLevelReport = async (userEmail: string) => {
  try {
    const response = await taskAPI.exportTaskLevelReport(userEmail);
    
    // Handle file download
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-level-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: 'Report downloaded successfully'
    };
  } catch (error: any) {
    console.error('Error exporting task level report:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to export report'
    };
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const response = await taskAPI.deleteTask(taskId);
    return {
      success: true,
      data: response.data,
      message: 'Task deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to delete task'
    };
  }
};

export const editTask = async (taskId: string, updateData: any) => {
  try {
    const response = await taskAPI.editTask(taskId, updateData);
    return {
      success: true,
      data: response.data,
      message: 'Task updated successfully'
    };
  } catch (error: any) {
    console.error('Error editing task:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update task'
    };
  }
};


export default TaskService;

