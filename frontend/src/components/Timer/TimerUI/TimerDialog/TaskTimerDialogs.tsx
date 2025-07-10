
// import React, { useState } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Alert,
//   Typography,
//   Box,
//   Grid,
//   Autocomplete,
//   InputAdornment,
//   CircularProgress,
//   Avatar,
//   Chip
// } from '@mui/material';
// import { 
//   Assignment, 
//   Business, 
   
//   Schedule, 
//   CalendarToday 
// } from '@mui/icons-material';
// import { DatePicker, TimePicker } from '@mui/x-date-pickers';

// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { Person } from '@mui/icons-material';
// import dayjs, { Dayjs } from 'dayjs';

// interface AssignTaskData {
//   taskName: string;
//   type: 'task' | 'meeting';
//   assignedToEmail: string;
//   description: string;
//   estimatedTime: string;
//   dueDate: Date | null;
//   estimatedHours?: string;
//   estimatedMinutes?: string;
// }

// interface User {
//   _id: string;
//   username: string;
//   email: string;
//   role: string;
// }

// interface TaskTimerDialogsProps {
//   state: any;
//   dispatch: (action: any) => void;
//   showAssignDialog: boolean;
//   users: User[];
//   loadingUsers: boolean;
//   userError: string | null;
//   assignTaskData: AssignTaskData;
//   onCreateTask: () => void;
//   onHideAssignDialog: () => void;
//   onAssignTask: () => void;
//   onAssignTaskDataChange: (field: string, value: string | Date | null) => void;
//   onLoadUsers: () => void;
//   onSetAlarm: (minutes: number) => void;
//   onTestAlarmSound: () => void;
// }

// const TaskTimerDialogs: React.FC<TaskTimerDialogsProps> = ({
//   state,
//   dispatch,
//   showAssignDialog,
//   users,
//   loadingUsers,
//   userError,
//   assignTaskData,
//   onCreateTask,
//   onHideAssignDialog,
//   onAssignTask,
//   onAssignTaskDataChange,
//   onLoadUsers,
//   onSetAlarm,
//   onTestAlarmSound
// }) => {
//   return (
//     <>
//       {/* Task Name Input Dialog */}
//       <Dialog
//         open={state.showTaskNameInput}
//         onClose={() => dispatch({ type: 'HIDE_TASK_INPUT' })}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle>
//           Enter {state.taskType === 'meeting' ? 'Meeting' : 'Task'} Name
//         </DialogTitle>
//         <DialogContent>
//           <TextField
//             autoFocus
//             margin="dense"
//             label={`${state.taskType === 'meeting' ? 'Meeting' : 'Task'} Name`}
//             fullWidth
//             variant="outlined"
//             value={state.taskName}
//             onChange={(e) => dispatch({ type: 'SET_TASK_NAME', payload: e.target.value })}
//             placeholder={`Enter a descriptive name for this ${state.taskType}...`}
//             sx={{ mt: 2 }}
//             onKeyPress={(e) => {
//               if (e.key === 'Enter') {
//                 onCreateTask();
//               }
//             }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => dispatch({ type: 'HIDE_TASK_INPUT' })}>
//             Cancel
//           </Button>
//           <Button onClick={onCreateTask} variant="contained">
//             Start {state.taskType === 'meeting' ? 'Meeting' : 'Task'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Admin: Assign Task Dialog */}
//       <AssignTaskDialog
//         open={showAssignDialog}
//         users={users}
//         loadingUsers={loadingUsers}
//         userError={userError}
//         assignTaskData={assignTaskData}
//         onHide={onHideAssignDialog}
//         onAssign={onAssignTask}
//         onDataChange={onAssignTaskDataChange}
//         onLoadUsers={onLoadUsers}
//       />

//       {/* Simple Alarm Dialog */}
//       <SimpleAlarmDialog
//         open={state.showAlarmDialog}
//         dispatch={dispatch}
//         onSetAlarm={onSetAlarm}
//         onTestAlarmSound={onTestAlarmSound}
//       />
//     </>
//   );
// };

