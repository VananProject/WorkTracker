
import React, { useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { CalendarToday, Clear } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import type { TableFilters } from '../types/TaskHistoryTypes';
// import { Schedule, InputAdornment } from '@mui/material';
interface FilterSectionProps {
  tableFilters: TableFilters;
  onFilterChange: (key: keyof TableFilters, value: string) => void; // ✅ Fixed type
  isAdmin?: boolean;

  estimatedTimeFilter?: string;
  onEstimatedTimeFilterChange?: (filter: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  tableFilters,
  onFilterChange,
  isAdmin = false,

   estimatedTimeFilter,
  onEstimatedTimeFilterChange
}) => {
  const [showCustomDateDialog, setShowCustomDateDialog] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Dayjs | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Dayjs | null>(null);

  const handleDateRangeChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomDateDialog(true);
    } else {
      onFilterChange('dateRange', value);
      onFilterChange('customStartDate', '');
      onFilterChange('customEndDate', '');
    }
  };
// Add the same parsing function to FilterSection.tsx
const parseEstimatedTimeToSeconds = (estimatedTimeString: string | number): number => {
  // Same function as above
  if (typeof estimatedTimeString === 'number') {
    return estimatedTimeString;
  }

  if (typeof estimatedTimeString !== 'string') {
    return 0;
  }

  let totalSeconds = 0;
  const timeString = estimatedTimeString.toLowerCase().trim();

  if (!timeString || timeString === 'not set' || timeString === '') {
    return 0;
  }

  try {
    const hourMatch = timeString.match(/(\d+)\s*(?:hour|hr|h)s?/);
    if (hourMatch) {
      totalSeconds += parseInt(hourMatch[1]) * 3600;
    }

    const minuteMatch = timeString.match(/(\d+)\s*(?:minute|min|m)s?/);
    if (minuteMatch) {
      totalSeconds += parseInt(minuteMatch[1]) * 60;
    }

    const secondMatch = timeString.match(/(\d+)\s*(?:second|sec|s)s?/);
    if (secondMatch) {
      totalSeconds += parseInt(secondMatch[1]);
    }

    if (totalSeconds === 0) {
      const numberMatch = timeString.match(/^(\d+)$/);
      if (numberMatch) {
        totalSeconds = parseInt(numberMatch[1]) * 60;
      }
    }

    return totalSeconds;
  } catch (error) {
    console.error('Error parsing estimated time:', estimatedTimeString, error);
    return 0;
  }
};

