import express from 'express';
import * as customerController from '../controllers/customerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Customer routes
router.get('/', customerController.index);
router.get('/sync-data', customerController.getSyncData);
router.get('/search', customerController.search);
router.post('/', customerController.store);
router.get('/:id/edit', customerController.edit);
router.get('/:id', customerController.show);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.destroy);

export default router;
