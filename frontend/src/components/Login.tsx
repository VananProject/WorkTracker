import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Business } from '@mui/icons-material';

import '../styles/auth.css';
import { useAuth } from '../hooks/AuthContext';

interface LoginProps {
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  const { login, isLoading, error, dispatch } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // padding: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 4,
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            padding: 4,
            textAlign: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
 <Box
  component="img"
  src="/assert/ChatGPT_Image_Jun_10__2025__09_20_55_AM-removebg-preview.png"
  alt="Vanan Online Services Logo"
  sx={{
    width: 64,
    height: 64,
    mb: 2,
    filter: 'brightness(0) invert(1) brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.6))',
    animation: 'logoGlow 2s ease-in-out infinite alternate, logoFloat 3s ease-in-out infinite',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.15) rotate(5deg)',
    },
    '@keyframes logoGlow': {
      '0%': { 
        filter: 'brightness(0) invert(1) brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.6))',
      },
      '100%': { 
        filter: 'brightness(0) invert(1) brightness(1.5) drop-shadow(0 0 25px rgba(255,255,255,0.9))',
      },
    },
    '@keyframes logoFloat': {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-8px)' },
    },
  }}
/>



            <Typography variant="h4" fontWeight="700" sx={{ mb: 1, letterSpacing: '-0.5px' }}>
              Vanan Online Services
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
              Professional Timer Management System
            </Typography>
          </Box>
        </Box>

        {/* Form Section */}
        <Box sx={{ padding: 4 }}>
          {/* <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access your dashboard
            </Typography>
          </Box> */}

          <form onSubmit={handleSubmit}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: '1.2rem'
                  }
                }}
              >
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <TextField
                name="email"
                type="email"
                label="Corporate Email Address"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={isLoading}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontWeight: 500,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#1e3c72' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <TextField
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                disabled={isLoading}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontWeight: 500,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#1e3c72' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={isLoading}
                        sx={{ color: '#1e3c72' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                height: 56,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 8px 32px rgba(30, 60, 114, 0.3)',
                mb: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1a3464 0%, #245086 100%)',
                  boxShadow: '0 12px 40px rgba(30, 60, 114, 0.4)',
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} color="inherit" />
                  <span>Signing In...</span>
                </Box>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>

            {/* <Divider sx={{ mb: 3, opacity: 0.6 }} /> */}

            { <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                New to Vanan Online Services?
              </Typography>
              <Button
                type="button"
                onClick={onSwitchToSignup}
                disabled={isLoading}
                variant="text"
                sx={{
                  color: '#1e3c72',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': {
                    backgroundColor: 'rgba(30, 60, 114, 0.08)',
                  },
                }}
              >
                Create Corporate Account
              </Button>
            </Box> }
          </form>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            padding: 2,
            textAlign: 'center',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © 2024 Vanan Online Services. Enterprise Solutions.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
