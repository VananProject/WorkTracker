
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/User.entity';
import { SignupDto, LoginDto, AuthResponseDto} from '../dto/auth.dto';

export class AuthService {
  private userRepository: UserRepository;
  // private telegramService: TelegramService;
  private jwtSecret: string;

  constructor() {
    this.userRepository = new UserRepository();
    // this.telegramService = new TelegramService();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.findAll();
    } catch (error: any) {
      throw new Error(`Failed to get all users: ${error.message}`);
    }
  }

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    try {
      const { username, email, password, confirmPassword, telegramNumber, role } = signupDto;

      // Validation
      if (!username || !email || !password || !confirmPassword || !telegramNumber) {
        return {
          success: false,
          message: 'All fields including telegram number are required'
        };
      }

      if (password !== confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match'
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters long'
        };
      }

     
      // Check if user already exists (email or telegram)
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      
      // Generate OTP
      // const otp = this.telegramService.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create new user (unverified)
      const user = await this.userRepository.create({
        username,
        email,
        password, // This should be hashed in the model/repository
       
        role: role || 'user'
      });

    

      return {
        success: true,
        message: 'User registered successfully. Please verify your Telegram number with the OTP sent.',
        // requiresTelegramVerification: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          telegramNumber: user.telegramNumber,
          // telegramVerified: user.telegramVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to create user',
        error: error.message
      };
    }
  }

  

 async login(loginDto: LoginDto): Promise<AuthResponseDto> {
  try {
    const { email, password } = loginDto;

    // Validation
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required'
      };
    }

    // Find user with password for comparison
    const dbUser = await this.userRepository.findByEmailWithPassword(email);
    if (!dbUser) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Check password
    const isPasswordValid = await this.userRepository.comparePassword(dbUser, password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    
    // Create user entity without password
    const user = new User({
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
      telegramNumber: dbUser.telegramNumber,
      // telegramVerified: dbUser.telegramVerified,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );

    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        telegramNumber: user.telegramNumber,
        // telegramVerified: user.telegramVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Login failed',
      error: error.message
    };
  }
}


  async makeAdmin(email: string): Promise<AuthResponseDto> {
    try {
      const user = await this.userRepository.updateRole(email, 'admin');
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      return {
        success: true,
        message: `${user.username} is now an admin`,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          telegramNumber: user.telegramNumber,
          // telegramVerified: user.telegramVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to update user role',
        error: error.message
      };
    }
  }

  async makeManager(email: string): Promise<AuthResponseDto> {
    try {
      const user = await this.userRepository.updateRole(email, 'manager');
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      return {
        success: true,
        message: `${user.username} is now a manager`,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          telegramNumber: user.telegramNumber,
          // telegramVerified: user.telegramVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to update user role',
        error: error.message
      };
    }
  }

  async updateUserRole(email: string, role: 'user' | 'admin' | 'manager'): Promise<AuthResponseDto> {
    try {
      if (!['user', 'admin', 'manager'].includes(role)) {
        return {
          success: false,
          message: 'Invalid role. Must be either "user", "admin", or "manager"'
        };
      }

      const user = await this.userRepository.updateRole(email, role);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      return {
        success: true,
        message: `${user.username} role updated to ${role}`,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          telegramNumber: user.telegramNumber,
          // telegramVerified: user.telegramVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to update user role',
        error: error.message
      };
    }
  }
}

