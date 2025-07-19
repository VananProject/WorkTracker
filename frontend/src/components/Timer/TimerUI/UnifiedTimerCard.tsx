// import React, { useState, useMemo, useEffect } from 'react';
// import {
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   Chip,
//   LinearProgress,
//   IconButton,
//   Collapse,
//   Avatar,
//   Stack,
//   Divider,
//   Button,
//   Alert,
//   Grid,
//   Paper,
//   useTheme,
//   useMediaQuery,
//   ButtonGroup,
//   alpha
// } from '@mui/material';
// import {
//   ExpandMore,
//   ExpandLess,
//   Today,
//   Timer,
//   Task as TaskIcon,
//   Business as MeetingIcon,
//   TrendingUp,
//   Schedule,
//   PlayArrow,
//   Pause,
//   Stop,
//   Add,
//   Clear,
//   Alarm,
//   NotificationImportant,
//   AccessTime,
//   VolumeUp
// } from '@mui/icons-material';
// import type { Task } from '../TableUI/types/TaskHistoryTypes';

// interface UnifiedTimerCardProps {
//   // Timer Display Props
//   elapsedTime: number;
//   currentTask: any;
//   alarmTime: number | null;
  
//   // Daily Tracking Props
//   tasks: Task[];
//   currentUser: any;
//   isRunning?: boolean;
  
//   // Notifications Props
//   pausedTasks: any[];
//   error: string | null;
//   alarmNotification?: string | null;
//   pausedTaskNotification?: string | null;
//   onSetAlarmNotification?: (message: string | null) => void;
//   onSetPausedTaskNotification?: (message: string | null) => void;
  
//   // Controls Props
//   state: any;
//   dispatch: (action: any) => void;
//   onStartTask: (type: 'task' | 'meeting') => void;
//   onPause: () => void;
//   onResume: () => void;
//   onStop: (description?: string) => void;
//   onSetAlarm: (minutes: number) => void;
//   onTestAlarmSound: () => void;
  
//   // Utility
//   formatTime: (seconds: number) => string;
// }

// // Helper function to format time as HH:MM:SS
// const formatTimeSimple = (seconds: number): string => {
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = Math.floor(seconds % 60);
  
//   return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
// };

// const UnifiedTimerCard: React.FC<UnifiedTimerCardProps> = ({
//   elapsedTime,
//   currentTask,
//   alarmTime,
//   tasks,
//   currentUser,
//   isRunning = false,
//   pausedTasks,
//   error,
//   alarmNotification,
//   pausedTaskNotification,
//   onSetAlarmNotification,
//   onSetPausedTaskNotification,
//   state,
//   dispatch,
//   onStartTask,
//   onPause,
//   onResume,
//   onStop,
//   onSetAlarm,
//   onTestAlarmSound,
//   formatTime
// }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
//   const [expanded, setExpanded] = useState(false);
//   const [currentTime, setCurrentTime] = useState(new Date());

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   // Daily tracking calculations
//   const { todayStart, todayEnd } = useMemo(() => {
//     const today = new Date();
//     const start = new Date(today);
//     start.setHours(0, 0, 0, 0);
//     const end = new Date(today);
//     end.setHours(23, 59, 59, 999);
//     return { todayStart: start, todayEnd: end };
//   }, []);

//   const dailySummary = useMemo(() => {
//     const userEmail = currentUser?.email || currentUser?.userEmail;
//     if (!userEmail) return { taskSummaries: [], totalTaskSeconds: 0, totalMeetingSeconds: 0, totalSeconds: 0 };
    
//     const todayTasks = tasks.filter(task => {
//       const isUserTask = task.userEmail === userEmail || (task as any).assignedToEmail === userEmail;
//       if (!isUserTask) return false;

//       const hasActivityToday = task.activities?.some((activity: any) => {
//         const activityDate = new Date(activity.timestamp);
//         return activityDate >= todayStart && activityDate <= todayEnd;
//       });

//       const createdToday = task.createdAt && 
//         new Date(task.createdAt) >= todayStart && 
//         new Date(task.createdAt) <= todayEnd;

//       return hasActivityToday || createdToday;
//     });

//     const taskSummaries: any[] = [];
//     let totalTaskSeconds = 0;
//     let totalMeetingSeconds = 0;

//     todayTasks.forEach(task => {
//       let taskTotalSeconds = 0;

//       if (task.activities && task.activities.length > 0) {
//         const todayActivities = task.activities.filter((activity: any) => {
//           const activityDate = new Date(activity.timestamp);
//           return activityDate >= todayStart && activityDate <= todayEnd;
//         });

//         todayActivities.sort((a: any, b: any) => {
//           return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
//         });

//         let sessionStart = null as Date | null;
        
//         todayActivities.forEach((activity: any) => {
//           const activityTime = new Date(activity.timestamp);

//           switch (activity.action) {
//             case 'started':
//             case 'resumed':
//               sessionStart = activityTime;
//               break;
//             case 'paused':
//             case 'ended':
//               if (sessionStart !== null && activityTime) {
//                 const sessionDuration = (activityTime.getTime() - sessionStart.getTime()) / 1000;
//                 taskTotalSeconds += Math.floor(sessionDuration);
//                 sessionStart = null;
//               }
//               break;
//           }
//         });

