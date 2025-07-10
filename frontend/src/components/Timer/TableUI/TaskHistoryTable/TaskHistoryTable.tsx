// import React, { useState, useMemo } from 'react';
// import {
//   Card,
//   CardContent,
//   Typography,
//   Collapse,
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
//   Avatar,
//   Tabs,
//   Tab,
//   Switch,
//   FormControlLabel,
//   Badge,
//   Divider,
//   Alert
// } from '@mui/material';
// import {
//   ExpandMore,
//   ExpandLess,
//   History,
//   PlayArrow,
//   Stop,
//   Person,
//   Business,
//   Schedule,
//   KeyboardArrowDown,
//   KeyboardArrowRight,
//   Assignment,
//   AssignmentTurnedIn,
//   Today,
//   AdminPanelSettings,
//   ViewList,
//   PersonAdd,
//   PersonOutline,
//   PriorityHigh,
//   Warning,
//   CheckCircle,
//   NotificationsActive
// } from '@mui/icons-material';
// import ActivityLegend from '../components/ActivityLegend';
// import ActivityTimeline from '../components/ActivityTimeline';
// import DebugPanel from '../components/DebugPanel';
// import ExportControls from '../components/ExportControls';
// import FilterSection from '../components/FilterSection';
// import QuickActions from '../components/QuickActions';
// import SummaryStatistics from '../components/SummaryStatistics';
// import type { TaskHistoryTableProps, UserGroup, Task } from '../types/TaskHistoryTypes';
// import { processTasksData } from '../utils/dataProcessing';
// import { getLastActivityTime } from '../utils/dateUtils';

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// function TabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;

//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`task-tabpanel-${index}`}
//       aria-labelledby={`task-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
//     </div>
//   );
// }

// const TaskHistoryTable: React.FC<TaskHistoryTableProps> = ({
//   showHistory,
//   onToggleHistory,
//   filteredTasks,
//   tableFilters,
//   onFilterChange,
//   tablePage,
//   tableRowsPerPage,
//   onPageChange,
//   onRowsPerPageChange,
//   expandedRows,
//   onToggleRowExpansion,
//   formatTime,
//   onTableAction,
//   isRunning,
//   currentUser,
//   isAdmin = false,
//   isActivityPage,
//   allTasks,
//   assignedTasks
// }) => {
//   const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
//   const [activeTab, setActiveTab] = useState(0);
//   const [tabPages, setTabPages] = useState<Record<number, number>>({ 0: 0, 1: 0, 2: 0, 3: 0 });
//   const [tabRowsPerPage, setTabRowsPerPage] = useState<Record<number, number>>({ 0: 5, 1: 5, 2: 5, 3: 5 });
//   const [showAdminGroupedView, setShowAdminGroupedView] = useState(false);
//  const [calculatedDurations, setCalculatedDurations] = useState<Record<string, number>>({});
//   // Get current user email helper - ENHANCED
//   const getCurrentUserEmail = () => {
//     // Try multiple sources for user email
//     if (currentUser?.email) return currentUser.email;
//     if (currentUser?.userEmail) return currentUser.userEmail;
//     if (currentUser?.user?.email) return currentUser.user.email;
    
//     try {
//       const userStr = localStorage.getItem('user');
//       if (userStr) {
//         const user = JSON.parse(userStr);
//         return user.email || user.userEmail || user.user?.email;
//       }
//     } catch (error) {
//       console.error('Error getting user email:', error);
//     }
    
//     // Try session storage as fallback
//     try {
//       const sessionUser = sessionStorage.getItem('currentUser') || sessionStorage.getItem('user');
//       if (sessionUser) {
//         const user = JSON.parse(sessionUser);
//         return user.email || user.userEmail;
//       }
//     } catch (error) {
//       console.error('Error getting session user email:', error);
//     }
    
//     return null;
//   };

//   const userEmail = getCurrentUserEmail();
//  // Add callback to handle duration updates
//   const handleDurationCalculated = React.useCallback((taskId: string, duration: number) => {
//     setCalculatedDurations(prev => ({
//       ...prev,
//       [taskId]: duration
//     }));
//   }, []);

//   // Helper function to get duration (calculated or fallback)
//   const getTaskDuration = (task: Task): number => {
//     // First try calculated duration from activities
//     if (calculatedDurations[task.taskId] !== undefined) {
//       return calculatedDurations[task.taskId];
//     }
//     // Fallback to task's totalDuration
//     return task.totalDuration || 0;
//   };

//   // Helper function to check if a task is from today
//   const isToday = (date: string | Date | undefined): boolean => {
//     if (!date) return false;
//     const today = new Date();
//     const taskDate = new Date(date);
//     return taskDate.toDateString() === today.toDateString();
//   };

// // ENHANCED categorize tasks logic with FIXED assignment detection
// const categorizedTasks = useMemo(() => {
//   const tasksAssignedToMe: Task[] = [];
//   const tasksIAssignedToOthers: Task[] = [];
//   const todaysTasks: Task[] = [];
//   const allUserTasks: Task[] = [];

//   console.log('=== ENHANCED ASSIGNMENT CATEGORIZATION DEBUG ===');
//   console.log('Current User Email:', userEmail);
//   console.log('Current User Object:', currentUser);
//   console.log('Total Filtered Tasks:', filteredTasks.length);
//   console.log('All Tasks:', allTasks?.length || 0);
//   console.log('Assigned Tasks Prop:', assignedTasks?.length || 0);

//   // Use all available tasks for better categorization
//   const tasksToProcess = allTasks && allTasks.length > 0 ? allTasks : filteredTasks;
  
//   tasksToProcess.forEach((task: Task, index) => {
//     // Enhanced date detection
//     const taskDate = (task as any).createdAt || (task as any).startTime || 
//                     (task as any).created_at || (task as any).startDate || 
//                     (task as any).assignedAt || (task as any).assigned_at;
//     const isTaskToday = taskDate && isToday(taskDate);

//     // ENHANCED assignment field detection with more variations
//     const assignedBy = (task as any).assignedBy?.email || (task as any).assignedBy || 
//                       (task as any).assigned_by?.email || (task as any).assigned_by ||
//                       (task as any).createdBy?.email || (task as any).createdBy || 
//                       (task as any).created_by?.email || (task as any).created_by ||
//                       (task as any).assignedByEmail || (task as any).assignedByUser ||
//                       (task as any).creator?.email || (task as any).creator;

//     const assignedTo = (task as any).assignedToEmail || (task as any).assignedTo || 
//                       (task as any).assigned_to?.email || (task as any).assigned_to ||
//                       (task as any).assignedUser?.email || (task as any).assignedUser || 
//                       (task as any).assigned_user?.email || (task as any).assigned_user ||
//                       (task as any).assignee?.email || (task as any).assignee ||
//                       (task as any).targetUser?.email || (task as any).targetUser;

