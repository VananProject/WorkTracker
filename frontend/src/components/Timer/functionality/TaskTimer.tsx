import React, { useEffect, useCallback, useState } from 'react';
import { useTimerReducer } from '../../../hooks/useTimerReducer';
import { authAPI } from '../../../services/api';
import { notificationService } from '../../../services/notificationService';
import { alarmSound } from '../../../utils/alarmSound';
import TaskTimerUI from '../TimerUI/TaskTimerUI';
import TaskService, { type AssignTaskData } from '../../../services/taskService';
// import TaskService, { AssignTaskData } from '../../../services/taskService';

interface TaskTimerProps {
  showAdminPanelFromAppBar?: boolean;
  onToggleAdminPanelFromAppBar?: () => void;
  showAssignedTasks?: boolean;
  onTaskCountChange?: (count: number) => void;
  onRunningTaskChange?: (hasRunning: boolean) => void;
}
// Add interface for pause tracking
interface PauseSession {
  pausedAt: string;
  resumedAt?: string;
  duration?: number;
}
const TaskTimer: React.FC<TaskTimerProps> = ({ 
  showAdminPanelFromAppBar = false, 
  onToggleAdminPanelFromAppBar 
}) => {
  const [state, dispatch] = useTimerReducer();
  const [showHistory, setShowHistory] = React.useState(false);
  const [alarmNotification, setAlarmNotification] = React.useState<string | null>(null);
  const [allTasks, setAllTasks] = React.useState<any[]>([]);
  const [assignedTasks, setAssignedTasks] = React.useState<any[]>([]);
  const [pausedTaskNotification, setPausedTaskNotification] = React.useState<string | null>(null);
  const [tableFilters, setTableFilters] = React.useState({
    taskName: '',
    type: 'all',
    status: 'all',
    dateRange: 'all',
    username: ''
  });
  const [tablePage, setTablePage] = React.useState(0);
  const [tableRowsPerPage, setTableRowsPerPage] = React.useState(10);
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());
  
  // Admin functionality
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [assignTaskData, setAssignTaskData] = useState<AssignTaskData>({
    taskName: '',
    type: 'task',
    assignedToEmail: '',
    description: '',
    estimatedTime: '',
    dueDate: null,
    approvalNeeded: false
  });

  // Use AppBar state for admin panel
  const showAdminPanel = showAdminPanelFromAppBar;
// Update calculateRealElapsedTime to subtract pause time
const calculateRealElapsedTime = useCallback((task: any) => {
  if (!task) return 0;
  
  const currentUser = getCurrentUser();
  if (!currentUser) return 0;
  
  // Check if task belongs to current user
  const isUserTask = task.createdBy === currentUser.email || 
                    task.assignedToEmail === currentUser.email ||
                    task.userEmail === currentUser.email;
  
  if (!isUserTask) return 0;
  
  const now = new Date();
  
  // Get task start time
  const taskStartTime = new Date(task.startTime || task.startDate || task.createdAt);
  if (isNaN(taskStartTime.getTime())) return 0;
  
  console.log('⏱️ Calculating accurate time for task:', {
    taskName: task.taskName,
    status: task.status,
    taskStartTime: taskStartTime.toISOString(),
    storedTotalDuration: task.totalDuration
  });
  
  // Calculate total elapsed time from start to now
  const totalElapsedFromStart = Math.floor((now.getTime() - taskStartTime.getTime()) / 1000);
  
  // Get pause sessions from localStorage
  const pauseSessionsKey = `task_${task.taskId}_pauseSessions`;
  let pauseSessions: PauseSession[] = [];
  
  try {
    const stored = localStorage.getItem(pauseSessionsKey);
    pauseSessions = stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error parsing pause sessions:', error);
    pauseSessions = [];
  }
  
  // Calculate total pause time
  let totalPauseTime = 0;
  
  pauseSessions.forEach(session => {
    if (session.pausedAt && session.resumedAt) {
      // Completed pause session
      const pausedAt = new Date(session.pausedAt);
      const resumedAt = new Date(session.resumedAt);
      
      if (!isNaN(pausedAt.getTime()) && !isNaN(resumedAt.getTime())) {
        const pauseDuration = Math.floor((resumedAt.getTime() - pausedAt.getTime()) / 1000);
        totalPauseTime += Math.max(0, pauseDuration);
      }
    } else if (session.pausedAt && task.status === 'paused') {
      // Currently paused - calculate pause time up to now
      const pausedAt = new Date(session.pausedAt);
      if (!isNaN(pausedAt.getTime())) {
        const currentPauseDuration = Math.floor((now.getTime() - pausedAt.getTime()) / 1000);
        totalPauseTime += Math.max(0, currentPauseDuration);
      }
    }
  });
  
  // Calculate actual working time
  const actualWorkingTime = Math.max(0, totalElapsedFromStart - totalPauseTime);
  
  console.log('⏱️ Time calculation breakdown:', {
    totalElapsedFromStart,
    totalPauseTime,
    actualWorkingTime,
    pauseSessionsCount: pauseSessions.length,
    currentStatus: task.status
  });
  
  return actualWorkingTime;
}, []);