//         if (sessionStart !== null && ['started', 'resumed'].includes(task.status)) {
//           const currentDuration = (currentTime.getTime() - sessionStart.getTime()) / 1000;
//           taskTotalSeconds += Math.floor(currentDuration);
//         }
//       }

//       if (taskTotalSeconds === 0 && task.totalDuration) {
//         const createdToday = task.createdAt && 
//           new Date(task.createdAt) >= todayStart && 
//           new Date(task.createdAt) <= todayEnd;
        
//         if (createdToday) {
//           taskTotalSeconds = Math.floor(task.totalDuration);
//         }
//       }

//       if (taskTotalSeconds > 0) {
//         const isActive = ['started', 'resumed'].includes(task.status) && 
//                         (currentTask?.taskId === task.taskId || isRunning);

//         taskSummaries.push({
//           taskName: task.taskName,
//           taskId: task.taskId,
//           type: task.type,
//           totalSeconds: Math.floor(taskTotalSeconds),
//           status: task.status,
//           isActive
//         });

//         if (task.type === 'meeting') {
//           totalMeetingSeconds += Math.floor(taskTotalSeconds);
//         } else {
//           totalTaskSeconds += Math.floor(taskTotalSeconds);
//         }
//       }
//     });

//     taskSummaries.sort((a, b) => b.totalSeconds - a.totalSeconds);

//     return {
//       taskSummaries,
//       totalTaskSeconds,
//       totalMeetingSeconds,
//       totalSeconds: totalTaskSeconds + totalMeetingSeconds
//     };
//   }, [tasks, currentUser, currentTime, currentTask, isRunning, todayStart, todayEnd]);

//   const workdayProgress = (dailySummary.totalSeconds / (8 * 3600)) * 100;

//   // Control handlers
//   const hasRunningTask = currentTask && currentTask.status !== 'ended' && isRunning;
//   const hasPausedTask = currentTask && currentTask.status === 'paused' && !isRunning;

//   const handleStartTask = (type: 'task' | 'meeting') => {
//     if (hasRunningTask) {
//       onPause();
//       setTimeout(() => onStartTask(type), 100);
//     } else {
//       onStartTask(type);
//     }
//   };

//   const handleAlarmSet = (minutes: number) => {
//     onSetAlarm(minutes);
//   };

//   const handleClearAlarm = () => {
//     onSetAlarm(0);
//   };

//   // Filter paused tasks for current user
//   const currentUserEmail = currentUser?.email || currentUser?.userEmail;
//   const userPausedTasks = pausedTasks.filter(task => 
//     task.userEmail === currentUserEmail || task.assignedToEmail === currentUserEmail
//   );

//   return (
//     <Card 
//       sx={{ 
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         color: 'white',
//         borderRadius: 4,
//         mb: 3,
//         overflow: 'hidden',
//         boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
//         position: 'relative'
//       }}
//     >
//       <CardContent sx={{ p: 0 }}>
//         {/* Main Timer Section */}
//         <Box sx={{ 
//           p: { xs: 2, sm: 3, md: 4 },
//           textAlign: 'center'
//         }}>
//           {/* Current Timer Display */}
//           <Box sx={{ mb: 3 }}>
//             <Typography 
//               variant={isMobile ? "h3" : isTablet ? "h2" : "h1"} 
//               sx={{ 
//                 fontFamily: 'monospace',
//                 fontWeight: 700,
//                 mb: 2,
//                 textShadow: '0 2px 4px rgba(0,0,0,0.3)',
//                 letterSpacing: '0.05em'
//               }}
//             >
//               {formatTimeSimple(elapsedTime)}
//             </Typography>
            
//             {/* Current Task Info */}
//             {currentTask && (
//               <Box sx={{ 
//                 display: 'flex', 
//                 gap: 1, 
//                 alignItems: 'center', 
//                 justifyContent: 'center',
//                 flexWrap: 'wrap',
//                 mb: 2
//               }}>
//                 <Chip 
//                   label={currentTask.type} 
//                   size="small"
//                   sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
//                 />
//                 <Chip 
//                   label={currentTask.status} 
//                   size="small"
//                   sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
//                 />
//                 {currentTask.taskName && (
//                   <Chip 
//                     label={currentTask.taskName} 
//                     variant="outlined" 
//                     size="small"
//                     sx={{ 
//                       borderColor: 'rgba(255,255,255,0.3)', 
//                       color: 'white',
//                       maxWidth: { xs: '200px', sm: '300px' }
//                     }}
//                   />
//                 )}
//               </Box>
//             )}
//           </Box>