// const AssignTaskDialog: React.FC<{
//   open: boolean;
//   users: User[];
//   loadingUsers: boolean;
//   userError: string | null;
//   assignTaskData: AssignTaskData;
//   onHide: () => void;
//   onAssign: () => void;
//   onDataChange: (field: string, value: string | Date | null) => void;
//   onLoadUsers: () => void;
// }> = ({
//   open,
//   users,
//   loadingUsers,
//   userError,
//   assignTaskData,
//   onHide,
//   onAssign,
//   onDataChange,
//   onLoadUsers
// }) => (
//  <LocalizationProvider dateAdapter={AdapterDayjs}>
//   <Dialog 
//     open={open} 
//     onClose={onHide} 
//     maxWidth="lg" 
//     fullWidth
//     PaperProps={{
//       sx: {
//         borderRadius: 3,
//         boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
//         minHeight: { xs: '90vh', sm: '70vh' },
//         maxHeight: '95vh',
//         overflow: 'hidden'
//       }
//     }}
//   >
//     {/* Enhanced Header */}
//     <DialogTitle sx={{ 
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       color: 'white',
//       py: 3,
//       px: 3
//     }}>
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//         <Avatar sx={{ 
//           bgcolor: 'rgba(255,255,255,0.2)', 
//           width: 48, 
//           height: 48 
//         }}>
//           <Assignment sx={{ fontSize: 24 }} />
//         </Avatar>
//         <Box>
//           <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
//             Assign Task to User
//           </Typography>
//           <Typography variant="body2" sx={{ opacity: 0.9 }}>
//             Create and assign a new task with details and deadline
//           </Typography>
//         </Box>
//       </Box>
//     </DialogTitle>

//     {/* Scrollable Content */}
//     <DialogContent sx={{ 
//       p: 0,
//       overflow: 'auto',
//       maxHeight: 'calc(95vh - 200px)'
//     }}>
//       <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
//         <Grid container spacing={{ xs: 2, sm: 3 }}>
//           {/* Task Name - Full Width */}
//           <Grid item xs={12}>
//             <Box sx={{ 
//               p: 2, 
//               border: '1px solid', 
//               borderColor: 'divider',
//               borderRadius: 2,
//               bgcolor: 'grey.50'
//             }}>
//               <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
//                 Task Information
//               </Typography>
//               <TextField
//                 label="Task Name"
//                 fullWidth
//                 variant="outlined"
//                 value={assignTaskData.taskName || ''}
//                 onChange={(e) => onDataChange('taskName', e.target.value)}
//                 placeholder="Enter a descriptive task name..."
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 2,
//                     bgcolor: 'white'
//                   }
//                 }}
//               />
//             </Box>
//           </Grid>

//           {/* Task Type and User Assignment */}
//           <Grid item xs={12}>
//             <Box sx={{ 
//               p: 2, 
//               border: '1px solid', 
//               borderColor: 'divider',
//               borderRadius: 2,
//               bgcolor: 'grey.50'
//             }}>
//               <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
//                 Assignment Details
//               </Typography>
              
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <FormControl fullWidth>
//                     <InputLabel>Task Type</InputLabel>
//                     <Select
//                       value={assignTaskData.type || 'task'}
//                       label="Task Type"
//                       onChange={(e) => onDataChange('type', e.target.value as string)}
//                       sx={{ 
//                         borderRadius: 2,
//                         bgcolor: 'white'
//                       }}
//                     >
//                       <MenuItem value="task">
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                           <Assignment fontSize="small" />
//                           Task
//                         </Box>
//                       </MenuItem>
//                       <MenuItem value="meeting">
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                           <Business fontSize="small" />
//                           Meeting
//                         </Box>
//                       </MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Grid>

