// import React, { useState, useMemo, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   Chip,
//   LinearProgress,
//   IconButton,
//   Collapse,
//   Stack,
//   useTheme,
//   alpha,
//   Fade,
// } from "@mui/material";
// import {
//   Task as TaskIcon,
//   Business as MeetingIcon,
//   ExpandMore,
//   ExpandLess,
//   Timer,
//   PlayArrow,
//   PauseCircle,
//   CheckCircle,
//   TrendingUp,
// } from "@mui/icons-material";
// import type { Task } from "../TableUI/types/TaskHistoryTypes";

// interface DailyTimeTrackingCardProps {
//   tasks: Task[];
//   formatTime: (seconds: number) => string;
//   currentUser: any;
//   isRunning?: boolean;
//   currentTask?: Task | null;
// }

// interface DailyTaskSummary {
//   taskName: string;
//   taskId: string;
//   type: "task" | "meeting";
//   totalSeconds: number;
//   status: string;
//   isActive: boolean;
//   lastActivity?: string;
// }

// const DailyTimeTrackingCard: React.FC<DailyTimeTrackingCardProps> = ({
//   tasks,
//   formatTime,
//   currentUser,
//   isRunning = false,
//   currentTask = null,
// }) => {
//   const theme = useTheme();
//   const [expanded, setExpanded] = useState(false);
//   const [currentTime, setCurrentTime] = useState(new Date());