//           {/* Alarm Controls */}
//           <Box sx={{ mb: 3 }}>
//             <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
//               Set Alarm
//             </Typography>
//             <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
//               <ButtonGroup variant="outlined" size="small">
//                 <Button 
//                   onClick={() => handleAlarmSet(1)}
//                   disabled={state.isLoading}
//                   sx={{ 
//                     color: 'white', 
//                     borderColor: 'rgba(255,255,255,0.3)',
//                     bgcolor: alarmTime === 1 ? 'rgba(255,255,255,0.2)' : 'transparent',
//                     '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
//                   }}
//                 >
//                   1m
//                 </Button>
//                 <Button 
//                   onClick={() => handleAlarmSet(3)}
//                   disabled={state.isLoading}
//                   sx={{ 
//                     color: 'white', 
//                     borderColor: 'rgba(255,255,255,0.3)',
//                     bgcolor: alarmTime === 3 ? 'rgba(255,255,255,0.2)' : 'transparent',
//                     '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
//                   }}
//                 >
//                   3m
//                 </Button>
//                 <Button 
//                   onClick={() => handleAlarmSet(5)}
//                   disabled={state.isLoading}
//                   sx={{ 
//                     color: 'white', 
//                     borderColor: 'rgba(255,255,255,0.3)',
//                     bgcolor: alarmTime === 5 ? 'rgba(255,255,255,0.2)' : 'transparent',
//                     '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
//                   }}
//                 >
//                   5m
//                 </Button>
//                 <Button 
//                   onClick={() => handleAlarmSet(10)}
//                   disabled={state.isLoading}
//                   sx={{ 
//                     color: 'white', 
//                     borderColor: 'rgba(255,255,255,0.3)',
//                     bgcolor: alarmTime === 10 ? 'rgba(255,255,255,0.2)' : 'transparent',
//                     '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
//                   }}
//                 >
//                   10m
//                 </Button>
//               </ButtonGroup>
              
//               {alarmTime && (
//                 <IconButton 
//                   onClick={handleClearAlarm}
//                   size="small"
//                   sx={{ 
//                     color: 'white',
//                     bgcolor: 'rgba(244, 67, 54, 0.2)',
//                     '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.3)' }
//                   }}
//                 >
//                   <Clear />
//                 </IconButton>
//               )}
              
//               {alarmTime && (
//                 <IconButton 
//                   onClick={onTestAlarmSound}
//                   size="small"
//                   sx={{ 
//                     color: 'white',
//                     bgcolor: 'rgba(255,255,255,0.2)',
//                     '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
//                   }}
//                 >
//                   <VolumeUp />
//                 </IconButton>
//               )}
//             </Stack>
            
//             {alarmTime && (
//               <Typography variant="caption" sx={{ opacity: 0.8 }}>
//                 Alarm set for every {alarmTime} minute{alarmTime > 1 ? 's' : ''}
//               </Typography>
//             )}
//           </Box>

//           {/* Control Buttons */}
//           <Box sx={{ mb: 3 }}>
//             <Grid container spacing={2} justifyContent="center">
//               {/* Start Task Button */}
//               <Grid item xs={6} sm={3}>
//                 <Button
//                   fullWidth
//                   variant="contained"
//                   size={isMobile ? "medium" : "large"}
//                   startIcon={<TaskIcon />}
//                   onClick={() => handleStartTask('task')}
//                   disabled={state.isLoading}
//                   sx={{
//                     bgcolor: 'rgba(255,255,255,0.2)',
//                     backdropFilter: 'blur(10px)',
//                     border: '1px solid rgba(255,255,255,0.3)',
//                     color: 'white',
//                     fontWeight: 600,
//                     py: { xs: 1, sm: 1.5 },
//                     '&:hover': {
//                       bgcolor: 'rgba(255,255,255,0.3)',
//                       transform: 'translateY(-2px)',
//                       boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
//                     },
//                     '&:disabled': {
//                       bgcolor: 'rgba(255,255,255,0.1)',
//                       color: 'rgba(255,255,255,0.5)'
//                     },
//                     transition: 'all 0.3s ease'
//                   }}
//                 >
//                   {isMobile ? 'Task' : 'Start Task'}
//                 </Button>
//               </Grid>

//               {/* Start Meeting Button */}
//               <Grid item xs={6} sm={3}>
//                 <Button
//                   fullWidth
//                   variant="contained"
//                   size={isMobile ? "medium" : "large"}
//                   startIcon={<MeetingIcon />}
//                   onClick={() => handleStartTask('meeting')}
//                   disabled={state.isLoading}
//                   sx={{
//                     bgcolor: 'rgba(255,255,255,0.2)',
//                     backdropFilter: 'blur(10px)',
//                     border: '1px solid rgba(255,255,255,0.3)',
//                     color: 'white',
//                     fontWeight: 600,
//                     py: { xs: 1, sm: 1.5 },
//                     '&:hover': {
//                       bgcolor: 'rgba(255,255,255,0.3)',
//                       transform: 'translateY(-2px)',
//                       boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
//                     },
//                     '&:disabled': {
//                       bgcolor: 'rgba(255,255,255,0.1)',
//                       color: 'rgba(255,255,255,0.5)'
//                     },
//                     transition: 'all 0.3s ease'
//                   }}
//                 >
//                   {isMobile ? 'Meeting' : 'Start Meeting'}
//                 </Button>
//               </Grid>

//               {/* Pause/Resume Button */}
//               {hasRunningTask && (
//                 <Grid item xs={6} sm={3}>
//                   <Button
//                     fullWidth
//                     variant="contained"
//                     size={isMobile ? "medium" : "large"}
//                     startIcon={<Pause />}
//                     onClick={onPause}
//                     disabled={state.isLoading}
//                     sx={{
//                       bgcolor: 'rgba(255, 193, 7, 0.8)',
//                       backdropFilter: 'blur(10px)',
//                       border: '1px solid rgba(255, 193, 7, 0.3)',
//                       color: 'white',
//                       fontWeight: 600,
//                       py: { xs: 1, sm: 1.5 },
//                       '&:hover': {
//                         bgcolor: 'rgba(255, 193, 7, 0.9)',
//                         transform: 'translateY(-2px)',
//                         boxShadow: '0 8px 25px rgba(255, 193, 7, 0.3)'
//                       },
//                       transition: 'all 0.3s ease'
//                     }}
//                   >
//                     Pause
//                   </Button>
//                 </Grid>
//               )}

