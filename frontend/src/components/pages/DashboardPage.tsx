import React from 'react';
import {
  Box,
  Container,
  Paper,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import TaskTimer from '../Timer/functionality/TaskTimer';

interface DashboardPageProps {
  showAdminPanelFromAppBar?: boolean;
  onToggleAdminPanelFromAppBar?: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  showAdminPanelFromAppBar = false, 
  onToggleAdminPanelFromAppBar 
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: { xs: 1, sm: 2, md: 3 },
        px: { xs: 0.5, sm: 1, md: 1.5 },
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #667eea 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, #764ba2 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container
        maxWidth={false}
        disableGutters
        sx={{
          maxWidth: '100% !important',
          width: '100%',
          minWidth: '100%',
          margin: 0,
          position: 'relative',
          zIndex: 1,
          '&.MuiContainer-root': {
            maxWidth: '100% !important',
            paddingLeft: { xs: '4px', sm: '8px', md: '12px' },
            paddingRight: { xs: '4px', sm: '8px', md: '12px' },
          },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: { xs: 1, sm: 2, md: 3 },
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            width: '100%',
            minWidth: '100%',
            minHeight: 'calc(100vh - 40px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              zIndex: 1,
            },
          }}
        >
          <Box
            sx={{
              p: { xs: 0.5, sm: 1, md: 1.5, lg: 2 },
              height: '100%',
              overflow: 'auto',
                            position: 'relative',
              width: '100%',
            }}
          >
            <TaskTimer
              showAdminPanelFromAppBar={showAdminPanelFromAppBar}
              onToggleAdminPanelFromAppBar={onToggleAdminPanelFromAppBar}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default DashboardPage;

