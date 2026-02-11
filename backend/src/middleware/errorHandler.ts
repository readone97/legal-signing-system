// import { Request, Response, NextFunction } from 'express';
// import { ZodError } from 'zod';

// export class AppError extends Error {
//   statusCode: number;
//   isOperational: boolean;

//   constructor(message: string, statusCode: number = 500) {
//     super(message);
//     this.statusCode = statusCode;
//     this.isOperational = true;

//     Error.captureStackTrace(this, this.constructor);
//   }
// }

// export const errorHandler = (
//   err: Error,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   // Zod validation errors
//   if (err instanceof ZodError) {
//     return res.status(400).json({
//       success: false,
//       message: 'Validation error',
//       errors: err.errors.map((e) => ({
//         field: e.path.join('.'),
//         message: e.message,
//       })),
//     });
//   }

//   // Application errors
//   if (err instanceof AppError) {
//     return res.status(err.statusCode).json({
//       success: false,
//       message: err.message,
//     });
//   }

//   // Prisma errors
//   if (err.constructor.name === 'PrismaClientKnownRequestError') {
//     const prismaError = err as any;
    
//     if (prismaError.code === 'P2002') {
//       return res.status(409).json({
//         success: false,
//         message: 'A record with this value already exists',
//       });
//     }

//     if (prismaError.code === 'P2025') {
//       return res.status(404).json({
//         success: false,
//         message: 'Record not found',
//       });
//     }
//   }

//   // Log error for debugging
//   console.error('Error:', err);

//   // Generic error response
//   res.status(500).json({
//     success: false,
//     message: process.env.NODE_ENV === 'production' 
//       ? 'Internal server error' 
//       : err.message,
//   });
// };
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,          // ← prefix with _ to mark as intentionally unused
  res: Response,
  _next: NextFunction     // ← same here
): void => {              // ← explicitly return void
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma errors (common known codes)
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any; // or better: import { Prisma } from '@prisma/client' and use Prisma.PrismaClientKnownRequestError

    if (prismaError.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A record with this value already exists',
      });
      return;
    }

    if (prismaError.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Record not found',
      });
      return;
    }
  }

  // Log error for debugging (always good to keep)
  console.error('Unhandled error:', err);

  // Generic fallback response — this is now the final path
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Something went wrong',
  });
};