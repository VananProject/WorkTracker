
import axios from 'axios';
import config from '../config/environment';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const taskAPI = {
  // Get user-specific tasks
  getUserTasks: () => api.get('/tasks/user'),
  
  // Get all tasks (admin only)
  getAdminTasks: () => api.get('/tasks/admin'),
  
  // Get all tasks (auto-filtered by role)
  getAllTasks: () => api.get('/tasks'),
  
  // Get active tasks
  getActiveTasks: () => api.get('/tasks/active'),
  
  // Get assigned tasks
  getAssignedTasks: () => api.get('/tasks/assigned'),
  
  // Get tasks by date range
  getTasksByDateRange: (params: { startDate: string; endDate: string }) =>
    api.get('/tasks/date-range', { params }),
  
  // Create a new task (general endpoint)
  createTask: (taskData: any) => api.post('/tasks', taskData),
   deleteTask: (taskId: string) => {
    console.log('📡 API Call: deleteTask', { taskId });
    return api.delete(`/tasks/${taskId}`);
  },

  editTask: (taskId: string, updateData: any) => {
    console.log('📡 API Call: editTask', { taskId, updateData });
    return api.put(`/tasks/${taskId}/edit`, updateData);
  },
  // Start a new task (specific endpoint)
  startTask: (taskData: any) => {
    const payload = {
      taskId: taskData.taskId || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskName: taskData.taskName || 'Untitled Task',
      type: taskData.type || 'task',
      description: taskData.description || '',
      estimatedTime: taskData.estimatedTime || '',
      dueDate: taskData.dueDate || null,
      status: 'started',
      totalDuration: taskData.totalDuration || 0,
      startDate: taskData.startDate || new Date().toISOString(), // Add required startDate
      // Include recurring fields if present
      ...(taskData.isRecurring && {
        isRecurring: taskData.isRecurring,
        recurringType: taskData.recurringType,
        recurringStatus: taskData.recurringStatus,
        recurringPattern: taskData.recurringPattern,
        recurringCount: taskData.recurringCount,
        nextRun: taskData.nextRun,
        lastRun: taskData.lastRun,
        recurringInterval: taskData.recurringInterval,
        recurringCron: taskData.recurringCron
      })
    };
    
    console.log('📡 API Call: startTask with payload:', payload);
    return api.post('/tasks/start', payload);
  },

  getTaskById: (taskId: string) => api.get(`/tasks/${taskId}`),
  
  // Assign task to user (admin/manager only)
  assignTask: (taskData: {
    taskName: string;
    type: 'task' | 'meeting';
    assignedToEmail: string;
    description?: string;
    estimatedTime?: string;
    dueDate?: string | null;
    priority?: 'low' | 'medium' | 'high';
    status?: 'todo' | 'pending' | 'started' | 'inprogress';
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
      endDate?: Date | null;
      specificDays?: number[];
      monthlyOption?: 'date' | 'day';
    };
  }) => {
    console.log('📡 API Call: assignTask with payload:', taskData);
    return api.post('/tasks/assign', taskData);
  },
  
  // Create task assignment (accessible to all authenticated users)
  createTaskAssignment: (taskData: {
    taskName: string;
    type: 'task' | 'meeting';
    assignedToEmail: string;
    description?: string;
    estimatedTime?: string;
    dueDate?: string | null;
    assignedBy?: string;
    isRecurring?: boolean;
    approvalNeeded?: boolean;
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
      endDate?: string | null;
    };
  }) => {
    console.log('📡 API Call: createTaskAssignment with recurring data:', taskData);
    return api.post('/tasks/create-assignment', taskData);
  },
  
  // Start an assigned task
  startAssignedTask: (taskId: string) => api.put(`/tasks/start-assigned/${taskId}`),
  
// Update the pauseTask API call
pauseTask: (taskId: string, data: { 
  elapsedTime: number; 
  pausedAt?: string; 
  totalDuration?: number; // Add this as optional
}) => {
  console.log('📡 API Call: pauseTask', { taskId, data });
  return api.put(`/tasks/pause/${taskId}`, data);
},

// Update the resumeTask API call  
resumeTask: (taskId: string, data: { 
  elapsedTime?: number; 
  resumedAt?: string; 
  totalDuration?: number; // Add this as optional
  lastResumeTime?: string; // Add this as optional
}) => {
  console.log('📡 API Call: resumeTask', { taskId, data });
  return api.put(`/tasks/resume/${taskId}`, data);
},
  

