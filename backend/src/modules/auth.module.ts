import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';

export class AuthModule {
  private static instance: AuthModule;
  private authController: AuthController;
  private authService: AuthService;
  private userRepository: UserRepository;

  private constructor() {
    this.userRepository = new UserRepository();
    this.authService = new AuthService();
    this.authController = new AuthController();
  }

  public static getInstance(): AuthModule {
    if (!AuthModule.instance) {
      AuthModule.instance = new AuthModule();
    }
    return AuthModule.instance;
  }

  public getController(): AuthController {
    return this.authController;
  }

  public getService(): AuthService {
    return this.authService;
  }

  public getRepository(): UserRepository {
    return this.userRepository;
  }
}
