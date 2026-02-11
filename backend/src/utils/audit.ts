import { PrismaClient, AuditAction } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditLogData {
  action: AuditAction;
  userId?: string;
  documentId?: string;
  ipAddress: string;
  userAgent?: string;
  metadata?: any;
}

export const createAuditLog = async (data: AuditLogData) => {
  return await prisma.auditLog.create({
    data,
  });
};
