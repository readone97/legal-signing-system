# Legal Signing System - Architecture Documentation

## System Overview

The Legal Signing System is a full-stack web application designed to facilitate secure, legally binding document signing workflows with notary support. The system follows a three-tier architecture with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React 18 + TypeScript Frontend                      │   │
│  │  - TailwindCSS (pastel theme)                        │   │
│  │  - React Router (navigation)                         │   │
│  │  - Axios (HTTP client)                               │   │
│  │  - React Hook Form (forms)                           │   │
│  │  - Signature Canvas (signatures)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Node.js + Express API Server                        │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Controllers                                    │  │   │
│  │  │  - Auth Controller                              │  │   │
│  │  │  - Document Controller                          │  │   │
│  │  │  - Signature Controller                         │  │   │
│  │  │  - Notary Controller                            │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Services                                       │  │   │
│  │  │  - Email Service (Nodemailer)                   │  │   │
│  │  │  - PDF Service (Puppeteer)                      │  │   │
│  │  │  - Audit Service                                │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Middleware                                     │  │   │
│  │  │  - JWT Authentication                           │  │   │
│  │  │  - Role-Based Authorization                     │  │   │
│  │  │  - Input Validation (Zod)                       │  │   │
│  │  │  - Error Handler                                │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Prisma ORM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                 │   │
│  │  - Users                                             │   │
│  │  - Documents                                         │   │
│  │  - Signatures                                        │   │
│  │  - Audit Logs                                        │   │
│  │  - Document Revisions                                │   │
│  │  - Refresh Tokens                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Email**: Nodemailer
- **PDF Generation**: Puppeteer
- **Security**: Helmet, bcryptjs, CORS

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Signatures**: React Signature Canvas
- **Notifications**: React Toastify
- **Build Tool**: Vite

## Data Model

### Core Entities

#### User
```typescript
{
  id: string (UUID)
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  role: PARTY_A | PARTY_B | NOTARY | ADMIN
  phoneNumber: string?
  notaryLicense: string? (for notaries)
  notaryState: string? (for notaries)
  notaryExpiration: Date? (for notaries)
  isEmailVerified: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### Document
```typescript
{
  id: string (UUID)
  title: string
  documentType: string
  status: DRAFT | PENDING_PARTY_B | PENDING_NOTARY | COMPLETED | CANCELLED
  version: number
  partyAId: string (FK to User)
  partyBId: string? (FK to User)
  notaryId: string? (FK to User)
  templateFields: JSON (field definitions)
  fieldValues: JSON (filled values)
  partyASignedAt: Date?
  partyBSignedAt: Date?
  notarizedAt: Date?
  completedAt: Date?
  pdfUrl: string?
  certificateUrl: string?
  createdAt: Date
  updatedAt: Date
}
```

#### Signature
```typescript
{
  id: string (UUID)
  documentId: string (FK to Document)
  userId: string (FK to User)
  signatureType: DRAW | TYPE | UPLOAD
  signatureData: string (base64 encoded)
  ipAddress: string
  userAgent: string?
  createdAt: Date
}
```

#### AuditLog
```typescript
{
  id: string (UUID)
  action: DOCUMENT_CREATED | DOCUMENT_UPDATED | SIGNATURE_ADDED | etc.
  userId: string? (FK to User)
  documentId: string? (FK to Document)
  ipAddress: string
  userAgent: string?
  metadata: JSON?
  createdAt: Date
}
```

## Authentication & Authorization

### Authentication Flow
1. User submits credentials (email + password)
2. Server validates credentials
3. Server generates:
   - Access Token (JWT, 15min expiry)
   - Refresh Token (JWT, 7 day expiry, stored in DB)
4. Client stores both tokens
5. Client includes Access Token in Authorization header
6. When Access Token expires, client uses Refresh Token to get new Access Token

### Authorization Model
- **Role-Based Access Control (RBAC)**
- Roles: PARTY_A, PARTY_B, NOTARY, ADMIN
- Document access controlled by party relationships
- Notary endpoints restricted to NOTARY role

## Document Workflow

### State Machine

```
DRAFT
  ↓ (Party A sends to Party B)
PENDING_PARTY_B
  ↓ (Both parties sign)
PENDING_NOTARY
  ↓ (Notary completes)
