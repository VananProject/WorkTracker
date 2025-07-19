
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import Dashboard from './components/Dashboard';
import AuthContainer from './hooks/AuthContainer';
import { useAuth, AuthProvider } from './hooks/AuthContext';
import theme from './theme/theme';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
        {isAuthenticated ? (
          <Routes>
            <Route path="/*" element={<Dashboard />} />
          </Routes>
        ) : (
          <AuthContainer />
        )}
      </Router>
    </LocalizationProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
