
import React, { useCallback } from 'react';
import { Box, Typography, Chip, Collapse } from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';
import { timerStyles } from '../../../styles/TaskTimer.styles';
import TimerDisplay from '../DisplayUI/TimerDisplay';
import AdminPanel from './AdminPanel';
import AssignedTasksSection from './AssignedTasksSection';
import NotificationsSection from './NotificationsSection';
import TaskTimerControls from './TaskTimerControls';
import TaskTimerDialogs from './TimerDialog/TaskTimerDialogs';
import TaskHistoryTableEnhanced from '../TableUI/TaskHistoryTable/TaskHistoryTableEnhanced';
import { useSelectiveRefresh } from '../../../hooks/useSelectiveRefresh';
import { exportTaskLevelReport } from '../../../services/taskService';
import DailyTimeTrackingCard from './DailyTimeTrackingCard';

interface TaskTimerUIProps {
  // State props
  state: any;
  currentUser: any;
  isAdmin: boolean;
  showAdminPanel: boolean;
  assignedTasks: any[];
  allTasks: any[];
  alarmNotification: string | null;
  pausedTaskNotification: string | null;
  onResumeAssignedTask?: (task: any) => void;
  showHistory: boolean;
  tableFilters: any;
  tablePage: number;
  tableRowsPerPage: number;
  expandedRows: Set<string>;
  showAssignDialog: boolean;
  users: any[];
  loadingUsers: boolean;
  userError: string | null;
  assignTaskData: any;

  // Handler props
  dispatch: (action: any) => void;
  formatTime: (seconds: number) => string;
  onStartTask: (type: 'task' | 'meeting') => void;
  onCreateTask: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onStartAssignedTask: (task: any) => void;
  onSetAlarm: (minutes: number) => void;
  onTestAlarmSound: () => void;
  onToggleHistory: () => void;
  onTableFilterChange: (field: string, value: string) => void;
  onTablePageChange: (event: unknown, newPage: number) => void;
  onTableRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleRowExpansion: (taskName: string) => void;
  onTableAction: (task: any, action: 'resume' | 'stop' | 'start') => void;
  onToggleAdminPanel: () => void;
  onShowAssignDialog: () => void;
  onHideAssignDialog: () => void;
  onAssignTask: () => void;
  onAssignTaskDataChange: (field: string, value: string | Date | null) => void;
  onLoadUsers: () => void;
  onSetAlarmNotification: (message: string | null) => void;
  onSetPausedTaskNotification: (message: string | null) => void;
  getFilteredUserTasks: () => any[];
  getPausedTasks: () => any[];
  onRefresh?: () => Promise<void>;
  onRefreshAssignedTasks?: () => Promise<void>;
  onRefreshTaskHistory?: () => Promise<void>;
}

