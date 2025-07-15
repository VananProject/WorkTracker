// import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import type { ReactNode } from 'react';
// import type { AuthState, AuthAction } from '../services/authReducer';
// import { authReducer } from '../services/authReducer';
// import { authAPI } from '../services/api';

// interface AuthContextType extends AuthState {
//   login: (email: string, password: string) => Promise<boolean>;
//   signup: (username: string, email: string, password: string, confirmPassword: string, role?: 'user' | 'manager' | 'admin') => Promise<boolean>; // Fixed
//   logout: () => void;
//   dispatch: React.Dispatch<AuthAction>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Function to check if the session is valid
// const isValidSession = (): boolean => {
//   const token = localStorage.getItem('token');
//   const user = localStorage.getItem('user');
//   const currentTabSession = sessionStorage.getItem('tabSessionId');
//   const storedSession = localStorage.getItem('currentTabSession');
  
//   // If no token or user, definitely not authenticated
//   if (!token || !user) {
//     return false;
//   }
  
//   // If no tab session exists, this is a new tab/restart
//   if (!currentTabSession) {
//     // Clear old session data since this is a fresh start
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     localStorage.removeItem('currentTabSession');
//     return false;
//   }
  
//   // If tab session doesn't match stored session, invalid
//   if (storedSession && currentTabSession !== storedSession) {
//     return false;
//   }
  
//   return true;
// };

// // Updated initial state to check session validity
// const initialState: AuthState = {
//   user: isValidSession() ? JSON.parse(localStorage.getItem('user') || 'null') : null,
//   token: isValidSession() ? localStorage.getItem('token') : null,
//   isLoading: false,
//   error: null,
//   isAuthenticated: isValidSession(),
// };

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [state, dispatch] = useReducer(authReducer, initialState);

//   // Initialize session on mount
//   useEffect(() => {
//     const initializeSession = () => {
//       const token = localStorage.getItem('token');
//       const user = localStorage.getItem('user');
      
//       if (token && user && !sessionStorage.getItem('tabSessionId')) {
//         // This is a fresh start (new tab or restart), clear auth data
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         localStorage.removeItem('currentTabSession');
        
//         // Update state to logged out
//         dispatch({ type: 'AUTH_LOGOUT' });
//       }
//     };

//     initializeSession();
//   }, []);

//   const login = async (email: string, password: string): Promise<boolean> => {
//     try {
//       dispatch({ type: 'LOGIN_START' });
      
//       const response = await authAPI.login(email, password);
      
//       if (response.data.success) {
//         const { token, user } = response.data;
        
//         // Generate new session ID for this login
//         const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
//         localStorage.setItem('token', token);
//         localStorage.setItem('user', JSON.stringify(user));
//         localStorage.setItem('currentTabSession', sessionId);
//         sessionStorage.setItem('tabSessionId', sessionId);
        
//         dispatch({ 
//           type: 'LOGIN_SUCCESS', 
//           payload: { user, token } 
//         });
        
//         return true;
//       }
//       return false;
//     } catch (error: any) {
//       dispatch({ 
//         type: 'LOGIN_FAILURE', 
//         payload: error.response?.data?.message || error.message || 'Login failed' 
//       });
//       return false;
//     }
//   };

//   const signup = async (
//     username: string, 
//     email: string, 
//     password: string, 
//     confirmPassword: string, 
//     role: 'user' | 'manager' | 'admin' = 'user'
//   ): Promise<boolean> => {
//     console.log('📝 AuthContext: Starting signup for', email, 'as', role);
//     dispatch({ type: 'LOGIN_START' });

//     try {
//       const response = await fetch('http://localhost:5000/api/auth/signup', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           username, 
//           email, 
//           password, 
//           confirmPassword,
//           role 
//         }),
//       });

//       const data = await response.json();
//       console.log('📝 AuthContext: Signup API response:', data);

//       if (response.ok && data.success && data.token && data.user) {
//         // Generate new session ID for this signup
//         const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
//         localStorage.setItem('token', data.token);
//         localStorage.setItem('user', JSON.stringify(data.user));
//         localStorage.setItem('currentTabSession', sessionId);
//         sessionStorage.setItem('tabSessionId', sessionId);
        
//         console.log('✅ AuthContext: Signup successful, dispatching success');
//         dispatch({
//           type: 'LOGIN_SUCCESS',
//           payload: {
//             user: data.user,
//             token: data.token
//           }
//         });
        
