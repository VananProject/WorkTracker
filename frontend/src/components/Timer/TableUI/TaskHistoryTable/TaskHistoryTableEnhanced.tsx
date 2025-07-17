// import React, { useState, useMemo } from 'react';
// import {
//   Card,
//   CardContent,
//   Typography,
//   Collapse,
//   Box,
//   Chip,
//   IconButton,
//   Button,
//   Tabs,
//   Tab,
//   Switch,
//   FormControlLabel,
//   Alert
// } from '@mui/material';
// import {
//   ExpandMore,
//   ExpandLess,
//   History,
//   Schedule,
//   Assignment,
//   AssignmentTurnedIn,
//   Today,
//   AdminPanelSettings,
//   ViewList,
//   Repeat,
//   NotificationsActive
// } from '@mui/icons-material';
// import type { Task, TaskHistoryTableProps } from '../types/TaskHistoryTypes';
// import ExportControls from '../components/ExportControls';
// import FilterSection from '../components/FilterSection';
// import AllUserTasks from './AllUserTasks';
// import RecurringTasks from './RecurringTasks';
// import TasksAssignedToMe from './TasksAssignedToMe';
// import TasksIAssignedToOthers from './TasksIAssignedToOthers';
// import TodaysTasks from './TodaysTasks';
// import TaskService from '../../../../services/taskService';

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
//       id={`enhanced-task-tabpanel-${index}`}
//       aria-labelledby={`enhanced-task-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
//     </div>
//   );
// }

// const TaskHistoryTableEnhanced: React.FC<TaskHistoryTableProps> = ({
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
// //   allTasks,
// //   assignedTasks
// }) => {
//   const [activeTab, setActiveTab] = useState(0);
//    const [allTasks, setAllTasks] = React.useState<any[]>([]);
//   const [calculatedDurations, setCalculatedDurations] = useState<Record<string, number>>({});
//   const [showAdminGroupedView, setShowAdminGroupedView] = useState(false);
//  const [assignedTasks, setAssignedTasks] = React.useState<any[]>([]);
//   // Get current user email helper
//   const getCurrentUserEmail = () => {
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

//   // Add callback to handle duration updates
//   const handleDurationCalculated = React.useCallback((taskId: string, duration: number) => {
//     setCalculatedDurations(prev => ({
//       ...prev,
//       [taskId]: duration
//     }));
//   }, []);

//   // Helper function to check if a task is from today
//   const isToday = (date: string | Date | undefined): boolean => {
//     if (!date) return false;
//     const today = new Date();
//     const taskDate = new Date(date);
//     return taskDate.toDateString() === today.toDateString();
//   };

//   // Enhanced categorize tasks logic
//   const categorizedTasks = useMemo(() => {
//     const tasksAssignedToMe: Task[] = [];
//     const tasksIAssignedToOthers: Task[] = [];
//     const todaysTasks: Task[] = [];
//     const allUserTasks: Task[] = [];
//     const recurringTasks: Task[] = [];

//     console.log('=== ENHANCED ASSIGNMENT CATEGORIZATION DEBUG ===');
//     console.log('Current User Email:', userEmail);
//     console.log('Total Filtered Tasks:', filteredTasks.length);

//     const tasksToProcess = allTasks && allTasks.length > 0 ? allTasks : filteredTasks;
    
//     tasksToProcess.forEach((task: Task, index: number) => {
//       const taskDate = (task as any).createdAt || (task as any).startTime || 
//                       (task as any).created_at || (task as any).startDate || 
//                       (task as any).assignedAt || (task as any).assigned_at;
//       const isTaskToday = taskDate && isToday(taskDate);

//       const assignedBy = (task as any).assignedBy?.email || (task as any).assignedBy || 
//                         (task as any).assigned_by?.email || (task as any).assigned_by ||
//                         (task as any).createdBy?.email || (task as any).createdBy || 
//                         (task as any).created_by?.email || (task as any).created_by ||
//                         (task as any).assignedByEmail || (task as any).assignedByUser ||
//                         (task as any).creator?.email || (task as any).creator;

//       const assignedTo = (task as any).assignedToEmail || (task as any).assignedTo || 
//                         (task as any).assigned_to?.email || (task as any).assigned_to ||
//                         (task as any).assignedUser?.email || (task as any).assignedUser || 
//                         (task as any).assigned_user?.email || (task as any).assigned_user ||
//                         (task as any).assignee?.email || (task as any).assignee ||
//                         (task as any).targetUser?.email || (task as any).targetUser;

//       const taskOwner = task.userEmail || (task as any).user_email || 
//                        (task as any).owner?.email || (task as any).owner ||
//                        (task as any).userId || (task as any).user_id;

//       // For admin: include all tasks in allUserTasks
//       if (isAdmin) {
//         allUserTasks.push(task);
//       }

//       // Tasks Assigned to Me logic
//       const isAssignedToMe = (
//         (assignedTo && assignedTo === userEmail) ||
//         ((task as any).assignedToEmail === userEmail) ||
//         ((task as any).assignee === userEmail) ||
//         ((task as any).targetUser === userEmail) ||
//         (taskOwner === userEmail && (!assignedTo || assignedTo === userEmail)) ||
//         (assignedTasks?.some((at: any) => 
//           (at.taskId === task.taskId || at.id === task.taskId) && 
//           (at.assignedToEmail === userEmail || at.assignedTo === userEmail || 
//            at.userEmail === userEmail || at.targetUser === userEmail)
//         ))
//       );

//       const isAssignedToSomeoneElse = (
//         assignedTo && assignedTo !== userEmail && assignedTo !== taskOwner
//       );

//       if (isAssignedToMe && !isAssignedToSomeoneElse) {
//         tasksAssignedToMe.push(task);
//       }

//       // Tasks I Assigned to Others logic
//       const isAssignedByMe = (
//         (assignedBy === userEmail && assignedTo && assignedTo !== userEmail) ||
//         ((task as any).assignedByEmail === userEmail && assignedTo && assignedTo !== userEmail) ||
//         ((task as any).createdBy === userEmail && assignedTo && assignedTo !== userEmail) ||
//         (taskOwner === userEmail && assignedTo && assignedTo !== userEmail) ||
//         ((task as any).assignmentHistory && 
//          (task as any).assignmentHistory.some((ah: any) => 
//            ah.assignedBy === userEmail && ah.assignedTo !== userEmail
//          ))
//       );

//       if (isAssignedByMe) {
//         tasksIAssignedToOthers.push(task);
//       }

//       // Today's Tasks logic
//       if (isTaskToday) {
//         const isCurrentUserInvolvedToday = (
//           isAssignedToMe ||
//           isAssignedByMe ||
//           (taskOwner === userEmail && !assignedTo) ||
//           (task.activities && task.activities.some((activity: any) => {
//             const activityDate = activity.timestamp ? new Date(activity.timestamp) : null;
//             const isActivityToday = activityDate && isToday(activityDate);
//             const activityUser = activity.userEmail || activity.user_email || taskOwner;
//             return isActivityToday && activityUser === userEmail;
//           }))
//         );

//         if (isCurrentUserInvolvedToday) {
//           todaysTasks.push(task);
//         }
//       }

//       // Recurring Tasks
//       if ((task as any).isRecurring) {
//         recurringTasks.push(task);
//       }
//     });

//     // Remove duplicates from todaysTasks
//     const uniqueTodaysTasks = todaysTasks.filter((task, index, self) => 
//       index === self.findIndex(t => t.taskId === task.taskId)
//     );

//     return {
//       tasksAssignedToMe,
//       tasksIAssignedToOthers,
//       todaysTasks: uniqueTodaysTasks,
//       allUserTasks,
//       recurringTasks
//     };
//   }, [filteredTasks, allTasks, assignedTasks, userEmail, isAdmin, currentUser]);

//   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
//     setActiveTab(newValue);
//   };
// const calculateNextRun = (type: string): string => {
//   const now = new Date();
//   const nextRun = new Date(now);
  
//   switch (type) {
//     case 'daily':
//       nextRun.setDate(now.getDate() + 1);
//       break;
//     case 'weekly':
//       nextRun.setDate(now.getDate() + 7);
//       break;
//     case 'monthly':
//       nextRun.setMonth(now.getMonth() + 1);
//       break;
//     case 'custom':
//       nextRun.setDate(now.getDate() + 1); // Default to daily for custom
//       break;
//   }
  
//   return nextRun.toISOString();
// };
//   const loadAllTasks = async () => {
//     try {
//       console.log(`🔍 Loading tasks for user: ${currentUser.email} (Admin: ${isAdmin})`);
//       const response = await TaskService.getAllTasks();
//       if (response.success) {
//         console.log(`📊 Loaded ${response.data.length} tasks`);
//         setAllTasks(response.data);
//       }
//     } catch (error) {
//       console.error('Failed to load tasks:', error);
//     }
//   };

//   const loadAssignedTasks = async () => {
//     try {
//       const response = await TaskService.getAssignedTasks();
//       if (response.success) {
//         // Filter assigned tasks for current user (unless admin)
//         const filteredTasks = isAdmin ? 
//           response.data : 
//           response.data.filter((task: any) => task.assignedToEmail === currentUser.email);
        
//         console.log(`📋 Loaded ${filteredTasks.length} assigned tasks for ${currentUser.email}`);
//         setAssignedTasks(filteredTasks);
//       }
//     } catch (error) {
//       console.error('Failed to load assigned tasks:', error);
//     }
//   };
// const refreshTasks = async () => {
//   try {
//     await Promise.all([
//       loadAllTasks(),
//       loadAssignedTasks()
//     ]);
//   } catch (error) {
//     console.error('Error refreshing tasks:', error);
//   }
// };
// const getRecurringPattern = (type: string): string => {
//   switch (type) {
//     case 'daily':
//       return 'Every day at the same time';
//     case 'weekly':
//       return 'Every week on the same day';
//     case 'monthly':
//       return 'Every month on the same date';
//     case 'custom':
//       return 'Custom pattern (configure separately)';
//     default:
//       return 'Unknown pattern';
//   }
// };
//  const handleEditRecurring = (task: Task) => {
//   console.log('Edit recurring task:', task.taskName);
  
