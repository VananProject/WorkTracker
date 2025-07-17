// import React, { useState, useMemo } from 'react';
// import {
//   Box,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Chip,
//   IconButton,
//   Button,
//   TablePagination,
//   Typography,
//   Collapse
// } from '@mui/material';
// import {
//   ExpandMore,
//   ExpandLess,
//   PlayArrow,
//   Stop,
//   Person,
//   Business,
//   Repeat
// } from '@mui/icons-material';
// // import ActivityTimeline from './ActivityTimeline';
// // import SummaryStatistics from './SummaryStatistics';
// // import { Task } from '../types/TaskHistoryTypes';
// import { getLastActivityTime } from '../utils/dateUtils';
// import ActivityTimeline from '../components/ActivityTimeline';
// import SummaryStatistics from '../components/SummaryStatistics';
// import type { Task } from '../types/TaskHistoryTypes';

// interface TasksAssignedToMeProps {
//   tasks: Task[];
//   formatTime: (seconds: number) => string;
//   onTableAction: (task: Task, action: 'resume' | 'stop' | 'start') => void;
//   isRunning: boolean;
//   currentUser: any;
//   calculatedDurations: Record<string, number>;
//   onDurationCalculated: (taskId: string, duration: number) => void;
//   onToggleRecurring?: (task: Task) => void;
// }

// const TasksAssignedToMe: React.FC<TasksAssignedToMeProps> = ({
//   tasks,
//   formatTime,
//   onTableAction,
//   isRunning,
//   currentUser,
//   calculatedDurations,
//   onDurationCalculated,
//   onToggleRecurring
// }) => {
//   const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   const handleToggleTaskExpansion = (taskId: string) => {
//     const newExpanded = new Set(expandedTasks);
//     if (newExpanded.has(taskId)) {
//       newExpanded.delete(taskId);
//     } else {
//       newExpanded.add(taskId);
//     }
//     setExpandedTasks(newExpanded);
//   };

//   const handleTaskAction = (task: Task, action: 'resume' | 'stop' | 'start') => {
//     if (action === 'resume' || action === 'start') {
//       const enhancedTask = {
//         ...task,
//         elapsedTime: task.totalDuration || 0,
//         totalDuration: task.totalDuration || 0,
//         resumedAt: new Date().toISOString(),
//         id: task.taskId || task.id || '',
//         taskId: task.taskId || task.id || '',
//         assignedBy: (task as any).assignedBy,
//         assignedTo: (task as any).assignedTo,
//         assignedByEmail: (task as any).assignedByEmail,
//         assignedToEmail: (task as any).assignedToEmail,
//         isAssigned: (task as any).isAssigned
//       };
//       onTableAction(enhancedTask, action);
//     } else {
//       onTableAction(task, action);
//     }
//   };

//   const getTaskDuration = (task: Task): number => {
//     if (calculatedDurations[task.taskId] !== undefined) {
//       return calculatedDurations[task.taskId];
//     }
//     return task.totalDuration || 0;
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'started': return 'success';
//       case 'paused': return 'warning';
//       case 'resumed': return 'info';
//       case 'ended': return 'default';
//       default: return 'default';
//     }
//   };

//   const getTypeIcon = (type: string) => {
//     return type === 'meeting' ? <Business fontSize="small" /> : <Person fontSize="small" />;
//   };

//   const getAssignmentInfo = (task: Task) => {
//     const assignedBy = (task as any).assignedBy || (task as any).assignedByEmail || (task as any).createdBy;
//     const assignedTo = (task as any).assignedTo || (task as any).assignedToEmail;
//     const userEmail = currentUser?.email || currentUser?.userEmail;
    
//     const assignedByStr = typeof assignedBy === 'string' ? assignedBy : '';
//     const assignedToStr = typeof assignedTo === 'string' ? assignedTo : '';
    
//     if (assignedByStr === userEmail && assignedToStr && assignedToStr !== userEmail) {
//       return 'Assigned by me';
//     } else if (assignedToStr === userEmail && assignedByStr && assignedByStr !== userEmail) {
//       const assignerName = assignedByStr.includes('@') ? assignedByStr.split('@')[0] : assignedByStr;
//       return `Assigned by ${assignerName}`;
//     } else if (assignedByStr === userEmail) {
//       return 'Self-assigned';
//     } else {
//       return 'Self-created';
//     }
//   };

//   const getUserDisplayName = (task: Task) => {
//     return task.username || task.userEmail?.split('@')[0] || 'Unknown';
//   };

//   const paginatedTasks = useMemo(() => {
//     const startIndex = page * rowsPerPage;
//     return tasks.slice(startIndex, startIndex + rowsPerPage);
//   }, [tasks, page, rowsPerPage]);

