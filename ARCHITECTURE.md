### 2. ARCHITECTURE.md

```markdown
# Architecture Overview

## High-Level System Design
[User Browser] <--> [Next.js App (localhost:3000)]
│
┌─────────────────┼─────────────────┐
│                 │                 │
[NextAuth.js]     [Prisma → Local PostgreSQL]   [DocuSeal (localhost:3001)]
│                 │                 │
JWT / Sessions     Document / User data    Signing engine & PDFs
│                 │                 │
Role-based access    Audit logs            Webhooks → /api/webhooks/docuseal
text## Data Flow (Core Signing Workflow)

1. **Party A creates document**
   - Frontend form → POST /api/documents/create
   - Backend: Validate → Call DocuSeal API to create template → Save metadata in PostgreSQL
   - Response: Document ID

2. **Invite Party B / Notary**
   - POST /api/documents/invite
   - Backend: Call DocuSeal to create submission → Get signing URL
   - Send email via Resend with link

3. **Signing**
   - User clicks link → DocuSeal hosted signing page (or embedded)
   - User signs → DocuSeal emits webhook to /api/webhooks/docuseal

4. **Webhook handling**
   - Verify signature
   - Update document status in DB
   - Create Signature & AuditLog entries
   - Trigger Pusher event → UI real-time update
   - Send next-party email if applicable

5. **Completion**
   - Final `submission.completed` webhook
   - Mark document COMPLETED
   - Send completion email to all parties

## Component Structure

- **Pages**:
  - `/` → Auth (login/register)
  - `/dashboard` → Role-based list of documents
  - `/create` → Prenup creation form + preview
  - `/sign/[id]` → Signing interface + DocuSeal embed or custom pad
  - `/notary` → Pending notarizations + checklist

- **Components**:
  - `DocumentForm` / `DocumentPreview`
  - `SignaturePad` (react-signature-canvas)
  - `NotaryChecklist`
  - ErrorBoundary

- **API Routes** (app/api/):
  - `/auth/[...nextauth]` → Authentication
  - `/documents/create`, `/documents/invite`, `/documents/status/[id]`
  - `/files/upload` → S3 signatures/ID proofs
  - `/notary/verify`
  - `/webhooks/docuseal` → DocuSeal events

- **External Services**:
  - DocuSeal: Signing & PDF generation
  - AWS S3: File storage
  - Resend: Emails
  - Pusher: Real-time
  - PostgreSQL (local): Metadata & audit trail

## Key Design Decisions

- Next.js App Router → Server Components for data fetching where possible
- Local PostgreSQL → Simplifies dev setup, avoids Docker networking issues
- DocuSeal → Handles compliance, tamper-proof PDFs, multi-party signing
- Webhooks → Event-driven status & notification flow
- Zod + React Hook Form → Strong validation, minimal re-renders


