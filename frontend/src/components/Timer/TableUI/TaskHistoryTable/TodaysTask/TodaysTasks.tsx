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
//   Alert
// } from '@mui/material';
// import {
//   ExpandMore,
//   ExpandLess,
//   PlayArrow,
//   Stop,
//   Person,
//   Business,
//   Today,
//   Repeat,
//   NotificationsActive
// } from '@mui/icons-material';
// // import ActivityTimeline from './ActivityTimeline';
// // import SummaryStatistics from './SummaryStatistics';
// // import { Task } from '../types/TaskHistoryTypes';
// import { getLastActivityTime } from '../utils/dateUtils';
// import ActivityTimeline from '../components/ActivityTimeline';
// import SummaryStatistics from '../components/SummaryStatistics';
// import type { Task } from '../types/TaskHistoryTypes';

// interface TodaysTasksProps {
//   tasks: Task[];
//   formatTime: (seconds: number) => string;
//   onTableAction: (task: Task, action: 'resume' | 'stop' | 'start') => void;
//   isRunning: boolean;
//   currentUser: any;
//   calculatedDurations: Record<string, number>;
//   onDurationCalculated: (taskId: string, duration: number) => void;
//   onToggleRecurring?: (task: Task) => void;
// }

// const TodaysTasks: React.FC<TodaysTasksProps> = ({
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

//   // Categorize today's tasks
//   const categorizedTodaysTasks = useMemo(() => {
//     const activeTasks = tasks.filter(task => ['started', 'resumed'].includes(task.status));
//     const pausedTasks = tasks.filter(task => task.status === 'paused');
//     const completedTasks = tasks.filter(task => ['ended', 'completed'].includes(task.status));
//     const recurringTasks = tasks.filter(task => (task as any).isRecurring);

//     return {
//       active: activeTasks,
//       paused: pausedTasks,
//       completed: completedTasks,
//       recurring: recurringTasks,
//       all: tasks
//     };
//   }, [tasks]);

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
//         <Today sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
//         <Typography variant="h6" color="textSecondary" gutterBottom>
//           No Tasks for Today
//         </Typography>
//         <Typography variant="body2" color="textSecondary">
//           No tasks created today found matching the current filters.
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <>
//       {/* Today's Tasks Summary Alert */}
//       <Alert 
//         severity="info" 
//         icon={<Today />}
//         sx={{ mb: 2 }}
//       >
//         <Typography variant="body2">
//           <strong>Today's Activity Summary:</strong> {categorizedTodaysTasks.active.length} active, {' '}
//           {categorizedTodaysTasks.paused.length} paused, {categorizedTodaysTasks.completed.length} completed, {' '}
//           {categorizedTodaysTasks.recurring.length} recurring tasks
//         </Typography>
//       </Alert>

//       {/* Quick Stats Cards */}
//       <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
//         <Box sx={{ 
//           p: 2, 
//           bgcolor: 'success.50', 
//           borderRadius: 1, 
//           border: '1px solid', 
//           borderColor: 'success.200',
//           minWidth: 120
//         }}>
//           <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
//             {categorizedTodaysTasks.active.length}
//           </Typography>
//           <Typography variant="body2" color="success.dark">
//             Active Now
//           </Typography>
//         </Box>
        
//         <Box sx={{ 
//           p: 2, 
//           bgcolor: 'warning.50', 
//           borderRadius: 1, 
//           border: '1px solid', 
//           borderColor: 'warning.200',
//           minWidth: 120
//         }}>
//           <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
//             {categorizedTodaysTasks.paused.length}
//           </Typography>
//           <Typography variant="body2" color="warning.dark">
//             Paused
//           </Typography>
//         </Box>
        
//         <Box sx={{ 
//           p: 2, 
//           bgcolor: 'info.50', 
//           borderRadius: 1, 
//           border: '1px solid', 
//           borderColor: 'info.200',
//           minWidth: 120
//         }}>
//           <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
//             {categorizedTodaysTasks.completed.length}
//           </Typography>
//           <Typography variant="body2" color="info.dark">
//             Completed
//           </Typography>
//         </Box>

