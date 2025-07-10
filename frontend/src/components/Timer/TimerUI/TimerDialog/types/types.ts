import type { Task } from "../../../../../types/task.types";

export interface AssignTaskData {
  taskName: string;
  type: 'task' | 'meeting';
  assignedToEmail: string;
  description: string;
  estimatedTime: string;
  dueDate: Date | null;
  estimatedHours?: string;
  estimatedMinutes?: string;

   approvalNeeded?: boolean;
  
  // Add recurring fields
  isRecurring?: boolean;
  recurringOptions?: {
    skipWeekends?: boolean;
    workingDaysOnly?: boolean;
    statusOptions?: string[];
    repeatType?: 'schedule' | 'trigger';
    repeatInterval?: 'daily' | 'weekly' | 'monthly' | 'custom';
    repeatCount?: number;
    endCondition?: 'never' | 'after' | 'on';
    specificDays?: number[];
    monthlyOption?: 'date' | 'day';
    customInterval?: number;
    endDate?: Date | null;
  };
}


export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

export interface TaskTimerState {
  showTaskNameInput: boolean;
  showAlarmDialog: boolean;
  taskType: 'task' | 'meeting';
  taskName: string;
}
export interface ApprovalTask extends Task {
  approvalNeeded: boolean;
  isApproved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  approvalComments?: string;
}