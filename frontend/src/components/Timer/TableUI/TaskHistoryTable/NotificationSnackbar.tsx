import React from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  Typography
} from '@mui/material';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';

interface NotificationSnackbarProps {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  details?: string;
  onClose: () => void;
  autoHideDuration?: number;
}

const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  open,
  message,
  type,
  title,
  details,
  onClose,
  autoHideDuration = 6000
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle />;
      case 'error': return <Error />;
      case 'warning': return <Warning />;
      case 'info': return <Info />;
      default: return <Info />;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={type}
        variant="filled"
        icon={getIcon()}
        sx={{ minWidth: '300px' }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        <Typography variant="body2">{message}</Typography>
        {details && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {details}
            </Typography>
          </Box>
        )}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
