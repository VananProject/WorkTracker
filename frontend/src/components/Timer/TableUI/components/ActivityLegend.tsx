import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import {
  PlayCircle,
  PauseCircle,
  StopCircle,
  Assignment
} from '@mui/icons-material';

const ActivityLegend: React.FC = () => {
  return (
    <Card variant="outlined" sx={{ mt: 2, bgcolor: 'grey.50' }}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Activity Legend
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PlayCircle color="success" fontSize="small" />
            <Typography variant="caption">Started</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PauseCircle color="warning" fontSize="small" />
            <Typography variant="caption">Paused</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PlayCircle color="info" fontSize="small" />
            <Typography variant="caption">Resumed</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StopCircle color="error" fontSize="small" />
            <Typography variant="caption">Ended</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Assignment color="secondary" fontSize="small" />
            <Typography variant="caption">Assigned</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityLegend;