//     const taskOwner = task.userEmail || (task as any).user_email || 
//                      (task as any).owner?.email || (task as any).owner ||
//                      (task as any).userId || (task as any).user_id;

//     // Enhanced debug logging for each task
//     console.log(`Task ${index} - "${task.taskName}":`, {
//       taskId: task.taskId,
//       taskOwner,
//       assignedBy,
//       assignedTo,
//       userEmail,
//       isTaskToday,
//       taskDate
//     });

//     // For admin: include all tasks in allUserTasks (this remains unchanged for admin overview)
//     if (isAdmin) {
//       allUserTasks.push(task);
//     }

//     // ✅ FIXED: Tasks Assigned to Me logic - STRICT FILTERING BY CURRENT USER
//     const isAssignedToMe = (
//       // ✅ CRITICAL FIX: Only show tasks where current user is explicitly the target
//       (assignedTo && assignedTo === userEmail) ||
//       ((task as any).assignedToEmail === userEmail) ||
//       ((task as any).assignee === userEmail) ||
//       ((task as any).targetUser === userEmail) ||
//       // ✅ FIXED: Only include self-created tasks if they belong to current user
//       (taskOwner === userEmail && (!assignedTo || assignedTo === userEmail)) ||
//       // ✅ FIXED: Check assigned tasks list with proper user filtering
//       (assignedTasks?.some(at => 
//         (at.taskId === task.taskId || at.id === task.taskId) && 
//         // ✅ CRITICAL: Ensure the assigned task actually belongs to current user
//         (at.assignedToEmail === userEmail || at.assignedTo === userEmail || 
//          at.userEmail === userEmail || at.targetUser === userEmail)
//       ))
//     );

//     // ✅ ADDITIONAL CHECK: Exclude tasks that are assigned to other users
//     const isAssignedToSomeoneElse = (
//       assignedTo && assignedTo !== userEmail && assignedTo !== taskOwner
//     );

//     if (isAssignedToMe && !isAssignedToSomeoneElse) {
//       tasksAssignedToMe.push(task);
//       console.log(`✅ Task "${task.taskName}" assigned to me (${userEmail})`);
//     }

//     // ✅ FIXED: Tasks I Assigned to Others logic - STRICT FILTERING
//     const isAssignedByMe = (
//       // ✅ CRITICAL: Only show tasks assigned BY current user TO other users
//       (assignedBy === userEmail && assignedTo && assignedTo !== userEmail) ||
//       ((task as any).assignedByEmail === userEmail && assignedTo && assignedTo !== userEmail) ||
//       ((task as any).createdBy === userEmail && assignedTo && assignedTo !== userEmail) ||
//       // ✅ FIXED: Task owner assigned it to someone else
//       (taskOwner === userEmail && assignedTo && assignedTo !== userEmail) ||
//       // ✅ FIXED: Check assignment history
//       ((task as any).assignmentHistory && 
//        (task as any).assignmentHistory.some((ah: any) => 
//          ah.assignedBy === userEmail && ah.assignedTo !== userEmail
//        ))
//     );

//     if (isAssignedByMe) {
//       tasksIAssignedToOthers.push(task);
//       console.log(`✅ Task "${task.taskName}" assigned by me (${userEmail}) to ${assignedTo}`);
//     }

//     // ✅ FIXED: Today's Tasks logic - ONLY CURRENT USER'S TODAY ACTIVITIES
//     if (isTaskToday) {
//       // ✅ CRITICAL FIX: Only include today's tasks that involve the current user
//       const isCurrentUserInvolvedToday = (
//         // Tasks assigned TO current user today
//         isAssignedToMe ||
//         // Tasks assigned BY current user today
//         isAssignedByMe ||
//         // Tasks created BY current user today (self-created)
//         (taskOwner === userEmail && !assignedTo) ||
//         // Tasks the current user worked on today (check activities)
//         (task.activities && task.activities.some((activity: any) => {
//           const activityDate = activity.timestamp ? new Date(activity.timestamp) : null;
//           const isActivityToday = activityDate && isToday(activityDate);
//           // Check if current user performed any activity today
//           const activityUser = activity.userEmail || activity.user_email || taskOwner;
//           return isActivityToday && activityUser === userEmail;
//         }))
//       );

//       if (isCurrentUserInvolvedToday) {
//         todaysTasks.push(task);
//         console.log(`✅ Today's task "${task.taskName}" - Current user (${userEmail}) was involved today`);
//       } else {
//         console.log(`❌ Excluding today's task "${task.taskName}" - Current user (${userEmail}) was NOT involved`);
//       }
//     }
//   });

//   // Remove duplicates from todaysTasks
//   const uniqueTodaysTasks = todaysTasks.filter((task, index, self) => 
//     index === self.findIndex(t => t.taskId === task.taskId)
//   );

//   const result = {
//     tasksAssignedToMe,
//     tasksIAssignedToOthers,
//     todaysTasks: uniqueTodaysTasks,
//     allUserTasks
//   };

//   console.log('📊 FINAL ENHANCED Assignment Categorization:', {
//     currentUserEmail: userEmail,
//     tasksAssignedToMe: result.tasksAssignedToMe.length,
//     tasksIAssignedToOthers: result.tasksIAssignedToOthers.length,
//     todaysTasks: result.todaysTasks.length,
//     allUserTasks: result.allUserTasks.length,
//     totalProcessed: tasksToProcess.length,
//     // ✅ DEBUG: Show actual task assignments
//     todaysTasksDetails: result.todaysTasks.map(t => ({
//       taskName: t.taskName,
//       assignedBy: (t as any).assignedBy || (t as any).assignedByEmail,
//       assignedTo: (t as any).assignedTo || (t as any).assignedToEmail,
//       taskOwner: t.userEmail,
//       createdAt: (t as any).createdAt,
//       reason: 'Current user involved today'
//     }))
//   });

//   return result;
// }, [filteredTasks, allTasks, assignedTasks, userEmail, isAdmin, currentUser]);

//   // Function to group tasks by assignee (for "Tasks I Assigned to Others" tab)
//   const groupTasksByAssignee = (tasks: Task[]): UserGroup[] => {
//     const assigneeGroups: { [email: string]: UserGroup } = {};

//     tasks.forEach(task => {
//       // Enhanced assignee information detection
//       const assigneeEmail = (task as any).assignedToEmail || (task as any).assignedTo || 
//                            (task as any).assigned_to?.email || (task as any).assigned_to ||
//                            (task as any).assignedUser?.email || (task as any).assignedUser ||
//                            (task as any).assignee?.email || (task as any).assignee ||
//                            'unknown@example.com';
      
