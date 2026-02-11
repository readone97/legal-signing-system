# Legal Document Signing System 📝

A production-ready full-stack legal document signing platform with multi-party workflows, notary support, and complete audit trails.

## 🎯 Features

- **Multi-Party Signing Workflow**: Sequential signing flow (Party A → Party B → Notary)
- **Document Management**: Create, edit, and manage legal documents with version history
- **Signature Capture**: Draw, type, or upload signature images
- **Notary System**: Complete notarization workflow with verification checklist
- **Audit Trail**: Full tracking with ISO 8601 timestamps, IP logging, and activity history
- **Email Notifications**: Automated notifications for all workflow events
- **PDF Generation**: Server-side PDF creation with embedded signatures
- **Security**: JWT authentication, input validation, SQL injection prevention

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- TailwindCSS (custom pastel theme)
- React Hook Form
- React Signature Canvas
- React PDF
- Framer Motion

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication
- Nodemailer (email)
- Puppeteer (PDF generation)
- Zod (validation)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd legal-signing-system
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/legal_signing_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# Email (using Gmail as example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
EMAIL_FROM="Legal Signing System <noreply@legalsigning.com>"

# App
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Create database
createdb legal_signing_db

# Run migrations
npx prisma migrate dev

# Seed database with sample data
npm run seed
```

### 4. Start Development Servers

In one terminal (backend):
```bash
npm run dev:server
```

In another terminal (frontend):
```bash
npm run dev:client
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 👥 Sample Accounts

After seeding, you can login with these accounts:

**Party A (Document Creator)**
- Email: alice@example.com
- Password: password123

**Party B (Signer)**
- Email: bob@example.com
- Password: password123

**Notary**
- Email: notary@example.com
- Password: password123

## 📁 Project Structure

```
legal-signing-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── validators/      # Zod schemas
│   │   └── server.ts        # Express server
│   ├── prisma/
│   │   ├── migrations/      # Database migrations
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data
│   └── uploads/             # File storage
├── frontend/
│   ├── public/              # Static assets
│   └── src/
│       ├── components/      # React components
│       ├── contexts/        # React contexts
│       ├── hooks/           # Custom hooks
│       ├── pages/           # Page components
│       ├── services/        # API client
│       ├── types/           # TypeScript types
│       └── utils/           # Utility functions
├── docs/
│   ├── ARCHITECTURE.md      # System architecture
│   ├── API_DOCS.md          # API documentation
│   └── DEPLOYMENT.md        # Deployment guide
└── package.json
```

## 🔐 Security Features

- **Authentication**: JWT with refresh token rotation
- **Authorization**: Role-based access control (Party A, Party B, Notary)
- **Input Validation**: Zod schemas on all endpoints
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Input sanitization and Content Security Policy
- **File Upload Security**: Type validation, size limits (10MB), sanitized filenames
- **Audit Trail**: IP logging, timestamps, full activity tracking

## 📧 Email Templates

The system sends automated emails for:
1. Welcome email (account creation)
2. Document invitation (Party B)
3. Signature reminders
4. Notarization ready notification
5. Document execution confirmation

Configure SMTP settings in `.env` to enable email functionality.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- auth.test.ts
```

## 📖 Documentation

Detailed documentation is available in the `/docs` folder:

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design and architecture
- [API_DOCS.md](./docs/API_DOCS.md) - Complete API reference
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Production deployment guide

## 🚢 Production Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed production deployment instructions including:
- Environment configuration
- Database setup
- SSL/HTTPS setup
- Process management (PM2)
- Nginx reverse proxy
- Security hardening

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- GitHub Issues: <repository-url>/issues
- Email: support@legalsigning.com

## 🎉 Acknowledgments

- UI/UX inspired by prenup.fun
- Built with modern web technologies
- Designed for legal professionals

---

Made with ❤️ for legal document automation