//                 <Grid item xs={12} sm={6}>
//                   <FormControl fullWidth>
//                     <Autocomplete
//                       options={users}
//                       getOptionLabel={(option) => `${option.username} (${option.email})`}
//                       value={users.find(user => user.email === assignTaskData.assignedToEmail) || null}
//                       onChange={(event, newValue) => {
//                         onDataChange('assignedToEmail', newValue ? newValue.email : '');
//                       }}
//                       loading={loadingUsers}
//                       disabled={loadingUsers}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           label="Assign to User"
//                           placeholder="Search and select user..."
//                           InputProps={{
//                             ...params.InputProps,
//                             startAdornment: (
//                               <InputAdornment position="start">
//                                 <Person fontSize="small" color="action" />
//                               </InputAdornment>
//                             ),
//                             endAdornment: (
//                               <>
//                                 {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
//                                 {params.InputProps.endAdornment}
//                               </>
//                             ),
//                           }}
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 2,
//                               bgcolor: 'white'
//                             }
//                           }}
//                         />
//                       )}
//                       renderOption={(props, option) => (
//                         <Box component="li" {...props} sx={{ 
//                           display: 'flex', 
//                           alignItems: 'center', 
//                           gap: 2, 
//                           py: 1.5,
//                           px: 2,
//                           '&:hover': {
//                             bgcolor: 'primary.50'
//                           }
//                         }}>
//                           <Avatar
//                             sx={{
//                               width: 36,
//                               height: 36,
//                               bgcolor: option.role === 'admin' ? 'error.main' : 'primary.main',
//                               fontSize: '0.875rem'
//                             }}
//                           >
//                             {option.username.charAt(0).toUpperCase()}
//                           </Avatar>
//                           <Box sx={{ flex: 1 }}>
//                             <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                               {option.username}
//                             </Typography>
//                             <Typography variant="caption" color="text.secondary">
//                               {option.email}
//                             </Typography>
//                           </Box>
//                           <Chip
//                             label={option.role}
//                             size="small"
//                             color={option.role === 'admin' ? 'error' : 'primary'}
//                             variant="outlined"
//                             sx={{ borderRadius: 1 }}
//                           />
//                         </Box>
//                       )}
//                       noOptionsText={
//                         loadingUsers ? "Loading users..." :
//                         userError ? userError :
//                         "No users found"
//                       }
//                       filterOptions={(options, { inputValue }) => {
//                         return options.filter(option =>
//                           option.username.toLowerCase().includes(inputValue.toLowerCase()) ||
//                           option.email.toLowerCase().includes(inputValue.toLowerCase()) ||
//                           option.role.toLowerCase().includes(inputValue.toLowerCase())
//                         );
//                       }}
//                       sx={{
//                         '& .MuiAutocomplete-paper': {
//                           borderRadius: 2,
//                           boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
//                         }
//                       }}
//                     />
//                   </FormControl>
//                 </Grid>
//               </Grid>
//             </Box>
//           </Grid>

//           {/* Error Alert */}
//           {userError && (
//             <Grid item xs={12}>
//               <Alert 
//                 severity="error" 
//                 sx={{ borderRadius: 2 }}
//                 action={
//                   <Button size="small" onClick={onLoadUsers} color="inherit">
//                     Retry
//                   </Button>
//                 }
//               >
//                 {userError}
//               </Alert>
//             </Grid>
//           )}

//           {/* Time and Date Section */}
//           <Grid item xs={12}>
//             <Box sx={{ 
//               p: 2, 
//               border: '1px solid', 
//               borderColor: 'divider',
//               borderRadius: 2,
//               bgcolor: 'grey.50'
//             }}>
//               <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
//                 Time & Schedule
//               </Typography>
              
//               <Grid container spacing={2}>
//                 {/* Estimated Time */}
//                 <Grid item xs={12} md={6}>
//                   <Box sx={{ 
//                     p: 2, 
//                     border: '1px solid', 
//                     borderColor: 'grey.300',
//                     borderRadius: 2,
//                     bgcolor: 'white'
//                   }}>
//                     <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
//                       <Schedule fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
//                       Estimated Duration
//                     </Typography>
                    
