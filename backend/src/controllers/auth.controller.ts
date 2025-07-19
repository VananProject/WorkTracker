
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';

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

      

      // Create user (not verified initially)
      const newUser = new User({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
       
        role: role || 'user'
      });

      await newUser.save();

      
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
async updateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    const { id } = req.params;
    const { username, email, password, telegramNumber, role } = req.body;

    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (telegramNumber) updateData.telegramNumber = telegramNumber;
    if (role) updateData.role = role;
    
    // Hash password if provided
    if (password) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
}

async deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }
    
    // Prevent admin from deleting themselves - Fix the comparison
    if (req.user._id.toString() === id.toString()) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
      return;
    }

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    console.log(`✅ Admin ${req.user.email} deleted user: ${user.email}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
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
