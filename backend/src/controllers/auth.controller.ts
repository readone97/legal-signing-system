import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from "jsonwebtoken";
import type { SignOptions } from 'jsonwebtoken';

import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../utils/audit';
import { sendWelcomeEmail } from '../services/email.service';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
        phoneNumber: validatedData.phoneNumber,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // Create audit log
    await createAuditLog({
      action: 'USER_LOGIN',
      userId: user.id,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent'),
      metadata: { event: 'registration' },
    });

    // Send welcome email (don't wait for it)
    sendWelcomeEmail(user.email, user.firstName).catch(console.error);

    // Generate tokens
    // const accessToken = jwt.sign(
    //   { id: user.id, email: user.email, role: user.role },
    //   config.jwt.secret,
    //   { expiresIn: config.jwt.expiresIn }
    // );

  const accessToken = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  config.jwt.secret,
  { expiresIn: config.jwt.expiresIn } as SignOptions   
);


    // const refreshToken = jwt.sign(
    //   { id: user.id },
    //   config.jwt.refreshSecret,
    //   { expiresIn: config.jwt.refreshExpiresIn }
    // );

    const refreshToken = jwt.sign(
  { id: user.id },
  config.jwt.refreshSecret,
  { expiresIn: config.jwt.refreshExpiresIn }   as SignOptions   
);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is inactive', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Create audit log
    await createAuditLog({
      action: 'USER_LOGIN',
      userId: user.id,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent'),
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }  as SignOptions   
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as SignOptions   
    );

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phoneNumber: user.phoneNumber,
          notaryLicense: user.notaryLicense,
          notaryState: user.notaryState,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const validatedData = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    // const decoded = jwt.verify(
    //   validatedData.refreshToken,
    //   config.jwt.refreshSecret
    // ) as { id: string };

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: validatedData.refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (storedToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new AppError('Refresh token expired', 401);
    }

    if (!storedToken.user.isActive) {
      throw new AppError('Account is inactive', 403);
    }

    // Generate new access token
    const accessToken = jwt.sign(
      {
        id: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions   
    );

    res.json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid refresh token', 401);
    }
    throw error;
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const validatedData = refreshTokenSchema.parse(req.body);

    // Delete refresh token
    await prisma.refreshToken.deleteMany({
      where: { token: validatedData.refreshToken },
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    throw error;
  }
};