//   const handlePageChange = (event: unknown, newPage: number) => {
//     setPage(newPage);
//   };

//   const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   if (tasks.length === 0) {
//     return (
//       <Box sx={{ textAlign: 'center', py: 4 }}>
//         <Typography variant="h6" color="textSecondary" gutterBottom>
//           No Tasks Assigned to You
//         </Typography>
//         <Typography variant="body2" color="textSecondary">
//           No tasks assigned to you found matching the current filters.
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <>
//       <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
//         <Table stickyHeader size="small">
//           <TableHead>
//             <TableRow>
//               <TableCell>Task Details</TableCell>
//               <TableCell>Type</TableCell>
//               <TableCell>Status</TableCell>
//               <TableCell>Duration</TableCell>
//               <TableCell>Assignment Info</TableCell>
//               <TableCell>Username</TableCell>
//               <TableCell>Last Activity</TableCell>
//               <TableCell>Recurring</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {paginatedTasks.map((task: Task) => (
//               <React.Fragment key={task.taskId}>
//                 <TableRow hover>
//                   <TableCell>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       <IconButton 
//                         size="small"
//                         onClick={() => handleToggleTaskExpansion(task.taskId)}
//                       >
//                         {expandedTasks.has(task.taskId) ? <ExpandLess /> : <ExpandMore />}
//                       </IconButton>
//                       <Box>
//                         <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                           {task.taskName}
//                         </Typography>
//                         <Typography variant="caption" color="textSecondary">
//                           ID: {task.taskId}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </TableCell>
//                   <TableCell>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                       {getTypeIcon(task.type)}
//                       <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
//                         {task.type}
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                   <TableCell>
//                     <Chip
//                       label={task.status}
//                       size="small"
//                       color={getStatusColor(task.status) as any}
//                       variant="outlined"
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//                       <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
//                         {formatTime(getTaskDuration(task))}
//                       </Typography>
//                       {calculatedDurations[task.taskId] !== undefined && 
//                        calculatedDurations[task.taskId] !== (task.totalDuration || 0) && (
//                         <Chip
//                           label="✓ Accurate"
//                           size="small"
//                           color="success"
//                           variant="outlined"
//                           sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }}
//                         />
//                       )}
//                     </Box>
//                   </TableCell>
//                   <TableCell>
//                     <Typography variant="body2">
//                       {getAssignmentInfo(task)}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Typography variant="body2">
//                       {getUserDisplayName(task)}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Typography variant="caption">
//                       {getLastActivityTime(task)}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       {(task as any).isRecurring ? (
//                         <Chip
//                           icon={<Repeat />}
//                           label={(task as any).recurringType || 'Active'}
//                           size="small"
//                           color="info"
//                           variant="outlined"
//                         />
//                       ) : (
//                         <Button
//                           size="small"
//                           startIcon={<Repeat />}
//                           onClick={() => onToggleRecurring?.(task)}
//                           variant="outlined"
//                           color="primary"
//                         >
//                           Set Recurring
//                         </Button>
//                       )}
//                     </Box>
//                   </TableCell>
//                   <TableCell>
//                     <Box sx={{ display: 'flex', gap: 0.5 }}>
//                       {task.status === 'paused' && (
//                         <Button
//                           size="small"
//                           startIcon={<PlayArrow />}
//                           onClick={() => handleTaskAction(task, 'resume')}
//                           disabled={isRunning}
//                           color="success"
//                         >
//                           Resume
//                         </Button>
//                       )}
//                       {['started', 'resumed'].includes(task.status) && (
//                         <Button
//                           size="small"
//                           startIcon={<Stop />}
//                           onClick={() => handleTaskAction(task, 'stop')}
//                           color="error"
//                         >
//                           Stop
//                         </Button>
//                       )}
//                     </Box>
//                   </TableCell>
//                 </TableRow>
                
//                 <TableRow>
//                   <TableCell colSpan={9} sx={{ p: 0, border: 'none' }}>
//                     <ActivityTimeline
//                       task={task}
//                       isExpanded={expandedTasks.has(task.taskId)}
//                       formatTime={formatTime}
//                       onDurationCalculated={onDurationCalculated}
//                     />
//                   </TableCell>
//                 </TableRow>
//               </React.Fragment>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <TablePagination
//         component="div"
//         count={tasks.length}
//         page={page}
//         onPageChange={handlePageChange}
//         rowsPerPage={rowsPerPage}
//         onRowsPerPageChange={handleRowsPerPageChange}
//         rowsPerPageOptions={[5, 10, 25, 50]}
//         showFirstButton
//         showLastButton
//       />

//       <SummaryStatistics
//         data={tasks}
//         isAdmin={false}
//         formatTime={formatTime}
//       />
//     </>
//   );
// };

