
export interface SignupDto {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  telegramNumber: string;
  role?: 'user' | 'admin' | 'manager';
}

export interface LoginDto {
  email: string;
  password: string;
}



export interface AuthResponseDto {
  success: boolean;
  message: string;
  token?: string;
  // requiresTelegramVerification?: boolean;
  user?: {
    id?: string;
    username: string;
    email: string;
    role: string;
    telegramNumber?: string;
    // telegramVerified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };
  error?: string;
}