//   if (!(task as any).isRecurring) {
//     alert('This task is not set as recurring');
//     return;
//   }
  
//   const currentType = (task as any).recurringType || 'daily';
//   const newType = prompt(`Current: ${currentType}. Enter new recurring type (daily, weekly, monthly, custom):`, currentType);
  
//   if (newType && ['daily', 'weekly', 'monthly', 'custom'].includes(newType.toLowerCase())) {
//     const updatedTask = {
//       ...task,
//       recurringType: newType.toLowerCase() as 'daily' | 'weekly' | 'monthly' | 'custom',
//       nextRun: calculateNextRun(newType.toLowerCase()),
//       recurringPattern: getRecurringPattern(newType.toLowerCase())
//     };
    
//     onTableAction(updatedTask, 'start');
//     console.log(`Task "${task.taskName}" recurring updated to ${newType}`);
//   }
// };

// const handleDisableRecurring = (task: Task) => {
//   console.log('Disable recurring task:', task.taskName);
  
//   if (!(task as any).isRecurring) {
//     alert('This task is not set as recurring');
//     return;
//   }
  
//   if (confirm(`Are you sure you want to pause recurring for "${task.taskName}"?`)) {
//     const updatedTask = {
//       ...task,
//       recurringStatus: 'paused'
//     };
    
//     // onTableAction(updatedTask, 'start');
//     console.log(`Task "${task.taskName}" recurring paused`);
//   }
// };

// const handleDeleteRecurring = (task: Task) => {
//   console.log('Delete recurring task:', task.taskName);
  
//   if (!(task as any).isRecurring) {
//     alert('This task is not set as recurring');
//     return;
//   }
  
//   if (confirm(`Are you sure you want to remove recurring settings for "${task.taskName}"? This will not delete the task itself.`)) {
//     const updatedTask = {
//       ...task,
//       isRecurring: false,
//       recurringType: undefined,
//       recurringStatus: undefined,
//       recurringPattern: undefined,
//       recurringCount: undefined,
//       nextRun: undefined,
//       lastRun: undefined
//     };
    
//     onTableAction(updatedTask, 'start');
//     console.log(`Task "${task.taskName}" recurring settings removed`);
//   }
// };

// const handleToggleRecurring = (task: Task) => {
//   console.log('🔄 Toggle recurring for task:', task.taskName);
  
//   // Don't use prompt - use the RecurringDialog instead
//   // This prevents creating undefined tasks
//   const updatedTask: Task = {
//     ...task,
//     // Preserve all original task properties
//     taskId: task.taskId,
//     taskName: task.taskName,
//     type: task.type,
//     status: task.status,
//     userEmail: task.userEmail,
//     username: task.username,
//     totalDuration: task.totalDuration || 0,
//     activities: task.activities || []
//   };
  
//   // Don't call onTableAction here - let the RecurringDialog handle it
//   console.log(`Task "${task.taskName}" recurring dialog should open`);
// };

// // Update the recurring save handlers to prevent duplicates
// const handleRecurringSave = (task: Task, recurringSettings: any) => {
//   console.log('💾 Saving recurring settings for task:', task.taskName);
  
//   const updatedTask: Task = {
//     ...task, // Preserve all original properties
//     ...recurringSettings, // Apply recurring settings
//     // Ensure critical fields are not lost
//     taskId: task.taskId,
//     taskName: task.taskName,
//     userEmail: task.userEmail,
//     username: task.username
//   };
  
//   // Use a specific action that won't create duplicates
//   onTableAction(updatedTask, 'start');
//   console.log(`✅ Task "${task.taskName}" recurring settings updated`);
// };

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
//               Enhanced Task History
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
//             {isAdmin && (
//               <FormControlLabel
//                 control={
//                   <Switch
//                     checked={showAdminGroupedView}
//                     onChange={(e) => setShowAdminGroupedView(e.target.checked)}
//                     color="primary"
//                   />
//                 }
//                 label="Legacy View"
//               />
//             )}
//             <ExportControls
//               data={filteredTasks}
//               isAdmin={isAdmin}
//               formatTime={formatTime}
//               disabled={filteredTasks.length === 0}
//             />
//             <Button
//               variant="outlined"
//               startIcon={<Schedule />}
//               onClick={onToggleHistory}
//               size="small"
//             >
//               {showHistory ? 'Hide' : 'Show'} History
//             </Button>
//           </Box>
//         </Box>

//         <Collapse in={showHistory}>
//           {/* Filters */}
//           <FilterSection
//             tableFilters={tableFilters}
//             onFilterChange={onFilterChange}
//             isAdmin={isAdmin}
//           />

//           {/* Task Summary Alert */}
//           <Alert 
//             severity="info" 
//             icon={<NotificationsActive />}
//             sx={{ mb: 2 }}
//           >
//             <Typography variant="body2">
//               <strong>Task Overview:</strong> {categorizedTasks.tasksAssignedToMe.length} assigned to you, {' '}
//               {categorizedTasks.tasksIAssignedToOthers.length} you assigned to others, {' '}
//               {categorizedTasks.todaysTasks.length} today's tasks, {' '}
//               {categorizedTasks.recurringTasks.length} recurring tasks
//               {isAdmin && `, ${categorizedTasks.allUserTasks.length} total user tasks`}
//             </Typography>
//           </Alert>

//           {/* Enhanced Tabs */}
//           <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
//             <Tabs 
//               value={activeTab} 
//               onChange={handleTabChange} 
//               aria-label="enhanced task history tabs"
//               variant="scrollable"
//               scrollButtons="auto"
//             >
//               <Tab 
//                 icon={<Assignment />}
//                 label={
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <Typography variant="body2">Tasks Assigned to Me</Typography>
//                     <Chip 
//                       label={categorizedTasks.tasksAssignedToMe.length}
//                       size="small"
//                       color="primary"
//                       sx={{ minWidth: 24, height: 20, fontSize: '0.75rem', fontWeight: 600 }}
//                     />
//                   </Box>
//                 }
//               />
//               <Tab 
//                 icon={<AssignmentTurnedIn />}
//                 label={
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <Typography variant="body2">Tasks I Assigned</Typography>
//                     <Chip 
//                       label={categorizedTasks.tasksIAssignedToOthers.length}
//                       size="small"
//                       color="secondary"
//                       sx={{ minWidth: 24, height: 20, fontSize: '0.75rem', fontWeight: 600 }}
//                     />
//                   </Box>
//                 }
//               />
//                            <Tab 
//                 icon={<Today />}
//                 label={
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <Typography variant="body2">Today's Tasks</Typography>
//                     <Chip 
//                       label={categorizedTasks.todaysTasks.length}
//                       size="small"
//                       color="success"
//                       sx={{ minWidth: 24, height: 20, fontSize: '0.75rem', fontWeight: 600 }}
//                     />
//                   </Box>
//                 }
//               />
//               <Tab 
//                 icon={<Repeat />}
//                 label={
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <Typography variant="body2">Recurring Tasks</Typography>
//                     <Chip 
//                       label={categorizedTasks.recurringTasks.length}
//                       size="small"
//                       color="info"
//                       sx={{ minWidth: 24, height: 20, fontSize: '0.75rem', fontWeight: 600 }}
//                     />
//                   </Box>
//                 }
//               />
//               {isAdmin && (
//                 <Tab 
//                   icon={<ViewList />}
//                   label={
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       <Typography variant="body2">All User Tasks</Typography>
//                       <Chip 
//                         label={categorizedTasks.allUserTasks.length}
//                         size="small"
//                         color="warning"
//                         sx={{ minWidth: 24, height: 20, fontSize: '0.75rem', fontWeight: 600 }}
//                       />
//                     </Box>
//                   }
//                 />
//               )}
//             </Tabs>
//           </Box>

//           {/* Tab Panels */}
//           <TabPanel value={activeTab} index={0}>
//             <TasksAssignedToMe
//               tasks={categorizedTasks.tasksAssignedToMe}
//               formatTime={formatTime}
//               onTableAction={onTableAction}
//               isRunning={isRunning}
//               currentUser={currentUser}
//               calculatedDurations={calculatedDurations}
//               onDurationCalculated={handleDurationCalculated}
//               onToggleRecurring={handleToggleRecurring}
//             />
//           </TabPanel>

//           <TabPanel value={activeTab} index={1}>
//             <TasksIAssignedToOthers
//               tasks={categorizedTasks.tasksIAssignedToOthers}
//               formatTime={formatTime}
//               onTableAction={onTableAction}
//               isRunning={isRunning}
//               currentUser={currentUser}
//               calculatedDurations={calculatedDurations}
//               onDurationCalculated={handleDurationCalculated}
//               expandedRows={expandedRows}
//               onToggleRowExpansion={onToggleRowExpansion}
//               onToggleRecurring={handleToggleRecurring}
//             />
//           </TabPanel>

//           <TabPanel value={activeTab} index={2}>
//             <TodaysTasks
//               tasks={categorizedTasks.todaysTasks}
//               formatTime={formatTime}
//               onTableAction={onTableAction}
//               isRunning={isRunning}
//               currentUser={currentUser}
//               calculatedDurations={calculatedDurations}
//               onDurationCalculated={handleDurationCalculated}
//               onToggleRecurring={handleToggleRecurring}
//             />
//           </TabPanel>