// export default TasksAssignedToMe;
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TablePagination,
  Typography,
  Fab,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  PlayArrow,
  Stop,
  Person,
  Business,
  Repeat,
  Assignment,
  Settings,
  Telegram
} from '@mui/icons-material';
import ActivityTimeline from '../../components/ActivityTimeline';
import SummaryStatistics from '../../components/SummaryStatistics';
import type { Task } from '../../types/TaskHistoryTypes';
import { getLastActivityTime } from '../../utils/dateUtils';
import RecurringDialog from '../RecurringTask/RecurringDialog';
// import NotificationSnackbar from './NotificationSnackbar';
import RecurringTaskManager from '../RecurringTask/RecurringTaskManager';
import TaskService from '../../../../../services/taskService';
import NotificationSnackbar from '../NotificationSnackbar';

interface TasksAssignedToMeProps {
  tasks: Task[];
  formatTime: (seconds: number) => string;
  onTableAction: (task: Task, action: 'resume' | 'stop' | 'start') => void;
  isRunning: boolean;
  currentUser: any;
  calculatedDurations: Record<string, number>;
  onDurationCalculated: (taskId: string, duration: number) => void;
  onToggleRecurring?: (task: Task) => void;
  onRefreshTasks?: () => void;
}

interface NotificationState {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  details?: string;
}
const isRecurringTaskExpired = (task: Task): boolean => {
  if (!(task as any).isRecurring) {
    return false;
  }

  const taskName = task.taskName;
  const recurringOptions = (task as any).recurringOptions;
  const endConditions = (task as any).endConditions;
  const recurringStatus = (task as any).recurringStatus;
  const recurringCount = (task as any).recurringCount || 0;

  console.log(`🔍 Checking recurring task expiry for "${taskName}":`, {
    recurringOptions,
    endConditions,
    recurringStatus,
    recurringCount
  });

  // Check end date from recurringOptions
  if (recurringOptions?.endDate) {
    const endDate = new Date(recurringOptions.endDate);
    const now = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    console.log(`📅 Checking end date: ${endDate.toDateString()} vs now: ${now.toDateString()}`);
    
    if (now > endDate) {
      console.log(`❌ Task "${taskName}" expired on ${endDate.toDateString()}`);
      return true;
    }
  }

  // Check end date from endConditions
  if (endConditions?.endDate) {
    const endDate = new Date(endConditions.endDate);
    const now = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    console.log(`📅 Checking endConditions date: ${endDate.toDateString()} vs now: ${now.toDateString()}`);
    
    if (now > endDate) {
      console.log(`❌ Task "${taskName}" expired on ${endDate.toDateString()}`);
      return true;
    }
  }

  // Check maximum runs
  if (recurringOptions?.endCondition === 'after' && recurringOptions?.repeatCount) {
    console.log(`🔢 Checking run count: ${recurringCount}/${recurringOptions.repeatCount}`);
    
    if (recurringCount >= recurringOptions.repeatCount) {
      console.log(`❌ Task "${taskName}" completed maximum runs: ${recurringCount}/${recurringOptions.repeatCount}`);
      return true;
    }
  }

  // Check status
  if (recurringStatus === 'completed' || recurringStatus === 'disabled') {
    console.log(`❌ Task "${taskName}" has inactive status: ${recurringStatus}`);
    return true;
  }

  console.log(`✅ Task "${taskName}" is still active`);
  return false;
};
const isRecurringTaskExpiringSoon = (task: Task, daysThreshold: number = 7): boolean => {
  if (!(task as any).isRecurring) {
    return false;
  }

  const recurringOptions = (task as any).recurringOptions;
  const endConditions = (task as any).endConditions;
  
  // Get end date from either source
  const endDate = recurringOptions?.endDate || endConditions?.endDate;
  
  if (!endDate) {
    return false; // No end date set
  }

  try {
    const expiryDate = new Date(endDate);
    const now = new Date();
    
    // Calculate days until expiry
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // Return true if expiring within threshold days (but not already expired)
    return daysUntilExpiry > 0 && daysUntilExpiry <= daysThreshold;
  } catch (error) {
    console.error('Error checking expiry date for task:', task.taskName, error);
    return false;
  }
};

