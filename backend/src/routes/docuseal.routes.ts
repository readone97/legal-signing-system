import { Router } from 'express';
import * as docusealController from '../controllers/docuseal.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/create-submission', asyncHandler(docusealController.createDocumentSubmission));
router.get('/embed', asyncHandler(docusealController.getEmbedInfo));
router.get('/submission-status', asyncHandler(docusealController.getSubmissionStatus));
router.get('/signed-documents', asyncHandler(docusealController.getSignedDocuments));

export default router;
