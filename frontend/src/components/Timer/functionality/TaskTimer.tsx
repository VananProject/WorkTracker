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

  // Check for paused tasks every 30 minutes
  useEffect(() => {
    const checkPausedTasks = () => {
      const pausedTasks = allTasks.filter(task => task.status === 'paused');
      
      pausedTasks.forEach(task => {
        const lastActivity = task.activities?.slice(-1)[0];
        if (lastActivity && lastActivity.action === 'paused') {
          const pausedTime = new Date(lastActivity.timestamp);
          const now = new Date();
          const timeDiff = now.getTime() - pausedTime.getTime();
          const minutesDiff = Math.floor(timeDiff / (1000 * 60));
          
          if (minutesDiff >= 30 && minutesDiff % 30 === 0) {
            setPausedTaskNotification(`⏸️ Task "${task.taskName}" has been paused for ${minutesDiff} minutes!`);
            
            if (Notification.permission === 'granted') {
              new Notification('⏸️ Paused Task Reminder', {
                body: `Task "${task.taskName}" has been paused for ${minutesDiff} minutes. Consider resuming or stopping it.`,
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

  const handlePause = async () => {
    if (!state.currentTask) return;

    try {
      await TaskService.pauseTask(state.currentTask.taskId, state.elapsedTime);
      dispatch({ type: 'PAUSE_TASK' });
      dispatch({ type: 'CLEAR_ERROR' });
      
      notificationService.startPausedTaskMonitoring(
        state.currentTask.taskId, 
        state.currentTask.taskName
      );
      
      loadAllTasks();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to pause task' });
    }
  };

  const handleResume = async () => {
    if (!state.currentTask) return;

    try {
      await TaskService.resumeTask(state.currentTask.taskId, state.elapsedTime);
      dispatch({ type: 'RESUME_TASK' });
      dispatch({ type: 'CLEAR_ERROR' });
      
      notificationService.stopPausedTaskMonitoring(state.currentTask.taskId);
      
      loadAllTasks();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to resume task' });
    }
  };

  // const handleStop = async () => {
  //   if (!state.currentTask) return;

  //   try {
  //     await TaskService.endTask(state.currentTask.taskId, state.elapsedTime);
  //     dispatch({ type: 'STOP_TASK' });
  //     dispatch({ type: 'CLEAR_ERROR' });
      
  //     notificationService.stopPausedTaskMonitoring(state.currentTask.taskId);
      
  //     loadAllTasks();
  //   } catch (error) {
  //     dispatch({ type: 'SET_ERROR', payload: 'Failed to stop task' });
  //   }
  // };
const handleStop = async (description?: string) => {
  if (!state.currentTask) return;

  try {
    // Pass the description to the endTask service
    await TaskService.endTask(state.currentTask.taskId, state.elapsedTime, description);
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

  // const handleAssignTaskDataChange = (field: string, value: string | Date | null) => {
  //   setAssignTaskData(prev => ({
  //     ...prev,
  //     [field]: value
  //   }));
  // };

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