const TasksAssignedToMe: React.FC<TasksAssignedToMeProps> = ({
  tasks,
  formatTime,
  onTableAction,
  isRunning,
  currentUser,
  calculatedDurations,
  onDurationCalculated,
  onToggleRecurring,
   onRefreshTasks
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [recurringManagerOpen, setRecurringManagerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [recurringSettings, setRecurringSettings] = useState<Record<string, any>>({});
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'info'
  });
const [taskTelegramNumbers, setTaskTelegramNumbers] = useState<Record<string, string>>({});
  // Load recurring settings from localStorage on component mount
  useEffect(() => {
    const settings = TaskService.getAllRecurringSettings();
    setRecurringSettings(settings);
  }, []);

  const showNotification = (
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info',
    title?: string,
    details?: string
  ) => {
    setNotification({
      open: true,
      message,
      type,
      title,
      details
    });
  };

  const handleRecurringSave = async (task: Task, recurringSettingsData: any) => {
    try {
      console.log('🔄 Updating recurring settings for task:', task.taskName);
      console.log('📋 Recurring settings:', recurringSettingsData);
      
      // Use the TaskService to update recurring settings
      const result = await TaskService.updateRecurringSettings(task.taskId, recurringSettingsData);
      
      // Update local state
      setRecurringSettings(prev => ({
        ...prev,
        [task.taskId]: recurringSettingsData
      }));
      
      // Show success notification
      if (recurringSettingsData.isRecurring) {
        console.log(`✅ Task "${task.taskName}" recurring settings updated`);
        showNotification(
          `Recurring settings saved for "${task.taskName}"`,
          result.isLocal ? 'warning' : 'success',
          result.isLocal ? 'Saved Locally' : 'Recurring Task Configured',
          result.message || 'Settings saved successfully'
        );
      } else {
        console.log(`❌ Task "${task.taskName}" recurring disabled`);
        showNotification(
          `Recurring disabled for "${task.taskName}"`,
          'info',
          'Recurring Task Disabled'
        );
      }
      
           // Close the dialog
      setRecurringDialogOpen(false);
      setSelectedTask(null);
      
    } catch (error: any) {
      console.error('❌ Error updating recurring settings:', error);
      
      // Show error notification with details
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      showNotification(
        'Failed to update recurring settings',
        'error',
        'Configuration Error',
        `${errorMessage}\n\nNote: This feature may require backend updates.`
      );
    }
  };

  const handleRecurringClick = (task: Task) => {
    console.log('🔄 Opening recurring dialog for task:', task.taskName);
    setSelectedTask(task);
    setRecurringDialogOpen(true);
  };

  const handleToggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };
const isTaskApproved = useCallback((task: Task): boolean => {
  // Check if task is approved
  const isApproved = (task as any).isApproved || (task as any).is_approved;
  const approvedBy = (task as any).approvedBy || (task as any).approved_by;
  const status = task.status;
  
  // Task is considered approved if:
  // 1. isApproved flag is true, OR
  // 2. status is 'approved', OR  
  // 3. approvedBy field exists
  const taskApproved = isApproved === true || 
                      status === 'approved' || 
                      (approvedBy && approvedBy.trim() !== '');
  
  if (taskApproved) {
    console.log(`✅ Task "${task.taskName}" is approved - will be filtered out`);
    return true;
  }
  
  return false;
}, []);

