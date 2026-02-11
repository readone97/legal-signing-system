# API Documentation

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PARTY_A",
  "phoneNumber": "+1-555-0101"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PARTY_A",
      "createdAt": "2024-01-15T10:00:00Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PARTY_A"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

#### Logout
```http
POST /auth/logout
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Documents

#### Create Document
```http
POST /documents
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Prenuptial Agreement - Smith & Johnson",
  "documentType": "PRENUPTIAL_AGREEMENT",
  "templateFields": {
    "fields": [
      {
        "id": "partyAFullName",
        "label": "Party A Full Legal Name",
        "type": "text",
        "required": true
      }
    ]
  },
  "fieldValues": {
    "partyAFullName": "John Doe"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Document created successfully",
  "data": {
    "id": "uuid",
    "title": "Prenuptial Agreement - Smith & Johnson",
    "status": "DRAFT",
    "partyA": { ... },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### List Documents
```http
GET /documents?status=DRAFT&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "title": "Document Title",
        "status": "DRAFT",
        "partyA": { ... },
        "partyB": { ... },
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### Get Document
```http
GET /documents/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Document Title",
    "status": "COMPLETED",
    "templateFields": { ... },
    "fieldValues": { ... },
    "partyA": { ... },
    "partyB": { ... },
    "notary": { ... },
    "signatures": [
      {
        "id": "uuid",
        "user": { ... },
        "signatureType": "DRAW",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "revisions": [ ... ],
    "partyASignedAt": "2024-01-15T10:00:00Z",
    "partyBSignedAt": "2024-01-16T11:00:00Z",
    "notarizedAt": "2024-01-17T09:00:00Z",
    "completedAt": "2024-01-17T09:00:00Z"
  }
}
```

#### Update Document
```http
PUT /documents/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "fieldValues": {
    "partyAFullName": "John Doe Updated"
  }
}
```

**Response:** `200 OK`

#### Delete Document
```http
DELETE /documents/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

#### Send to Party B
```http
POST /documents/:id/send-to-party-b
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "partyBEmail": "partyb@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Document sent to Party B successfully",
  "data": { ... }
}
```

#### Send to Notary
```http
POST /documents/:id/send-to-notary
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "notaryId": "uuid"
}
```

**Response:** `200 OK`

---

### Signatures

#### Add Signature
```http
POST /signatures/:documentId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "signatureType": "DRAW",
  "signatureData": "data:image/png;base64,iVBORw0KG..."
}
```

**Signature Types:**
- `DRAW`: Hand-drawn signature (canvas)
- `TYPE`: Typed signature text
- `UPLOAD`: Uploaded signature image

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Signature added successfully",
  "data": {
    "id": "uuid",
    "documentId": "uuid",
    "userId": "uuid",
    "signatureType": "DRAW",
    "ipAddress": "192.168.1.1",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Get Document Signatures
```http
GET /signatures/:documentId
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "PARTY_A"
      },
      "signatureType": "DRAW",
      "signatureData": "data:image/png;base64,...",
      "ipAddress": "192.168.1.1",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### Notary

#### Get Pending Documents
```http
GET /notary/pending
Authorization: Bearer <token>
Role: NOTARY
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Document Title",
      "status": "PENDING_NOTARY",
      "partyA": { ... },
      "partyB": { ... },
      "signatures": [ ... ],
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Notarize Document
```http
POST /notary/:documentId/notarize
Authorization: Bearer <token>
Role: NOTARY
```

**Request Body:**
```json
{
  "signatureType": "UPLOAD",
  "signatureData": "data:image/png;base64,...",
  "verificationNotes": "Identity verified via driver's license"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Document notarized successfully",
  "data": {
    "id": "uuid",
    "status": "COMPLETED",
    "notarizedAt": "2024-01-17T09:00:00Z",
    "completedAt": "2024-01-17T09:00:00Z"
  }
}
```

#### Get Notary Stats
```http
GET /notary/stats
Authorization: Bearer <token>
Role: NOTARY
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "pending": 5,
    "completed": 23,
    "total": 28
  }
}
```

---

### Users

#### Get Current User
```http
GET /users/me
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PARTY_A",
    "phoneNumber": "+1-555-0101",
    "isEmailVerified": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Get Available Notaries
```http
GET /users/notaries
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "notary@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "notaryLicense": "NOT-12345-CA",
      "notaryState": "California",
      "notaryExpiration": "2026-12-31T00:00:00Z"
    }
  ]
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Headers**:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Webhooks (Future Feature)

Future versions will support webhooks for real-time event notifications:

- `document.created`
- `document.sent`
- `signature.added`
- `document.notarized`
- `document.completed`

---

For implementation details, see [ARCHITECTURE.md](./ARCHITECTURE.md)
