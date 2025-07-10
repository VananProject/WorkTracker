// import { Request, Response } from 'express';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import User, { IUser } from '../models/User';//
// import { AuthRequest } from '../middleware/auth.middleware';

// export class AuthController {
  
//   async signup(req: Request, res: Response): Promise<void> {
//     try {
//       const { username, email, password, confirmPassword, role } = req.body;

//       // Validation
//       if (!username || !email || !password || !confirmPassword) {
//         res.status(400).json({
//           success: false,
//           message: 'All fields are required'
//         });
//         return;
//       }

//       if (password !== confirmPassword) {
//         res.status(400).json({
//           success: false,
//           message: 'Passwords do not match'
//         });
//         return;
//       }

//       if (password.length < 6) {
//         res.status(400).json({
//           success: false,
//           message: 'Password must be at least 6 characters long'
//         });
//         return;
//       }

//       // Updated role validation to include manager
//       if (role && !['user', 'manager', 'admin'].includes(role)) {
//         res.status(400).json({
//           success: false,
//           message: 'Invalid role. Must be "user", "manager", or "admin"'
//         });
//         return;
//       }

//       // Check if user already exists
//       const existingUser = await User.findOne({ email: email.toLowerCase() });
//       if (existingUser) {
//         res.status(400).json({
//           success: false,
//           message: 'User with this email already exists'
//         });
//         return;
//       }

//       // Hash password
//       const saltRounds = 10;
//       const hashedPassword = await bcrypt.hash(password, saltRounds);

//       // Create user
//       const newUser = new User({
//         username: username.trim(),
//         email: email.toLowerCase().trim(),
//         password: hashedPassword,
//         role: role || 'user' // Default role
//       });

//       await newUser.save();

//       // Generate JWT token
//       const token = jwt.sign(
//         { userId: newUser._id, email: newUser.email, role: newUser.role },
//         process.env.JWT_SECRET || 'your-secret-key',
//         { expiresIn: '24h' }
//       );

//       console.log(`✅ New user registered: ${newUser.email} as ${newUser.role}`);

//       res.status(201).json({
//         success: true,
//         message: 'User registered successfully',
//         token,
//         user: {
//           id: newUser._id,
//           username: newUser.username,
//           email: newUser.email,
//           role: newUser.role
//         }
//       });
//     } catch (error) {
//       console.error('Signup error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to register user',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     }
//   }

//   async login(req: Request, res: Response): Promise<void> {
//     try {
//       const { email, password } = req.body;

//       // Validation
//       if (!email || !password) {
//         res.status(400).json({
//           success: false,
//           message: 'Email and password are required'
//         });
//         return;
//       }

//       // Find user
//       const user = await User.findOne({ email: email.toLowerCase() });
//       if (!user) {
//         res.status(401).json({
//           success: false,
//           message: 'Invalid email or password'
//         });
//         return;
//       }

//       // Check password
//       const isPasswordValid = await bcrypt.compare(password, user.password);
//       if (!isPasswordValid) {
//         res.status(401).json({
//           success: false,
//           message: 'Invalid email or password'
//         });
//         return;
//       }

//       // Generate JWT token
//       const token = jwt.sign(
//         { userId: user._id, email: user.email, role: user.role },
//         process.env.JWT_SECRET || 'your-secret-key',
//         { expiresIn: '24h' }
//       );

//       console.log(`✅ User logged in: ${user.email} (${user.role})`);

//       res.json({
//         success: true,
//         message: 'Login successful',
//         token,
//         user: {
//           id: user._id,
//           username: user.username,
//           email: user.email,
//           role: user.role
//         }
//       });
//     } catch (error) {
//       console.error('Login error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to login',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     }
//   }

//   async getUsers(req: AuthRequest, res: Response): Promise<void> {
//     try {
//       // Check if user is admin or manager
//       if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
//         res.status(403).json({
//           success: false,
//           message: 'Admin or Manager access required'
//         });
//         return;
//       }