const handleTaskAction = (task: Task, action: 'resume' | 'stop' | 'start') => {
  console.log('🎯 TasksAssignedToMe.handleTaskAction:', { 
    task: task.taskName, 
    action, 
    currentStatus: task.status 
  });
  
  // Create base task with proper typing
  const baseTask: Task = {
    ...task,
    // Ensure required fields are present
    taskId: task.taskId,
    taskName: task.taskName,
    type: task.type,
    totalDuration: task.totalDuration || 0,
    userEmail: task.userEmail,
    username: task.username || task.userEmail?.split('@')[0] || 'Unknown',
    activities: task.activities || []
  };
 if (onRefreshTasks) {
        setTimeout(() => {
          onRefreshTasks();
        }, 500);
      }
    
  if (action === 'resume') {
    const enhancedTask: Task = {
      ...baseTask,
      status: 'resumed' as const, // ✅ Proper typing with const assertion
      elapsedTime: task.totalDuration || 0,
      resumedAt: new Date().toISOString(),
      id: task.taskId || task.id || ''
    };
    onTableAction(enhancedTask, 'resume');
    
  } else if (action === 'start') {
    if (task.status === 'ended') {
      // Restart ended task
      const restartTask: Task = {
        ...baseTask,
        status: 'started' as const, // ✅ Proper typing
        elapsedTime: task.totalDuration || 0,
        startTime: new Date().toISOString(),
        id: task.taskId || task.id || ''
      };
      onTableAction(restartTask, 'resume'); // Use resume to update existing task
    } else if (task.status === 'paused') {
      // Resume paused task
      const resumeTask: Task = {
        ...baseTask,
        status: 'resumed' as const, // ✅ Proper typing
        elapsedTime: task.totalDuration || 0,
        resumedAt: new Date().toISOString(),
        id: task.taskId || task.id || ''
      };
      onTableAction(resumeTask, 'resume');
    } else {
      // Start new task
      const startTask: Task = {
        ...baseTask,
        status: 'started' as const, // ✅ Proper typing
        startTime: new Date().toISOString(),
        elapsedTime: 0,
        id: task.taskId || task.id || ''
      };
      onTableAction(startTask, 'start');
    }
    
  } else if (action === 'stop') {
    const stopTask: Task = {
      ...baseTask,
      status: 'ended' as const, // ✅ Proper typing
      endTime: new Date().toISOString(),
      id: task.taskId || task.id || ''
    };
    onTableAction(stopTask, 'stop');
  }
};
// Add this helper function to parse estimated time string to seconds
const parseEstimatedTimeToSeconds = (estimatedTimeString: string | number): number => {
  // If it's already a number, return it
  if (typeof estimatedTimeString === 'number') {
    return estimatedTimeString;
  }

  // If it's not a string, return 0
  if (typeof estimatedTimeString !== 'string') {
    return 0;
  }

  let totalSeconds = 0;
  const timeString = estimatedTimeString.toLowerCase().trim();

  // Handle empty or invalid strings
  if (!timeString || timeString === 'not set' || timeString === '') {
    return 0;
  }

  try {
    // Parse hours
    const hourMatch = timeString.match(/(\d+)\s*(?:hour|hr|h)s?/);
    if (hourMatch) {
      totalSeconds += parseInt(hourMatch[1]) * 3600; // 1 hour = 3600 seconds
    }

    // Parse minutes
    const minuteMatch = timeString.match(/(\d+)\s*(?:minute|min|m)s?/);
    if (minuteMatch) {
      totalSeconds += parseInt(minuteMatch[1]) * 60; // 1 minute = 60 seconds
    }

    // Parse seconds
    const secondMatch = timeString.match(/(\d+)\s*(?:second|sec|s)s?/);
    if (secondMatch) {
      totalSeconds += parseInt(secondMatch[1]);
    }

    // Handle simple number formats (assume minutes if no unit specified)
    if (totalSeconds === 0) {
      const numberMatch = timeString.match(/^(\d+)$/);
      if (numberMatch) {
        totalSeconds = parseInt(numberMatch[1]) * 60; // Assume minutes
      }
    }

    return totalSeconds;
  } catch (error) {
    console.error('Error parsing estimated time:', estimatedTimeString, error);
    return 0;
  }
};

// Update the getEstimatedTime function
const getEstimatedTime = (task: Task): number => {
  // Try different possible property names for estimated time
  const estimatedTimeRaw = 
    (task as any).estimatedTime || 
    (task as any).estimated_time || 
    (task as any).estimatedDuration || 
    (task as any).estimated_duration ||
    (task as any).plannedDuration ||
    (task as any).planned_duration ||
    0;

  console.log('🔍 Raw estimated time for task', task.taskName, ':', estimatedTimeRaw);

  // Parse the estimated time to seconds
  const estimatedTimeInSeconds = parseEstimatedTimeToSeconds(estimatedTimeRaw);
  
  console.log('✅ Parsed estimated time in seconds:', estimatedTimeInSeconds);
  
  return estimatedTimeInSeconds;
};

// Update the formatEstimatedTime function
const formatEstimatedTime = (estimatedTimeInSeconds: number): string => {
  if (estimatedTimeInSeconds === 0) {
    return 'Not set';
  }
  
  // Use your existing formatTime function
  return formatTime(estimatedTimeInSeconds);
};

// Add a function to get estimated time display with original format
const getEstimatedTimeDisplay = (task: Task): { formatted: string; original: string; seconds: number } => {
  const originalValue = (task as any).estimatedTime || (task as any).estimated_time || '';
  const seconds = getEstimatedTime(task);
  const formatted = formatEstimatedTime(seconds);
  
  return {
    formatted,
    original: originalValue.toString(),
    seconds
  };
};

// Function to get row color based on estimated time
// Update the getEstimatedTimeRowColor function
const getEstimatedTimeRowColor = (estimatedTimeInSeconds: number) => {
  if (estimatedTimeInSeconds === 0) {
    return {}; // No special styling for tasks without estimated time
  }
  
  const minutes = estimatedTimeInSeconds / 60;
  
  if (minutes < 15) {
    return {
      backgroundColor: '#ffebee', // Light red
      borderLeft: '4px solid #f44336' // Red border
    };
  } else if (minutes < 30) {
    return {
      backgroundColor: '#fff3e0', // Light orange
      borderLeft: '4px solid #ff9800' // Orange border
    };
  } else if (minutes < 60) {
    return {
      backgroundColor: '#f3e5f5', // Light purple
      borderLeft: '4px solid #9c27b0' // Purple border
    };
  } else {
    return {
      backgroundColor: '#e8f5e8', // Light green
      borderLeft: '4px solid #4caf50' // Green border
    };
  }
};

