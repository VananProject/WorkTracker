import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Repeat,
  PlayArrow,
  Pause,
  Stop,
  Edit,
  Delete,
  Schedule,
//   TriggerIcon,
  Info,
  TouchApp
} from '@mui/icons-material';
import TaskService from '../../../../../services/taskService';
import MockRecurringService, { type RecurringTaskData } from '../../../../../services/mockRecurringService';
// import MockRecurringService, { RecurringTaskData } from '../../../../services/mockRecurringService';

interface RecurringTaskManagerProps {
  open: boolean;
  onClose: () => void;
}

const RecurringTaskManager: React.FC<RecurringTaskManagerProps> = ({
  open,
  onClose
}) => {
  const [recurringTasks, setRecurringTasks] = useState<Record<string, RecurringTaskData>>({});
  const [tasksDue, setTasksDue] = useState<RecurringTaskData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadRecurringTasks();
    }
  }, [open]);

  const loadRecurringTasks = async () => {
    setLoading(true);
    try {
      const tasks = TaskService.getAllRecurringSettings();
      const due = TaskService.getTasksDueToRun();
      
      setRecurringTasks(tasks);
      setTasksDue(due);
    } catch (error) {
      console.error('Error loading recurring tasks:', error);
    } finally {
      setLoading(false);
    }
  };

const handleTriggerTask = async (taskId: string) => {
  try {
    // ✅ FIX: Update existing task instead of creating new one
    const existingTask = Object.values(recurringTasks).find(task => task.taskId === taskId);
    if (existingTask) {
      // Update the existing task's recurring count and last run
      const updatedTask = {
        ...existingTask,
        recurringCount: (existingTask.recurringCount || 0) + 1,
        lastRun: new Date().toISOString(),
        nextRun: calculateNextRun(existingTask), // Calculate next occurrence
        status: 'started' // Update status without creating new task
      };
      
      // Use update instead of create
      await TaskService.updateRecurringTask(taskId, updatedTask);
    } else {
      await TaskService.triggerRecurringTask(taskId);
    }
    
    await loadRecurringTasks(); // Refresh the list
    alert('Recurring task triggered successfully!');
  } catch (error) {
    console.error('Error triggering task:', error);
    alert('Failed to trigger recurring task');
  }
};