//               {hasPausedTask && (
//                 <Grid item xs={6} sm={3}>
//                   <Button
//                     fullWidth
//                     variant="contained"
//                     size={isMobile ? "medium" : "large"}
//                     startIcon={<PlayArrow />}
//                     onClick={onResume}
//                     disabled={state.isLoading}
//                     sx={{
//                       bgcolor: 'rgba(76, 175, 80, 0.8)',
//                       backdropFilter: 'blur(10px)',
//                       border: '1px solid rgba(76, 175, 80, 0.3)',
//                       color: 'white',
//                       fontWeight: 600,
//                       py: { xs: 1, sm: 1.5 },
//                       '&:hover': {
//                         bgcolor: 'rgba(76, 175, 80, 0.9)',
//                         transform: 'translateY(-2px)',
//                         boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
//                       },
//                       transition: 'all 0.3s ease'
//                     }}
//                   >
//                     Resume
//                   </Button>
//                 </Grid>
//               )}

//               {/* Stop Button */}
//               {(hasRunningTask || hasPausedTask) && (
//                 <Grid item xs={6} sm={3}>
//                   <Button
//                     fullWidth
//                     variant="contained"
//                     size={isMobile ? "medium" : "large"}
//                     startIcon={<Stop />}
//                     onClick={() => onStop()}
//                     disabled={state.isLoading}
//                     sx={{
//                       bgcolor: 'rgba(244, 67, 54, 0.8)',
//                       backdropFilter: 'blur(10px)',
//                       border: '1px solid rgba(244, 67, 54, 0.3)',
//                       color: 'white',
//                       fontWeight: 600,
//                       py: { xs: 1, sm: 1.5 },
//                       '&:hover': {
//                         bgcolor: 'rgba(244, 67, 54, 0.9)',
//                         transform: 'translateY(-2px)',
//                         boxShadow: '0 8px 25px rgba(244, 67, 54, 0.3)'
//                       },
//                       transition: 'all 0.3s ease'
//                     }}
//                   >
//                     Stop
//                   </Button>
//                 </Grid>
//               )}
//             </Grid>
//           </Box>

//           {/* Notifications */}
//           {userPausedTasks.length > 0 && (
//             <Alert
//               severity="warning"
//               sx={{ 
//                 mb: 2,
//                 bgcolor: 'rgba(255, 193, 7, 0.2)',
//                 border: '1px solid rgba(255, 193, 7, 0.3)',
//                 color: 'white',
//                 '& .MuiAlert-icon': { color: 'white' }
//               }}
//               icon={<NotificationImportant />}
//             >
//               <Typography variant="body2">
//                 You have {userPausedTasks.length} paused task(s): {userPausedTasks.map(t => t.taskName).join(', ')}
//               </Typography>
//             </Alert>
//           )}

//           {error && (
//             <Alert 
//               severity="error" 
//               sx={{ 
//                 mb: 2,
//                 bgcolor: 'rgba(244, 67, 54, 0.2)',
//                 border: '1px solid rgba(244, 67, 54, 0.3)',
//                 color: 'white',
//                 '& .MuiAlert-icon': { color: 'white' }
//               }}
//             >
//               {error}
//             </Alert>
//           )}
//         </Box>

//         {/* Daily Summary Section */}
//         <Box sx={{ 
//           borderTop: '1px solid rgba(255,255,255,0.1)',
//           bgcolor: 'rgba(255,255,255,0.05)',
//           p: { xs: 2, sm: 3 }
//         }}>
//           {/* Daily Stats Header */}
//           <Box sx={{ 
//             display: 'flex', 
//             justifyContent: 'space-between', 
//             alignItems: 'center',
//             mb: 2
//           }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//               <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
//                 <Today />
//               </Avatar>
//               <Box>
//                 <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                   Today's Progress
//                 </Typography>
//                 <Typography variant="body2" sx={{ opacity: 0.8 }}>
//                   {formatTimeSimple(dailySummary.totalSeconds)} • {dailySummary.taskSummaries.length} tasks
//                 </Typography>
//               </Box>
//             </Box>
            
//             <Box sx={{ textAlign: 'right' }}>
//               <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                 {Math.min(workdayProgress, 100).toFixed(0)}%
//               </Typography>
//               <Typography variant="caption" sx={{ opacity: 0.8 }}>
//                 of 8h goal
//               </Typography>
//             </Box>
//           </Box>

//           {/* Progress Bar */}
//           <LinearProgress
//             variant="determinate"
//             value={Math.min(workdayProgress, 100)}
//             sx={{
//               height: 8,
//               borderRadius: 4,
//               bgcolor: 'rgba(255,255,255,0.2)',
//               mb: 2,
//               '& .MuiLinearProgress-bar': {
//                 bgcolor: workdayProgress >= 100 ? '#10b981' : 
//                         workdayProgress >= 75 ? '#f59e0b' : '#ffffff',
//                 borderRadius: 4
//               }
//             }}
//           />

