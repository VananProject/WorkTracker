import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Chip,
  IconButton 
} from '@mui/material';
import { 
  Timer, 
  Dashboard, 
  AdminPanelSettings,
  Person 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';

const AppNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Vanan Timer
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Timer Button */}
          <Button
            color="inherit"
            startIcon={<Timer />}
            onClick={() => navigate('/timer')}
            variant={location.pathname === '/timer' ? 'outlined' : 'text'}
            sx={{ color: 'white' }}
          >
            Timer
          </Button>

          {/* User Dashboard Button - Only for regular users */}
          {user && user.role !== 'admin' && (
            <Button
              color="inherit"
              startIcon={<Dashboard />}
              onClick={() => navigate('/my-dashboard')}
              variant={location.pathname === '/my-dashboard' ? 'outlined' : 'text'}
              sx={{ color: 'white' }}
            >
              My Dashboard
            </Button>
          )}

          {/* User Info */}
          {user && (
            <Chip
              icon={user.role === 'admin' ? <AdminPanelSettings /> : <Person />}
              label={`${user.username} (${user.role})`}
              color={user.role === 'admin' ? 'secondary' : 'primary'}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
          )}

          {/* Logout Button */}
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{ color: 'white' }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppNavigation;
