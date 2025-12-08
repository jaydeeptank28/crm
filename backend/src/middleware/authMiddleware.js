import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Auth Middleware - Replicates Laravel's auth middleware
 * 
 * Laravel middleware checks:
 * 1. Valid authentication token exists
 * 2. User exists in database
 * 3. User is enabled (via checkUserStatus middleware)
 */

export const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthenticated.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthenticated.'
            });
        }

        // Check if user is enabled - Laravel's checkUserStatus middleware
        if (!user.is_enable) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact administrator.'
            });
        }

        // Attach user to request - like Laravel's Auth::user()
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

/**
 * Guest Middleware - Replicates Laravel's guest middleware
 * Used for routes that should only be accessible to non-authenticated users
 */
export const guestMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET);

            // User is authenticated, redirect them
            return res.status(403).json({
                success: false,
                message: 'You are already authenticated.'
            });
        } catch (error) {
            // Token invalid, continue as guest
            next();
        }
    } else {
        next();
    }
};

/**
 * Admin Middleware - Replicates Laravel's checkRoleUrl/admin middleware
 * Ensures user has admin privileges
 */
export const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

export default authMiddleware;
