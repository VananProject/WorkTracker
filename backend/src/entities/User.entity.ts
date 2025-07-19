
export interface SafeUser {
  id?: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'manager';
  telegramNumber?: string;
  // telegramVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  _id: any;
  static find(arg0: {}, arg1: string) {
    throw new Error('Method not implemented.');
  }
  static findOne(arg0: { email: any; }) {
    throw new Error('Method not implemented.');
  }
  id?: string;
  username: string;
  email: string;
  password?: string;
  role: string;
  telegramNumber?: string;
  
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<User>) {
    this.id = data.id;
    this.username = data.username || '';
    this.email = data.email || '';
    this.password = data.password;
    this.role = data.role || 'user';
    this.telegramNumber = data.telegramNumber;
   
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toSafeObject(): Omit<User, 'password' | 'telegramOtp' | 'telegramOtpExpiry'> {
    const safeUser = new User({
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      telegramNumber: this.telegramNumber,
      // telegramVerified: this.telegramVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    });
    return safeUser;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.role === 'admin';
  }

  // Check if user is manager
  isManager(): boolean {
    return this.role === 'manager';
  }

  // Check if user has admin or manager privileges
  hasAdminPrivileges(): boolean {
    return this.role === 'admin' || this.role === 'manager';
  }

  

  // Get display name
  getDisplayName(): string {
    return this.username || this.email;
  }

  // Alternative method that returns the expected type for DTO compatibility
  toSafeUserForDto(): Omit<User, 'password' > {
    return this.toSafeObject();
  }

  save(): void {
    // Implementation would go here
  }
}
