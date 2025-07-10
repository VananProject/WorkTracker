export interface CreateTaskDto {
  taskId: string;
  taskName: string;
  type: 'task' | 'meeting';
  status?: 'started' | 'paused' | 'resumed' | 'ended' | 'assigned' | 'todo' | 'pending' | 'inprogress' | 'completed' | 'approved' | 'rejected';
  startDate?: Date;
  totalDuration?: number;
  activities?: any[];
  description?: string;
  estimatedTime?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  
  // Telegram fields
  assignedByTelegram?: string;
  assignedToTelegram?: string;
  userTelegram?: string;
  telegramNumber?: string;
  
  // Enhanced recurring fields
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurringStatus?: 'active' | 'paused' | 'disabled';
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    workingDaysOnly?: boolean;
    skipWeekends?: boolean;
  };
  recurringCount?: number;
  nextRun?: string;
  lastRun?: string;
  recurringInterval?: number;
  recurringCron?: string;
  recurringEndCondition?: {
    type: 'never' | 'after' | 'on';
    value?: number | string;
  };
  
  // Approval fields
  approvalNeeded?: boolean;
  isApproved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  approvalComments?: string;
}
// Add these DTOs for task mapping

export interface CreateTaskMappingDto {
  taskName: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  category?: string;
  description?: string;
}

export interface UpdateTaskMappingDto {
  taskName?: string;
  level?: 'L1' | 'L2' | 'L3' | 'L4';
  category?: string;
  description?: string;
}

export interface TaskMappingResponseDto {
  id: string;
  taskName: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  category?: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskLevelStatsDto {
  mappingCounts: {
    L1: number;
    L2: number;
    L3: number;
    L4: number;
    total: number;
  };
  taskCounts: {
    L1: number;
    L2: number;
    L3: number;
    L4: number;
    unmapped: number;
  };
  taskDurations: {
    L1: number;
    L2: number;
    L3: number;
    L4: number;
    unmapped: number;
  };
  totalTasks: number;
  totalDuration: number;
}

export interface AssignTaskDto {
  taskName: string;
  type: 'task' | 'meeting';
  assignedToEmail: string;
  description?: string;
  estimatedTime?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'assigned' | 'todo' | 'pending' | 'started' | 'inprogress';
  
  // Telegram fields
  assignedByTelegram?: string;
  assignedToTelegram?: string;
  telegramNumber?: string;
  
  // Assignment tracking
  assignedToName?: string;
  assignedBy?: {
    userId: string;
    username: string;
    email: string;
    telegramNumber?: string;
  };
  assignedByEmail?: string;
  createdBy?: string;
  userEmail?: string;
  username?: string;
  
  // Enhanced recurring fields
  isRecurring?: boolean;
  recurringOptions?: {
    skipWeekends?: boolean;
    workingDaysOnly?: boolean;
    statusOptions?: string[];
    repeatType?: 'schedule' | 'trigger';
    repeatInterval?: 'daily' | 'weekly' | 'monthly' | 'custom';
    repeatCount?: number;
    customInterval?: number;
    endCondition?: 'never' | 'after' | 'on';
    endDate?: Date | string | null;
    specificDays?: number[];
    monthlyOption?: 'date' | 'day';
  };
  recurringStatus?: 'active' | 'paused' | 'disabled';
  recurringType?: 'schedule' | 'trigger';
  recurringCount?: number;
  
  // Approval fields
  approvalNeeded?: boolean;
}

export interface RecurringOptionsDto {
  skipWeekends?: boolean;
  workingDaysOnly?: boolean;
  statusOptions?: string[];
  repeatType?: 'schedule' | 'trigger';
  repeatInterval?: 'daily' | 'weekly' | 'monthly' | 'custom';
  repeatCount?: number;
  customInterval?: number;
  endCondition?: 'never' | 'after' | 'on';
  endDate?: string | Date | null;
  specificDays?: number[];
  monthlyOption?: 'date' | 'day';
  nextRunDate?: Date;
}

export interface CreateTaskAssignmentDto {
  taskName: string;
  type: 'task' | 'meeting';
  assignedToEmail: string;
  description?: string;
  estimatedTime?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'pending' | 'started' | 'inprogress' | 'assigned';
  assignedBy?: string;
  
