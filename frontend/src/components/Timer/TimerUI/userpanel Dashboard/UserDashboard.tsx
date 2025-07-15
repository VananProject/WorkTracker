import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  IconButton, 
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/AuthContext';
import UserPanel from '../Userpanel';
// import { useAuth } from '../../hooks/AuthContext';
// import UserPanel from './TimerUI/Userpanel';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if user is admin or not logged in
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role === 'admin') {
      navigate('/timer'); // Redirect admins back to main timer
      return;
    }

    fetchUserTasks();
  }, [user, navigate]);

  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      // Fetch user's tasks - adjust the endpoint according to your API
      const response = await fetch(`http://bp.backend.vananpicture.com/api/tasks/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user tasks');
      }

      const tasks = await response.json();
      setUserTasks(tasks);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    // Navigate back to main timer for task creation
    navigate('/timer');
  };

  const handleBackToTimer = () => {
    navigate('/timer');
  };

  // Show loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={60} />
          <Typography variant="body1" color="text.secondary">
            Loading your dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Don't render if user is not valid
  if (!user || user.role === 'admin') {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header with back button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2
      }}>
        <IconButton 
          onClick={handleBackToTimer}
          sx={{ 
            mr: 2,
            bgcolor: 'primary.light',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'white'
            }
          }}
          size="large"
        >
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            My Personal Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user.username}! Here's your productivity overview.
          </Typography>
        </Box>
      </Box>

      {/* User Panel */}
      <UserPanel
        userTasks={userTasks}
        currentUser={user}
        onCreateTask={handleCreateTask}
        onRefresh={fetchUserTasks}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          variant="filled"
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserDashboard;