//           {/* Quick Stats Grid */}
//           <Grid container spacing={2} sx={{ mb: 2 }}>
//             <Grid item xs={4}>
//               <Paper sx={{ 
//                 p: 2, 
//                 bgcolor: 'rgba(255,255,255,0.1)', 
//                 backdropFilter: 'blur(10px)',
//                 textAlign: 'center',
//                 border: '1px solid rgba(255,255,255,0.2)'
//               }}>
//                 <TaskIcon sx={{ fontSize: 20, mb: 1, opacity: 0.8 }} />
//                 <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
//                   {formatTimeSimple(dailySummary.totalTaskSeconds)}
//                 </Typography>
//                 <Typography variant="caption" sx={{ opacity: 0.8 }}>
//                   Tasks
//                 </Typography>
//               </Paper>
//             </Grid>
            
//             <Grid item xs={4}>
//               <Paper sx={{ 
//                 p: 2, 
//                 bgcolor: 'rgba(255,255,255,0.1)', 
//                 backdropFilter: 'blur(10px)',
//                 textAlign: 'center',
//                 border: '1px solid rgba(255,255,255,0.2)'
//               }}>
//                 <MeetingIcon sx={{ fontSize: 20, mb: 1, opacity: 0.8 }} />
//                 <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
//                   {formatTimeSimple(dailySummary.totalMeetingSeconds)}
//                 </Typography>
//                 <Typography variant="caption" sx={{ opacity: 0.8 }}>
//                   Meetings
//                 </Typography>
//               </Paper>
//             </Grid>
            
//             <Grid item xs={4}>
//               <Paper sx={{ 
//                 p: 2, 
//                 bgcolor: 'rgba(255,255,255,0.1)', 
//                 backdropFilter: 'blur(10px)',
//                 textAlign: 'center',
//                 border: '1px solid rgba(255,255,255,0.2)'
//               }}>
//                 <Schedule sx={{ fontSize: 20, mb: 1, opacity: 0.8 }} />
//                 <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
//                   {dailySummary.taskSummaries.length}
//                 </Typography>
//                 <Typography variant="caption" sx={{ opacity: 0.8 }}>
//                   Total
//                 </Typography>
//               </Paper>
//             </Grid>
//           </Grid>
//         </Box>
//       </CardContent>
//     </Card>
//   );
// };

// export default UnifiedTimerCard;
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  IconButton,
  Alert,
  Chip,
  Stack,
  ButtonGroup,
  Collapse,
  Divider,
  useTheme,
  useMediaQuery,
  Container,
  Paper,
  alpha,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Task as TaskIcon,
  Business as MeetingIcon,
  Alarm,
  VolumeUp,
  Clear,
  NotificationImportant,
  ExpandMore,
  ExpandLess,
  Timer,
  Add,
} from '@mui/icons-material';

interface CombinedTimerCardProps {
  // Timer Display Props
  elapsedTime: number;
  currentTask: any;
  alarmTime: number | null;
  formatTime: (seconds: number) => string;
  onTestAlarmSound: () => void;

  // Notifications Props
  pausedTasks: any[];
  error: string | null;
  alarmNotification: string | null;
  pausedTaskNotification: string | null;
  onSetAlarmNotification: (message: string | null) => void;
  onSetPausedTaskNotification: (message: string | null) => void;
  currentUser: any;

  // Control Props
  state: any;
  dispatch: (action: any) => void;
  onStartTask: (type: 'task' | 'meeting') => void;
  onCreateTask: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSetAlarm: (minutes: number) => void;
}