// Update the tick effect to use real time calculation
// Update the tick effect to use more accurate timing
useEffect(() => {
  let interval: ReturnType<typeof setInterval>;
  
  if (state.isRunning && state.currentTask) {
    interval = setInterval(() => {
      const realElapsedTime = calculateRealElapsedTime(state.currentTask);
      
      // Only update if there's a significant difference (avoid unnecessary re-renders)
      if (Math.abs(realElapsedTime - state.elapsedTime) >= 1) {
        dispatch({ type: 'SET_ELAPSED_TIME', payload: realElapsedTime });
      }
    }, 1000);
  }
  
  return () => {
    if (interval) {
      clearInterval(interval);
    }
  };
}, [state.isRunning, state.currentTask, calculateRealElapsedTime, state.elapsedTime]);
// Add cleanup function
const cleanupTaskData = (taskId: string) => {
  localStorage.removeItem(`task_${taskId}_pauseSessions`);
  localStorage.removeItem(`task_${taskId}_workingTime`);
  localStorage.removeItem(`task_${taskId}_totalDuration`);
  localStorage.removeItem(`task_${taskId}_lastResumeTime`);
};
// Add effect to restore timer state on page load/refresh
// Update restore timer state to clean up old data
useEffect(() => {
  const restoreTimerState = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.log('❌ No current user found');
        return;
      }

      console.log('🔍 Restoring timer state for user:', currentUser.email);

      const response = await TaskService.getUserTasks();
      
      if (response.success) {
        // Clean up data for completed tasks
        response.data.forEach((task: any) => {
          if (task.status === 'ended' || task.status === 'completed') {
            cleanupTaskData(task.taskId);
          }
        });
        
        const userRunningTask = response.data.find((task: any) => {
          const isUserTask = task.createdBy === currentUser.email || 
                            task.assignedToEmail === currentUser.email ||
                            task.userEmail === currentUser.email;
          
          const isRunning = task.status === 'started' || task.status === 'resumed';
          
          return isUserTask && isRunning;
        });
        
        if (userRunningTask) {
          console.log('✅ Found running task:', userRunningTask.taskName);
          const realElapsedTime = calculateRealElapsedTime(userRunningTask);
          console.log('⏱️ Calculated elapsed time:', realElapsedTime);
          
          dispatch({ 
            type: 'RESTORE_TASK', 
            payload: { 
              task: userRunningTask, 
              elapsedTime: realElapsedTime 
            } 
          });
        } else {
          console.log('❌ No running tasks found for current user');
        }
      }
    } catch (error) {
      console.error('❌ Error restoring timer state:', error);
    }
  };

  restoreTimerState();
}, [calculateRealElapsedTime]);

  const handleFilterChange = (field: string, value: string) => {
    setTableFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset pagination when filters change
    setTablePage(0);
  };

  const getCurrentUserEmail = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.email;
      }
      return null;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  };

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  // Load data on component mount
  useEffect(() => {
    loadAllTasks();
    loadAssignedTasks();
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    notificationService.requestPermission();
    return () => {
      notificationService.clearAllTimers();
    };
  }, []);

  const loadAllTasks = async () => {
    try {
      console.log(`🔍 Loading tasks for user: ${currentUser.email} (Admin: ${isAdmin})`);
      const response = await TaskService.getAllTasks();
      if (response.success) {
        console.log(`📊 Loaded ${response.data.length} tasks`);
        setAllTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const loadAssignedTasks = async () => {
  try {
    const userEmail = getCurrentUserEmail(); // Get current user's email
    if (!userEmail) {
      console.error('No user email found');
      return;
    }
    
    const response = await TaskService.getAssignedTasks(userEmail); // Pass userEmail parameter
    if (response.success) {
      // Filter assigned tasks for current user (unless admin)
      const filteredTasks = isAdmin ? 
        response.data : 
        response.data.filter((task: any) => task.assignedToEmail === currentUser.email);
      
      console.log(`📋 Loaded ${filteredTasks.length} assigned tasks for ${currentUser.email}`);
      setAssignedTasks(filteredTasks);
    }
  } catch (error) {
    console.error('Failed to load assigned tasks:', error);
  }
};


  const loadUsers = async () => {
    if (!isAdmin) return;
    
    try {
      setLoadingUsers(true);
      setUserError(null);
      console.log('🔍 Loading users as admin...');
      
      const response = await authAPI.getUsers();
      console.log('📝 Full response:', response);
      console.log('📊 Response data:', response.data);
      
      if (response.data.success) {
        console.log('✅ Users loaded successfully:', response.data.data);
        console.log('👥 Number of users:', response.data.data.length);
        setUsers(response.data.data);
      } else {
        console.error('❌ Failed to load users:', response.data.message);
        setUserError('Failed to load users');
      }
    } catch (error: any) {
      console.error('💥 Error loading users:', error);
      console.error('📋 Error response:', error.response?.data);
      setUserError(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAssignTask = async () => {
    console.log('🎯 Frontend: Starting task assignment');
    console.log('📝 Task data:', assignTaskData);
    
    // Validate the task data
    const validationErrors = TaskService.validateAssignTaskData(assignTaskData);
    if (validationErrors.length > 0) {
      console.log('❌ Frontend validation failed:', validationErrors);
      dispatch({ type: 'SET_ERROR', payload: validationErrors.join(', ') });
      return;
    }

    try {
      console.log('📤 Sending assignment request...');
      const response = await TaskService.assignTask(assignTaskData);
      console.log('✅ Assignment response:', response);
      
      if (response.success) {
        setShowAssignDialog(false);
        setAssignTaskData({
          taskName: '',
          type: 'task',
          assignedToEmail: '',
          description: '',
          estimatedTime: '',
          dueDate: null,
           approvalNeeded: false 
        });
        loadAllTasks();
        dispatch({ type: 'CLEAR_ERROR' });
         const approvalText = assignTaskData.approvalNeeded ? ' (Approval Required)' : '';
        setAlarmNotification(`✅ Task "${assignTaskData.taskName}" assigned successfully!`);
      }
    } catch (error: any) {
      console.error('💥 Frontend assignment error:', error);
      console.error('📋 Error response:', error.response?.data);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to assign task' });
    }
  };

  // Start an assigned task
  const handleStartAssignedTask = async (task: any) => {
    try {
      const response = await TaskService.startAssignedTask(task.taskId);
      if (response.success) {
        // Set this task as current task
        dispatch({ 
          type: 'START_ASSIGNED_TASK', 
          payload: {
            task: response.data,
            taskId: task.taskId,
            taskName: task.taskName,
            type: task.type,
          }
        });
        loadAllTasks();
        loadAssignedTasks();
        dispatch({ type: 'CLEAR_ERROR' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start assigned task' });
    }
  };

 // Update the paused task checking effect
useEffect(() => {
  const checkPausedTasks = () => {
    const currentUserEmail = getCurrentUserEmail();
    if (!currentUserEmail) return;

    // Only check tasks that belong to the current user
    const userPausedTasks = allTasks.filter(task => {
      const isUserTask = task.userEmail === currentUserEmail || task.assignedToEmail === currentUserEmail;
      return isUserTask && task.status === 'paused';
    });
    
    userPausedTasks.forEach(task => {
      const lastActivity = task.activities?.slice(-1)[0];
      if (lastActivity && lastActivity.action === 'paused') {
        const pausedTime = new Date(lastActivity.timestamp);
        const now = new Date();
        const timeDiff = now.getTime() - pausedTime.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        
        if (minutesDiff >= 30 && minutesDiff % 30 === 0) {
          setPausedTaskNotification(`⏸️ Your task "${task.taskName}" has been paused for ${minutesDiff} minutes!`);
          
          if (Notification.permission === 'granted') {
            new Notification('⏸️ Your Paused Task Reminder', {
              body: `Your task "${task.taskName}" has been paused for ${minutesDiff} minutes. Consider resuming or stopping it.`,
              icon: '/favicon.ico',
              tag: `paused-task-${task.taskId}`,
              requireInteraction: true
            });
          }
          
          alarmSound.playAlarmPattern().catch(() => {
            console.log('Notification sound failed');
          });
        }
      }
    });
  };

  checkPausedTasks();
  const interval = setInterval(checkPausedTasks, 60000);
  return () => clearInterval(interval);
}, [allTasks]);

  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Enhanced alarm functionality
  useEffect(() => {
    if (state.alarmTime && state.isRunning && state.elapsedTime > 0) {
      const alarmIntervalSeconds = state.alarmTime * 60;
      
      if (state.elapsedTime % alarmIntervalSeconds === 0 && state.elapsedTime !== state.lastAlarmTime) {
        dispatch({ type: 'TRIGGER_ALARM' });
        
        alarmSound.playAlarmPattern().catch(() => {
          console.log('Alarm sound failed, using fallback');
        });

        if (Notification.permission === 'granted') {
          new Notification('⏰ Task Timer Alarm', {
            body: `${state.alarmTime} minute(s) have passed! Keep going! 💪`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'task-timer-alarm',
            requireInteraction: false,
            silent: false
          });
        }

        setAlarmNotification(`⏰ ${state.alarmTime} minute(s) completed!`);
      }
    }
  }, [state.elapsedTime, state.alarmTime, state.isRunning, state.lastAlarmTime]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.isRunning) {
      interval = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isRunning]);

  const generateTaskId = () => {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleStartTask = async (type: 'task' | 'meeting') => {
    dispatch({ type: 'SET_TASK_TYPE', payload: type });
    dispatch({ type: 'SHOW_TASK_INPUT' });
  };

  const handleCreateTask = async () => {
    if (!state.taskName.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Task name is required' });
      return;
    }

    const taskId = generateTaskId();
    
    const taskData = {
      taskId,
      taskName: state.taskName.trim(),
      type: state.taskType || 'task',
      status: 'started',
      startDate: new Date().toISOString(),
    };

    try {
      await TaskService.startTask(taskData);
      dispatch({ type: 'START_TASK', payload: { type: state.taskType || 'task', taskId, taskName: state.taskName.trim() } });
      dispatch({ type: 'HIDE_TASK_INPUT' });
      dispatch({ type: 'CLEAR_ERROR' });
      
      loadAllTasks();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start task' });
    }
  };

// Update handlePause to track pause sessions
const handlePause = async () => {
  if (!state.currentTask) return;

  try {
    // Calculate current working time
    const currentWorkingTime = calculateRealElapsedTime(state.currentTask);
    
    console.log('⏸️ Pausing task with working time:', currentWorkingTime);
    
    // Store pause session
    const pauseSessionsKey = `task_${state.currentTask.taskId}_pauseSessions`;
    let pauseSessions: PauseSession[] = [];
    
    try {
      const stored = localStorage.getItem(pauseSessionsKey);
      pauseSessions = stored ? JSON.parse(stored) : [];
    } catch (error) {
      pauseSessions = [];
    }
    
    // Add new pause session
    const newPauseSession: PauseSession = {
      pausedAt: new Date().toISOString()
    };
    
    pauseSessions.push(newPauseSession);
    localStorage.setItem(pauseSessionsKey, JSON.stringify(pauseSessions));
    
    // Store current working time
    localStorage.setItem(`task_${state.currentTask.taskId}_workingTime`, currentWorkingTime.toString());
    
    await TaskService.pauseTask(state.currentTask.taskId, currentWorkingTime);
    dispatch({ type: 'PAUSE_TASK' });
    dispatch({ type: 'CLEAR_ERROR' });
    
    // Only start monitoring if this is the current user's task
    const currentUserEmail = getCurrentUserEmail();
    const taskOwnerEmail = state.currentTask.userEmail || state.currentTask.assignedToEmail;
    
    if (currentUserEmail === taskOwnerEmail) {
      notificationService.startPausedTaskMonitoring(
        state.currentTask.taskId, 
        state.currentTask.taskName,
        currentUserEmail,
        taskOwnerEmail
      );
    }
    
    loadAllTasks();
  } catch (error) {
    dispatch({ type: 'SET_ERROR', payload: 'Failed to pause task' });
  }
};

// Update handleResume to complete pause session
const handleResume = async () => {
  if (!state.currentTask) return;

  try {
    // Get stored working time
    const storedWorkingTime = localStorage.getItem(`task_${state.currentTask.taskId}_workingTime`);
    const workingTime = storedWorkingTime ? parseInt(storedWorkingTime) : 0;
    
    console.log('▶️ Resuming task with working time:', workingTime);
    
    // Complete the last pause session
    const pauseSessionsKey = `task_${state.currentTask.taskId}_pauseSessions`;
    let pauseSessions: PauseSession[] = [];
    
    try {
      const stored = localStorage.getItem(pauseSessionsKey);
      pauseSessions = stored ? JSON.parse(stored) : [];
    } catch (error) {
      pauseSessions = [];
    }
    
    // Find and complete the last incomplete pause session
    const lastSession = pauseSessions[pauseSessions.length - 1];
    if (lastSession && lastSession.pausedAt && !lastSession.resumedAt) {
      lastSession.resumedAt = new Date().toISOString();
      
      // Calculate pause duration
      const pausedAt = new Date(lastSession.pausedAt);
      const resumedAt = new Date(lastSession.resumedAt);
      lastSession.duration = Math.floor((resumedAt.getTime() - pausedAt.getTime()) / 1000);
      
      localStorage.setItem(pauseSessionsKey, JSON.stringify(pauseSessions));
      
      console.log('✅ Completed pause session:', {
        pausedAt: lastSession.pausedAt,
        resumedAt: lastSession.resumedAt,
        duration: lastSession.duration
      });
    }
    
    await TaskService.resumeTask(state.currentTask.taskId, workingTime);
    dispatch({ type: 'RESUME_TASK' });
    dispatch({ type: 'CLEAR_ERROR' });
    
    notificationService.stopPausedTaskMonitoring(state.currentTask.taskId);
    
    // Reload tasks to get updated data
    await loadAllTasks();
    
    // Update the current task with fresh data
    const response = await TaskService.getAllTasks();
    if (response.success) {
      const updatedTask = response.data.find((task: any) => 
        task.taskId === state.currentTask?.taskId
      );
      
      if (updatedTask) {
        console.log('🔄 Updated task after resume:', updatedTask);
        dispatch({ 
          type: 'RESTORE_TASK', 
          payload: { 
            task: updatedTask, 
            elapsedTime: workingTime 
          } 
        });
      }
    }
    
  } catch (error) {
    dispatch({ type: 'SET_ERROR', payload: 'Failed to resume task' });
  }
};

// Update handleStop to clean up pause sessions
const handleStop = async (description?: string) => {
  if (!state.currentTask) return;

  try {
    // Calculate final working time
    const finalWorkingTime = calculateRealElapsedTime(state.currentTask);
    
    console.log('🛑 Stopping task with final working time:', finalWorkingTime);
    
    await TaskService.endTask(state.currentTask.taskId, finalWorkingTime, description);
    
    // Clean up localStorage data
    localStorage.removeItem(`task_${state.currentTask.taskId}_pauseSessions`);
    localStorage.removeItem(`task_${state.currentTask.taskId}_workingTime`);
    
    dispatch({ type: 'STOP_TASK' });
    dispatch({ type: 'CLEAR_ERROR' });
    
    notificationService.stopPausedTaskMonitoring(state.currentTask.taskId);
    loadAllTasks();
  } catch (error) {
    dispatch({ type: 'SET_ERROR', payload: 'Failed to stop task' });
  }
};


  const handleSetAlarm = (minutes: number) => {
    dispatch({ type: 'SET_ALARM', payload: minutes });
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const handleTestAlarmSound = () => {
    alarmSound.playAlarmPattern().catch(() => {
      console.log('Test alarm sound failed');
    });
  };

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleTableFilterChange = (field: string, value: string) => {
    handleFilterChange(field, value);
  };

  const handleTablePageChange = (event: unknown, newPage: number) => {
    setTablePage(newPage);
  };

  const handleTableRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTableRowsPerPage(parseInt(event.target.value, 10));
    setTablePage(0);
  };

  const handleToggleRowExpansion = (taskName: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(taskName)) {
      newExpanded.delete(taskName);
    } else {
      newExpanded.add(taskName);
    }
    setExpandedRows(newExpanded);
  };
const refreshTasks = async () => {
  try {
    await Promise.all([
      loadAllTasks(),
      loadAssignedTasks()
    ]);
  } catch (error) {
    console.error('Error refreshing tasks:', error);
  }
};

  const handleTableAction = async (task: any, action: 'resume' | 'stop' | 'start') => {
    if (action === 'resume') {
      try {
        await TaskService.resumeTask(task.taskId, task.totalDuration || 0);
        dispatch({ 
          type: 'START_ASSIGNED_TASK', 
          payload: {
            task: task,
            taskId: task.taskId,
            taskName: task.taskName,
            type: task.type,
          }
        });
        loadAllTasks();
        dispatch({ type: 'CLEAR_ERROR' });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to resume task' });
      }
    } else if (action === 'stop') {
      try {
        await TaskService.endTask(task.taskId, task.totalDuration || 0);
        if (state.currentTask?.taskId === task.taskId) {
          dispatch({ type: 'STOP_TASK' });
        }
        loadAllTasks();
        dispatch({ type: 'CLEAR_ERROR' });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to stop task' });
      }
    }  else if (action === 'start') {
    try {
      // Assuming a method to start a task exists in TaskService
      await TaskService.startTask(task.taskId);
      dispatch({ 
        type: 'START_ASSIGNED_TASK', 
        payload: {
          task: task,
          taskId: task.taskId,
          taskName: task.taskName,
          type: task.type,
        }
      });
      loadAllTasks();
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start task' });
    }
  }

  };

  // Use AppBar handler for admin panel toggle
  const handleToggleAdminPanel = useCallback(() => {
    if (onToggleAdminPanelFromAppBar) {
      onToggleAdminPanelFromAppBar();
    }
  }, [onToggleAdminPanelFromAppBar]);

  const handleShowAssignDialog = () => {
    setShowAssignDialog(true);
    if (users.length === 0) {
      loadUsers();
    }
  };

  const handleHideAssignDialog = () => {
    setShowAssignDialog(false);
    setAssignTaskData({
      taskName: '',
      type: 'task',
      assignedToEmail: '',
      description: '',
      estimatedTime: '',
      dueDate: null,
       approvalNeeded: false
    });
  };



  const handleAssignTaskDataChange = (field: string, value: any) => {
  console.log('🔄 Parent handling data change:', { field, value });
   if (field === 'approvalNeeded') {
    console.log('🔄 Setting approval needed in TaskTimer:', value);
  }
  setAssignTaskData(prev => {
    const updated = {
      ...prev,
      [field]: value
    };
    console.log('📝 Updated assignTaskData:', updated);
    return updated;
  });
};

  const handleLoadUsers = () => {
    loadUsers();
  };

  const getFilteredUserTasks = () => {
    let filtered = allTasks;

    // If not admin, only show current user's tasks
    if (!isAdmin) {
      const userEmail = getCurrentUserEmail();
      filtered = filtered.filter(task => 
        task.userEmail === userEmail || task.assignedToEmail === userEmail
      );
    }

    // Apply filters
    if (tableFilters.taskName) {
      filtered = filtered.filter(task =>
        task.taskName.toLowerCase().includes(tableFilters.taskName.toLowerCase())
      );
    }

    if (tableFilters.type !== 'all') {
      filtered = filtered.filter(task => task.type === tableFilters.type);
    }

    if (tableFilters.status !== 'all') {
      filtered = filtered.filter(task => task.status === tableFilters.status);
    }

    if (tableFilters.username && isAdmin) {
      filtered = filtered.filter(task =>
        task.username?.toLowerCase().includes(tableFilters.username.toLowerCase()) ||
        task.userEmail?.toLowerCase().includes(tableFilters.username.toLowerCase())
      );
    }

    if (tableFilters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (tableFilters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }

      if (tableFilters.dateRange !== 'all') {
        filtered = filtered.filter(task => new Date(task.startDate) >= filterDate);
      }
    }

    return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  };

  const getPausedTasks = () => {
    return allTasks.filter(task => task.status === 'paused');
  };

  // Refresh function for admin panel
  const handleRefresh = async () => {
    await Promise.all([
      loadAllTasks(),
      loadAssignedTasks(),
      isAdmin ? loadUsers() : Promise.resolve()
    ]);
  };
const getUniqueTaskNames = () => {
  const taskNames = allTasks.map(task => task.taskName);
  return [...new Set(taskNames)].filter(name => name && name.trim().length > 0);
};
  return (
    <TaskTimerUI
      // State props
      //  getUniqueTaskNames={getUniqueTaskNames}
      state={state}
      currentUser={currentUser}
      isAdmin={isAdmin}
      showAdminPanel={showAdminPanel} // Use AppBar state
      assignedTasks={assignedTasks}
      allTasks={allTasks}
      alarmNotification={alarmNotification}
      pausedTaskNotification={pausedTaskNotification}
      showHistory={showHistory}
      tableFilters={tableFilters}
      tablePage={tablePage}
      tableRowsPerPage={tableRowsPerPage}
      expandedRows={expandedRows}
      showAssignDialog={showAssignDialog}
      users={users}
      loadingUsers={loadingUsers}
      userError={userError}
      assignTaskData={assignTaskData}

      // Handler props
      dispatch={dispatch}
      formatTime={formatTime}
      onStartTask={handleStartTask}
      onCreateTask={handleCreateTask}
      onPause={handlePause}
      onResume={handleResume}
      onStop={handleStop}
      onStartAssignedTask={handleStartAssignedTask}
      onSetAlarm={handleSetAlarm}
      onTestAlarmSound={handleTestAlarmSound}
      onToggleHistory={handleToggleHistory}
      onTableFilterChange={handleTableFilterChange}
      onTablePageChange={handleTablePageChange}
      onTableRowsPerPageChange={handleTableRowsPerPageChange}
      onToggleRowExpansion={handleToggleRowExpansion}
      onTableAction={handleTableAction}
      onToggleAdminPanel={handleToggleAdminPanel} // Use AppBar handler
      onShowAssignDialog={handleShowAssignDialog}
      onHideAssignDialog={handleHideAssignDialog}
      onAssignTask={handleAssignTask}
      onAssignTaskDataChange={handleAssignTaskDataChange}
      onLoadUsers={handleLoadUsers}
      onSetAlarmNotification={setAlarmNotification}
      onSetPausedTaskNotification={setPausedTaskNotification}
      getFilteredUserTasks={getFilteredUserTasks}
      getPausedTasks={getPausedTasks}
      onRefresh={handleRefresh}

      
    />
  );
};

export default TaskTimer;

