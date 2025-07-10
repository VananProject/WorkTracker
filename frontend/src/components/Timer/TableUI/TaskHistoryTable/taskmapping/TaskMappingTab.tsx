import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  GetApp as ExportIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TaskMappingService, type TaskLevelStats, type TaskMapping } from './taskMapping';
// import { TaskMapping, TaskMappingService, TaskLevelStats } from '../../../../../config/taskMapping';

interface TaskMappingTabProps {
  currentUser: any;
  allTasks: any[];
  onExportReport: (userEmail: string) => void;
}

const LEVEL_COLORS = {
  L1: '#FF6B6B',
  L2: '#4ECDC4',
  L3: '#45B7D1',
  L4: '#96CEB4'
};

const TaskMappingTab: React.FC<TaskMappingTabProps> = ({
  currentUser,
  allTasks,
  onExportReport
}) => {
  const [mappings, setMappings] = useState<TaskMapping[]>([]);
  const [filteredMappings, setFilteredMappings] = useState<TaskMapping[]>([]);
  const [levelFilter, setLevelFilter] = useState<'L1' | 'L2' | 'L3' | 'L4' | ''>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMapping, setEditingMapping] = useState<TaskMapping | null>(null);
  const [newMapping, setNewMapping] = useState({
    taskName: '',
    level: 'L1' as 'L1' | 'L2' | 'L3' | 'L4',
    category: '',
    description: ''
  });
  const [stats, setStats] = useState<TaskLevelStats>({ L1: 0, L2: 0, L3: 0, L4: 0, total: 0 });

  // Get unique task names from user's assigned tasks
  const userTaskNames = useMemo(() => {
    if (!currentUser?.email || !allTasks) return [];
    
    const userTasks = allTasks.filter(task => 
      task.assignedByEmail === currentUser.email ||
      task.createdBy === currentUser.email ||
      task.userEmail === currentUser.email
    );
    
    const uniqueNames = [...new Set(userTasks.map(task => task.taskName))];
    return uniqueNames.sort();
  }, [allTasks, currentUser]);

  // Load mappings on component mount
  useEffect(() => {
    if (currentUser?.email) {
      loadMappings();
    }
  }, [currentUser]);

  // Filter mappings when filters change
  useEffect(() => {
    const filtered = TaskMappingService.filterMappings(mappings, {
      level: levelFilter || undefined,
      search: searchFilter,
      createdBy: currentUser?.email
    });
    setFilteredMappings(filtered);
  }, [mappings, levelFilter, searchFilter, currentUser]);

  const loadMappings = () => {
    if (!currentUser?.email) return;
    
    const userMappings = TaskMappingService.getMappingsByUser(currentUser.email);
    const levelStats = TaskMappingService.getLevelStats(currentUser.email);
    
    setMappings(userMappings);
    setStats(levelStats);
  };

  const handleSaveMapping = () => {
    if (!newMapping.taskName || !currentUser?.email) return;
    
    try {
      if (editingMapping) {
        TaskMappingService.updateMapping(editingMapping.id, {
          ...newMapping,
          createdBy: currentUser.email
        });
      } else {
        TaskMappingService.saveMapping({
          ...newMapping,
          createdBy: currentUser.email
        });
      }
      
      loadMappings();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving mapping:', error);
    }
  };

  const handleDeleteMapping = (id: string) => {
    if (window.confirm('Are you sure you want to delete this mapping?')) {
      TaskMappingService.deleteMapping(id);
      loadMappings();
    }
  };

  const handleEditMapping = (mapping: TaskMapping) => {
    setEditingMapping(mapping);
    setNewMapping({
      taskName: mapping.taskName,
      level: mapping.level,
      category: mapping.category || '',
      description: mapping.description || ''
    });
    setShowAddDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingMapping(null);
    setNewMapping({
      taskName: '',
      level: 'L1',
      category: '',
      description: ''
    });
  };

  const handleExportReport = () => {
    if (currentUser?.email) {
      onExportReport(currentUser.email);
    }
  };

  // Prepare chart data
  const chartData = [
    { name: 'L1', value: stats.L1, color: LEVEL_COLORS.L1 },
    { name: 'L2', value: stats.L2, color: LEVEL_COLORS.L2 },
    { name: 'L3', value: stats.L3, color: LEVEL_COLORS.L3 },
    { name: 'L4', value: stats.L4, color: LEVEL_COLORS.L4 }
  ].filter(item => item.value > 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Task Level Mapping
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddDialog(true)}
            color="primary"
          >
            Add Mapping
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportReport}
            color="secondary"
          >
            Export Report
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Level Distribution
              </Typography>
              {stats.total > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary" align="center">
                  No mappings yet
                </Typography>
              )}
              
              <Box sx={{ mt: 2 }}>
                {Object.entries(stats).map(([level, count]) => (
                  level !== 'total' && (
                    <Box key={level} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        label={level}
                        size="small"
                        sx={{ 
                          backgroundColor: LEVEL_COLORS[level as keyof typeof LEVEL_COLORS],
                          color: 'white'
                        }}
                      />
                      <Typography variant="body2">{count}</Typography>
                    </Box>
                  )
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2">Total:</Typography>
                  <Typography variant="subtitle2">{stats.total}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Filters and Table */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={levelFilter}
                    label="Level"
                    onChange={(e) => setLevelFilter(e.target.value as any)}
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value="L1">L1</MenuItem>
                    <MenuItem value="L2">L2</MenuItem>
                    <MenuItem value="L3">L3</MenuItem>
                    <MenuItem value="L4">L4</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  size="small"
                  placeholder="Search task names..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{ flexGrow: 1 }}
                />
              </Box>

              {/* Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Task Name</TableCell>
                      <TableCell>Level</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMappings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="textSecondary">
                            No task mappings found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMappings.map((mapping) => (
                        <TableRow key={mapping.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {mapping.taskName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={mapping.level}
                              size="small"
                              sx={{
                                backgroundColor: LEVEL_COLORS[mapping.level],
                                color: 'white'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {mapping.category || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {mapping.description || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditMapping(mapping)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteMapping(mapping.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMapping ? 'Edit Task Mapping' : 'Add Task Mapping'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={userTaskNames}
              value={newMapping.taskName}
              onChange={(_, value) => setNewMapping(prev => ({ ...prev, taskName: value || '' }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Task Name"
                  required
                  helperText="Select from your assigned tasks or type a new one"
                />
              )}
              freeSolo
            />
            
            <FormControl required>
              <InputLabel>Level</InputLabel>
              <Select
                value={newMapping.level}
                label="Level"
                onChange={(e) => setNewMapping(prev => ({ 
                  ...prev, 
                  level: e.target.value as 'L1' | 'L2' | 'L3' | 'L4' 
                }))}
              >
                <MenuItem value="L1">L1 - Basic</MenuItem>
                <MenuItem value="L2">L2 - Intermediate</MenuItem>
                <MenuItem value="L3">L3 - Advanced</MenuItem>
                <MenuItem value="L4">L4 - Expert</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Category"
              value={newMapping.category}
              onChange={(e) => setNewMapping(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Development, Testing, Documentation"
            />
            
            <TextField
              label="Description"
              value={newMapping.description}
              onChange={(e) => setNewMapping(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              placeholder="Optional description for this task mapping"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveMapping} 
            variant="contained"
            disabled={!newMapping.taskName}
          >
            {editingMapping ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskMappingTab;