//       console.log(`🔍 ${req.user.role} fetching all users...`);

//       const users = await User.find({}, '-password').sort({ createdAt: -1 });

//       console.log(`📊 Found ${users.length} users`);

//       res.json({
//         success: true,
//         data: users,
//         message: `Found ${users.length} users`
//       });
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to fetch users',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     }
//   }

//   // NEW: Get public users - accessible to all authenticated users
//   async getPublicUsers(req: AuthRequest, res: Response): Promise<void> {
//     try {
//       if (!req.user) {
//         res.status(401).json({
//           success: false,
//           message: 'Authentication required'
//         });
//         return;
//       }

//       console.log(`🔍 User ${req.user.email} (${req.user.role}) fetching public users list...`);

//       // Get all users but exclude sensitive information
//       const users = await User.find({}, {
//         password: 0,
//         __v: 0,
//       }).sort({ username: 1 });

//       console.log(`📊 Found ${users.length} users for public access`);

//       res.json({
//         success: true,
//         users: users,
//         count: users.length,
//         message: `Found ${users.length} users`
//       });
//     } catch (error) {
//       console.error('Error fetching public users:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Server error while fetching users',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     }
//   }

//   async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
//     try {
//       if (!req.user) {
//         res.status(401).json({
//           success: false,
//           message: 'User not authenticated'
//         });
//         return;
//       }

//       res.json({
//         success: true,
//         data: {
//           id: req.user._id,
//           username: req.user.username,
//           email: req.user.email,
//           role: req.user.role
//         }
//       });
//     } catch (error) {
//       console.error('Error getting current user:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get current user',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     }
//   }

//   // NEW: Update user role - Admin only
//   async updateUserRole(req: AuthRequest, res: Response): Promise<void> {
//     try {
//       // Only admins can update user roles
//       if (!req.user || req.user.role !== 'admin') {
//         res.status(403).json({
//           success: false,
//           message: 'Admin access required'
//         });
//         return;
//       }

//       const { userId, newRole } = req.body;

//       if (!userId || !newRole) {
//         res.status(400).json({
//           success: false,
//           message: 'User ID and new role are required'
//         });
//         return;
//       }

//       if (!['user', 'manager', 'admin'].includes(newRole)) {
//         res.status(400).json({
//           success: false,
//           message: 'Invalid role. Must be "user", "manager", or "admin"'
//         });
//         return;
//       }

//       const user = await User.findByIdAndUpdate(
//         userId,
//         { role: newRole },
//         { new: true, select: '-password' }
//       );

//       if (!user) {
//         res.status(404).json({
//           success: false,
//           message: 'User not found'
//         });
//         return;
//       }

//       console.log(`✅ Admin ${req.user.email} updated ${user.email} role to ${newRole}`);

//       res.json({
//         success: true,
//         message: `User role updated to ${newRole}`,
//         user: {
//           id: user._id,
//           username: user.username,
//           email: user.email,
//           role: user.role
//         }
//       });
//     } catch (error) {
//       console.error('Error updating user role:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to update user role',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     }
//   }
// }
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
// import { TelegramService } from '../services/telegram.service';
// import { TelegramService } from '../services/telegram.service';

export class AuthController {
  // private telegramService: TelegramService;