  // Telegram fields
  telegramNumber?: string;
  assignedByTelegram?: string;
  assignedToTelegram?: string;
  
  // Recurring fields
  isRecurring?: boolean;
  recurringOptions?: RecurringOptionsDto;
  
  // Approval fields
  approvalNeeded?: boolean;
}

export interface ApproveTaskDto {
  taskId: string;
  approvedBy: string;
  approvalComments?: string;
}

export interface RejectTaskDto {
  taskId: string;
  rejectedBy: string;
  rejectionReason?: string;
}

export interface UpdateTaskDto {
  status?: 'started' | 'paused' | 'resumed' | 'ended' | 'completed' | 'approved' | 'rejected';
  elapsedTime?: number;
  endDate?: Date;
  timestamp?: Date;
  
  // Task details
  taskName?: string;
  description?: string;
  estimatedTime?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  
  // Recurring fields
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurringStatus?: 'active' | 'paused' | 'disabled';
  recurringPattern?: any;
  recurringCount?: number;
  nextRun?: string;
  lastRun?: string;
  recurringInterval?: number;
  recurringCron?: string;
  endConditions?: any;
  recurrenceSettings?: any;
  
  // Approval fields
  approvalNeeded?: boolean;
  isApproved?: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  approvalComments?: string;
  
  // Telegram fields
  telegramNumber?: string;
  assignedByTelegram?: string;
  assignedToTelegram?: string;
}

export interface TaskResponseDto {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  userRole?: 'admin' | 'user';
  telegramInfo?: {
    assignedByTelegram?: string | null;
    assignedToTelegram?: string | null;
    telegramIncluded?: boolean;
  };
}

export interface TaskQueryDto {
  startDate?: string;
  endDate?: string;
  status?: string;
  assignedToEmail?: string;
  isRecurring?: boolean;
  approvalNeeded?: boolean;
  isApproved?: boolean;
}

export interface TaskActivityDto {
  action: 'started' | 'paused' | 'resumed' | 'ended' | 'assigned';
  timestamp: Date;
  duration: number;
  assignedBy?: string;
  assignedTo?: string;
  assignedByTelegram?: string;
  assignedToTelegram?: string;
}

export interface TaskStatsDto {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  pendingApproval: number;
  recurringTasks: number;
  totalDuration: number;
}

export interface BulkTaskActionDto {
  taskIds: string[];
  action: 'approve' | 'reject' | 'delete' | 'archive';
  actionBy: string;
  comments?: string;
}

export interface TaskFilterDto {
  userEmail?: string;
  status?: string[];
  type?: 'task' | 'meeting';
  isAssigned?: boolean;
  isRecurring?: boolean;
  approvalNeeded?: boolean;
  isApproved?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  priority?: 'low' | 'medium' | 'high';
  assignedBy?: string;
  assignedTo?: string;
}

// Export types for better type safety
export type TaskStatus = 'started' | 'paused' | 'resumed' | 'ended' | 'assigned' | 'todo' | 'pending' | 'inprogress' | 'completed' | 'approved' | 'rejected';
export type TaskType = 'task' | 'meeting';
export type TaskPriority = 'low' | 'medium' | 'high';
export type RecurringType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type RecurringStatus = 'active' | 'paused' | 'disabled';
export type RepeatType = 'schedule' | 'trigger';
export type RepeatInterval = 'daily' | 'weekly' | 'monthly' | 'custom';
export type EndCondition = 'never' | 'after' | 'on';
export type MonthlyOption = 'date' | 'day';
export type TaskAction = 'started' | 'paused' | 'resumed' | 'ended' | 'assigned';
