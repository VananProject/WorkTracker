import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  useTheme,
  alpha,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ArrowBack,
  PersonOutline,
  LogoutOutlined,
  Home,
  AdminPanelSettings
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/AuthContext';
// import { useAuth } from '../../hooks/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: 'primary.main',
          boxShadow: theme.shadows[2]
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={handleBackToDashboard}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              Admin Panel
            </Typography>
            <Breadcrumbs 
              sx={{ 
                color: alpha(theme.palette.common.white, 0.7),
                fontSize: '0.75rem'
              }}
            >
              <Link 
                color="inherit" 
                onClick={handleBackToDashboard}
                sx={{ 
                  cursor: 'pointer', 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Home sx={{ fontSize: 14, mr: 0.5 }} />
                Dashboard
              </Link>
              <Typography 
                color="inherit" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '0.75rem'
                }}
              >
                <AdminPanelSettings sx={{ fontSize: 14, mr: 0.5 }} />
                Admin
              </Typography>
            </Breadcrumbs>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
              <PersonOutline />
            </Avatar>
            <Typography 
              variant="body2"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {user?.username}
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutOutlined />}
              sx={{ 
                textTransform: 'none',
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              Logout
            </Button>
            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <LogoutOutlined />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box component="main">
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
