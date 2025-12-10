import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    index,
    show,
    edit,
    store,
    update,
    destroy,
    getSyncData,
    memberAsPerCustomer
} from '../controllers/projectController.js';

const router = express.Router();

// All routes protected
router.use(authMiddleware);

// Sync data for forms
router.get('/sync-data', getSyncData);

// Members by customer
router.get('/members-by-customer', memberAsPerCustomer);

// CRUD routes
router.get('/', index);
router.get('/:id', show);
router.get('/:id/edit', edit);
router.post('/', store);
router.put('/:id', update);
router.delete('/:id', destroy);

export default router;
