import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Badge,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add,
  Analytics,
  Person,
  Refresh,
  PlayArrow,
  Assignment
} from '@mui/icons-material';

interface UserQuickActionsProps {
  onCreateTask: () => void;
  onShowAnalytics: () => void;
  onShowProfile: () => void;
  onRefresh: () => void;
  activeTasks: number;
}

const ActionButton = ({ 
  icon, 
  title, 
  onClick, 
  color = 'primary', 
  variant = 'contained', 
  badge,
  fullWidth = true 
}: any) => {
  const theme = useTheme();
  
  return (
    <Badge badgeContent={badge} color="error" sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <Button
        variant={variant}
        color={color}
        startIcon={icon}
        onClick={onClick}
        fullWidth={fullWidth}
        sx={{
          py: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: { xs: '0.85rem', sm: '0.95rem' },
          boxShadow: variant === 'contained' ? theme.shadows[2] : 'none',
          minHeight: { xs: 48, sm: 56 },
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: variant === 'contained' ? theme.shadows[4] : theme.shadows[1]
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center',
          gap: 0.5
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 'inherit',
              lineHeight: 1.2
            }}
          >
            {title}
          </Typography>
        </Box>
      </Button>
    </Badge>
  );
};

const UserQuickActions: React.FC<UserQuickActionsProps> = ({
  onCreateTask,
  onShowAnalytics,
  onShowProfile,
  onRefresh,
  activeTasks
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.02),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Assignment color="primary" sx={{ mr: 1 }} />
        <Typography 
          variant="h6" 
          fontWeight="600"
          sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
        >
          Quick Actions
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={12}>
          <ActionButton
            icon={<Add />}
            title="Create New Task"
            onClick={onCreateTask}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={12}>
          <ActionButton
            icon={<Analytics />}
            title="View My Analytics"
            onClick={onShowAnalytics}
            color="secondary"
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={12}>
          <ActionButton
            icon={<Person />}
            title="My Profile"
            onClick={onShowProfile}
            color="info"
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={12}>
          <ActionButton
            icon={<PlayArrow />}
            title="Active Tasks"
            onClick={() => console.log('Show active tasks')}
            color="success"
            variant="outlined"
            badge={activeTasks > 0 ? activeTasks : undefined}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={12}>
          <ActionButton
            icon={<Refresh />}
            title="Refresh Data"
            onClick={onRefresh}
            color="warning"
            variant="outlined"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UserQuickActions;
