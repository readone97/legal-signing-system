export enum UserRole {
  PARTY_A = 'PARTY_A',
  PARTY_B = 'PARTY_B',
  NOTARY = 'NOTARY',
  ADMIN = 'ADMIN',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PENDING_PARTY_B = 'PENDING_PARTY_B',
  PENDING_NOTARY = 'PENDING_NOTARY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum SignatureType {
  DRAW = 'DRAW',
  TYPE = 'TYPE',
  UPLOAD = 'UPLOAD',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  notaryLicense?: string;
  notaryState?: string;
  notaryExpiration?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  documentType: string;
  status: DocumentStatus;
  version: number;
  partyAId: string;
  partyBId?: string;
  notaryId?: string;
  templateFields: any;
  fieldValues: any;
  partyASignedAt?: string;
  partyBSignedAt?: string;
  notarizedAt?: string;
  completedAt?: string;
  pdfUrl?: string;
  certificateUrl?: string;
  createdAt: string;
  updatedAt: string;
  partyA?: User;
  partyB?: User;
  notary?: User;
  signatures?: Signature[];
  revisions?: DocumentRevision[];
}

export interface Signature {
  id: string;
  documentId: string;
  userId: string;
  signatureType: SignatureType;
  signatureData: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
  user?: User;
}

export interface DocumentRevision {
  id: string;
  documentId: string;
  version: number;
  fieldValues: any;
  changedBy: string;
  changeNote?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
