
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  Box,
  Typography,
} from '@mui/material';
import AssignTaskDialog from './AssignTaskDialog';
import SimpleAlarmDialog from '../SimpleAlarmDialog';
import type { TaskTimerState, User, AssignTaskData } from './types/types';
import { Assignment } from '@mui/icons-material';
// import SimpleAlarmDialog from './SimpleAlarmDialog';
// import { AssignTaskData, User, TaskTimerState } from './types';

// Update the interface to include allTasks
interface TaskTimerDialogsProps {
  state: TaskTimerState;
  dispatch: (action: any) => void;
  showAssignDialog: boolean;
  users: User[];
  loadingUsers: boolean;
  userError: string | null;
  assignTaskData: AssignTaskData;
  allTasks?: any[]; // Add this line
  onCreateTask: () => void;
  onHideAssignDialog: () => void;
  onAssignTask: () => void;
  onAssignTaskDataChange: (field: string, value: string | Date | null) => void;
  onLoadUsers: () => void;
  onSetAlarm: (minutes: number) => void;
  onTestAlarmSound: () => void;
}

// Update the component to accept and pass allTasks
const TaskTimerDialogs: React.FC<TaskTimerDialogsProps> = ({
  state,
  dispatch,
  showAssignDialog,
  users,
  loadingUsers,
  userError,
  assignTaskData,
  allTasks = [], // Add this line with default value
  onCreateTask,
  onHideAssignDialog,
  onAssignTask,
  onAssignTaskDataChange,
  onLoadUsers,
  onSetAlarm,
  onTestAlarmSound
}) => {
   console.log('🔍 TaskTimerDialogs - allTasks:', allTasks);
  console.log('🔍 TaskTimerDialogs - allTasks length:', allTasks.length);
   const getUniqueTaskNames = () => {
    const taskNames = allTasks.map(task => task.taskName);
    const uniqueNames = [...new Set(taskNames)].filter(name => name && name.trim().length > 0);
    console.log('🔍 Unique task names:', uniqueNames);
    return uniqueNames;
  };
  return (
    <>
      {/* Task Name Input Dialog - NOW WITH AUTOCOMPLETE */}
      <Dialog
        open={state.showTaskNameInput}
        onClose={() => dispatch({ type: 'HIDE_TASK_INPUT' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Enter {state.taskType === 'meeting' ? 'Meeting' : 'Task'} Name
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            freeSolo
            options={getUniqueTaskNames()}
            value={state.taskName || ''}
            onChange={(event, newValue) => {
              dispatch({ type: 'SET_TASK_NAME', payload: newValue || '' });
            }}
            onInputChange={(event, newInputValue) => {
              dispatch({ type: 'SET_TASK_NAME', payload: newInputValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                margin="dense"
                label={`${state.taskType === 'meeting' ? 'Meeting' : 'Task'} Name`}
                fullWidth
                variant="outlined"
                placeholder={`Enter a descriptive name for this ${state.taskType}...`}
                sx={{ mt: 2 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onCreateTask();
                  }
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                py: 1,
                '&:hover': {
                  bgcolor: 'primary.50'
                }
              }}>
                <Assignment fontSize="small" color="primary" />
                <Typography variant="body2">
                  {option}
                </Typography>
              </Box>
            )}
            filterOptions={(options, { inputValue }) => {
              const filtered = options.filter(option =>
                option.toLowerCase().includes(inputValue.toLowerCase())
              );
              
              // Show current input as an option if it doesn't match existing ones
              if (inputValue !== '' && !filtered.includes(inputValue)) {
                filtered.unshift(inputValue);
              }
              
              return filtered;
            }}
            sx={{
              '& .MuiAutocomplete-paper': {
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dispatch({ type: 'HIDE_TASK_INPUT' })}>
            Cancel
          </Button>
          <Button onClick={onCreateTask} variant="contained">
            Start {state.taskType === 'meeting' ? 'Meeting' : 'Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin: Assign Task Dialog */}
      <AssignTaskDialog
        open={showAssignDialog}
        users={users}
        loadingUsers={loadingUsers}
        userError={userError}
        assignTaskData={assignTaskData}
          allTasks={allTasks}
        onHide={onHideAssignDialog}
        onAssign={onAssignTask}
        onDataChange={(field, value) => {
          if (field === 'recurringOptions' && value) {
            const calculateNextRunDate = (recurringOptions: any, startDate: Date = new Date()): Date => {
              if (!recurringOptions || typeof recurringOptions !== 'object') return startDate;
              
              const { 
                repeatInterval, 
                specificDays, 
                customInterval, 
                monthlyOption,
                skipWeekends,
                workingDaysOnly 
              } = recurringOptions;
              
              let nextDate = new Date(startDate);
              
              switch (repeatInterval) {
                case 'daily':
                  nextDate.setDate(nextDate.getDate() + 1);
                  break;
                  
                case 'weekly':
                  if (Array.isArray(specificDays) && specificDays.length > 0) {
                    const currentDay = nextDate.getDay();
                    const sortedDays = [...specificDays].sort((a: number, b: number) => a - b);
                    
                    let nextDay = sortedDays.find((day: number) => typeof day === 'number' && day > currentDay);
                    
                    if (nextDay === undefined) {
                      nextDay = sortedDays[0];
                      const daysToAdd = (7 - currentDay) + nextDay;
                      nextDate.setDate(nextDate.getDate() + daysToAdd);
                    } else {
                      const daysToAdd = nextDay - currentDay;
                      nextDate.setDate(nextDate.getDate() + daysToAdd);
                    }
                  } else {
                    nextDate.setDate(nextDate.getDate() + 7);
                  }
                  break;
                  
                case 'monthly':
                  nextDate.setMonth(nextDate.getMonth() + 1);
                  break;
                  
                case 'custom':
                  if (typeof customInterval === 'number' && customInterval > 0) {
                    nextDate.setDate(nextDate.getDate() + customInterval);
                  } else {
                    nextDate.setDate(nextDate.getDate() + 1);
                  }
                  break;
                  
                default:
                  nextDate.setDate(nextDate.getDate() + 1);
              }
              
              // Apply weekend and working day filters
              if (skipWeekends || workingDaysOnly) {
                while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
                  nextDate.setDate(nextDate.getDate() + 1);
                }
              }
              
              return nextDate;
            };

            const nextRunDate = calculateNextRunDate(value, assignTaskData.dueDate || new Date());
            const enhancedValue = {
              ...value,
              nextRunDate: nextRunDate,
              lastCalculated: new Date()
            };
            
            onAssignTaskDataChange(field, enhancedValue);
          } else {
            onAssignTaskDataChange(field, value);
          }
        }}
        onLoadUsers={onLoadUsers}
      />

      {/* Simple Alarm Dialog */}
      <SimpleAlarmDialog
        open={state.showAlarmDialog}
        dispatch={dispatch}
        onSetAlarm={onSetAlarm}
        onTestAlarmSound={onTestAlarmSound}
      />
    </>
  );
};

export default React.memo(TaskTimerDialogs);