//           <TabPanel value={activeTab} index={3}>
//             <RecurringTasks
//               tasks={categorizedTasks.recurringTasks}
//               formatTime={formatTime}
//               onTableAction={onTableAction}
//               isRunning={isRunning}
//               currentUser={currentUser}
//               calculatedDurations={calculatedDurations}
//               onDurationCalculated={handleDurationCalculated}
//               onEditRecurring={handleEditRecurring}
//               onDisableRecurring={handleDisableRecurring}
//               onDeleteRecurring={handleDeleteRecurring}
//               onRefresh={refreshTasks} 
//             />
//           </TabPanel>

//           {isAdmin && (
//             <TabPanel value={activeTab} index={4}>
//               <AllUserTasks
//                 tasks={categorizedTasks.allUserTasks}
//                 formatTime={formatTime}
//                 onTableAction={onTableAction}
//                 isRunning={isRunning}
//                 currentUser={currentUser}
//                 calculatedDurations={calculatedDurations}
//                 onDurationCalculated={handleDurationCalculated}
//                 expandedRows={expandedRows}
//                 onToggleRowExpansion={onToggleRowExpansion}
//                 onToggleRecurring={handleToggleRecurring}
//               />
//             </TabPanel>
//           )}
//         </Collapse>
//       </CardContent>
//     </Card>
//   );
// };

// export default TaskHistoryTableEnhanced;

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Collapse,
  Box,
  Chip,
  IconButton,
  Button,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Alert,
  Autocomplete,
  
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  History,
  Schedule,
  Assignment,
  AssignmentTurnedIn,
  Today,
  AdminPanelSettings,
  ViewList,
  Repeat,
  NotificationsActive,
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { TableFilters, Task, TaskHistoryTableProps } from '../types/TaskHistoryTypes';
import ExportControls from '../components/ExportControls';
import FilterSection from '../components/FilterSection';

