import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button
} from '@mui/material';
import type { Task, UserGroup } from '../types/TaskHistoryTypes';
// import { Task, UserGroup } from '../types/TaskHistoryTypes';

interface DebugPanelProps {
  processedTasks: Task[] | UserGroup[];
  filteredTasks: any[];
  expandedTasks: Set<string>;
  expandedRows: Set<string>;
  tablePage: number;
  tableRowsPerPage: number;
  tableFilters: any;
  currentUser?: any;
  isAdmin: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  processedTasks,
  filteredTasks,
  expandedTasks,
  expandedRows,
  tablePage,
  tableRowsPerPage,
  tableFilters,
  currentUser,
  isAdmin
}) => {
  // Only show in development mode
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return null;
  }

  return (
    <Card variant="outlined" sx={{ mt: 2, bgcolor: 'warning.light' }}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Debug Information (Development Only)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="caption">
            Processed Tasks: {processedTasks.length}
          </Typography>
          <Typography variant="caption">
            Filtered Tasks: {filteredTasks.length}
          </Typography>
          <Typography variant="caption">
            Expanded Tasks: {expandedTasks.size}
          </Typography>
          <Typography variant="caption">
            Expanded Rows: {expandedRows.size}
          </Typography>
          <Typography variant="caption">
            Current Page: {tablePage + 1}
          </Typography>
          <Typography variant="caption">
            Rows Per Page: {tableRowsPerPage}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              console.log('Debug Info:', {
                processedTasks,
                filteredTasks,
                expandedTasks: Array.from(expandedTasks),
                expandedRows: Array.from(expandedRows),
                tableFilters,
                currentUser,
                isAdmin
              });
            }}
          >
            Log Debug Info
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
