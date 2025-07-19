
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'manager' | 'admin';
   telegram?: string; // ADD THIS LINE
  telegramNumber?: string; // ADD THIS LINE  
  phone?: string; // ADD THIS LINE
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'manager', 'admin'],
    default: 'user'
  },
  telegram: {
    type: String,
    required: false,
    trim: true
  },
  telegramNumber: {
    type: String,
    required: false,
    trim: true
  },
  phone: {
    type: String,
    required: false,
    trim: true
  }
  
}, {
  timestamps: true
});

// Index for OTP cleanup
UserSchema.index({ telegramOtpExpiry: 1 }, { expireAfterSeconds: 0 });

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
