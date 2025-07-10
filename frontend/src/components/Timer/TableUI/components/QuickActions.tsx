import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button
} from '@mui/material';
import type { Task, UserGroup } from '../types/TaskHistoryTypes';


interface QuickActionsProps {
  data: Task[] | UserGroup[];
  isAdmin: boolean;
  expandedRows: Set<string>;
  expandedTasks: Set<string>;
  onToggleRowExpansion: (email: string) => void;
  setExpandedTasks: (tasks: Set<string>) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  data,
  isAdmin,
  expandedRows,
  expandedTasks,
  onToggleRowExpansion,
  setExpandedTasks
}) => {
  if (data.length === 0) return null;

  const handleExpandAllUsers = () => {
    if (isAdmin) {
      const allUserEmails = (data as UserGroup[]).map((user: UserGroup) => user.userEmail);
      allUserEmails.forEach((email: string) => {
        if (!expandedRows.has(email)) {
          onToggleRowExpansion(email);
        }
      });
    }
  };

  const handleCollapseAllUsers = () => {
    if (isAdmin) {
      expandedRows.clear();
      onToggleRowExpansion(''); // Trigger re-render
    }
  };

  const handleExpandAllTasks = () => {
    let allTaskIds: string[] = [];
    
    if (isAdmin) {
      allTaskIds = (data as UserGroup[]).flatMap((user: UserGroup) => 
        user.tasks ? user.tasks.map((task: Task) => task.taskId) : []
      ).filter(Boolean);
    } else {
      allTaskIds = (data as Task[]).map((task: Task) => task.taskId).filter(Boolean);
    }
    
    setExpandedTasks(new Set(allTaskIds));
  };

  const handleCollapseAllTasks = () => {
    setExpandedTasks(new Set());
  };

  const handleShowActiveTaskActivities = () => {
    let activeTasks: string[] = [];
    
    if (isAdmin) {
      activeTasks = (data as UserGroup[]).flatMap((user: UserGroup) => 
        user.tasks
          .filter((task: Task) => ['started', 'paused', 'resumed'].includes(task.status))
          .map((task: Task) => task.taskId)
      );
    } else {
      activeTasks = (data as Task[])
        .filter((task: Task) => ['started', 'paused', 'resumed'].includes(task.status))
        .map((task: Task) => task.taskId);
    }
    
    setExpandedTasks(new Set(activeTasks));
  };

  return (
    <Card variant="outlined" sx={{ mt: 2, bgcolor: isAdmin ? 'primary.light' : 'info.light' }}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ color: isAdmin ? 'primary.dark' : 'info.dark' }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {isAdmin ? (
            <>
              <Button
                size="small"
                variant="outlined"
                onClick={handleExpandAllUsers}
              >
                Expand All Users
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={handleCollapseAllUsers}
              >
                Collapse All Users
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={handleExpandAllTasks}
              >
                Expand All Tasks
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={handleCollapseAllTasks}
              >
                Collapse All Tasks
              </Button>
            </>
          ) : (
            <>
              <Button
                size="small"
                variant="outlined"
                onClick={handleExpandAllTasks}
              >
                Show All Activities
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={handleCollapseAllTasks}
              >
                Hide All Activities
              </Button>
                         <Button
                size="small"
                variant="outlined"
                onClick={handleShowActiveTaskActivities}
              >
                Show Active Task Activities
              </Button>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
