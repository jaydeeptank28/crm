import express from 'express';
import * as customerGroupController from '../controllers/customerGroupController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Customer Group routes
router.get('/', customerGroupController.index);
router.post('/', customerGroupController.store);
router.get('/:id', customerGroupController.edit);
router.put('/:id', customerGroupController.update);
router.delete('/:id', customerGroupController.destroy);

export default router;
