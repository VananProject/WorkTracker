import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  TextField,
  Switch,
  Chip,
  Divider,
  Grid,
  InputLabel,
  Checkbox,
  FormGroup,
  Alert
} from '@mui/material';
import {
  DatePicker,
  TimePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  Repeat,
  Schedule,
  Event,
  AccessTime,
  CalendarToday,
  Settings
} from '@mui/icons-material';
import type { Task } from '../../types/TaskHistoryTypes';

interface RecurringDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task, recurringSettings: any) => void;
}

type RecurrenceType = 'schedule' | 'trigger';
type SchedulePattern = 'daily' | 'weekly' | 'monthly';
type TriggerEvent = 'completion' | 'due_date' | 'manual';
type EndCondition = 'never' | 'after_count' | 'on_date';

interface RecurringSettings {
  isRecurring: boolean;
  recurrenceType: RecurrenceType;
  
  // Schedule-based settings
  schedulePattern: SchedulePattern;
  scheduleInterval: number;
  scheduleWeekdays: number[];
  scheduleTime: Dayjs | null;
  scheduleStartDate: Dayjs | null;
  
  // Trigger-based settings
  triggerEvent: TriggerEvent;
  triggerDelay: number;
  triggerDelayUnit: 'minutes' | 'hours' | 'days' | 'weeks';
  
  // End conditions
  endCondition: EndCondition;
  endCount: number;
  endDate: Dayjs | null;
  
  // Advanced options
  skipWeekends: boolean;
  workingDaysOnly: boolean;
  customWorkingDays: number[];
  monthlyWorkingDay: number;
  resetStatus: string;
}

const WEEKDAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
];

const WORKING_DAYS = [1, 2, 3, 4, 5]; // Monday to Friday

