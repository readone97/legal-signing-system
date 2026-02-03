# legal-signing-system


# Prenup Sign – Secure Prenuptial Agreement & Legal Document Signing Platform

A full-stack web application for creating, filling, signing, and notarizing legal documents (starting with prenuptial agreements) with multi-party workflows and notary support. Inspired by prenup.fun.

**Key goals**: Trustworthy UX, ESIGN Act compliance via DocuSeal, secure audit trail, real-time updates, automated notifications.

## Features

- User roles: Party A (creator), Party B (counter-signer), Notary
- Create prenup documents with 10+ dynamic fields (party info, assets, debts, obligations, spousal support, inheritance)
- Sequential multi-party signing workflow
- Electronic signatures (drawn, typed, uploaded) with timestamp & IP logging
- Notary dashboard with identity verification checklist
- Real-time document status updates (Pusher)
- Email notifications (invitations, reminders, completion) via Resend
- Document preview (react-pdf)
- Secure file uploads (signatures / ID proofs) to AWS S3
- Audit logs for every action
- Interactive API documentation (Swagger/Scalar)

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript, Server Components)
- **Styling**: Tailwind CSS + Shadcn UI (soft blue/purple palette)
- **Forms & Validation**: React Hook Form + Zod
- **Authentication**: NextAuth.js (Credentials provider + JWT)
- **Database**: PostgreSQL (local/host install) + Prisma ORM
- **Signing Engine**: DocuSeal (open-source, self-hosted or cloud)
- **Real-time**: Pusher
- **Emails**: Resend
- **File Storage**: AWS S3
- **Logging**: Winston
- **API Docs**: Swagger UI / Scalar
- **Containerization**: Docker Compose (DocuSeal only)

## Quick Start (Local Development)

### Prerequisites
- Node.js ≥ 18 (LTS)
- npm ≥ 8
- Local PostgreSQL 15+ or 16 (see PostgreSQL Setup below)
- Docker (for DocuSeal)
- Accounts: AWS S3, Resend, Pusher, DocuSeal (free tier ok)

### PostgreSQL Setup (Local / Host)
1. Install PostgreSQL: https://www.postgresql.org/download/windows/
2. Set superuser password (e.g. `postgres123`)
3. Create database: `prenupdb`
   - pgAdmin: Right-click Databases → Create → prenupdb
   - Or CLI: `createdb -U postgres prenupdb`

### Installation

1. Clone / unzip project
2. Install dependencies
  
   npm install

Copy and configure environment
cp .env.example .env→ Fill all required variables (see .env.example)
Apply Prisma migrations & seed dataBashnpx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
Start DocuSeal (Docker)Bashdocker compose up -d→ http://localhost:3001
→ Sign up, get API key & webhook secret → add to .env
Run the appBashnpm run dev
Open: http://localhost:3000

Default Test Credentials (after seeding)

Party A: partyA1@example.com / pass123
Party B: partyB1@example.com / pass123
Notary: notary1@example.com / pass123