const handleTelegramClick = async (task: Task) => {
  const assignedToEmail = (task as any).assignedToEmail;
  const assignedByEmail = (task as any).assignedByEmail;
  const userEmail = currentUser?.email;
  
  let telegramNumber = '';
  let contactName = '';
  
  console.log('📱 Task telegram data:', {
    taskId: task.taskId,
    assignedByEmail,
    assignedToEmail,
    userEmail,
    assignedByTelegram: (task as any).assignedByTelegram,
    assignedToTelegram: (task as any).assignedToTelegram,
    telegramNumber: (task as any).telegramNumber
  });
  
  // Determine who to contact and get their telegram
  if (assignedByEmail && assignedByEmail !== userEmail) {
    // Contact the assigner
    telegramNumber = (task as any).assignedByTelegram || (task as any).telegramNumber;
    contactName = `Task Assigner (${assignedByEmail.split('@')[0]})`;
  } else if (assignedToEmail && assignedToEmail !== userEmail) {
    // Contact the assignee
    telegramNumber = (task as any).assignedToTelegram || (task as any).telegramNumber;
    contactName = `Assignee (${assignedToEmail.split('@')[0]})`;
  } else {
    // Self-assigned task
    telegramNumber = (task as any).telegramNumber;
    contactName = 'yourself';
  }
  
  if (!telegramNumber || telegramNumber.trim() === '') {
    showNotification(
      `No Telegram number available for ${contactName}`, 
      'warning',
      'Contact Not Available',
      'The telegram number was not saved when this task was created'
    );
    return;
  }
  
  // Format and open telegram
  let cleanNumber = telegramNumber.toString().trim().replace(/[\s\-\(\)]/g, '');
  let telegramUrl = '';
  
  if (cleanNumber.startsWith('@')) {
    telegramUrl = `https://t.me/${cleanNumber.substring(1)}`;
  } else if (cleanNumber.startsWith('+')) {
    telegramUrl = `https://t.me/${cleanNumber}`;
  } else if (cleanNumber.match(/^\d+$/)) {
    telegramUrl = `https://t.me/+${cleanNumber}`;
  } else {
    telegramUrl = `https://t.me/${cleanNumber}`;
  }
  
  console.log('🚀 Opening Telegram:', {
    telegramNumber,
    telegramUrl,
    contactName
  });
  
  window.open(telegramUrl, '_blank');
  
  showNotification(
    `Opening Telegram chat with ${contactName}`, 
    'success',
    'Telegram Contact',
    `Number: ${telegramNumber}`
  );
};





  // Enhanced function to get recurring info for a task
  const getTaskRecurringInfo = (task: Task) => {
    // First check if task has recurring data from backend
    const taskRecurring = (task as any).isRecurring;
    
    // Then check localStorage
    const localRecurring = recurringSettings[task.taskId];
    
    return {
      isRecurring: taskRecurring || localRecurring?.isRecurring || false,
      recurringType: (task as any).recurringType || localRecurring?.recurringType || 'schedule',
      recurringStatus: (task as any).recurringStatus || localRecurring?.recurringStatus || 'active',
      recurringCount: (task as any).recurringCount || localRecurring?.recurringCount || 0,
      nextRun: (task as any).nextRun || localRecurring?.nextRun,
      recurringPattern: (task as any).recurringPattern || localRecurring?.recurringPattern,
      isLocal: !!localRecurring && !taskRecurring
    };
  };

  const getTaskDuration = (task: Task): number => {
    if (calculatedDurations[task.taskId] !== undefined) {
      return calculatedDurations[task.taskId];
    }
    return task.totalDuration || 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'started': return 'success';
      case 'paused': return 'warning';
      case 'resumed': return 'info';
      case 'ended': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'meeting' ? <Business fontSize="small" /> : <Person fontSize="small" />;
  };

  const getAssignmentInfo = (task: Task) => {
    const assignedBy = (task as any).assignedBy || (task as any).assignedByEmail || (task as any).createdBy;
    const assignedByStr = typeof assignedBy === 'string' ? assignedBy : '';
    
    if (assignedByStr && assignedByStr !== currentUser?.email) {
      const assignerName = assignedByStr.includes('@') ? assignedByStr.split('@')[0] : assignedByStr;
      return `Assigned by ${assignerName}`;
    }
    return 'Self-assigned';
  };