//         <Box sx={{ 
//           p: 2, 
//           bgcolor: 'secondary.50', 
//           borderRadius: 1, 
//           border: '1px solid', 
//           borderColor: 'secondary.200',
//           minWidth: 120
//         }}>
//           <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 'bold' }}>
//             {categorizedTodaysTasks.recurring.length}
//           </Typography>
//           <Typography variant="body2" color="secondary.dark">
//             Recurring
//           </Typography>
//         </Box>
//       </Box>

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
//                 <TableRow 
//                   hover
//                   sx={{
//                     // Highlight active tasks
//                     bgcolor: ['started', 'resumed'].includes(task.status) ? 'success.50' : 
//                              task.status === 'paused' ? 'warning.50' : 'inherit'
//                   }}
//                 >
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
//                           {['started', 'resumed'].includes(task.status) && (
//                             <NotificationsActive 
//                               sx={{ ml: 1, fontSize: 16, color: 'success.main' }} 
//                             />
//                           )}
//                         </Typography>
//                         <Typography variant="caption" color="textSecondary">
//                                                   ID: {task.taskId}
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

// export default TodaysTasks;

import React, { useState, useMemo } from 'react';
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
  Typography
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  PlayArrow,
  Stop,
  Person,
  Business,
  Repeat,
  Today
} from '@mui/icons-material';
import ActivityTimeline from '../../components/ActivityTimeline';
import SummaryStatistics from '../../components/SummaryStatistics';
// import RecurringDialog from '../components/RecurringDialog';
import type { Task } from '../../types/TaskHistoryTypes';
import { getLastActivityTime } from '../../utils/dateUtils';
import RecurringDialog from '../RecurringTask/RecurringDialog';

