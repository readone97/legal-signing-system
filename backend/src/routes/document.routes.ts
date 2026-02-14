import { Router } from 'express';
import * as documentController from '../controllers/document.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/', asyncHandler(documentController.createDocument));
router.get('/', asyncHandler(documentController.getDocuments));
router.get('/:id/download', asyncHandler(documentController.downloadDocument));
router.get('/:id', asyncHandler(documentController.getDocument));
router.put('/:id', asyncHandler(documentController.updateDocument));
router.delete('/:id', asyncHandler(documentController.deleteDocument));
router.post('/:id/send-to-party-b', asyncHandler(documentController.sendToPartyB));
router.post('/:id/send-to-notary', asyncHandler(documentController.sendToNotary));

export default router;
