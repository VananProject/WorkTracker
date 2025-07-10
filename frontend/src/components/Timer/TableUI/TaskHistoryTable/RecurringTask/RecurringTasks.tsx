// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Box,
//   Typography,
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
//   Alert,
//   Tooltip,
//   Avatar,
//   LinearProgress,
//   TablePagination,
//   Collapse,
//   Stack,
//   Menu,
//   MenuItem,
//   ListItemIcon,
//   ListItemText,
//   Divider,
// } from '@mui/material';
// import {
//   Schedule as ScheduleIcon,
//   PlayArrow as PlayIcon,
//   Pause as PauseIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Repeat as RepeatIcon,
//   CalendarToday as CalendarIcon,
//   AccessTime as TimeIcon,
//   MoreVert as MoreVertIcon,
//   ExpandMore as ExpandMoreIcon,
//   ExpandLess as ExpandLessIcon,
//   Visibility as VisibilityIcon,
//   Settings as SettingsIcon,
//   Stop as StopIcon,
// } from '@mui/icons-material';
// import dayjs from 'dayjs';

// // Update interface to match your actual data structure
// interface RecurringTask {
//   taskId: string;
//   taskName: string;
//   assignedToEmail?: string;
//   assignedToName?: string;
//   userEmail: string;
//   username?: string;
//   type: string;
//   status: string;
//   totalDuration?: number;
//   // Recurring specific fields - make them all optional to handle missing data
//   isRecurring?: boolean;
//   recurringType?: string;
//   recurringStatus?: string;
//   recurringPattern?: any;
//   recurringOptions?: {
//     repeatInterval?: string;
//     specificDays?: number[];
//     repeatCount?: number;
//     endCondition?: string;
//     endDate?: Date;
//     nextRunDate?: Date;
//     lastCalculated?: Date;
//     statusOptions?: string[];
//     skipWeekends?: boolean;
//     workingDaysOnly?: boolean;
//     customInterval?: number;
//     monthlyOption?: 'date' | 'day';
//   };
//   recurringCount?: number;
//   nextRun?: string | Date;
//   lastRun?: string | Date;
//   createdAt?: Date;
//   activities?: any[];
// }

// interface Task {
//   taskId: string;
//   taskName: string;
//   assignedToEmail?: string;
//   assignedToName?: string;
//   userEmail: string;
//   username?: string;
//   type: "task" | "meeting";
//   status: string;
//   totalDuration?: number;
//   isRecurring?: boolean;
//   recurringType?: string;
//   recurringStatus?: string;
//   recurringOptions?: {
//     repeatInterval?: string;
//     specificDays?: number[];
//     repeatCount?: number;
//     endCondition?: string;
//     endDate?: Date;
//     nextRunDate?: Date;
//     skipWeekends?: boolean;
//     workingDaysOnly?: boolean;
//     customInterval?: number;
//   };
//   recurringCount?: number;
//   nextRun?: string | Date;
//   lastRun?: string | Date;
//   createdAt?: string;
//   activities?: any[];
// }

// interface RecurringTasksProps {
//   tasks: RecurringTask[];
//   formatTime: (seconds: number) => string;
//   onTableAction: (task: RecurringTask, action: 'resume' | 'stop' | 'start') => void;
//   isRunning: boolean;
//   currentUser: any;
//   calculatedDurations: Record<string, number>;
//   onDurationCalculated: (taskId: string, duration: number) => void;
//   onEditRecurring?: (task: RecurringTask) => void;
//   onDisableRecurring?: (task: RecurringTask) => void;
//   onDeleteRecurring?: (task: RecurringTask) => void;
//   onRefresh?: () => Promise<void>;
// }

// const RecurringTasks: React.FC<RecurringTasksProps> = ({
//   tasks = [],
//   formatTime,
//   onTableAction,
//   isRunning,
//   currentUser,
//   calculatedDurations = {},
//   onDurationCalculated,
//   onEditRecurring,
//   onDisableRecurring,
//   onDeleteRecurring,
//   onRefresh
// }) => {
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const [selectedTask, setSelectedTask] = useState<RecurringTask | null>(null);

//   // Refresh next run dates every minute
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setRefreshKey(prev => prev + 1);
//     }, 60000);

//     return () => clearInterval(interval);
//   }, []);

//   // Enhanced filtering with better validation
//   const validRecurringTasks = React.useMemo(() => {
//     if (!Array.isArray(tasks)) {
//       console.warn('Tasks is not an array:', tasks);
//       return [];
//     }

//     return tasks.filter(task => {
//       if (!task || typeof task !== 'object') {
//         console.warn('Invalid task object:', task);
//         return false;
//       }

//       if (!task.taskId || !task.taskName) {
//         console.warn('Task missing required fields:', task);
//         return false;
//       }

//       const hasRecurringProps = !!(
//         task.isRecurring || 
//         task.recurringType || 
//         task.recurringOptions || 
//         task.recurringPattern ||
//         task.recurringStatus
//       );

//       if (!hasRecurringProps) {
//         console.log('Task has no recurring properties:', task.taskName);
//         return false;
//       }

//       return true;
//     });
//   }, [tasks]);

//   const calculateNextRunDate = (task: RecurringTask): Date => {
//     try {
//       const recurringConfig = task.recurringOptions || task.recurringPattern || {};
//       const recurringType = task.recurringType || recurringConfig.repeatInterval || 'daily';
      
//       if (task.nextRun) {
//         const existingNext = new Date(task.nextRun);
//         if (!isNaN(existingNext.getTime()) && existingNext > new Date()) {
//           return existingNext;
//         }
//       }

//       if (recurringConfig.nextRunDate) {
//         const configNext = new Date(recurringConfig.nextRunDate);
//         if (!isNaN(configNext.getTime()) && configNext > new Date()) {
//           return configNext;
//         }
//       }

//       const baseDate = task.lastRun 
//         ? new Date(task.lastRun) 
//         : (task.createdAt ? new Date(task.createdAt) : new Date());
      
//       let nextDate = new Date(baseDate);
      
//       if (isNaN(nextDate.getTime())) {
//         nextDate = new Date();
//         nextDate.setDate(nextDate.getDate() + 1);
//         return nextDate;
//       }

//       switch (recurringType.toLowerCase()) {
//         case 'daily':
//           nextDate.setDate(nextDate.getDate() + 1);
//           break;
//         case 'weekly':
//           const specificDays = recurringConfig.specificDays;
//           if (specificDays && Array.isArray(specificDays) && specificDays.length > 0) {
//             const currentDay = nextDate.getDay();
//             const sortedDays = [...specificDays].sort((a, b) => a - b);
            
