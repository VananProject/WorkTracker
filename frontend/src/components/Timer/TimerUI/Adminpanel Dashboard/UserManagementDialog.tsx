import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Chip,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Close,
  Group,
  PersonAdd,
  Settings,
  Email
} from '@mui/icons-material';
import Signup from '../../../Signup';
interface UserManagementDialogProps {
  open: boolean;
  onClose: () => void;
  userProductivity: any[];
}
const UserManagementDialog: React.FC<UserManagementDialogProps> = ({
  open,
  onClose,
  userProductivity
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // State to manage the visibility of the signup form
  const [showSignup, setShowSignup] = useState(false);
  const handleAddUser = () => {
    setShowSignup(true); // Show the signup form
  };
  const handleUserSettings = (userId: string) => {
    console.log('User settings for:', userId);
    // Implement user settings functionality
  };
  const handleSwitchToLogin = () => {
    setShowSignup(false); // Hide the signup form
  };
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Group sx={{ mr: 1, color: 'primary.main' }} />
          <Typography 
            variant="h6"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            User Management
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={handleAddUser}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Add New User
          </Button>
        </Box>
        {showSignup && (
          <Signup onSwitchToLogin={handleSwitchToLogin} />
        )}
        {isMobile ? (
          // Mobile Card Layout
          <Grid container spacing={2}>
            {userProductivity.map((user) => (
              <Grid item xs={12} key={user._id}>
                <Card 
                  elevation={2}
                  sx={{ 
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Badge
                        badgeContent={user.taskCount}
                        color="primary"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: user.role === 'admin' ? 'error.main' : 'primary.main',
                            width: 40,
                            height: 40
                          }}
                        >
                          {user.username.charAt(0).toUpperCase()}
                        </Avatar>
                      </Badge>
                      <Box sx={{ ml: 2, flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            {user.username}
                          </Typography>
                          <Chip
                            label={user.role}
                            size="small"
                            color={user.role === 'admin' ? 'error' : 'default'}
                            variant="outlined"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Email sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleUserSettings(user._id)}
                      >
                        <Settings />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${user.completedTasks}/${user.taskCount} tasks`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        label={`${user.totalTime}h worked`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                      <Chip
                        label={`${user.completionRate}% rate`}
                        size="small"
                        color={user.completionRate >= 80 ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          // Desktop List Layout
          <List sx={{ maxHeight: 500, overflow: 'auto' }}>
            {userProductivity.map((user) => (
              <ListItem
                key={user._id}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: theme.palette.action.hover
                  }
                }}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={user.taskCount}
                    color="primary"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: user.role === 'admin' ? 'error.main' : 'primary.main',
                        width: 44,
                        height: 44
                      }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {user.username}
                      </Typography>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'admin' ? 'error' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Email sx={{ fontSize: 14, mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={`${user.completedTasks}/${user.taskCount} completed`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                        <Chip
                          label={`${user.totalTime}h worked`}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                        <Chip
                          label={`${user.completionRate}% rate`}
                          size="small"
                          color={user.completionRate >= 80 ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  }
                />
                <Box sx={{ ml: 2 }}>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleUserSettings(user._id)}
                  >
                    <Settings />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};
export default UserManagementDialog;