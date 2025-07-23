

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
  Avatar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select
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
  PersonAdd,
  Repeat,
  Info,
  Cancel,
  CheckCircle,
  Delete,
  Edit
} from '@mui/icons-material';
import ActivityTimeline from '../../components/ActivityTimeline';
import type { Task, UserGroup } from '../../types/TaskHistoryTypes';
import { getLastActivityTime } from '../../utils/dateUtils';
import RecurringDialog from '../RecurringTask/RecurringDialog';
import taskService, { deleteTask, editTask } from '../../../../../services/taskService';
// import { taskService } from '../../../../../services/taskService'; 
interface TasksIAssignedToOthersProps {
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
    onApproveTask?: (task: Task, comments?: string) => void;
  onRejectTask?: (task: Task, reason?: string) => void;
   onTaskUpdate?: () => void; 
   onRefreshTasks?: () => void;
}

const TasksIAssignedToOthers: React.FC<TasksIAssignedToOthersProps> = ({
  tasks,
  formatTime,
  onTableAction,
  isRunning,
  currentUser,
  calculatedDurations,
  onDurationCalculated,
  expandedRows,
  onToggleRowExpansion,
  onToggleRecurring,
  onApproveTask,
  onRejectTask,
  onTaskUpdate,
  onRefreshTasks
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
   const [dialogType, setDialogType] = React.useState<'approve' | 'reject' | null>(null);
    const [comments, setComments] = React.useState('');
const [approvalDialog, setApprovalDialog] = useState({
  open: false,
  task: null as Task | null,
  type: 'approve' as 'approve' | 'reject',
  comments: ''
});
const [editDialogOpen, setEditDialogOpen] = useState(false);
const [editingTask, setEditingTask] = useState<Task | null>(null);
const [editFormData, setEditFormData] = useState({
  taskName: '',
  description: '',
  type: 'task'
});

// Add these handlers
const handleEditTask = (task: Task) => {
  setEditingTask(task);
  setEditFormData({
    taskName: task.taskName,
    description: task.description || '',
    type: task.type
  });
  setEditDialogOpen(true);
};

// Update the handleSaveEdit method
const handleSaveEdit = async () => {
  if (!editingTask) return;
  
  try {
    const result = await editTask(editingTask.taskId, editFormData);
    if (result.success) {
      alert('Task updated successfully');
      setEditDialogOpen(false);
      setEditingTask(null);
      
      // ✅ Force immediate refresh
      if (onRefreshTasks) {
        console.log('🔄 TasksIAssignedToOthers: Refreshing tasks after edit');
        onRefreshTasks();
      }
    } else {
      alert('Failed to update task: ' + result.error);
    }
  } catch (error) {
    console.error('Error updating task:', error);
    alert('Failed to update task: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Update the handleDeleteTask method
const handleDeleteTask = async (task: Task) => {
  if (window.confirm(`Are you sure you want to delete "${task.taskName}"?`)) {
    try {
      const result = await deleteTask(task.taskId);
      if (result.success) {
        alert('Task deleted successfully');
        
        // ✅ Force immediate refresh
        if (onRefreshTasks) {
          console.log('🔄 TasksIAssignedToOthers: Refreshing tasks after delete');
          onRefreshTasks();
        }
      } else {
        alert('Failed to delete task: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
};

 // ✅ Get current user email helper
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
    
    return 'unknown@example.com';
  };

  const userEmail = getCurrentUserEmail();

  const handleApprove = (task: Task) => {
    console.log('🔧 Approving task:', task.taskName);
    setApprovalDialog({
      open: true,
      task,
      type: 'approve',
      comments: ''
    });
  };

  const handleReject = (task: Task) => {
    console.log('🔧 Rejecting task:', task.taskName);
    setApprovalDialog({
      open: true,
      task,
      type: 'reject',
      comments: ''
    });
  };

  // ✅ Implement actual API calls with correct parameters// ✅ Update the handleApprovalConfirm method
const handleApprovalConfirm = async () => {
  if (!approvalDialog.task) return;

  try {
    console.log(`🚀 ${approvalDialog.type === 'approve' ? 'Approving' : 'Rejecting'} task:`, {
      taskId: approvalDialog.task.taskId,
      taskName: approvalDialog.task.taskName,
      comments: approvalDialog.comments,
      userEmail: userEmail
    });

    let response;
    
    if (approvalDialog.type === 'approve') {
      // ✅ Call API to approve task with correct parameters
      response = await taskService.approveTask(
        approvalDialog.task.taskId,
        userEmail, // ✅ Pass approvedBy parameter
        approvalDialog.comments
      );
    } else {
      // ✅ Call API to reject task with correct parameters
      response = await taskService.rejectTask(
        approvalDialog.task.taskId,
        userEmail, // ✅ Pass rejectedBy parameter
        approvalDialog.comments
      );
    }

    // ✅ Handle response properly
    if (response && response.success) {
      console.log(`✅ Task ${approvalDialog.type}d successfully`);
      
      // Call parent callback if provided
      if (approvalDialog.type === 'approve' && onApproveTask) {
        onApproveTask(approvalDialog.task, approvalDialog.comments);
      } else if (approvalDialog.type === 'reject' && onRejectTask) {
        onRejectTask(approvalDialog.task, approvalDialog.comments);
      }
      
      // Refresh task list
      // ✅ Use onRefreshTasks instead of onTaskUpdate
      if (onRefreshTasks) {
        console.log('🔄 TasksIAssignedToOthers: Refreshing tasks after approval');
        onRefreshTasks();
      } else if (onTaskUpdate) {
        onTaskUpdate();
      }

      // Show success message
      alert(`Task "${approvalDialog.task.taskName}" ${approvalDialog.type}d successfully!`);
    } else {
      console.error(`❌ Failed to ${approvalDialog.type} task:`, response?.error || response?.message);
      alert(`Failed to ${approvalDialog.type} task: ${response?.error || response?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`❌ Error during ${approvalDialog.type}:`, error);
    alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // ✅ Close dialog
    setApprovalDialog({ open: false, task: null, type: 'approve', comments: '' });
  }
};


  const handleApprovalCancel = () => {
    setApprovalDialog({ open: false, task: null, type: 'approve', comments: '' });
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

  const handleRecurringClick = (task: Task) => {
    setSelectedTask(task);
    setRecurringDialogOpen(true);
  };

  const handleRecurringSave = (task: Task, recurringSettings: any) => {
    const updatedTask = {
      ...task,
      ...recurringSettings
    };
    
    onTableAction(updatedTask, 'start');
     if (onRefreshTasks) {
    console.log('🔄 TasksIAssignedToOthers: Refreshing tasks after recurring save');
    onRefreshTasks();
  }
    console.log(`✅ Task "${task.taskName}" recurring settings updated`);
  };

  const handleTaskAction = (task: Task, action: 'resume' | 'stop' | 'start') => {
    if (action === 'resume' || action === 'start') {
      const enhancedTask = {
        ...task,
        elapsedTime: task.totalDuration || 0,
        totalDuration: task.totalDuration || 0,
        resumedAt: new Date().toISOString(),
        id: task.taskId || task.id || '',
        taskId: task.taskId || task.id || '',
        assignedBy: (task as any).assignedBy,
        assignedTo: (task as any).assignedTo,
        assignedByEmail: (task as any).assignedByEmail,
        assignedToEmail: (task as any).assignedToEmail,
        isAssigned: (task as any).isAssigned
      };
      onTableAction(enhancedTask, action);
    } else {
      onTableAction(task, action);
    }
     if (onRefreshTasks) {
    console.log('🔄 TasksIAssignedToOthers: Refreshing tasks after action');
    setTimeout(() => onRefreshTasks(), 500);
  }
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

  // Group tasks by assignee - Enhanced for all user types
  const groupTasksByAssignee = (tasks: Task[]): UserGroup[] => {
    console.log('🔍 Grouping tasks by assignee for user:', userEmail);
    console.log('📋 Tasks to group:', tasks.length);
    
    const assigneeGroups: { [email: string]: UserGroup } = {};

    tasks.forEach((task, index) => {
      // Enhanced assignee detection for all user types
      const assigneeEmail = (task as any).assignedToEmail || (task as any).assignedTo || 
                           (task as any).assigned_to?.email || (task as any).assigned_to ||
                           (task as any).assignedUser?.email || (task as any).assignedUser ||
                           (task as any).assignee?.email || (task as any).assignee ||
                           (task as any).targetUser?.email || (task as any).targetUser ||
                           'unknown@example.com';
      
      const assigneeName = (task as any).assignedToName || 
                          (task as any).assignedUserName || 
                          (task as any).assignee?.name || (task as any).assignee?.username ||
                          (assigneeEmail && typeof assigneeEmail === 'string' ? 
                           assigneeEmail.split('@')[0] : 'Unknown User');

      // Debug logging for each task
      console.log(`Task ${index}: "${task.taskName}" assigned to: ${assigneeEmail} (${assigneeName})`);

      if (!assigneeGroups[assigneeEmail]) {
        assigneeGroups[assigneeEmail] = {
          userEmail: assigneeEmail,
          username: assigneeName,
          totalTasks: 0,
          completedTasks: 0,
          activeTasks: 0,
          assignedTasks: 0,
          selfCreatedTasks: 0,
          totalDuration: 0,
          tasks: []
        };
      }

      const group = assigneeGroups[assigneeEmail];
      group.tasks.push(task);
      group.totalTasks++;
      group.totalDuration += task.totalDuration || 0;

      // Enhanced status categorization
      if (task.status === 'ended' || task.status === 'paused') {
        group.completedTasks++;
      } else if (['started', 'resumed', 'paused'].includes(task.status)) {
        group.activeTasks++;
      }

      // All tasks in this component are assigned tasks
      group.assignedTasks++;
    });

    const result = Object.values(assigneeGroups).sort((a, b) => a.username.localeCompare(b.username));
    console.log('📊 Grouped into', result.length, 'assignee groups');
    
    return result;
  };

  const assigneeGroups = useMemo(() => groupTasksByAssignee(tasks), [tasks]);

  const paginatedGroups = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return assigneeGroups.slice(startIndex, startIndex + rowsPerPage);
  }, [assigneeGroups, page, rowsPerPage]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderAssigneeGroupRow = (assigneeGroup: UserGroup) => {
    const isExpanded = expandedRows.has(assigneeGroup.userEmail);
    
    return (
      <React.Fragment key={assigneeGroup.userEmail}>
        <TableRow 
          hover 
          sx={{ 
            cursor: 'pointer',
            bgcolor: 'rgba(233, 30, 99, 0.08)',
            '&:hover': { bgcolor: 'rgba(233, 30, 99, 0.15)' }
          }}
          onClick={() => onToggleRowExpansion(assigneeGroup.userEmail)}
        >
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small">
                {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
              </IconButton>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {assigneeGroup.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                  {assigneeGroup.username}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {assigneeGroup.userEmail}
                </Typography>
                <Chip 
                  label="Assignee" 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                  sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                />
              </Box>
            </Box>
          </TableCell>
          <TableCell align="center">
            <Typography variant="h6" color="secondary.main">
              {assigneeGroup.totalTasks}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2" color="success.main">
              {assigneeGroup.completedTasks}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2" color="warning.main">
              {assigneeGroup.activeTasks}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2" color="info.main">
              {assigneeGroup.assignedTasks}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {formatTime(assigneeGroup.totalDuration)}
              </Typography>
              {(() => {
                const calculatedTotal = assigneeGroup.tasks.reduce((total, task) => 
                  total + getTaskDuration(task), 0
                );
                return calculatedTotal !== assigneeGroup.totalDuration ? (
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
                    Calc: {formatTime(calculatedTotal)}
                  </Typography>
                ) : null;
              })()}
            </Box>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2" color="info.main">
              {assigneeGroup.tasks.filter(task => (task as any).isRecurring).length}
            </Typography>
          </TableCell>
        </TableRow>
        
        {/* Assignee's Tasks */}
        <TableRow>
          <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
            <Collapse in={isExpanded}>
              <Box sx={{ p: 2, bgcolor: 'rgba(233, 30, 99, 0.03)' }}>
                <Typography variant="subtitle2" gutterBottom color="secondary.main">
                  Tasks assigned to {assigneeGroup.username}
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Task Details</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Assigned Date</TableCell>
                      <TableCell>Last Activity</TableCell>
                      <TableCell>Recurring</TableCell>
                      <TableCell>Actions</TableCell>
                       <TableCell>Approval</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assigneeGroup.tasks.map((task: Task) => (
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
                                {/* <Typography variant="caption" color="textSecondary">
                                  ID: {task.taskId}
                                </Typography> */}
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
                                  label="Recalculated"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {(task as any).assignedAt || (task as any).createdAt || 'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {getLastActivityTime(task)}
                            </Typography>
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
           <TableCell>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        
            {/* Existing resume/stop buttons */}
           {false && task.status === 'paused' && (
              
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

            {/* ENHANCED: Multiple checks for approval needed */}
            {(() => {
              const needsApproval = (
                (task as any).approvalNeeded === true ||
                (task as any).approval_needed === true ||
                (task as any).requiresApproval === true
              );
              
              const isCompleted = (
                task.status === 'ended' || 
                task.status === 'completed' ||
                (task as any).status === 'completed'
              );
              
              const notApproved = (
                !(task as any).isApproved && 
                !(task as any).is_approved &&
                (task as any).isApproved !== true
              );

              console.log('🔍 Approval button conditions:', {
                taskName: task.taskName,
                needsApproval,
                isCompleted,
                notApproved,
                shouldShow: needsApproval && isCompleted && notApproved
              });

              if (needsApproval && isCompleted && notApproved) {
                return (
                  <>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Button
                                        size="small"
                                        variant="contained"
                                        color="success"
                                        startIcon={<CheckCircle />}
                                        onClick={() => handleApprove(task)}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Cancel />}
                                        onClick={() => handleReject(task)}
                                      >
                                        Reject
                                      </Button>
                    </Box>
                  </>
                );
              }
              return null;
            })()}

            {/* Show approval status if already approved/rejected */}
            {((task as any).approvalNeeded || (task as any).approval_needed) && (task as any).isApproved === true && (
              <Chip
                label="✅ Approved"
                size="small"
                color="success"
                variant="filled"
              />
            )}
           
         
          </Box>
        </TableCell>
        <TableCell>  <Box sx={{ display: 'flex', gap: 0.5 }}><Button
      size="small"
      startIcon={<Edit />}
      onClick={() => handleEditTask(task)}
      variant="outlined"
      color="primary"
    >
      Edit
    </Button>
    <Button
      size="small"
      startIcon={<Delete />}
      onClick={() => handleDeleteTask(task)}
      variant="outlined"
      color="error"
    >
      Delete
    </Button></Box></TableCell>

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
              {/* ✅ Update the approval dialog */}
     <Dialog 
        open={approvalDialog.open} 
        onClose={handleApprovalCancel} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {approvalDialog.type === 'approve' ? 'Approve Task' : 'Reject Task'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {approvalDialog.type === 'approve' 
              ? `Are you sure you want to approve "${approvalDialog.task?.taskName}"?`
              : `Are you sure you want to reject "${approvalDialog.task?.taskName}"?`
            }
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={approvalDialog.type === 'approve' ? 'Comments (Optional)' : 'Rejection Reason'}
            value={approvalDialog.comments}
            onChange={(e) => setApprovalDialog(prev => ({ ...prev, comments: e.target.value }))}
            placeholder={
              approvalDialog.type === 'approve' 
                ? 'Add any approval comments...'
                : 'Please provide a reason for rejection...'
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleApprovalCancel}>Cancel</Button>
          <Button
            onClick={handleApprovalConfirm}
            variant="contained"
            color={approvalDialog.type === 'approve' ? 'success' : 'error'}
          >
            {approvalDialog.type === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>


      </React.Fragment>
      
    );
  };

  // Enhanced empty state with better messaging for all user types
  if (assigneeGroups.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <PersonAdd sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No Tasks Assigned to Others Found
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          You haven't assigned any tasks to other users yet, or the assigned tasks don't match the current filters.
        </Typography>
        
        {/* Enhanced troubleshooting info for all users */}
        <Alert severity="info" sx={{ mt: 2, textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            <Info sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
            How to see tasks here:
          </Typography>
          <Typography variant="body2" component="div">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Create a task and assign it to another user</li>
              <li>Make sure the task has proper assignment fields (assignedTo, assignedToEmail)</li>
              <li>Verify you are the creator/assigner of the tasks</li>
              <li>Check that tasks are assigned to different users (not yourself)</li>
            </ul>
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Current user: <strong>{userEmail}</strong> | Tasks processed: <strong>{tasks.length}</strong>
          </Typography>
        </Alert>
        
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Refresh Data
        </Button>
      </Box>
    );
  }

  return (
    <>
     

      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Assignee</TableCell>
              <TableCell align="center">Total Tasks</TableCell>
              <TableCell align="center">Completed</TableCell>
              <TableCell align="center">Active</TableCell>
              <TableCell align="center">Assigned</TableCell>
              <TableCell align="center">Total Duration</TableCell>
              <TableCell align="center">Recurring Tasks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedGroups.map((assigneeGroup: UserGroup) => 
              renderAssigneeGroupRow(assigneeGroup)
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={assigneeGroups.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        showFirstButton
        showLastButton
      />

      {/* Enhanced Assignment Summary for all users */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(233, 30, 99, 0.05)', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom color="secondary.main">
          Assignment Summary - Tasks You Assigned to Others
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Total Assignees
            </Typography>
            <Typography variant="h6" color="secondary.main">
              {assigneeGroups.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Total Assigned Tasks
            </Typography>
            <Typography variant="h6" color="secondary.main">
              {assigneeGroups.reduce((sum, group) => sum + group.totalTasks, 0)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Completed Tasks
            </Typography>
            <Typography variant="h6" color="success.main">
              {assigneeGroups.reduce((sum, group) => sum + group.completedTasks, 0)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Active Tasks
            </Typography>
            <Typography variant="h6" color="warning.main">
              {assigneeGroups.reduce((sum, group) => sum + group.activeTasks, 0)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Recurring Tasks
            </Typography>
            <Typography variant="h6" color="info.main">
              {assigneeGroups.reduce((sum, group) => 
                sum + group.tasks.filter(task => (task as any).isRecurring).length, 0
              )}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Total Duration (Stored)
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
              {formatTime(
                tasks.reduce((total: number, task: Task) => 
                  total + (task.totalDuration || 0), 0
                )
              )}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Total Duration (Calculated)
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
              {formatTime(
                tasks.reduce((total: number, task: Task) => 
                  total + getTaskDuration(task), 0
                )
              )}
            </Typography>
          </Box>
          {Object.keys(calculatedDurations).length > 0 && (
            <Box>
              <Typography variant="body2" color="textSecondary">
                Recalculated Tasks
              </Typography>
              <Typography variant="h6" sx={{ color: 'info.main' }}>
                {Object.keys(calculatedDurations).length}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Additional info for users */}
        <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
          💡 Tip: You can monitor the progress of tasks you've assigned, set recurring patterns, 
          and help assignees resume paused tasks. This helps you track delegation effectiveness.
        </Typography>
      </Box>

      {/* Recurring Dialog */}
      <RecurringDialog
        open={recurringDialogOpen}
        task={selectedTask}
        onClose={() => {
          setRecurringDialogOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleRecurringSave}
      />
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Task Name"
            value={editFormData.taskName}
            onChange={(e) => setEditFormData({...editFormData, taskName: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={editFormData.description}
            onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={editFormData.type}
              onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
            >
              <MenuItem value="task">Task</MenuItem>
              <MenuItem value="meeting">Meeting</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default React.memo(TasksIAssignedToOthers);




