// import jwt from 'jsonwebtoken';
// import { UserRepository } from '../repositories/user.repository';
// import { User } from '../entities/User.entity';
// import { SignupDto, LoginDto, AuthResponseDto } from '../dto/auth.dto';

// export class AuthService {
//   private userRepository: UserRepository;
//   private jwtSecret: string;

//   constructor() {
//     this.userRepository = new UserRepository();
//     this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
//   }

//   async getAllUsers(): Promise<User[]> {
//     try {
//       return await this.userRepository.findAll();
//     } catch (error: any) {
//       throw new Error(`Failed to get all users: ${error.message}`);
//     }
//   }

//   async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
//     try {
//       const { username, email, password, confirmPassword } = signupDto;

//       // Validation
//       if (!username || !email || !password || !confirmPassword) {
//         return {
//           success: false,
//           message: 'All fields are required'
//         };
//       }

//       if (password !== confirmPassword) {
//         return {
//           success: false,
//           message: 'Passwords do not match'
//         };
//       }

//       if (password.length < 6) {
//         return {
//           success: false,
//           message: 'Password must be at least 6 characters long'
//         };
//       }

//       // Check if user already exists
//       const existingUser = await this.userRepository.findByEmailOrUsername(email, username);
//       if (existingUser) {
//         return {
//           success: false,
//           message: 'User with this email or username already exists'
//         };
//       }

//       // Create new user
//       const user = await this.userRepository.create({
//         username,
//         email,
//         password,
//         role: 'user'
//       });

//       // Generate JWT token
//       const token = jwt.sign(
//         { 
//           userId: user.id, 
//           email: user.email, 
//           role: user.role 
//         },
//         this.jwtSecret,
//         { expiresIn: '7d' }
//       );

//       return {
//         success: true,
//         message: 'User created successfully',
//         token,
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           role: user.role,
//           createdAt: user.createdAt,
//           updatedAt: user.updatedAt
//         }
//       };
//     } catch (error: any) {
//       return {
//         success: false,
//         message: 'Failed to create user',
//         error: error.message
//       };
//     }
//   }

//   async login(loginDto: LoginDto): Promise<AuthResponseDto> {
//     try {
//       const { email, password } = loginDto;

//       // Validation
//       if (!email || !password) {
//         return {
//           success: false,
//           message: 'Email and password are required'
//         };
//       }

//       // Find user with password for comparison
//       const dbUser = await this.userRepository.findByEmailWithPassword(email);
//       if (!dbUser) {
//         return {
//           success: false,
//           message: 'Invalid email or password'
//         };
//       }

//       // Check password
//       const isPasswordValid = await this.userRepository.comparePassword(dbUser, password);
//       if (!isPasswordValid) {
//         return {
//           success: false,
//           message: 'Invalid email or password'
//         };
//       }

//       // Create user entity without password
//       const user = new User({
//         id: dbUser.id,
//         username: dbUser.username,
//         email: dbUser.email,
//         role: dbUser.role,
//         createdAt: dbUser.createdAt,
//         updatedAt: dbUser.updatedAt
//       });

//       // Generate JWT token
//       const token = jwt.sign(
//         { 
//           userId: user.id, 
//           email: user.email, 
//           role: user.role 
//         },
//         this.jwtSecret,
//         { expiresIn: '7d' }
//       );

//       return {
//         success: true,
//         message: 'Login successful',
//         token,
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           role: user.role,
//           createdAt: user.createdAt,
//           updatedAt: user.updatedAt
//         }
//       };
//     } catch (error: any) {
//       return {
//         success: false,
//         message: 'Login failed',
//         error: error.message
//       };
//     }
//   }

//   async makeAdmin(email: string): Promise<AuthResponseDto> {
//     try {
//       const user = await this.userRepository.updateRole(email, 'admin');
      
//       if (!user) {
//         return {
//           success: false,
//           message: 'User not found'
//         };
//       }
      
//       return {
//         success: true,
//         message: `${user.username} is now an admin`,
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           role: user.role,
//           createdAt: user.createdAt,
//           updatedAt: user.updatedAt
//         }
//       };
//     } catch (error: any) {
//       return {
//         success: false,
//         message: 'Failed to update user role',
//         error: error.message
//       };
//     }
//   }
//    async makeManager(email: string): Promise<AuthResponseDto> {
//     try {
//       const user = await this.userRepository.updateRole(email, 'manager');
      
//       if (!user) {
//         return {
//           success: false,
//           message: 'User not found'
//         };
//       }
      
//       return {
//         success: true,
//         message: `${user.username} is now a manager`,
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           role: user.role,
//           createdAt: user.createdAt,
//           updatedAt: user.updatedAt
//         }
//       };
//     } catch (error: any) {
//       return {
//         success: false,
//         message: 'Failed to update user role',
//         error: error.message
//       };
//     }
//   }

//   async updateUserRole(email: string, role: 'user' | 'admin' | 'manager'): Promise<AuthResponseDto> {
//     try {
//       if (!['user', 'admin', 'manager'].includes(role)) {
//         return {
//           success: false,
//           message: 'Invalid role. Must be either "user", "admin", or "manager"'
//         };
//       }

//       const user = await this.userRepository.updateRole(email, role);
      
//       if (!user) {
//         return {
//           success: false,
//           message: 'User not found'
//         };
//       }
      
//       return {
//         success: true,
//         message: `${user.username} role updated to ${role}`,
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           role: user.role,
//           createdAt: user.createdAt,
//           updatedAt: user.updatedAt
//         }
//       };
//     } catch (error: any) {
//       return {
//         success: false,
//         message: 'Failed to update user role',
//         error: error.message
//       };
//     }
//   }

