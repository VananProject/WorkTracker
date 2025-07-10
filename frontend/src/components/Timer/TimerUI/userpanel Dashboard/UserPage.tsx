import React from 'react';
import { Box, Typography } from '@mui/material';
import UserPanel from '../Userpanel';
// import UserPanel from '../UserPanel';

interface UserPageProps {
  [key: string]: any;
}

const UserPage: React.FC<UserPageProps> = (props) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        My Dashboard
      </Typography>

      <Box sx={{ 
        width: '100%',
        maxWidth: '100%',
        overflow: 'visible',
        '& .MuiPaper-root': {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        '& .MuiTableContainer-root': {
          borderRadius: 2,
          border: '1px solid #e0e0e0',
        }
      }}>
        <UserPanel 
          userTasks={[]} 
          currentUser={{}} 
          onCreateTask={() => {
            console.log('Create new task');
          }} 
          {...props} 
        />
      </Box>
    </Box>
  );
};

export default UserPage;
