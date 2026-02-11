// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { config } from '../config';
// import { PrismaClient, UserRole } from '@prisma/client';

// const prisma = new PrismaClient();

// export interface AuthRequest extends Request {
//   user?: {
//     id: string;
//     email: string;
//     role: UserRole;
//   };
// }

// export const authenticate = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({
//         success: false,
//         message: 'No token provided',
//       });
//     }

//     const token = authHeader.substring(7);

//     const decoded = jwt.verify(token, config.jwt.secret) as {
//       id: string;
//       email: string;
//       role: UserRole;
//     };

//     // Verify user still exists and is active
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.id },
//       select: { id: true, email: true, role: true, isActive: true },
//     });

//     if (!user || !user.isActive) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not found or inactive',
//       });
//     }

//     req.user = {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//     };

//     next();
//   } catch (error) {
//     if (error instanceof jwt.TokenExpiredError) {
//       return res.status(401).json({
//         success: false,
//         message: 'Token expired',
//       });
//     }

//     if (error instanceof jwt.JsonWebTokenError) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token',
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: 'Authentication error',
//     });
//   }
// };

// export const authorize = (...roles: UserRole[]) => {
//   return (req: AuthRequest, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Not authenticated',
//       });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Insufficient permissions',
//       });
//     }

//     next();
//   };
// };
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return; // ← short-circuit: send response + exit function
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: UserRole;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
    return; // ← satisfies noImplicitReturns
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
    return;
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
    return;
  };
};