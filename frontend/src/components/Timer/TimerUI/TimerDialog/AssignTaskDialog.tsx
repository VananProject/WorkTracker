import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  Box,
  Grid,
  Autocomplete,
  InputAdornment,
  CircularProgress,
  Avatar,
  Chip,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormGroup,
  Slider,
  RadioGroup,
  Radio,
  type SelectChangeEvent,
//   SelectChangeEvent
} from '@mui/material';
import { 
  Assignment, 
  Business, 
  Schedule, 
  CalendarToday,
  Person,
  ExpandMore,
  Repeat,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import type { User, AssignTaskData } from './types/types';
import TaskService from '../../../../services/taskService';

interface AssignTaskDialogProps {
  open: boolean;
  users: User[];
  loadingUsers: boolean;
  userError: string | null;
  assignTaskData: AssignTaskData;
   allTasks?: any[];
  onHide: () => void;
  onAssign: () => void;
  onDataChange: (field: string, value: string | Date | null | boolean | any) => void;
  onLoadUsers: () => void;
}

const AssignTaskDialog: React.FC<AssignTaskDialogProps> = ({
  open,
  users,
  loadingUsers,
  userError,
  assignTaskData,
   allTasks = [],
  onHide,
  onAssign,
  onDataChange,
  onLoadUsers
}) => {
  const [recurringExpanded, setRecurringExpanded] = useState(false);
console.log('🎯 Assigning task with data:', {
  taskName: assignTaskData.taskName,
  approvalNeeded: assignTaskData.approvalNeeded,
  assignedToEmail: assignTaskData.assignedToEmail
});

 const [allTasksLocal, setAllTasksLocal] = useState<any[]>([]);
  const [loadingTasksLocal, setLoadingTasksLocal] = useState(false);

  // Always fetch tasks when dialog opens (as backup)
  useEffect(() => {
    if (open) {
      fetchAllTasks();
    }
  }, [open]);

  const fetchAllTasks = async () => {
    try {
      setLoadingTasksLocal(true);
      console.log('🔄 Fetching all tasks in AssignTaskDialog...');
      
      const response = await TaskService.getAllTasks();
      if (response.success && response.data) {
        console.log('✅ Successfully fetched tasks:', response.data.length);
        setAllTasksLocal(response.data);
      } else {
        console.error('❌ Failed to fetch tasks:', response);
      }
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
    } finally {
      setLoadingTasksLocal(false);
    }
  };

  const getUniqueTaskNames = () => {
    // Use either passed allTasks or locally fetched tasks
    const tasksToUse = (allTasks && allTasks.length > 0) ? allTasks : allTasksLocal;
    
    console.log('🔍 getUniqueTaskNames - Using tasks:', tasksToUse.length);
    
    if (!tasksToUse || tasksToUse.length === 0) {
      console.log('⚠️ No tasks available for autocomplete');
      return [];
    }

    const taskNames = tasksToUse
      .filter(task => task && task.taskName)
      .map(task => task.taskName.trim())
      .filter(name => name.length > 0);
    
    const uniqueNames = [...new Set(taskNames)];
    console.log('✨ Final unique task names:', uniqueNames);
    
    return uniqueNames;
  };
  // Use either passed allTasks or locally fetched tasks
  // const tasksToUse = (allTasks && allTasks.length > 0) ? allTasks : localAllTasks;
  // Status options for recurring tasks
  const statusOptions = [
    { value: 'todo', label: 'To Do', color: '#2196f3' },
    { value: 'pending', label: 'Pending', color: '#ff9800' },
    { value: 'started', label: 'Started', color: '#4caf50' },
    { value: 'inprogress', label: 'In Progress', color: '#9c27b0' }
  ];

  // Days of week for weekly recurring
  const daysOfWeek = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' }
  ];


  const handleRecurringToggle = (checked: boolean) => {
    onDataChange('isRecurring', checked);
    if (checked) {
      // Set default recurring options
      onDataChange('recurringOptions', {
        skipWeekends: false,
        workingDaysOnly: false,
        statusOptions: ['todo'],
        repeatType: 'schedule',
        repeatInterval: 'weekly',
        repeatCount: 5,
        endCondition: 'after',
        specificDays: [1, 2, 3, 4, 5], // Mon-Fri
        monthlyOption: 'date'
      });
      setRecurringExpanded(true);
    } else {
      onDataChange('recurringOptions', undefined);
      setRecurringExpanded(false);
    }
  };

  const handleRecurringOptionChange = (field: string, value: any) => {
    const currentOptions = assignTaskData.recurringOptions || {};
    onDataChange('recurringOptions', {
      ...currentOptions,
      [field]: value
    });
  };
// Add this function after the formatRecurringSummary function:
// Update the calculateNextRunDate function to match the interface
const calculateNextRunDate = (recurringOptions: any, startDate: Date = new Date()): Date => {
  if (!recurringOptions) return startDate;
  
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
      if (specificDays && Array.isArray(specificDays) && specificDays.length > 0) {
        const currentDay = nextDate.getDay();
        const sortedDays = [...specificDays].sort((a: number, b: number) => a - b);
        
        // Find next day in the week
        let nextDay = sortedDays.find((day: number) => day > currentDay);
        
        if (nextDay === undefined) {
          // If no day found this week, go to first day of next week
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
      if (monthlyOption === 'date') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else {
        // Same day of week next month
        const currentWeekOfMonth = Math.ceil(nextDate.getDate() / 7);
        const currentDayOfWeek = nextDate.getDay();
        
        nextDate.setMonth(nextDate.getMonth() + 1);
        nextDate.setDate(1);
        
        // Find the same week and day
        while (nextDate.getDay() !== currentDayOfWeek) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
        nextDate.setDate(nextDate.getDate() + (currentWeekOfMonth - 1) * 7);
      }
      break;
      
    case 'custom':
      if (customInterval && typeof customInterval === 'number' && customInterval > 0) {
        nextDate.setDate(nextDate.getDate() + customInterval);
      } else {
        // Default to daily if custom interval is invalid
        nextDate.setDate(nextDate.getDate() + 1);
      }
      break;
      
    default:
      nextDate.setDate(nextDate.getDate() + 1);
  }
  
  // Skip weekends if option is enabled
  if (skipWeekends || workingDaysOnly) {
    while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
  }
  
  return nextDate;
};


// Update the handleDataChange function to include next run date calculation:
const handleDataChange = (field: string, value: string | Date | null | boolean | any) => {
  if (field === 'recurringOptions') {
    // Calculate next run date when recurring options change
    const nextRunDate = calculateNextRunDate(value, assignTaskData.dueDate || new Date());
    const updatedValue = {
      ...value,
      nextRunDate: nextRunDate
    };
    onDataChange(field, updatedValue);
  } else {
    onDataChange(field, value);
  }
};

  const handleStatusOptionsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    handleRecurringOptionChange('statusOptions', typeof value === 'string' ? value.split(',') : value);
  };

  const handleSpecificDaysChange = (day: number, checked: boolean) => {
    const currentDays = assignTaskData.recurringOptions?.specificDays || [];
    const newDays = checked 
      ? [...currentDays, day].sort()
      : currentDays.filter(d => d !== day);
    handleRecurringOptionChange('specificDays', newDays);
  };

// Update the handleRecurringSave function and data formatting
const formatRecurringSummary = () => {
  if (!assignTaskData.isRecurring || !assignTaskData.recurringOptions) return '';
  
  const options = assignTaskData.recurringOptions;
  let summary = `Repeats ${options.repeatInterval || 'weekly'}`;
  
  if (options.repeatInterval === 'weekly' && options.specificDays?.length) {
    const dayNames = options.specificDays.map(d => daysOfWeek.find(day => day.value === d)?.label).join(', ');
    summary += ` on ${dayNames}`;
  }
  
  if (options.repeatInterval === 'custom') {
    summary += ` every ${options.customInterval || 1} days`;
  }
  
  if (options.endCondition === 'after') {
    summary += ` for ${options.repeatCount || 5} times`;
  } else if (options.endCondition === 'on' && options.endDate) {
    summary += ` until ${dayjs(options.endDate).format('MMM DD, YYYY')}`;
  }
  
  if (options.workingDaysOnly) summary += ' (working days only)';
  if (options.skipWeekends) summary += ' (skip weekends)';
  
  return summary;
};




  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={onHide} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
            minHeight: { xs: '90vh', sm: '70vh' },
            maxHeight: '95vh',
            overflow: 'hidden'
          }
        }}
      >
        {/* Enhanced Header */}
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 48, 
              height: 48 
            }}>
              <Assignment sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Assign Task to User
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Create and assign a new task with details and deadline
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        {/* Scrollable Content */}
        <DialogContent sx={{ 
          p: 0,
          overflow: 'auto',
          maxHeight: 'calc(95vh - 200px)'
        }}>
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
             
  <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'grey.50'
                }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                    Task Information
                  </Typography>
                  <Autocomplete
                    freeSolo
                    options={getUniqueTaskNames()}
                    value={assignTaskData.taskName || ''}
                    onChange={(event, newValue) => {
                      onDataChange('taskName', newValue || '');
                    }}
                    onInputChange={(event, newInputValue) => {
                      onDataChange('taskName', newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Task Name"
                        fullWidth
                        variant="outlined"
                        placeholder="Enter a task name or select from existing..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'white'
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
                      
                      // If the input doesn't match any existing option, show it as a new option
                      if (inputValue !== '' && !filtered.includes(inputValue)) {
                        filtered.push(inputValue);
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
                </Box>
              </Grid>
              {/* Task Type and User Assignment */}
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'grey.50'
                }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                    Assignment Details
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Task Type</InputLabel>
                        <Select
                          value={assignTaskData.type || 'task'}
                          label="Task Type"
                          onChange={(e) => onDataChange('type', e.target.value as string)}
                          sx={{ 
                            borderRadius: 2,
                            bgcolor: 'white'
                          }}
                        >
                          <MenuItem value="task">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Assignment fontSize="small" />
                              Task
                            </Box>
                          </MenuItem>
                          <MenuItem value="meeting">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Business fontSize="small" />
                              Meeting
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <Autocomplete
                          options={users}
                          getOptionLabel={(option) => `${option.username} (${option.email})`}
                          value={users.find(user => user.email === assignTaskData.assignedToEmail) || null}
                          onChange={(event, newValue) => {
                            onDataChange('assignedToEmail', newValue ? newValue.email : '');
                          }}
                          loading={loadingUsers}
                          disabled={loadingUsers}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Assign to User"
                              placeholder="Search and select user..."
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Person fontSize="small" color="action" />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <>
                                    {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  bgcolor: 'white'
                                }
                              }}
                            />
                          )}
                          renderOption={(props, option) => (
                            <Box component="li" {...props} sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2, 
                              py: 1.5,
                              px: 2,
                              '&:hover': {
                                bgcolor: 'primary.50'
                              }
                            }}>
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: option.role === 'admin' ? 'error.main' : 'primary.main',
                                  fontSize: '0.875rem'
                                }}
                              >
                                {option.username.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {option.username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.email}
                                </Typography>
                              </Box>
                              <Chip
                                label={option.role}
                                size="small"
                                color={option.role === 'admin' ? 'error' : 'primary'}
                                variant="outlined"
                                sx={{ borderRadius: 1 }}
                              />
                            </Box>
                          )}
                          noOptionsText={
                            loadingUsers ? "Loading users..." :
                            userError ? userError :
                            "No users found"
                          }
                          filterOptions={(options, { inputValue }) => {
                            return options.filter(option =>
                              option.username.toLowerCase().includes(inputValue.toLowerCase()) ||
                                                            option.email.toLowerCase().includes(inputValue.toLowerCase()) ||
                              option.role.toLowerCase().includes(inputValue.toLowerCase())
                            );
                          }}
                          sx={{
                            '& .MuiAutocomplete-paper': {
                              borderRadius: 2,
                              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            }
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Error Alert */}
              {userError && (
                <Grid item xs={12}>
                  <Alert 
                    severity="error" 
                    sx={{ borderRadius: 2 }}
                    action={
                      <Button size="small" onClick={onLoadUsers} color="inherit">
                        Retry
                      </Button>
                    }
                  >
                    {userError}
                  </Alert>
                </Grid>
              )}

              {/* Recurring Task Toggle */}
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'grey.50'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Repeat color="primary" fontSize="small" />
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                        Recurring Task
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={assignTaskData.isRecurring || false}
                          onChange={(e) => handleRecurringToggle(e.target.checked)}
                          color="primary"
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                    />
                  </Box>
                  
                  {assignTaskData.isRecurring && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      This task will be automatically created based on your recurring settings
                    </Typography>
                  )}

                  {/* Recurring Options Accordion */}
                  {assignTaskData.isRecurring && (
                    <Accordion 
                      expanded={recurringExpanded}
                      onChange={(e, expanded) => setRecurringExpanded(expanded)}
                      sx={{ 
                        boxShadow: 'none',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '8px !important',
                        '&:before': { display: 'none' },
                        bgcolor: 'white'
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{ 
                          borderRadius: 1,
                          '&.Mui-expanded': {
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SettingsIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Advanced Recurring Options
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      
                      <AccordionDetails sx={{ pt: 0 }}>
                        <Grid container spacing={3}>
                          {/* Quick Options */}
                          <Grid item xs={12}>
                            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                              Quick Options
                            </Typography>
                            <FormGroup row>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={assignTaskData.recurringOptions?.skipWeekends || false}
                                    onChange={(e) => handleRecurringOptionChange('skipWeekends', e.target.checked)}
                                    size="small"
                                  />
                                }
                                label="Skip weekends"
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={assignTaskData.recurringOptions?.workingDaysOnly || false}
                                    onChange={(e) => handleRecurringOptionChange('workingDaysOnly', e.target.checked)}
                                    size="small"
                                  />
                                }
                                label="Working days only"
                              />
                            </FormGroup>
                          </Grid>

                          {/* Status Options */}
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Default Status</InputLabel>
                              <Select
                                multiple
                                value={assignTaskData.recurringOptions?.statusOptions || ['todo']}
                                onChange={handleStatusOptionsChange}
                                label="Default Status"
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {(selected as string[]).map((value) => {
                                      const option = statusOptions.find(opt => opt.value === value);
                                      return (
                                        <Chip
                                          key={value}
                                          label={option?.label || value}
                                          size="small"
                                          sx={{ 
                                            bgcolor: option?.color + '20',
                                            color: option?.color,
                                            borderRadius: 1
                                          }}
                                        />
                                      );
                                    })}
                                  </Box>
                                )}
                              >
                                {statusOptions.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    <Checkbox 
                                      checked={(assignTaskData.recurringOptions?.statusOptions || []).indexOf(option.value) > -1}
                                      size="small"
                                    />
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                                      <Box
                                        sx={{
                                          width: 12,
                                          height: 12,
                                          borderRadius: '50%',
                                          bgcolor: option.color
                                        }}
                                      />
                                      {option.label}
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          {/* Repeat Type */}
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Repeat Type</InputLabel>
                              <Select
                                value={assignTaskData.recurringOptions?.repeatType || 'schedule'}
                                onChange={(e) => handleRecurringOptionChange('repeatType', e.target.value)}
                                label="Repeat Type"
                              >
                                <MenuItem value="schedule">Schedule-based</MenuItem>
                                <MenuItem value="trigger">Trigger-based</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          {/* Repeat Interval */}
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Repeat Every</InputLabel>
                              <Select
                                value={assignTaskData.recurringOptions?.repeatInterval || 'weekly'}
                                onChange={(e) => handleRecurringOptionChange('repeatInterval', e.target.value)}
                                label="Repeat Every"
                              >
                                <MenuItem value="daily">Daily</MenuItem>
                                <MenuItem value="weekly">Weekly</MenuItem>
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="custom">Custom</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          {/* Custom Interval */}
                          {assignTaskData.recurringOptions?.repeatInterval === 'custom' && (
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Custom Interval (days)"
                                type="number"
                                value={assignTaskData.recurringOptions?.customInterval || 1}
                                onChange={(e) => handleRecurringOptionChange('customInterval', parseInt(e.target.value))}
                                inputProps={{ min: 1, max: 365 }}
                              />
                            </Grid>
                          )}

                          {/* Weekly - Specific Days */}
                          {assignTaskData.recurringOptions?.repeatInterval === 'weekly' && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Select days of the week:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {daysOfWeek.map((day) => (
                                  <FormControlLabel
                                    key={day.value}
                                    control={
                                      <Checkbox
                                        checked={(assignTaskData.recurringOptions?.specificDays || []).includes(day.value)}
                                        onChange={(e) => handleSpecificDaysChange(day.value, e.target.checked)}
                                        size="small"
                                      />
                                    }
                                    label={day.label}
                                    sx={{ 
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      borderRadius: 1,
                                      px: 1,
                                      m: 0,
                                      minWidth: 'auto'
                                    }}
                                  />
                                ))}
                              </Box>
                            </Grid>
                          )}

                          {/* Monthly Options */}
                          {assignTaskData.recurringOptions?.repeatInterval === 'monthly' && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Monthly repeat option:
                              </Typography>
                              <RadioGroup
                                row
                                value={assignTaskData.recurringOptions?.monthlyOption || 'date'}
                                onChange={(e) => handleRecurringOptionChange('monthlyOption', e.target.value)}
                              >
                                <FormControlLabel
                                  value="date"
                                  control={<Radio size="small" />}
                                  label="Same date each month"
                                />
                                <FormControlLabel
                                  value="day"
                                  control={<Radio size="small" />}
                                  label="Same day of week"
                                />
                              </RadioGroup>
                            </Grid>
                          )}

                          {/* End Conditions */}
                          <Grid item xs={12}>
                            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                              End Conditions
                            </Typography>
                            <RadioGroup
                              value={assignTaskData.recurringOptions?.endCondition || 'after'}
                              onChange={(e) => handleRecurringOptionChange('endCondition', e.target.value)}
                            >
                              <FormControlLabel
                                value="never"
                                control={<Radio size="small" />}
                                label="Never ends"
                              />
                              <FormControlLabel
                                value="after"
                                control={<Radio size="small" />}
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>After</span>
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={assignTaskData.recurringOptions?.repeatCount || 5}
                                      onChange={(e) => handleRecurringOptionChange('repeatCount', parseInt(e.target.value))}
                                      inputProps={{ min: 1, max: 100 }}
                                      sx={{ width: 80 }}
                                      disabled={assignTaskData.recurringOptions?.endCondition !== 'after'}
                                    />
                                    <span>occurrences</span>
                                  </Box>
                                }
                              />
                              <FormControlLabel
                                value="on"
                                control={<Radio size="small" />}
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>On</span>
                                    <DatePicker
                                      value={assignTaskData.recurringOptions?.endDate ? dayjs(assignTaskData.recurringOptions.endDate) : null}
                                      onChange={(newValue: Dayjs | null) => {
                                        handleRecurringOptionChange('endDate', newValue?.toDate() || null);
                                      }}
                                      disabled={assignTaskData.recurringOptions?.endCondition !== 'on'}
                                      slotProps={{
                                        textField: {
                                          size: 'small',
                                          sx: { width: 140 }
                                        }
                                      }}
                                    />
                                  </Box>
                                }
                              />
                            </RadioGroup>
                          </Grid>

                          {/* Repeat Count Slider (for 'after' condition) */}
                          {assignTaskData.recurringOptions?.endCondition === 'after' && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Number of repetitions: {assignTaskData.recurringOptions?.repeatCount || 5}
                              </Typography>
                              <Slider
                                value={assignTaskData.recurringOptions?.repeatCount || 5}
                                onChange={(e, value) => handleRecurringOptionChange('repeatCount', value as number)}
                                min={1}
                                max={50}
                                step={1}
                                marks={[
                                  { value: 1, label: '1' },
                                  { value: 10, label: '10' },
                                  { value: 25, label: '25' },
                                  { value: 50, label: '50' }
                                ]}
                                sx={{ mt: 2 }}
                              />
                            </Grid>
                          )}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {/* Recurring Summary */}
                  {assignTaskData.isRecurring && formatRecurringSummary() && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      bgcolor: 'primary.50', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'primary.200'
                    }}>
                      <Typography variant="body2" color="primary.dark" sx={{ fontWeight: 500 }}>
                        📅 {formatRecurringSummary()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
<Grid item xs={12}>
  <Box sx={{ 
    p: 2, 
    border: '1px solid', 
    borderColor: 'divider',
    borderRadius: 2,
    bgcolor: 'grey.50'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Assignment color="primary" fontSize="small" />
        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
          Task Approval
        </Typography>
      </Box>
    <FormControlLabel
  control={
    <Switch
      checked={Boolean(assignTaskData.approvalNeeded)}
      onChange={(e) => {
        console.log('🔄 SWITCH TOGGLED:', {
          checked: e.target.checked,
          currentApprovalNeeded: assignTaskData.approvalNeeded,
          timestamp: new Date().toISOString()
        });
        onDataChange('approvalNeeded', e.target.checked);
        
        // Add a timeout to check if the state actually updated
        setTimeout(() => {
          console.log('🔄 SWITCH STATE CHECK (after 100ms):', {
            approvalNeeded: assignTaskData.approvalNeeded
          });
        }, 100);
      }}
      color="primary"
    />
  }
  label="Approval Needed"
  sx={{ m: 0 }}
/>


    </Box>
    
    {assignTaskData.approvalNeeded && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This task will require approval after completion before being marked as fully completed
      </Typography>
    )}
  </Box>
</Grid>


{assignTaskData.approvalNeeded && (
  <Grid item xs={12}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Assignment fontSize="small" color="warning" />
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        Requires Approval: Yes
      </Typography>
    </Box>
  </Grid>
)}
                          {/* Time and Date Section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'grey.50'
                }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                    Time & Schedule
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Estimated Time */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'grey.300',
                        borderRadius: 2,
                        bgcolor: 'white'
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                          <Schedule fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Estimated Duration
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          <FormControl sx={{ minWidth: { xs: '100%', sm: 100 } }}>
                            <InputLabel size="small">Hours</InputLabel>
                            <Select
                              size="small"
                              value={assignTaskData.estimatedHours || '0'}
                              label="Hours"
                              onChange={(e) => {
                                const hours = e.target.value;
                                const minutes = assignTaskData.estimatedMinutes || '0';
                                const totalTime = hours === '0' && minutes === '0' ? '' :
                                                 hours === '0' ? `${minutes} minutes` :
                                                 minutes === '0' ? `${hours} hour${hours === '1' ? '' : 's'}` :
                                                 `${hours} hour${hours === '1' ? '' : 's'} ${minutes} minutes`;
                                onDataChange('estimatedTime', totalTime);
                                onDataChange('estimatedHours', hours);
                              }}
                              sx={{ borderRadius: 1 }}
                            >
                              {Array.from({ length: 25 }, (_, i) => (
                                <MenuItem key={i} value={i.toString()}>
                                  {i} {i === 1 ? 'hour' : 'hours'}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                            and
                          </Typography>

                          <FormControl sx={{ minWidth: { xs: '100%', sm: 100 } }}>
                            <InputLabel size="small">Minutes</InputLabel>
                            <Select
                              size="small"
                              value={assignTaskData.estimatedMinutes || '0'}
                              label="Minutes"
                              onChange={(e) => {
                                const minutes = e.target.value;
                                const hours = assignTaskData.estimatedHours || '0';
                                const totalTime = hours === '0' && minutes === '0' ? '' :
                                                 hours === '0' ? `${minutes} minutes` :
                                                 minutes === '0' ? `${hours} hour${hours === '1' ? '' : 's'}` :
                                                 `${hours} hour${hours === '1' ? '' : 's'} ${minutes} minutes`;
                                onDataChange('estimatedTime', totalTime);
                                onDataChange('estimatedMinutes', minutes);
                              }}
                              sx={{ borderRadius: 1 }}
                            >
                              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((minute) => (
                                <MenuItem key={minute} value={minute.toString()}>
                                  {minute} minutes
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>

                        {assignTaskData.estimatedTime && (
                          <Box sx={{ 
                            mt: 2, 
                            p: 1.5, 
                            bgcolor: 'primary.50', 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'primary.200'
                          }}>
                            <Typography variant="body2" color="primary.dark" sx={{ fontWeight: 500 }}>
                              Total Estimated Time: {assignTaskData.estimatedTime}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    {/* Due Date */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'grey.300',
                        borderRadius: 2,
                        bgcolor: 'white'
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                          <CalendarToday fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Due Date & Time
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                          <DatePicker
                            label="Due Date"
                            value={assignTaskData.dueDate ? dayjs(assignTaskData.dueDate) : null}
                            onChange={(newValue: Dayjs | null) => {
                              const currentTime = assignTaskData.dueDate ? dayjs(assignTaskData.dueDate) : dayjs().hour(17).minute(0);
                              const newDateTime = newValue ? 
                                newValue.hour(currentTime.hour()).minute(currentTime.minute()) : 
                                null;
                              onDataChange('dueDate', newDateTime?.toDate() || null);
                            }}
                            minDate={dayjs()}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: 'small',
                                variant: 'outlined',
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                  }
                                }
                              },
                              popper: {
                                sx: { zIndex: 1400 }
                              }
                            }}
                          />
                          <TimePicker
                            label="Due Time"
                            value={assignTaskData.dueDate ? dayjs(assignTaskData.dueDate) : null}
                            onChange={(newValue: Dayjs | null) => {
                              const currentDate = assignTaskData.dueDate ? dayjs(assignTaskData.dueDate) : dayjs();
                              const newDateTime = newValue ? 
                                currentDate.hour(newValue.hour()).minute(newValue.minute()) : 
                                null;
                              onDataChange('dueDate', newDateTime?.toDate() || null);
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: 'small',
                                variant: 'outlined',
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                  }
                                }
                              },
                              popper: {
                                sx: { zIndex: 1400 }
                              }
                            }}
                          />
                        </Box>

                        {assignTaskData.dueDate && (
                          <Box sx={{ 
                            mt: 2, 
                            p: 1.5, 
                            bgcolor: 'success.50', 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'success.200'
                          }}>
                            <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
                              Due: {dayjs(assignTaskData.dueDate).format('MMM DD, YYYY at hh:mm A')}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'grey.50'
                }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                    Additional Details
                  </Typography>
                  <TextField
                    label="Description (Optional)"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    value={assignTaskData.description || ''}
                    onChange={(e) => onDataChange('description', e.target.value)}
                    placeholder="Add any additional details, requirements, or notes for this task..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'white'
                      }
                    }}
                  />
                </Box>
              </Grid>

              {/* Task Summary Preview */}
              {(assignTaskData.taskName || assignTaskData.assignedToEmail) && (
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 3, 
                    border: '2px solid', 
                    borderColor: 'primary.200',
                    borderRadius: 2,
                    bgcolor: 'primary.50'
                  }}>
                    <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                      Task Summary
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {assignTaskData.taskName && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Assignment fontSize="small" color="primary" />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Task: {assignTaskData.taskName}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {assignTaskData.assignedToEmail && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person fontSize="small" color="primary" />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Assigned to: {users.find(u => u.email === assignTaskData.assignedToEmail)?.username || assignTaskData.assignedToEmail}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {assignTaskData.estimatedTime && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Schedule fontSize="small" color="primary" />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Duration: {assignTaskData.estimatedTime}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {assignTaskData.dueDate && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday fontSize="small" color="primary" />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Due: {dayjs(assignTaskData.dueDate).format('MMM DD, YYYY')}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {assignTaskData.isRecurring && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Repeat fontSize="small" color="primary" />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Recurring: {formatRecurringSummary()}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>

        {/* Enhanced Footer */}
        <DialogActions sx={{ 
          p: 3, 
          bgcolor: 'grey.50',
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 2
        }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            {loadingUsers && (
              <>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Loading users...
                </Typography>
              </>
            )}
          </Box>
          
          <Button 
            onClick={onHide}
            variant="outlined"
            size="large"
            sx={{ 
              minWidth: 100,
              borderRadius: 2
            }}
          >
            Cancel
          </Button>
          
          <Button
            // onClick={onAssign}
            onClick={() => {
    console.log('🚀 Assigning task with final data:', {
      taskName: assignTaskData.taskName,
      approvalNeeded: assignTaskData.approvalNeeded,
      assignedToEmail: assignTaskData.assignedToEmail,
      fullData: assignTaskData
    });
    onAssign();
  }}
            variant="contained"
            size="large"
            disabled={loadingUsers || !assignTaskData.taskName || !assignTaskData.assignedToEmail}
            sx={{ 
              minWidth: 120,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
            startIcon={<Assignment />}
          >
            Assign Task
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default React.memo(AssignTaskDialog);