//       const assigneeName = (task as any).assignedToName || 
//                           (task as any).assignedUserName || 
//                           (task as any).assignee?.name || (task as any).assignee?.username ||
//                           (assigneeEmail && typeof assigneeEmail === 'string' ? 
//                            assigneeEmail.split('@')[0] : 'Unknown User');

//       if (!assigneeGroups[assigneeEmail]) {
//         assigneeGroups[assigneeEmail] = {
//           userEmail: assigneeEmail,
//           username: assigneeName,
//           totalTasks: 0,
//           completedTasks: 0,
//           activeTasks: 0,
//           assignedTasks: 0,
//           selfCreatedTasks: 0,
//           totalDuration: 0,
//           tasks: []
//         };
//       }

//       const group = assigneeGroups[assigneeEmail];
//       group.tasks.push(task);
//       group.totalTasks++;
//       group.totalDuration += task.totalDuration || 0;

//       // Count task types
//       if (task.status === 'ended' || task.status === 'completed') {
//         group.completedTasks++;
//       } else if (['started', 'resumed', 'paused'].includes(task.status)) {
//                 group.activeTasks++;
//       }

//       // All tasks in this group are assigned (since they're in "Tasks I Assigned to Others")
//       group.assignedTasks++;
//     });

//     return Object.values(assigneeGroups).sort((a, b) => a.username.localeCompare(b.username));
//   };

//   // Apply filters and pagination for each category
//   const processedCategories = useMemo(() => {
//     const processCategory = (tasks: Task[], tabIndex: number, shouldGroupByAssignee = false) => {
//       let processed: any[];
      
//       if (shouldGroupByAssignee) {
//         // For "Tasks I Assigned to Others" - group by assignee
//         processed = groupTasksByAssignee(tasks);
//       } else if (isAdmin && tabIndex === 3) {
//         // For admin "All User Tasks" - group by user
//         processed = processTasksData(tasks, tableFilters, true) as UserGroup[];
//       } else {
//         // For regular task lists
//         processed = processTasksData(tasks, tableFilters, false) as Task[];
//       }

//       const startIndex = tabPages[tabIndex] * tabRowsPerPage[tabIndex];
//       const endIndex = startIndex + tabRowsPerPage[tabIndex];
      
//       return {
//         all: processed,
//         paginated: processed.slice(startIndex, endIndex)
//       };
//     };

//     return {
//       tasksAssignedToMe: processCategory(categorizedTasks.tasksAssignedToMe, 0),
//       tasksIAssignedToOthers: processCategory(categorizedTasks.tasksIAssignedToOthers, 1, true), // Group by assignee
//       todaysTasks: processCategory(categorizedTasks.todaysTasks, 2),
//       allUserTasks: processCategory(categorizedTasks.allUserTasks, 3)
//     };
//   }, [categorizedTasks, tableFilters, tabPages, tabRowsPerPage, isAdmin]);

//   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
//     setActiveTab(newValue);
//   };

//   const handleTabPageChange = (tabIndex: number) => (event: unknown, newPage: number) => {
//     setTabPages(prev => ({ ...prev, [tabIndex]: newPage }));
//   };

//   const handleTabRowsPerPageChange = (tabIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
//     const newRowsPerPage = parseInt(event.target.value, 10);
//     setTabRowsPerPage(prev => ({ ...prev, [tabIndex]: newRowsPerPage }));
//     setTabPages(prev => ({ ...prev, [tabIndex]: 0 }));
//   };

//   const handleToggleTaskExpansion = (taskId: string) => {
//     const newExpanded = new Set(expandedTasks);
//     if (newExpanded.has(taskId)) {
//       newExpanded.delete(taskId);
//     } else {
//       newExpanded.add(taskId);
//     }
//     setExpandedTasks(newExpanded);
//   };

//   // FIXED Resume functionality - preserve elapsed time
//  // FIXED Resume functionality - preserve elapsed time
// const handleTaskAction = (task: Task, action: 'resume' | 'stop' | 'start') => {  // ✅ Add 'start' to the type
//   console.log('🎯 Task Action Called:', { task: task.taskName, action, currentElapsed: task.totalDuration });
//   if (action === 'resume' || action === 'start') {
//     // Create enhanced task object with preserved elapsed time
//     const enhancedTask = {
//       ...task,
//       // Preserve existing elapsed time
//       elapsedTime: task.totalDuration || 0,
//       totalDuration: task.totalDuration || 0,
//       // Add resume timestamp
//       resumedAt: new Date().toISOString(),
//       // Ensure proper task identification - FIX: ensure taskId is always a string
//       id: task.taskId || task.id || '',
//       taskId: task.taskId || task.id || '',
//       // Preserve all assignment information
//       assignedBy: (task as any).assignedBy,
//       assignedTo: (task as any).assignedTo,
//       assignedByEmail: (task as any).assignedByEmail,
//       assignedToEmail: (task as any).assignedToEmail,
//       isAssigned: (task as any).isAssigned
//     };
    
//     console.log('🔄 Starting/Resuming task with preserved time:', {
//       taskName: enhancedTask.taskName,
//       preservedElapsed: enhancedTask.elapsedTime,
//       totalDuration: enhancedTask.totalDuration
//     });
    
//     onTableAction(enhancedTask, action);
//   } else {
//     onTableAction(task, action);
//   }
// };


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

//   // Helper functions for assignment info display
//  // Helper functions for assignment info display
// const getAssignmentInfo = (task: Task) => {
//   const assignedBy = (task as any).assignedBy || (task as any).assignedByEmail || (task as any).createdBy;
//   const assignedTo = (task as any).assignedTo || (task as any).assignedToEmail;
  
//   // Ensure assignedBy and assignedTo are strings before using split
//   const assignedByStr = typeof assignedBy === 'string' ? assignedBy : '';
//   const assignedToStr = typeof assignedTo === 'string' ? assignedTo : '';
  
//   if (assignedByStr === userEmail && assignedToStr && assignedToStr !== userEmail) {
//     return 'Assigned by me';
//   } else if (assignedToStr === userEmail && assignedByStr && assignedByStr !== userEmail) {
//     // Safe split with fallback
//     const assignerName = assignedByStr.includes('@') ? assignedByStr.split('@')[0] : assignedByStr;
//     return `Assigned by ${assignerName}`;
//   } else if (assignedByStr === userEmail) {
//     return 'Self-assigned';
//   } else {
//     return 'Self-created';
//   }
// };

// const getAssignedToInfo = (task: Task) => {
//   const assignedTo = (task as any).assignedTo || (task as any).assignedToEmail;
//   const assignedToStr = typeof assignedTo === 'string' ? assignedTo : '';
  
