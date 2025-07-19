
export interface Task {
  taskId: string;
  id?: string;
  taskName: string;
  type: 'task' | 'meeting';
  status: "started" | "paused" | "resumed" | "ended" | "completed" | "approved" | "rejected" | "assigned" | "todo" | "pending" | "inprogress";
  totalDuration: number;
  userEmail: string;
  username?: string;
  activities?: Activity[];
  isAssigned?: boolean;
  assignedBy?: string;
  assignedTo?: string;
  assignedByEmail?: string;
  assignedToEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  elapsedTime?: number;
  resumedAt?: string;

  // ✅ Added missing properties
  createdBy?: string;
  userId?: string;
  assignedToName?: string;
  assignedAt?: string;

  // Approval properties
  approvalNeeded?: boolean;
  isApproved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  approvalComments?: string;
  assignmentHistory?: AssignmentHistory[];
  
  // Recurring task properties
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'custom' | 'schedule' | 'trigger';
  recurringStatus?: 'active' | 'paused' | 'disabled' | 'completed';
  recurringPattern?: string | {
    frequency?: string;
    interval?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    time?: string;
    workingDaysOnly?: boolean;
    skipWeekends?: boolean;
  };
  recurringCount?: number;
  nextRun?: string;
  lastRun?: string;
  recurringInterval?: number;
  recurringCron?: string;
  recurringOptions?: {
    skipWeekends?: boolean;
    workingDaysOnly?: boolean;
    statusOptions?: string[];
    repeatType?: 'schedule' | 'trigger';
    repeatInterval?: 'daily' | 'weekly' | 'monthly' | 'custom';
    repeatCount?: number;
    customInterval?: number;
    endCondition?: 'never' | 'after' | 'on';
    endDate?: string;
    specificDays?: number[];
    monthlyOption?: 'date' | 'day';
  };

  // Additional task properties
  description?: string;
  estimatedTime?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';

  // Telegram properties
  assignedByTelegram?: string;
  assignedToTelegram?: string;
  userTelegram?: string;
  telegramNumber?: string;
}

export interface Activity {
  id?: string;
  action: string;
  timestamp: string;
  userEmail?: string;
  user_email?: string;
  duration?: number;
  notes?: string;
  assignedBy?: string;
  assignedTo?: string;
  assignedByTelegram?: string;
  assignedToTelegram?: string;
}

export interface AssignmentHistory {
  assignedBy: string;
  assignedTo: string;
  assignedAt: string;
  reason?: string;
}

export interface UserGroup {
  userEmail: string;
  username: string;
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  assignedTasks: number;
  selfCreatedTasks: number;
  totalDuration: number;
  tasks: Task[];
  recurringTasks?: number;
}

export interface TableFilters {
  taskName: string;
  username: string;
  type: string;
  status: string;
  dateRange: string;
  customStartDate: string;
  customEndDate: string;
  assignmentType?: string;
  recurringType?: string;
  recurringStatus?: string;
}

export interface TaskHistoryTableProps {
  showHistory: boolean;
  onToggleHistory: () => void;
  filteredTasks: Task[];
  tableFilters: TableFilters;
  onFilterChange: (key: keyof TableFilters, value: string) => void;
  tablePage: number;
  tableRowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  expandedRows: Set<string>;
  onToggleRowExpansion: (id: string) => void;
  formatTime: (seconds: number) => string;
  onTableAction: (task: Task, action: 'resume' | 'stop' | 'start') => void;
  isRunning: boolean;
  currentUser: any;
  isAdmin?: boolean;
  isActivityPage?: boolean;
  allTasks?: Task[];
  assignedTasks?: Task[];
  
  onExportTaskLevelReport?: (userEmail: string) => Promise<void>;
  
  
  
}

export interface ComponentProps {
  tasks: Task[];
  formatTime: (seconds: number) => string;
  onTableAction: (task: Task, action: 'resume' | 'stop' | 'start') => void;
  isRunning: boolean;
  currentUser: any;
  calculatedDurations: Record<string, number>;
  onDurationCalculated: (taskId: string, duration: number) => void;
  onToggleRecurring?: (task: Task) => void;
}

export interface AssignedTasksProps extends ComponentProps {
  expandedRows: Set<string>;
  onToggleRowExpansion: (id: string) => void;
}

export interface RecurringTasksProps extends ComponentProps {
  onEditRecurring?: (task: Task) => void;
  onDisableRecurring?: (task: Task) => void;
  onDeleteRecurring?: (task: Task) => void;
}

// ✅ Additional interfaces for better type safety
export interface NewTaskRow {
  id: string;
  taskName: string;
  type: 'task' | 'meeting';
  startTime: Date | null;
  endTime: Date | null;
  status: 'draft' | 'saving' | 'completed';
  error?: string;
}

export interface AddTasksTableProps {
  currentUser: any;
  onTaskCreate: (taskData: Partial<Task>) => Promise<void>;
  formatTime: (seconds: number) => string;
}

export interface TaskCreationData {
  taskId: string;
  taskName: string;
  type: 'task' | 'meeting';
  status: 'ended';
  userEmail: string;
  username: string;
  startDate: string;
  endDate: string;
  totalDuration: number;
  activities: Activity[];
  createdAt: string;
  createdBy: string;
}

// ✅ Export commonly used types
export type TaskStatus = Task['status'];
export type TaskType = Task['type'];
export type TaskPriority = Task['priority'];
export type RecurringType = Task['recurringType'];
export type RecurringStatus = Task['recurringStatus'];
