import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    getAllTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
    getKanbanData,
    getStatusCount,
    getMembers,
    getConstants
} from '../controllers/taskController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Static routes (MUST be before /:id to avoid wildcard matching)
router.get('/kanban', getKanbanData);
router.get('/status-count', getStatusCount);
router.get('/members', getMembers);
router.get('/constants', getConstants);

// Task CRUD routes
router.get('/', getAllTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status/:status', changeStatus);
router.get('/:id', getTask);  // MUST be last - wildcard catches all

export default router;