//   useEffect(() => {
//     const interval = setInterval(() => setCurrentTime(new Date()), 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const calculateDailyData = useMemo(() => {
//     const userEmail = currentUser?.email || currentUser?.userEmail;
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const todayTasks = tasks.filter((task) => {
//       const isUserTask =
//         task.userEmail === userEmail ||
//         (task as any).assignedToEmail === userEmail;
//       if (!isUserTask) return false;

//       const hasActivityToday = task.activities?.some((activity: any) => {
//         const activityDate = new Date(activity.timestamp);
//         return activityDate >= todayStart && activityDate <= todayEnd;
//       });

//       const createdToday =
//         task.createdAt &&
//         new Date(task.createdAt) >= todayStart &&
//         new Date(task.createdAt) <= todayEnd;
//       return hasActivityToday || createdToday;
//     });

//     let totalSeconds = 0;
//     let taskSeconds = 0;
//     let meetingSeconds = 0;
//     const summaries: DailyTaskSummary[] = [];

//     todayTasks.forEach((task) => {
//       let taskTotalSeconds = 0;
//       let lastActivityTime: string | undefined;

//       if (task.activities?.length > 0) {
//         const todayActivities = task.activities
//           .filter((activity: any) => {
//             const activityDate = new Date(activity.timestamp);
//             return activityDate >= todayStart && activityDate <= todayEnd;
//           })
//           .sort(
//             (a: any, b: any) =>
//               new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
//           );

//         let sessionStart: Date | null = null;

//         todayActivities.forEach((activity: any) => {
//           const activityTime = new Date(activity.timestamp);
//           lastActivityTime = activity.timestamp;

//           if (activity.action === "started" || activity.action === "resumed") {
//             sessionStart = activityTime;
//           } else if (
//             activity.action === "paused" ||
//             activity.action === "ended"
//           ) {
//             if (sessionStart) {
//               taskTotalSeconds +=
//                 (activityTime.getTime() - sessionStart.getTime()) / 1000;
//               sessionStart = null;
//             }
//           }
//         });

//         if (sessionStart && ["started", "resumed"].includes(task.status)) {
//           taskTotalSeconds +=
//             (currentTime.getTime() - sessionStart.getTime()) / 1000;
//         }
//       }

//       if (taskTotalSeconds === 0 && task.totalDuration && task.createdAt) {
//         const createdToday =
//           new Date(task.createdAt) >= todayStart &&
//           new Date(task.createdAt) <= todayEnd;
//         if (createdToday) {
//           taskTotalSeconds = task.totalDuration;
//         }
//       }

//       if (taskTotalSeconds > 0) {
//         const isActive =
//           ["started", "resumed"].includes(task.status) &&
//           (currentTask?.taskId === task.taskId || isRunning);

//         summaries.push({
//           taskName: task.taskName,
//           taskId: task.taskId,
//           type: task.type,
//           totalSeconds: taskTotalSeconds,
//           status: task.status,
//           isActive,
//           lastActivity: lastActivityTime,
//         });

//         totalSeconds += taskTotalSeconds;
//         if (task.type === "meeting") {
//           meetingSeconds += taskTotalSeconds;
//         } else {
//           taskSeconds += taskTotalSeconds;
//         }
//       }
//     });

//     return {
//       totalSeconds,
//       taskSeconds,
//       meetingSeconds,
//       summaries: summaries.sort((a, b) => b.totalSeconds - a.totalSeconds),
//       progress: (totalSeconds / (8 * 60 * 60)) * 100,
//     };
//   }, [tasks, currentUser, currentTime, currentTask, isRunning]);

//   const getStatusIcon = (status: string, isActive: boolean) => {
//     if (isActive)
//       return <PlayArrow sx={{ fontSize: 14, color: "success.main" }} />;
//     if (status === "paused")
//       return <PauseCircle sx={{ fontSize: 14, color: "warning.main" }} />;
//     if (status === "ended")
//       return <CheckCircle sx={{ fontSize: 14, color: "grey.500" }} />;
//     return <Timer sx={{ fontSize: 14, color: "info.main" }} />;
//   };

//   const getProgressColor = () => {
//     if (calculateDailyData.progress >= 100) return "success.main";
//     if (calculateDailyData.progress >= 75) return "warning.main";
//     return "primary.main";
//   };

//   return (
//     <Card
//       elevation={0}
//       sx={{
//         border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
//         borderRadius: 3,
//         overflow: "hidden",
//         bgcolor: "background.paper",
//       }}
//     >
//       <CardContent sx={{ p: 2 }}>
//         {/* Compact Header */}
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             mb: 2,
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//             <Box
//               sx={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: 2,
//                 bgcolor: alpha(theme.palette.primary.main, 0.1),
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Timer sx={{ color: "primary.main", fontSize: 20 }} />
//             </Box>
//             <Box>
//               <Typography
//                 variant="h6"
//                 sx={{ fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.2 }}
//               >
//                 Today
//               </Typography>
//               <Typography
//                 variant="body2"
//                 sx={{ color: "text.secondary", fontSize: "0.85rem" }}
//               >
//                 {formatTime(calculateDailyData.totalSeconds)}
//               </Typography>
//             </Box>
//           </Box>
//           <IconButton
//             size="small"
//             onClick={() => setExpanded(!expanded)}
//             sx={{
//               bgcolor: alpha(theme.palette.primary.main, 0.08),
//               "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.15) },
//               border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
//             }}
//           >
//             {expanded ? (
//               <ExpandLess fontSize="small" />
//             ) : (
//               <ExpandMore fontSize="small" />
//             )}
//           </IconButton>
//         </Box>

//         {/* Compact Stats */}
//         <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
//           <Box
//             sx={{
//               flex: 1,
//               p: 1.5,
//               bgcolor: alpha(theme.palette.success.main, 0.05),
//               borderRadius: 2,
//               border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
//             }}
//           >
//             <Box
//               sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
//             >
//               <TaskIcon sx={{ fontSize: 16, color: "success.main" }} />
//               <Typography
//                 variant="body2"
//                 sx={{ fontWeight: 600, color: "success.main" }}
//               >
//                 Tasks
//               </Typography>
//             </Box>
//             <Typography
//               variant="h6"
//               sx={{
//                 fontFamily: "monospace",
//                 fontWeight: 700,
//                 fontSize: "1.1rem",
//               }}
//             >
//               {formatTime(calculateDailyData.taskSeconds)}
//             </Typography>
//           </Box>

//           <Box
//             sx={{
//               flex: 1,
//               p: 1.5,
//               bgcolor: alpha(theme.palette.info.main, 0.05),
//               borderRadius: 2,
//               border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
//             }}
//           >
//             <Box
//               sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
//             >
//               <MeetingIcon sx={{ fontSize: 16, color: "info.main" }} />
//               <Typography
//                 variant="body2"
//                 sx={{ fontWeight: 600, color: "info.main" }}
//               >
//                 Meetings
//               </Typography>
//             </Box>
//             <Typography
//               variant="h6"
//               sx={{
//                 fontFamily: "monospace",
//                 fontWeight: 700,
//                 fontSize: "1.1rem",
//               }}
//             >
//               {formatTime(calculateDailyData.meetingSeconds)}
//             </Typography>
//           </Box>
//         </Stack>

//         {/* Progress Bar */}
//         <Box sx={{ mb: 2 }}>
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               mb: 1,
//             }}
//           >
//             <Typography variant="caption" sx={{ color: "text.secondary" }}>
//               Daily Progress
//             </Typography>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//               <TrendingUp sx={{ fontSize: 12, color: getProgressColor() }} />
//               <Typography
//                 variant="caption"
//                 sx={{ fontWeight: 600, color: getProgressColor() }}
//               >
//                 {Math.min(calculateDailyData.progress, 100).toFixed(0)}%
//               </Typography>
//             </Box>
//           </Box>
//           <LinearProgress
//             variant="determinate"
//             value={Math.min(calculateDailyData.progress, 100)}
//             sx={{
//               height: 4,
//               borderRadius: 2,
//               bgcolor: alpha(theme.palette.grey[400], 0.15),
//               "& .MuiLinearProgress-bar": {
//                 borderRadius: 2,
//                 bgcolor: getProgressColor(),
//               },
//             }}
//           />
//         </Box>

//         {/* Live Status */}
//         {isRunning && currentTask && (
//           <Fade in>
//             <Box
//               sx={{
//                 p: 1.5,
//                 bgcolor: alpha(theme.palette.success.main, 0.08),
//                 borderRadius: 2,
//                 border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
//                 mb: 2,
//               }}
//             >
//               <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                 <PlayArrow sx={{ fontSize: 16, color: "success.main" }} />
//                 <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
//                   {currentTask.taskName}
//                 </Typography>
//                 <Chip
//                   label={currentTask.type}
//                   size="small"
//                   variant="outlined"
//                   sx={{
//                     height: 20,
//                     fontSize: "0.7rem",
//                     borderColor: "success.main",
//                     color: "success.main",
//                   }}
//                 />
//               </Box>
//             </Box>
//           </Fade>
//         )}

//         {/* Expandable Details */}
//         <Collapse in={expanded}>
//           <Box sx={{ mt: 2 }}>
//             <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
//               Task Details ({calculateDailyData.summaries.length})
//             </Typography>

//             {calculateDailyData.summaries.length === 0 ? (
//               <Typography
//                 variant="body2"
//                 sx={{ color: "text.secondary", textAlign: "center", py: 2 }}
//               >
//                 No tasks tracked today
//               </Typography>
//             ) : (
//               <Stack spacing={1}>
//                 {calculateDailyData.summaries.map((summary) => (
//                   <Box
//                     key={summary.taskId}
//                     sx={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 1.5,
//                       p: 1.5,
//                       bgcolor: alpha(theme.palette.background.default, 0.7),
//                       borderRadius: 2,
//                       border: summary.isActive
//                         ? `2px solid ${alpha(theme.palette.success.main, 0.3)}`
//                         : "none",
//                     }}
//                   >
//                     <Box
//                       sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
//                     >
//                       {summary.type === "meeting" ? (
//                         <MeetingIcon
//                           sx={{ fontSize: 16, color: "info.main" }}
//                         />
//                       ) : (
//                         <TaskIcon
//                           sx={{ fontSize: 16, color: "success.main" }}
//                         />
//                       )}
//                       {getStatusIcon(summary.status, summary.isActive)}
//                     </Box>

//                     <Box sx={{ flex: 1, minWidth: 0 }}>
//                       <Typography
//                         variant="body2"
//                         sx={{ fontWeight: 500 }}
//                         noWrap
//                       >
//                         {summary.taskName}
//                       </Typography>
//                       <Typography
//                         variant="caption"
//                         sx={{ color: "text.secondary" }}
//                       >
//                         {summary.lastActivity
//                           ? `Last: ${new Date(
//                               summary.lastActivity
//                             ).toLocaleTimeString()}`
//                           : "No activity"}
//                       </Typography>
//                     </Box>

//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: "monospace",
//                         fontWeight: 700,
//                         minWidth: 60,
//                       }}
//                     >
//                       {formatTime(summary.totalSeconds)}
//                     </Typography>
//                   </Box>
//                 ))}
//               </Stack>
//             )}

//             {/* Compact Stats */}
//             {calculateDailyData.summaries.length > 0 && (
//               <Box
//                 sx={{
//                   mt: 2,
//                   p: 1.5,
//                   bgcolor: alpha(theme.palette.background.default, 0.5),
//                   borderRadius: 2,
//                   display: "flex",
//                   justifyContent: "space-around",
//                   gap: 1,
//                 }}
//               >
//                 <Box sx={{ textAlign: "center" }}>
//                   <Typography
//                     variant="caption"
//                     sx={{ color: "text.secondary" }}
//                   >
//                     Avg/Task
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     sx={{ fontFamily: "monospace", fontWeight: 600 }}
//                   >
//                     {formatTime(
//                       calculateDailyData.totalSeconds /
//                         calculateDailyData.summaries.length
//                     )}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ textAlign: "center" }}>
//                   <Typography
//                     variant="caption"
//                     sx={{ color: "text.secondary" }}
//                   >
//                     Top Task
//                   </Typography>
//                   <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
//                     {calculateDailyData.summaries[0]?.taskName.substring(
//                       0,
//                       12
//                     ) || "None"}
//                     {calculateDailyData.summaries[0]?.taskName.length > 12 &&
//                       "..."}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ textAlign: "center" }}>
//                   <Typography
//                     variant="caption"
//                     sx={{ color: "text.secondary" }}
//                   >
//                     Efficiency
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     sx={{ fontWeight: 600, color: getProgressColor() }}
//                   >
//                     {calculateDailyData.progress >= 100
//                       ? "Excellent"
//                       : calculateDailyData.progress >= 75
//                       ? "Good"
//                       : calculateDailyData.progress >= 50
//                       ? "Average"
//                       : "Low"}
//                   </Typography>
//                 </Box>
//               </Box>
//             )}
//           </Box>
//         </Collapse>
//       </CardContent>
//     </Card>
//   );
// };

// export default DailyTimeTrackingCard;
import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
  Avatar,
  Tooltip,
  Stack,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Today,
  Timer,
  Task as TaskIcon,
  Business as MeetingIcon,
  TrendingUp,
  Schedule
} from '@mui/icons-material';
import type { Task } from '../TableUI/types/TaskHistoryTypes';

interface DailyTimeTrackingCardProps {
  tasks: Task[];
  formatTime: (seconds: number) => string;
  currentUser: any;
  isRunning?: boolean;
  currentTask?: Task | null;
}

interface DailyTaskSummary {
  taskName: string;
  taskId: string;
  type: 'task' | 'meeting';
  totalMinutes: number;
  totalSeconds: number;
  status: string;
  activities: any[];
  isActive: boolean;
  lastActivity?: string;
}

// Helper functions (keep the same)
const safeToDate = (timestamp: string | number | Date | undefined): Date | null => {
  if (!timestamp) return null;
  try {
    if (timestamp instanceof Date) return timestamp;
    return new Date(timestamp);
  } catch (error) {
    console.warn('Invalid timestamp:', timestamp);
    return null;
  }
};

const safeToString = (timestamp: string | number | Date | undefined): string | undefined => {
  if (!timestamp) return undefined;
  try {
    if (typeof timestamp === 'string') return timestamp;
    if (timestamp instanceof Date) return timestamp.toISOString();
    if (typeof timestamp === 'number') return new Date(timestamp).toISOString();
    return undefined;
  } catch (error) {
    console.warn('Invalid timestamp for string conversion:', timestamp);
    return undefined;
  }
};

const DailyTimeTrackingCard: React.FC<DailyTimeTrackingCardProps> = ({
  tasks,
  formatTime,
  currentUser,
  isRunning = false,
  currentTask = null
}) => {
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const todayStart = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const todayEnd = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  }, []);

  const todaysTasks = useMemo(() => {
    const userEmail = currentUser?.email || currentUser?.userEmail;
    
    return tasks.filter(task => {
      const isUserTask = task.userEmail === userEmail || 
                        (task as any).assignedToEmail === userEmail;
      
      if (!isUserTask) return false;

      const hasActivityToday = task.activities?.some((activity: any) => {
        const activityDate = safeToDate(activity.timestamp);
        return activityDate && activityDate >= todayStart && activityDate <= todayEnd;
      });

      const createdToday = task.createdAt && 
        safeToDate(task.createdAt) && 
        safeToDate(task.createdAt)! >= todayStart && 
        safeToDate(task.createdAt)! <= todayEnd;

      return hasActivityToday || createdToday;
    });
  }, [tasks, currentUser, todayStart, todayEnd]);

  const dailySummary = useMemo(() => {
    const taskSummaries: DailyTaskSummary[] = [];
    let totalTaskMinutes = 0;
    let totalMeetingMinutes = 0;
    let totalTaskSeconds = 0;
    let totalMeetingSeconds = 0;

    todaysTasks.forEach(task => {
      let taskTotalSeconds = 0;
      let lastActivityTime: string | undefined;

      if (task.activities && task.activities.length > 0) {
        const todayActivities = task.activities.filter((activity: any) => {
          const activityDate = safeToDate(activity.timestamp);
          return activityDate && activityDate >= todayStart && activityDate <= todayEnd;
        });

        todayActivities.sort((a: any, b: any) => {
          const dateA = safeToDate(a.timestamp);
          const dateB = safeToDate(b.timestamp);
          if (!dateA || !dateB) return 0;
          return dateA.getTime() - dateB.getTime();
        });

        let sessionStart = null as Date | null;
        
        todayActivities.forEach((activity: any) => {
          const activityTime = safeToDate(activity.timestamp);
          if (!activityTime) return;
          
          lastActivityTime = safeToString(activity.timestamp);

          switch (activity.action) {
            case 'started':
            case 'resumed':
              sessionStart = activityTime;
              break;
            
            case 'paused':
            case 'ended':
              if (sessionStart !== null && activityTime) {
                const sessionDuration = (activityTime.getTime() - sessionStart.getTime()) / 1000;
                taskTotalSeconds += sessionDuration;
                sessionStart = null;
              }
              break;
          }
        });

        if (sessionStart !== null && ['started', 'resumed'].includes(task.status)) {
          const currentDuration = (currentTime.getTime() - sessionStart.getTime()) / 1000;
          taskTotalSeconds += currentDuration;
        }
      }

      if (taskTotalSeconds === 0 && task.totalDuration) {
        const createdToday = task.createdAt && 
          safeToDate(task.createdAt) && 
          safeToDate(task.createdAt)! >= todayStart && 
          safeToDate(task.createdAt)! <= todayEnd;
        
        if (createdToday) {
          taskTotalSeconds = task.totalDuration;
        }
      }

      if (taskTotalSeconds > 0) {
        const taskMinutes = Math.round(taskTotalSeconds / 60);
        const isActive = ['started', 'resumed'].includes(task.status) && 
                        (currentTask?.taskId === task.taskId || isRunning);

        taskSummaries.push({
          taskName: task.taskName,
          taskId: task.taskId,
          type: task.type,
          totalMinutes: taskMinutes,
          totalSeconds: taskTotalSeconds,
          status: task.status,
          activities: task.activities || [],
          isActive,
          lastActivity: lastActivityTime
        });

        if (task.type === 'meeting') {
          totalMeetingMinutes += taskMinutes;
          totalMeetingSeconds += taskTotalSeconds;
        } else {
          totalTaskMinutes += taskMinutes;
          totalTaskSeconds += taskTotalSeconds;
        }
      }
    });

    taskSummaries.sort((a, b) => b.totalSeconds - a.totalSeconds);

    return {
      taskSummaries,
      totalTaskMinutes,
      totalMeetingMinutes,
      totalTaskSeconds,
      totalMeetingSeconds,
      totalMinutes: totalTaskMinutes + totalMeetingMinutes,
      totalSeconds: totalTaskSeconds + totalMeetingSeconds
    };
  }, [todaysTasks, currentTime, currentTask, isRunning, todayStart, todayEnd]);

  const workdayProgress = (dailySummary.totalMinutes / 480) * 100;

  const getStatusColor = (status: string, isActive: boolean) => {
    if (isActive) return '#10b981';
    switch (status) {
      case 'started': return '#10b981';
      case 'resumed': return '#3b82f6';
      case 'paused': return '#f59e0b';
      case 'ended': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (dailySummary.totalSeconds === 0) {
    return (
      <Card 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
          mb: 2
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Today />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Daily Tracking
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                No activity today yet
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 3,
        mb: 2,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          pb: 2,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
              <Timer sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {formatTime(dailySummary.totalSeconds)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Today • {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {Math.min(workdayProgress, 100).toFixed(0)}%
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              of 8h goal
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ px: 3, pb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(workdayProgress, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                bgcolor: workdayProgress >= 100 ? '#10b981' : 
                        workdayProgress >= 75 ? '#f59e0b' : '#ffffff',
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* Stats Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: 2, 
          px: 3, 
          pb: 2 
        }}>
          <Box sx={{ 
            bgcolor: 'rgba(255,255,255,0.15)', 
            borderRadius: 2, 
            p: 2,
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TaskIcon sx={{ fontSize: 16, opacity: 0.8 }} />
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>
                Tasks
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
              {formatTime(dailySummary.totalTaskSeconds)}
            </Typography>
          </Box>

          <Box sx={{ 
            bgcolor: 'rgba(255,255,255,0.15)', 
            borderRadius: 2, 
            p: 2,
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MeetingIcon sx={{ fontSize: 16, opacity: 0.8 }} />
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>
                Meetings
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
              {formatTime(dailySummary.totalMeetingSeconds)}
            </Typography>
          </Box>

          <Box sx={{ 
            bgcolor: 'rgba(255,255,255,0.15)', 
            borderRadius: 2, 
            p: 2,
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Schedule sx={{ fontSize: 16, opacity: 0.8 }} />
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>
                Tasks
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {dailySummary.taskSummaries.length}
            </Typography>
          </Box>
        </Box>

        {/* Current Task Alert */}
        {isRunning && currentTask && (
          <Box sx={{ 
            mx: 3, 
            mb: 2, 
            p: 2, 
            bgcolor: 'rgba(16, 185, 129, 0.2)', 
            borderRadius: 2,
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: '#10b981',
                animation: 'pulse 2s infinite'
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                               <strong>Active:</strong> {currentTask.taskName}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Expandable Details */}
        <Box sx={{ 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          bgcolor: 'rgba(255,255,255,0.05)'
        }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              py: 1.5,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
            onClick={() => setExpanded(!expanded)}
          >
            <Typography variant="body2" sx={{ mr: 1, fontWeight: 500 }}>
              {expanded ? 'Less Details' : 'More Details'}
            </Typography>
            <IconButton size="small" sx={{ color: 'white' }}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={expanded}>
            <Box sx={{ bgcolor: 'rgba(0,0,0,0.1)', p: 3 }}>
              {/* Task Breakdown */}
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Task Breakdown
              </Typography>
              
              <Stack spacing={1.5}>
                {dailySummary.taskSummaries.slice(0, 5).map((taskSummary, index) => (
                  <Box 
                    key={taskSummary.taskId}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderRadius: 2,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: getStatusColor(taskSummary.status, taskSummary.isActive),
                          fontSize: 14
                        }}
                      >
                        {taskSummary.type === 'meeting' ? 
                          <MeetingIcon sx={{ fontSize: 16 }} /> : 
                          <TaskIcon sx={{ fontSize: 16 }} />
                        }
                      </Avatar>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px'
                            }}
                          >
                            {taskSummary.taskName}
                          </Typography>
                          
                          {taskSummary.isActive && (
                            <Chip
                              label="LIVE"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                bgcolor: '#10b981',
                                color: 'white',
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          )}
                        </Box>
                        
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {taskSummary.status} • {taskSummary.type}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        fontWeight: 600,
                        minWidth: 'fit-content'
                      }}
                    >
                      {formatTime(taskSummary.totalSeconds)}
                    </Typography>
                  </Box>
                ))}
                
                {dailySummary.taskSummaries.length > 5 && (
                  <Box sx={{ textAlign: 'center', pt: 1 }}>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      +{dailySummary.taskSummaries.length - 5} more tasks
                    </Typography>
                  </Box>
                )}
              </Stack>

              {/* Quick Stats */}
              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: 2 
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {dailySummary.taskSummaries.length > 0 
                      ? formatTime(dailySummary.totalSeconds / dailySummary.taskSummaries.length)
                      : '0:00:00'
                    }
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Avg per Task
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {dailySummary.totalTaskMinutes > 0 || dailySummary.totalMeetingMinutes > 0
                      ? `${Math.round((dailySummary.totalTaskMinutes / (dailySummary.totalTaskMinutes + dailySummary.totalMeetingMinutes)) * 100)}%`
                      : '0%'
                    }
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Task Focus
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <TrendingUp sx={{ fontSize: 16 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {workdayProgress >= 100 ? 'Excellent' : 
                       workdayProgress >= 75 ? 'Good' : 
                       workdayProgress >= 50 ? 'Average' : 'Low'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Productivity
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </Box>
      </CardContent>
      
    {/* Add CSS animation for pulse effect */}
<style>{`
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`}</style>

    </Card>
  );
};

export default DailyTimeTrackingCard;

