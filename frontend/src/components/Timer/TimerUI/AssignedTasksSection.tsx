

import React, { useState } from 'react';
import {
  Card,
  Box,
  Typography,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
  Badge,
  Tabs,
  Tab,
  Collapse,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Assignment,
  MeetingRoom,
  Schedule,
  Person,
  PriorityHigh,
  Warning,
  CheckCircle,
  NotificationsActive,
  PersonAdd,
  PersonOutline,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

interface AssignedTask {
  taskId: string;
  taskName: string;
  type: 'task' | 'meeting';
  status?: 'pending' | 'started' | 'paused' | 'resumed' | 'ended' | 'completed' | 'finished' | 'done' | 'assigned';
  startDate: string;
  endDate?: string;
  description?: string;
  estimatedTime?: string;
  dueDate?: string;
  assignedBy?: {
    username: string;
    email: string;
  };
  createdBy?: string;
  assignedToEmail?: string;
  userEmail?: string; // The task creator's email
}

interface TimerState {
  isRunning: boolean;
  currentTask?: any;
}

interface AssignedTasksSectionProps {
  assignedTasks: AssignedTask[];
  state: TimerState;
  onStartAssignedTask: (task: AssignedTask) => void;
  onResumeTask?: (task: AssignedTask) => void;
  onPauseTask?: (task: AssignedTask) => void;
  onStopTask?: (task: AssignedTask) => void;
  currentUser?: {
    email: string;
    username: string;
    role: string;
  };
}

const AssignedTasksSection: React.FC<AssignedTasksSectionProps> = ({
  assignedTasks,
  state,
  onStartAssignedTask,
  onResumeTask,
  onPauseTask,
  onStopTask,
  currentUser
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    assignedToMe: true,
    assignedByMe: true
  });
const getDueDateStatus = (dueDate?: string) => {
  if (!dueDate) return null;
  
  try {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { 
        status: 'overdue', 
        text: `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} overdue`,
        color: 'error.main',
        bgColor: 'error.50'
      };
    } else if (diffDays === 0) {
      return { 
        status: 'today', 
        text: 'Due today',
        color: 'warning.main',
        bgColor: 'warning.50'
      };
    } else if (diffDays <= 3) {
      return { 
        status: 'soon', 
        text: `${diffDays} day${diffDays > 1 ? 's' : ''} left`,
        color: 'warning.main',
        bgColor: 'warning.50'
      };
    } else {
      return { 
        status: 'normal', 
        text: `${diffDays} day${diffDays > 1 ? 's' : ''} left`,
        color: 'success.main',
        bgColor: 'success.50'
      };
    }
  } catch {
    return null;
  }
};
  // Get current user email
  const getCurrentUserEmail = () => {
    if (currentUser?.email) return currentUser.email;
    
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.email;
      }
    } catch (error) {
      console.error('Error getting user email:', error);
    }
    return null;
  };

  const userEmail = getCurrentUserEmail();

  // Filter for ACTIVE tasks only
  const getActiveTasks = (tasks: AssignedTask[]) => {
    return tasks.filter(task => {
      if (!task || typeof task !== 'object' || !task.taskId || !task.taskName) {
        return false;
      }
      
      const excludedStatuses = ['ended', 'completed', 'finished', 'done'];
      if (task.status && excludedStatuses.includes(task.status.toLowerCase())) {
        return false;
      }
      
      const activeStatuses = ['pending', 'started', 'paused', 'resumed', 'assigned'];
      return !task.status || activeStatuses.includes(task.status.toLowerCase());
    });
  };

 // Separate tasks into two categories
const activeTasks = getActiveTasks(assignedTasks);

console.log('🔍 Debug - Current user email:', userEmail);
console.log('📋 Debug - All active tasks:', activeTasks);

// Enhanced categorization with comprehensive debugging
const tasksAssignedToMe = activeTasks.filter(task => {
  const isAssignedToMe = task.assignedToEmail === userEmail;
  
  console.log(`📝 Task "${task.taskName}" assigned TO me check:`, {
    taskId: task.taskId,
    assignedToEmail: task.assignedToEmail,
    userEmail: task.userEmail,
    assignedBy: task.assignedBy,
    isAssignedToMe,
    myEmail: userEmail
  });
  
  return isAssignedToMe;
});

