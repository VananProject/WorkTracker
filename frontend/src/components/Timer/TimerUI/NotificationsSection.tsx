import React from 'react';
import { Alert, Typography, Snackbar } from '@mui/material';
import { NotificationImportant } from '@mui/icons-material';

interface NotificationsSectionProps {
  pausedTasks: any[];
  error: string | null;
  alarmNotification?: string | null;
  pausedTaskNotification?: string | null;
  onSetAlarmNotification?: (message: string | null) => void;
  onSetPausedTaskNotification?: (message: string | null) => void;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  pausedTasks,
  error,
  alarmNotification,
  pausedTaskNotification,
  onSetAlarmNotification,
  onSetPausedTaskNotification
}) => {
  return (
    <>
      {/* Paused Tasks Alert */}
      {pausedTasks.length > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          icon={<NotificationImportant />}
        >
          <Typography variant="body2">
            You have {pausedTasks.length} paused task(s): {pausedTasks.map(t => t.taskName).join(', ')}
          </Typography>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Non-blocking Alarm Notification Snackbar */}
      {onSetAlarmNotification && (
        <Snackbar
          open={!!alarmNotification}
          autoHideDuration={4000}
          onClose={() => onSetAlarmNotification(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => onSetAlarmNotification(null)}
            severity="info"
            variant="filled"
            sx={{
              width: '100%',
              '& .MuiAlert-message': {
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }
            }}
          >
            {alarmNotification}
          </Alert>
        </Snackbar>
      )}

      {/* Paused Task Notification Snackbar */}
      {onSetPausedTaskNotification && (
        <Snackbar
          open={!!pausedTaskNotification}
          autoHideDuration={6000}
          onClose={() => onSetPausedTaskNotification(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => onSetPausedTaskNotification(null)}
            severity="warning"
            variant="filled"
            sx={{
              width: '100%',
              '& .MuiAlert-message': {
                fontSize: '1rem',
                fontWeight: 'bold'
              }
            }}
          >
            {pausedTaskNotification}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default NotificationsSection;
