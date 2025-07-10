export class Task {
  static findOneAndUpdate(arg0: { taskId: string; }, arg1: { $set: any; }, arg2: { new: boolean; runValidators: boolean; }) {
    throw new Error('Method not implemented.');
  }
  static findOne(arg0: { taskId: string; }) {
    throw new Error('Method not implemented.');
  }
  id?: string;
  taskId: string;
  taskName: string;
  type: string;
  status: string;
    approvalNeeded?: boolean;
  isApproved?: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  approvalComments?: string;
  startDate: Date;
  endDate?: Date;
  totalDuration: number;
  activities: any[];
  isAssigned: boolean;
  assignedTo?: string;
  assignedToEmail?: string;
  assignedBy?: string;
  description: string;
  estimatedTime?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt?: Date;
  updatedAt?: Date;
 assignedByTelegram?: string;
  assignedToTelegram?: string;
  userTelegram?: string;
   telegramNumber?: string;
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurringStatus?: 'active' | 'paused' | 'disabled';
  recurringPattern?: string;
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
  userEmail: string;

  constructor(data: Partial<Task>) {
    this.id = data.id;
    this.taskId = data.taskId || '';
    this.taskName = data.taskName || '';
    this.type = data.type || 'task';
    this.status = data.status || 'started';
    this.startDate = data.startDate || new Date();
    this.endDate = data.endDate;
    this.totalDuration = data.totalDuration || 0;
    this.activities = data.activities || [];
    this.isAssigned = data.isAssigned || false;
    this.assignedTo = data.assignedTo;
    this.assignedToEmail = data.assignedToEmail;
    this.assignedBy = data.assignedBy;
    this.description = data.description || '';
    this.estimatedTime = data.estimatedTime;
    this.dueDate = data.dueDate;
    this.priority = data.priority || 'medium';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
 this.assignedByTelegram = data.assignedByTelegram;
    this.assignedToTelegram = data.assignedToTelegram;
    this.userTelegram = data.userTelegram;
        this.telegramNumber = data.telegramNumber;
    this.isRecurring = data.isRecurring || false;
    this.recurringType = data.recurringType;
    this.recurringStatus = data.recurringStatus;
    this.recurringPattern = data.recurringPattern;
    this.recurringCount = data.recurringCount || 0;
    this.nextRun = data.nextRun;
    this.lastRun = data.lastRun;
    this.recurringInterval = data.recurringInterval;
    this.recurringCron = data.recurringCron;
    this.recurringOptions = data.recurringOptions;
    this.userEmail = data.userEmail || '';

     this.approvalNeeded = data.approvalNeeded || false;
    this.isApproved = data.isApproved || false;
    this.approvedBy = data.approvedBy;
    this.approvedAt = data.approvedAt;
    this.rejectedBy = data.rejectedBy;
    this.rejectedAt = data.rejectedAt;
    this.approvalComments = data.approvalComments || '';
  }
}