// ✅ Helper function to calculate next run without creating duplicates
const calculateNextRun = (task: any): string => {
  const now = new Date();
  const pattern = task.recurringPattern;
  
  if (!pattern) return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  
  let nextRun = new Date(now);
  
  switch (pattern.frequency) {
    case 'daily':
      nextRun.setDate(now.getDate() + (pattern.interval || 1));
      break;
    case 'weekly':
      nextRun.setDate(now.getDate() + (7 * (pattern.interval || 1)));
      break;
    case 'monthly':
      nextRun.setMonth(now.getMonth() + (pattern.interval || 1));
      break;
    default:
      nextRun.setDate(now.getDate() + 1);
  }
  
  return nextRun.toISOString();
};


  const handleUpdateStatus = async (taskId: string, status: 'active' | 'paused' | 'completed') => {
    try {
      await MockRecurringService.updateRecurringStatus(taskId, status);
      await loadRecurringTasks(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this recurring task?')) {
      try {
        await MockRecurringService.deleteRecurringTask(taskId);
        await loadRecurringTasks(); // Refresh the list
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete recurring task');
      }
    }
  };

  const formatNextRun = (nextRun?: string) => {
    if (!nextRun) return 'Not scheduled';
    
    const date = new Date(nextRun);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  const renderRecurringPattern = (task: RecurringTaskData) => {
    if (!task.recurringPattern) return 'No pattern defined';
    
    const { frequency, interval, daysOfWeek, dayOfMonth, workingDaysOnly, skipWeekends } = task.recurringPattern;
    
    let pattern = '';
    switch (frequency) {
      case 'daily':
        pattern = interval === 1 ? 'Daily' : `Every ${interval} days`;
        break;
      case 'weekly':
        pattern = interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
        if (daysOfWeek && daysOfWeek.length > 0) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const selectedDays = daysOfWeek.map(day => dayNames[day]).join(', ');
          pattern += ` on ${selectedDays}`;
        }
        break;
      case 'monthly':
        pattern = interval === 1 ? 'Monthly' : `Every ${interval} months`;
        if (dayOfMonth) {
          pattern += ` on day ${dayOfMonth}`;
        }
        break;
      case 'custom':
        pattern = `Every ${interval} days`;
        break;
    }
    
    if (workingDaysOnly) pattern += ' (working days only)';
    if (skipWeekends) pattern += ' (skip weekends)';
    
    return pattern;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Repeat />
          <Typography variant="h6">Recurring Task Manager</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Tasks Due Section */}
        {tasksDue.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="warning.main" gutterBottom>
              ⚠️ Tasks Due to Run ({tasksDue.length})
            </Typography>
            <List dense>
              {tasksDue.map((task) => (
                <ListItem key={task.taskId} divider>
                  <ListItemText
                    primary={`Task ID: ${task.taskId}`}
                                     secondary={`Last run: ${task.lastRun ? new Date(task.lastRun).toLocaleString() : 'Never'}`}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => handleTriggerTask(task.taskId)}
                      color="primary"
                      variant="contained"
                    >
                      Run Now
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        {/* All Recurring Tasks */}
        <Typography variant="h6" gutterBottom>
          All Recurring Tasks ({Object.keys(recurringTasks).length})
        </Typography>
        
        {Object.keys(recurringTasks).length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Repeat sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="textSecondary">
              No recurring tasks configured
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {Object.values(recurringTasks).map((task) => (
              <Grid item xs={12} md={6} key={task.taskId}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Task ID: {task.taskId}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip
                        label={task.recurringStatus}
                        size="small"
                        color={getStatusColor(task.recurringStatus) as any}
                        variant="filled"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Type & Pattern:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {task.recurringType === 'schedule' ? <Schedule fontSize="small" /> : <TouchApp fontSize="small" />}
                        <Chip
                          label={task.recurringType}
                          size="small"
                          variant="outlined"
                          color={task.recurringType === 'schedule' ? 'primary' : 'secondary'}
                        />
                      </Box>
                      <Typography variant="body2">
                        {renderRecurringPattern(task)}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Statistics:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2">
                          Runs: <strong>{task.recurringCount || 0}</strong>
                        </Typography>
                        <Typography variant="body2">
                          Next: <strong>{formatNextRun(task.nextRun)}</strong>
                        </Typography>
                      </Box>
                    </Box>

                    {task.lastRun && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Last Run:
                        </Typography>
                        <Typography variant="body2">
                          {new Date(task.lastRun).toLocaleString()}
                        </Typography>
                      </Box>
                    )}

                    {task.endConditions && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          End Condition:
                        </Typography>
                        <Typography variant="body2">
                          {task.endConditions.never && 'Never ends'}
                          {task.endConditions.afterRuns && `After ${task.endConditions.afterRuns} runs`}
                          {task.endConditions.endDate && `Until ${new Date(task.endConditions.endDate).toLocaleDateString()}`}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {task.recurringStatus === 'active' && (
                        <>
                          <Button
                            size="small"
                            startIcon={<Pause />}
                            onClick={() => handleUpdateStatus(task.taskId, 'paused')}
                            color="warning"
                          >
                            Pause
                          </Button>
                          <Button
                            size="small"
                            startIcon={<PlayArrow />}
                            onClick={() => handleTriggerTask(task.taskId)}
                            color="primary"
                          >
                            Run Now
                          </Button>
                        </>
                      )}
                      
                      {task.recurringStatus === 'paused' && (
                        <Button
                          size="small"
                          startIcon={<PlayArrow />}
                          onClick={() => handleUpdateStatus(task.taskId, 'active')}
                          color="success"
                        >
                          Resume
                        </Button>
                      )}
                      
                      {task.recurringStatus !== 'completed' && (
                        <Button
                          size="small"
                          startIcon={<Stop />}
                          onClick={() => handleUpdateStatus(task.taskId, 'completed')}
                          color="error"
                        >
                          Complete
                        </Button>
                      )}
                      
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTask(task.taskId)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={loadRecurringTasks} disabled={loading}>
          Refresh
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(RecurringTaskManager);