  constructor() {
    // this.telegramService = new TelegramService();
  }
  
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, confirmPassword, telegramNumber, role } = req.body;

      // Validation
      if (!username || !email || !password || !confirmPassword || !telegramNumber) {
        res.status(400).json({
          success: false,
          message: 'All fields including telegram number are required'
        });
        return;
      }

      if (password !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Passwords do not match'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
        return;
      }

      // Validate telegram number
      // if (!this.telegramService.validateTelegramNumber(telegramNumber)) {
      //   res.status(400).json({
      //     success: false,
      //     message: 'Please enter a valid telegram number with country code (e.g., +1234567890)'
      //   });
      //   return;
      // }

      // Updated role validation to include manager
      if (role && !['user', 'manager', 'admin'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role. Must be "user", "manager", or "admin"'
        });
        return;
      }

      // Check if user already exists
     const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate OTP
      // const otp = this.telegramService.generateOTP();
      // const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create user (not verified initially)
      const newUser = new User({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        // telegramNumber: this.telegramService.formatTelegramNumber(telegramNumber),
        // telegramVerified: false,
        // telegramOtp: otp,
        // telegramOtpExpiry: otpExpiry,
        role: role || 'user'
      });

      await newUser.save();

      // Send OTP via Telegram
      // const otpSent = await this.telegramService.sendOTP(
      //   newUser.telegramNumber, 
      //   otp, 
      //   newUser.username
      // );

      // if (!otpSent) {
      //   // If OTP sending fails, we still create the user but inform about the issue
      //   console.warn(`⚠️ Failed to send OTP to ${newUser.telegramNumber}`);
      // }

      console.log(`✅ New user registered: ${newUser.email} as ${newUser.role} (Telegram: ${newUser.telegramNumber})`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. ',
        // requiresTelegramVerification: true,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          telegramNumber: newUser.telegramNumber,
          // telegramVerified: newUser.telegramVerified
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // async verifyTelegramOtp(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { email, otp } = req.body;

  //     if (!email || !otp) {
  //       res.status(400).json({
  //         success: false,
  //         message: 'Email and OTP are required'
  //       });
  //       return;
  //     }

  //     // Find user with OTP details
  //     const user = await User.findOne({ 
  //       email: email.toLowerCase() 
  //     }).select('+telegramOtp +telegramOtpExpiry');

  //     if (!user) {
  //       res.status(404).json({
  //         success: false,
  //         message: 'User not found'
  //       });
  //       return;
  //     }

  //         if (user.telegramVerified) {
  //       res.status(400).json({
  //         success: false,
  //         message: 'Telegram number is already verified'
  //       });
  //       return;
  //     }

  //     if (!user.telegramOtp || !user.telegramOtpExpiry) {
  //       res.status(400).json({
  //         success: false,
  //         message: 'No OTP found. Please request a new OTP.'
  //       });
  //       return;
  //     }

  //     if (new Date() > user.telegramOtpExpiry) {
  //       res.status(400).json({
  //         success: false,
  //         message: 'OTP has expired. Please request a new OTP.'
  //       });
  //       return;
  //     }

  //     if (user.telegramOtp !== otp) {
  //       res.status(400).json({
  //         success: false,
  //         message: 'Invalid OTP'
  //       });
  //       return;
  //     }

  //     // Verify user and clear OTP
  //     user.telegramVerified = true;
  //     user.telegramOtp = undefined;
  //     user.telegramOtpExpiry = undefined;
  //     await user.save();

  //     // Generate JWT token now that user is verified
  //     const token = jwt.sign(
  //       { userId: user._id, email: user.email, role: user.role },
  //       process.env.JWT_SECRET || 'your-secret-key',
  //       { expiresIn: '24h' }
  //     );

  //     console.log(`✅ Telegram verified for user: ${user.email}`);

  //     res.json({
  //       success: true,
  //       message: 'Telegram number verified successfully',
  //       token,
  //       user: {
  //         id: user._id,
  //         username: user.username,
  //         email: user.email,
  //         role: user.role,
  //         telegramNumber: user.telegramNumber,
  //         telegramVerified: user.telegramVerified
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Telegram OTP verification error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to verify OTP',
  //       error: error instanceof Error ? error.message : 'Unknown error'
  //     });
  //   }
  // }

  // async resendTelegramOtp(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { email } = req.body;

  //     if (!email) {
  //       res.status(400).json({
  //         success: false,
  //         message: 'Email is required'
  //       });
  //       return;
  //     }

  //     const user = await User.findOne({ email: email.toLowerCase() });

  //     if (!user) {
  //       res.status(404).json({
  //         success: false,
  //         message: 'User not found'
  //       });
  //       return;
  //     }

  //     if (user.telegramVerified) {
  //       res.status(400).json({
  //         success: false,
  //         message: 'Telegram number is already verified'
  //       });
  //       return;
  //     }

  //     // Generate new OTP
  //     const otp = this.telegramService.generateOTP();
  //     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  //     // Update user with new OTP
  //     user.telegramOtp = otp;
  //     user.telegramOtpExpiry = otpExpiry;
  //     await user.save();

  //     // Send OTP via Telegram
  //     const otpSent = await this.telegramService.sendOTP(
  //       user.telegramNumber, 
  //       otp, 
  //       user.username
  //     );

  //     if (!otpSent) {
  //       res.status(500).json({
  //         success: false,
  //         message: 'Failed to send OTP. Please try again later.'
  //       });
  //       return;
  //     }

  //     console.log(`📱 OTP resent to: ${user.telegramNumber}`);

  //     res.json({
  //       success: true,
  //       message: 'OTP sent successfully to your Telegram number'
  //     });
  //   } catch (error) {
  //     console.error('Resend OTP error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to resend OTP',
  //       error: error instanceof Error ? error.message : 'Unknown error'
  //     });
  //   }
  // }

async login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // REMOVE THIS BLOCK - No telegram verification check for login
    /*
    // Check if telegram is verified
    if (!user.telegramVerified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your Telegram number before logging in',
        requiresTelegramVerification: true,
        user: {
          email: user.email,
          telegramNumber: user.telegramNumber
        }
      });
      return;
    }
    */

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log(`✅ User logged in: ${user.email} (${user.role})`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        telegramNumber: user.telegramNumber,
        // telegramVerified: user.telegramVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin or manager
      if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Admin or Manager access required'
        });
        return;
      }

      console.log(`🔍 ${req.user.role} fetching all users...`);

      const users = await User.find({}, '-password -telegramOtp -telegramOtpExpiry').sort({ createdAt: -1 });

      console.log(`📊 Found ${users.length} users`);

      res.json({
        success: true,
        data: users,
        message: `Found ${users.length} users`
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // NEW: Get public users - accessible to all authenticated users
  async getPublicUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      console.log(`🔍 User ${req.user.email} (${req.user.role}) fetching public users list...`);

      // Get all users but exclude sensitive information
      const users = await User.find({}, {
        password: 0,
        telegramOtp: 0,
        telegramOtpExpiry: 0,
        __v: 0,
      }).sort({ username: 1 });

      console.log(`📊 Found ${users.length} users for public access`);

      res.json({
        success: true,
        users: users,
        count: users.length,
        message: `Found ${users.length} users`
      });
    } catch (error) {
      console.error('Error fetching public users:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          telegramNumber: req.user.telegramNumber,
          // telegramVerified: req.user.telegramVerified
        }
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get current user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // NEW: Update user role - Admin only
  async updateUserRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Only admins can update user roles
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
        return;
      }

      const { userId, newRole } = req.body;

      if (!userId || !newRole) {
        res.status(400).json({
          success: false,
          message: 'User ID and new role are required'
        });
        return;
      }

      if (!['user', 'manager', 'admin'].includes(newRole)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role. Must be "user", "manager", or "admin"'
        });
        return;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true, select: '-password -telegramOtp -telegramOtpExpiry' }
      );

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      console.log(`✅ Admin ${req.user.email} updated ${user.email} role to ${newRole}`);

      res.json({
        success: true,
        message: `User role updated to ${newRole}`,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          telegramNumber: user.telegramNumber,
          // telegramVerified: user.telegramVerified
        }
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user role',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Add this method to your AuthController class
async getUserByEmail(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email } = req.params;
    
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
      return;
    }

    const user = await User.findOne({ email }).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    console.log(`🔍 Found user by email ${email}:`, {
      username: user.username,
      telegramNumber: user.telegramNumber,
      telegram: user.telegram,
      phone: user.phone
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        telegramNumber: user.telegramNumber,
        telegram: user.telegram,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

}