// Update the categorization logic in AssignedTasksSection
const tasksAssignedByMe = activeTasks.filter(task => {
  // Enhanced logic to catch all possible assignment scenarios
  const assignedByEmail = (task as any).assignedByEmail || 
                         (task as any).assignedBy?.email || 
                         (task as any).assignedBy;
  const createdByEmail = (task as any).createdBy;
  const taskOwnerEmail = task.userEmail;
  const assignedToEmail = (task as any).assignedToEmail || 
                         (task as any).assignedTo || 
                         (task as any).assigned_to;
  
  // Task is assigned BY me if:
  const isAssignedByMe = (
    // 1. I'm explicitly in the assignedByEmail field and it's assigned to someone else
    (assignedByEmail === userEmail && assignedToEmail && assignedToEmail !== userEmail) ||
    
    // 2. I created the task and assigned it to someone else (with isAssigned flag)
    (createdByEmail === userEmail && assignedToEmail && assignedToEmail !== userEmail && (task as any).isAssigned) ||
    
    // 3. Task has assignment fields and I'm the assigner
    ((task as any).isAssigned && assignedByEmail === userEmail && assignedToEmail && assignedToEmail !== userEmail) ||
    
    // 4. I'm in assignedBy object and it's assigned to someone else
    ((task as any).assignedBy?.email === userEmail && assignedToEmail && assignedToEmail !== userEmail)
  );
  
  console.log(`📤 Enhanced Task "${task.taskName}" assigned BY me check:`, {
    taskId: task.taskId,
    assignedByEmail,
    createdByEmail,
    taskOwnerEmail,
    assignedToEmail,
    isAssigned: (task as any).isAssigned,
    isAssignedByMe,
    myEmail: userEmail,
    userRole: currentUser?.role
  });
  
  return isAssignedByMe;
});


// Remove duplicates
const uniqueTasksAssignedByMe = tasksAssignedByMe.filter(task => 
  !tasksAssignedToMe.some(assignedTask => assignedTask.taskId === task.taskId)
);

console.log('✅ Final categorization for ALL users:', {
  tasksAssignedToMe: tasksAssignedToMe.length,
  tasksAssignedByMe: uniqueTasksAssignedByMe.length,
  userEmail,
  userRole: currentUser?.role,
  totalActiveTasks: activeTasks.length
});


 // Remove any isAdmin variables or checks
// const isAdmin = currentUser?.role === 'admin'; // REMOVE THIS LINE