// Update the getEstimatedTimeInMinutes function in FilterSection
const getEstimatedTimeInMinutes = (task: any): number => {
  const estimatedTimeRaw = task.estimatedTime || task.estimated_time || 0;
  const estimatedTimeInSeconds = parseEstimatedTimeToSeconds(estimatedTimeRaw);
  return estimatedTimeInSeconds / 60; // Convert to minutes
};

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      onFilterChange('dateRange', 'custom');
      onFilterChange('customStartDate', customStartDate.toISOString());
      onFilterChange('customEndDate', customEndDate.toISOString());
      setShowCustomDateDialog(false);
    }
  };

  const handleCustomDateClear = () => {
    setCustomStartDate(null);
    setCustomEndDate(null);
    onFilterChange('dateRange', 'all');
    onFilterChange('customStartDate', '');
    onFilterChange('customEndDate', '');
    setShowCustomDateDialog(false);
  };

  const handleClearAllFilters = () => {
    onFilterChange('taskName', '');
    if (isAdmin) {
      onFilterChange('username', '');
    }
    onFilterChange('type', 'all');
    onFilterChange('status', 'all');
    onFilterChange('dateRange', 'all');
    onFilterChange('customStartDate', '');
    onFilterChange('customEndDate', '');
    setCustomStartDate(null);
    setCustomEndDate(null);

     if (onEstimatedTimeFilterChange) {
    onEstimatedTimeFilterChange('all');
  }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Task Name Filter */}
          <Grid item xs={12} sm={6} md={isAdmin ? 2 : 3} sx={{ mt: 2 }}>
            <TextField
              size="small"
              label="Search Task Name"
              value={tableFilters.taskName}
              onChange={(e) => onFilterChange('taskName', e.target.value)}
              fullWidth
            />
          </Grid>
          
          {/* Username Filter (Admin only) */}
          {isAdmin && (
            <Grid item xs={12} sm={6} md={2} sx={{ mt: 2 }}>
              <TextField
                size="small"
                label="Search Username"
                value={tableFilters.username || ''}
                onChange={(e) => onFilterChange('username', e.target.value)}
                fullWidth
              />
            </Grid>
          )}
          
          {/* Type Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={tableFilters.type}
                label="Type"
                onChange={(e) => onFilterChange('type', e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="task">Task</MenuItem>
                <MenuItem value="meeting">Meeting</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Status Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={tableFilters.status}
                label="Status"
                onChange={(e) => onFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="started">Started</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="resumed">Resumed</MenuItem>
                <MenuItem value="ended">Ended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Date Range Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={tableFilters.dateRange}
                label="Date Range"
                onChange={(e) => handleDateRangeChange(e.target.value)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="custom">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" />
                    Custom Range
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {onEstimatedTimeFilterChange && (
  <Grid item xs={12} sm={6} md={2}>
    <FormControl size="small" fullWidth>
      <InputLabel>Estimated Time</InputLabel>
      <Select
        value={estimatedTimeFilter || 'all'}
        label="Estimated Time"
        onChange={(e) => onEstimatedTimeFilterChange(e.target.value)}
      >
        <MenuItem value="all">All Durations</MenuItem>
        <MenuItem value="under15">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: '#ffebee', 
                border: '2px solid #f44336',
                borderRadius: 1 
              }} 
            />
            Under 15 min
          </Box>
        </MenuItem>
        <MenuItem value="15to30">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: '#fff3e0', 
                border: '2px solid #ff9800',
                borderRadius: 1 
              }} 
            />
            15-30 min
          </Box>
        </MenuItem>
        <MenuItem value="30to60">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: '#f3e5f5', 
                border: '2px solid #9c27b0',
                borderRadius: 1 
              }} 
            />
            30-60 min
          </Box>
        </MenuItem>
        <MenuItem value="over60">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: '#e8f5e8', 
                border: '2px solid #4caf50',
                borderRadius: 1 
              }} 
            />
            Over 1 hour
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
  </Grid>
)}
          {/* Clear Filters Button */}
          <Grid item xs={12} sm={6} md={isAdmin ? 2 : 3}>
            <Button
              variant="outlined"
              onClick={handleClearAllFilters}
              fullWidth
              size="small"
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {/* Show custom date range if selected */}
        {tableFilters.dateRange === 'custom' && tableFilters.customStartDate && tableFilters.customEndDate && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label={`${dayjs(tableFilters.customStartDate).format('MM/DD/YYYY')} - ${dayjs(tableFilters.customEndDate).format('MM/DD/YYYY')}`}
              onDelete={handleCustomDateClear}
              deleteIcon={<Clear />}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        {/* Active Filters Display */}
        {(tableFilters.username || tableFilters.taskName || tableFilters.type !== 'all' || tableFilters.status !== 'all' || tableFilters.dateRange !== 'all') && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
              Active filters:
            </Typography>
            {tableFilters.username && (
              <Chip
                label={`Username: ${tableFilters.username}`}
                size="small"
                onDelete={() => onFilterChange('username', '')}
                color="primary"
              />
            )}
            {tableFilters.taskName && (
              <Chip
                label={`Task: ${tableFilters.taskName}`}
                size="small"
                onDelete={() => onFilterChange('taskName', '')}
                color="primary"
              />
            )}
            {tableFilters.type !== 'all' && (
              <Chip
                label={`Type: ${tableFilters.type}`}
                size="small"
                onDelete={() => onFilterChange('type', 'all')}
                color="primary"
              />
            )}
            {tableFilters.status !== 'all' && (
              <Chip
                label={`Status: ${tableFilters.status}`}
                size="small"
                onDelete={() => onFilterChange('status', 'all')}
                color="primary"
              />
            )}
            {tableFilters.dateRange !== 'all' && (
              <Chip
                label={`Date: ${tableFilters.dateRange}`}
                size="small"
                onDelete={() => onFilterChange('dateRange', 'all')}
                color="primary"
              />
            )}
          </Box>
        )}
      </Box>

      {/* Custom Date Range Dialog */}
      <Dialog open={showCustomDateDialog} onClose={() => setShowCustomDateDialog(false)}>
        <DialogTitle>Select Custom Date Range</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
            <DatePicker
              label="Start Date"
              value={customStartDate}
              onChange={(newValue) => setCustomStartDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small'
                }
              }}
            />
            <DatePicker
              label="End Date"
              value={customEndDate}
              onChange={(newValue) => setCustomEndDate(newValue)}
              minDate={customStartDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomDateDialog(false)}>Cancel</Button>
          <Button onClick={handleCustomDateClear} color="error">Clear</Button>
          <Button 
            onClick={handleCustomDateApply} 
            variant="contained"
            disabled={!customStartDate || !customEndDate}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default FilterSection;