//   if (assignedToStr && assignedToStr !== userEmail) {
//     // Safe split with fallback
//     const assigneeName = assignedToStr.includes('@') ? assignedToStr.split('@')[0] : assignedToStr;
//     return `Assigned to: ${assigneeName}`;
//   }
//   return null;
// };


//   const getUserDisplayName = (task: Task) => {
//     return task.username || task.userEmail?.split('@')[0] || 'Unknown';
//   };

//   // Render assignee group row (for "Tasks I Assigned to Others" tab)
//   const renderAssigneeGroupRow = (assigneeGroup: UserGroup) => {
//     const isExpanded = expandedRows.has(assigneeGroup.userEmail);
    
//     return (
//       <React.Fragment key={assigneeGroup.userEmail}>
//         <TableRow 
//           hover 
//           sx={{ 
//             cursor: 'pointer',
//             bgcolor: 'rgba(233, 30, 99, 0.08)',
//             '&:hover': { bgcolor: 'rgba(233, 30, 99, 0.15)' }
//           }}
//           onClick={() => onToggleRowExpansion(assigneeGroup.userEmail)}
//         >
//           <TableCell>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <IconButton size="small">
//                 {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
//               </IconButton>
//               <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
//                 {assigneeGroup.username.charAt(0).toUpperCase()}
//               </Avatar>
//               <Box>
//                 <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'secondary.main' }}>
//                   {assigneeGroup.username}
//                 </Typography>
//                 <Typography variant="caption" color="textSecondary">
//                   {assigneeGroup.userEmail}
//                 </Typography>
//                 <Chip 
//                   label="Assignee" 
//                   size="small" 
//                   color="secondary" 
//                   variant="outlined"
//                   sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
//                 />
//               </Box>
//             </Box>
//           </TableCell>
//           <TableCell align="center">
//             <Typography variant="h6" color="secondary.main">
//               {assigneeGroup.totalTasks}
//             </Typography>
//           </TableCell>
//           <TableCell align="center">
//             <Typography variant="body2" color="success.main">
//               {assigneeGroup.completedTasks}
//             </Typography>
//           </TableCell>
//           <TableCell align="center">
//             <Typography variant="body2" color="warning.main">
//               {assigneeGroup.activeTasks}
//             </Typography>
//           </TableCell>
//           <TableCell align="center">
//             <Typography variant="body2" color="info.main">
//               {assigneeGroup.assignedTasks}
//             </Typography>
//           </TableCell>
//              <TableCell align="center">
//             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//               <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
//                 {formatTime(assigneeGroup.totalDuration)}
//               </Typography>
//               {/* Show calculated total if different */}
//               {(() => {
//                 const calculatedTotal = assigneeGroup.tasks.reduce((total, task) => 
//                   total + getTaskDuration(task), 0
//                 );
//                 return calculatedTotal !== assigneeGroup.totalDuration ? (
//                   <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
//                     Calc: {formatTime(calculatedTotal)}
//                   </Typography>
//                 ) : null;
//               })()}
//             </Box>
//           </TableCell>
//         </TableRow>
        
//         {/* Assignee's Tasks */}
//         <TableRow>
//           <TableCell colSpan={6} sx={{ p: 0, border: 'none' }}>
//             <Collapse in={isExpanded}>
//               <Box sx={{ p: 2, bgcolor: 'rgba(233, 30, 99, 0.03)' }}>
//                 <Typography variant="subtitle2" gutterBottom color="secondary.main">
//                   Tasks assigned to {assigneeGroup.username}
//                 </Typography>
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Task Details</TableCell>
//                       <TableCell>Type</TableCell>
//                       <TableCell>Status</TableCell>
//                       <TableCell>Duration</TableCell>
//                       <TableCell>Assigned Date</TableCell>
//                       <TableCell>Last Activity</TableCell>
//                       <TableCell>Actions</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {assigneeGroup.tasks.map((task: Task) => (
//                       <React.Fragment key={task.taskId}>
//                         <TableRow hover>
//                           <TableCell>
//                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                               <IconButton 
//                                 size="small"
//                                 onClick={() => handleToggleTaskExpansion(task.taskId)}
//                               >
//                                 {expandedTasks.has(task.taskId) ? <ExpandLess /> : <ExpandMore />}
//                               </IconButton>
//                               <Box>
//                                 <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                                   {task.taskName}
//                                 </Typography>
//                                 <Typography variant="caption" color="textSecondary">
//                                   ID: {task.taskId}
//                                 </Typography>
//                               </Box>
//                             </Box>
//                           </TableCell>
//                           <TableCell>
//                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                               {getTypeIcon(task.type)}
//                               <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
//                                 {task.type}
//                               </Typography>
//                             </Box>
//                           </TableCell>
//                           <TableCell>
//                             <Chip
//                               label={task.status}
//                               size="small"
//                               color={getStatusColor(task.status) as any}
//                               variant="outlined"
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//                               <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
//                                 {formatTime(getTaskDuration(task))}
//                               </Typography>
//                               {/* Show indicator if calculated duration differs */}
//                               {calculatedDurations[task.taskId] !== undefined && 
//                                calculatedDurations[task.taskId] !== (task.totalDuration || 0) && (
//                                 <Chip
//                                   label="Recalculated"
//                                   size="small"
//                                   color="success"
//                                   variant="outlined"
//                                   sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }}
//                                 />
//                               )}
//                             </Box>
//                           </TableCell>
//                           <TableCell>
//                             <Typography variant="caption">
//                               {(task as any).assignedAt || (task as any).createdAt || 'Unknown'}
//                             </Typography>
//                           </TableCell>
//                           <TableCell>
//                             <Typography variant="caption">
//                               {getLastActivityTime(task)}
//                             </Typography>
//                           </TableCell>
//                           <TableCell>
//                             <Box sx={{ display: 'flex', gap: 0.5 }}>
//                               {task.status === 'paused' && (
//                                 <Button
//                                   size="small"
//                                   startIcon={<PlayArrow />}
//                                   onClick={() => handleTaskAction(task, 'resume')}
//                                   disabled={isRunning}
//                                   color="success"
//                                 >
//                                   Resume
//                                 </Button>
//                               )}
//                               {['started', 'resumed'].includes(task.status) && (
//                                 <Button
//                                   size="small"
//                                   startIcon={<Stop />}
//                                   onClick={() => handleTaskAction(task, 'stop')}
//                                   color="error"
//                                 >
//                                   Stop
//                                 </Button>
//                               )}
//                             </Box>
//                           </TableCell>
//                         </TableRow>
                        
//                         <TableRow>
//                           <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
//                             <ActivityTimeline
//                               task={task}
//                               isExpanded={expandedTasks.has(task.taskId)}
//                               formatTime={formatTime}
//                                  onDurationCalculated={handleDurationCalculated}
//                             />
//                           </TableCell>
//                         </TableRow>
//                       </React.Fragment>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </Box>
//             </Collapse>
//           </TableCell>
//         </TableRow>
//       </React.Fragment>
//     );
//   };

