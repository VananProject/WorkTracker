import React from 'react';
import { Box, Typography } from '@mui/material';
import AdminPanel from '../AdminPanel';


interface AdminPageProps {
  [key: string]: any; // Accept all props to spread to AdminPanel
}

const AdminPage: React.FC<AdminPageProps> = (props) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Admin Panel
      </Typography>

      <Box sx={{ 
        width: '100%',
        maxWidth: '100%',
        overflow: 'visible',
        // Add some responsive styling for better admin panel display
        '& .MuiPaper-root': {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        '& .MuiTableContainer-root': {
          borderRadius: 2,
          border: '1px solid #e0e0e0',
        }
      }}>
        <AdminPanel users={[]} allTasks={[]} onShowAssignDialog={function (): void {
          throw new Error('Function not implemented.');
        } } {...props} />
      </Box>
    </Box>
  );
};

export default AdminPage;