//             let nextDay = sortedDays.find(day => typeof day === 'number' && day > currentDay);
            
//             if (nextDay === undefined) {
//               nextDay = sortedDays[0];
//               const daysToAdd = (7 - currentDay) + nextDay;
//               nextDate.setDate(nextDate.getDate() + daysToAdd);
//             } else {
//               const daysToAdd = nextDay - currentDay;
//               nextDate.setDate(nextDate.getDate() + daysToAdd);
//             }
//           } else {
//             nextDate.setDate(nextDate.getDate() + 7);
//           }
//           break;
//         case 'monthly':
//           nextDate.setMonth(nextDate.getMonth() + 1);
//           break;
//         case 'custom':
//           const customInterval = recurringConfig.customInterval || 1;
//           nextDate.setDate(nextDate.getDate() + customInterval);
//           break;
//         default:
//           nextDate.setDate(nextDate.getDate() + 1);
//       }

//       if (recurringConfig.skipWeekends || recurringConfig.workingDaysOnly) {
//         let attempts = 0;
//         while ((nextDate.getDay() === 0 || nextDate.getDay() === 6) && attempts < 14) {
//           nextDate.setDate(nextDate.getDate() + 1);
//           attempts++;
//         }
//       }

//       return nextDate;
      
//     } catch (error) {
//       console.error('Error calculating next run date for task:', task.taskId, error);
//       const fallback = new Date();
//       fallback.setDate(fallback.getDate() + 1);
//       return fallback;
//     }
//   };

//   const getTimeUntilNext = (nextRunDate: Date): string => {
//     try {
//       const now = new Date();
//       const diff = nextRunDate.getTime() - now.getTime();
      
//       if (diff <= 0) return 'Overdue';
      
//       const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//       const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//       const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
//       if (days > 0) return `${days}d ${hours}h`;
//       if (hours > 0) return `${hours}h ${minutes}m`;
//       return `${minutes}m`;
//     } catch (error) {
//       return 'Unknown';
//     }
//   };

//   const getProgressPercentage = (task: RecurringTask): number => {
//     try {
//       const recurringConfig = task.recurringOptions || {};
//       const { endCondition, endDate, repeatCount } = recurringConfig;
      
//       if (endCondition === 'never') return 0;
      
//       if (endCondition === 'after' && repeatCount) {
//         const completed = task.recurringCount || 0;
//         return Math.min((completed / repeatCount) * 100, 100);
//       }
      
//       if (endCondition === 'on' && endDate) {
//         const endTime = new Date(endDate).getTime();
//         const startTime = task.createdAt ? new Date(task.createdAt).getTime() : new Date().getTime();
//         const currentTime = new Date().getTime();
        
//         if (!isNaN(endTime) && !isNaN(startTime)) {
//           const total = endTime - startTime;
//           const elapsed = currentTime - startTime;
//           return Math.min(Math.max((elapsed / total) * 100, 0), 100);
//         }
//       }
      
//       return 0;
//     } catch (error) {
//       return 0;
//     }
//   };
  
//   const formatRecurringDetails = (task: RecurringTask): string => {
//     try {
//       const recurringConfig = task.recurringOptions || task.recurringPattern || {};
//       const recurringType = task.recurringType || recurringConfig.repeatInterval || 'daily';
      
//       let details = '';
      
//       switch (recurringType.toLowerCase()) {
//         case 'daily':
//           details = 'Every day';
//           break;
//         case 'weekly':
//           const specificDays = recurringConfig.specificDays;
//           if (specificDays && Array.isArray(specificDays) && specificDays.length > 0) {
//             const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//             const selectedDays = specificDays
//               .filter(day => typeof day === 'number' && day >= 0 && day <= 6)
//               .map(day => dayNames[day])
//               .join(', ');
//             details = selectedDays ? `Every ${selectedDays}` : 'Every week';
//           } else {
//             details = 'Every week';
//           }
//           break;
//         case 'monthly':
//           details = 'Every month';
//           break;
//         case 'custom':
//           const customInterval = recurringConfig.customInterval || 1;
//           details = `Every ${customInterval} days`;
//           break;
//         default:
//           details = `${recurringType} schedule`;
//       }
      
//       const { endCondition, endDate, repeatCount } = recurringConfig;
//       if (endCondition === 'after' && repeatCount) {
//         details += ` (${repeatCount} times)`;
//       } else if (endCondition === 'on' && endDate) {
//         try {
//           details += ` (until ${dayjs(endDate).format('MMM DD, YYYY')})`;
//         } catch {
//           details += ' (until specified date)';
//         }
//       }
      
//       const filters = [];
//       if (recurringConfig.skipWeekends) filters.push('skip weekends');
//       if (recurringConfig.workingDaysOnly) filters.push('working days only');
      
//       if (filters.length > 0) {
//         details += ` • ${filters.join(', ')}`;
//       }
      
//       return details;
//     } catch (error) {
//       return 'Recurring task';
//     }
//   };

//   const handleMenuClick = (event: React.MouseEvent<HTMLElement>, task: RecurringTask) => {
//     setAnchorEl(event.currentTarget);
//     setSelectedTask(task);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//     setSelectedTask(null);
//   };

//   const handleEdit = () => {
//     if (selectedTask && onEditRecurring) {
//       onEditRecurring(selectedTask);
//     }
//     handleMenuClose();
//   };

//   const handleDelete = () => {
//     if (selectedTask && onDeleteRecurring) {
//       onDeleteRecurring(selectedTask);
//     }
//     handleMenuClose();
//   };

//   const handleToggleActive = () => {
//     if (selectedTask) {
//       const currentStatus = selectedTask.recurringStatus || 'active';
//       const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
//       const updatedTask = {
//         ...selectedTask,
//         recurringStatus: newStatus
//       };
      
//       onTableAction(updatedTask, 'start');
//     }
//     handleMenuClose();
//   };

