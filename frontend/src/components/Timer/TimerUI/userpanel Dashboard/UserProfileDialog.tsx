import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  useMediaQuery,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Close,
  Person,
  Edit,
  Save,
  Cancel,
  Email,
  Badge,
  CalendarToday,
  AccessTime,
  TrendingUp,
  Assignment
} from '@mui/icons-material';

interface UserProfileDialogProps {
  open: boolean;
  onClose: () => void;
  currentUser: any;
  userStats: any;
}

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  open,
  onClose,
  currentUser,
  userStats
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the user
    console.log('Saving user data:', editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({
      username: currentUser?.username || '',
      email: currentUser?.email || '',
      bio: currentUser?.bio || ''
    });
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
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
          <Person sx={{ mr: 1, color: 'primary.main' }} />
          <Typography 
            variant="h6"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            My Profile
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  textAlign: { xs: 'center', sm:'left' },
                  gap: 3
                }}>
                  <Avatar 
                    sx={{ 
                      width: { xs: 80, sm: 100 }, 
                      height: { xs: 80, sm: 100 },
                      bgcolor: 'primary.main',
                      fontSize: { xs: '2rem', sm: '2.5rem' }
                    }}
                  >
                    {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  
                  <Box sx={{ flexGrow: 1, width: '100%' }}>
                    {isEditing ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          label="Username"
                          value={editedUser.username}
                          onChange={(e) => handleChange('username', e.target.value)}
                          fullWidth
                          size="small"
                        />
                        <TextField
                          label="Email"
                          value={editedUser.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          fullWidth
                          size="small"
                          type="email"
                        />
                        <TextField
                          label="Bio"
                          value={editedUser.bio}
                          onChange={(e) => handleChange('bio', e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                          size="small"
                          placeholder="Tell us about yourself..."
                        />
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSave}
                            size="small"
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={handleCancel}
                            size="small"
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="h5" fontWeight="bold">
                            {currentUser?.username || 'User'}
                          </Typography>
                          <Chip
                            label={currentUser?.role || 'user'}
                            size="small"
                            color={currentUser?.role === 'admin' ? 'error' : 'primary'}
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          {currentUser?.email || 'No email provided'}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {editedUser.bio || 'No bio available. Click edit to add one!'}
                        </Typography>
                        
                        <Button
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={handleEdit}
                          size="small"
                        >
                          Edit Profile
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Statistics */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                  Performance Overview
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Assignment color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Tasks"
                      secondary={`${userStats?.totalTasks || 0} tasks completed`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Hours"
                      secondary={`${userStats?.totalHours || 0} hours worked`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Success Rate"
                      secondary={`${userStats?.completionRate || 0}% completion rate`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Member Since"
                      secondary={new Date(currentUser?.createdAt || Date.now()).toLocaleDateString()}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Activity Summary */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                  Activity Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {userStats?.activeTasks || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Tasks
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {userStats?.completedTasks || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {userStats?.todayTasks || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Today's Tasks
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                      <Typography variant="h4" fontWeight="bold" color="info.main">
                        {userStats?.thisWeekTasks || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This Week
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Information */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                  Account Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email Address
                        </Typography>
                        <Typography variant="body1">
                          {currentUser?.email || 'Not provided'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Badge sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Role
                        </Typography>
                        <Typography variant="body1">
                          {currentUser?.role || 'User'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarToday sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Last Login
                        </Typography>
                        <Typography variant="body1">
                          {new Date(currentUser?.lastLogin || Date.now()).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Account Status
                        </Typography>
                        <Chip
                          label="Active"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;