// Add this at the beginning of the component
const validTasks = useMemo(() => {
  const filtered = tasks.filter((task, index, array) => {
    // Check if task is valid
    const isValid = task && 
                   task.taskId && 
                   task.taskName && 
                   task.taskName !== 'Untitled Task' &&
                   task.taskName.trim() !== '';
    
    if (!isValid) {
      console.warn('⚠️ TasksAssignedToMe: Filtering out invalid task:', task);
      return false;
    }
    
    // Remove duplicates based on taskId
    const isDuplicate = array.findIndex(t => t.taskId === task.taskId) !== index;
    if (isDuplicate) {
      console.warn('⚠️ TasksAssignedToMe: Filtering out duplicate task:', task.taskName, task.taskId);
      return false;
    }

    // ✅ Filter out expired recurring tasks
    if (isRecurringTaskExpired(task)) {
      console.log(`🔄 TasksAssignedToMe: Filtering out expired recurring task: ${task.taskName}`);
      return false;
    }
    
    // ✅ NEW: Filter out approved tasks
    if (isTaskApproved(task)) {
      console.log(`✅ TasksAssignedToMe: Filtering out approved task: ${task.taskName}`);
      return false;
    }
    
    return true;
  });
  
  console.log('📊 TasksAssignedToMe: Valid tasks after filtering:', {
    original: tasks.length,
    afterValidation: filtered.length,
    filtered: tasks.length - filtered.length
  });
  
  return filtered;
}, [tasks, isRecurringTaskExpired, isTaskApproved]);

