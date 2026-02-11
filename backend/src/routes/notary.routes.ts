import { Router } from 'express';
import * as notaryController from '../controllers/notary.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);
router.use(authorize('NOTARY'));

router.get('/pending', asyncHandler(notaryController.getPendingDocuments));
router.post('/:documentId/notarize', asyncHandler(notaryController.notarizeDocument));
router.get('/stats', asyncHandler(notaryController.getNotaryStats));

export default router;