//   const handleRunNow = (task: RecurringTask) => {
//     onTableAction(task, 'start');
//   };
//  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
//   const [recurringDialogTask, setRecurringDialogTask] = useState<Task | null>(null);
//     const convertToTask = useCallback((recurringTask: RecurringTask): Task => {
//     return {
//       ...recurringTask,
//       type: (recurringTask.type === 'meeting' ? 'meeting' : 'task') as "task" | "meeting",
//       createdAt: recurringTask.createdAt ? recurringTask.createdAt.toISOString() : undefined,
//     };
//   }, []);
//   //  const handleMenuClose = useCallback(() => {
//   //   setAnchorEl(null);
//   //   setSelectedTask(null);
//   // }, []);
//   const handleEditRecurring = useCallback((task: RecurringTask) => {
//     const convertedTask = convertToTask(task);
//     setRecurringDialogTask(convertedTask);
//     setRecurringDialogOpen(true);
//     handleMenuClose();
//   }, [handleMenuClose, convertToTask]); 
//   const toggleRowExpansion = (taskId: string) => {
//     const newExpanded = new Set(expandedRows);
//     if (newExpanded.has(taskId)) {
//       newExpanded.delete(taskId);
//     } else {
//       newExpanded.add(taskId);
//     }
//     setExpandedRows(newExpanded);
//   };

//   const handleChangePage = (event: unknown, newPage: number) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   // Paginated tasks
//   const paginatedTasks = validRecurringTasks.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage
//   );

//   return (
//     <Box sx={{ width: '100%' }}>
//       {/* Header */}
//       <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
//         <Typography variant="h6" fontWeight="600">
//           Recurring Tasks
//         </Typography>
//         <Box display="flex" gap={1} alignItems="center">
//           <Chip
//             label={`${validRecurringTasks.length} Tasks`}
//             color="primary"
//             variant="outlined"
//             size="small"
//           />
//           {onRefresh && (
//             <Button
//               variant="outlined"
//               size="small"
//               onClick={onRefresh}
//               startIcon={<RepeatIcon />}
//             >
//               Refresh
//             </Button>
//           )}
//         </Box>
//       </Box>

//       {/* No tasks message */}
//       {validRecurringTasks.length === 0 && (
//         <Alert severity="info" sx={{ mb: 2 }}>
//           <Typography variant="body2">
//             No recurring tasks found. Tasks need recurring configuration to appear here.
//           </Typography>
//         </Alert>
//       )}

