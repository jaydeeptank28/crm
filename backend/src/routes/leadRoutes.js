import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    getLeads,
    getLead,
    getFormData,
    createLead,
    updateLead,
    deleteLead,
    changeStatus,
    getKanbanData
} from '../controllers/leadController.js';
import {
    getLeadStatuses,
    createLeadStatus,
    updateLeadStatus,
    deleteLeadStatus
} from '../controllers/leadStatusController.js';
import {
    getLeadSources,
    getLeadSourcesPaginated,
    createLeadSource,
    updateLeadSource,
    deleteLeadSource
} from '../controllers/leadSourceController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Lead routes
router.get('/', getLeads);
router.get('/form-data', getFormData);
router.get('/kanban', getKanbanData);
router.get('/:id', getLead);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.patch('/:id/status/:statusId', changeStatus);

// Lead status routes
router.get('/statuses/all', getLeadStatuses);
router.post('/statuses', createLeadStatus);
router.put('/statuses/:id', updateLeadStatus);
router.delete('/statuses/:id', deleteLeadStatus);

// Lead source routes
router.get('/sources/all', getLeadSources);
router.get('/sources/paginated', getLeadSourcesPaginated);
router.post('/sources', createLeadSource);
router.put('/sources/:id', updateLeadSource);
router.delete('/sources/:id', deleteLeadSource);

export default router;
