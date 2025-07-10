export interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'LOGIN_START' }
  | { type: 'SIGNUP_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: any; token: string } }
  | { type: 'LOGIN_SUCCESS'; payload: { user: any; token: string } }
  | { type: 'SIGNUP_SUCCESS'; payload: { user: any; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'SIGNUP_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }; // Add this line

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
    case 'LOGIN_START':
    case 'SIGNUP_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };

    case 'AUTH_FAILURE':
    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        isLoading: false,
        user: null,
        token: null,
        isAuthenticated: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_LOADING': // Add this case
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};
