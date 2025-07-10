import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box
} from '@mui/material';
import type { Task, UserGroup } from '../types/TaskHistoryTypes';

interface SummaryStatisticsProps {
  data: Task[] | UserGroup[];
  isAdmin: boolean;
  formatTime: (seconds: number) => string;
}

const SummaryStatistics: React.FC<SummaryStatisticsProps> = ({
  data,
  isAdmin,
  formatTime
}) => {
  if (data.length === 0) return null;

  return (
    <Card variant="outlined" sx={{ mt: 2, bgcolor: 'grey.50' }}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Summary Statistics
        </Typography>
        <Grid container spacing={2}>
          {isAdmin ? (
            <>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {data.length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Users
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="success.main">
                    {(data as UserGroup[]).reduce((sum: number, user: UserGroup) => sum + user.totalTasks, 0)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Tasks
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="warning.main">
                    {(data as UserGroup[]).reduce((sum: number, user: UserGroup) => sum + user.activeTasks, 0)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Active Tasks
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="info.main" sx={{ fontFamily: 'monospace' }}>
                    {formatTime((data as UserGroup[]).reduce((sum: number, user: UserGroup) => sum + user.totalDuration, 0))}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Duration
                  </Typography>
                </Box>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {data.length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Tasks
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="success.main">
                    {(data as Task[]).filter((task: Task) => task.status === 'ended').length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Completed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="warning.main">
                    {(data as Task[]).filter((task: Task) => ['started', 'paused', 'resumed'].includes(task.status)).length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Active
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="info.main" sx={{ fontFamily: 'monospace' }}>
                    {formatTime((data as Task[]).reduce((sum: number, task: Task) => sum + (task.totalDuration || 0), 0))}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Duration
                  </Typography>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SummaryStatistics;