//       {/* Tasks Table */}
//       {validRecurringTasks.length > 0 && (
//         <TableContainer component={Paper} elevation={1}>
//           <Table size="small">
//             <TableHead>
//               <TableRow sx={{ bgcolor: 'grey.50' }}>
//                 <TableCell width="40px" />
//                 <TableCell>
//                   <Typography variant="subtitle2" fontWeight="600">
//                     Task Details
//                   </Typography>
//                 </TableCell>
//                 <TableCell align="center" width="120px">
//                   <Typography variant="subtitle2" fontWeight="600">
//                     Status
//                   </Typography>
//                 </TableCell>
//                 <TableCell align="center" width="150px">
//                   <Typography variant="subtitle2" fontWeight="600">
//                     Schedule
//                   </Typography>
//                 </TableCell>
//                 <TableCell align="center" width="120px">
//                   <Typography variant="subtitle2" fontWeight="600">
//                     Next Run
//                   </Typography>
//                 </TableCell>
//                 <TableCell align="center" width="100px">
//                   <Typography variant="subtitle2" fontWeight="600">
//                     Progress
//                   </Typography>
//                 </TableCell>
//                 <TableCell align="center" width="120px">
//                   <Typography variant="subtitle2" fontWeight="600">
//                     Duration
//                   </Typography>
//                 </TableCell>
//                 <TableCell align="center" width="100px">
//                   <Typography variant="subtitle2" fontWeight="600">
//                     Actions
//                   </Typography>
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {paginatedTasks.map((task) => {
//                 const isExpanded = expandedRows.has(task.taskId);
//                 const nextRunDate = calculateNextRunDate(task);
//                 const timeUntilNext = getTimeUntilNext(nextRunDate);
//                 const progressPercentage = getProgressPercentage(task);
//                 const recurringDetails = formatRecurringDetails(task);
//                 const taskDuration = calculatedDurations[task.taskId] || task.totalDuration || 0;
//                 const recurringStatus = task.recurringStatus || 'active';
//                 const isTaskRunning = isRunning && task.status === 'started';

//                 return (
//                   <React.Fragment key={task.taskId}>
//                     <TableRow
//                       hover
//                       sx={{
//                         '&:hover': { bgcolor: 'action.hover' },
//                         bgcolor: isTaskRunning ? 'success.50' : 'inherit',
//                       }}
//                     >
//                       {/* Expand/Collapse Button */}
//                       <TableCell>
//                         <IconButton
//                           size="small"
//                           onClick={() => toggleRowExpansion(task.taskId)}
//                         >
//                           {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
//                         </IconButton>
//                       </TableCell>

//                       {/* Task Details */}
//                       <TableCell>
//                         <Box>
//                           <Typography variant="body2" fontWeight="600" noWrap>
//                             {task.taskName}
//                           </Typography>
//                           <Typography variant="caption" color="text.secondary" noWrap>
//                             {task.assignedToEmail || task.userEmail}
//                           </Typography>
//                           <Box display="flex" gap={0.5} mt={0.5}>
//                             <Chip
//                               label={task.type}
//                               size="small"
//                               variant="outlined"
//                               sx={{ height: 16, fontSize: '0.6rem' }}
//                             />
//                             {task.isRecurring && (
//                               <Chip
//                                 label="Recurring"
//                                 size="small"
//                                 color="primary"
//                                 variant="filled"
//                                 sx={{ height: 16, fontSize: '0.6rem' }}
//                                 icon={<RepeatIcon sx={{ fontSize: 10 }} />}
//                               />
//                             )}
//                           </Box>
//                         </Box>
//                       </TableCell>

//                       {/* Status */}
//                       <TableCell align="center">
//                         <Stack spacing={0.5} alignItems="center">
//                           <Chip
//                             label={recurringStatus}
//                             size="small"
//                             color={recurringStatus === 'active' ? 'success' : 'default'}
//                             variant={recurringStatus === 'active' ? 'filled' : 'outlined'}
//                           />
//                           {isTaskRunning && (
//                             <Chip
//                               label="Running"
//                               size="small"
//                               color="warning"
//                               variant="filled"
//                               icon={<PlayIcon sx={{ fontSize: 12 }} />}
//                             />
//                           )}
//                         </Stack>
//                       </TableCell>

//                       {/* Schedule */}
//                       <TableCell align="center">
//                         <Tooltip title={recurringDetails}>
//                           <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
//                             <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
//                             <Typography variant="caption" noWrap>
//                               {task.recurringType || 'Daily'}
//                             </Typography>
//                           </Box>
//                         </Tooltip>
//                       </TableCell>

//                       {/* Next Run */}
//                       <TableCell align="center">
//                         <Box>
//                           <Typography variant="caption" fontWeight="600">
//                             {dayjs(nextRunDate).format('MMM DD')}
//                           </Typography>
//                           <Typography variant="caption" color="text.secondary" display="block">
//                             {timeUntilNext}
//                           </Typography>
//                         </Box>
//                       </TableCell>

//                       {/* Progress */}
//                       <TableCell align="center">
//                       <Box sx={{ minWidth: 80 }}>
//                         <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mb={0.5}>
//                           <SettingsIcon sx={{ fontSize: 14, color: 'primary.main' }} />
//                           <Button
//                             size="small"
//                             variant="outlined"
//                             color="primary"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleEditRecurring(task);
//                             }}
//                             sx={{
//                               fontSize: '0.65rem',
//                               minWidth: 'auto',
//                               px: 1,
//                               py: 0.25,
//                               height: 22,
//                             }}
//                           >
//                             Configure
//                           </Button>
//                         </Box>
//                        
//                         {/* <Button
//                           size="small"
//                           variant="text"
//                           color="info"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleViewActivity(task);
//                           }}
//                           startIcon={<VisibilityIcon sx={{ fontSize: 12 }} />}
//                           sx={{
//                             fontSize: '0.6rem',
//                             minWidth: 'auto',
//                             px: 1,
//                             py: 0.25,
//                             height: 20,
//                           }}
//                         >
//                           View Activity
//                         </Button> */}
//                       </Box>
//                     </TableCell>

//                       {/* Duration */}
//                       <TableCell align="center">
//                         <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
//                           <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
//                           <Typography variant="body2" fontWeight="600">
//                             {formatTime(taskDuration)}
//                           </Typography>
//                         </Box>
//                       </TableCell>

//                       {/* Actions */}
//                       <TableCell align="center">
//                         <Box display="flex" gap={0.5} justifyContent="center">
//                           {!isTaskRunning ? (
//                             <Tooltip title="Run Now">
//                               <IconButton
//                                 size="small"
//                                 color="primary"
//                                 onClick={() => handleRunNow(task)}
//                                 disabled={recurringStatus !== 'active'}
//                               >
//                                 <PlayIcon />
//                               </IconButton>
//                             </Tooltip>
//                           ) : (
//                             <Tooltip title="Stop">
//                               <IconButton
//                                 size="small"
//                                 color="error"
//                                 onClick={() => onTableAction(task, 'stop')}
//                               >
//                                 <StopIcon />
//                               </IconButton>
//                             </Tooltip>
//                           )}
                          
//                           {/* <IconButton
//                             size="small"
//                             onClick={(e) => handleMenuClick(e, task)}
//                           >
//                             <MoreVertIcon />
//                           </IconButton> */}
//                         </Box>
//                       </TableCell>
//                     </TableRow>

//                     {/* Expanded Row Details */}
//                     <TableRow>
//                       <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
//                         <Collapse in={isExpanded} timeout="auto" unmountOnExit>
//                           <Box sx={{ margin: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
//                             <Typography variant="subtitle2" gutterBottom fontWeight="600">
//                               Recurring Configuration
//                             </Typography>
                            
//                             <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
//                               <Box>
//                                 <Typography variant="caption" color="text.secondary">
//                                   Schedule Details
//                                 </Typography>
//                                 <Typography variant="body2">
//                                   {recurringDetails}
//                                 </Typography>
//                               </Box>
                              
//                               <Box>
//                                 <Typography variant="caption" color="text.secondary">
//                                   Total Runs
//                                 </Typography>
//                                 <Typography variant="body2">
//                                   {task.recurringCount || 0}
//                                 </Typography>
//                               </Box>
                              
//                               {task.lastRun && (
//                                 <Box>
//                                   <Typography variant="caption" color="text.secondary">
//                                     Last Run
//                                   </Typography>
//                                   <Typography variant="body2">
//                                     {dayjs(task.lastRun).format('MMM DD, YYYY HH:mm')}
//                                   </Typography>
//                                 </Box>
//                               )}
                              
//                               {task.createdAt && (
//                                 <Box>
//                                   <Typography variant="caption" color="text.secondary">
//                                     Created
//                                   </Typography>
//                                   <Typography variant="body2">
//                                     {dayjs(task.createdAt).format('MMM DD, YYYY')}
//                                   </Typography>
//                                 </Box>
//                               )}
//                             </Box>

//                             {/* Recent Activities */}
//                             {task.activities && task.activities.length > 0 && (
//                               <Box>
//                                 <Typography variant="caption" color="text.secondary" gutterBottom>
//                                   Recent Activities ({task.activities.length})
//                                 </Typography>
//                                 <Box display="flex" gap={1} flexWrap="wrap">
//                                   {task.activities.slice(0, 3).map((activity, index) => (
//                                     <Chip
//                                       key={index}
//                                       label={`${activity.action || 'Activity'} - ${formatTime(activity.duration || 0)}`}
//                                       size="small"
//                                       variant="outlined"
//                                     />
//                                   ))}
//                                   {task.activities.length > 3 && (
//                                     <Chip
//                                       label={`+${task.activities.length - 3} more`}
//                                       size="small"
//                                       variant="outlined"
//                                       color="primary"
//                                     />
//                                   )}
//                                 </Box>
//                               </Box>
//                             )}
//                           </Box>
//                         </Collapse>
//                       </TableCell>
//                     </TableRow>
//                   </React.Fragment>
//                 );
//               })}
//             </TableBody>
//           </Table>

//           {/* Pagination */}
//           <TablePagination
//             rowsPerPageOptions={[5, 10, 25, 50]}
//             component="div"
//             count={validRecurringTasks.length}
//             rowsPerPage={rowsPerPage}
//             page={page}
//             onPageChange={handleChangePage}
//             onRowsPerPageChange={handleChangeRowsPerPage}
//             sx={{ borderTop: 1, borderColor: 'divider' }}
//           />
//         </TableContainer>
//       )}

//       {/* Context Menu */}
//       {/* <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleMenuClose}
//         PaperProps={{
//           sx: { minWidth: 200 }
//         }}
//       >
//         <MenuItem onClick={handleEdit}>
//           <ListItemIcon>
//             <EditIcon fontSize="small" />
//           </ListItemIcon>
//           <ListItemText>Edit Recurring Settings</ListItemText>
//         </MenuItem>
        
//         <MenuItem onClick={handleToggleActive}>
//           <ListItemIcon>
//             {selectedTask?.recurringStatus === 'active' ? 
//               <PauseIcon fontSize="small" /> : 
//               <PlayIcon fontSize="small" />
//             }
//           </ListItemIcon>
//           <ListItemText>
//             {selectedTask?.recurringStatus === 'active' ? 'Pause Recurring' : 'Activate Recurring'}
//           </ListItemText>
//         </MenuItem>
        
//         <MenuItem onClick={() => selectedTask && handleRunNow(selectedTask)}>
//           <ListItemIcon>
//             <PlayIcon fontSize="small" />
//           </ListItemIcon>
//           <ListItemText>Run Now</ListItemText>
//         </MenuItem>
        
//         <Divider />
        
//         <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
//           <ListItemIcon>
//             <DeleteIcon fontSize="small" color="error" />
//           </ListItemIcon>
//           <ListItemText>Delete Recurring Task</ListItemText>
//         </MenuItem>
//       </Menu> */}
//     </Box>
//   );
// };

// export default RecurringTasks;
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
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
  Alert,
  Tooltip,
  Avatar,
  LinearProgress,
  TablePagination,
  Collapse,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Repeat as RepeatIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  Stop as StopIcon,
  Repeat,
} from '@mui/icons-material';
import dayjs from 'dayjs';
// Add this import at the top with other imports
import RecurringDialog from './RecurringDialog'; // Adjust path as needed
import { TaskService } from '../../../../../services/taskService';
import type { Task } from '../../types/TaskHistoryTypes';
import NotificationSnackbar from '../NotificationSnackbar';

// Update interface to match your actual data structure
interface RecurringTask {
  taskId: string;
  taskName: string;
  assignedToEmail?: string;
  assignedToName?: string;
  userEmail: string;
  username?: string;
  type: "task" | "meeting";
  status: "started" | "paused" | "resumed" | "ended";
  totalDuration?: number;
  // Recurring specific fields - make them all optional to handle missing data
  isRecurring?: boolean;
  recurringType?: string;
  recurringStatus?: string;
  recurringPattern?: any;
  recurringOptions?: {
    repeatInterval?: string;
    specificDays?: number[];
    repeatCount?: number;
    endCondition?: string;
    endDate?: Date;
    nextRunDate?: Date;
    lastCalculated?: Date;
    statusOptions?: string[];
    skipWeekends?: boolean;
    workingDaysOnly?: boolean;
    customInterval?: number;
    monthlyOption?: 'date' | 'day';
  };
    endConditions?: {
    never?: boolean;
    afterRuns?: number | null;
    endDate?: string | null;
  };
  recurringCount?: number;
  nextRun?: string | Date;
  lastRun?: string | Date;
  createdAt?: Date;
  activities?: any[];
}

interface RecurringTasksProps {
  tasks: RecurringTask[];
  formatTime: (seconds: number) => string;
  onTableAction: (task: RecurringTask, action: 'resume' | 'stop' | 'start') => void;
  isRunning: boolean;
  currentUser: any;
  calculatedDurations: Record<string, number>;
  onDurationCalculated: (taskId: string, duration: number) => void;
  onEditRecurring?: (task: RecurringTask) => void;
  onDisableRecurring?: (task: RecurringTask) => void;
  onDeleteRecurring?: (task: RecurringTask) => void;
  onRefresh?: () => Promise<void>;
}

interface NotificationState {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  details?: string;
}

const RecurringTasks: React.FC<RecurringTasksProps> = ({
  tasks = [],
  formatTime,
  onTableAction,
  isRunning,
  currentUser,
  calculatedDurations = {},
  onDurationCalculated,
  onEditRecurring,
  onDisableRecurring,
  onDeleteRecurring,
  onRefresh
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [recurringSettings, setRecurringSettings] = useState<Record<string, any>>({});
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'info'
  });
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);

  // Load recurring settings from localStorage on component mount
  useEffect(() => {
    const settings = TaskService.getAllRecurringSettings();
    setRecurringSettings(settings);
  }, []);

  // Refresh next run dates every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
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

  // Enhanced filtering with better validation
  const validRecurringTasks = React.useMemo(() => {
    if (!Array.isArray(tasks)) {
      console.warn('Tasks is not an array:', tasks);
      return [];
    }

    return tasks.filter(task => {
      if (!task || typeof task !== 'object') {
        console.warn('Invalid task object:', task);
        return false;
      }

      if (!task.taskId || !task.taskName) {
        console.warn('Task missing required fields:', task);
        return false;
      }

      const hasRecurringProps = !!(
        task.isRecurring || 
        task.recurringType || 
        task.recurringOptions || 
        task.recurringPattern ||
        task.recurringStatus
      );

      if (!hasRecurringProps) {
        console.log('Task has no recurring properties:', task.taskName);
        return false;
      }

      return true;
    });
  }, [tasks]);

  // Enhanced function to get recurring info for a task
  const getTaskRecurringInfo = (task: RecurringTask) => {
    // First check if task has recurring data from backend
    const taskRecurring = task.isRecurring;
    
    // Then check localStorage
    const localRecurring = recurringSettings[task.taskId];
    
    return {
      isRecurring: taskRecurring || localRecurring?.isRecurring || false,
      recurringType: task.recurringType || localRecurring?.recurringType || 'schedule',
      recurringStatus: task.recurringStatus || localRecurring?.recurringStatus || 'active',
      recurringCount: task.recurringCount || localRecurring?.recurringCount || 0,
      nextRun: task.nextRun || localRecurring?.nextRun,
      recurringPattern: task.recurringPattern || localRecurring?.recurringPattern,
      isLocal: !!localRecurring && !taskRecurring
    };
  };

  const calculateNextRunDate = (task: RecurringTask): Date => {
    try {
      const recurringConfig = task.recurringOptions || task.recurringPattern || {};
      const recurringType = task.recurringType || recurringConfig.repeatInterval || 'daily';
      
      if (task.nextRun) {
        const existingNext = new Date(task.nextRun);
        if (!isNaN(existingNext.getTime()) && existingNext > new Date()) {
          return existingNext;
        }
      }
  if (task.endConditions?.never === false) {
      if (task.endConditions?.afterRuns && task.recurringCount && 
          task.recurringCount >= task.endConditions.afterRuns) {
        // Task has reached its run limit
        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 1);
        return pastDate;
      }
      
      if (task.endConditions?.endDate) {
        const endDate = new Date(task.endConditions.endDate);
        if (new Date() > endDate) {
          // Task has passed its end date
          return endDate;
        }
      }
    }
      if (recurringConfig.nextRunDate) {
        const configNext = new Date(recurringConfig.nextRunDate);
        if (!isNaN(configNext.getTime()) && configNext > new Date()) {
          return configNext;
        }
      }

      const baseDate = task.lastRun 
        ? new Date(task.lastRun) 
        : (task.createdAt ? new Date(task.createdAt) : new Date());
      
      let nextDate = new Date(baseDate);
      
      if (isNaN(nextDate.getTime())) {
        nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1);
        return nextDate;
      }

      switch (recurringType.toLowerCase()) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          const specificDays = recurringConfig.specificDays;
          if (specificDays && Array.isArray(specificDays) && specificDays.length > 0) {
            const currentDay = nextDate.getDay();
            const sortedDays = [...specificDays].sort((a, b) => a - b);
            
            let nextDay = sortedDays.find(day => typeof day === 'number' && day > currentDay);
            
            if (nextDay === undefined) {
              nextDay = sortedDays[0];
              const daysToAdd = (7 - currentDay) + nextDay;
              nextDate.setDate(nextDate.getDate() + daysToAdd);
            } else {
              const daysToAdd = nextDay - currentDay;
              nextDate.setDate(nextDate.getDate() + daysToAdd);
            }
          } else {
            nextDate.setDate(nextDate.getDate() + 7);
          }
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'custom':
          const customInterval = recurringConfig.customInterval || 1;
          nextDate.setDate(nextDate.getDate() + customInterval);
          break;
        default:
          nextDate.setDate(nextDate.getDate() + 1);
      }

      if (recurringConfig.skipWeekends || recurringConfig.workingDaysOnly) {
        let attempts = 0;
        while ((nextDate.getDay() === 0 || nextDate.getDay() === 6) && attempts < 14) {
          nextDate.setDate(nextDate.getDate() + 1);
          attempts++;
        }
      }

      return nextDate;
      
    } catch (error) {
      console.error('Error calculating next run date for task:', task.taskId, error);
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 1);
      return fallback;
    }
  };

  const getTimeUntilNext = (nextRunDate: Date): string => {
    try {
      const now = new Date();
      const diff = nextRunDate.getTime() - now.getTime();
      
      if (diff <= 0) return 'Overdue';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    } catch (error) {
      return 'Unknown';
    }
  };

  const getProgressPercentage = (task: RecurringTask): number => {
    try {
      const recurringConfig = task.recurringOptions || {};
       const endConditions = task.endConditions;
          if (endConditions?.never) return 0;
    
    if (endConditions?.afterRuns) {
      const completed = task.recurringCount || 0;
      return Math.min((completed / endConditions.afterRuns) * 100, 100);
    }
    
    if (endConditions?.endDate) {
      const endTime = new Date(endConditions.endDate).getTime();
      const startTime = task.createdAt ? new Date(task.createdAt).getTime() : new Date().getTime();
      const currentTime = new Date().getTime();
      
      if (!isNaN(endTime) && !isNaN(startTime)) {
        const total = endTime - startTime;
        const elapsed = currentTime - startTime;
        return Math.min(Math.max((elapsed / total) * 100, 0), 100);
      }
    }
    

      const { endCondition, endDate, repeatCount } = recurringConfig;
      
      if (endCondition === 'never') return 0;
      
      if (endCondition === 'after' && repeatCount) {
        const completed = task.recurringCount || 0;
        return Math.min((completed / repeatCount) * 100, 100);
      }
      
      if (endCondition === 'on' && endDate) {
        const endTime = new Date(endDate).getTime();
        const startTime = task.createdAt ? new Date(task.createdAt).getTime() : new Date().getTime();
        const currentTime = new Date().getTime();
        
        if (!isNaN(endTime) && !isNaN(startTime)) {
          const total = endTime - startTime;
          const elapsed = currentTime - startTime;
          return Math.min(Math.max((elapsed / total) * 100, 0), 100);
        }
      }
      
      return 0;
    } catch (error) {
      return 0;
    }
  };
  
    const formatRecurringDetails = (task: RecurringTask): string => {
    try {
      const recurringConfig = task.recurringOptions || task.recurringPattern || {};
        const endConditions = task.endConditions;
      const recurringType = task.recurringType || recurringConfig.repeatInterval || 'daily';
      
      let details = '';
      
      switch (recurringType.toLowerCase()) {
        case 'daily':
          details = 'Every day';
          break;
        case 'weekly':
          const specificDays = recurringConfig.specificDays;
          if (specificDays && Array.isArray(specificDays) && specificDays.length > 0) {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const selectedDays = specificDays
              .filter(day => typeof day === 'number' && day >= 0 && day <= 6)
              .map(day => dayNames[day])
              .join(', ');
            details = selectedDays ? `Every ${selectedDays}` : 'Every week';
          } else {
            details = 'Every week';
          }
          break;
        case 'monthly':
          details = 'Every month';
          break;
        case 'custom':
          const customInterval = recurringConfig.customInterval || 1;
          details = `Every ${customInterval} days`;
          break;
        default:
          details = `${recurringType} schedule`;
      }
       if (endConditions?.never) {
      details += ' (runs forever)';
    } else if (endConditions?.afterRuns) {
      details += ` (${endConditions.afterRuns} times)`;
    } else if (endConditions?.endDate) {
      try {
        details += ` (until ${dayjs(endConditions.endDate).format('MMM DD, YYYY')})`;
      } catch {
        details += ' (until specified date)';
      }
    } else {
      const { endCondition, endDate, repeatCount } = recurringConfig;
      if (endCondition === 'after' && repeatCount) {
        details += ` (${repeatCount} times)`;
      } else if (endCondition === 'on' && endDate) {
        try {
          details += ` (until ${dayjs(endDate).format('MMM DD, YYYY')})`;
        } catch {
          details += ' (until specified date)';
        }
      }
          }
      const filters = [];
      if (recurringConfig.skipWeekends) filters.push('skip weekends');
      if (recurringConfig.workingDaysOnly) filters.push('working days only');
      
      if (filters.length > 0) {
        details += ` • ${filters.join(', ')}`;
      }
      
      return details;
    } catch (error) {
      return 'Recurring task';
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleRunNow = (task: RecurringTask) => {
    onTableAction(task, 'start');
  };

  const toggleRowExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedRows(newExpanded);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
// Convert RecurringTask to Task for the dialog
const convertToTask = (recurringTask: RecurringTask): Task => {
  // Helper function to normalize recurringType
  const normalizeRecurringType = (type: string | undefined): "daily" | "weekly" | "monthly" | "custom" | undefined => {
    if (!type) return undefined;
    const validTypes = ["daily", "weekly", "monthly", "custom"] as const;
    return validTypes.includes(type as any) ? type as any : "daily";
  };

  // Helper function to normalize recurringStatus
  const normalizeRecurringStatus = (status: string | undefined): "active" | "paused" | "disabled" | undefined => {
    if (!status) return undefined;
    const validStatuses = ["active", "paused", "disabled"] as const;
    return validStatuses.includes(status as any) ? status as any : "active";
  };

  // Helper function to convert Date to string
  const convertDateToString = (date: string | Date | undefined): string | undefined => {
    if (!date) return undefined;
    if (typeof date === 'string') return date;
    return date.toISOString();
  };

  return {
    taskId: recurringTask.taskId,
    taskName: recurringTask.taskName,
    assignedToEmail: recurringTask.assignedToEmail,
    assignedTo: recurringTask.assignedToName,
    userEmail: recurringTask.userEmail,
    username: recurringTask.username,
    type: recurringTask.type,
    status: recurringTask.status,
    totalDuration: recurringTask.totalDuration ?? 0,
    isRecurring: recurringTask.isRecurring,
    recurringType: normalizeRecurringType(recurringTask.recurringType),
    recurringStatus: normalizeRecurringStatus(recurringTask.recurringStatus),
    recurringCount: recurringTask.recurringCount,
    nextRun: convertDateToString(recurringTask.nextRun),
    lastRun: convertDateToString(recurringTask.lastRun),
    createdAt: recurringTask.createdAt ? recurringTask.createdAt.toISOString() : undefined,
    activities: recurringTask.activities,
  };
};


  const handleRecurringClick = (task: RecurringTask) => {
    console.log('🔄 Opening recurring dialog for task:', task.taskName);
    const convertedTask = convertToTask(task);
    setSelectedTask(convertedTask);
    setRecurringDialogOpen(true);
  };
  
  // Paginated tasks
  const paginatedTasks = validRecurringTasks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: '100%' }}>
    

      {/* No tasks message */}
      {validRecurringTasks.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            No recurring tasks found. Tasks need recurring configuration to appear here.
          </Typography>
        </Alert>
      )}

      {/* Tasks Table */}
      {validRecurringTasks.length > 0 && (
        <TableContainer component={Paper} elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell width="40px" />
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Task Details
                  </Typography>
                </TableCell>
                <TableCell align="center" width="120px">
                  <Typography variant="subtitle2" fontWeight="600">
                    Status
                  </Typography>
                </TableCell>
                {/* <TableCell align="center" width="150px">
                  <Typography variant="subtitle2" fontWeight="600">
                    Schedule
                  </Typography>
                </TableCell> */}
                <TableCell align="center" width="200px">
                  <Typography variant="subtitle2" fontWeight="600">
                    Next Run
                  </Typography>
                </TableCell>
                {/* New Recurring Column */}
                <TableCell align="center" width="240px">
                  <Typography variant="subtitle2" fontWeight="600">
                    Recurring
                  </Typography>
                </TableCell>
                {/* <TableCell align="center" width="100px">
                  <Typography variant="subtitle2" fontWeight="600">
                    Progress
                  </Typography>
                </TableCell> */}
                <TableCell align="center" width="220px">
                  <Typography variant="subtitle2" fontWeight="600">
                    Duration
                  </Typography>
                </TableCell>
                <TableCell align="center" width="100px">
                  <Typography variant="subtitle2" fontWeight="600">
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTasks.map((task) => {
                const isExpanded = expandedRows.has(task.taskId);
                const nextRunDate = calculateNextRunDate(task);
                const timeUntilNext = getTimeUntilNext(nextRunDate);
                const progressPercentage = getProgressPercentage(task);
                const recurringDetails = formatRecurringDetails(task);
                const taskDuration = calculatedDurations[task.taskId] || task.totalDuration || 0;
                const recurringStatus = task.recurringStatus || 'active';
                const isTaskRunning = isRunning && task.status === 'started';
                const recurringInfo = getTaskRecurringInfo(task);

                return (
                  <React.Fragment key={task.taskId}>
                    <TableRow
                      hover
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                        bgcolor: isTaskRunning ? 'success.50' : 'inherit',
                      }}
                    >
                      {/* Expand/Collapse Button */}
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpansion(task.taskId)}
                        >
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>

                      {/* Task Details */}
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="600" noWrap>
                            {task.taskName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {task.assignedToEmail || task.userEmail}
                          </Typography>
                          <Box display="flex" gap={0.5} mt={0.5}>
                            <Chip
                              label={task.type}
                              size="small"
                              variant="outlined"
                              sx={{ height: 16, fontSize: '0.6rem' }}
                            />
                            {recurringInfo.isRecurring && (
                              <Chip
                                label="Recurring"
                                size="small"
                                color="primary"
                                variant="filled"
                                sx={{ height: 16, fontSize: '0.6rem' }}
                                icon={<RepeatIcon sx={{ fontSize: 10 }} />}
                              />
                            )}
                            {recurringInfo.isLocal && (
                              <Chip
                                label="Local"
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ height: 16, fontSize: '0.6rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center">
                        <Stack spacing={0.5} alignItems="center">
                          <Chip
                            label={recurringStatus}
                            size="small"
                            color={recurringStatus === 'active' ? 'success' : 'default'}
                            variant={recurringStatus === 'active' ? 'filled' : 'outlined'}
                          />
                          {isTaskRunning && (
                            <Chip
                              label="Running"
                              size="small"
                              color="warning"
                              variant="filled"
                              icon={<PlayIcon sx={{ fontSize: 12 }} />}
                            />
                          )}
                        </Stack>
                      </TableCell>

                      {/* Schedule */}
                      {/* <TableCell align="center">
                        <Tooltip title={recurringDetails}>
                          <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                            <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" noWrap>
                              {recurringInfo.recurringType || 'Daily'}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell> */}

                      {/* Next Run */}
                      <TableCell align="center">
                        <Box>
                          <Typography variant="caption" fontWeight="600">
                            {dayjs(nextRunDate).format('MMM DD')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {timeUntilNext}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* New Recurring Column */}
                      <TableCell align="center">
                        <Box sx={{ minWidth: 120 }}>
                          {recurringInfo.isRecurring ? (
                            <Stack spacing={0.5} alignItems="center">
                              <Chip
                                label={`${recurringInfo.recurringType || 'Schedule'}`}
                                size="small"
                                color="primary"
                                variant="filled"
                                icon={<RepeatIcon sx={{ fontSize: 12 }} />}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Runs: {recurringInfo.recurringCount || 0}
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={() => handleRecurringClick(task)}
                                startIcon={<SettingsIcon sx={{ fontSize: 12 }} />}
                                sx={{
                                  fontSize: '0.65rem',
                                  minWidth: 'auto',
                                  px: 1,
                                  py: 0.25,
                                  height: 22,
                                }}
                              >
                                Edit
                              </Button>
                            </Stack>
                          ) : (
                            <Button
                              size="small"
                              startIcon={<Repeat />}
                              onClick={() => handleRecurringClick(task)}
                              variant="outlined"
                              color="primary"
                              sx={{
                                fontSize: '0.65rem',
                                minWidth: 'auto',
                                px: 1,
                                py: 0.5,
                              }}
                            >
                              Set Recurring
                            </Button>
                          )}
                        </Box>
                      </TableCell>

                      {/* Progress */}
                      {/* <TableCell align="center">
                        <Box sx={{ minWidth: 80 }}>
                          {progressPercentage > 0 && (
                            <Box>
                              <LinearProgress
                                variant="determinate"
                                value={progressPercentage}
                                sx={{ height: 4, borderRadius: 2, mb: 0.5 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {Math.round(progressPercentage)}%
                              </Typography>
                            </Box>
                          )}
                          {progressPercentage === 0 && (
                            <Typography variant="caption" color="text.secondary">
                              No limit
                            </Typography>
                          )}
                        </Box>
                      </TableCell> */}

                      {/* Duration */}
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                          <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight="600">
                            {formatTime(taskDuration)}
                          </Typography>
                        </Box>
                      </TableCell>

                                         {/* Actions */}
                      <TableCell align="center">
                        <Box display="flex" gap={0.5} justifyContent="center">
                          {!isTaskRunning ? (
                            <Tooltip title="Run Now">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleRunNow(task)}
                                disabled={recurringStatus !== 'active'}
                              >
                                <PlayIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Stop">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => onTableAction(task, 'stop')}
                              >
                                <StopIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row Details */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom fontWeight="600">
                              Recurring Configuration
                            </Typography>
                            
                            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Schedule Details
                                </Typography>
                                <Typography variant="body2">
                                  {recurringDetails}
                                </Typography>
                              </Box>
                              
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Total Runs
                                </Typography>
                                <Typography variant="body2">
                                  {recurringInfo.recurringCount || 0}
                                </Typography>
                              </Box>
                              
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Recurring Status
                                </Typography>
                                <Typography variant="body2">
                                  {recurringInfo.recurringStatus || 'Active'}
                                </Typography>
                              </Box>
                              
                              {task.lastRun && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Last Run
                                  </Typography>
                                  <Typography variant="body2">
                                    {dayjs(task.lastRun).format('MMM DD, YYYY HH:mm')}
                                  </Typography>
                                </Box>
                              )}
                              
                              {recurringInfo.nextRun && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Next Scheduled Run
                                  </Typography>
                                  <Typography variant="body2">
                                    {dayjs(recurringInfo.nextRun).format('MMM DD, YYYY HH:mm')}
                                  </Typography>
                                </Box>
                              )}
                              
                              {task.createdAt && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Created
                                  </Typography>
                                  <Typography variant="body2">
                                    {dayjs(task.createdAt).format('MMM DD, YYYY')}
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            {/* Recurring Pattern Details */}
                            {recurringInfo.recurringPattern && (
                              <Box mb={2}>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                  Recurring Pattern
                                </Typography>
                                <Box display="flex" gap={1} flexWrap="wrap">
                                  {Object.entries(recurringInfo.recurringPattern).map(([key, value]) => (
                                    <Chip
                                      key={key}
                                      label={`${key}: ${value}`}
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}

                            {/* Data Source Indicator */}
                            <Box mb={2}>
                              <Typography variant="caption" color="text.secondary" gutterBottom>
                                Data Source
                              </Typography>
                              <Box display="flex" gap={1} alignItems="center">
                                {recurringInfo.isLocal ? (
                                  <Chip
                                    label="Stored Locally"
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                    icon={<SettingsIcon sx={{ fontSize: 12 }} />}
                                  />
                                ) : (
                                  <Chip
                                    label="Server Synchronized"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    icon={<RepeatIcon sx={{ fontSize: 12 }} />}
                                  />
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  {recurringInfo.isLocal 
                                    ? 'Settings saved in browser storage' 
                                    : 'Settings synchronized with server'
                                  }
                                </Typography>
                              </Box>
                            </Box>

                            {/* Recent Activities */}
                            {task.activities && task.activities.length > 0 && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                  Recent Activities ({task.activities.length})
                                </Typography>
                                <Box display="flex" gap={1} flexWrap="wrap">
                                  {task.activities.slice(0, 3).map((activity, index) => (
                                    <Chip
                                      key={index}
                                      label={`${activity.action || 'Activity'} - ${formatTime(activity.duration || 0)}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                  {task.activities.length > 3 && (
                                    <Chip
                                      label={`+${task.activities.length - 3} more`}
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                    />
                                  )}
                                </Box>
                              </Box>
                            )}

                            {/* Quick Actions */}
                            {/* <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                              <Typography variant="caption" color="text.secondary" gutterBottom>
                                Quick Actions
                              </Typography>
                              <Box display="flex" gap={1} flexWrap="wrap">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleRecurringClick(task)}
                                  startIcon={<EditIcon sx={{ fontSize: 12 }} />}
                                >
                                  Edit Recurring
                                </Button>
                                
                                {recurringInfo.isRecurring && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color={recurringInfo.recurringStatus === 'active' ? 'warning' : 'success'}
                                    startIcon={recurringInfo.recurringStatus === 'active' ? 
                                      <PauseIcon sx={{ fontSize: 12 }} /> : 
                                      <PlayIcon sx={{ fontSize: 12 }} />
                                    }
                                  >
                                    {recurringInfo.recurringStatus === 'active' ? 'Pause' : 'Resume'} Recurring
                                  </Button>
                                )}
                                
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  onClick={() => handleRunNow(task)}
                                  startIcon={<PlayIcon sx={{ fontSize: 12 }} />}
                                  disabled={isTaskRunning}
                                >
                                  Run Now
                                </Button>
                                
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="info"
                                  startIcon={<VisibilityIcon sx={{ fontSize: 12 }} />}
                                >
                                  View History
                                </Button>
                              </Box>
                            </Box> */}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={validRecurringTasks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        </TableContainer>
      )}

      {/* Recurring Dialog */}
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

      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        type={notification.type}
        title={notification.title}
        details={notification.details}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default RecurringTasks;

                      