//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
//                       <FormControl sx={{ minWidth: { xs: '100%', sm: 100 } }}>
//                         <InputLabel size="small">Hours</InputLabel>
//                         <Select
//                           size="small"
//                           value={assignTaskData.estimatedHours || '0'}
//                           label="Hours"
//                           onChange={(e) => {
//                             const hours = e.target.value;
//                             const minutes = assignTaskData.estimatedMinutes || '0';
//                             const totalTime = hours === '0' && minutes === '0' ? '' :
//                                              hours === '0' ? `${minutes} minutes` :
//                                              minutes === '0' ? `${hours} hour${hours === '1' ? '' : 's'}` :
//                                              `${hours} hour${hours === '1' ? '' : 's'} ${minutes} minutes`;
//                             onDataChange('estimatedTime', totalTime);
//                             onDataChange('estimatedHours', hours);
//                           }}
//                           sx={{ borderRadius: 1 }}
//                         >
//                           {Array.from({ length: 25 }, (_, i) => (
//                             <MenuItem key={i} value={i.toString()}>
//                               {i} {i === 1 ? 'hour' : 'hours'}
//                             </MenuItem>
//                           ))}
//                         </Select>
//                       </FormControl>

//                       <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
//                         and
//                       </Typography>

//                       <FormControl sx={{ minWidth: { xs: '100%', sm: 100 } }}>
//                         <InputLabel size="small">Minutes</InputLabel>
//                         <Select
//                           size="small"
//                           value={assignTaskData.estimatedMinutes || '0'}
//                           label="Minutes"
//                           onChange={(e) => {
//                             const minutes = e.target.value;
//                             const hours = assignTaskData.estimatedHours || '0';
//                             const totalTime = hours === '0' && minutes === '0' ? '' :
//                                              hours === '0' ? `${minutes} minutes` :
//                                              minutes === '0' ? `${hours} hour${hours === '1' ? '' : 's'}` :
//                                              `${hours} hour${hours === '1' ? '' : 's'} ${minutes} minutes`;
//                             onDataChange('estimatedTime', totalTime);
//                             onDataChange('estimatedMinutes', minutes);
//                           }}
//                           sx={{ borderRadius: 1 }}
//                         >
//                           {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((minute) => (
//                             <MenuItem key={minute} value={minute.toString()}>
//                               {minute} minutes
//                             </MenuItem>
//                           ))}
//                         </Select>
//                       </FormControl>
//                     </Box>

//                     {assignTaskData.estimatedTime && (
//                       <Box sx={{ 
//                         mt: 2, 
//                         p: 1.5, 
//                         bgcolor: 'primary.50', 
//                         borderRadius: 1,
//                         border: '1px solid',
//                         borderColor: 'primary.200'
//                       }}>
//                         <Typography variant="body2" color="primary.dark" sx={{ fontWeight: 500 }}>
//                           Total Estimated Time: {assignTaskData.estimatedTime}
//                         </Typography>
//                       </Box>
//                     )}
//                   </Box>
//                 </Grid>

//                 {/* Due Date */}
//                 <Grid item xs={12} md={6}>
//                   <Box sx={{ 
//                     p: 2, 
//                     border: '1px solid', 
//                     borderColor: 'grey.300',
//                     borderRadius: 2,
//                     bgcolor: 'white'
//                   }}>
//                     <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
//                       <CalendarToday fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
//                       Due Date & Time
//                     </Typography>
                    
