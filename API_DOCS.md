# API Documentation – Prenup Sign

Base URL: http://localhost:3000/api (or production domain)

All protected endpoints require JWT Bearer token in Authorization header.

## Authentication

**POST /api/auth/[...nextauth]**
- Handles login/register via NextAuth credentials flow
- No direct documentation needed (handled by NextAuth)

## Documents

**POST /api/documents/create**
- Body: `{ title: string, fields: array }`
- Response 200: `{ id: number, title: string, status: string, ... }`
- 401 Unauthorized if not Party A

**POST /api/documents/invite**
- Body: `{ documentId: number, inviteeEmail: string, role: "PARTY_B" | "NOTARY" }`
- Sends email with DocuSeal signing link
- 200: `{ success: true }`

**GET /api/documents/status/[id]**
- Returns full document object with signatures & audit logs
- 200: Document JSON

**POST /api/webhooks/docuseal**
- DocuSeal webhook receiver (signed, completed events)
- Verifies signature → updates status, audit, sends emails, Pusher events

## Files

**POST /api/files/upload**
- FormData: file (PNG/JPG <10MB), documentId, purpose ("signature"|"id-proof")
- Returns: `{ url: string }` (private S3 signed URL)

## Notary

**POST /api/notary/verify**
- Body: `{ documentId: number, idVerified: bool, addressVerified: bool, ... }`
- Marks document as COMPLETED if all checks pass
- 200: `{ success: true }`

## API Documentation UI

Visit http://localhost:3000/api-docs for interactive Swagger UI (when enabled).