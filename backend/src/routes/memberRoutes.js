/**
 * Member Routes - Replicates Laravel member routes with file upload support
 */

import express from 'express';
import {
    getMembers,
    getMember,
    createMember,
    updateMember,
    deleteMember,
    toggleMemberStatus,
    verifyMemberEmail,
    resendEmailVerification,
    uploadMemberImage,
    impersonateMember
} from '../controllers/memberController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadProfileImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// CRUD routes with optional image upload
router.get('/', getMembers);
router.get('/:id', getMember);
router.post('/', uploadProfileImage, createMember);
router.put('/:id', uploadProfileImage, updateMember);
router.delete('/:id', deleteMember);

// Action routes
router.patch('/:id/toggle-status', toggleMemberStatus);
router.post('/:id/verify-email', verifyMemberEmail);
router.post('/:id/resend-verification', resendEmailVerification);
router.post('/:id/upload-image', uploadProfileImage, uploadMemberImage);
router.post('/:id/impersonate', impersonateMember);

export default router;