COMPLETED
```

### Workflow Steps

1. **Document Creation** (Party A)
   - Create document from template
   - Fill in field values
   - Save as DRAFT

2. **Send to Party B**
   - Party A invites Party B (by email)
   - Status → PENDING_PARTY_B
   - Email notification sent to Party B

3. **Party B Review & Sign**
   - Party B reviews document
   - Party B adds signature
   - If both parties signed → status → PENDING_NOTARY

4. **Send to Notary**
   - Either party assigns a notary
   - Email notification sent to notary

5. **Notarization**
   - Notary verifies identities
   - Notary reviews signatures
   - Notary adds seal/signature
   - Status → COMPLETED
   - PDF generated
   - Completion emails sent to all parties

## Security Features

### Input Validation
- All API endpoints use Zod schemas
- SQL injection prevented by Prisma ORM
- XSS protection via sanitization

### Password Security
- Bcrypt hashing (10 rounds)
- Strong password requirements:
  - Minimum 8 characters
  - Uppercase + lowercase + number

### Token Security
- JWT with HS256 algorithm
- Short-lived access tokens (15min)
- Refresh token rotation
- Tokens invalidated on logout

### File Upload Security
- File type validation (PNG, JPG, JPEG only)
- File size limit (10MB)
- Sanitized filenames
- Organized storage structure

### Audit Trail
- Complete activity logging
- IP address tracking
- User agent logging
- Immutable audit records

## API Design

### RESTful Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

#### Documents
- `POST /api/documents` - Create document
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document details
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/send-to-party-b` - Send to Party B
- `POST /api/documents/:id/send-to-notary` - Send to notary

#### Signatures
- `POST /api/signatures/:documentId` - Add signature
- `GET /api/signatures/:documentId` - Get document signatures

#### Notary
- `GET /api/notary/pending` - Get pending documents
- `POST /api/notary/:documentId/notarize` - Notarize document
- `GET /api/notary/stats` - Get notary statistics

#### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/notaries` - Get available notaries

### Response Format

Success:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ] // for validation errors
}
```

## Email Notifications

### Email Templates
1. **Welcome Email** - Account creation
2. **Document Invitation** - Party B invited
3. **Signature Reminder** - Pending signatures
4. **Notarization Ready** - Document ready for notary
5. **Document Completed** - Execution confirmation

### Email Configuration
- SMTP with Nodemailer
- Supports Gmail, SendGrid, custom SMTP
- HTML templates with responsive design
- Async sending (non-blocking)

## Deployment Architecture

### Production Setup

```
Internet
   ↓
Nginx (Reverse Proxy)
   ↓
┌─────────────────────────────┐
│  Frontend (Static Files)    │
│  Served via Nginx           │
└─────────────────────────────┘
   ↓
┌─────────────────────────────┐
│  Backend API (Node.js)      │
│  Process Manager: PM2       │
└─────────────────────────────┘
   ↓
┌─────────────────────────────┐
│  PostgreSQL Database        │
│  With backups & replication │
└─────────────────────────────┘
```

### Infrastructure Requirements
- **Server**: Ubuntu 20.04+ or similar
- **RAM**: Minimum 2GB
- **Storage**: Minimum 20GB SSD
- **Node.js**: 18+
- **PostgreSQL**: 14+
- **SSL**: Required (Let's Encrypt recommended)

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields
- Connection pooling via Prisma
- Query optimization with select statements

### Caching Strategy
- JWT tokens cached in client
- Static assets with long cache times
- API response caching for public data

### Scalability
- Stateless API design (horizontal scaling)
- Database connection pooling
- Async email and PDF generation
- File storage can move to S3/CDN

## Monitoring & Logging

### Application Logging
- Morgan HTTP request logging
- Winston for application logs
- Error tracking and alerting

### Metrics
- API response times
- Database query performance
- Email delivery rates
- Document completion rates

## Future Enhancements

1. **Multi-language Support** - i18n for global users
2. **Mobile Apps** - React Native applications
3. **Blockchain Integration** - Immutable document records
4. **Advanced Templates** - Custom template builder
5. **API Rate Limiting** - DDoS protection
6. **Two-Factor Authentication** - Enhanced security
7. **Document Analytics** - Usage statistics and insights
8. **Webhook Support** - Event notifications for integrations

## Compliance & Legal

### Data Protection
- GDPR compliant data handling
- Right to be forgotten support
- Data export functionality

### Electronic Signatures
- Complies with ESIGN Act
- Audit trail requirements met
- Timestamp integrity maintained

### Notarization
- State-specific notary requirements
- License validation
- Seal placement standards

---

For more detailed information, refer to:
- [API Documentation](./API_DOCS.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [README](../README.md)
