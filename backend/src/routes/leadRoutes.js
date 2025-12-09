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
    getKanbanData,
    getChartData
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

// Lead status routes (MUST be before /:id to avoid wildcard matching)
router.get('/statuses/all', getLeadStatuses);
router.post('/statuses', createLeadStatus);
router.put('/statuses/:id', updateLeadStatus);
router.delete('/statuses/:id', deleteLeadStatus);

// Lead source routes (MUST be before /:id to avoid wildcard matching)
router.get('/sources/all', getLeadSources);
router.get('/sources/paginated', getLeadSourcesPaginated);
router.post('/sources', createLeadSource);
router.put('/sources/:id', updateLeadSource);
router.delete('/sources/:id', deleteLeadSource);

// Lead routes
router.get('/', getLeads);
router.get('/form-data', getFormData);
router.get('/kanban', getKanbanData);
router.get('/chart-data', getChartData);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.patch('/:id/status/:statusId', changeStatus);
router.get('/:id', getLead);  // MUST be last - wildcard catches all

export default router;
