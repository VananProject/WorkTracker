
import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField
} from '@mui/material';
import { PlayArrow, Pause, Stop, Add, Warning, Clear } from '@mui/icons-material';
import { timerStyles } from '../../../styles/TaskTimer.styles';

interface TaskTimerControlsProps {
  state: any;
  dispatch: (action: any) => void;
  onStartTask: (type: 'task' | 'meeting') => void;
  onPause: () => void;
  onResume: () => void;
  onStop: (description?: string) => void;
  onSetAlarm: (minutes: number) => void;
}

interface AlarmButtonProps {
  minutes: number;
  onSetAlarm: (minutes: number) => void;
}

interface ClearAlarmButtonProps {
  onClearAlarm: () => void;
}

const AlarmButton: React.FC<AlarmButtonProps> = ({ minutes, onSetAlarm }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onSetAlarm(minutes);
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={handleClick}
        sx={{
          minWidth: '50px',
          fontSize: '0.75rem',
          py: 0.5,
          px: 1
        }}
      >
        {minutes}m
      </Button>
      <Dialog open={showConfirm} onClose={handleCancel} maxWidth="xs">
        <DialogTitle>Confirm Alarm</DialogTitle>
        <DialogContent>
          <Typography>
            Set alarm for every {minutes} minute{minutes > 1 ? 's' : ''}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const ClearAlarmButton: React.FC<ClearAlarmButtonProps> = ({ onClearAlarm }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onClearAlarm();
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        color="error"
        onClick={handleClick}
        sx={{
          minWidth: '40px',
          py: 0.5,
          px: 0.5,
          borderColor: 'error.light'
        }}
        title="Clear alarm"
      >
        <Clear sx={{ fontSize: '14px' }} />
      </Button>
      <Dialog open={showConfirm} onClose={handleCancel} maxWidth="xs">
        <DialogTitle>Clear Alarm</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear the alarm?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" color="error">
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const TaskTimerControls: React.FC<TaskTimerControlsProps> = ({
  state,
  dispatch,
  onStartTask,
  onPause,
  onResume,
  onStop,
  onSetAlarm
}) => {
  const [showValidationError, setShowValidationError] = React.useState(false);
  const [validationMessage, setValidationMessage] = React.useState('');
  const [showPauseConfirm, setShowPauseConfirm] = React.useState(false);
  const [pendingTaskType, setPendingTaskType] = React.useState<'task' | 'meeting' | null>(null);
  
  // New state for stop confirmation dialog
  const [showStopConfirm, setShowStopConfirm] = React.useState(false);
  const [stopDescription, setStopDescription] = React.useState('');
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };
  const hasRunningTask = state.currentTask && 
    state.currentTask.status !== 'ended' && 
    state.isRunning;
  const handleStartNewTask = useCallback(
    debounce((type: 'task' | 'meeting') => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);

      if (hasRunningTask) {
        setPendingTaskType(type);
        setShowPauseConfirm(true);
      } else {
        onStartTask(type);
      }

      setTimeout(() => setIsActionInProgress(false), 1000);
    }, 300),
    [hasRunningTask, isActionInProgress, onStartTask]
  );

  const handleStopClick = useCallback(
    debounce(() => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
      setShowStopConfirm(true);
      setTimeout(() => setIsActionInProgress(false), 1000);
    }, 300),
    [isActionInProgress]
  );

  const handleConfirmPauseAndStart = useCallback(() => {
    if (pendingTaskType) {
      onPause();
      setTimeout(() => {
        onStartTask(pendingTaskType);
      }, 100);
    }
    setShowPauseConfirm(false);
    setPendingTaskType(null);
  }, [onPause, onStartTask, pendingTaskType]);

  const handleConfirmStop = useCallback(() => {
    const description = stopDescription.trim();
    if (description && description.length > 0) {
      onStop(description);
    } else {
      onStop();
    }
    setShowStopConfirm(false);
    setStopDescription('');
  }, [onStop, stopDescription]);
  // Check if there's a currently running task (not paused)


  // Check if there's a paused task
  const hasPausedTask = state.currentTask && 
    state.currentTask.status === 'paused' && 
    !state.isRunning;

  // const handleStartNewTask = (type: 'task' | 'meeting') => {
  //   // If there's a running task, ask to pause it first
  //   if (hasRunningTask) {
  //     setPendingTaskType(type);
  //     setShowPauseConfirm(true);
  //     return;
  //   }

  //   // If no running task (either no task or paused task), start new task directly
  //   onStartTask(type);
  // };

  // const handleConfirmPauseAndStart = () => {
  //   if (pendingTaskType) {
  //     // First pause the current task
  //     onPause();
      
  //     // Then start the new task
  //     setTimeout(() => {
  //       onStartTask(pendingTaskType);
  //     }, 100); // Small delay to ensure pause is processed
  //   }
    
  //   setShowPauseConfirm(false);
  //   setPendingTaskType(null);
  // };

  const handleCancelPauseAndStart = () => {
    setShowPauseConfirm(false);
    setPendingTaskType(null);
  };

  // // New handlers for stop confirmation
  // const handleStopClick = () => {
  //   setShowStopConfirm(true);
  //   setStopDescription(''); // Reset description
  // };

  //  const handleConfirmStop = () => {
  //   const description = stopDescription.trim();
    
  //   // Only call onStop with description if it has actual content
  //   if (description && description.length > 0) {
  //     onStop(description);
  //   } else {
  //     // Call onStop without any parameters when no description
  //     onStop();
  //   }
    
  //   setShowStopConfirm(false);
  //   setStopDescription('');
  // };



  const handleCancelStop = () => {
    setShowStopConfirm(false);
    setStopDescription('');
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStopDescription(event.target.value);
  };

  const handleCloseValidationError = () => {
    setShowValidationError(false);
    setValidationMessage('');
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
                disabled={isActionInProgress}
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
                disabled={isActionInProgress}
              >
                Resume
              </Button>
            )}
            <Button
              variant="contained"
              color="error"
              startIcon={<Stop />}
              onClick={handleStopClick}
              sx={timerStyles.button}
              disabled={isActionInProgress}
            >
              Stop
            </Button>
          </>
        ) : null}
        
        <Button
          variant="contained"
          color={hasRunningTask ? "warning" : "primary"}
          startIcon={hasRunningTask ? <Warning /> : <Add />}
          onClick={() => handleStartNewTask('task')}
          sx={{
            ...timerStyles.button,
            ...(hasRunningTask && {
              '&:hover': {
                backgroundColor: 'warning.dark',
              }
            })
          }}
          disabled={isActionInProgress}
          title={
            hasRunningTask 
              ? "Will pause current task and start new task" 
              : hasPausedTask 
                ? "Start new task (current task will remain paused)"
                : "Start new task"
          }
        >
          New Task
        </Button>
        
        <Button
          variant="contained"
          color={hasRunningTask ? "warning" : "secondary"}
          startIcon={hasRunningTask ? <Warning /> : <Add />}
          onClick={() => handleStartNewTask('meeting')}
          sx={{
            ...timerStyles.button,
            ...(hasRunningTask && {
              '&:hover': {
                backgroundColor: 'warning.dark',
              }
            })
          }}
          disabled={isActionInProgress}
          title={
            hasRunningTask 
              ? "Will pause current task and start new meeting" 
              : hasPausedTask 
                ? "Start new meeting (current task will remain paused)"
                : "Start new meeting"
          }
        >
          New Meeting
        </Button>
      </Box>
      
      {/* Alarm Buttons */}
      <Box sx={{
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        alignItems: 'center',
        ml: 2
      }}>
        <Typography
          variant="caption"
          sx={{
            mr: 1,
            px: 1.5,
            py: 0.5,
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          🔔 Alarm
        </Typography>
        <AlarmButton minutes={1} onSetAlarm={onSetAlarm} />
        <AlarmButton minutes={3} onSetAlarm={onSetAlarm} />
        <AlarmButton minutes={5} onSetAlarm={onSetAlarm} />
        <AlarmButton minutes={10} onSetAlarm={onSetAlarm} />
        <ClearAlarmButton onClearAlarm={() => onSetAlarm(0)} />
      </Box>
      
      {/* Stop Task Confirmation Dialog */}
      <Dialog open={showStopConfirm} onClose={handleCancelStop} maxWidth="sm" fullWidth>
        <DialogTitle>Stop Task</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to stop "{state.currentTask?.taskName}"?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Task Description (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={stopDescription}
            onChange={handleDescriptionChange}
            placeholder="Add any notes or description about this task..."
            sx={{ mt: 2 }}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            You can add an optional description to save with this task. This will help you remember what you worked on.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelStop}>Cancel</Button>
          <Button onClick={handleConfirmStop} variant="contained" color="error">
            Stop Task
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Pause and Start Confirmation Dialog */}
      <Dialog open={showPauseConfirm} onClose={handleCancelPauseAndStart} maxWidth="sm">
        <DialogTitle>Pause Current Task?</DialogTitle>
        <DialogContent>
          <Typography>
            You have a running task "{state.currentTask?.taskName}". 
            Do you want to pause it and start a new {pendingTaskType}?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            The current task will be paused and you can resume it later.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelPauseAndStart}>Cancel</Button>
          <Button onClick={handleConfirmPauseAndStart} variant="contained" color="warning">
            Pause & Start New {pendingTaskType}
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
          severity="warning"
          sx={{ width: '100%' }}
          variant="filled"
        >
          {validationMessage}
        </Alert>
      </Snackbar>

      {/* Status indicator for paused tasks */}
      {/* {hasPausedTask && (
        <Box sx={{
          mt: 2,
          p: 2,
          backgroundColor: 'info.light',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'info.main'
        }}>
          <Alert severity="info" variant="outlined">
            <strong>Paused Task:</strong> "{state.currentTask?.taskName}" is currently paused.
            <br />
            You can resume it or start a new task/meeting.
          </Alert>
        </Box>
      )} */}

      {/* Status indicator for running tasks */}
      {/* {hasRunningTask && (
        <Box sx={{
          mt: 2,
          p: 2,
          backgroundColor: 'success.light',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'success.main'
        }}>
          <Alert severity="success" variant="outlined">
            <strong>Running Task:</strong> "{state.currentTask?.taskName}" is currently active.
            <br />
            Starting a new task will pause this one automatically.
          </Alert>
        </Box>
      )} */}
    </>
  );
};

export default React.memo(TaskTimerControls);