const RecurringDialog: React.FC<RecurringDialogProps> = ({
  open,
  task,
  onClose,
  onSave
}) => {
  const [settings, setSettings] = useState<RecurringSettings>({
    isRecurring: false,
    recurrenceType: 'schedule',
    schedulePattern: 'daily',
    scheduleInterval: 1,
    scheduleWeekdays: [],
    scheduleTime: dayjs().hour(9).minute(0),
    scheduleStartDate: dayjs().add(1, 'day'),
    triggerEvent: 'completion',
    triggerDelay: 1,
    triggerDelayUnit: 'days',
    endCondition: 'never',
    endCount: 10,
    endDate: null,
    skipWeekends: false,
    workingDaysOnly: false,
    customWorkingDays: WORKING_DAYS,
    monthlyWorkingDay: 1,
    resetStatus: 'todo'
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  useEffect(() => {
    if (task && open) {
      // Load existing recurring settings if available
      const existingSettings = task as any;
      if (existingSettings.isRecurring) {
        setSettings(prev => ({
          ...prev,
          isRecurring: existingSettings.isRecurring || false,
          recurrenceType: existingSettings.recurrenceType || 'schedule',
          schedulePattern: existingSettings.schedulePattern || 'daily',
          scheduleInterval: existingSettings.scheduleInterval || 1,
          scheduleTime: existingSettings.scheduleTime ? dayjs(existingSettings.scheduleTime) : dayjs().hour(9).minute(0),
          scheduleStartDate: existingSettings.scheduleStartDate ? dayjs(existingSettings.scheduleStartDate) : dayjs().add(1, 'day'),
          endDate: existingSettings.endDate ? dayjs(existingSettings.endDate) : null,
          endCondition: existingSettings.endCondition || 'never',
          endCount: existingSettings.endCount || 10,
          triggerEvent: existingSettings.triggerEvent || 'completion',
          triggerDelay: existingSettings.triggerDelay || 1,
          triggerDelayUnit: existingSettings.triggerDelayUnit || 'days',
          skipWeekends: existingSettings.skipWeekends || false,
          workingDaysOnly: existingSettings.workingDaysOnly || false,
          monthlyWorkingDay: existingSettings.monthlyWorkingDay || 1,
          resetStatus: existingSettings.resetStatus || 'todo'
        }));
      }
    }
  }, [task, open]);

const handleSave = () => {
  if (!task) return;

  console.log('💾 RecurringDialog: Saving settings for task:', task.taskName);
  
  const recurringData = {
    ...task,
    isRecurring: settings.isRecurring,
    recurringType: settings.recurrenceType,
    recurringStatus: settings.isRecurring ? 'active' : 'disabled',
    recurringPattern: {
      frequency: settings.schedulePattern,
      interval: settings.scheduleInterval,
      daysOfWeek: settings.scheduleWeekdays,
      dayOfMonth: settings.monthlyWorkingDay,
      workingDaysOnly: settings.workingDaysOnly,
      skipWeekends: settings.skipWeekends
    },
    // ✅ FIX: Add missing end conditions
    endConditions: {
      never: settings.endCondition === 'never',
      afterRuns: settings.endCondition === 'after_count' ? settings.endCount : null,
      endDate: settings.endCondition === 'on_date' && settings.endDate ? settings.endDate.toISOString() : null
    },
    recurringCount: (task as any).recurringCount || 0,
    // ✅ FIX: Properly calculate and save nextRun
    nextRun: settings.isRecurring ? calculateNextRun() : null,
    lastRun: (task as any).lastRun || null,
    taskId: task.taskId,
    taskName: task.taskName,
    userEmail: task.userEmail,
    username: task.username,
    status: task.status,
    totalDuration: task.totalDuration || 0
  };

  console.log('📋 Final recurring data with end conditions:', recurringData);
  onSave(task, recurringData);
  onClose();
};





  const generatePatternDescription = (): string => {
    if (!settings.isRecurring) return '';

    if (settings.recurrenceType === 'schedule') {
      let description = '';
      
      switch (settings.schedulePattern) {
        case 'daily':
          if (settings.workingDaysOnly) {
            description = `Every ${settings.scheduleInterval} working day${settings.scheduleInterval > 1 ? 's' : ''}`;
          } else if (settings.skipWeekends) {
            description = `Every ${settings.scheduleInterval} weekday${settings.scheduleInterval > 1 ? 's' : ''}`;
          } else {
            description = `Every ${settings.scheduleInterval} day${settings.scheduleInterval > 1 ? 's' : ''}`;
          }
          break;
        
        case 'weekly':
          if (settings.scheduleWeekdays.length > 0) {
            const days = settings.scheduleWeekdays.map(d => WEEKDAYS[d].label).join(', ');
            description = `Weekly on ${days}`;
          } else {
            description = `Every ${settings.scheduleInterval} week${settings.scheduleInterval > 1 ? 's' : ''}`;
          }
          break;
        
        case 'monthly':
          if (settings.workingDaysOnly && settings.monthlyWorkingDay > 0) {
            const ordinal = getOrdinalSuffix(settings.monthlyWorkingDay);
            description = `${settings.monthlyWorkingDay}${ordinal} working day of each month`;
          } else {
            description = `Every ${settings.scheduleInterval} month${settings.scheduleInterval > 1 ? 's' : ''}`;
          }
          break;
      }

      if (settings.scheduleTime) {
        description += ` at ${settings.scheduleTime.format('HH:mm')}`;
      }

      return description;
    } else {
      const eventMap = {
        completion: 'task completion',
        due_date: 'due date',
        manual: 'manual trigger'
      };
      
      return `On ${eventMap[settings.triggerEvent]}, repeat after ${settings.triggerDelay} ${settings.triggerDelayUnit}`;
    }
  };

  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const calculateNextRun = (): string | null => {
    if (!settings.isRecurring) return null;

    let nextRun = settings.scheduleStartDate || dayjs();

    if (settings.recurrenceType === 'schedule') {
      // Set the time
      if (settings.scheduleTime) {
        nextRun = nextRun.hour(settings.scheduleTime.hour()).minute(settings.scheduleTime.minute());
      }

      // If start date is in the past, calculate next occurrence
      if (nextRun.isBefore(dayjs())) {
        const now = dayjs();
        
        switch (settings.schedulePattern) {
          case 'daily':
            // Find next valid day
            let nextDaily = now.add(1, 'day');
            if (settings.scheduleTime) {
              nextDaily = nextDaily.hour(settings.scheduleTime.hour()).minute(settings.scheduleTime.minute());
            }
            
            if (settings.workingDaysOnly || settings.skipWeekends) {
              while (nextDaily.day() === 0 || nextDaily.day() === 6) {
                nextDaily = nextDaily.add(1, 'day');
              }
            }
            nextRun = nextDaily;
            break;
            
          case 'weekly':
            if (settings.scheduleWeekdays.length > 0) {
              // Find next occurrence of selected weekdays
              let nextWeekly = now.add(1, 'day');
              while (!settings.scheduleWeekdays.includes(nextWeekly.day())) {
                nextWeekly = nextWeekly.add(1, 'day');
              }
              if (settings.scheduleTime) {
                nextWeekly = nextWeekly.hour(settings.scheduleTime.hour()).minute(settings.scheduleTime.minute());
              }
              nextRun = nextWeekly;
            } else {
              nextRun = now.add(settings.scheduleInterval, 'week');
            }
            break;
            
          case 'monthly':
            nextRun = now.add(1, 'month').startOf('month');
            if (settings.workingDaysOnly && settings.monthlyWorkingDay > 0) {
              // Calculate Nth working day of next month
              let workingDayCount = 0;
              let currentDate = nextRun;
              
              while (workingDayCount < settings.monthlyWorkingDay) {
                if (currentDate.day() >= 1 && currentDate.day() <= 5) {
                  workingDayCount++;
                }
                if (workingDayCount < settings.monthlyWorkingDay) {
                  currentDate = currentDate.add(1, 'day');
                }
              }
              nextRun = currentDate;
            }
            
            if (settings.scheduleTime) {
              nextRun = nextRun.hour(settings.scheduleTime.hour()).minute(settings.scheduleTime.minute());
            }
            break;
        }
      }
    } else {
      // For trigger-based, next run depends on when trigger occurs
      nextRun = dayjs().add(settings.triggerDelay, settings.triggerDelayUnit);
    }

    return nextRun.toISOString();
  };

  const generateCronExpression = (): string => {
    if (!settings.isRecurring || settings.recurrenceType !== 'schedule') return '';

    const time = settings.scheduleTime || dayjs();
    const minute = time.minute();
    const hour = time.hour();

    switch (settings.schedulePattern) {
      case 'daily':
        if (settings.workingDaysOnly || settings.skipWeekends) {
          return `${minute} ${hour} * * 1-5`; // Monday to Friday
        }
        return `${minute} ${hour} */${settings.scheduleInterval} * *`;
      
      case 'weekly':
        if (settings.scheduleWeekdays.length > 0) {
          const days = settings.scheduleWeekdays.join(',');
          return `${minute} ${hour} * * ${days}`;
        }
        return `${minute} ${hour} * * 0`; // Default to Sunday
      
      case 'monthly':
        return `${minute} ${hour} 1 */${settings.scheduleInterval} *`;
      
      default:
        return '';
    }
  };

  const renderBasicSettings = () => (
    <Box sx={{ mt: 2 }}>
      <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
        <FormLabel component="legend">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Repeat />
            Recurrence Type
          </Box>
        </FormLabel>
        <RadioGroup
          value={settings.recurrenceType}
          onChange={(e) => setSettings(prev => ({ ...prev, recurrenceType: e.target.value as RecurrenceType }))}
        >
          <FormControlLabel
            value="schedule"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  <Schedule sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Repeat Schedule
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Fixed time intervals (daily, weekly, monthly)
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            value="trigger"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  <Event sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                   Repeat Trigger
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Triggered by task completion or other events
                </Typography>
              </Box>
            }
          />
        </RadioGroup>
      </FormControl>

      {settings.recurrenceType === 'schedule' && (
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Schedule Pattern</InputLabel>
            <Select
              value={settings.schedulePattern}
              onChange={(e) => setSettings(prev => ({ ...prev, schedulePattern: e.target.value as SchedulePattern }))}
            >
              <MenuItem value="daily">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" />
                  Daily
                </Box>
              </MenuItem>
              <MenuItem value="weekly">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Event fontSize="small" />
                  Weekly
                </Box>
              </MenuItem>
              <MenuItem value="monthly">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule fontSize="small" />
                  Monthly
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                label="Repeat every"
                type="number"
                value={settings.scheduleInterval}
                onChange={(e) => setSettings(prev => ({ ...prev, scheduleInterval: Math.max(1, parseInt(e.target.value) || 1) }))}
                inputProps={{ min: 1, max: 365 }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                {settings.schedulePattern}(s)
              </Typography>
            </Grid>
          </Grid>

          {settings.schedulePattern === 'weekly' && (
            <Box sx={{ mb: 2 }}>
              <FormLabel>Repeat on</FormLabel>
              <FormGroup row>
                {WEEKDAYS.map((day) => (
                  <FormControlLabel
                    key={day.value}
                    control={
                      <Checkbox
                        checked={settings.scheduleWeekdays.includes(day.value)}
                        onChange={(e) => {
                          const weekdays = e.target.checked
                            ? [...settings.scheduleWeekdays, day.value].sort()
                            : settings.scheduleWeekdays.filter(d => d !== day.value);
                          setSettings(prev => ({ ...prev, scheduleWeekdays: weekdays }));
                        }}
                      />
                    }
                    label={day.label}
                  />
                ))}
              </FormGroup>
            </Box>
          )}

          {settings.schedulePattern === 'monthly' && (
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.workingDaysOnly}
                    onChange={(e) => setSettings(prev => ({ ...prev, workingDaysOnly: e.target.checked }))}
                  />
                }
                label="Use working days only"
              />
              {settings.workingDaysOnly && (
                <TextField
                  label="Working day of month"
                  type="number"
                  value={settings.monthlyWorkingDay}
                  onChange={(e) => setSettings(prev => ({ ...prev, monthlyWorkingDay: Math.max(1, parseInt(e.target.value) || 1) }))}
                  inputProps={{ min: 1, max: 31 }}
                  fullWidth
                  sx={{ mt: 1 }}
                  helperText="e.g., 5 = 5th working day of each month"
                />
              )}
            </Box>
          )}

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TimePicker
                  label="Time"
                  value={settings.scheduleTime}
                  onChange={(newValue) => setSettings(prev => ({ ...prev, scheduleTime: newValue }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Start Date"
                  value={settings.scheduleStartDate}
                  onChange={(newValue) => setSettings(prev => ({ ...prev, scheduleStartDate: newValue }))}
                  slotProps={{ textField: { fullWidth: true } }}
                  minDate={dayjs()}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>
      )}

      {settings.recurrenceType === 'trigger' && (
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Trigger Event</InputLabel>
            <Select
              value={settings.triggerEvent}
              onChange={(e) => setSettings(prev => ({ ...prev, triggerEvent: e.target.value as TriggerEvent }))}
            >
              <MenuItem value="completion">When task is completed</MenuItem>
              <MenuItem value="due_date">When due date passes</MenuItem>
              <MenuItem value="manual">Manual trigger</MenuItem>
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Delay"
                type="number"
                value={settings.triggerDelay}
                onChange={(e) => setSettings(prev => ({ ...prev, triggerDelay: Math.max(1, parseInt(e.target.value) || 1) }))}
                inputProps={{ min: 1 }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={settings.triggerDelayUnit}
                  onChange={(e) => setSettings(prev => ({ ...prev, triggerDelayUnit: e.target.value as any }))}
                >
                  <MenuItem value="minutes">Minutes</MenuItem>
                  <MenuItem value="hours">Hours</MenuItem>
                  <MenuItem value="days">Days</MenuItem>
                  <MenuItem value="weeks">Weeks</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 3 }}>
        <FormLabel>End Condition</FormLabel>
        <RadioGroup
          value={settings.endCondition}
          onChange={(e) => setSettings(prev => ({ ...prev, endCondition: e.target.value as EndCondition }))}
        >
          <FormControlLabel value="never" control={<Radio />} label="Never (recur forever)" />
          <FormControlLabel 
            value="after_count" 
            control={<Radio />} 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>After</span>
                <TextField
                  size="small"
                  type="number"
                  value={settings.endCount}
                  onChange={(e) => setSettings(prev => ({ ...prev, endCount: Math.max(1, parseInt(e.target.value) || 1) }))}
                  inputProps={{ min: 1, style: { width: '60px' } }}
                  disabled={settings.endCondition !== 'after_count'}
                />
                <span>occurrences</span>
              </Box>
            }
          />
          <FormControlLabel 
            value="on_date" 
            control={<Radio />} 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>On</span>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={settings.endDate}
                    onChange={(newValue) => setSettings(prev => ({ ...prev, endDate: newValue }))}
                    disabled={settings.endCondition !== 'on_date'}
                    minDate={dayjs().add(1, 'day')}
                    slotProps={{ 
                      textField: { 
                        size: 'small',
                        sx: { width: '150px' }
                      } 
                    }}
                  />
                </LocalizationProvider>
              </Box>
            }
          />
        </RadioGroup>
      </Box>
    </Box>
  );

  const renderAdvancedSettings = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings />
        Advanced Options
      </Typography>

      <FormGroup sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.skipWeekends}
              onChange={(e) => setSettings(prev => ({ ...prev, skipWeekends: e.target.checked }))}
            />
          }
          label="Skip weekends (Saturday & Sunday)"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={settings.workingDaysOnly}
              onChange={(e) => setSettings(prev => ({ ...prev, workingDaysOnly: e.target.checked }))}
            />
          }
          label="Working days only"
        />
      </FormGroup>

      {settings.workingDaysOnly && (
        <Box sx={{ mb: 3 }}>
          <FormLabel>Custom Working Days</FormLabel>
          <FormGroup row>
            {WEEKDAYS.map((day) => (
              <FormControlLabel
                key={day.value}
                control={
                  <Checkbox
                    checked={settings.customWorkingDays.includes(day.value)}
                    onChange={(e) => {
                      const workingDays = e.target.checked
                        ? [...settings.customWorkingDays, day.value].sort()
                        : settings.customWorkingDays.filter(d => d !== day.value);
                      setSettings(prev => ({ ...prev, customWorkingDays: workingDays }));
                    }}
                  />
                }
                label={day.label}
              />
            ))}
          </FormGroup>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Reset Status To</InputLabel>
        <Select
          value={settings.resetStatus}
          onChange={(e) => setSettings(prev => ({ ...prev, resetStatus: e.target.value }))}
        >
          <MenuItem value="todo">TO DO</MenuItem>
          <MenuItem value="in_progress">IN PROGRESS</MenuItem>
          <MenuItem value="pending">PENDING</MenuItem>
          <MenuItem value="started">STARTED</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  const renderPreview = () => {
    if (!settings.isRecurring) return null;

    const nextRun = calculateNextRun();
    const description = generatePatternDescription();

    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
          Preview: {description}
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
          Next run: {nextRun ? dayjs(nextRun).format('MMM DD, YYYY [at] HH:mm') : 'Not scheduled'}
        </Typography>
        {settings.endCondition !== 'never' && (
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
            {settings.endCondition === 'after_count' 
              ? `Will run ${settings.endCount} times` 
              : `Will end on ${settings.endDate?.format('MMM DD, YYYY')}`
            }
          </Typography>
        )}
      </Alert>
    );
  };

  const validateSettings = (): string[] => {
    const errors: string[] = [];

    if (!settings.isRecurring) return errors;

    if (settings.recurrenceType === 'schedule') {
      if (!settings.scheduleStartDate) {
        errors.push('Start date is required');
      }
      
      if (!settings.scheduleTime) {
        errors.push('Time is required');
      }

      if (settings.schedulePattern === 'weekly' && settings.scheduleWeekdays.length === 0) {
        errors.push('At least one weekday must be selected for weekly recurrence');
      }

      if (settings.scheduleInterval < 1) {
        errors.push('Interval must be at least 1');
      }
    }

    if (settings.recurrenceType === 'trigger') {
      if (settings.triggerDelay < 1) {
        errors.push('Trigger delay must be at least 1');
      }
    }

    if (settings.endCondition === 'after_count' && settings.endCount < 1) {
      errors.push('End count must be at least 1');
    }

    if (settings.endCondition === 'on_date' && !settings.endDate) {
      errors.push('End date is required');
    }

    if (settings.endCondition === 'on_date' && settings.endDate && settings.scheduleStartDate) {
      if (settings.endDate.isBefore(settings.scheduleStartDate)) {
        errors.push('End date must be after start date');
      }
    }

    if (settings.workingDaysOnly && settings.customWorkingDays.length === 0) {
      errors.push('At least one working day must be selected');
    }

    return errors;
  };

  const validationErrors = validateSettings();
  const canSave = validationErrors.length === 0;

  if (!task) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Repeat color="primary" />
          Configure Recurring Task
        </Box>
        <Typography variant="body2" color="textSecondary">
          Task: <strong>{task.taskName}</strong>
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.isRecurring}
                onChange={(e) => setSettings(prev => ({ ...prev, isRecurring: e.target.checked }))}
                color="primary"
              />
            }
            label={
              <Typography variant="h6">
                Enable Recurring Task
              </Typography>
            }
          />
        </Box>

                {settings.isRecurring && (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Button
                variant={activeTab === 'basic' ? 'contained' : 'text'}
                onClick={() => setActiveTab('basic')}
                sx={{ mr: 1 }}
              >
                Basic Settings
              </Button>
              <Button
                variant={activeTab === 'advanced' ? 'contained' : 'text'}
                onClick={() => setActiveTab('advanced')}
              >
                Advanced Settings
              </Button>
            </Box>

            {activeTab === 'basic' ? renderBasicSettings() : renderAdvancedSettings()}
            
            {renderPreview()}

            {validationErrors.length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Please fix the following errors:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {validationErrors.map((error, index) => (
                    <li key={index}>
                      <Typography variant="body2">{error}</Typography>
                    </li>
                  ))}
                </ul>
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={settings.isRecurring && !canSave}
          color={settings.isRecurring ? 'primary' : 'error'}
        >
          {settings.isRecurring ? 'Save Recurring Settings' : 'Disable Recurring'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(RecurringDialog);