//   // Keep the original renderUserRow for admin view
//   const renderUserRow = (userGroup: UserGroup, task: Task) => {
//     const isExpanded = expandedRows.has(userGroup.userEmail);
    
//     return (
//       <React.Fragment key={userGroup.userEmail}>
//         <TableRow 
//           hover 
//           sx={{ 
//             cursor: 'pointer',
//             bgcolor: 'lightblue',
//             '&:hover': { bgcolor: 'primary.main', color: 'white' }
//           }}
//           onClick={() => onToggleRowExpansion(userGroup.userEmail)}
//         >
//           <TableCell>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <IconButton size="small">
//                 {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
//               </IconButton>
//               <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
//                 {userGroup.username.charAt(0).toUpperCase()}
//               </Avatar>
//               <Box>
//                 <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
//                   {userGroup.username}
//                 </Typography>
//                 <Typography variant="caption" color="textSecondary">
//                   {userGroup.userEmail}
//                 </Typography>
//               </Box>
//             </Box>
//           </TableCell>
//           <TableCell align="center">
//             <Typography variant="h6" color="primary">
//               {userGroup.totalTasks}
//             </Typography>
//           </TableCell>
//           <TableCell align="center">
//             <Typography variant="body2" color="success.main">
//               {userGroup.completedTasks}
//             </Typography>
//           </TableCell>
//           <TableCell align="center">
//             <Typography variant="body2" color="warning.main">
//               {userGroup.activeTasks}
//             </Typography>
//           </TableCell>
//           <TableCell align="center">
//             <Typography variant="body2" color="info.main">
//               {userGroup.assignedTasks}
//             </Typography>
//           </TableCell>
//            <TableCell>
//             <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//               <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
//                 {formatTime(getTaskDuration(task))}
//               </Typography>
//               {/* Show indicator if calculated duration differs */}
//               {calculatedDurations[task.taskId] !== undefined && 
//                calculatedDurations[task.taskId] !== (task.totalDuration || 0) && (
//                 <Chip
//                   label="✓ Accurate"
//                   size="small"
//                   color="success"
//                   variant="outlined"
//                   sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }}
//                 />
//               )}
//             </Box>
//           </TableCell>
//         </TableRow>
        
//         {/* User's Tasks */}
//         <TableRow>
//           <TableCell colSpan={6} sx={{ p: 0, border: 'none' }}>
//             <Collapse in={isExpanded}>
//               <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
//                 <Typography variant="subtitle2" gutterBottom>
//                   Tasks for {userGroup.username}
//                 </Typography>
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Task Details</TableCell>
//                       <TableCell>Type</TableCell>
//                       <TableCell>Status</TableCell>
//                       <TableCell>Duration</TableCell>
//                       <TableCell>Source</TableCell>
//                       <TableCell>Last Activity</TableCell>
//                       <TableCell>Actions</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {userGroup.tasks.map((task: Task) => (
//                       <React.Fragment key={task.taskId}>
//                         <TableRow hover>
//                           <TableCell>
//                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                               <IconButton 
//                                 size="small"
//                                 onClick={() => handleToggleTaskExpansion(task.taskId)}
//                               >
//                                 {expandedTasks.has(task.taskId) ? <ExpandLess /> : <ExpandMore />}
//                               </IconButton>
//                               <Box>
//                                 <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                                   {task.taskName}
//                                 </Typography>
//                                 <Typography variant="caption" color="textSecondary">
//                                   ID: {task.taskId}
//                                 </Typography>
//                               </Box>
//                             </Box>
//                           </TableCell>
//                           <TableCell>
//                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                               {getTypeIcon(task.type)}
//                               <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
//                                 {task.type}
//                               </Typography>
//                             </Box>
//                           </TableCell>
//                           <TableCell>
//                             <Chip
//                               label={task.status}
//                               size="small"
//                               color={getStatusColor(task.status) as any}
//                               variant="outlined"
//                             />
//                           </TableCell>
//                            <TableCell>
//             <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//               <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
//                 {formatTime(getTaskDuration(task))}
//               </Typography>
//               {/* Show indicator if calculated duration differs */}
//               {calculatedDurations[task.taskId] !== undefined && 
//                calculatedDurations[task.taskId] !== (task.totalDuration || 0) && (
//                 <Chip
//                   label="✓ Accurate"
//                   size="small"
//                   color="success"
//                   variant="outlined"
//                   sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }}
//                 />
//               )}
//             </Box>
//           </TableCell>
//                           <TableCell>
//                             <Chip
//                               label={task.isAssigned ? 'Assigned' : 'Self-created'}
//                               size="small"
//                               variant="outlined"
//                               color={task.isAssigned ? 'secondary' : 'primary'}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Typography variant="caption">
//                               {getLastActivityTime(task)}
//                             </Typography>
//                           </TableCell>
//                           <TableCell>
//                             <Box sx={{ display: 'flex', gap: 0.5 }}>
//                               {task.status === 'paused' && (
//                                 <Button
//                                   size="small"
//                                   startIcon={<PlayArrow />}
//                                   onClick={() => handleTaskAction(task, 'resume')}
//                                   disabled={isRunning}
//                                 >
//                                   Resume
//                                 </Button>
//                               )}
//                               {['started', 'resumed'].includes(task.status) && (
//                                 <Button
//                                   size="small"
//                                   startIcon={<Stop />}
//                                   onClick={() => handleTaskAction(task, 'stop')}
//                                   color="error"
//                                 >
//                                   Stop
//                                 </Button>
//                               )}
//                             </Box>
//                           </TableCell>
//                         </TableRow>
                        
//                         <TableRow>
//                           <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
//                             <ActivityTimeline
//                               task={task}
//                               isExpanded={expandedTasks.has(task.taskId)}
//                               formatTime={formatTime}
//                                  onDurationCalculated={handleDurationCalculated}
//                             />
//                           </TableCell>
//                         </TableRow>
//                       </React.Fragment>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </Box>
//             </Collapse>
//           </TableCell>
//         </TableRow>
//       </React.Fragment>
//     );
//   };