// FIXED: End a task - Updated to match backend endpoint pattern
endTask: (taskId: string, data: { elapsedTime: number; endedAt?: string; description?: string }) => {
  console.log('📡 API Call: endTask', { taskId, data });
  return api.put(`/tasks/end/${taskId}`, data);
},

  updateTask: (taskId: string, updateData: any) => {
    console.log('📡 API Call: updateTask', { taskId, updateData });
    return api.put(`/tasks/${taskId}`, updateData);
  },

  // Create task assignment with recurring options
  createTaskAssignmentWithRecurring: (taskData: {
    taskName: string;
    type: 'task' | 'meeting';
    assignedToEmail: string;
    description?: string;
    estimatedTime?: string;
    dueDate?: string | null;
    isRecurring?: boolean;
    recurringOptions?: any;
  }) => {
    console.log('📡 API Call: createTaskAssignmentWithRecurring', taskData);
    return api.post('/tasks/create-assignment', taskData);
  },

  // Get recurring task instances
  getRecurringInstances: (taskId: string) => api.get(`/tasks/${taskId}/recurring-instances`),

  // Update recurring task settings
  updateRecurringTask: (taskId: string, recurringData: any) => {
    console.log('📡 API Call: updateRecurringTask', { taskId, recurringData });
    return api.put(`/tasks/${taskId}/recurring-settings`, recurringData);
  },

  // Pause/Resume recurring task
  toggleRecurringTask: (taskId: string, action: 'pause' | 'resume') => {
    console.log('📡 API Call: toggleRecurringTask', { taskId, action });
    return api.put(`/tasks/${taskId}/recurring-toggle`, { action });
  },

  // Get recurring tasks
  getRecurringTasks: () => api.get('/tasks/recurring'),

  // Trigger recurring task manually
  triggerRecurringTask: (taskId: string) => api.post(`/tasks/${taskId}/trigger-recurring`),

  // Get recurring task history
  getRecurringHistory: (taskId: string) => api.get(`/tasks/${taskId}/recurring-history`),

  // Update recurring settings
  updateRecurringSettings: (taskId: string, recurringData: any) => {
    console.log('📡 API Call: updateRecurringSettings', { taskId, recurringData });
    return api.put(`/tasks/${taskId}/recurring`, recurringData);
  },

 // ✅ Enhanced approval methods with better error handling and logging
  getPendingApprovalTasks: () => {
    console.log('📡 API Call: getPendingApprovalTasks');
    return api.get('/tasks/pending-approval');
  },
  
  approveTask: (taskId: string, data: { approvedBy: string; comments?: string }) => {
    console.log('📡 API Call: approveTask', { 
      taskId, 
      data,
      endpoint: `/tasks/${taskId}/approve`
    });
    return api.put(`/tasks/${taskId}/approve`, data);
  },
  
  rejectTask: (taskId: string, data: { rejectedBy: string; reason?: string }) => {
    console.log('📡 API Call: rejectTask', { 
      taskId, 
      data,
      endpoint: `/tasks/${taskId}/reject`
    });
    return api.put(`/tasks/${taskId}/reject`, data);
  },
  createCompletedTask: (taskData: any) => {
    console.log('📡 API Call: createCompletedTask with payload:', taskData);
    return api.post('/tasks/create-completed', taskData);
  },

  // Add these methods to your existing taskAPI object

// Task Mapping APIs
getTaskMappings: (userEmail: string) => {
  console.log('📡 API Call: getTaskMappings', { userEmail });
  return api.get(`/tasks/mappings/${userEmail}`);
},

saveTaskMapping: (mappingData: {
  taskName: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  category?: string;
  description?: string;
}) => {
  console.log('📡 API Call: saveTaskMapping', mappingData);
  return api.post('/tasks/mappings', mappingData);
},

updateTaskMapping: (id: string, mappingData: {
  taskName?: string;
  level?: 'L1' | 'L2' | 'L3' | 'L4';
  category?: string;
  description?: string;
}) => {
  console.log('📡 API Call: updateTaskMapping', { id, mappingData });
  return api.put(`/tasks/mappings/${id}`, mappingData);
},

deleteTaskMapping: (id: string) => {
  console.log('📡 API Call: deleteTaskMapping', { id });
  return api.delete(`/tasks/mappings/${id}`);
},

getTaskLevelStats: (userEmail: string) => {
  console.log('📡 API Call: getTaskLevelStats', { userEmail });
  return api.get(`/tasks/level-stats/${userEmail}`);
},

exportTaskLevelReport: (userEmail: string) => {
  console.log('📡 API Call: exportTaskLevelReport', { userEmail });
  return api.get(`/tasks/level-report/${userEmail}`, {
    responseType: 'blob'
  });
},


};

export const authAPI = {
  // Login
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  // Signup
  signup: (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => api.post('/auth/signup', userData),
  
  // Get all users (admin only)
  getUsers: () => api.get('/auth/users'),
  
  // Get all users (accessible to all authenticated users)
  getPublicUsers: () => api.get('/auth/users/public'),

    updateUser: (userId: string, userData: {
    username?: string;
    email?: string;
    password?: string;
    telegramNumber?: string;
    role?: string;
  }) => api.put(`/auth/users/${userId}`, userData),
  
  deleteUser: (userId: string) => api.delete(`/auth/users/${userId}`),
};