//                     <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
//                       <DatePicker
//                         label="Due Date"
//                         value={assignTaskData.dueDate ? dayjs(assignTaskData.dueDate) : null}
//                         onChange={(newValue: Dayjs | null) => {
//                           const currentTime = assignTaskData.dueDate ? dayjs(assignTaskData.dueDate) : dayjs().hour(17).minute(0);
//                           const newDateTime = newValue ? 
//                             newValue.hour(currentTime.hour()).minute(currentTime.minute()) : 
//                             null;
//                           onDataChange('dueDate', newDateTime?.toDate() || null);
//                         }}
//                         minDate={dayjs()}
//                         slotProps={{
//                           textField: {
//                             fullWidth: true,
//                             size: 'small',
//                             variant: 'outlined',
//                             sx: {
//                               '& .MuiOutlinedInput-root': {
//                                 borderRadius: 1
//                               }
//                             }
//                           },
//                           popper: {
//                             sx: { zIndex: 1400 }
//                           }
//                         }}
//                       />
//                       <TimePicker
//                         label="Due Time"
//                         value={assignTaskData.dueDate ? dayjs(assignTaskData.dueDate) : null}
//                         onChange={(newValue: Dayjs | null) => {
//                           const currentDate = assignTaskData.dueDate ? dayjs(assignTaskData.dueDate) : dayjs();
//                                                     const newDateTime = newValue ? 
//                             currentDate.hour(newValue.hour()).minute(newValue.minute()) : 
//                             null;
//                           onDataChange('dueDate', newDateTime?.toDate() || null);
//                         }}
//                         slotProps={{
//                           textField: {
//                             fullWidth: true,
//                             size: 'small',
//                             variant: 'outlined',
//                             sx: {
//                               '& .MuiOutlinedInput-root': {
//                                 borderRadius: 1
//                               }
//                             }
//                           },
//                           popper: {
//                             sx: { zIndex: 1400 }
//                           }
//                         }}
//                       />
//                     </Box>

//                     {assignTaskData.dueDate && (
//                       <Box sx={{ 
//                         mt: 2, 
//                         p: 1.5, 
//                         bgcolor: 'success.50', 
//                         borderRadius: 1,
//                         border: '1px solid',
//                         borderColor: 'success.200'
//                       }}>
//                         <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
//                           Due: {dayjs(assignTaskData.dueDate).format('MMM DD, YYYY at hh:mm A')}
//                         </Typography>
//                       </Box>
//                     )}
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Box>
//           </Grid>

//           {/* Description */}
//           <Grid item xs={12}>
//             <Box sx={{ 
//               p: 2, 
//               border: '1px solid', 
//               borderColor: 'divider',
//               borderRadius: 2,
//               bgcolor: 'grey.50'
//             }}>
//               <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
//                 Additional Details
//               </Typography>
//               <TextField
//                 label="Description (Optional)"
//                 fullWidth
//                 variant="outlined"
//                 multiline
//                 rows={4}
//                 value={assignTaskData.description || ''}
//                 onChange={(e) => onDataChange('description', e.target.value)}
//                 placeholder="Add any additional details, requirements, or notes for this task..."
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 2,
//                     bgcolor: 'white'
//                   }
//                 }}
//               />
//             </Box>
//           </Grid>

//           {/* Task Summary Preview */}
//           {(assignTaskData.taskName || assignTaskData.assignedToEmail) && (
//             <Grid item xs={12}>
//               <Box sx={{ 
//                 p: 3, 
//                 border: '2px solid', 
//                 borderColor: 'primary.200',
//                 borderRadius: 2,
//                 bgcolor: 'primary.50'
//               }}>
//                 <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
//                   Task Summary
//                 </Typography>
                
//                 <Grid container spacing={2}>
//                   {assignTaskData.taskName && (
//                     <Grid item xs={12} sm={6}>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                         <Assignment fontSize="small" color="primary" />
//                         <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                           Task: {assignTaskData.taskName}
//                         </Typography>
//                       </Box>
//                     </Grid>
//                   )}
                  
//                   {assignTaskData.assignedToEmail && (
//                     <Grid item xs={12} sm={6}>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                         <Person fontSize="small" color="primary" />
//                         <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                           Assigned to: {users.find(u => u.email === assignTaskData.assignedToEmail)?.username || assignTaskData.assignedToEmail}
//                         </Typography>
//                       </Box>
//                     </Grid>
//                   )}
                  
//                   {assignTaskData.estimatedTime && (
//                     <Grid item xs={12} sm={6}>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                         <Schedule fontSize="small" color="primary" />
//                         <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                           Duration: {assignTaskData.estimatedTime}
//                         </Typography>
//                       </Box>
//                     </Grid>
//                   )}
                  