// }
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/User.entity';
import { SignupDto, LoginDto, AuthResponseDto} from '../dto/auth.dto';
// import { TelegramService } from './telegram.service';
// import { TelegramService } from './telegram.service';

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

      // Validate telegram number
      // if (!this.telegramService.validateTelegramNumber(telegramNumber)) {
      //   return {
      //     success: false,
      //     message: 'Please enter a valid telegram number with country code'
      //   };
      // }

      // Check if user already exists (email or telegram)
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // const formattedTelegramNumber = this.telegramService.formatTelegramNumber(telegramNumber);
      // const existingUserByTelegram = await this.userRepository.findByTelegramNumber(formattedTelegramNumber);
      // if (existingUserByTelegram) {
      //   return {
      //     success: false,
      //     message: 'User with this telegram number already exists'
      //   };
      // }

      // Generate OTP
      // const otp = this.telegramService.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create new user (unverified)
      const user = await this.userRepository.create({
        username,
        email,
        password, // This should be hashed in the model/repository
        // telegramNumber: formattedTelegramNumber,
        // telegramVerified: false,
        // telegramOtp: otp,
        // telegramOtpExpiry: otpExpiry,
        role: role || 'user'
      });

      // Send OTP via Telegram
      // const otpSent = await this.telegramService.sendOTP(
      //   formattedTelegramNumber,
      //   otp,
      //   username
      // );

      // if (!otpSent) {
      //   console.warn(`⚠️ Failed to send OTP to ${formattedTelegramNumber}`);
      // }

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

  // async verifyTelegramOtp(verifyDto: VerifyTelegramOtpDto): Promise<AuthResponseDto> {
  //   try {
  //     const { email, otp } = verifyDto;

  //     if (!email || !otp) {
  //       return {
  //         success: false,
  //         message: 'Email and OTP are required'
  //       };
  //     }

  //     // Find user with OTP details
  //     const user = await this.userRepository.findByEmailWithOtp(email);
  //     if (!user) {
  //       return {
  //         success: false,
  //         message: 'User not found'
  //       };
  //     }

  //     if (user.telegramVerified) {
  //       return {
  //         success: false,
  //         message: 'Telegram number is already verified'
  //       };
  //     }

  //     if (!user.telegramOtp || !user.telegramOtpExpiry) {
  //       return {
  //         success: false,
  //         message: 'No OTP found. Please request a new OTP.'
  //       };
  //     }

  //     if (new Date() > user.telegramOtpExpiry) {
  //       return {
  //         success: false,
  //         message: 'OTP has expired. Please request a new OTP.'
  //       };
  //     }

  //     if (user.telegramOtp !== otp) {
  //       return {
  //         success: false,
  //         message: 'Invalid OTP'
  //       };
  //     }

  //     // Verify user and clear OTP
  //     const verifiedUser = await this.userRepository.updateTelegramVerification(email, true);
  //     if (!verifiedUser) {
  //       return {
  //         success: false,
  //         message: 'Failed to verify user'
  //       };
  //     }

  //     // Generate JWT token
  //     const token = jwt.sign(
  //       { 
  //         userId: verifiedUser.id, 
  //         email: verifiedUser.email, 
  //         role: verifiedUser.role 
  //       },
  //       this.jwtSecret,
  //       { expiresIn: '24h' }
  //     );

  //     return {
  //       success: true,
  //       message: 'Telegram number verified successfully',
  //       token,
  //       user: {
  //         id: verifiedUser.id,
  //         username: verifiedUser.username,
  //         email: verifiedUser.email,
  //         role: verifiedUser.role,
  //         telegramNumber: verifiedUser.telegramNumber,
  //         telegramVerified: verifiedUser.telegramVerified,
  //         createdAt: verifiedUser.createdAt,
  //         updatedAt: verifiedUser.updatedAt
  //       }
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: 'Failed to verify OTP',
  //       error: error.message
  //     };
  //   }
  // }

  // async resendTelegramOtp(resendDto: ResendTelegramOtpDto): Promise<AuthResponseDto> {
  //   try {
  //     const { email } = resendDto;

  //     if (!email) {
  //       return {
  //         success: false,
  //         message: 'Email is required'
  //       };
  //     }

  //     const user = await this.userRepository.findByEmail(email);
  //     if (!user) {
  //       return {
  //         success: false,
  //         message: 'User not found'
  //       };
  //     }

  //     if (user.telegramVerified) {
  //       return {
  //         success: false,
  //         message: 'Telegram number is already verified'
  //       };
  //     }

  //     // Generate new OTP
  //     const otp = this.telegramService.generateOTP();
  //     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  //     // Update user with new OTP
  //     await this.userRepository.updateTelegramVerification(email, false, otp, otpExpiry);

  //     // Send OTP via Telegram
  //     const otpSent = await this.telegramService.sendOTP(
  //       user.telegramNumber!,
  //       otp,
  //       user.username
  //     );

  //     if (!otpSent) {
  //       return {
  //         success: false,
  //         message: 'Failed to send OTP. Please try again later.'
  //       };
  //     }

  //     return {
  //       success: true,
  //       message: 'OTP sent successfully to your Telegram number'
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: 'Failed to resend OTP',
  //       error: error.message
  //     };
  //   }
  // }

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

    // REMOVE THIS ENTIRE BLOCK - No telegram verification check for login
    /*
    if (!dbUser.telegramVerified) {
      return {
        success: false,
        message: 'Please verify your Telegram number before logging in',
        requiresTelegramVerification: true,
        user: {
          id: dbUser.id,
          username: dbUser.username,
          email: dbUser.email,
          role: dbUser.role,
          telegramNumber: dbUser.telegramNumber,
          telegramVerified: dbUser.telegramVerified
        }
      };
    }
    */

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

