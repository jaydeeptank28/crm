import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

/**
 * Auth Controller - Replicates Laravel's AuthenticatesUsers trait functionality
 * 
 * Laravel Logic Replicated:
 * 1. Validates email and password (required fields)
 * 2. Attempts authentication using email + password
 * 3. Checks if user is enabled (is_enable = true)
 * 4. Returns user data with role info for proper redirection
 * 5. Handles "remember me" - in JWT context, this means longer token expiry
 */

export const authController = {
    /**
     * Login user - Replicates Laravel's login() from AuthenticatesUsers
     * 
     * Laravel validation:
     * - email: required|string|email
     * - password: required|string
     * 
     * Laravel checks:
     * - User exists with given email
     * - Password matches (bcrypt compare)
     * - User is enabled (is_enable = true)
     * - Returns user with roles for redirect logic
     */
    login: async (req, res) => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array().reduce((acc, err) => {
                        acc[err.path] = err.msg;
                        return acc;
                    }, {})
                });
            }

            const { email, password, remember } = req.body;

            // Find user by email
            const user = await User.findOne({ where: { email } });

            // Check if user exists - Laravel returns "These credentials do not match our records."
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'These credentials do not match our records.',
                    errors: { email: ['These credentials do not match our records.'] }
                });
            }

            // Compare password - Laravel uses bcrypt
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'These credentials do not match our records.',
                    errors: { email: ['These credentials do not match our records.'] }
                });
            }

            // Check if user is enabled - Laravel's checkUserStatus middleware
            if (!user.is_enable) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been deactivated. Please contact administrator.',
                    errors: { email: ['Your account has been deactivated. Please contact administrator.'] }
                });
            }

            // Check if email is verified (if required) - Laravel's MustVerifyEmail
            // Uncomment below if email verification is required
            // if (!user.email_verified_at) {
            //   return res.status(403).json({
            //     success: false,
            //     message: 'Please verify your email address.',
            //     errors: { email: ['Please verify your email address.'] }
            //   });
            // }

            // Generate JWT token
            // Laravel's "remember" stores cookies for 3600 minutes (60 hours)
            // Without remember: session-based (we'll use 1 day)
            // With remember: 60 hours like Laravel
            const tokenExpiry = remember ? '60h' : '24h';

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    is_admin: user.is_admin
                },
                process.env.JWT_SECRET,
                { expiresIn: tokenExpiry }
            );

            // Get user data without password
            const userData = user.toJSON();

            // Laravel's sendLoginResponse determines redirect based on role
            // hasRole(['client']) -> CLIENT_HOME (/client/dashboard)
            // else -> ADMIN_HOME (/admin/dashboard)
            const redirectTo = user.is_admin ? '/admin/dashboard' : '/client/dashboard';

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userData,
                    token,
                    redirectTo,
                    remember: !!remember
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred during login',
                errors: { server: ['Internal server error'] }
            });
        }
    },

    /**
     * Logout user
     * In JWT context, we just tell client to remove token
     * Laravel clears session and cookies
     */
    logout: async (req, res) => {
        try {
            // In JWT, the client is responsible for removing the token
            // Server-side, we could maintain a blacklist if needed
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred during logout'
            });
        }
    },

    /**
     * Get current authenticated user
     * Replicates Laravel's Auth::user()
     */
    me: async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: {
                    user: user.toJSON()
                }
            });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred'
            });
        }
    }
};

export default authController;