const TaskTimerUI: React.FC<TaskTimerUIProps> = (props) => {
  const {
    state,
    currentUser,
    isAdmin,
    showAdminPanel,
    assignedTasks,
    alarmNotification,
    pausedTaskNotification,
    formatTime,
    showHistory,
    getFilteredUserTasks,
    getPausedTasks,
    onToggleHistory,
    tableFilters,
    onTableFilterChange,
    tablePage,
    tableRowsPerPage,
    onTablePageChange,
    onTableRowsPerPageChange,
    expandedRows,
    onToggleRowExpansion,
    onTableAction,
    onSetAlarmNotification,
    onSetPausedTaskNotification,
    onRefresh,
    onPause,
    onResume,
    onStop,
    allTasks,
  } = props;

  const { refreshKeys, refreshComponent, refreshMultiple } = useSelectiveRefresh();

  // Enhanced check for ACTIVE assigned tasks only
  const hasActiveAssignedTasks = React.useMemo(() => {
    if (!assignedTasks || !Array.isArray(assignedTasks)) {
      return false;
    }
    
    // Filter for ACTIVE tasks only (not completed/ended)
    const activeTasks = assignedTasks.filter(task => {
      // Basic validation
      if (!task || typeof task !== 'object') {
        return false;
      }
      
      // Must have required fields
      if (!task.taskId || !(task.taskName || task.name || task.title)) {
        return false;
      }
      
      // Exclude completed/ended tasks
      const excludedStatuses = ['ended', 'completed', 'finished', 'done'];
      if (task.status && excludedStatuses.includes(task.status.toLowerCase())) {
        return false;
      }
      
      // Include tasks that are pending, started, paused, resumed, or have no status
      const activeStatuses = ['pending', 'started', 'paused', 'resumed', 'assigned'];
      return !task.status || activeStatuses.includes(task.status.toLowerCase());
    });
    
    return activeTasks.length > 0;
  }, [assignedTasks]);

  const handleExportTaskLevelReport = async (userEmail: string) => {
    try {
      const result = await exportTaskLevelReport(userEmail);
      if (result.success) {
        onSetAlarmNotification?.('✅ Task level report exported successfully!');
      } else {
        onSetAlarmNotification?.('❌ Failed to export report: ' + result.error);
      }
    } catch (error) {
      console.error('Error exporting task level report:', error);
      onSetAlarmNotification?.('❌ Error exporting report');
    }
  };

  const handleTaskAssigned = useCallback(async () => {
    // Refresh both components after task assignment
    refreshMultiple(['assignedTasks', 'taskHistory']);
    
    // Optionally fetch fresh data
    if (props.onRefresh) {
      await props.onRefresh();
    }
  }, [refreshMultiple, props.onRefresh]);

  // Debug logging (remove in production)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('TaskTimerUI Debug:', {
        state: {
          isRunning: state.isRunning,
          elapsedTime: state.elapsedTime,
          currentTask: state.currentTask ? {
            name: state.currentTask.taskName,
            status: state.currentTask.status,
            duration: state.currentTask.duration,
            startTime: state.currentTask.startTime,
            lastStartTime: state.currentTask.lastStartTime
          } : null
        }
      });
    }
  }, [state]);

  return (
    <Box sx={timerStyles.container}>
      {/* Admin Panel - Controlled by AppBar state */}
      {isAdmin && (
        <Collapse in={showAdminPanel}>
          <Box sx={{ 
            width: { 
              xs: '100%',
              sm: '120%',
              md: '140%',
              lg: '160%',
              xl: '180%'
            },
            maxWidth: { 
              xs: '100vw',
              sm: '900px',
              md: '1300px',
              lg: '1700px',
              xl: '2400px'
            },
            mx: 0,
            ml: { 
              xs: 0,
              sm: -18,
              md: -22,
              lg: -26,
              xl: -30
            },
            mr: 'auto',
            px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
            py: { xs: 2, sm: 2.5, md: 3 },
            overflow: 'visible',
            transition: 'all 0.3s ease-in-out',
            mb: 3,
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.02) 0%, rgba(156, 39, 176, 0.05) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(156, 39, 176, 0.1)',
            boxShadow: '0 8px 32px rgba(156, 39, 176, 0.1)',
            animation: showAdminPanel ? 'adminPanelSlideIn 0.5s ease-out' : 'none',
           
            '@keyframes adminPanelSlideIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-20px) scale(0.95)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0) scale(1)',
              },
            },
          }}>
            {/* Admin Panel Header */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              p: 2,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'adminIconPulse 2s ease-in-out infinite',
                    '@keyframes adminIconPulse': {
                      '0%, 100%': { 
                        boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
                      },
                      '50%': { 
                        boxShadow: '0 6px 20px rgba(156, 39, 176, 0.5)',
                      },
                    },
                  }}
                >
                  <AdminPanelSettings sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      color: 'secondary.main',
                      mb: 0.5,
                    }}
                  >
                    Admin Dashboard
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                  >
                    Manage users, tasks, and monitor system activity
                  </Typography>
                </Box>
              </Box>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  background: 'rgba(156, 39, 176, 0.1)',
                  border: '1px solid rgba(156, 39, 176, 0.2)',
                  fontWeight: 600,
                }}
              >
                Controlled from AppBar
              </Typography>
            </Box>
            
            {/* Admin Panel Content */}
            <AdminPanel 
              {...props} 
              onRefresh={onRefresh}
            />
          </Box>
        </Collapse>
      )}

      {/* Daily Time Tracking Card */}
      <DailyTimeTrackingCard
        tasks={getFilteredUserTasks()} // Only pass current user's tasks
        formatTime={formatTime}
        currentUser={currentUser}
        isRunning={state.isRunning}
        currentTask={getFilteredUserTasks().find((task: { status: string; }) => ['started', 'resumed'].includes(task.status)) || null}
      />

      {/* Timer Display - Pass the state directly, let TimerDisplay handle the calculation */}
      <TimerDisplay
        elapsedTime={state.elapsedTime}
        currentTask={state.currentTask}
        alarmTime={state.alarmTime}
        formatTime={formatTime}
        onTestAlarmSound={props.onTestAlarmSound}
      />

      {/* Notifications Section */}
      <NotificationsSection
        pausedTasks={getPausedTasks()}
        error={state.error}
        alarmNotification={alarmNotification}
        pausedTaskNotification={pausedTaskNotification}
        onSetAlarmNotification={onSetAlarmNotification}
        onSetPausedTaskNotification={onSetPausedTaskNotification}
        currentUser={currentUser} 
      />

      {/* Control Buttons */}
      <TaskTimerControls {...props} />

      {/* Assigned Tasks Section */}
      {hasActiveAssignedTasks && (
        <Box sx={{ 
          mb: 2,
          width: '100%',
          maxWidth: 'none',
          mx: { 
            xs: -1,
            sm: -2,
            md: -3,
            lg: -4,
            xl: -5
          },
          px: { 
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 5
          },
          '& .MuiCard-root': {
            width: '100% !important',
            maxWidth: 'none !important',
          },
          minWidth: {
            xs: 'calc(100vw - 16px)',
            sm: 'calc(100vw - 32px)',
            md: 'calc(100vw - 48px)',
            lg: 'calc(100vw - 64px)',
            xl: 'calc(100vw - 80px)'
          }
        }}>
          <AssignedTasksSection 
            key={refreshKeys.assignedTasks}
            {...props} 
          />
        </Box>
      )}

      {/* Task History Table */}
      <Box sx={{
        mb: 2,
        width: '90%',
        maxWidth: 'none',
        mx: {
          xs: 2,
          sm: 3,
          md: 4,
          lg: 5,
          xl: 6
        },
        px: {
          xs: 2,
          sm: 3,
          md: 4,
          lg: 5,
          xl: 6
        },
        '& .MuiCard-root': {
          width: '100% !important',
          maxWidth: 'none !important',
        },
        minWidth: {
          xs: 'calc(94vw + 2px)',
          sm: 'calc(94vw + 4px)',
          md: 'calc(94vw + 6px)',
          lg: 'calc(94vw + 8px)',
          xl: 'calc(94vw + 10px)'
        },
        position: 'relative',
        left: {
          xs: '-24px',
          sm: '-28px',
          md: '-32px',
          lg: '-36px',
          xl: '-40px'
        },
        overflow: 'visible',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: {
            xs: '-40px',
            sm: '-50px',
            md: '-60px',
            lg: '-70px',
            xl: '-80px'
          },
          width: '1px',
          height: '1px',
          visibility: 'hidden'
        }
      }}>
        <TaskHistoryTableEnhanced
          key={refreshKeys.taskHistory}
          showHistory={showHistory}
          onToggleHistory={onToggleHistory}
          filteredTasks={getFilteredUserTasks()}
          tableFilters={tableFilters}
          onFilterChange={onTableFilterChange}
          tablePage={tablePage}
          tableRowsPerPage={tableRowsPerPage}
          onPageChange={onTablePageChange}
          onRowsPerPageChange={onTableRowsPerPageChange}
          expandedRows={expandedRows}
          onToggleRowExpansion={onToggleRowExpansion}
          formatTime={formatTime}
          onTableAction={onTableAction}
          isRunning={state.isRunning}
          currentUser={currentUser}
          isAdmin={isAdmin}
          isActivityPage={true}
          allTasks={props.allTasks || []}
          onExportTaskLevelReport={handleExportTaskLevelReport}
          assignedTasks={assignedTasks || []}
        />
      </Box> 

      {/* All Dialogs */}
      <TaskTimerDialogs {...props} 
        allTasks={props.allTasks || []}
      />
    </Box>
  );
};

export default TaskTimerUI;