//         return true;
//       } else {
//         console.log('❌ AuthContext: Signup failed -', data.message);
//         dispatch({
//           type: 'LOGIN_FAILURE',
//           payload: data.message || 'Signup failed'
//         });
//         return false;
//       }
//     } catch (error: any) {
//       console.error('❌ AuthContext: Signup error:', error);
//       const errorMessage = error.message || 'Signup failed';
//       dispatch({
//         type: 'LOGIN_FAILURE',
//         payload: errorMessage
//       });
//       return false;
//     }
//   };

//   const logout = () => {
//     // Clear all authentication data
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     localStorage.removeItem('currentTabSession');
//     sessionStorage.removeItem('tabSessionId');
    
//     // Update auth state
//     dispatch({ type: 'AUTH_LOGOUT' });
//   };

//   const value: AuthContextType = {
//     ...state,
//     login,
//     signup,
//     logout,
//     dispatch,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, AuthAction } from '../services/authReducer';
import { authReducer } from '../services/authReducer';
import { authAPI } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<any>; // Change this
  signup: (username: string, email: string, password: string, confirmPassword: string, role?: 'user' | 'manager' | 'admin', telegramNumber?: string) => Promise<any>;
  logout: () => void;
  dispatch: React.Dispatch<AuthAction>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to check if the session is valid
const isValidSession = (): boolean => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const currentTabSession = sessionStorage.getItem('tabSessionId');
  const storedSession = localStorage.getItem('currentTabSession');
  
  // If no token or user, definitely not authenticated
  if (!token || !user) {
    return false;
  }
  
  // If no tab session exists, this is a new tab/restart
  if (!currentTabSession) {
    // Clear old session data since this is a fresh start
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentTabSession');
    return false;
  }
  
  // If tab session doesn't match stored session, invalid
  if (storedSession && currentTabSession !== storedSession) {
    return false;
  }
  
  return true;
};

// Updated initial state to check session validity
const initialState: AuthState = {
  user: isValidSession() ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  token: isValidSession() ? localStorage.getItem('token') : null,
  isLoading: false,
  error: null,
  isAuthenticated: isValidSession(),
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user && !sessionStorage.getItem('tabSessionId')) {
        // This is a fresh start (new tab or restart), clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentTabSession');
        
        // Update state to logged out
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeSession();
  }, []);
const login = async (email: string, password: string): Promise<boolean> => {
  try {
    dispatch({ type: 'LOGIN_START' });
    
    const response = await authAPI.login(email, password);
    
    if (response.data.success) {
      const { token, user } = response.data;
      
      // Generate new session ID for this login
      const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('currentTabSession', sessionId);
      sessionStorage.setItem('tabSessionId', sessionId);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token } 
      });
      
      return true;
    }
    return false;
  } catch (error: any) {
    dispatch({ 
      type: 'LOGIN_FAILURE', 
      payload: error.response?.data?.message || error.message || 'Login failed' 
    });
    return false;
  }
};


const signup = async (
  username: string, 
  email: string, 
  password: string, 
  confirmPassword: string, 
  role: 'user' | 'manager' | 'admin' = 'user',
  telegramNumber: string = ''
): Promise<boolean> => {
  console.log('📝 AuthContext: Starting signup for', email, 'as', role);
  dispatch({ type: 'LOGIN_START' });

  try {
    const response = await fetch('https://bp.vananpicture.com/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username, 
        email, 
        password, 
        confirmPassword,
        role,
        telegramNumber,
      }),
    });

    const data = await response.json();
    console.log('📝 AuthContext: Signup API response:', data);

    if (response.ok && data.success && data.token && data.user) {
      // Generate new session ID for this signup
      const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('currentTabSession', sessionId);
      sessionStorage.setItem('tabSessionId', sessionId);
      
      console.log('✅ AuthContext: Signup successful, dispatching success');
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: data.user,
          token: data.token
        }
      });
      
      return true;
    } else {
      console.log('❌ AuthContext: Signup failed -', data.message);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: data.message || 'Signup failed'
      });
      return false;
    }
  } catch (error: any) {
    console.error('❌ AuthContext: Signup error:', error);
    const errorMessage = error.message || 'Signup failed';
    dispatch({
      type: 'LOGIN_FAILURE',
      payload: errorMessage
    });
    return false;
  }
};


  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentTabSession');
    sessionStorage.removeItem('tabSessionId');
    
    // Update auth state
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    dispatch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