//   const renderTaskRow = (task: Task) => {
//     return (
//       <React.Fragment key={task.taskId}>
//         <TableRow hover>
//           <TableCell>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <IconButton 
//                 size="small"
//                 onClick={() => handleToggleTaskExpansion(task.taskId)}
//               >
//                 {expandedTasks.has(task.taskId) ? <ExpandLess /> : <ExpandMore />}
//               </IconButton>
//               <Box>
//                 <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                   {task.taskName}
//                 </Typography>
//                 <Typography variant="caption" color="textSecondary">
//                   ID: {task.taskId}
//                 </Typography>
//               </Box>
//             </Box>
//           </TableCell>
//           <TableCell>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//               {getTypeIcon(task.type)}
//               <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
//                 {task.type}
//               </Typography>
//             </Box>
//           </TableCell>
//           <TableCell>
//             <Chip
//               label={task.status}
//               size="small"
//               color={getStatusColor(task.status) as any}
//               variant="outlined"
//             />
//           </TableCell>
//             <TableCell>
//             <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//               <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
//                 {formatTime(getTaskDuration(task))}
//               </Typography>
//               {/* Show indicator if calculated duration differs */}
//               {calculatedDurations[task.taskId] !== undefined && 
//                calculatedDurations[task.taskId] !== (task.totalDuration || 0) && (
//                 <Chip
//                   label="✓ Accurate"
//                   size="small"
//                   color="success"
//                   variant="outlined"
//                   sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }}
//                 />
//               )}
//             </Box>
//           </TableCell>
//           <TableCell>
//             <Box>
//               <Typography variant="body2">
//                 {getAssignmentInfo(task)}
//               </Typography>
//               {getAssignedToInfo(task) && (
//                 <Typography variant="caption" color="textSecondary">
//                   {getAssignedToInfo(task)}
//                 </Typography>
//               )}
//             </Box>
//           </TableCell>
//           <TableCell>
//             <Typography variant="body2">
//               {getUserDisplayName(task)}
//             </Typography>
//           </TableCell>
//           <TableCell>
//             <Typography variant="caption">
//               {getLastActivityTime(task)}
//             </Typography>
//           </TableCell>
//           <TableCell>
//             <Box sx={{ display: 'flex', gap: 0.5 }}>
//               {task.status === 'paused' && (
//                 <Button
//                   size="small"
//                   startIcon={<PlayArrow />}
//                   onClick={() => handleTaskAction(task, 'resume')}
//                   disabled={isRunning}
//                   color="success"
//                 >
//                   Resume
//                 </Button>
//               )}
//               {['started', 'resumed'].includes(task.status) && (
//                 <Button
//                   size="small"
//                   startIcon={<Stop />}
//                   onClick={() => handleTaskAction(task, 'stop')}
//                   color="error"
//                 >
//                   Stop
//                 </Button>
//               )}
//             </Box>
//           </TableCell>
//         </TableRow>
        
//         {/* Task Activity Timeline */}
//         <TableRow>
//           <TableCell colSpan={8} sx={{ p: 0, border: 'none' }}>
//             <ActivityTimeline
//               task={task}
//               isExpanded={expandedTasks.has(task.taskId)}
//               formatTime={formatTime}
//                  onDurationCalculated={handleDurationCalculated}
//             />
//           </TableCell>
//         </TableRow>
//       </React.Fragment>
//     );
//   };

//   const renderTaskTable = (tabIndex: number, emptyMessage: string) => {
//     const categoryKeys = ['tasksAssignedToMe', 'tasksIAssignedToOthers', 'todaysTasks', 'allUserTasks'];
//     const categoryData = processedCategories[categoryKeys[tabIndex] as keyof typeof processedCategories];
    
//     // Special handling for "Tasks I Assigned to Others" tab (index 1)
//     if (tabIndex === 1) {
//       const assigneeGroups = categoryData.all as UserGroup[];
      
//       return (
//         <>
//           {assigneeGroups.length > 0 ? (
//             <>
            

//               <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
//                 <Table stickyHeader size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Assignee</TableCell>
//                       <TableCell align="center">Total Tasks</TableCell>
//                       <TableCell align="center">Completed</TableCell>
//                       <TableCell align="center">Active</TableCell>
//                       <TableCell align="center">Assigned</TableCell>
//                       <TableCell align="center">Total Duration</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {(categoryData.paginated as UserGroup[]).map((assigneeGroup: UserGroup) => 
//                       renderAssigneeGroupRow(assigneeGroup)
//                     )}
//                   </TableBody>
//                 </Table>
//               </TableContainer>

//               <TablePagination
//                 component="div"
//                 count={assigneeGroups.length}
//                 page={tabPages[tabIndex]}
//                 onPageChange={handleTabPageChange(tabIndex)}
//                 rowsPerPage={tabRowsPerPage[tabIndex]}
//                 onRowsPerPageChange={handleTabRowsPerPageChange(tabIndex)}
//                 rowsPerPageOptions={[5, 10, 25, 50]}
//                 showFirstButton
//                 showLastButton
//               />

//               {/* Summary for assignees */}
//               <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(233, 30, 99, 0.05)', borderRadius: 1 }}>
//                 <Typography variant="h6" gutterBottom color="secondary.main">
//                   Assignment Summary
//                 </Typography>
//                 <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
//                   <Box>
//                     <Typography variant="body2" color="textSecondary">
//                       Total Assignees
//                     </Typography>
//                     <Typography variant="h6" color="secondary.main">
//                       {assigneeGroups.length}
//                     </Typography>
//                   </Box>
//                   <Box>
//                     <Typography variant="body2" color="textSecondary">
//                       Total Assigned Tasks
//                     </Typography>
//                     <Typography variant="h6" color="secondary.main">
//                       {assigneeGroups.reduce((sum, group) => sum + group.totalTasks, 0)}
//                     </Typography>
//                   </Box>
//                   <Box>
//                     <Typography variant="body2" color="textSecondary">
//                       Completed Tasks
//                     </Typography>
//                     <Typography variant="h6" color="success.main">
//                       {assigneeGroups.reduce((sum, group) => sum + group.completedTasks, 0)}
//                     </Typography>
//                   </Box>
//                   <Box>
//                     <Typography variant="body2" color="textSecondary">
//                       Active Tasks
//                     </Typography>
//                     <Typography variant="h6" color="warning.main">
//                       {assigneeGroups.reduce((sum, group) => sum + group.activeTasks, 0)}
//                     </Typography>
//                   </Box>
//                   <Box>
//                      <Box>
//                 <Typography variant="body2" color="textSecondary">
//                   Total Duration (Stored)
//                 </Typography>
//                 <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
//                   {formatTime(
//                     filteredTasks.reduce((total: number, task: Task) => 
//                       total + (task.totalDuration || 0), 0
//                     )
//                   )}
//                 </Typography>
//               </Box>
//                        <Box>
//                 <Typography variant="body2" color="textSecondary">
//                   Total Duration (Calculated)
//                 </Typography>
//                 <Typography variant="h6" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
//                   {formatTime(
//                     filteredTasks.reduce((total: number, task: Task) => 
//                       total + getTaskDuration(task), 0
//                     )
//                   )}
//                 </Typography>
//               </Box>
//               {Object.keys(calculatedDurations).length > 0 && (
//                 <Box>
//                                    <Typography variant="body2" color="textSecondary">
//                     Recalculated Tasks
//                   </Typography>
//                   <Typography variant="h6" sx={{ color: 'info.main' }}>
//                     {Object.keys(calculatedDurations).length}
//                   </Typography>
//                 </Box>
//               )}
//                   </Box>
//                 </Box>
//               </Box>
//             </>
//           ) : (
//             <Box sx={{ textAlign: 'center', py: 4 }}>
//               <PersonAdd sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
//               <Typography variant="h6" color="textSecondary" gutterBottom>
//                 No Assigned Tasks Found
//               </Typography>
//               <Typography variant="body2" color="textSecondary" paragraph>
//                 {emptyMessage}
//               </Typography>
              