//                   {assignTaskData.dueDate && (
//                     <Grid item xs={12} sm={6}>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                         <CalendarToday fontSize="small" color="primary" />
//                         <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                           Due: {dayjs(assignTaskData.dueDate).format('MMM DD, YYYY')}
//                         </Typography>
//                       </Box>
//                     </Grid>
//                   )}
//                 </Grid>
//               </Box>
//             </Grid>
//           )}
//         </Grid>
//       </Box>
//     </DialogContent>

//     {/* Enhanced Footer */}
//     <DialogActions sx={{ 
//       p: 3, 
//       bgcolor: 'grey.50',
//       borderTop: '1px solid',
//       borderColor: 'divider',
//       gap: 2
//     }}>
//       <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
//         {loadingUsers && (
//           <>
//             <CircularProgress size={16} />
//             <Typography variant="caption" color="text.secondary">
//               Loading users...
//             </Typography>
//           </>
//         )}
//       </Box>
      
//       <Button 
//         onClick={onHide}
//         variant="outlined"
//         size="large"
//         sx={{ 
//           minWidth: 100,
//           borderRadius: 2
//         }}
//       >
//         Cancel
//       </Button>
      
//       <Button
//         onClick={onAssign}
//         variant="contained"
//         size="large"
//         disabled={loadingUsers || !assignTaskData.taskName || !assignTaskData.assignedToEmail}
//         sx={{ 
//           minWidth: 120,
//           borderRadius: 2,
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           '&:hover': {
//             background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
//           }
//         }}
//         startIcon={<Assignment />}
//       >
//         Assign Task
//       </Button>
//     </DialogActions>
//   </Dialog>
// </LocalizationProvider>


// );

// const SimpleAlarmDialog: React.FC<{
//   open: boolean;
//   dispatch: (action: any) => void;
//   onSetAlarm: (minutes: number) => void;
//   onTestAlarmSound: () => void;
// }> = ({ open, dispatch, onSetAlarm, onTestAlarmSound }) => {
//   const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
//   const [showConfirmation, setShowConfirmation] = useState(false);

//   const alarmOptions = [1, 3, 5, 10];

//   const handleAlarmSelect = (minutes: number) => {
//     setSelectedMinutes(minutes);
//     setShowConfirmation(true);
//   };

//   const handleConfirm = () => {
//     if (selectedMinutes) {
//       onSetAlarm(selectedMinutes);
//       dispatch({ type: 'HIDE_ALARM_DIALOG' });
//       setShowConfirmation(false);
//       setSelectedMinutes(null);
//     }
//   };

//   const handleCancel = () => {
//     setShowConfirmation(false);
//     setSelectedMinutes(null);
//   };

//   const handleClose = () => {
//     dispatch({ type: 'HIDE_ALARM_DIALOG' });
//     setShowConfirmation(false);
//     setSelectedMinutes(null);
//   };

//   return (
//     <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
//       <DialogContent>
//         {!showConfirmation ? (
//           <>
//             <Typography gutterBottom sx={{ mb: 3 }}>
//               Choose alarm interval:
//             </Typography>
            
//             <Box sx={{ 
//               display: 'grid', 
//               gridTemplateColumns: '1fr 1fr', 
//               gap: 2,
//               mb: 3
//             }}>
//               {alarmOptions.map((minutes) => (
//                 <Button
//                   key={minutes}
//                   variant="outlined"
//                   size="large"
//                   onClick={() => handleAlarmSelect(minutes)}
//                   sx={{ 
//                     py: 2,
//                     fontSize: '1.1rem',
//                     fontWeight: 'bold'
//                   }}
//                 >
//                   {minutes} min
//                 </Button>
//               ))}
//             </Box>

//             <Box sx={{ 
//               display: 'flex', 
//               justifyContent: 'center',
//               mb: 2
//             }}>
//               <Button
//                 variant="outlined"
//                 size="small"
//                 onClick={onTestAlarmSound}
//               >
//                 🔊 Test Sound
//               </Button>
//             </Box>
//           </>
//         ) : (
//           <Box sx={{ textAlign: 'center', py: 2 }}>
//             <Typography variant="h6" gutterBottom>
//               Confirm Alarm Setting
//             </Typography>
//             <Typography color="text.secondary" sx={{ mb: 3 }}>
//               Set alarm to ring every <strong>{selectedMinutes} minutes</strong>?
//             </Typography>
//           </Box>
//         )}
//       </DialogContent>
      
//       <DialogActions>
//         {!showConfirmation ? (
//           <>
//             <Button onClick={handleClose}>
//               Cancel
//             </Button>
//             <Button 
//               onClick={() => {
//                 onSetAlarm(0);
//                 handleClose();
//               }}
//               color="error"
//             >
//               Clear Alarm
//             </Button>
//           </>
//         ) : (
//           <>
//             <Button onClick={handleCancel}>
//               Back
//             </Button>
//             <Button 
//               onClick={handleConfirm} 
//               variant="contained"
//               color="primary"
//             >
//               Confirm
//             </Button>
//           </>
//         )}
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default TaskTimerDialogs;
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  Box,
  Typography,
} from '@mui/material';
import AssignTaskDialog from './AssignTaskDialog';
import SimpleAlarmDialog from '../SimpleAlarmDialog';
import type { TaskTimerState, User, AssignTaskData } from './types/types';
import { Assignment } from '@mui/icons-material';
// import SimpleAlarmDialog from './SimpleAlarmDialog';
// import { AssignTaskData, User, TaskTimerState } from './types';

