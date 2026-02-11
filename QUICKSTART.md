# Legal Document Signing System - Quick Start Guide

## 🚀 What You've Got

A complete, production-ready legal document signing platform with:
- ✅ Full-stack TypeScript application
- ✅ Multi-party signing workflow (Party A → Party B → Notary)
- ✅ JWT authentication with refresh tokens
- ✅ PostgreSQL database with Prisma ORM
- ✅ Email notifications (5 templates)
- ✅ Audit trail and security features
- ✅ Beautiful pastel UI inspired by prenup.fun
- ✅ Complete API documentation
- ✅ Deployment guide for production

## 📂 Project Structure

```
legal-signing-system/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth, validation
│   │   ├── routes/       # API routes
│   │   └── validators/   # Zod schemas
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.ts       # Sample data
│   └── package.json
│
├── frontend/             # React + TypeScript
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # Auth context
│   │   └── services/     # API client
│   ├── tailwind.config.js # Pastel theme
│   └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md        # System design
│   ├── API_DOCS.md            # API reference
│   ├── DEPLOYMENT.md          # Production setup
│   └── FRONTEND_IMPLEMENTATION.md # UI guide
│
└── README.md             # This file!
```

## ⚡ Quick Setup (5 Minutes)

### 1. Install Dependencies
```bash
cd legal-signing-system

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Setup Database
```bash
# Create PostgreSQL database
createdb legal_signing_db

# Create .env file in backend/
cp backend/.env.example backend/.env

# Edit backend/.env with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/legal_signing_db"

# Run migrations
cd backend
npx prisma migrate dev

# Seed sample data
npm run seed
```

### 3. Start Development Servers
```bash
# From project root
npm run dev

# This starts both:
# - Backend API: http://localhost:3001
# - Frontend: http://localhost:3000
```

## 👥 Sample Login Credentials

After seeding, use these accounts:

**Party A (Document Creator)**
- Email: `alice@example.com`
- Password: `password123`

**Party B (Signer)**
- Email: `bob@example.com`
- Password: `password123`

**Notary**
- Email: `notary@example.com`
- Password: `password123`

## 🎯 Test the Workflow

1. **Login as Party A** (alice@example.com)
2. **Create a new document** from the dashboard
3. **Fill out the prenuptial agreement** template
4. **Send to Party B** (bob@example.com)
5. **Logout and login as Party B**
6. **Review and sign** the document
7. **Send to Notary**
8. **Logout and login as Notary** (notary@example.com)
9. **Notarize the document** with verification
10. **Document is complete!** ✅

## 📧 Email Configuration

To enable email notifications, update `backend/.env`:

```env
# For Gmail
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"

# For SendGrid
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

## 🔑 Key Features

### Backend Features
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Zod input validation
- Prisma ORM with PostgreSQL
- Nodemailer email service
- Complete audit logging
- File upload handling
- Error handling middleware

### Frontend Features
- React 18 with TypeScript
- TailwindCSS pastel theme
- React Router v6
- React Hook Form
- Signature canvas (draw/type/upload)
- Axios with interceptors
- Toast notifications
- Responsive design

### Security Features
- Bcrypt password hashing
- JWT token rotation
- SQL injection prevention
- XSS protection
- Input sanitization
- Rate limiting (configurable)
- Audit trail with IP logging

## 📚 Documentation

### Essential Reads
1. **[README.md](./README.md)** - Project overview and setup
2. **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture
3. **[API_DOCS.md](./docs/API_DOCS.md)** - Complete API reference
4. **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Production deployment
5. **[FRONTEND_IMPLEMENTATION.md](./docs/FRONTEND_IMPLEMENTATION.md)** - UI guide

### API Endpoints Reference

**Authentication**
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login
- POST `/api/auth/refresh` - Refresh token
- POST `/api/auth/logout` - Logout

**Documents**
- POST `/api/documents` - Create document
- GET `/api/documents` - List documents
- GET `/api/documents/:id` - Get document
- PUT `/api/documents/:id` - Update document
- DELETE `/api/documents/:id` - Delete document
- POST `/api/documents/:id/send-to-party-b` - Send to Party B
- POST `/api/documents/:id/send-to-notary` - Send to notary

**Signatures**
- POST `/api/signatures/:documentId` - Add signature
- GET `/api/signatures/:documentId` - Get signatures

**Notary**
- GET `/api/notary/pending` - Pending documents
- POST `/api/notary/:documentId/notarize` - Notarize
- GET `/api/notary/stats` - Statistics

**Users**
- GET `/api/users/me` - Current user
- GET `/api/users/notaries` - Available notaries

## 🏗️ Database Schema

### Core Tables
- **users** - User accounts with roles
- **documents** - Legal documents with workflow status
- **signatures** - Digital signatures with audit data
- **audit_logs** - Complete activity tracking
- **document_revisions** - Version history
- **refresh_tokens** - JWT refresh tokens

## 🎨 UI/UX Design

Inspired by prenup.fun with a professional pastel aesthetic:

- **Color Palette**: Soft purples, pinks, blues, greens
- **Typography**: Playfair Display (headings) + Inter (body)
- **Components**: Glass-morphism cards, gradient buttons
- **Layout**: Clean, spacious, mobile-responsive
- **Animations**: Subtle transitions and micro-interactions

## 🚢 Production Deployment

### Prerequisites
- Ubuntu 20.04+ server
- Node.js 18+
- PostgreSQL 14+
- Nginx
- SSL certificate (Let's Encrypt)

### Quick Deploy
```bash
# See DEPLOYMENT.md for complete guide
# Key steps:
1. Setup server (Ubuntu + Node.js + PostgreSQL + Nginx)
2. Clone repository
3. Install dependencies
4. Configure environment variables
5. Run database migrations
6. Build applications
7. Setup PM2 process manager
8. Configure Nginx reverse proxy
9. Setup SSL with Let's Encrypt
10. Configure backups
```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email"
SMTP_PASS="your-password"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify connection
psql -U postgres -d legal_signing_db
```

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📊 Sample Data

The seed script creates:
- 6 users (2 Party A, 2 Party B, 2 Notaries)
- 5 sample documents in various states
- Complete prenuptial agreement template
- Audit log entries

## 🔐 Security Best Practices

1. **Change default secrets** in production
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** in production
4. **Set up rate limiting**
5. **Regular security updates**
6. **Database backups** daily
7. **Monitor logs** for suspicious activity

## 🚀 Next Steps

1. **Customize the prenup template** for your needs
2. **Add more document types** (contracts, agreements)
3. **Implement PDF generation** with Puppeteer
4. **Add two-factor authentication**
5. **Integrate payment processing**
6. **Add mobile apps** (React Native)
7. **Implement blockchain** verification
8. **Add webhook support** for integrations

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Email**: support@legalsigning.com

## 📝 License

MIT License - See LICENSE file

---

## ✅ Pre-Flight Checklist

Before running:
- [ ] PostgreSQL installed and running
- [ ] Node.js 18+ installed
- [ ] Database created: `legal_signing_db`
- [ ] Backend `.env` file configured
- [ ] Dependencies installed (`npm install`)
- [ ] Database migrated (`npx prisma migrate dev`)
- [ ] Database seeded (`npm run seed`)

Ready to go? Run `npm run dev` and visit http://localhost:3000!

---

**Built with ❤️ for legal professionals**

Need help? Check the comprehensive documentation in the `/docs` folder!
