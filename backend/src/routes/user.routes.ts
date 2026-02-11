// import { Router } from 'express';
// import { authenticate } from '../middleware/auth.middleware';
// import { asyncHandler } from '../utils/asyncHandler';
// import { Request, Response } from 'express';
// import { AuthRequest } from '../middleware/auth.middleware';
// import { PrismaClient } from '@prisma/client';

// const router = Router();
// const prisma = new PrismaClient();

// router.use(authenticate);

// router.get('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
//   const user = await prisma.user.findUnique({
//     where: { id: req.user!.id },
//     select: {
//       id: true,
//       email: true,
//       firstName: true,
//       lastName: true,
//       role: true,
//       phoneNumber: true,
//       notaryLicense: true,
//       notaryState: true,
//       notaryExpiration: true,
//       isEmailVerified: true,
//       createdAt: true,
//     },
//   });

//   res.json({
//     success: true,
//     data: user,
//   });
// }));

// router.get('/notaries', asyncHandler(async (req: Request, res: Response) => {
//   const notaries = await prisma.user.findMany({
//     where: { 
//       role: 'NOTARY',
//       isActive: true,
//     },
//     select: {
//       id: true,
//       email: true,
//       firstName: true,
//       lastName: true,
//       notaryLicense: true,
//       notaryState: true,
//       notaryExpiration: true,
//     },
//   });

//   res.json({
//     success: true,
//     data: notaries,
//   });
// }));

// export default router;
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { Response } from 'express';           // ← can remove Request if not used
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// All routes below this are protected
router.use(authenticate);

// Get current user profile
router.get('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },           // ← safe because authenticate sets it
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phoneNumber: true,
      notaryLicense: true,
      notaryState: true,
      notaryExpiration: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
}));

// Get list of active notaries (publicly visible info)
router.get('/notaries', asyncHandler(async (_req, res: Response) => {
  const notaries = await prisma.user.findMany({
    where: { 
      role: 'NOTARY',
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      notaryLicense: true,
      notaryState: true,
      notaryExpiration: true,
    },
  });

  res.json({
    success: true,
    data: notaries,
  });
}));

export default router;