// Update the interface to include allTasks
interface TaskTimerDialogsProps {
  state: TaskTimerState;
  dispatch: (action: any) => void;
  showAssignDialog: boolean;
  users: User[];
  loadingUsers: boolean;
  userError: string | null;
  assignTaskData: AssignTaskData;
  allTasks?: any[]; // Add this line
  onCreateTask: () => void;
  onHideAssignDialog: () => void;
  onAssignTask: () => void;
  onAssignTaskDataChange: (field: string, value: string | Date | null) => void;
  onLoadUsers: () => void;
  onSetAlarm: (minutes: number) => void;
  onTestAlarmSound: () => void;
}

// Update the component to accept and pass allTasks
const TaskTimerDialogs: React.FC<TaskTimerDialogsProps> = ({
  state,
  dispatch,
  showAssignDialog,
  users,
  loadingUsers,
  userError,
  assignTaskData,
  allTasks = [], // Add this line with default value
  onCreateTask,
  onHideAssignDialog,
  onAssignTask,
  onAssignTaskDataChange,
  onLoadUsers,
  onSetAlarm,
  onTestAlarmSound
}) => {
   console.log('🔍 TaskTimerDialogs - allTasks:', allTasks);
  console.log('🔍 TaskTimerDialogs - allTasks length:', allTasks.length);
   const getUniqueTaskNames = () => {
    const taskNames = allTasks.map(task => task.taskName);
    const uniqueNames = [...new Set(taskNames)].filter(name => name && name.trim().length > 0);
    console.log('🔍 Unique task names:', uniqueNames);
    return uniqueNames;
  };
  return (
    <>
      {/* Task Name Input Dialog - NOW WITH AUTOCOMPLETE */}
      <Dialog
        open={state.showTaskNameInput}
        onClose={() => dispatch({ type: 'HIDE_TASK_INPUT' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Enter {state.taskType === 'meeting' ? 'Meeting' : 'Task'} Name
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            freeSolo
            options={getUniqueTaskNames()}
            value={state.taskName || ''}
            onChange={(event, newValue) => {
              dispatch({ type: 'SET_TASK_NAME', payload: newValue || '' });
            }}
            onInputChange={(event, newInputValue) => {
              dispatch({ type: 'SET_TASK_NAME', payload: newInputValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                margin="dense"
                label={`${state.taskType === 'meeting' ? 'Meeting' : 'Task'} Name`}
                fullWidth
                variant="outlined"
                placeholder={`Enter a descriptive name for this ${state.taskType}...`}
                sx={{ mt: 2 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onCreateTask();
                  }
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                py: 1,
                '&:hover': {
                  bgcolor: 'primary.50'
                }
              }}>
                <Assignment fontSize="small" color="primary" />
                <Typography variant="body2">
                  {option}
                </Typography>
              </Box>
            )}
            filterOptions={(options, { inputValue }) => {
              const filtered = options.filter(option =>
                option.toLowerCase().includes(inputValue.toLowerCase())
              );
              
              // Show current input as an option if it doesn't match existing ones
              if (inputValue !== '' && !filtered.includes(inputValue)) {
                filtered.unshift(inputValue);
              }
              
              return filtered;
            }}
            sx={{
              '& .MuiAutocomplete-paper': {
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dispatch({ type: 'HIDE_TASK_INPUT' })}>
            Cancel
          </Button>
          <Button onClick={onCreateTask} variant="contained">
            Start {state.taskType === 'meeting' ? 'Meeting' : 'Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin: Assign Task Dialog */}
      <AssignTaskDialog
        open={showAssignDialog}
        users={users}
        loadingUsers={loadingUsers}
        userError={userError}
        assignTaskData={assignTaskData}
          allTasks={allTasks}
        onHide={onHideAssignDialog}
        onAssign={onAssignTask}
        onDataChange={(field, value) => {
          if (field === 'recurringOptions' && value) {
            const calculateNextRunDate = (recurringOptions: any, startDate: Date = new Date()): Date => {
              if (!recurringOptions || typeof recurringOptions !== 'object') return startDate;
              
              const { 
                repeatInterval, 
                specificDays, 
                customInterval, 
                monthlyOption,
                skipWeekends,
                workingDaysOnly 
              } = recurringOptions;
              
              let nextDate = new Date(startDate);
              
              switch (repeatInterval) {
                case 'daily':
                  nextDate.setDate(nextDate.getDate() + 1);
                  break;
                  
                case 'weekly':
                  if (Array.isArray(specificDays) && specificDays.length > 0) {
                    const currentDay = nextDate.getDay();
                    const sortedDays = [...specificDays].sort((a: number, b: number) => a - b);
                    
                    let nextDay = sortedDays.find((day: number) => typeof day === 'number' && day > currentDay);
                    
                    if (nextDay === undefined) {
                      nextDay = sortedDays[0];
                      const daysToAdd = (7 - currentDay) + nextDay;
                      nextDate.setDate(nextDate.getDate() + daysToAdd);
                    } else {
                      const daysToAdd = nextDay - currentDay;
                      nextDate.setDate(nextDate.getDate() + daysToAdd);
                    }
                  } else {
                    nextDate.setDate(nextDate.getDate() + 7);
                  }
                  break;
                  
                case 'monthly':
                  nextDate.setMonth(nextDate.getMonth() + 1);
                  break;
                  
                case 'custom':
                  if (typeof customInterval === 'number' && customInterval > 0) {
                    nextDate.setDate(nextDate.getDate() + customInterval);
                  } else {
                    nextDate.setDate(nextDate.getDate() + 1);
                  }
                  break;
                  
                default:
                  nextDate.setDate(nextDate.getDate() + 1);
              }
              
              // Apply weekend and working day filters
              if (skipWeekends || workingDaysOnly) {
                while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
                  nextDate.setDate(nextDate.getDate() + 1);
                }
              }
              
              return nextDate;
            };

            const nextRunDate = calculateNextRunDate(value, assignTaskData.dueDate || new Date());
            const enhancedValue = {
              ...value,
              nextRunDate: nextRunDate,
              lastCalculated: new Date()
            };
            
            onAssignTaskDataChange(field, enhancedValue);
          } else {
            onAssignTaskDataChange(field, value);
          }
        }}
        onLoadUsers={onLoadUsers}
      />

      {/* Simple Alarm Dialog */}
      <SimpleAlarmDialog
        open={state.showAlarmDialog}
        dispatch={dispatch}
        onSetAlarm={onSetAlarm}
        onTestAlarmSound={onTestAlarmSound}
      />
    </>
  );
};

export default TaskTimerDialogs;