//               {/* Debug information for troubleshooting */}
//               <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1, textAlign: 'left' }}>
//                 <Typography variant="subtitle2" color="info.main" gutterBottom>
//                   🔧 Troubleshooting Tips:
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" component="div">
//                   <ul style={{ margin: 0, paddingLeft: 20 }}>
//                     <li>Make sure tasks have proper assignment fields (assignedBy, assignedTo, assignedToEmail)</li>
//                     <li>Check that you are the creator/assigner of the tasks</li>
//                     <li>Verify that tasks are assigned to different users (not yourself)</li>
//                     <li>Current user email: <code>{userEmail || 'Not detected'}</code></li>
//                     <li>Total tasks processed: {filteredTasks.length}</li>
//                   </ul>
//                 </Typography>
//               </Box>
              
//               <Button
//                 variant="outlined"
//                 onClick={() => {
//                   onFilterChange('taskName', '');
//                   onFilterChange('username', '');
//                   onFilterChange('type', 'all');
//                   onFilterChange('status', 'all');
//                   onFilterChange('dateRange', 'all');
//                 }}
//                 sx={{ mt: 2 }}
//               >
//                 Clear All Filters
//               </Button>
//             </Box>
//           )}
//         </>
//       );
//     }

//         // For other tabs (regular task tables or admin user groups)
//     const isUserGroupData = tabIndex === 3 && isAdmin; // Admin "All User Tasks" tab
//     const data = categoryData.all;
    
//     return (
//       <>
//         {data.length > 0 ? (
//           <>
//             <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
//               <Table stickyHeader size="small">
//                 <TableHead>
//                   <TableRow>
//                     {isUserGroupData ? (
//                       // Admin user group headers
//                       <>
//                         <TableCell>User</TableCell>
//                         <TableCell align="center">Total Tasks</TableCell>
//                         <TableCell align="center">Completed</TableCell>
//                         <TableCell align="center">Active</TableCell>
//                         <TableCell align="center">Assigned</TableCell>
//                         <TableCell align="center">Total Duration</TableCell>
//                       </>
//                     ) : (
//                       // Regular task headers
//                       <>
//                         <TableCell>Task Details</TableCell>
//                         <TableCell>Type</TableCell>
//                         <TableCell>Status</TableCell>
//                         <TableCell>Duration</TableCell>
//                         <TableCell>Assignment Info</TableCell>
//                         <TableCell>Username</TableCell>
//                         <TableCell>Last Activity</TableCell>
//                         <TableCell>Actions</TableCell>
//                       </>
//                     )}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {(categoryData.paginated as any[]).map((item: any) => 
//                     isUserGroupData ? renderUserRow(item as UserGroup, item as Task) : renderTaskRow(item as Task)
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>

//             <TablePagination
//               component="div"
//               count={data.length}
//               page={tabPages[tabIndex]}
//               onPageChange={handleTabPageChange(tabIndex)}
//               rowsPerPage={tabRowsPerPage[tabIndex]}
//               onRowsPerPageChange={handleTabRowsPerPageChange(tabIndex)}
//               rowsPerPageOptions={[5, 10, 25, 50]}
//               showFirstButton
//               showLastButton
//             />

//             <SummaryStatistics
//               data={data}
//               isAdmin={isUserGroupData}
//               formatTime={formatTime}
//             />
//           </>
//         ) : (
//           <Box sx={{ textAlign: 'center', py: 4 }}>
//             <Typography variant="body1" color="textSecondary">
//               {emptyMessage}
//             </Typography>
//             <Button
//               variant="outlined"
//               onClick={() => {
//                 onFilterChange('taskName', '');
//                 onFilterChange('username', '');
//                 onFilterChange('type', 'all');
//                 onFilterChange('status', 'all');
//                 onFilterChange('dateRange', 'all');
//               }}
//               sx={{ mt: 2 }}
//             >
//               Clear All Filters
//             </Button>
//           </Box>
//         )}
//       </>
//     );
//   };

//   // If admin and using grouped view, show original admin view
//   if (isAdmin && showAdminGroupedView) {
//     const processedTasks = useMemo(() => {
//       return processTasksData(filteredTasks, tableFilters, isAdmin);
//     }, [filteredTasks, tableFilters, isAdmin]);

//     const paginatedTasks = useMemo(() => {
//       const startIndex = tablePage * tableRowsPerPage;
//       const endIndex = startIndex + tableRowsPerPage;
//       return processedTasks.slice(startIndex, endIndex);
//     }, [processedTasks, tablePage, tableRowsPerPage]);

//     return (
//       <Card variant="outlined" sx={{ mt: 2, width: '100%', maxWidth: 'none', minWidth: 1200 }}>
//         <CardContent sx={{ pb: 1 }}>
//           {/* Header */}
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <IconButton onClick={onToggleHistory}>
//                 {showHistory ? <ExpandLess /> : <ExpandMore />}
//               </IconButton>
//               <History color="primary" />
//               <Typography variant="h6">
//                 All Tasks History (Admin Grouped View)
//               </Typography>
//               <Chip 
//                 label={`${processedTasks.length} users`} 
//                 size="small" 
//                 color="primary" 
//               />
//             </Box>
            
//             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
//               <FormControlLabel
//                 control={
//                   <Switch
//                     checked={showAdminGroupedView}
//                     onChange={(e) => setShowAdminGroupedView(e.target.checked)}
//                     color="primary"
//                   />
//                 }
//                 label="Grouped View"
//               />
//               <ExportControls
//                 data={processedTasks}
//                 isAdmin={isAdmin}
//                 formatTime={formatTime}
//                 disabled={processedTasks.length === 0}
//               />
//               <Button
//                 variant="outlined"
//                 startIcon={<Schedule />}
//                 onClick={onToggleHistory}
//                 size="small"
//               >
//                 {showHistory ? 'Hide' : 'Show'} History
//               </Button>
//             </Box>
//           </Box>

//           <Collapse in={showHistory}>
//             <FilterSection
//               tableFilters={tableFilters}
//               onFilterChange={onFilterChange}
//               isAdmin={isAdmin}
//             />

