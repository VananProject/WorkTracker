// import mongoose, { Document, Schema } from 'mongoose';

// export interface IActivity {
//   action: 'started' | 'paused' | 'resumed' | 'ended' | 'assigned';
//   timestamp: Date;
//   duration: number;
//   assignedBy?: string; // Optional field for assignment activities
//   assignedTo?: string; // Optional field for assignment activities
// }

// export interface IAssignedBy {
//   userId: string;
//   username: string;
//   email: string;
// }

// export interface ITask extends Document {
//   taskId: string;
//   taskName: string;
//   type: 'task' | 'meeting';
//   status: 'started' | 'paused' | 'resumed' | 'ended' | 'assigned';
//   description?: string;
//   estimatedTime?: string;
//   dueDate?: string;
//   startDate: string;
//   endDate?: string;
//   totalDuration: number;
//   isAssigned: boolean;
//   assignedToEmail?: string;
//   assignedToName?: string; // NEW FIELD
//   assignedByEmail?: string; // NEW FIELD
//   assignedBy?: IAssignedBy;
//   assignedAt?: Date; // NEW FIELD
//   createdBy: string;
//   userEmail: string;
//   username: string;
//   userId?: string;
//   activities: IActivity[];
//   createdAt: Date;
//   updatedAt: Date;

//    isRecurring?: boolean;
//   recurringType?: 'daily' | 'weekly' | 'monthly' | 'custom' | 'schedule' | 'trigger';
//   recurringStatus?: 'active' | 'paused' | 'disabled' | 'completed';
//   recurringPattern?: {
//     frequency?: string;
//     interval?: number;
//     daysOfWeek?: number[];
//     dayOfMonth?: number;
//     time?: string;
//     workingDaysOnly?: boolean;
//     skipWeekends?: boolean;
//   };
//   recurringCount?: number;
//   nextRun?: string;
//   lastRun?: string;
//   recurringInterval?: number;
//   recurringCron?: string;
//   endConditions?: {
//     never?: boolean;
//     afterRuns?: number;
//     endDate?: string;
//   };
//   recurrenceSettings?: any; 
// }

// const ActivitySchema = new Schema<IActivity>({
//   action: {
//     type: String,
//     enum: ['started', 'paused', 'resumed', 'ended', 'assigned'],
//     required: true
//   },
//   timestamp: {
//     type: Date,
//     required: true,
//     default: Date.now
//   },
//   duration: {
//     type: Number,
//     default: 0
//   }
// });

// const AssignedBySchema = new Schema<IAssignedBy>({
//   userId: {
//     type: String,
//     required: true
//   },
//   username: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true
//   }
// });

// const TaskSchema = new Schema<ITask>({
//   taskId: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   taskName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   type: {
//     type: String,
//     enum: ['task', 'meeting'],
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['started', 'paused', 'resumed', 'ended', 'assigned'],
//     default: 'started'
//   },
//   description: {
//     type: String,
//     trim: true
//   },
//   estimatedTime: { // NEW FIELD
//     type: String,
//     trim: true
//   },
//   dueDate: { // NEW FIELD
//     type: String
//   },
//   startDate: {
//     type: String,
//     required: true
//   },
//   endDate: {
//     type: String
//   },
//   totalDuration: {
//     type: Number,
//     default: 0
//   },
//   isAssigned: {
//     type: Boolean,
//     default: false
//   },
//   assignedByEmail: {
//     type: String,
//     required: false,
//     index: true // Add index for better query performance
//   },
//   assignedToEmail: {
//     type: String,
//     trim: true,
//     lowercase: true
//   },
//    assignedToName: {
//     type: String,
//     required: false
//   },
//   assignedAt: {
//     type: Date,
//     required: false
//   },
//   assignedBy: AssignedBySchema,
//   createdBy: {
//     type: String,
//     required: true,
//     trim: true,
//     lowercase: true
//   },
//   userEmail: {
//     type: String,
//     required: true,
//     trim: true,
//     lowercase: true
//   },
//   username: {
//     type: String,
//     trim: true
//   },
//   userId: {
//     type: String
//   },

//  isRecurring: {
//     type: Boolean,
//     default: false
//   },
//   recurringType: {
//     type: String,
//     enum: ['daily', 'weekly', 'monthly', 'custom', 'schedule', 'trigger'],
//     required: false
//   },
//   recurringStatus: {
//     type: String,
//     enum: ['active', 'paused', 'disabled', 'completed'],
//     required: false
//   },
//   recurringPattern: {
//     type: Schema.Types.Mixed, // Allow complex objects
//     required: false
//   },
//   recurringCount: {
//     type: Number,
//     default: 0
//   },
//   nextRun: {
//     type: String,
//     required: false
//   },
//   lastRun: {
//     type: String,
//     required: false
//   },
//   recurringInterval: {
//     type: Number,
//     required: false
//   },
//   recurringCron: {
//     type: String,
//     required: false
//   },
//   endConditions: {
//     type: Schema.Types.Mixed, // Allow complex objects
//     required: false
//   },
//   recurrenceSettings: {
//     type: Schema.Types.Mixed, // Store full settings
//     required: false
//   },
 
//   activities: [ActivitySchema]
// }, {
//   timestamps: true,
//    strict: false
// });

// TaskSchema.virtual('user', {
//   ref: 'User',
//   localField: 'userId',
//   foreignField: '_id',
//   justOne: true
// });

// // Ensure virtual fields are included in JSON output
// TaskSchema.set('toJSON', { virtuals: true });
// TaskSchema.set('toObject', { virtuals: true });

