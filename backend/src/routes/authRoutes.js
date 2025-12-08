import express from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authController.js';
import { authMiddleware, guestMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Auth Routes - Replicates Laravel's Auth::routes()
 * 
 * Laravel routes from Auth::routes(['verify' => true]):
 * POST /login - Login user
 * POST /logout - Logout user
 * POST /register - Register user
 * POST /password/email - Send password reset email
 * POST /password/reset - Reset password
 * GET /email/verify/{id}/{hash} - Verify email
 */

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Guest only
 * 
 * Laravel validation rules from AuthenticatesUsers trait:
 * - email: required|string
 * - password: required|string
 */
router.post('/login',
    guestMiddleware,
    [
        body('email')
            .notEmpty().withMessage('The email field is required.')
            .isEmail().withMessage('These credentials do not match our records.'),
        body('password')
            .notEmpty().withMessage('The password field is required.')
    ],
    authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Authenticated
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Authenticated
 */
router.get('/me', authMiddleware, authController.me);

export default router;
