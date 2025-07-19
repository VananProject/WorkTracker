
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  AdminPanelSettings,
  ManageAccounts,
  Business,
  Phone,
   Telegram,
  // VerifiedUser,
} from '@mui/icons-material';

import '../styles/auth.css';
import { useAuth } from '../hooks/AuthContext';
import { getRoleDescription, type UserRole, getRoleDisplayName } from './Timer/TableUI/utils/roleUtils';

interface SignupProps {
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
  const { signup, isLoading, error, dispatch } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    telegramNumber: '',
    role: 'user' as 'user' | 'manager' | 'admin',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  
  // OTP Verification State
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  useEffect(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.telegramNumber) {
      errors.telegramNumber = 'Telegram number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.telegramNumber)) {
      errors.telegramNumber = 'Please enter a valid telegram number with country code (e.g., +1234567890)';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      errors.role = 'Please select a role';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format telegram number as user types
    let processedValue = value;
    if (name === 'telegramNumber') {
      // Remove all non-digits except leading +
      processedValue = value.replace(/[^\d+]/g, '');
      // Ensure it starts with + if user enters digits
      if (processedValue && !processedValue.startsWith('+')) {
        processedValue = '+' + processedValue;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    if (name === 'password' && formData.confirmPassword && processedValue === formData.confirmPassword) {
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: '',
      }));
    }

    if (name === 'confirmPassword' && formData.password && processedValue === formData.password) {
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: '',
      }));
    }
  };

  const handleRoleChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as 'user' | 'manager' | 'admin'; 
    setFormData(prev => ({
      ...prev,
      role: value,
    }));
    
    if (formErrors.role) {
      setFormErrors(prev => ({
        ...prev,
        role: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    console.log('🔍 Frontend: Submitting signup with data:', {
      username: formData.username,
      email: formData.email,
      telegramNumber: formData.telegramNumber,
      role: formData.role
    });

    try {
      const result = await signup(
        formData.username, 
        formData.email, 
        formData.password, 
        formData.confirmPassword, 
        formData.role,
        formData.telegramNumber
      );
      
      console.log('📝 Frontend: Signup result:', result);
      
      // If signup requires telegram verification, show OTP dialog
      if (result ) {
        setSignupEmail(formData.email);
        // setShowOtpDialog(true);
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

 
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Role options with their respective data
  const roleOptions: { value: 'user' | 'manager' | 'admin'; label: string; description: string; icon: any }[] = [
    {
      value: 'user',
      label: getRoleDisplayName('user'),
      description: getRoleDescription('user'),
      icon: Person
    },
    {
      value: 'manager',
      label: getRoleDisplayName('manager'),
      description: getRoleDescription('manager'),
      icon: ManageAccounts
    },
    {
      value: 'admin',
      label: getRoleDisplayName('admin'),
      description: getRoleDescription('admin'),
      icon: AdminPanelSettings
    }
  ];

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <Paper
          elevation={24}
          sx={{
            width: '100%',
            maxWidth: 520,
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Form Section */}
          <Box sx={{ padding: 4 }}>
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

              {/* Username Field */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  name="username"
                  type="text"
                  label="Full Name / Username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!formErrors.username}
                  helperText={formErrors.username}
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
                        <Person sx={{ color: '#1e3c72' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Email Field */}
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

              {/* Telegram Number Field */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  name="telegramNumber"
                  type="tel"
                  label="Telegram Number"
                  placeholder="+1234567890"
                  value={formData.telegramNumber}
                  onChange={handleChange}
                  error={!!formErrors.telegramNumber}
                  helperText={formErrors.telegramNumber || "Include country code (e.g., +1 for US, +91 for India)"}
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
                        <Telegram sx={{ color: '#1e3c72' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Role Selection */}
              <Box sx={{ mb: 3 }}>
                <FormControl 
                  fullWidth 
                  error={!!formErrors.role} 
                  disabled={isLoading}
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
                >
                  <InputLabel id="role-select-label">Account Type</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={formData.role}
                    label="Account Type"
                    onChange={handleRoleChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <Business sx={{ color: '#1e3c72' }} />
                      </InputAdornment>
                    }
                  >
                    {roleOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconComponent 
                              fontSize="small" 
                              color={
                                option.value === 'admin' ? 'error' : 
                                option.value === 'manager' ? 'warning' : 
                                'primary'
                              } 
                            />
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {option.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.description}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                  {formErrors.role && (
                    <Typography 
                      variant="caption" 
                      color="error" 
                      sx={{ mt: 0.5, ml: 1.75, fontSize: '0.75rem' }}
                    >
                      {formErrors.role}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              {/* Password Field */}
              <Box sx={{ mb: 3 }}>
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

              {/* Confirm Password Field */}
              <Box sx={{ mb: 4 }}>
                <TextField
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
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
                          onClick={toggleConfirmPasswordVisibility}
                          edge="end"
                          disabled={isLoading}
                          sx={{ color: '#1e3c72' }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Submit Button */}
              <Box sx={{ mb: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 15px rgba(30, 60, 114, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1a3461 0%, #245085 100%)',
                      boxShadow: '0 6px 20px rgba(30, 60, 114, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      boxShadow: 'none',
                      transform: 'none',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <Typography variant="body2">Creating Account...</Typography>
                    </Box>
                  ) : (
                    'Create Professional Account'
                  )}
                </Button>
              </Box>

              {/* Role Information */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Account Types:
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {roleOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <Box key={option.value} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <IconComponent 
                          sx={{ 
                            fontSize: 14, 
                            color: option.value === 'admin' ? 'error.main' : 
                                   option.value === 'manager' ? 'warning.main' : 
                                   'primary.main'
                          }} 
                        />
                        <Typography variant="caption" color="text.secondary">
                          <strong>{option.label}:</strong> {option.description}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

             
            </form>
          </Box>
        </Paper>
      </Box>

 
    </>
  );
};

export default Signup;

