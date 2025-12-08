import express from 'express';
import { getDashboardStats, contractMonthFilter } from '../controllers/dashboardController.js';
import { authMiddleware as protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Main dashboard stats endpoint
router.get('/dashboard', protect, getDashboardStats);

// Contract month filter - matches Laravel DashboardController@contractMonthFilter
router.get('/contracts/filter', protect, contractMonthFilter);

export default router;
