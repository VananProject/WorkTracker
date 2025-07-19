
import { User as UserEntity } from '../entities/User.entity';

// Import the Mongoose model (JavaScript)
const UserModel = require('../models/User');

export class UserRepository {
  async findAll(): Promise<UserEntity[]> {
    try {
      const users = await UserModel.find({}, 'username email role telegramNumber telegramVerified createdAt').sort({ createdAt: -1 });
      return users.map((user: any) => this.mapToEntity(user));
    } catch (error: any) {
      throw new Error(`Failed to find all users: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const user = await UserModel.findOne({ email });
      return user ? this.mapToEntity(user) : null;
    } catch (error: any) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    try {
      const user = await UserModel.findOne({ email }).select('+password');
      return user ? this.mapToEntity(user) : null;
    } catch (error: any) {
      throw new Error(`Failed to find user by email with password: ${error.message}`);
    }
  }

  async findByEmailOrUsername(email: string, username: string): Promise<UserEntity | null> {
    try {
      const user = await UserModel.findOne({ $or: [{ email }, { username }] });
      return user ? this.mapToEntity(user) : null;
    } catch (error: any) {
      throw new Error(`Failed to find user by email or username: ${error.message}`);
    }
  }

  async findByTelegramNumber(telegramNumber: string): Promise<UserEntity | null> {
    try {
      const user = await UserModel.findOne({ telegramNumber });
      return user ? this.mapToEntity(user) : null;
    } catch (error: any) {
      throw new Error(`Failed to find user by telegram number: ${error.message}`);
    }
  }

  async findByEmailWithOtp(email: string): Promise<UserEntity | null> {
    try {
      const user = await UserModel.findOne({ email }).select('+telegramOtp +telegramOtpExpiry');
      return user ? this.mapToEntity(user) : null;
    } catch (error: any) {
      throw new Error(`Failed to find user by email with OTP: ${error.message}`);
    }
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    try {
      const user = new UserModel({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        telegramNumber: userData.telegramNumber,
       
        role: userData.role || 'user'
      });
      const savedUser = await user.save();
      return this.mapToEntity(savedUser);
    } catch (error: any) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateTelegramVerification(email: string, verified: boolean, otp?: string, otpExpiry?: Date): Promise<UserEntity | null> {
    try {
      const updateData: any = { telegramVerified: verified };
      
      if (otp !== undefined) {
        updateData.telegramOtp = otp;
      }
      
      if (otpExpiry !== undefined) {
        updateData.telegramOtpExpiry = otpExpiry;
      }
      
      // Clear OTP fields when verifying
      if (verified) {
        updateData.$unset = { telegramOtp: 1, telegramOtpExpiry: 1 };
      }

      const user = await UserModel.findOneAndUpdate(
        { email },
        updateData,
        { new: true }
      );
      return user ? this.mapToEntity(user) : null;
    } catch (error: any) {
      throw new Error(`Failed to update telegram verification: ${error.message}`);
    }
  }

  async updateRole(email: string, role: string): Promise<UserEntity | null> {
    try {
      const user = await UserModel.findOneAndUpdate(
        { email },
        { role },
        { new: true }
      );
      return user ? this.mapToEntity(user) : null;
    } catch (error: any) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  async comparePassword(user: UserEntity, password: string): Promise<boolean> {
    try {
      const dbUser = await UserModel.findById(user.id);
      return dbUser ? await dbUser.comparePassword(password) : false;
    } catch (error: any) {
      throw new Error(`Failed to compare password: ${error.message}`);
    }
  }
async updateById(id: string, updateData: Partial<UserEntity>): Promise<UserEntity | null> {
  try {
    const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    return user ? this.mapToEntity(user) : null;
  } catch (error: any) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

async deleteById(id: string): Promise<boolean> {
  try {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  } catch (error: any) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}

  private mapToEntity(userDoc: any): UserEntity {
    return new UserEntity({
      id: userDoc._id?.toString(),
      username: userDoc.username,
      email: userDoc.email,
      password: userDoc.password,
      role: userDoc.role,
      telegramNumber: userDoc.telegramNumber,
      
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt
    });
  }
}