import TaskService, { exportTaskLevelReport } from '../../../../services/taskService';
import RecurringTasks from './RecurringTask/RecurringTasks';
import TasksAssignedToMe from './TaskAssignedToMe/TasksAssignedToMe';
import TasksIAssignedToOthers from './TaskIAssignedToOthers/TasksIAssignedToOthers';
import AllUserTasks from './TodaysTask/AllUserTasks';
import TodaysTasks from './TodaysTask/TodaysTasks';
// import ApprovalTasks from './ApprovalTasks/ApprovalTasks';
// import AddTasksTable from './AddTask/AddTasksTable';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import TaskMappingTab from './taskmapping/TaskMappingTab';
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`enhanced-task-tabpanel-${index}`}
      aria-labelledby={`enhanced-task-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const TaskHistoryTableEnhanced: React.FC<TaskHistoryTableProps> = ({
  showHistory,
  onToggleHistory,
  filteredTasks,
  tableFilters,
  onFilterChange,
  tablePage,
  tableRowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  expandedRows,
  onToggleRowExpansion,
  formatTime,
  onTableAction,
  isRunning,
  currentUser,
  
  isAdmin = false,
  isActivityPage,
  
  onExportTaskLevelReport, // ✅ Add this prop
  ...otherProps
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [allTasks, setAllTasks] = React.useState<any[]>([]);
  const [calculatedDurations, setCalculatedDurations] = useState<Record<string, number>>({});
  const [showAdminGroupedView, setShowAdminGroupedView] = useState(false);
  const [assignedTasks, setAssignedTasks] = React.useState<any[]>([]);
const [estimatedTimeFilter, setEstimatedTimeFilter] = useState<string>('all');
const [approvalTasks, setApprovalTasks] = useState<Task[]>([]);
const [rejectedTasks, setRejectedTasks] = useState<Set<string>>(new Set());
const [approvedTasks, setApprovedTasks] = useState<Set<string>>(new Set());
const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
// Update the state declaration:
const [newTaskData, setNewTaskData] = useState({
  taskName: '',
  type: 'task' as 'task' | 'meeting',
  startDate: dayjs(), // Use dayjs() instead of new Date()
  endDate: dayjs().add(1, 'hour'), // Use dayjs().add() instead of new Date()
  description: ''
});
 const [tabValue, setTabValue] = useState(0);

  // const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
  //   setTabValue(newValue);
  // };

  const handleExportReport = async (userEmail: string) => {
    try {
      const result = await exportTaskLevelReport(userEmail);
      if (result.success) {
        console.log('✅ Report exported successfully');
      } else {
        console.error('❌ Failed to export report:', result.error);
      }
    } catch (error) {
      console.error('❌ Error exporting report:', error);
    }
  };

const [newTaskErrors, setNewTaskErrors] = useState<Record<string, string>>({});
  // Get current user email helper - Enhanced to match regular table
  const getCurrentUserEmail = () => {
    if (currentUser?.email) return currentUser.email;
    if (currentUser?.userEmail) return currentUser.userEmail;
    if (currentUser?.user?.email) return currentUser.user.email;
    
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.email || user.userEmail || user.user?.email;
      }
    } catch (error) {
      console.error('Error getting user email:', error);
    }
    
    try {
      const sessionUser = sessionStorage.getItem('currentUser') || sessionStorage.getItem('user');
      if (sessionUser) {
        const user = JSON.parse(sessionUser);
        return user.email || user.userEmail;
      }
    } catch (error) {
      console.error('Error getting session user email:', error);
    }
    
    return null;
  };

  const userEmail = getCurrentUserEmail();

  // Load tasks on component mount - Similar to regular table
  useEffect(() => {
    if (currentUser?.email) {
      loadAllTasks();
      loadAssignedTasks();
    }
  }, [currentUser?.email, isAdmin]);

  // Add callback to handle duration updates
  const handleDurationCalculated = React.useCallback((taskId: string, duration: number) => {
    setCalculatedDurations(prev => ({
      ...prev,
      [taskId]: duration
    }));
  }, []);

  // Helper function to check if a task is from today
  const isToday = (date: string | Date | undefined): boolean => {
    if (!date) return false;
    const today = new Date();
    const taskDate = new Date(date);
    return taskDate.toDateString() === today.toDateString();
  };
const getEstimatedTimeInMinutes = (task: any): number => {
  const estimatedTime = task.estimatedTime || 0;
  return typeof estimatedTime === 'string' ? 
    parseInt(estimatedTime) / 60 : 
    estimatedTime / 60;
};

// Add the same parsing function
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
      totalSeconds += parseInt(hourMatch[1]) * 3600;
    }

    // Parse minutes
    const minuteMatch = timeString.match(/(\d+)\s*(?:minute|min|m)s?/);
    if (minuteMatch) {
      totalSeconds += parseInt(minuteMatch[1]) * 60;
    }

    // Parse seconds
    const secondMatch = timeString.match(/(\d+)\s*(?:second|sec|s)s?/);
    if (secondMatch) {
      totalSeconds += parseInt(secondMatch[1]);
    }

    // Handle simple number formats
    if (totalSeconds === 0) {
      const numberMatch = timeString.match(/^(\d+)$/);
      if (numberMatch) {
        totalSeconds = parseInt(numberMatch[1]) * 60;
      }
    }

    return totalSeconds; // ✅ Always return a number
  } catch (error) {
    console.error('Error parsing estimated time:', estimatedTimeString, error);
    return 0; // ✅ Return 0 on error
  }
};


// Update the filterTasksByEstimatedTime function
const filterTasksByEstimatedTime = (tasks: Task[], filter: string): Task[] => {
  if (filter === 'all') return tasks;
  
  return tasks.filter(task => {
    const estimatedTimeRaw = (task as any).estimatedTime || (task as any).estimated_time || 0;
    const estimatedTimeInSeconds = parseEstimatedTimeToSeconds(estimatedTimeRaw);
    const minutes = estimatedTimeInSeconds / 60;
    
    switch (filter) {
      case 'under15':
        return minutes > 0 && minutes < 15; // Exclude 0 (not set)
      case '15to30':
        return minutes >= 15 && minutes < 30;
      case '30to60':
        return minutes >= 30 && minutes < 60;
      case 'over60':
        return minutes >= 60;
      default:
        return true;
    }
  });
};


// Add this filtering function before the categorizedTasks useMemo
const applyFilters = (tasks: Task[], filters: TableFilters): Task[] => {
  return tasks.filter(task => {
    // Task name filter
    if (filters.taskName && !task.taskName.toLowerCase().includes(filters.taskName.toLowerCase())) {
      return false;
    }

    // Username filter (for admin)
    if (filters.username && task.username && !task.username.toLowerCase().includes(filters.username.toLowerCase())) {
      return false;
    }

    // Type filter
    if (filters.type !== 'all' && task.type !== filters.type) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const taskDate = new Date((task as any).createdAt || (task as any).startTime || (task as any).created_at || (task as any).startDate);
      const now = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          if (!isToday(taskDate)) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (taskDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (taskDate < monthAgo) return false;
          break;
        case 'custom':
          if (filters.customStartDate && filters.customEndDate) {
            const startDate = new Date(filters.customStartDate);
            const endDate = new Date(filters.customEndDate);
            if (taskDate < startDate || taskDate > endDate) return false;
          }
          break;
      }
    }

    return true;
  });
};


// Complete categorizedTasks useMemo with better recurring task handling
const categorizedTasks = useMemo(() => {
  const filterApprovedTasks = (taskList: Task[]) => {
    return taskList.filter(task => 
      !approvedTasks.has(task.taskId) && 
      !rejectedTasks.has(task.taskId)
    );
  };
  
  const applyEstimatedTimeFilter = (tasks: Task[]) => 
    filterTasksByEstimatedTime(tasks, estimatedTimeFilter);
      
  const tasksAssignedToMe: Task[] = [];
  const tasksIAssignedToOthers: Task[] = [];
  const todaysTasks: Task[] = [];
  const allUserTasks: Task[] = [];
  const recurringTasks: Task[] = [];
  const approvalTasks: Task[] = [];
  
  console.log('=== ENHANCED ASSIGNMENT CATEGORIZATION DEBUG ===');
  console.log('Current User Email:', userEmail);
  console.log('Total Filtered Tasks:', filteredTasks.length);
  console.log('All Tasks Loaded:', allTasks.length);
  console.log('Assigned Tasks Loaded:', assignedTasks.length);

  // Combine all available tasks for better categorization
  const combinedTasks = [
    ...filteredTasks,
    ...allTasks,
    ...assignedTasks
  ].filter((task, index, self) => {
    // Remove duplicates by taskId
    const firstIndex = self.findIndex(t => t.taskId === task.taskId);
    return index === firstIndex;
  });

  console.log('Combined Tasks Before Filtering:', combinedTasks.length);

  // ✅ Apply table filters to combined tasks
  const tasksToProcess = applyFilters(combinedTasks, tableFilters);

  console.log('Total Tasks to Process After Filtering:', tasksToProcess.length);
    
  tasksToProcess.forEach((task: Task, index: number) => {
    const taskDate = (task as any).createdAt || (task as any).startTime || 
                    (task as any).created_at || (task as any).startDate || 
                    (task as any).assignedAt || (task as any).assigned_at;
    const isTaskToday = taskDate && isToday(taskDate);

    // Enhanced assignment detection
    const assignedBy = (task as any).assignedBy?.email || (task as any).assignedBy || 
                      (task as any).assigned_by?.email || (task as any).assigned_by ||
                      (task as any).createdBy?.email || (task as any).createdBy || 
                      (task as any).created_by?.email || (task as any).created_by ||
                      (task as any).assignedByEmail || (task as any).assignedByUser ||
                      (task as any).creator?.email || (task as any).creator ||
                      task.userEmail;

    const assignedTo = (task as any).assignedToEmail || (task as any).assignedTo || 
                      (task as any).assigned_to?.email || (task as any).assigned_to ||
                      (task as any).assignedUser?.email || (task as any).assignedUser || 
                      (task as any).assigned_user?.email || (task as any).assigned_user ||
                      (task as any).assignee?.email || (task as any).assignee ||
                      (task as any).targetUser?.email || (task as any).targetUser;

    const taskOwner = task.userEmail || (task as any).user_email || 
                     (task as any).owner?.email || (task as any).owner ||
                     (task as any).userId || (task as any).user_id;

    // For admin: include all tasks in allUserTasks
    if (isAdmin) {
      allUserTasks.push(task);
    }

    // ✅ FIXED: Enhanced Tasks Assigned to Me logic with better recurring task handling
    const isAssignedToMe = (
      (assignedTo && assignedTo === userEmail) ||
      ((task as any).assignedToEmail === userEmail) ||
      ((task as any).assignee === userEmail) ||
      ((task as any).targetUser === userEmail) ||
      (taskOwner === userEmail && (!assignedTo || assignedTo === userEmail))
    );

    const isAssignedToSomeoneElse = (
      assignedTo && assignedTo !== userEmail && assignedTo !== taskOwner
    );

    // ✅ CRITICAL FIX: Include recurring tasks assigned to me
    if (isAssignedToMe && !isAssignedToSomeoneElse) {
      const isRecurring = (task as any).isRecurring;
      
      console.log(`🔍 Checking task "${task.taskName}" for assignment:`, {
        isAssignedToMe,
        isRecurring,
        assignedTo,
        userEmail,
        taskOwner,
        status: task.status
      });
      
      // For recurring tasks, check if they're still active
      if (isRecurring) {
        const recurringStatus = (task as any).recurringStatus;
        const isRecurringActive = (
          !recurringStatus || 
          recurringStatus === 'active' || 
          recurringStatus === 'pending'
        );
        
        console.log(`🔄 Recurring task "${task.taskName}" check:`, {
          recurringStatus,
          isRecurringActive
        });
        
        if (isRecurringActive) {
          tasksAssignedToMe.push(task);
          console.log(`✅ Added recurring task "${task.taskName}" to tasksAssignedToMe`);
        }
      } else {
        // For non-recurring tasks, check completion status
        const isCompleted = task.status === 'ended' || 
                           (task as any).status === 'completed' ||
                           (task as any).isApproved ||
                           (task as any).status === 'approved';
        
        if (!isCompleted) {
          tasksAssignedToMe.push(task);
          console.log(`✅ Added regular task "${task.taskName}" to tasksAssignedToMe`);
        }
      }
    }

    // Rest of your categorization logic...
    // (Tasks I Assigned to Others, Today's Tasks, etc.)
        // ✅ Tasks I Assigned to Others logic - NOW AVAILABLE TO ALL USERS
    // Based on regular TaskHistoryTable pattern
    const isAssignedByMe = (
      // Direct assignment by current user
      (assignedBy === userEmail && assignedTo && assignedTo !== userEmail) ||
      ((task as any).assignedByEmail === userEmail && assignedTo && assignedTo !== userEmail) ||
      ((task as any).createdBy === userEmail && assignedTo && assignedTo !== userEmail) ||
     
      // Task owner assigned to someone else
      (taskOwner === userEmail && assignedTo && assignedTo !== userEmail) ||
     
      // Check assignment history
      ((task as any).assignmentHistory &&
       (task as any).assignmentHistory.some((ah: any) =>
         (ah.assignedBy === userEmail || ah.assignedByEmail === userEmail) &&
         ah.assignedTo !== userEmail
       )) ||
     
      // Check if task was created by user and has different assignee
      (task.userEmail === userEmail && assignedTo && assignedTo !== userEmail) ||
     
      // Check assigned tasks array for tasks assigned by current user
      (assignedTasks?.some((at: any) =>
        (at.taskId === task.taskId || at.id === task.taskId) &&
        (at.assignedByEmail === userEmail || at.assignedBy === userEmail) &&
        (at.assignedToEmail !== userEmail && at.assignedTo !== userEmail)
      ))
    );


    if (isAssignedByMe) {
      tasksIAssignedToOthers.push(task);
      console.log(`✅ Task "${task.taskName}" assigned by ${userEmail} to ${assignedTo}`);
    }


    // Today's Tasks logic (available to all users)
    if (isTaskToday) {
      const isCurrentUserInvolvedToday = (
        isAssignedToMe ||
        isAssignedByMe ||
        (taskOwner === userEmail && !assignedTo) ||
        (task.activities && task.activities.some((activity: any) => {
          const activityDate = activity.timestamp ? new Date(activity.timestamp) : null;
          const isActivityToday = activityDate && isToday(activityDate);
          const activityUser = activity.userEmail || activity.user_email || taskOwner;
          return isActivityToday && activityUser === userEmail;
        }))
      );


      if (isCurrentUserInvolvedToday) {
        todaysTasks.push(task);
      }
    }
    // ✅ Recurring Tasks categorization
    if ((task as any).isRecurring) {
      recurringTasks.push(task);
      console.log(`🔄 Added "${task.taskName}" to recurringTasks`);
    }
  });

  // Remove duplicates and apply filters
  const result = {
    tasksAssignedToMe: applyEstimatedTimeFilter(
      filterApprovedTasks(
        tasksAssignedToMe.filter((task, index, self) => 
          index === self.findIndex(t => t.taskId === task.taskId)
        )
      )
    ),
    tasksIAssignedToOthers: applyEstimatedTimeFilter(
      filterApprovedTasks(
        tasksIAssignedToOthers.filter((task, index, self) => 
          index === self.findIndex(t => t.taskId === task.taskId)
        )
      )
    ),
    todaysTasks: applyEstimatedTimeFilter(
      todaysTasks.filter((task, index, self) => 
        index === self.findIndex(t => t.taskId === task.taskId)
      )
    ),
    allUserTasks: applyEstimatedTimeFilter(
      allUserTasks.filter((task, index, self) => 
        index === self.findIndex(t => t.taskId === task.taskId)
      )
    ),
    recurringTasks: applyEstimatedTimeFilter(
      recurringTasks.filter((task, index, self) => 
        index === self.findIndex(t => t.taskId === task.taskId)
      )
    ),
    approvalTasks: applyEstimatedTimeFilter(
      approvalTasks.filter((task, index, self) => 
        index === self.findIndex(t => t.taskId === task.taskId)
      )
    )
  };

  console.log('📊 FINAL CATEGORIZATION RESULTS:', {
    tasksAssignedToMe: result.tasksAssignedToMe.length,
    tasksIAssignedToOthers: result.tasksIAssignedToOthers.length,
    todaysTasks: result.todaysTasks.length,
    allUserTasks: result.allUserTasks.length,
    recurringTasks: result.recurringTasks.length,
    approvalTasks: result.approvalTasks.length
  });

  // ✅ Debug: Show what's in tasksAssignedToMe
  console.log('📋 Tasks Assigned to Me (final):');
  result.tasksAssignedToMe.forEach((task, index) => {
    console.log(`${index + 1}. "${task.taskName}" - Recurring: ${(task as any).isRecurring}, Status: ${task.status}`);
  });

  return result;
}, [filteredTasks, allTasks, assignedTasks, userEmail, isAdmin, currentUser, tableFilters, estimatedTimeFilter, approvedTasks, rejectedTasks]);

// Add this function with your other handlers
const handleCreateTaskFromTable = async (taskData: any) => {
  try {
    console.log('🚀 Creating task from table:', taskData);
    
    // Convert the task data to match your onTableAction format
    const newTask: Task = {
      taskId: taskData.taskId,
      taskName: taskData.taskName,
      type: taskData.type,
      status: taskData.status,
      userEmail: taskData.userEmail,
      username: taskData.username,
      totalDuration: taskData.totalDuration,
      activities: taskData.activities || [],
      startDate: taskData.startDate,
      endDate: taskData.endDate,
      createdAt: taskData.createdAt,
      createdBy: taskData.createdBy
    };

    // Call your existing onTableAction or create a new task via API
    onTableAction(newTask, 'start');
    
    // Refresh tasks
    await refreshTasks();
    
    console.log(`Task "${taskData.taskName}" created successfully`);
  } catch (error) {
    console.error('❌ Error creating task from table:', error);
    throw error;
  }
};

const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
  console.log('🔄 Tab clicked! New value:', newValue);
  console.log('🔄 Previous activeTab:', activeTab);
  setActiveTab(newValue);
};


  const calculateNextRun = (type: string): string => {
    const now = new Date();
    const nextRun = new Date(now);
    
    switch (type) {
      case 'daily':
        nextRun.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(now.getMonth() + 1);
        break;
      case 'custom':
        nextRun.setDate(now.getDate() + 1);
        break;
    }
    
    return nextRun.toISOString();
  };
// const handleApproveTask = async (task: any, comments?: string) => {
//   try {
//     const response = await TaskService.approveTask(task.taskId, comments);
//     if (response.success) {
//       setAlarmNotification(`✅ Task "${task.taskName}" approved successfully!`);
//       loadAllTasks();
//       loadAssignedTasks();
//     }
//   } catch (error) {
//     dispatch({ type: 'SET_ERROR', payload: 'Failed to approve task' });
//   }
// };

// const handleRejectTask = async (task: any, reason?: string) => {
//   try {
//     const response = await TaskService.rejectTask(task.taskId, reason);
//     if (response.success) {
//       setAlarmNotification(`❌ Task "${task.taskName}" rejected.`);
//       loadAllTasks();
//       loadAssignedTasks();
//     }
//   } catch (error) {
//     dispatch({ type: 'SET_ERROR', payload: 'Failed to reject task' });
//   }
// };

  const loadAllTasks = async () => {
    try {
      console.log(`🔍 Loading all tasks for user: ${currentUser?.email} (Admin: ${isAdmin})`);
      const response = await TaskService.getAllTasks();
      if (response.success) {
        console.log(`📊 Loaded ${response.data.length} total tasks`);
        setAllTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to load all tasks:', error);
    }
  };

  // Fix the loadAssignedTasks function
const loadAssignedTasks = async () => {
  try {
    if (userEmail) {
      const response = await TaskService.getAssignedTasks(userEmail); // Pass userEmail parameter
      if (response.success && response.data) {
        setAssignedTasks(response.data);
      }
    }
  } catch (error) {
    console.error('Error loading assigned tasks:', error);
  }
};

const refreshTasks = useCallback(async () => {
  try {
    console.log('🔄 TaskHistoryTableEnhanced: Starting comprehensive task refresh...');
    
    // Set loading state if you have one
    // setIsLoading(true);
    
    // Refresh all task data sources
    await Promise.all([
      loadAllTasks(),
      loadAssignedTasks(),
      // Add any other task loading functions you have
    ]);
    
    console.log('✅ TaskHistoryTableEnhanced: All tasks refreshed successfully');
    
    // Force re-categorization by updating a dependency
    setCalculatedDurations(prev => ({ ...prev, _refresh: Date.now() }));
    
  } catch (error) {
    console.error('❌ TaskHistoryTableEnhanced: Error refreshing tasks:', error);
  } finally {
    // setIsLoading(false);
  }
}, [loadAllTasks, loadAssignedTasks]);

   const getRecurringPattern = (type: string): string => {
    switch (type) {
      case 'daily':
        return 'Every day at the same time';
      case 'weekly':
        return 'Every week on the same day';
      case 'monthly':
        return 'Every month on the same date';
      case 'custom':
        return 'Custom pattern (configure separately)';
      default:
        return 'Unknown pattern';
    }
  };
// Add these utility functions before the main component
const executeTask = async (task: any) => {
  // Implementation for executing a task
  console.log('Executing task:', task.taskName);
  // Add your task execution logic here
};

const updateTaskInDatabase = async (task: any) => {
  // Implementation for updating task in database
  console.log('Updating task in database:', task.taskName);
  // Add your database update logic here
};

const loadTasks = async () => {
  // Implementation for loading tasks
  console.log('Loading tasks...');
  await Promise.all([
    loadAllTasks(),
    loadAssignedTasks()
  ]);
};

// Update the existing utility functions to be properly exported
const updateTaskNextRunDate = (task: any): any => {
  try {
    const recurringConfig = task.recurringOptions || task.recurringPattern || {};
    const recurringType = task.recurringType || recurringConfig.repeatInterval || 'daily';
    
    const baseDate = task.lastRun ? new Date(task.lastRun) : new Date();
    let nextDate = new Date(baseDate);
    
    switch (recurringType.toLowerCase()) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      default:
        nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return {
      ...task,
      nextRun: nextDate.toISOString(),
      recurringOptions: {
        ...recurringConfig,
        nextRunDate: nextDate,
        lastCalculated: new Date()
      },
    //    approvalTasks: applyEstimatedTimeFilter(
    //   approvalTasks.filter((task, index, self) => 
    //     index === self.findIndex(t => t.taskId === task.taskId)
    //   )
    // )
      
    };
  } catch (error) {
    console.error('Error updating next run date:', error);
    return task;
  }
};

const isTaskOverdue = (task: any): boolean => {
  try {
    const nextRun = task.nextRun || task.recurringOptions?.nextRunDate;
    if (!nextRun) return false;
    
    const nextRunDate = new Date(nextRun);
    return nextRunDate < new Date();
  } catch (error) {
    return false;
  }
};

// When a recurring task is executed, update the next run date
const handleRecurringTaskExecution = async (task: any) => {
  try {
    // Execute the task
    await executeTask(task);
    
    // Update the task with new next run date
    const updatedTask = updateTaskNextRunDate({
      ...task,
      lastRun: new Date().toISOString(),
      recurringCount: (task.recurringCount || 0) + 1
    });
    
    // Update in your state/database
    await updateTaskInDatabase(updatedTask);
    
    // Refresh the tasks list
    await loadTasks();
    
  } catch (error) {
    console.error('Error executing recurring task:', error);
  }
};

// Add this helper function to validate and convert status
const getValidTaskStatus = (status: any): "started" | "paused" | "resumed" | "ended" => {
  const validStatuses = ["started", "paused", "resumed", "ended"];
  if (validStatuses.includes(status)) {
    return status as "started" | "paused" | "resumed" | "ended";
  }
  return "paused"; // Default fallback
};

// Then use it in your conversions:
const convertRecurringTaskToTask = (task: any): Task => ({
  taskId: task.taskId,
  taskName: task.taskName,
  type: task.type as "task" | "meeting",
  status: (task.status as "started" | "paused" | "resumed" | "ended") || "paused", // Ensure valid status
  userEmail: task.userEmail,
  username: task.username,
  totalDuration: task.totalDuration || 0,
  activities: task.activities || [],
  ...(task.createdAt && { 
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt 
  }),
});


  const handleEditRecurring = (task: Task) => {
    console.log('Edit recurring task:', task.taskName);
    
    if (!(task as any).isRecurring) {
      alert('This task is not set as recurring');
      return;
    }
    
    const currentType = (task as any).recurringType || 'daily';
    const newType = prompt(`Current: ${currentType}. Enter new recurring type (daily, weekly, monthly, custom):`, currentType);
    
    if (newType && ['daily', 'weekly', 'monthly', 'custom'].includes(newType.toLowerCase())) {
      const updatedTask = {
        ...task,
        recurringType: newType.toLowerCase() as 'daily' | 'weekly' | 'monthly' | 'custom',
        nextRun: calculateNextRun(newType.toLowerCase()),
        recurringPattern: getRecurringPattern(newType.toLowerCase())
      };
      
      onTableAction(updatedTask, 'start');
      console.log(`Task "${task.taskName}" recurring updated to ${newType}`);
    }
  };

  const handleDisableRecurring = (task: Task) => {
    console.log('Disable recurring task:', task.taskName);
    
    if (!(task as any).isRecurring) {
      alert('This task is not set as recurring');
      return;
    }
    
    if (confirm(`Are you sure you want to pause recurring for "${task.taskName}"?`)) {
      const updatedTask = {
        ...task,
        recurringStatus: 'paused'
      };
      
      console.log(`Task "${task.taskName}" recurring paused`);
    }
  };
const getUniqueTaskNames = () => {
  const combinedTasks = [
    ...filteredTasks,
    ...allTasks,
    ...assignedTasks
  ];
  const taskNames = combinedTasks.map(task => task.taskName);
  return [...new Set(taskNames)].filter(name => name && name.trim().length > 0);
};
  const handleDeleteRecurring = (task: Task) => {
    console.log('Delete recurring task:', task.taskName);
    
    if (!(task as any).isRecurring) {
      alert('This task is not set as recurring');
      return;
    }
    
    if (confirm(`Are you sure you want to remove recurring settings for "${task.taskName}"? This will not delete the task itself.`)) {
      const updatedTask = {
        ...task,
        isRecurring: false,
        recurringType: undefined,
        recurringStatus: undefined,
        recurringPattern: undefined,
        recurringCount: undefined,
        nextRun: undefined,
        lastRun: undefined
      };
      
      onTableAction(updatedTask, 'start');
      console.log(`Task "${task.taskName}" recurring settings removed`);
    }
  };

  const handleToggleRecurring = (task: Task) => {
    console.log('🔄 Toggle recurring for task:', task.taskName);
    
    const updatedTask: Task = {
      ...task,
      taskId: task.taskId,
      taskName: task.taskName,
      type: task.type,
      status: task.status,
      userEmail: task.userEmail,
      username: task.username,
      totalDuration: task.totalDuration || 0,
      activities: task.activities || []
    };
    
    console.log(`Task "${task.taskName}" recurring dialog should open`);
  };

  const handleRecurringSave = (task: Task, recurringSettings: any) => {
    console.log('💾 Saving recurring settings for task:', task.taskName);
    
    const updatedTask: Task = {
      ...task,
      ...recurringSettings,
      taskId: task.taskId,
      taskName: task.taskName,
      userEmail: task.userEmail,
      username: task.username
    };
    
    onTableAction(updatedTask, 'start');
    console.log(`✅ Task "${task.taskName}" recurring settings updated`);
  };
// Fix the approval handlers with proper status types
const handleApproveTask = async (task: Task) => {
  try {
    console.log('🚀 Approving task:', task.taskName);
    
    // ✅ Immediately update local state for instant UI feedback
    setApprovedTasks(prev => new Set([...prev, task.taskId]));
    
    // Call the approval API
    const result = await TaskService.approveTask(task.taskId, userEmail || '', '');
    
    if (result.success) {
      console.log('✅ Task approved successfully:', task.taskName);
      
      // Refresh all task data
      await refreshTasks();
    } else {
      console.error('❌ Failed to approve task:', result.error);
      // ✅ Revert local state if API call failed
      setApprovedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.taskId);
        return newSet;
      });
    }
  } catch (error) {
    console.error('❌ Error approving task:', error);
    // ✅ Revert local state if error occurred
    setApprovedTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(task.taskId);
      return newSet;
    });
  }
};
// Add this useEffect to watch for task updates
useEffect(() => {
  console.log('📊 Task data changed, updating categorized tasks...');
  // This will trigger re-categorization when allTasks or assignedTasks change
}, [allTasks, assignedTasks]);

// Also add this to handle active tab changes
useEffect(() => {
  if (activeTab === 1 || activeTab === 2) {
    console.log(`🔄 Switched to tab ${activeTab}, refreshing tasks...`);
    setTimeout(() => {
      refreshTasks();
    }, 100);
  }
}, [activeTab, refreshTasks]);

// Add this useEffect to watch for new tasks
useEffect(() => {
  // Auto-refresh when activeTab changes to Today's Tasks
  if (activeTab === 2) {
    console.log('🔄 Today\'s Tasks tab activated, refreshing...');
    setTimeout(() => {
      refreshTasks();
    }, 300);
  }
}, [activeTab]);

// Also add this to watch for task changes
useEffect(() => {
  // Refresh categorized tasks when allTasks or assignedTasks change
  console.log('📊 Task data updated, recategorizing...');
}, [allTasks, assignedTasks, filteredTasks]);

// Add this function with your other handlers
// Update the handleCreateNewTask function:
const handleCreateNewTask = async () => {
  try {
    console.log('🚀 Creating new task with data:', newTaskData);

    // Clear previous errors
    setNewTaskErrors({});

    // Validation
    const errors: Record<string, string> = {};
    
    if (!newTaskData.taskName.trim()) {
      errors.taskName = 'Task name is required';
    }
    
    if (newTaskData.endDate.isBefore(newTaskData.startDate)) {
      errors.endDate = 'End time must be after start time';
    }
    
    if (Object.keys(errors).length > 0) {
      setNewTaskErrors(errors);
      return;
    }

    // Calculate duration in seconds using dayjs
    const duration = newTaskData.endDate.diff(newTaskData.startDate, 'second');

    // Create task data
    const taskData = {
      taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskName: newTaskData.taskName.trim(),
      type: newTaskData.type,
      status: 'ended', // This will be a completed task
      description: newTaskData.description,
      startDate: newTaskData.startDate.toISOString(),
      endDate: newTaskData.endDate.toISOString(),
      totalDuration: duration,
      userEmail: currentUser?.email || userEmail,
      username: currentUser?.username || currentUser?.email?.split('@')[0] || 'Unknown',
      activities: [
        {
          action: 'started',
          timestamp: newTaskData.startDate.toISOString(),
          duration: 0
        },
        {
          action: 'ended',
          timestamp: newTaskData.endDate.toISOString(),
          duration: duration
        }
      ]
    };

    console.log('📡 Sending task data:', taskData);

    // Try different API endpoints
    let response;
    
    try {
      // First try the createCompletedTask endpoint
      response = await TaskService.createCompletedTask(taskData);
    } catch (error) {
      console.log('⚠️ createCompletedTask failed, trying regular task creation...');
      
      // Fallback to regular task creation
      const regularTaskData = {
        ...taskData,
        status: 'started' // Start as regular task
      };
      
      // Create task using onTableAction (this should work with existing flow)
      const newTask: Task = {
        taskId: regularTaskData.taskId,
        taskName: regularTaskData.taskName,
        type: regularTaskData.type as "task" | "meeting",
        status: 'ended' as "started" | "paused" | "resumed" | "ended",
        userEmail: regularTaskData.userEmail,
        username: regularTaskData.username,
        totalDuration: regularTaskData.totalDuration,
        activities: regularTaskData.activities || []
      };
      
      // Use the existing onTableAction to create the task
      onTableAction(newTask, 'start');
      
      // Then immediately end it to mark as completed
      setTimeout(() => {
        onTableAction({ ...newTask, status: 'ended' }, 'stop');
      }, 100);
      
      response = { success: true, data: newTask };
    }
    
    if (response && response.success) {
      console.log('✅ Task created successfully:', response.data);
      
      // Refresh tasks
      await refreshTasks();
      
      // Close dialog and reset form
      setShowNewTaskDialog(false);
      setNewTaskData({
        taskName: '',
        type: 'task',
        startDate: dayjs(),
        endDate: dayjs().add(1, 'hour'),
        description: ''
      });
      setNewTaskErrors({});
      
      console.log(`✅ Task "${taskData.taskName}" created successfully`);
        // Switch to Today's Tasks tab automatically if the created task is for today
      const isTaskForToday = newTaskData.startDate.isSame(dayjs(), 'day');
      if (isTaskForToday) {
        console.log('🔄 Switching to Today\'s Tasks tab');
        setActiveTab(2); // Today's Tasks is index 2
      }
      
      console.log(`✅ Task "${taskData.taskName}" created successfully`);
    } else {
      throw new Error(response?.message || 'Failed to create task');
    }
    
  } catch (error: any) {
    console.error('❌ Error creating task:', error);
    setNewTaskErrors({ 
      general: error.response?.data?.message || error.message || 'Failed to create task. Please try again.' 
    });
  }
};




const handleRejectTask = async (task: Task) => {
  try {
    // Instead of using onTableAction with 'reject', handle rejection directly
    const result = await TaskService.rejectTask(task.taskId, userEmail || '', '');
    if (result.success) {
      // Refresh tasks or update state
      await refreshTasks();
      console.log('Task rejected successfully');
    } else {
      console.error('Failed to reject task:', result.error);
    }
  } catch (error) {
    console.error('Error rejecting task:', error);
  }
};
// const handleTaskUpdate = () => {
//   // Refresh the task list
//   fetchTasks(); // or whatever method you use to refresh tasks
// };

<Alert 
  severity="info" 
  icon={<NotificationsActive />}
  sx={{ mb: 2 }}
>
  <Typography variant="body2">
    <strong>Task Overview ({userEmail}):</strong> {' '}
    {categorizedTasks.tasksAssignedToMe.length} assigned to you, {' '}
    <strong>{categorizedTasks.tasksIAssignedToOthers.length} you assigned to others</strong>, {' '}
    {categorizedTasks.todaysTasks.length} today's tasks, {' '}
    {categorizedTasks.recurringTasks.length} recurring tasks, {' '}
    {categorizedTasks.approvalTasks.length} pending approval
    {isAdmin && `, ${categorizedTasks.allUserTasks.length} total user tasks`}
  </Typography>
</Alert>
  return (
    <Card variant="outlined" sx={{ mt: 2, width: '100%', maxWidth: 'none', minWidth: 1200 }}>
      <CardContent sx={{ pb: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={onToggleHistory}>
              {showHistory ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
            <History color="primary" />
            <Typography variant="h6">
              Enhanced Task History
            </Typography>
            {isAdmin && (
              <Chip 
                icon={<AdminPanelSettings />}
                label="Admin View" 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* {isAdmin && (
              <FormControlLabel
                control={
                  <Switch
                    checked={showAdminGroupedView}
                    onChange={(e) => setShowAdminGroupedView(e.target.checked)}
                    color="primary"
                  />
                }
                label="Legacy View"
              />
            )} */}
              <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() => setShowNewTaskDialog(true)}
    color="success"
    size="small"
  >
    Log Task
  </Button>
            <ExportControls
              data={filteredTasks}
              isAdmin={isAdmin}
              formatTime={formatTime}
              disabled={filteredTasks.length === 0}
            />
            {/* <Button
              variant="outlined"
              startIcon={<Schedule />}
              onClick={onToggleHistory}
              size="small"
            >
              {showHistory ? 'Hide' : 'Show'} History
            </Button> */}
          </Box>
        </Box>

        <Collapse in={showHistory}>
          {/* Filters */}
          <FilterSection
            tableFilters={tableFilters}
            onFilterChange={onFilterChange}
            isAdmin={isAdmin}

              estimatedTimeFilter={estimatedTimeFilter}
  onEstimatedTimeFilterChange={setEstimatedTimeFilter}
          />

          {/* Task Summary Alert - Updated to show for all users */}
          <Alert 
            severity="info" 
            icon={<NotificationsActive />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              <strong>Task Overview ({userEmail}):</strong> {' '}
              {categorizedTasks.tasksAssignedToMe.length} assigned to you, {' '}
              <strong>{categorizedTasks.tasksIAssignedToOthers.length} you assigned to others</strong>, {' '}
              {categorizedTasks.todaysTasks.length} today's tasks, {' '}
              {categorizedTasks.recurringTasks.length} recurring tasks
              {isAdmin && `, ${categorizedTasks.allUserTasks.length} total user tasks`}
            </Typography>
          </Alert>

          {/* Enhanced Tabs - "Tasks I Assigned to Others" NOW AVAILABLE TO ALL USERS */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="enhanced task history tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              {/* Tab 0: Tasks Assigned to Me - Available to all users */}
              <Tab 
                icon={<Assignment />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Tasks Assigned to Me</Typography>
                    <Chip 
                      label={categorizedTasks.tasksAssignedToMe.length}
                      size="small"
                      color="primary"
                      sx={{ minWidth: 24, height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                    />
                  </Box>
                }
              />
              
              {/* Tab 1: Tasks I Assigned to Others - ✅ NOW AVAILABLE TO ALL USERS */}
              <Tab 
                icon={<AssignmentTurnedIn />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Tasks I Assigned</Typography>
                    <Chip 
                      label={categorizedTasks.tasksIAssignedToOthers.length}
                      size="small"
                      color="secondary"
                      sx={{ minWidth: 24, height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                    />
                  </Box>
                }
              />
              
              {/* Tab 2: Today's Tasks - Available to all users */}
              <Tab 
                icon={<Today />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Today's Tasks</Typography>
                    <Chip 
                      label={categorizedTasks.todaysTasks.length}
                      size="small"
                      color="success"
                      sx={{ minWidth: 24, height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                    />
                  </Box>
                }
              />
              
              {/* Tab 3: Recurring Tasks - Available to all users */}
              <Tab 
                icon={<Repeat />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Recurring Tasks</Typography>
                    <Chip 
                      label={categorizedTasks.recurringTasks.length}
                      size="small"
                      color="info"
                      sx={{ minWidth: 24, height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                    />
                  </Box>
                }
              />
              {/* <Tab 
  icon={<Assignment />}
  label={
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2">Pending Approval</Typography>
      <Chip 
        label={categorizedTasks.approvalTasks.length}
        size="small"
        color="warning"
        sx={{ minWidth: 24, height: 20, fontSize: '0.75rem', fontWeight: 600 }}
      />
    </Box>
  }
/> */}

 


              {/* Tab 4: All User Tasks - Only for Admin */}
              {isAdmin && (
                <Tab 
                  icon={<ViewList />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">All User Tasks</Typography>
                      <Chip 
                        label={categorizedTasks.allUserTasks.length}
                        size="small"
                        color="warning"
                        sx={{ minWidth: 24, height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                      />
                    </Box>
                  }
                />
              )}
  
            <Tab 
  icon={<ViewList />}
  label={
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2">Task Level Mapping</Typography>
      <Chip label="New" size="small" color="warning" />
    </Box>
  }
/>

            </Tabs>
           
          </Box>

          {/* Tab Panels */}
          <TabPanel value={activeTab} index={0}>
            <TasksAssignedToMe
              tasks={categorizedTasks.tasksAssignedToMe}
              formatTime={formatTime}
              onTableAction={onTableAction}
              isRunning={isRunning}
              currentUser={currentUser}
              calculatedDurations={calculatedDurations}
              onDurationCalculated={handleDurationCalculated}
              onToggleRecurring={handleToggleRecurring}
               onRefreshTasks={refreshTasks}
            />
          </TabPanel>

          {/* ✅ Tab 1: Tasks I Assigned to Others - NOW AVAILABLE TO ALL USERS */}
          {/* <TabPanel value={activeTab} index={1}>
            <TasksIAssignedToOthers
              tasks={categorizedTasks.tasksIAssignedToOthers}
              formatTime={formatTime}
              onTableAction={onTableAction}
              isRunning={isRunning}
              currentUser={currentUser}
              calculatedDurations={calculatedDurations}
              onDurationCalculated={handleDurationCalculated}
              expandedRows={expandedRows}
              onToggleRowExpansion={onToggleRowExpansion}
              onToggleRecurring={handleToggleRecurring}
               onApproveTask={handleApproveTask}
  onRejectTask={handleRejectTask}
   onTaskUpdate={handleTaskUpdate} 
            />
          </TabPanel> */}
        

<TabPanel value={activeTab} index={1}>
  <TasksIAssignedToOthers
    tasks={categorizedTasks.tasksIAssignedToOthers}
    formatTime={formatTime}
    onTableAction={onTableAction}
    isRunning={isRunning}
    currentUser={currentUser}
    calculatedDurations={calculatedDurations}
    onDurationCalculated={handleDurationCalculated}
    expandedRows={expandedRows}
    onToggleRowExpansion={onToggleRowExpansion}
    onToggleRecurring={handleToggleRecurring}
     onRefreshTasks={refreshTasks}
    onApproveTask={(task, comments) => {
      console.log('✅ Task approved:', task.taskName, comments);
      // Refresh tasks after approval
      refreshTasks(); // ✅ Use refreshTasks instead of fetchTasks
    }}
    onRejectTask={(task, reason) => {
      console.log('❌ Task rejected:', task.taskName, reason);
      // Refresh tasks after rejection
      refreshTasks(); // ✅ Use refreshTasks instead of fetchTasks
    }}
    onTaskUpdate={refreshTasks} // ✅ Pass refreshTasks as the callback
  />
</TabPanel>

          <TabPanel value={activeTab} index={2}>
            <TodaysTasks
              tasks={categorizedTasks.todaysTasks}
              formatTime={formatTime}
              onTableAction={onTableAction}
              isRunning={isRunning}
              currentUser={currentUser}
              calculatedDurations={calculatedDurations}
              onDurationCalculated={handleDurationCalculated}
              onToggleRecurring={handleToggleRecurring}
              onRefreshTasks={refreshTasks}
            />
          </TabPanel>

<TabPanel value={activeTab} index={3}>
  <RecurringTasks
  
    tasks={categorizedTasks.recurringTasks.map(task => ({
      ...task,
      type: (task.type === 'meeting' ? 'meeting' : 'task') as "task" | "meeting",
      status: (['started', 'paused', 'resumed', 'ended'].includes(task.status) 
        ? task.status 
        : 'ended') as "started" | "paused" | "resumed" | "ended",
      createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
      updatedAt: new Date(),
      isRecurring: (task as any).isRecurring || true,
      recurringType: (task as any).recurringType || 'daily',
      recurringStatus: (task as any).recurringStatus || 'active',
      recurringOptions: (task as any).recurringOptions || {},
      recurringCount: (task as any).recurringCount || 0,
      nextRun: (task as any).nextRun,
      lastRun: (task as any).lastRun,
    }))}
    formatTime={formatTime}
    onTableAction={(recurringTask, action) => {
    console.log('🎯 RecurringTasks onTableAction:', { 
      taskName: recurringTask.taskName, 
      action, 
      taskId: recurringTask.taskId,
    });
    
    // Check if this task exists in the categorized tasks (which come from filteredTasks)
    const existingTaskInAssigned = categorizedTasks.tasksAssignedToMe.find(t => t.taskId === recurringTask.taskId);
    const existingTaskInAll = filteredTasks.find(t => t.taskId === recurringTask.taskId);
    
    let convertedTask: Task;
    
    if (existingTaskInAssigned || existingTaskInAll) {
      // Update existing task
      console.log('🔄 Updating existing task');
      const baseTask = existingTaskInAssigned || existingTaskInAll;
      
      // Add null check for baseTask
      if (!baseTask) {
        console.error('❌ Base task is undefined, creating new task instead');
        // Fall through to create new task
      } else {
        convertedTask = {
          ...baseTask, // Keep existing task data
          status: action === 'start' ? 'started' : 
                  action === 'resume' ? 'resumed' : 
                  action === 'stop' ? 'ended' : baseTask.status,
          // Update timing fields based on action
          ...(action === 'start' && { 
            startTime: new Date().toISOString(),
          }),
          ...(action === 'resume' && { 
            resumedAt: new Date().toISOString()
          }),
          ...(action === 'stop' && { 
            endTime: new Date().toISOString()
          }),
          // Ensure all required fields are present
          taskId: baseTask.taskId,
          taskName: baseTask.taskName,
          id: baseTask.taskId,
          userEmail: baseTask.userEmail,
          username: baseTask.username,
          assignedToEmail: baseTask.assignedToEmail,
          assignedTo: baseTask.assignedTo,
          totalDuration: baseTask.totalDuration || 0,
          elapsedTime: baseTask.elapsedTime || baseTask.totalDuration || 0,
          activities: baseTask.activities || [],
        };
        
        console.log('✅ Final converted task:', convertedTask);
        
        // Call the original onTableAction (this should handle the task management in parent)
        onTableAction(convertedTask, action);
        return; // Exit early after handling existing task
      }
    }
    
    // Create new task if it doesn't exist OR if baseTask was undefined
    console.log('➕ Creating new task from recurring');
    
    // Extract status determination
    let taskStatus: "started" | "paused" | "resumed" | "ended";
    if (action === 'start') {
      taskStatus = 'started';
    } else if (action === 'resume') {
      taskStatus = 'resumed';
    } else if (action === 'stop') {
      taskStatus = 'ended';
    } else {
      taskStatus = recurringTask.status;
    }

    // Extract nextRun conversion
    let nextRunString: string | undefined;
    if (typeof recurringTask.nextRun === 'string') {
      nextRunString = recurringTask.nextRun;
    } else if (recurringTask.nextRun instanceof Date) {
      nextRunString = recurringTask.nextRun.toISOString();
    } else {
      nextRunString = undefined;
    }

    // Extract lastRun conversion
    let lastRunString: string | undefined;
    if (typeof recurringTask.lastRun === 'string') {
      lastRunString = recurringTask.lastRun;
    } else if (recurringTask.lastRun instanceof Date) {
      lastRunString = recurringTask.lastRun.toISOString();
    } else {
      lastRunString = undefined;
    }

    // Extract createdAt conversion
    let createdAtString: string;
    if (recurringTask.createdAt instanceof Date) {
      createdAtString = recurringTask.createdAt.toISOString();
    } else if (typeof recurringTask.createdAt === 'string') {
      createdAtString = recurringTask.createdAt;
    } else if (recurringTask.createdAt) {
      createdAtString = new Date(recurringTask.createdAt as any).toISOString();
    } else {
      createdAtString = new Date().toISOString();
    }
    
    convertedTask = {
      taskId: recurringTask.taskId,
      taskName: recurringTask.taskName,
      id: recurringTask.taskId,
      type: recurringTask.type,
      status: taskStatus,
      userEmail: recurringTask.userEmail || currentUser?.email || '',
      username: recurringTask.username || 
                recurringTask.userEmail?.split('@')[0] || 
                currentUser?.username || 
                'Unknown User',
      assignedToEmail: recurringTask.assignedToEmail || recurringTask.userEmail,
      assignedTo: recurringTask.assignedToName || 
                  recurringTask.username || 
                  'Self',
      totalDuration: recurringTask.totalDuration || 0,
      elapsedTime: recurringTask.totalDuration || 0,
      activities: Array.isArray(recurringTask.activities) ? recurringTask.activities : [],
      createdAt: createdAtString,
      isRecurring: recurringTask.isRecurring || false,
      recurringType: recurringTask.recurringType as "daily" | "weekly" | "monthly" | "custom" | undefined,
      recurringStatus: recurringTask.recurringStatus as "active" | "paused" | "disabled" | undefined,
      recurringCount: recurringTask.recurringCount || 0,
      nextRun: nextRunString,
      lastRun: lastRunString,
    };
    
    console.log('✅ Final converted task:', convertedTask);
    
    // Call the original onTableAction (this should handle the task management in parent)
    onTableAction(convertedTask, action);
  }}

    isRunning={isRunning}
    currentUser={currentUser}
    calculatedDurations={calculatedDurations}
    onDurationCalculated={handleDurationCalculated}
    onEditRecurring={(task) => {
      const convertedTask: Task = {
        taskId: task.taskId,
        taskName: task.taskName,
        type: task.type,
        status: task.status,
        userEmail: task.userEmail,
        username: task.username,
        totalDuration: task.totalDuration || 0,
        activities: task.activities || [],
        assignedToEmail: task.assignedToEmail,
        assignedTo: task.assignedToName,
        ...(task.createdAt && { 
          createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt 
        }),
      };
      handleEditRecurring?.(convertedTask);
    }}
    onDisableRecurring={(task) => {
      const convertedTask: Task = {
        taskId: task.taskId,
        taskName: task.taskName,
        type: task.type,
        status: task.status,
        userEmail: task.userEmail,
        username: task.username,
        totalDuration: task.totalDuration || 0,
        activities: task.activities || [],
        assignedToEmail: task.assignedToEmail,
        assignedTo: task.assignedToName,
        ...(task.createdAt && { 
          createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt 
        }),
      };
      handleDisableRecurring?.(convertedTask);
    }}
    onDeleteRecurring={(task) => {
      const convertedTask: Task = {
        taskId: task.taskId,
        taskName: task.taskName,
        type: task.type,
        status: task.status,
        userEmail: task.userEmail,
        username: task.username,
        totalDuration: task.totalDuration || 0,
        activities: task.activities || [],
        assignedToEmail: task.assignedToName,
        assignedTo: task.assignedToName,
        ...(task.createdAt && { 
          createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt 
        }),
      };
      handleDeleteRecurring?.(convertedTask);
    }}
    onRefresh={refreshTasks}
  />
</TabPanel>

{/* <TabPanel value={activeTab} index={4}>
  <ApprovalTasks
    tasks={categorizedTasks.approvalTasks}
    formatTime={formatTime}
    currentUser={currentUser}
    onApproveTask={handleApproveTask}
    onRejectTask={handleRejectTask}
  />
</TabPanel> */}

  


{estimatedTimeFilter !== 'all' && (
  <Box component="span" sx={{ ml: 1 }}>
    <Chip 
      label={`Filtered by: ${
        estimatedTimeFilter === 'under15' ? 'Under 15 min' :
        estimatedTimeFilter === '15to30' ? '15-30 min' :
        estimatedTimeFilter === '30to60' ? '30-60 min' :
        estimatedTimeFilter === 'over60' ? 'Over 1 hour' : ''
      }`}
      size="small"
      color="primary"
      variant="outlined"
      onDelete={() => setEstimatedTimeFilter('all')}
    />
  </Box>
)}



          {/* Admin-only tab moved to index 4 */}
          {isAdmin && (
            <TabPanel value={activeTab} index={4}>
              <AllUserTasks
                tasks={categorizedTasks.allUserTasks}
                formatTime={formatTime}
                onTableAction={onTableAction}
                isRunning={isRunning}
                currentUser={currentUser}
                calculatedDurations={calculatedDurations}
                onDurationCalculated={handleDurationCalculated}
                expandedRows={expandedRows}
                onToggleRowExpansion={onToggleRowExpansion}
                onToggleRecurring={handleToggleRecurring}
              />
            </TabPanel>
          )}

          <TabPanel value={activeTab} index={isAdmin ? 5 : 4}>
  <TaskMappingTab
    currentUser={currentUser}
    allTasks={allTasks || []}
    onExportReport={handleExportReport}
  />
</TabPanel>
        </Collapse>
      </CardContent>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
  <Dialog 
    open={showNewTaskDialog} 
    onClose={() => setShowNewTaskDialog(false)}
    maxWidth="md"
    fullWidth
  >
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <AddIcon color="success" />
      Create New Task
    </DialogTitle>
    
    <DialogContent>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
    {/* Task Name - FIXED */}
    {/* <TextField
      fullWidth
      label="Task Name"
      value={newTaskData.taskName}
      onChange={(e) => setNewTaskData(prev => ({ ...prev, taskName: e.target.value }))}
      error={!!newTaskErrors.taskName}
      helperText={newTaskErrors.taskName}
      required
      placeholder="Enter task name..."
    /> */}

    {/* Alternative: If you want to keep Autocomplete, fix the binding */}
    <Autocomplete
      freeSolo
      options={getUniqueTaskNames()}
      value={newTaskData.taskName}
      onChange={(event, newValue) => {
        setNewTaskData(prev => ({ ...prev, taskName: newValue || '' }));
      }}
      onInputChange={(event, newInputValue) => {
        setNewTaskData(prev => ({ ...prev, taskName: newInputValue }));
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Task Name"
          variant="outlined"
          placeholder="Enter or select task name..."
          error={!!newTaskErrors.taskName}
          helperText={newTaskErrors.taskName}
          required
        />
      )}
    />

    {/* Rest of your form fields remain the same */}
    <FormControl fullWidth>
      <InputLabel>Task Type</InputLabel>
      <Select
        value={newTaskData.type}
        label="Task Type"
        onChange={(e) => setNewTaskData(prev => ({ ...prev, type: e.target.value as 'task' | 'meeting' }))}
      >
        <MenuItem value="task">Task</MenuItem>
        <MenuItem value="meeting">Meeting</MenuItem>
      </Select>
    </FormControl>

    {/* Start Date & Time */}
    <DateTimePicker
      label="Start Date & Time"
      value={newTaskData.startDate}
      onChange={(newValue: Dayjs | null) => {
        if (newValue) {
          setNewTaskData(prev => ({ ...prev, startDate: newValue }));
        }
      }}
      slotProps={{
        textField: {
          fullWidth: true,
          error: !!newTaskErrors.startDate,
          helperText: newTaskErrors.startDate
        }
      }}
    />

    {/* End Date & Time */}
    <DateTimePicker
      label="End Date & Time"
      value={newTaskData.endDate}
      onChange={(newValue: Dayjs | null) => {
        if (newValue) {
          setNewTaskData(prev => ({ ...prev, endDate: newValue }));
        }
      }}
      slotProps={{
        textField: {
          fullWidth: true,
          error: !!newTaskErrors.endDate,
          helperText: newTaskErrors.endDate
        }
      }}
    />

    {/* Description */}
    <TextField
      fullWidth
      label="Description (Optional)"
      multiline
      rows={3}
      value={newTaskData.description}
      onChange={(e) => setNewTaskData(prev => ({ ...prev, description: e.target.value }))}
    />

    {/* Duration Display */}
    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="body2" color="primary">
        <strong>Duration: </strong>
        {formatTime(newTaskData.endDate.diff(newTaskData.startDate, 'second'))}
      </Typography>
    </Box>

    {/* Show errors */}
    {newTaskErrors.general && (
      <Alert severity="error">
        {newTaskErrors.general}
      </Alert>
    )}
  </Box>
</DialogContent>


    <DialogActions>
      <Button 
  onClick={() => {
    setShowNewTaskDialog(false);
    setNewTaskData({
      taskName: '',
      type: 'task',
      startDate: dayjs(),
      endDate: dayjs().add(1, 'hour'),
      description: ''
    });
    setNewTaskErrors({});
  }}
  startIcon={<CloseIcon />}
>
  Cancel
</Button>

     <Button 
  onClick={() => {
    console.log('🔍 Create button clicked!');
    handleCreateNewTask();
  }}
  variant="contained"
  color="success"
  startIcon={<SaveIcon />}
>
  Create Task
</Button>

    </DialogActions>
  </Dialog>
</LocalizationProvider>
    </Card>
  );
};

export default TaskHistoryTableEnhanced;