// Make sure all sections render for all users
if (tasksAssignedToMe.length === 0 && uniqueTasksAssignedByMe.length === 0) {
  return null;
}

  // Utility functions
  const getTaskIcon = (type: 'task' | 'meeting') => {
    return type === 'meeting' ? MeetingRoom : Assignment;
  };

  const getTaskColor = (type: 'task' | 'meeting') => {
    return type === 'meeting' ? theme.palette.secondary.main : theme.palette.primary.main;
  };

  const getPriorityInfo = (dueDate?: string) => {
    if (!dueDate) return { priority: 'none', color: theme.palette.grey[400], icon: null };
    
    try {
      const due = new Date(dueDate);
      const now = new Date();
      const diff = due.getTime() - now.getTime();
      const hoursUntilDue = diff / (1000 * 60 * 60);
      
      if (hoursUntilDue < 0) {
        return { priority: 'overdue', color: theme.palette.error.main, icon: PriorityHigh };
      }
      if (hoursUntilDue < 24) {
        return { priority: 'urgent', color: theme.palette.warning.main, icon: Warning };
      }
      return { priority: 'normal', color: theme.palette.success.main, icon: CheckCircle };
    } catch {
      return { priority: 'none', color: theme.palette.grey[400], icon: null };
    }
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return '';
    
    try {
      const due = new Date(dueDate);
      const now = new Date();
      const diff = due.getTime() - now.getTime();
      
      if (diff < 0) return 'Overdue';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) return `${days}d`;
      if (hours > 0) return `${hours}h`;
      return 'Soon';
    } catch {
      return '';
    }
  };

  const isTaskRunning = (task: AssignedTask) => {
    return state.isRunning && 
           state.currentTask && 
           state.currentTask.taskId === task.taskId;
  };

  const isTaskPaused = (task: AssignedTask) => {
    return state.currentTask && 
           state.currentTask.taskId === task.taskId && 
           !state.isRunning;
  };

  const isCurrentTask = (task: AssignedTask) => {
    return state.currentTask && state.currentTask.taskId === task.taskId;
  };

  const getActionButton = (task: AssignedTask, isAssignedToMe: boolean) => {
    const running = isTaskRunning(task);
    const paused = isTaskPaused(task);
    
    // If task is currently running, show only running status - NO BUTTONS
    if (running) {
      return (
        <Typography 
          variant="caption" 
          sx={{ 
            color: theme.palette.success.main,
            fontWeight: 600,
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: theme.palette.success.main,
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.6, transform: 'scale(1.2)' }
              }
            }}
          />
          Running
        </Typography>
      );
    }

    // If this specific task is paused, show only paused status - NO BUTTONS
    if (paused) {
      return (
        <Typography 
          variant="caption" 
          sx={{ 
            color: theme.palette.warning.main,
            fontWeight: 600,
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: theme.palette.warning.main,
              animation: 'blink 1.5s infinite',
              '@keyframes blink': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.4 }
              }
            }}
          />
          Paused
        </Typography>
      );
    }

    // Only show start button for tasks assigned TO me
    if (isAssignedToMe && !state.isRunning) {
      return (
        <Tooltip title="Start Task">
          <IconButton
            size="small"
            onClick={() => onStartAssignedTask(task)}
            sx={{
              width: 32,
              height: 32,
              bgcolor: alpha(getTaskColor(task.type), 0.1),
              color: getTaskColor(task.type),
              '&:hover': {
                bgcolor: alpha(getTaskColor(task.type), 0.2),
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <PlayArrow sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      );
    }

    // For tasks assigned BY me, show status only
    if (!isAssignedToMe) {
      return (
        <Typography 
          variant="caption" 
          sx={{ 
            color: theme.palette.info.main,
            fontWeight: 500,
            fontSize: '0.75rem',
            fontStyle: 'italic'
          }}
        >
          Assigned
        </Typography>
      );
    }

    // If timer is running (another task), show waiting status
    if (state.isRunning) {
      return (
        <Typography 
          variant="caption" 
          sx={{ 
            color: theme.palette.text.disabled,
            fontWeight: 500,
            fontSize: '0.75rem',
            fontStyle: 'italic'
          }}
        >
          Waiting
        </Typography>
      );
    }

    return null;
  };

  const getTaskStatusIndicator = (task: AssignedTask) => {
    const running = isTaskRunning(task);
    const paused = isTaskPaused(task);

    if (running) {
      return (
        <Chip
          label="Running"
          size="small"
          sx={{
            height: 20,
            fontSize: '0.65rem',
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: theme.palette.success.main,
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            '& .MuiChip-label': { paddingLeft: '6px', paddingRight: '6px' },
            animation: 'glow 2s infinite',
            '@keyframes glow': {
              '0%, 100%': { boxShadow: `0 0 0 ${alpha(theme.palette.success.main, 0.3)}` },
              '50%': { boxShadow: `0 0 8px ${alpha(theme.palette.success.main, 0.5)}` }
            }
          }}
        />
      );
    }

    if (paused) {
      return (
        <Chip
          label="Paused"
          size="small"
          sx={{
            height: 20,
            fontSize: '0.65rem',
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            color: theme.palette.warning.main,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            '& .MuiChip-label': { paddingLeft: '6px', paddingRight: '6px' },
            animation: 'blink 2s infinite',
            '@keyframes blink': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.6 }
            }
          }}
        />
      );
    }

    return null;
  };

  const renderTaskList = (tasks: AssignedTask[], isAssignedToMe: boolean, sectionTitle: string) => {
    if (tasks.length === 0) return null;

    const sectionKey = isAssignedToMe ? 'assignedToMe' : 'assignedByMe';
    const isExpanded = expandedSections[sectionKey];

    return (
      <Box sx={{ mb: 2 }}>
        {/* Section Header */}
        <Box
          sx={{
            px: 2,
            py: 1,
            background: isAssignedToMe 
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
            borderBottom: `1px solid ${alpha(isAssignedToMe ? theme.palette.primary.main : theme.palette.secondary.main, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: alpha(isAssignedToMe ? theme.palette.primary.main : theme.palette.secondary.main, 0.05)
            }
          }}
          onClick={() => setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
          }))}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge 
              badgeContent={tasks.length} 
                            color={isAssignedToMe ? 'primary' : 'secondary'}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  minWidth: 16,
                  height: 16
                }
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(isAssignedToMe ? theme.palette.primary.main : theme.palette.secondary.main, 0.1),
                  color: isAssignedToMe ? theme.palette.primary.main : theme.palette.secondary.main,
                  width: 24,
                  height: 24
                }}
              >
                {isAssignedToMe ? <PersonOutline sx={{ fontSize: 14 }} /> : <PersonAdd sx={{ fontSize: 14 }} />}
              </Avatar>
            </Badge>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {sectionTitle}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Running indicator for this section */}
            {tasks.some(task => isTaskRunning(task)) && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.success.main,
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.6, transform: 'scale(1.2)' }
                  }
                }}
              />
            )}
            
            {/* Expand/Collapse Icon */}
            <IconButton size="small" sx={{ p: 0.5 }}>
              {isExpanded ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
            </IconButton>
          </Box>
        </Box>

        {/* Task List */}
        <Collapse in={isExpanded}>
          <Box
            sx={{
              maxHeight: 200,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: 4,
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(isAssignedToMe ? theme.palette.primary.main : theme.palette.secondary.main, 0.2),
                borderRadius: 2,
                '&:hover': {
                  background: alpha(isAssignedToMe ? theme.palette.primary.main : theme.palette.secondary.main, 0.3),
                },
              },
            }}
          >
            {tasks.map((task, index) => {
              const TaskTypeIcon = getTaskIcon(task.type);
              const priorityInfo = getPriorityInfo(task.dueDate);
              const running = isTaskRunning(task);
              const paused = isTaskPaused(task);
              const isCurrentTaskItem = isCurrentTask(task);
              const dueText = formatDueDate(task.dueDate);
              
              return (
                <Box
                  key={task.taskId}
                  sx={{
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    position: 'relative',
                    background: running 
                      ? `linear-gradient(90deg, ${alpha(theme.palette.success.main, 0.08)} 0%, transparent 100%)`
                      : paused
                      ? `linear-gradient(90deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, transparent 100%)`
                      : 'transparent',
                    borderLeft: running 
                      ? `3px solid ${theme.palette.success.main}` 
                      : paused 
                      ? `3px solid ${theme.palette.warning.main}`
                      : `3px solid ${alpha(isAssignedToMe ? theme.palette.primary.main : theme.palette.secondary.main, 0.1)}`,
                    borderBottom: index < tasks.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 'none',
                    transition: 'all 0.2s ease',
                    // Only dim tasks when timer is running (not when paused)
                    opacity: running ? 1 : state.isRunning ? 0.6 : 1,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.action.hover, 0.3),
                      transform: isCurrentTaskItem ? 'none' : 'translateX(2px)',
                      opacity: 1
                    }
                  }}
                >
                  {/* Task Type Icon */}
                  <Avatar
                    sx={{
                      bgcolor: alpha(getTaskColor(task.type), 0.1),
                      color: getTaskColor(task.type),
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      // Add special styling for current task
                      ...(running && {
                        bgcolor: alpha(theme.palette.success.main, 0.15),
                        color: theme.palette.success.main,
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.success.main, 0.2)}`,
                      }),
                      ...(paused && {
                        bgcolor: alpha(theme.palette.warning.main, 0.15),
                        color: theme.palette.warning.main,
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.warning.main, 0.2)}`,
                      })
                    }}
                  >
                    <TaskTypeIcon sx={{ fontSize: 14 }} />
                  </Avatar>

                  {/* Task Info */}
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {/* Task Name */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: running ? 600 : paused ? 500 : 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.85rem',
                        color: running 
                          ? theme.palette.success.dark 
                          : paused 
                          ? theme.palette.warning.dark 
                          : 'text.primary'
                      }}
                    >
                      {task.taskName}
                    </Typography>

                    {/* Task Details Row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                      {/* Task Status Indicator */}
                      {getTaskStatusIndicator(task)}

                      {/* Assigned By/To Info */}
                      {isAssignedToMe && task.assignedBy && (
                        <Chip
                          icon={<Person sx={{ fontSize: 12 }} />}
                          label={`By: ${task.assignedBy.username}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            '& .MuiChip-icon': { marginLeft: '4px' },
                            '& .MuiChip-label': { paddingLeft: '2px', paddingRight: '4px' }
                          }}
                        />
                      )}

                      {!isAssignedToMe && task.assignedToEmail && (
                        <Chip
                          icon={<PersonAdd sx={{ fontSize: 12 }} />}
                          label={`To: ${task.assignedToEmail.split('@')[0]}`}
                          size="small"
                          variant="outlined"
                          color="secondary"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            '& .MuiChip-icon': { marginLeft: '4px' },
                            '& .MuiChip-label': { paddingLeft: '2px', paddingRight: '4px' }
                          }}
                        />
                      )}

                      {/* Estimated Time */}
                      {task.estimatedTime && (
                        <Chip
                          icon={<Schedule sx={{ fontSize: 12 }} />}
                          label={task.estimatedTime}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            '& .MuiChip-icon': { marginLeft: '4px' },
                            '& .MuiChip-label': { paddingLeft: '2px', paddingRight: '4px' }
                          }}
                        />
                      )}

                      {/* Due Date with Priority */}
                      {dueText && (
                        <Chip
                          icon={priorityInfo.icon ? <priorityInfo.icon sx={{ fontSize: 12 }} /> : undefined}
                          label={dueText}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            bgcolor: alpha(priorityInfo.color, 0.1),
                            color: priorityInfo.color,
                            border: `1px solid ${alpha(priorityInfo.color, 0.3)}`,
                            '& .MuiChip-icon': { marginLeft: '4px', color: priorityInfo.color },
                            '& .MuiChip-label': { paddingLeft: '2px', paddingRight: '4px' }
                          }}
                        />
                      )}
                      {(() => {
    const dueDateStatus = getDueDateStatus(task.dueDate);
    return dueDateStatus ? (
      <Chip
        label={dueDateStatus.text}
        size="small"
        sx={{
          height: 18,
          fontSize: '0.6rem',
          bgcolor: dueDateStatus.bgColor,
          color: dueDateStatus.color,
          border: `1px solid ${dueDateStatus.color}`,
          '& .MuiChip-label': { paddingLeft: '4px', paddingRight: '4px' },
          ...(dueDateStatus.status === 'overdue' && {
            animation: 'blink 2s infinite',
            '@keyframes blink': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.7 }
            }
          })
        }}
      />
    ) : null;
  })()}
                    </Box>
                  </Box>

                  {/* Action Button Area */}
                  <Box sx={{ 
                    flexShrink: 0,
                    minWidth: isCurrentTaskItem ? 80 : 40,
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}>
                    {getActionButton(task, isAssignedToMe)}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Collapse>
      </Box>
    );
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
      }}
    >
 
        
        {state.isRunning && (
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: theme.palette.success.main,
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.6, transform: 'scale(1.2)' }
              }
            }}
          />
        )}
      

      {/* Task Sections */}
      <Box>
        {/* Tasks Assigned TO Me */}
        {renderTaskList(tasksAssignedToMe, true, "Tasks Assigned to Me")}
        
        {/* Divider between sections */}
        {tasksAssignedToMe.length > 0 && uniqueTasksAssignedByMe.length > 0 && (
          <Divider sx={{ mx: 2, my: 1 }} />
        )}
        
        {/* Tasks Assigned BY Me */}
        {renderTaskList(uniqueTasksAssignedByMe, false, "Tasks I Assigned")}
      </Box>

      {/* Current Task Status Message */}
      {state.currentTask && (
        <Box
          sx={{
            px: 2,
            py: 1,
            background: state.isRunning 
              ? alpha(theme.palette.success.main, 0.05)
              : alpha(theme.palette.warning.main, 0.05),
            borderTop: `1px solid ${alpha(
                            state.isRunning ? theme.palette.success.main : theme.palette.warning.main, 
              0.1
            )}`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: state.isRunning ? theme.palette.success.main : theme.palette.warning.main,
              fontSize: '0.7rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: state.isRunning ? theme.palette.success.main : theme.palette.warning.main,
                animation: state.isRunning ? 'pulse 1.5s infinite' : 'blink 1.5s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.6, transform: 'scale(1.2)' }
                },
                '@keyframes blink': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.4 }
                }
              }}
            />
            {state.isRunning 
              ? `"${state.currentTask.taskName}" is running - use timer controls to pause/stop`
              : `"${state.currentTask.taskName}" is paused - use timer controls to resume/stop`
            }
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default AssignedTasksSection;