//             {processedTasks.length > 0 ? (
//               <>
//                 <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
//                   <Table stickyHeader size="small">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>User</TableCell>
//                         <TableCell align="center">Total Tasks</TableCell>
//                         <TableCell align="center">Completed</TableCell>
//                         <TableCell align="center">Active</TableCell>
//                         <TableCell align="center">Assigned</TableCell>
//                         <TableCell align="center">Total Duration</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {paginatedTasks.map((item: any) => renderUserRow(item as UserGroup, item as Task))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>

//                 <TablePagination
//                   component="div"
//                   count={processedTasks.length}
//                   page={tablePage}
//                   onPageChange={onPageChange}
//                   rowsPerPage={tableRowsPerPage}
//                   onRowsPerPageChange={onRowsPerPageChange}
//                   rowsPerPageOptions={[5, 10, 25, 50]}
//                   showFirstButton
//                   showLastButton
//                 />
//               </>
//             ) : (
//               <Box sx={{ textAlign: 'center', py: 4 }}>
//                 <Typography variant="body1" color="textSecondary">
//                   No tasks found matching the current filters.
//                 </Typography>
//                 <Button
//                   variant="outlined"
//                   onClick={() => {
//                     onFilterChange('taskName', '');
//                     onFilterChange('username', '');
//                     onFilterChange('type', 'all');
//                     onFilterChange('status', 'all');
//                     onFilterChange('dateRange', 'all');
//                   }}
//                   sx={{ mt: 2 }}
//                 >
//                   Clear All Filters
//                 </Button>
//               </Box>
//             )}
//             <SummaryStatistics
//               data={processedTasks}
//               isAdmin={isAdmin}
//               formatTime={formatTime}
//             />
//           </Collapse>
//         </CardContent>
//       </Card>
//     );
//   }

//   // Main tabbed view (for all users including admin when not using grouped view)
//   return (
//     <Card variant="outlined" sx={{ mt: 2, width: '100%', maxWidth: 'none', minWidth: 1200 }}>
//       <CardContent sx={{ pb: 1 }}>
//         {/* Header */}
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <IconButton onClick={onToggleHistory}>
//               {showHistory ? <ExpandLess /> : <ExpandMore />}
//             </IconButton>
//             <History color="primary" />
//             <Typography variant="h6">
//               Task History
//             </Typography>
//             {isAdmin && (
//               <Chip 
//                 icon={<AdminPanelSettings />}
//                 label="Admin View" 
//                 size="small" 
//                 color="secondary" 
//                 variant="outlined"
//               />
//             )}
//           </Box>
          
//           <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
           
//             <ExportControls
//               data={filteredTasks}
//               isAdmin={isAdmin}
//               formatTime={formatTime}
//               disabled={filteredTasks.length === 0}
//             />
//             {/* <Button
//               variant="outlined"
//               startIcon={<Schedule />}
//               onClick={onToggleHistory}
//               size="small"
//             >
//               {showHistory ? 'Hide' : 'Show'} History
//             </Button> */}
//           </Box>
//         </Box>

//         <Collapse in={showHistory}>
//           {/* Filters */}
//           <FilterSection
//             tableFilters={tableFilters}
//             onFilterChange={onFilterChange}
//             isAdmin={isAdmin}
//           />

//           {/* Enhanced Tabs with better badges and icons */}
//           <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
//             <Tabs 
//               value={activeTab} 
//               onChange={handleTabChange} 
//               aria-label="task history tabs"
//               variant="scrollable"
//               scrollButtons="auto"
//             >
//               <Tab 
//                 icon={<Assignment />}
//                 label={
//  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//       <Typography variant="body2">Tasks Assigned to Me</Typography>
//       <Chip 
//         label={categorizedTasks.tasksAssignedToMe.length}
//         size="small"
//         color="primary"
//         sx={{ 
//           minWidth: 24,
//           height: 20,
//           fontSize: '0.75rem',
//           fontWeight: 600
//         }}
//       />
//     </Box>
//                 }
//                 id="task-tab-0"
//                 aria-controls="task-tabpanel-0"
//               />
//               <Tab 
//                 icon={<AssignmentTurnedIn />}
//                 label={
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//       <Typography variant="body2">Tasks I Assigned to Others</Typography>
//       <Chip 
//         label={categorizedTasks.tasksIAssignedToOthers.length}
//         size="small"
//         color="secondary"
//         sx={{ 
//           minWidth: 24,
//           height: 20,
//           fontSize: '0.75rem',
//           fontWeight: 600
//         }}
//       />
//     </Box>
//                 }
//                 id="task-tab-1"
//                 aria-controls="task-tabpanel-1"
//               />
//               <Tab 
//                 icon={<Today />}
//                 label={
//                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//       <Typography variant="body2">Today's Tasks</Typography>
//       <Chip 
//         label={categorizedTasks.todaysTasks.length}
//         size="small"
//         color="success"
//         sx={{ 
//           minWidth: 24,
//           height: 20,
//           fontSize: '0.75rem',
//           fontWeight: 600
//         }}
//       />
//     </Box>
//                 }
//                 id="task-tab-2"
//                 aria-controls="task-tabpanel-2"
//               />
//               {isAdmin && (
//                 <Tab 
//                   icon={<ViewList />}
//                   label={
//  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//       <Typography variant="body2">All User Tasks</Typography>
//       <Chip 
//         label={categorizedTasks.allUserTasks.length}
//         size="small"
//         color="success"
//         sx={{ 
//           minWidth: 24,
//           height: 20,
//           fontSize: '0.75rem',
//           fontWeight: 600
//         }}
//       />
//     </Box>
//                   }
//                   id="task-tab-3"
//                   aria-controls="task-tabpanel-3"
//                 />
//               )}
//             </Tabs>
//           </Box>

//           {/* Tab Panels */}
//           <TabPanel value={activeTab} index={0}>
          
//             {renderTaskTable(0, "No tasks assigned to you found matching the current filters.")}
//           </TabPanel>

//           <TabPanel value={activeTab} index={1}>
           
//             {renderTaskTable(1, "No tasks that you assigned to others found. Make sure tasks have proper assignment fields (assignedBy, assignedTo).")}
//           </TabPanel>

//           <TabPanel value={activeTab} index={2}>
         
//             {renderTaskTable(2, "No tasks created today found matching the current filters.")}
//           </TabPanel>

//           {isAdmin && (
//             <TabPanel value={activeTab} index={3}>
            
//               {renderTaskTable(3, "No user tasks found matching the current filters.")}
//             </TabPanel>
//           )}

        
//         </Collapse>
//       </CardContent>
//     </Card>
//   );
// };

// export default TaskHistoryTable;