// const Task = mongoose.model<ITask>('Task', TaskSchema);
// export default Task;
import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity {
  action: 'started' | 'paused' | 'resumed' | 'ended' | 'assigned';
  timestamp: Date;
  duration: number;
  assignedBy?: string;
  assignedTo?: string;
}

export interface IAssignedBy {
  userId: string;
  username: string;
  email: string;
  telegramNumber: string;
}

export interface IRecurringOptions {
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
}

export interface ITask extends Document {
  taskId: string;
  taskName: string;
  type: 'task' | 'meeting';
 status: 'started' | 'paused' | 'resumed' | 'ended' | 'assigned' | 'todo' | 'pending' | 'inprogress' | 'completed' | 'approved' | 'rejected'; 
  description?: string;
  estimatedTime?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  startDate: string;
  endDate?: string;
  totalDuration: number;
  isAssigned: boolean;
  assignedToEmail?: string;
  assignedToName?: string;
  assignedByEmail?: string;
  assignedBy?: IAssignedBy;
  assignedAt?: Date;

   assignedByTelegram?: string;
  assignedToTelegram?: string;
  userTelegram?: string;
  telegramNumber?: string;
  createdBy: string;
  userEmail: string;
  username: string;
  userId?: string;
  activities: IActivity[];
  createdAt: Date;
  updatedAt: Date;

  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'custom' | 'schedule' | 'trigger';
  recurringStatus?: 'active' | 'paused' | 'disabled' | 'completed';
  recurringPattern?: {
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
  endConditions?: {
    never?: boolean;
    afterRuns?: number;
    endDate?: string;
  };
  recurrenceSettings?: any;
  recurringOptions?: IRecurringOptions;
   approvalNeeded?: boolean;
  isApproved?: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  approvalComments?: string;
}

const ActivitySchema = new Schema<IActivity>({
  action: {
    type: String,
    enum: ['started', 'paused', 'resumed', 'ended', 'assigned'],
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  duration: {
    type: Number,
    default: 0
  }
});

const AssignedBySchema = new Schema<IAssignedBy>({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
   telegramNumber: {
      type: String,
      default: ''
    }
});

const RecurringOptionsSchema = new Schema<IRecurringOptions>({
  skipWeekends: { type: Boolean, default: false },
  workingDaysOnly: { type: Boolean, default: false },
  statusOptions: [{ type: String }],
  repeatType: { 
    type: String, 
    enum: ['schedule', 'trigger'],
    default: 'schedule'
  },
  repeatInterval: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    default: 'weekly'
  },
  repeatCount: { type: Number, default: 5 },
  customInterval: { type: Number },
  endCondition: { 
    type: String, 
    enum: ['never', 'after', 'on'],
    default: 'after'
  },
  endDate: { type: String },
  specificDays: [{ type: Number }],
  monthlyOption: { 
    type: String, 
    enum: ['date', 'day'],
    default: 'date'
  }
});

const TaskSchema = new Schema<ITask>({
  taskId: {
    type: String,
    required: true,
    unique: true
  },
  taskName: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['task', 'meeting'],
    required: true
  },
  status: {
    type: String,
   enum: ['started', 'paused', 'resumed', 'ended', 'assigned', 'todo', 'pending', 'inprogress', 'completed', 'approved', 'rejected'],
    default: 'started'
  },
  description: {
    type: String,
    trim: true
  },
  estimatedTime: {
    type: String,
    trim: true
  },
  dueDate: {
    type: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String
  },
  totalDuration: {
    type: Number,
    default: 0
  },
  isAssigned: {
    type: Boolean,
    // default: false
  },
  assignedByEmail: {
    type: String,
    required: false,
    index: true
  },
  assignedToEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  assignedToName: {
    type: String,
    required: false
  },
  assignedAt: {
    type: Date,
    required: false
  },
  // ADD THESE FIELDS AFTER assignedAt
   assignedByTelegram: {
    type: String,
    default: ''
  },
  assignedToTelegram: {
    type: String,
    default: ''
  },
  telegramNumber: {
    type: String,
    default: ''
  },
  userTelegram: {
    type: String,
    required: false
  },
   
  assignedBy: AssignedBySchema,
  createdBy: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    trim: true
  },
  userId: {
    type: String
  },

  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom', 'schedule', 'trigger'],
    required: false
  },
  recurringStatus: {
    type: String,
    enum: ['active', 'paused', 'disabled', 'completed'],
    required: false
  },
  recurringPattern: {
    type: Schema.Types.Mixed,
    required: false
  },
  recurringCount: {
    type: Number,
    default: 0
  },
  nextRun: {
    type: String,
    required: false
  },
  lastRun: {
    type: String,
    required: false
  },
  recurringInterval: {
    type: Number,
    required: false
  },
  recurringCron: {
    type: String,
    required: false
  },
  endConditions: {
    type: Schema.Types.Mixed,
    required: false
  },
  recurrenceSettings: {
    type: Schema.Types.Mixed,
    required: false
  },
  // Add to the schema definition
approvalNeeded: {
  type: Boolean,
  // default: false
},
isApproved: {
  type: Boolean,
  // default: false
},
approvedBy: {
  type: String,
  default: null
},
approvedAt: {
  type: Date,
  default: null
},
rejectedBy: {
  type: String,
  default: null
},
rejectedAt: {
  type: Date,
  default: null
},
approvalComments: {
  type: String,
  default: ''
},

  recurringOptions: RecurringOptionsSchema,
 
  activities: [ActivitySchema]
}, {
  timestamps: true,
  strict: false
});

TaskSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

TaskSchema.set('toJSON', { virtuals: true });
TaskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;
