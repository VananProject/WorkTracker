import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Close,
  Analytics,
  AccessTime,
  Email
} from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts';

interface AnalyticsDialogProps {
  open: boolean;
  onClose: () => void;
  pieChartData: any[];
  barChartData: any[];
  userProductivity: any[];
}

const AnalyticsDialog: React.FC<AnalyticsDialogProps> = ({
  open,
  onClose,
  pieChartData,
  barChartData,
  userProductivity
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
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
          <Analytics sx={{ mr: 1, color: 'primary.main' }} />
          <Typography 
            variant="h6"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            Task Analytics Dashboard
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={3}>
          {/* Task Status Distribution */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: { xs: 2, sm: 2.5 }, 
                height: { xs: 280, sm: 320 },
                borderRadius: 2
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Task Status Distribution
              </Typography>
              <Box sx={{ height: { xs: 220, sm: 260 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 30 : 40}
                      outerRadius={isMobile ? 60 : 80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Task Types */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: { xs: 2, sm: 2.5 }, 
                height: { xs: 280, sm: 320 },
                borderRadius: 2
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Task Types
              </Typography>
              <Box sx={{ height: { xs: 220, sm: 260 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="type" 
                      fontSize={isMobile ? 10 : 12}
                    />
                    <YAxis fontSize={isMobile ? 10 : 12} />
                    <RechartsTooltip />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* User Productivity */}
          <Grid item xs={12}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                User Productivity Overview
              </Typography>
              <TableContainer sx={{ maxHeight: { xs: 300, sm: 400 } }}>
                <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        User
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          display: { xs: 'none', sm: 'table-cell' }
                        }}
                      >
                        Total Tasks
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                      >
                        Completed
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          display: { xs: 'none', md: 'table-cell' }
                        }}
                      >
                        Hours
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                      >
                        Rate
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userProductivity.map((user) => (
                      <TableRow key={user._id} hover>
                        <TableCell sx={{ py: { xs: 1, sm: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                width: { xs: 28, sm: 32 }, 
                                height: { xs: 28, sm: 32 }, 
                                mr: 1, 
                                bgcolor: 'primary.main',
                                fontSize: { xs: '0.8rem', sm: '1rem' }
                              }}
                            >
                              {user.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography 
                                variant="body2" 
                                fontWeight="medium"
                                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                              >
                                {user.username}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ 
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  display: { xs: 'none', sm: 'block' }
                                }}
                              >
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell 
                          align="center"
                          sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                        >
                          <Chip 
                            label={user.taskCount} 
                            size="small" 
                            color="primary" 
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={user.completedTasks} 
                            size="small" 
                            color="success" 
                          />
                        </TableCell>
                        <TableCell 
                          align="center"
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                            <Typography variant="body2">
                              {user.totalTime}h
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${user.completionRate}%`} 
                            size="small" 
                            color={
                              user.completionRate >= 80 ? 'success' : 
                              user.completionRate >= 50 ? 'warning' : 'error'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                            </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsDialog;