// Use validTasks instead of tasks in your component render
// Enhanced helper function with detailed logging

  // Render recurring cell with enhanced info
  const renderRecurringCell = (task: Task) => {
    const recurringInfo = getTaskRecurringInfo(task);
     const isExpiringSoon = isRecurringTaskExpiringSoon(task);
    
     return (
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {recurringInfo.isRecurring ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Chip
              icon={<Repeat />}
              label={recurringInfo.recurringType || 'Active'}
              size="small"
              color={recurringInfo.recurringStatus === 'active' ? 'success' : 
                    recurringInfo.recurringStatus === 'completed' ? 'default' : 'warning'}
              variant="filled"
              onClick={() => handleRecurringClick(task)}
              sx={{ cursor: 'pointer' }}
            />
            
            {/* ✅ Show expiry warning */}
            {isExpiringSoon && (
              <Chip
                label="Expiring Soon"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ height: 16, fontSize: '0.6rem' }}
              />
            )}
            
            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
              {recurringInfo.recurringCount} runs
            </Typography>
            
            {/* ✅ Show end date if available */}
            {((task as any).recurringOptions?.endDate || (task as any).endConditions?.endDate) && (
              <Typography variant="caption" color="error" sx={{ fontSize: '0.6rem' }}>
                Ends: {new Date((task as any).recurringOptions?.endDate || (task as any).endConditions?.endDate).toLocaleDateString()}
              </Typography>
            )}
            
            {recurringInfo.isLocal && (
              <Chip
                label="Local Only"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ height: 16, fontSize: '0.6rem' }}
              />
            )}
          </Box>
        ) : (
          <Button
            size="small"
            startIcon={<Repeat />}
            onClick={() => handleRecurringClick(task)}
            variant="outlined"
            color="primary"
          >
            Set Recurring
          </Button>
        )}
      </Box>
    </TableCell>
  );
};
const paginatedTasks = useMemo(() => {
  const startIndex = page * rowsPerPage;
  return validTasks.slice(startIndex, startIndex + rowsPerPage);
}, [validTasks, page, rowsPerPage]);// Update dependency

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Count recurring tasks for the FAB badge
  const recurringTaskCount = Object.keys(recurringSettings).length;

 if (validTasks.length === 0) { // Use validTasks.length
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="textSecondary" gutterBottom>
        No Tasks Assigned to You
      </Typography>
      <Typography variant="body2" color="textSecondary">
        No tasks assigned to you found matching the current filters.
      </Typography>
    </Box>
  );
}

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Task Details</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Duration</TableCell>
               <TableCell>Estimated Time</TableCell>
              <TableCell>Assignment Info</TableCell>
              <TableCell>Last Activity</TableCell>
              <TableCell>Recurring</TableCell>
              <TableCell align="center">Telegram</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTasks.map((task: Task) => (
              <React.Fragment key={task.taskId}>
                <TableRow hover  sx={{
    ...getEstimatedTimeRowColor((task as any).estimatedTime || 0), // ADD THIS LINE
    '&:hover': {
      opacity: 0.8
    }
  }}
>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton 
                        size="small"
                        onClick={() => handleToggleTaskExpansion(task.taskId)}
                      >
                        {expandedTasks.has(task.taskId) ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {task.taskName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {task.taskId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getTypeIcon(task.type)}
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {task.type}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      size="small"
                      color={getStatusColor(task.status) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {formatTime(getTaskDuration(task))}
                      </Typography>
                      {calculatedDurations[task.taskId] !== undefined && 
                       calculatedDurations[task.taskId] !== (task.totalDuration || 0) && (
                        <Chip
                          label="✓ Accurate"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </TableCell>
          <TableCell>
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <Typography 
      variant="body2" 
      sx={{ 
        fontFamily: 'monospace', 
        fontWeight: 'bold',
        color: getEstimatedTime(task) === 0 ? 'text.secondary' : 'text.primary'
      }}
    >
      {(() => {
        const estimatedDisplay = getEstimatedTimeDisplay(task);
        return estimatedDisplay.seconds === 0 ? 'Not set' : estimatedDisplay.formatted;
      })()}
    </Typography>
    {/* <Typography variant="caption" color="textSecondary">
      {getEstimatedTime(task) === 0 ? 'No estimate' : 'Estimated'}
    </Typography> */}
    {/* Show original format as tooltip or secondary text */}
    {/* {(task as any).estimatedTime && (task as any).estimatedTime !== 0 && (
      <Typography variant="caption" color="primary" sx={{ fontSize: '0.65rem' }}>
        Original: {(task as any).estimatedTime}
      </Typography>
    )} */}
    {/* Debug info in development */}
    {/* {process.env.NODE_ENV === 'development' && (
      <Typography variant="caption" color="error" sx={{ fontSize: '0.6rem' }}>
        Debug: {getEstimatedTime(task)}s from "{(task as any).estimatedTime}"
      </Typography>
    )} */}
  </Box>
</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getAssignmentInfo(task)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {getLastActivityTime(task)}
                    </Typography>
                  </TableCell>
                  {renderRecurringCell(task)}
               <TableCell align="center">
  <Tooltip title="Contact via Telegram">
    <IconButton
      size="small"
      onClick={() => handleTelegramClick(task)}
      sx={{
        color: '#0088cc', // Always show as available
        '&:hover': {
          backgroundColor: 'rgba(0, 136, 204, 0.1)',
          transform: 'scale(1.1)'
        }
      }}
    >
      <Telegram fontSize="small" />
    </IconButton>
  </Tooltip>
</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {task.status === 'paused' && (
                        <Button
                          size="small"
                          startIcon={<PlayArrow />}
                          onClick={() => handleTaskAction(task, 'resume')}
                          disabled={isRunning}
                          color="success"
                        >
                          Resume
                        </Button>
                      )}
                      {['started', 'resumed'].includes(task.status) && (
                        <Button
                          size="small"
                          startIcon={<Stop />}
                          onClick={() => handleTaskAction(task, 'stop')}
                          color="error"
                        >
                          Stop
                        </Button>
                      )}
                      {task.status === 'ended' && (
                        <Button
                          size="small"
                          startIcon={<PlayArrow />}
                          onClick={() => handleTaskAction(task, 'start')}
                          disabled={isRunning}
                          color="primary"
                        >
                          Restart
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell colSpan={10} sx={{ p: 0, border: 'none' }}>
                    <ActivityTimeline
                      task={task}
                      isExpanded={expandedTasks.has(task.taskId)}
                      formatTime={formatTime}
                      onDurationCalculated={onDurationCalculated}
                    />
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    <TablePagination
  component="div"
  count={validTasks.length} // Use validTasks.length
  page={page}
  onPageChange={handlePageChange}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={handleRowsPerPageChange}
  rowsPerPageOptions={[5, 10, 25, 50]}
  showFirstButton
  showLastButton
/>


<SummaryStatistics
  data={validTasks} // Use validTasks
  isAdmin={false}
  formatTime={formatTime}
/>

      {/* Floating Action Button for Recurring Task Manager */}
      <Tooltip title={`Manage Recurring Tasks${recurringTaskCount > 0 ? ` (${recurringTaskCount})` : ''}`}>
        <Fab
          color="primary"
          aria-label="manage recurring tasks"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => setRecurringManagerOpen(true)}
        >
          <Box sx={{ position: 'relative' }}>
            <Settings />
            {recurringTaskCount > 0 && (
              <Chip
                label={recurringTaskCount}
                size="small"
                color="secondary"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  height: 20,
                  minWidth: 20,
                  fontSize: '0.7rem'
                }}
              />
            )}
          </Box>
        </Fab>
      </Tooltip>

      {/* Enhanced Recurring Dialog */}
      <RecurringDialog
        open={recurringDialogOpen}
        task={selectedTask}
        onClose={() => {
          console.log('🔄 Closing recurring dialog');
          setRecurringDialogOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleRecurringSave}
      />

      {/* Recurring Task Manager */}
      <RecurringTaskManager
        open={recurringManagerOpen}
        onClose={() => setRecurringManagerOpen(false)}
      />

      {/* Notification System */}
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        type={notification.type}
        title={notification.title}
        details={notification.details}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default TasksAssignedToMe;

