import { Router } from 'express';
import * as signatureController from '../controllers/signature.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/:documentId', asyncHandler(signatureController.addSignature));
router.get('/:documentId', asyncHandler(signatureController.getDocumentSignatures));

export default router;
