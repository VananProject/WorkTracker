import React from 'react';
import { 
  Box, Button, Alert, Snackbar, Dialog, DialogTitle, 
  DialogContent, DialogActions, Typography 
} from '@mui/material';
import { PlayArrow, Pause, Stop, Add, Alarm, Warning } from '@mui/icons-material';
import { timerStyles } from '../../../styles/TaskTimer.styles';

interface TaskTimerControlsProps {
  state: any;
  dispatch: (action: any) => void;
  onStartTask: (type: 'task' | 'meeting') => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const TaskTimerControls: React.FC<TaskTimerControlsProps> = ({
  state,
  dispatch,
  onStartTask,
  onPause,
  onResume,
  onStop
}) => {
  const [showValidationError, setShowValidationError] = React.useState(false);
  const [validationMessage, setValidationMessage] = React.useState('');
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [pendingTaskType, setPendingTaskType] = React.useState<'task' | 'meeting' | null>(null);

  // Check if there's an active task running
  const hasActiveTask = state.currentTask && 
    state.currentTask.status !== 'ended' && 
    (state.isRunning || state.currentTask.status === 'paused');

  const handleStartNewTask = (type: 'task' | 'meeting') => {
    // Check if there's already an active task
    if (hasActiveTask) {
      setPendingTaskType(type);
      setShowConfirmDialog(true);
      return;
    }

    // If no active task, proceed with starting new task
    onStartTask(type);
  };

  const handleConfirmStopAndStart = async () => {
    if (pendingTaskType) {
      try {
        // Stop the current task first
        await onStop();
        
        // Small delay to ensure the stop operation completes
        setTimeout(() => {
          onStartTask(pendingTaskType!);
        }, 100);
        
      } catch (error) {
        setValidationMessage('Failed to stop current task. Please try again.');
        setShowValidationError(true);
      }
    }
    
    setShowConfirmDialog(false);
    setPendingTaskType(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setPendingTaskType(null);
  };

  const handleCloseValidationError = () => {
    setShowValidationError(false);
    setValidationMessage('');
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Box sx={timerStyles.buttonGroup}>
        {state.currentTask && state.currentTask.status !== 'ended' ? (
          <>
            {state.isRunning ? (
              <Button
                variant="contained"
                color="warning"
                startIcon={<Pause />}
                onClick={onPause}
                sx={timerStyles.button}
              >
                Pause
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                startIcon={<PlayArrow />}
                onClick={onResume}
                sx={timerStyles.button}
              >
                Resume
              </Button>
            )}
            <Button
              variant="contained"
              color="error"
              startIcon={<Stop />}
              onClick={onStop}
              sx={timerStyles.button}
            >
              Stop
            </Button>
          </>
        ) : null}
        
        <Button
          variant="contained"
          color={hasActiveTask ? "warning" : "primary"}
          startIcon={hasActiveTask ? <Warning /> : <Add />}
          onClick={() => handleStartNewTask('task')}
          sx={{
            ...timerStyles.button,
            ...(hasActiveTask && {
              '&:hover': {
                backgroundColor: 'warning.dark',
              }
            })
          }}
          title={hasActiveTask ? "Will stop current task and start new one" : "Start new task"}
        >
          New Task
        </Button>
        
        <Button
          variant="contained"
          color={hasActiveTask ? "warning" : "secondary"}
          startIcon={hasActiveTask ? <Warning /> : <Add />}
          onClick={() => handleStartNewTask('meeting')}
          sx={{
            ...timerStyles.button,
            ...(hasActiveTask && {
              '&:hover': {
                backgroundColor: 'warning.dark',
              }
            })
          }}
          title={hasActiveTask ? "Will stop current task and start new meeting" : "Start new meeting"}
        >
          New Meeting
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Alarm />}
          onClick={() => dispatch({ type: 'SHOW_ALARM_DIALOG' })}
          sx={timerStyles.button}
        >
          Set Alarm
        </Button>
      </Box>

      {/* Active Task Indicator */}
      {hasActiveTask && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          backgroundColor: 'info.light', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'info.main'
        }}>
          <Alert severity="info" variant="outlined">
            <strong>Active Task:</strong> "{state.currentTask?.taskName}" 
            <br />
            Status: {state.isRunning ? '🟢 Running' : '⏸️ Paused'} | 
            Time: {formatTime(state.elapsedTime)}
          </Alert>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelConfirm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          Stop Current Task?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You currently have an active task running:
          </Typography>
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'grey.100', 
            borderRadius: 1, 
            my: 2 
          }}>
            <Typography variant="subtitle1" fontWeight="bold">
              "{state.currentTask?.taskName}"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {state.isRunning ? 'Running' : 'Paused'} | 
              Time: {formatTime(state.elapsedTime)}
            </Typography>
          </Box>
          <Typography variant="body1">
            Do you want to stop this task and start a new {pendingTaskType}?
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            ⚠️ The current task will be marked as completed and saved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirm} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmStopAndStart} 
            color="warning" 
            variant="contained"
            startIcon={<Stop />}
          >
            Stop & Start New {pendingTaskType}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Validation Error Snackbar */}
      <Snackbar
        open={showValidationError}
        autoHideDuration={6000}
        onClose={handleCloseValidationError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseValidationError} 
          severity="error" 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {validationMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TaskTimerControls;