interface TodaysTasksProps {
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

const TodaysTasks: React.FC<TodaysTasksProps> = ({
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleToggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

 const handleTaskAction = (task: Task, action: 'resume' | 'stop' | 'start') => {
  console.log('🎯 TodaysTasks.handleTaskAction:', { task: task.taskName, action });
  
  // Find if this task already exists in the tasks list
  const existingTask = tasks.find(t => t.taskId === task.taskId);
  
  let taskToProcess: Task;
  
  if (existingTask) {
    // Update existing task instead of creating new one
    console.log('🔄 Updating existing task in TodaysTasks');
    taskToProcess = {
      ...existingTask, // Preserve all existing data
      status: action === 'start' ? 'started' : 
              action === 'resume' ? 'resumed' : 
              action === 'stop' ? 'ended' : existingTask.status,
      // Only update necessary fields
      elapsedTime: existingTask.totalDuration || 0,
      totalDuration: existingTask.totalDuration || 0,
      // Add timing fields based on action
      ...(action === 'resume' || action === 'start') && {
        resumedAt: new Date().toISOString(),
      },
    };
  } else {
    // Only create new task if it doesn't exist
    console.log('➕ Creating new task in TodaysTasks');
    taskToProcess = {
      ...task,
      // Ensure all required fields are present
      taskId: task.taskId,
      taskName: task.taskName,
      type: task.type,
      status: task.status,
      userEmail: task.userEmail,
      username: task.username || task.userEmail?.split('@')[0] || 'Unknown',
      totalDuration: task.totalDuration || 0,
      activities: task.activities || [],
      elapsedTime: task.totalDuration || 0,
      id: task.taskId || task.id || '',
      // Add timing fields for new tasks
      ...(action === 'resume' || action === 'start') && {
        resumedAt: new Date().toISOString(),
      },
    };
  }
  
  console.log('✅ Processing task:', taskToProcess);
  onTableAction(taskToProcess, action);
};
// Add this at the beginning of the component
const validTasks = useMemo(() => {
  return tasks.filter(task => {
    const isValid = task && 
                   task.taskId && 
                   task.taskName && 
                   task.taskName !== 'Untitled Task' &&
                   task.taskName.trim() !== '' &&
                   task.userEmail;
    
    if (!isValid) {
      console.warn('⚠️ TodaysTasks: Filtering out invalid task:', task);
    }
    
    return isValid;
  });
}, [tasks]);

  const handleRecurringClick = (task: Task) => {
    setSelectedTask(task);
    setRecurringDialogOpen(true);
  };

 const handleRecurringSave = (task: Task, recurringSettings: any) => {
  console.log('💾 TodaysTasks: Saving recurring settings');
  
  const updatedTask: Task = {
    ...task, // Preserve all original task data
    ...recurringSettings, // Apply recurring settings
    // Ensure critical fields are preserved
    taskId: task.taskId,
    taskName: task.taskName,
    userEmail: task.userEmail,
    username: task.username
  };
  
  onTableAction(updatedTask, 'start');
  console.log(`✅ Task "${task.taskName}" recurring settings updated`);
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
  const assignedBy = (task as any).assignedBy || (task as any).assignedByEmail;
  const assignedTo = (task as any).assignedTo || (task as any).assignedToEmail;
  const userEmail = currentUser?.email || currentUser?.userEmail;
  
  // Ensure assignedBy and assignedTo are strings before using string methods
  const assignedByStr = typeof assignedBy === 'string' ? assignedBy : String(assignedBy || '');
  const assignedToStr = typeof assignedTo === 'string' ? assignedTo : String(assignedTo || '');
  const userEmailStr = typeof userEmail === 'string' ? userEmail : String(userEmail || '');
  
  if (assignedByStr && assignedByStr !== userEmailStr) {
    const assignerName = assignedByStr.includes('@') ? assignedByStr.split('@')[0] : assignedByStr;
    return `Assigned by ${assignerName}`;
  } else if (assignedToStr && assignedToStr !== userEmailStr) {
    const assigneeName = assignedToStr.includes('@') ? assignedToStr.split('@')[0] : assignedToStr;
    return `Assigned to ${assigneeName}`;
  }
  return 'Self-created';
};


 const paginatedTasks = useMemo(() => {
  const startIndex = page * rowsPerPage;
  return validTasks.slice(startIndex, startIndex + rowsPerPage);
}, [validTasks, page, rowsPerPage]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (tasks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Today sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No Tasks for Today
        </Typography>
        <Typography variant="body2" color="textSecondary">
          No tasks created or worked on today found matching the current filters.
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
              {/* <TableCell>Assignment Info</TableCell> */}
              <TableCell>Last Activity</TableCell>
              {/* <TableCell>Recurring</TableCell> */}
              {/* <TableCell>Actions</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTasks.map((task: Task) => (
              <React.Fragment key={task.taskId}>
                <TableRow hover>
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
                        {/* Today indicator */}
                        <Chip
                          icon={<Today />}
                          label="Today"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                        />
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
                  {/* <TableCell>
                    <Typography variant="body2">
                      {getAssignmentInfo(task)}
                    </Typography>
                  </TableCell> */}
                  <TableCell>
                    <Typography variant="caption">
                      {getLastActivityTime(task)}
                    </Typography>
                  </TableCell>
                  {/* <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {(task as any).isRecurring ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip
                            icon={<Repeat />}
                            label={`${(task as any).recurringType || 'Active'}`}
                            size="small"
                            color={(task as any).recurringStatus === 'active' ? 'success' : 'warning'}
                            variant="filled"
                            onClick={() => handleRecurringClick(task)}
                            sx={{ cursor: 'pointer' }}
                          />
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                            {(task as any).recurringCount || 0} runs
                          </Typography>
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
                  </TableCell> */}
                  {/* <TableCell>
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
                  </TableCell> */}
                </TableRow>
                
                <TableRow>
                  <TableCell colSpan={8} sx={{ p: 0, border: 'none' }}>
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

      {/* Today's Tasks Summary */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom color="success.main">
          Today's Tasks Summary
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Total Today's Tasks
            </Typography>
            <Typography variant="h6" color="success.main">
              {tasks.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Active Tasks
            </Typography>
            <Typography variant="h6" color="warning.main">
              {tasks.filter(task => ['started', 'resumed', 'paused'].includes(task.status)).length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Completed Today
            </Typography>
            <Typography variant="h6" color="success.main">
              {tasks.filter(task => task.status === 'ended').length}
            </Typography>
          </Box>
          {/* <Box>
            <Typography variant="body2" color="textSecondary">
              Recurring Tasks
            </Typography>
            <Typography variant="h6" color="info.main">
              {tasks.filter(task => (task as any).isRecurring).length}
            </Typography>
          </Box> */}
          <Box>
            <Typography variant="body2" color="textSecondary">
              Total Duration Today
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
              {formatTime(tasks.reduce((total, task) => total + getTaskDuration(task), 0))}
            </Typography>
          </Box>
        </Box>
      </Box>

      <SummaryStatistics
        data={tasks}
        isAdmin={false}
        formatTime={formatTime}
      />

      {/* Recurring Dialog */}
      {/* <RecurringDialog
        open={recurringDialogOpen}
        task={selectedTask}
        onClose={() => {
          setRecurringDialogOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleRecurringSave}
      /> */}
    </>
  );
};

export default TodaysTasks;