// Helper function to format time as HH:MM:SS
const formatTimeSimple = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const CombinedTimerCard: React.FC<CombinedTimerCardProps> = ({
  elapsedTime,
  currentTask,
  alarmTime,
  formatTime,
  onTestAlarmSound,
  pausedTasks,
  error,
  alarmNotification,
  pausedTaskNotification,
  onSetAlarmNotification,
  onSetPausedTaskNotification,
  currentUser,
  state,
  dispatch,
  onStartTask,
  onCreateTask,
  onPause,
  onResume,
  onStop,
  onSetAlarm,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [showAlarmControls, setShowAlarmControls] = useState(false);

  // Control handlers
  const hasRunningTask = currentTask && currentTask.status !== 'ended' && state.isRunning;
  const hasPausedTask = currentTask && currentTask.status === 'paused' && !state.isRunning;

  const handleStartTask = (type: 'task' | 'meeting') => {
    if (hasRunningTask) {
      onPause();
      setTimeout(() => onStartTask(type), 100);
    } else {
      onStartTask(type);
    }
  };

  const handleAlarmSet = (minutes: number) => {
    onSetAlarm(minutes);
  };

  const handleClearAlarm = () => {
    onSetAlarm(0);
  };

  // Filter paused tasks for current user
  const currentUserEmail = currentUser?.email || currentUser?.userEmail;
  const userPausedTasks = pausedTasks.filter(
    (task) =>
      task.userEmail === currentUserEmail ||
      task.assignedToEmail === currentUserEmail
  );

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Card
        sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
          color: 'white',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Grid container>
            {/* Left Side - Timer Display & Controls */}
            <Grid
              item
              xs={12}
              lg={8}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                borderRight: { lg: '1px solid rgba(255, 255, 255, 0.1)' },
              }}
            >
              {/* Timer Display Section */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant={isMobile ? 'h2' : isTablet ? 'h1' : 'h1'}
                  sx={{
                    fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace",
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                    mb: 2,
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    letterSpacing: '0.02em',
                    background: hasRunningTask
                      ? 'linear-gradient(45deg, #10b981, #34d399)'
                      : hasPausedTask
                      ? 'linear-gradient(45deg, #f59e0b, #fbbf24)'
                      : 'linear-gradient(45deg, #64748b, #94a3b8)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {formatTimeSimple(elapsedTime)}
                </Typography>

                {/* Current Task Info */}
                {currentTask && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      mb: 2,
                    }}
                  >
                    <Chip
                      icon={currentTask.type === 'meeting' ? <MeetingIcon /> : <TaskIcon />}
                      label={currentTask.type}
                      size="medium"
                      sx={{
                        bgcolor: currentTask.type === 'meeting'
                          ? 'rgba(59, 130, 246, 0.2)'
                          : 'rgba(16, 185, 129, 0.2)',
                        color: currentTask.type === 'meeting' ? '#60a5fa' : '#34d399',
                        border: `1px solid ${
                          currentTask.type === 'meeting'
                            ? 'rgba(59, 130, 246, 0.3)'
                            : 'rgba(16, 185, 129, 0.3)'
                        }`,
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      label={currentTask.status}
                      size="medium"
                      sx={{
                        bgcolor: currentTask.status === 'started'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : currentTask.status === 'paused'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(100, 116, 139, 0.2)',
                        color: currentTask.status === 'started'
                          ? '#34d399'
                          : currentTask.status === 'paused'
                          ? '#fbbf24'
                          : '#94a3b8',
                        border: `1px solid ${
                          currentTask.status === 'started'
                            ? 'rgba(16, 185, 129, 0.3)'
                            : currentTask.status === 'paused'
                            ? 'rgba(245, 158, 11, 0.3)'
                            : 'rgba(100, 116, 139, 0.3)'
                        }`,
                        fontWeight: 600,
                      }}
                    />
                    {currentTask.taskName && (
                      <Chip
                        label={currentTask.taskName}
                        variant="outlined"
                        size="medium"
                        sx={{
                          borderColor: 'rgba(255,255,255,0.3)',
                          color: 'white',
                          maxWidth: { xs: '200px', sm: '300px', md: '400px' },
                          fontWeight: 500,
                        }}
                      />
                    )}
                  </Box>
                )}

                {!currentTask && (
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.7,
                      fontStyle: 'italic',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    }}
                  >
                    No active task
                  </Typography>
                )}
              </Box>

              {/* Alarm Controls */}
              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Alarm sx={{ color: '#f59e0b' }} />
                    Alarm Settings
                  </Typography>
                  <IconButton
                    onClick={() => setShowAlarmControls(!showAlarmControls)}
                    size="small"
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.2)' },
                    }}
                  >
                    {showAlarmControls ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>

                <Collapse in={showAlarmControls}>
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: 3,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <ButtonGroup
                        variant="outlined"
                        size="medium"
                        sx={{
                          flexWrap: 'wrap',
                          '& .MuiButtonGroup-grouped': {
                            minWidth: { xs: '50px', sm: '60px' },
                          },
                        }}
                      >
                        {[1, 3, 5, 10, 15, 30].map((minutes) => (
                          <Button
                            key={minutes}
                            onClick={() => handleAlarmSet(minutes)}
                            disabled={state.isLoading}
                            sx={{
                              color: 'white',
                              borderColor: 'rgba(245, 158, 11, 0.3)',
                              bgcolor: alarmTime === minutes
                                ? 'rgba(245, 158, 11, 0.3)'
                                : 'transparent',
                              '&:hover': {
                                bgcolor: 'rgba(245, 158, 11, 0.2)',
                                borderColor: 'rgba(245, 158, 11, 0.5)',
                              },
                              fontWeight: 600,
                            }}
                          >
                            {minutes}m
                          </Button>
                        ))}
                      </ButtonGroup>

                      <Stack direction="row" spacing={1}>
                        {alarmTime && (
                          <>
                            <IconButton
                              onClick={handleClearAlarm}
                              size="medium"
                              sx={{
                                color: 'white',
                                bgcolor: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.3)' },
                              }}
                            >
                              <Clear />
                            </IconButton>
                            <IconButton
                              onClick={onTestAlarmSound}
                              size="medium"
                              sx={{
                                color: 'white',
                                bgcolor: 'rgba(59, 130, 246, 0.2)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.3)' },
                              }}
                            >
                              <VolumeUp />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                    </Stack>

                    {alarmTime && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 2,
                          opacity: 0.8,
                          textAlign: 'center',
                          color: '#fbbf24',
                          fontWeight: 500,
                        }}
                      >
                        ⏰ Alarm set for every {alarmTime} minute{alarmTime > 1 ? 's' : ''}
                      </Typography>
                    )}
                  </Paper>
                </Collapse>
              </Box>

              {/* Control Buttons */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                                  <Timer sx={{ color: '#3b82f6' }} />
                  Timer Controls
                </Typography>

                <Grid container spacing={2}>
                  {/* Start Task Button */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<TaskIcon />}
                      onClick={() => handleStartTask('task')}
                      disabled={state.isLoading}
                      sx={{
                        bgcolor: 'rgba(16, 185, 129, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(16, 185, 129, 0.3)',
                        color: 'white',
                        fontWeight: 700,
                        py: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        '&:hover': {
                          bgcolor: 'rgba(16, 185, 129, 0.3)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2)',
                          borderColor: 'rgba(16, 185, 129, 0.5)',
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(16, 185, 129, 0.1)',
                          color: 'rgba(255, 255, 255, 0.5)',
                          borderColor: 'rgba(16, 185, 129, 0.2)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {isMobile ? 'Task' : 'Start Task'}
                    </Button>
                  </Grid>

                  {/* Start Meeting Button */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<MeetingIcon />}
                      onClick={() => handleStartTask('meeting')}
                      disabled={state.isLoading}
                      sx={{
                        bgcolor: 'rgba(59, 130, 246, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(59, 130, 246, 0.3)',
                        color: 'white',
                        fontWeight: 700,
                        py: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        '&:hover': {
                          bgcolor: 'rgba(59, 130, 246, 0.3)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)',
                          borderColor: 'rgba(59, 130, 246, 0.5)',
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(59, 130, 246, 0.1)',
                          color: 'rgba(255, 255, 255, 0.5)',
                          borderColor: 'rgba(59, 130, 246, 0.2)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {isMobile ? 'Meeting' : 'Start Meeting'}
                    </Button>
                  </Grid>

                  {/* Create Task Button */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<Add />}
                      onClick={onCreateTask}
                      disabled={state.isLoading}
                      sx={{
                        bgcolor: 'rgba(139, 92, 246, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        color: 'white',
                        fontWeight: 700,
                        py: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        '&:hover': {
                          bgcolor: 'rgba(139, 92, 246, 0.3)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)',
                          borderColor: 'rgba(139, 92, 246, 0.5)',
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(139, 92, 246, 0.1)',
                          color: 'rgba(255, 255, 255, 0.5)',
                          borderColor: 'rgba(139, 92, 246, 0.2)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {isMobile ? 'Create' : 'Create Task'}
                    </Button>
                  </Grid>

                  {/* Dynamic Action Button */}
                  <Grid item xs={12} sm={6} md={3}>
                    {hasRunningTask ? (
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<Pause />}
                        onClick={onPause}
                        disabled={state.isLoading}
                        sx={{
                          bgcolor: 'rgba(245, 158, 11, 0.2)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(245, 158, 11, 0.3)',
                          color: 'white',
                          fontWeight: 700,
                          py: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          '&:hover': {
                            bgcolor: 'rgba(245, 158, 11, 0.3)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 30px rgba(245, 158, 11, 0.2)',
                            borderColor: 'rgba(245, 158, 11, 0.5)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        Pause
                      </Button>
                    ) : hasPausedTask ? (
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<PlayArrow />}
                        onClick={onResume}
                        disabled={state.isLoading}
                        sx={{
                          bgcolor: 'rgba(16, 185, 129, 0.2)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(16, 185, 129, 0.3)',
                          color: 'white',
                          fontWeight: 700,
                          py: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          '&:hover': {
                            bgcolor: 'rgba(16, 185, 129, 0.3)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2)',
                            borderColor: 'rgba(16, 185, 129, 0.5)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        Resume
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        disabled
                        sx={{
                          border: '2px dashed rgba(255, 255, 255, 0.2)',
                          color: 'rgba(255, 255, 255, 0.4)',
                          py: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          fontWeight: 500,
                        }}
                      >
                        No Active Task
                      </Button>
                    )}
                  </Grid>

                  {/* Stop Button - Full Width on Mobile */}
                  {(hasRunningTask || hasPausedTask) && (
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<Stop />}
                        onClick={() => onStop()}
                        disabled={state.isLoading}
                        sx={{
                          bgcolor: 'rgba(239, 68, 68, 0.2)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(239, 68, 68, 0.3)',
                          color: 'white',
                          fontWeight: 700,
                          py: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          mt: 1,
                          '&:hover': {
                            bgcolor: 'rgba(239, 68, 68, 0.3)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.2)',
                            borderColor: 'rgba(239, 68, 68, 0.5)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <Stop sx={{ mr: 1 }} />
                        Stop Current Task
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>

            {/* Right Side - Notifications & Status */}
            <Grid
              item
              xs={12}
              lg={4}
              sx={{
                bgcolor: 'rgba(15, 23, 42, 0.6)',
                p: { xs: 3, sm: 4 },
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'blur(20px)',
                borderTop: { xs: '1px solid rgba(255, 255, 255, 0.1)', lg: 'none' },
              }}
            >
              {/* Notifications Header */}
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <NotificationImportant sx={{ color: '#f59e0b' }} />
                Status & Notifications
              </Typography>

              {/* Current Status Card */}
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  bgcolor: 'rgba(30, 41, 59, 0.8)',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: hasRunningTask
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : hasPausedTask
                      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      : 'linear-gradient(90deg, #64748b, #94a3b8)',
                  },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: hasRunningTask
                      ? '#34d399'
                      : hasPausedTask
                      ? '#fbbf24'
                      : '#94a3b8',
                  }}
                >
                  Current Status
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: hasRunningTask
                        ? '#10b981'
                        : hasPausedTask
                        ? '#f59e0b'
                        : '#64748b',
                      boxShadow: hasRunningTask
                        ? '0 0 10px rgba(16, 185, 129, 0.5)'
                        : hasPausedTask
                        ? '0 0 10px rgba(245, 158, 11, 0.5)'
                        : 'none',
                      animation: hasRunningTask ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': {
                          boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)',
                        },
                        '70%': {
                          boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)',
                        },
                        '100%': {
                          boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)',
                        },
                      },
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: hasRunningTask
                        ? '#34d399'
                        : hasPausedTask
                        ? '#fbbf24'
                        : '#94a3b8',
                    }}
                  >
                    {hasRunningTask
                      ? '🟢 Task Running'
                      : hasPausedTask
                      ? '🟡 Task Paused'
                      : '⚫ No Active Task'}
                  </Typography>
                </Box>

                {currentTask && (
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.8,
                      fontStyle: 'italic',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    "{currentTask.taskName || 'Unnamed Task'}"
                  </Typography>
                )}

              </Paper>

              {/* Notifications Stack */}
              <Stack spacing={2} sx={{ flex: 1 }}>
                {/* Alarm Notification */}
                {alarmNotification && (
                  <Alert
                    severity="info"
                    onClose={() => onSetAlarmNotification(null)}
                    sx={{
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: 'white',
                      borderRadius: 2,
                      '& .MuiAlert-icon': { color: '#60a5fa' },
                      '& .MuiAlert-action': { color: 'white' },
                      backdropFilter: 'blur(10px)',
                    }}
                    icon={<Alarm />}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {alarmNotification}
                    </Typography>
                  </Alert>
                )}

                {/* Paused Task Notification */}
                {pausedTaskNotification && (
                  <Alert
                    severity="warning"
                    onClose={() => onSetPausedTaskNotification(null)}
                    sx={{
                      bgcolor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: 'white',
                      borderRadius: 2,
                      '& .MuiAlert-icon': { color: '#fbbf24' },
                      '& .MuiAlert-action': { color: 'white' },
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {pausedTaskNotification}
                    </Typography>
                  </Alert>
                )}

                {/* Paused Tasks Warning */}
                {userPausedTasks.length > 0 && (
                  <Alert
                    severity="warning"
                    sx={{
                      bgcolor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: 'white',
                      borderRadius: 2,
                      '& .MuiAlert-icon': { color: '#fbbf24' },
                      backdropFilter: 'blur(10px)',
                    }}
                    icon={<NotificationImportant />}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      ⚠️ {userPausedTasks.length} Paused Task{userPausedTasks.length > 1 ? 's' : ''}
                    </Typography>
                    <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
                      {userPausedTasks.slice(0, 3).map((task, index) => (
                        <Chip
                          key={task.taskId || index}
                          label={task.taskName || 'Unnamed Task'}
                          size="small"
                          sx={{
                            mr: 1,
                            mb: 1,
                            bgcolor: 'rgba(245, 158, 11, 0.2)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            maxWidth: '200px',
                          }}
                        />
                      ))}
                      {userPausedTasks.length > 3 && (
                        <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                          +{userPausedTasks.length - 3} more paused tasks
                        </Typography>
                      )}
                    </Box>
                  </Alert>
                )}

                {/* Error Alert */}
                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      bgcolor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: 'white',
                      borderRadius: 2,
                      '& .MuiAlert-icon': { color: '#f87171' },
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {error}
                    </Typography>
                  </Alert>
                )}

                {/* System Status Card */}
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#10b981',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
                      }}
                    />
                    System Status
                  </Typography>
                  
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Timer Status
                      </Typography>
                      <Chip
                        label={state.isRunning ? 'Running' : 'Stopped'}
                        size="small"
                        sx={{
                          bgcolor: state.isRunning
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(100, 116, 139, 0.2)',
                          color: state.isRunning ? '#34d399' : '#94a3b8',
                          border: `1px solid ${
                            state.isRunning
                              ? 'rgba(16, 185, 129, 0.3)'
                              : 'rgba(100, 116, 139, 0.3)'
                          }`,
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Alarm Status
                      </Typography>
                      <Chip
                        label={alarmTime ? `${alarmTime}m` : 'Off'}
                        size="small"
                        sx={{
                          bgcolor: alarmTime
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(100, 116, 139, 0.2)',
                          color: alarmTime ? '#fbbf24' : '#94a3b8',
                          border: `1px solid ${
                            alarmTime
                              ? 'rgba(245, 158, 11, 0.3)'
                              : 'rgba(100, 116, 139, 0.3)'
                          }`,
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        User
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: '#60a5fa',
                          maxWidth: '120px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {currentUser?.name || currentUser?.email || 'Unknown'}
                      </Typography>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Session Time
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          color: hasRunningTask ? '#34d399' : '#94a3b8',
                        }}
                      >
                        {formatTimeSimple(elapsedTime)}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                {/* Quick Actions */}
                {!hasRunningTask && !hasPausedTask && (
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: 'rgba(30, 41, 59, 0.4)',
                      borderRadius: 3,
                      border: '2px dashed rgba(255, 255, 255, 0.2)',
                      textAlign: 'center',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.7,
                        mb: 2,
                        fontWeight: 500,
                      }}
                    >
                      💡 Quick Tip
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.6,
                        lineHeight: 1.4,
                        display: 'block',
                      }}
                    >
                      Start a task or meeting to begin tracking your productivity. 
                      Set an alarm to get regular reminders during your work sessions.
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CombinedTimerCard;
