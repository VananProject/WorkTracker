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
  Typography,
  Collapse,
  Avatar
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  PlayArrow,
  Stop,
  Person,
  Business,
  KeyboardArrowDown,
  KeyboardArrowRight,
  AdminPanelSettings,
  Repeat
} from '@mui/icons-material';
import ActivityTimeline from '../../components/ActivityTimeline';
import SummaryStatistics from '../../components/SummaryStatistics';
import type { Task, UserGroup } from '../../types/TaskHistoryTypes';
import { getLastActivityTime } from '../../utils/dateUtils';

interface AllUserTasksProps {
  tasks: Task[];
  formatTime: (seconds: number) => string;
  onTableAction: (task: Task, action: 'resume' | 'stop' | 'start') => void;
  isRunning: boolean;
  currentUser: any;
  calculatedDurations: Record<string, number>;
  onDurationCalculated: (taskId: string, duration: number) => void;
  expandedRows: Set<string>;
  onToggleRowExpansion: (id: string) => void;
  onToggleRecurring?: (task: Task) => void;
}

const AllUserTasks: React.FC<AllUserTasksProps> = ({
  tasks,
  formatTime,
  onTableAction,
  isRunning,
  currentUser,
  calculatedDurations,
  onDurationCalculated,
  expandedRows,
  onToggleRowExpansion,
  onToggleRecurring
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
  console.log('🎯 AllUserTasks.handleTaskAction:', { task: task.taskName, action });
  
  // Find if this task already exists in the tasks list
  const existingTask = tasks.find(t => t.taskId === task.taskId);
  
  let taskToProcess: Task;
  
  if (existingTask) {
    // Update existing task instead of creating new one
    console.log('🔄 Updating existing task in AllUserTasks');
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
    console.log('➕ Creating new task in AllUserTasks');
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
      // Preserve assignment fields
      assignedBy: (task as any).assignedBy,
      assignedTo: (task as any).assignedTo,
      assignedByEmail: (task as any).assignedByEmail,
      assignedToEmail: (task as any).assignedToEmail,
      isAssigned: (task as any).isAssigned
    };
  }
  
  console.log('✅ Processing task:', taskToProcess);
  onTableAction(taskToProcess, action);
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

  // Group tasks by user
 // Add this validation in the groupTasksByUser function
const groupTasksByUser = (tasks: Task[]): UserGroup[] => {
  // Filter out invalid tasks first
  const validTasks = tasks.filter(task => {
    const isValid = task && 
                   task.taskId && 
                   task.taskName && 
                   task.taskName !== 'Untitled Task' &&
                   task.taskName.trim() !== '' &&
                   task.userEmail;
    
    if (!isValid) {
      console.warn('⚠️ AllUserTasks: Filtering out invalid task:', task);
    }
    
    return isValid;
  });

  const userGroups: { [email: string]: UserGroup } = {};

  validTasks.forEach(task => {
    const userEmail = task.userEmail || (task as any).user_email || 'unknown@example.com';
    const username = task.username || userEmail.split('@')[0] || 'Unknown User';

    if (!userGroups[userEmail]) {
      userGroups[userEmail] = {
        userEmail,
        username,
        totalTasks: 0,
        completedTasks: 0,
        activeTasks: 0,
        assignedTasks: 0,
        selfCreatedTasks: 0,
        totalDuration: 0,
        tasks: []
      };
    }

    const group = userGroups[userEmail];
    group.tasks.push(task);
    group.totalTasks++;
    group.totalDuration += task.totalDuration || 0;

    if (task.status === 'ended' || task.status === 'paused') {
      group.completedTasks++;
    } else if (['started', 'resumed', 'paused'].includes(task.status)) {
      group.activeTasks++;
    }

    if ((task as any).isAssigned) {
      group.assignedTasks++;
    } else {
      group.selfCreatedTasks++;
    }
  });

  return Object.values(userGroups).sort((a, b) => a.username.localeCompare(b.username));
};

  const userGroups = useMemo(() => groupTasksByUser(tasks), [tasks]);

  const paginatedGroups = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return userGroups.slice(startIndex, startIndex + rowsPerPage);
  }, [userGroups, page, rowsPerPage]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderUserRow = (userGroup: UserGroup) => {
    const isExpanded = expandedRows.has(userGroup.userEmail);
    
    return (
      <React.Fragment key={userGroup.userEmail}>
        <TableRow 
          hover 
          sx={{ 
            cursor: 'pointer',
            bgcolor: 'lightblue',
            '&:hover': { bgcolor: 'primary.main', color: 'white' }
          }}
          onClick={() => onToggleRowExpansion(userGroup.userEmail)}
        >
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small">
                {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
              </IconButton>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {userGroup.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {userGroup.username}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {userGroup.userEmail}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          <TableCell align="center">
            <Typography variant="h6" color="primary">
              {userGroup.totalTasks}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2" color="success.main">
              {userGroup.completedTasks}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2" color="warning.main">
              {userGroup.activeTasks}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2" color="info.main">
              {userGroup.assignedTasks}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2" color="secondary.main">
              {userGroup.tasks.filter((task: any) => (task as any).isRecurring).length}
            </Typography>
          </TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {formatTime(userGroup.totalDuration)}
              </Typography>
              {(() => {
                const calculatedTotal = userGroup.tasks.reduce((total: number, task: any) => 
                  total + getTaskDuration(task), 0
                );
                return calculatedTotal !== userGroup.totalDuration ? (
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
                    Calc: {formatTime(calculatedTotal)}
                  </Typography>
                ) : null;
              })()}
            </Box>
          </TableCell>
        </TableRow>
        
        {/* User's Tasks */}
        <TableRow>
          <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
            <Collapse in={isExpanded}>
              <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tasks for {userGroup.username}
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Task Details</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Last Activity</TableCell>
                      <TableCell>Recurring</TableCell>
                      {/* <TableCell>Actions</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userGroup.tasks.map((task: Task) => (
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
                            <Chip
                              label={task.isAssigned ? 'Assigned' : 'Self-created'}
                              size="small"
                              variant="outlined"
                              color={task.isAssigned ? 'secondary' : 'primary'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {getLastActivityTime(task)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {(task as any).isRecurring ? (
                                <Chip
                                  icon={<Repeat />}
                                  label={(task as any).recurringType || 'Active'}
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                />
                              ) : (
                                <Button
                                  size="small"
                                  startIcon={<Repeat />}
                                  onClick={() => onToggleRecurring?.(task)}
                                  variant="outlined"
                                  color="primary"
                                >
                                  Set Recurring
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                       
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
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  if (userGroups.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <AdminPanelSettings sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No User Tasks Found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          No user tasks found matching the current filters.
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
              <TableCell>User</TableCell>
              <TableCell align="center">Total Tasks</TableCell>
              <TableCell align="center">Completed</TableCell>
              <TableCell align="center">Active</TableCell>
              <TableCell align="center">Assigned</TableCell>
              <TableCell align="center">Recurring</TableCell>
              <TableCell align="center">Total Duration</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedGroups.map((userGroup: UserGroup) => renderUserRow(userGroup))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={userGroups.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        showFirstButton
        showLastButton
      />

      <SummaryStatistics
        data={userGroups}
        isAdmin={true}
        formatTime={formatTime}
      />
    </>
  );
};

export default AllUserTasks;
