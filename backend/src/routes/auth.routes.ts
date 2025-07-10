// // import { Router } from 'express';
// // import { AuthController } from '../controllers/auth.controller';
// // import { authenticateToken, requireAdmin, requireManagerOrAdmin } from '../middleware/auth.middleware';

// // const router = Router();
// // const authController = new AuthController();

// // // Public routes
// // router.post('/signup', authController.signup.bind(authController));
// // router.post('/login', authController.login.bind(authController));

// // // Protected routes
// // router.get('/users', authenticateToken, requireManagerOrAdmin, authController.getUsers.bind(authController));
// // router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));

// // // Public users endpoint - accessible to all authenticated users
// // router.get('/users/public', authenticateToken, authController.getPublicUsers.bind(authController));

// // // Admin only routes
// // router.put('/users/role', authenticateToken, requireAdmin, authController.updateUserRole.bind(authController));

// // export default router;
// import { Router } from 'express';
// import { AuthController } from '../controllers/auth.controller';
// import { authenticateToken, requireAdmin, requireManagerOrAdmin } from '../middleware/auth.middleware';

// const router = Router();
// const authController = new AuthController();

// // Public routes
// router.post('/signup', authController.signup.bind(authController));
// router.post('/login', authController.login.bind(authController));

// // Telegram OTP routes
// // router.post('/verify-telegram-otp', authController.verifyTelegramOtp.bind(authController));
// // router.post('/resend-telegram-otp', authController.resendTelegramOtp.bind(authController));

// // Protected routes
// router.get('/users', authenticateToken, requireManagerOrAdmin, authController.getUsers.bind(authController));
// router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));

// // Public users endpoint - accessible to all authenticated users
// router.get('/users/public', authenticateToken, authController.getPublicUsers.bind(authController));

// // Admin only routes
// router.put('/users/role', authenticateToken, requireAdmin, authController.updateUserRole.bind(authController));

// export default router;
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken, requireAdmin, requireManagerOrAdmin } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));

// Protected routes
router.get('/users', authenticateToken, requireManagerOrAdmin, authController.getUsers.bind(authController));
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));

// Public users endpoint - accessible to all authenticated users
router.get('/users/public', authenticateToken, authController.getPublicUsers.bind(authController));

// ✅ Add user by email endpoint
router.get('/users/email/:email', authenticateToken, authController.getUserByEmail.bind(authController));

// Admin only routes
router.put('/users/role', authenticateToken, requireAdmin, authController.updateUserRole.bind(authController));

export default router;
