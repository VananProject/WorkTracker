import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

interface SimpleAlarmDialogProps {
  open: boolean;
  dispatch: (action: any) => void;
  onSetAlarm: (minutes: number) => void;
  onTestAlarmSound: () => void;
}

const SimpleAlarmDialog: React.FC<SimpleAlarmDialogProps> = ({ 
  open, 
  dispatch, 
  onSetAlarm, 
  onTestAlarmSound 
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const alarmOptions = [1, 3, 5, 10];

  const handleAlarmSelect = (minutes: number) => {
    setSelectedMinutes(minutes);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedMinutes) {
      onSetAlarm(selectedMinutes);
      dispatch({ type: 'HIDE_ALARM_DIALOG' });
      setShowConfirmation(false);
      setSelectedMinutes(null);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedMinutes(null);
  };

  const handleClose = () => {
    dispatch({ type: 'HIDE_ALARM_DIALOG' });
    setShowConfirmation(false);
    setSelectedMinutes(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogContent>
        {!showConfirmation ? (
          <>
            <Typography gutterBottom sx={{ mb: 3 }}>
              Choose alarm interval:
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 2,
              mb: 3
            }}>
              {alarmOptions.map((minutes) => (
                <Button
                  key={minutes}
                  variant="outlined"
                  size="large"
                  onClick={() => handleAlarmSelect(minutes)}
                  sx={{ 
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {minutes} min
                </Button>
              ))}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mb: 2
            }}>
              <Button
                variant="outlined"
                size="small"
                onClick={onTestAlarmSound}
              >
                🔊 Test Sound
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Confirm Alarm Setting
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Set alarm to ring every <strong>{selectedMinutes} minutes</strong>?
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        {!showConfirmation ? (
          <>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                onSetAlarm(0);
                handleClose();
              }}
              color="error"
            >
              Clear Alarm
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleCancel}>
              Back
            </Button>
            <Button 
              onClick={handleConfirm} 
              variant="contained"
              color="primary"
            >
              Confirm
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SimpleAlarmDialog;
