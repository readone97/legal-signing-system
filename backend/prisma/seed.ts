import { PrismaClient, UserRole, DocumentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.signature.deleteMany();
  await prisma.documentRevision.deleteMany();
  await prisma.document.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users
  const users = await Promise.all([
    // Party A users
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: hashedPassword,
        firstName: 'Alice',
        lastName: 'Johnson',
        role: UserRole.PARTY_A,
        phoneNumber: '+1-555-0101',
        isEmailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        password: hashedPassword,
        firstName: 'Charlie',
        lastName: 'Davis',
        role: UserRole.PARTY_A,
        phoneNumber: '+1-555-0102',
        isEmailVerified: true,
      },
    }),
    // Party B users
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        password: hashedPassword,
        firstName: 'Bob',
        lastName: 'Smith',
        role: UserRole.PARTY_B,
        phoneNumber: '+1-555-0103',
        isEmailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'diana@example.com',
        password: hashedPassword,
        firstName: 'Diana',
        lastName: 'Martinez',
        role: UserRole.PARTY_B,
        phoneNumber: '+1-555-0104',
        isEmailVerified: true,
      },
    }),
    // Notary users
    prisma.user.create({
      data: {
        email: 'notary@example.com',
        password: hashedPassword,
        firstName: 'Emily',
        lastName: 'Thompson',
        role: UserRole.NOTARY,
        phoneNumber: '+1-555-0105',
        isEmailVerified: true,
        notaryLicense: 'NOT-12345-CA',
        notaryState: 'California',
        notaryExpiration: new Date('2026-12-31'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'notary2@example.com',
        password: hashedPassword,
        firstName: 'Frank',
        lastName: 'Wilson',
        role: UserRole.NOTARY,
        phoneNumber: '+1-555-0106',
        isEmailVerified: true,
        notaryLicense: 'NOT-67890-NY',
        notaryState: 'New York',
        notaryExpiration: new Date('2027-06-30'),
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Prenuptial Agreement Template (Party info, 5+ asset/financial fields, spousal support, signature blocks)
  const prenupTemplate = {
    fields: [
      { id: 'partyAFullName', label: 'Party A Full Legal Name', type: 'text', required: true },
      { id: 'partyBFullName', label: 'Party B Full Legal Name', type: 'text', required: true },
      { id: 'partyAAddress', label: 'Party A Address', type: 'text', required: true },
      { id: 'partyBAddress', label: 'Party B Address', type: 'text', required: true },
      { id: 'partyADOB', label: 'Party A Date of Birth', type: 'date', required: true },
      { id: 'partyBDOB', label: 'Party B Date of Birth', type: 'date', required: true },
      { id: 'weddingDate', label: 'Proposed Wedding Date', type: 'date', required: true },
      { id: 'partyAAssets', label: 'Party A Separate Assets', type: 'textarea', required: true },
      { id: 'partyBAssets', label: 'Party B Separate Assets', type: 'textarea', required: true },
      { id: 'propertyDivision', label: 'Property Division Agreement', type: 'textarea', required: true },
      { id: 'debtResponsibility', label: 'Debt Responsibility', type: 'textarea', required: true },
      { id: 'spousalSupport', label: 'Spousal Support Terms', type: 'textarea', required: true },
      { id: 'estatePlanning', label: 'Estate Planning Provisions', type: 'textarea', required: true },
      { id: 'additionalTerms', label: 'Additional Terms and Conditions', type: 'textarea', required: false },
      { id: 'governingLaw', label: 'Governing Law (State)', type: 'text', required: true },
      { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
    ],
  };

  // Create sample documents
  const documents = await Promise.all([
    // Document 1: Completed
    prisma.document.create({
      data: {
        title: 'Prenuptial Agreement - Johnson & Smith',
        documentType: 'PRENUPTIAL_AGREEMENT',
        status: DocumentStatus.COMPLETED,
        partyAId: users[0].id,
        partyBId: users[2].id,
        notaryId: users[4].id,
        templateFields: prenupTemplate,
        fieldValues: {
          partyAFullName: 'Alice Marie Johnson',
          partyBFullName: 'Robert James Smith',
          partyAAddress: '123 Oak Street, Los Angeles, CA 90001',
          partyBAddress: '456 Tech Park Dr, Austin, TX 78701',
          partyADOB: '1990-03-15',
          partyBDOB: '1988-07-22',
          weddingDate: '2024-06-15',
          partyAAssets: 'Residence at 123 Oak Street, Investment portfolio worth $250,000, Retirement account',
          partyBAssets: 'Business ownership in Tech Solutions Inc., Real estate property in Austin, TX',
          propertyDivision: 'All property acquired before marriage remains separate. Property acquired during marriage will be divided equitably.',
          debtResponsibility: 'Each party responsible for debts incurred before marriage. Joint debts divided equally.',
          spousalSupport: 'Waiver of spousal support unless marriage exceeds 10 years.',
          estatePlanning: 'Each party maintains separate estate planning documents.',
          additionalTerms: 'Annual financial review meeting required.',
          governingLaw: 'California',
          effectiveDate: '2024-05-01',
        },
        version: 1,
        partyASignedAt: new Date('2024-04-15T10:30:00Z'),
        partyBSignedAt: new Date('2024-04-18T14:20:00Z'),
        notarizedAt: new Date('2024-04-20T09:00:00Z'),
        completedAt: new Date('2024-04-20T09:00:00Z'),
      },
    }),
    // Document 2: Pending Notary
    prisma.document.create({
      data: {
        title: 'Prenuptial Agreement - Davis & Martinez',
        documentType: 'PRENUPTIAL_AGREEMENT',
        status: DocumentStatus.PENDING_NOTARY,
        partyAId: users[1].id,
        partyBId: users[3].id,
        notaryId: users[5].id,
        templateFields: prenupTemplate,
        fieldValues: {
          partyAFullName: 'Charles Edward Davis',
          partyBFullName: 'Diana Sofia Martinez',
          partyAAddress: '789 Innovation Way, New York, NY 10001',
          partyBAddress: '321 Medical Center Blvd, New York, NY 10002',
          partyADOB: '1985-11-08',
          partyBDOB: '1987-01-30',
          weddingDate: '2024-08-20',
          partyAAssets: 'Startup company equity, Personal savings $150,000',
          partyBAssets: 'Medical practice, Investment properties',
          propertyDivision: 'Separate property remains separate. Marital property split 50/50.',
          debtResponsibility: 'Pre-marital debts remain individual responsibility.',
          spousalSupport: 'Limited spousal support up to 5 years if marriage dissolves.',
          estatePlanning: 'Each maintains individual estate plans with designated beneficiaries.',
          additionalTerms: 'Quarterly financial disclosure required.',
          governingLaw: 'New York',
          effectiveDate: '2024-07-01',
        },
        version: 1,
        partyASignedAt: new Date('2024-06-10T11:15:00Z'),
        partyBSignedAt: new Date('2024-06-12T16:45:00Z'),
      },
    }),
    // Document 3: Pending Party B
    prisma.document.create({
      data: {
        title: 'Prenuptial Agreement - Johnson & New Partner',
        documentType: 'PRENUPTIAL_AGREEMENT',
        status: DocumentStatus.PENDING_PARTY_B,
        partyAId: users[0].id,
        partyBId: users[2].id,
        templateFields: prenupTemplate,
        fieldValues: {
          partyAFullName: 'Alice Marie Johnson',
          partyBFullName: 'Robert James Smith',
          partyAAddress: '123 Oak Street, Los Angeles, CA 90001',
          partyBAddress: '456 Tech Park Dr, Austin, TX 78701',
          partyADOB: '1990-03-15',
          partyBDOB: '1988-07-22',
          weddingDate: '2025-03-15',
          partyAAssets: 'Real estate holdings, Investment accounts totaling $500,000',
          partyBAssets: 'Software company ownership, Cryptocurrency portfolio',
          propertyDivision: 'Community property state rules apply with modifications as outlined.',
          debtResponsibility: 'Each party liable for own debts incurred before and during marriage.',
          spousalSupport: 'No spousal support except in cases of disability or incapacity.',
          estatePlanning: 'Coordinated estate planning to protect children from prior relationships.',
          additionalTerms: 'Annual review and amendment clause included.',
          governingLaw: 'California',
          effectiveDate: '2025-02-01',
        },
        version: 1,
        partyASignedAt: new Date('2025-01-15T09:30:00Z'),
      },
    }),
    // Document 4: Draft
    prisma.document.create({
      data: {
        title: 'Prenuptial Agreement - New Couple',
        documentType: 'PRENUPTIAL_AGREEMENT',
        status: DocumentStatus.DRAFT,
        partyAId: users[1].id,
        templateFields: prenupTemplate,
        fieldValues: {
          partyAFullName: 'Charles Edward Davis',
          partyBFullName: '',
          weddingDate: '',
          partyAAssets: 'Family inheritance, Business interests',
          partyBAssets: '',
          propertyDivision: '',
          debtResponsibility: '',
          spousalSupport: '',
          estatePlanning: '',
          additionalTerms: '',
          governingLaw: 'Texas',
          effectiveDate: '',
        },
        version: 1,
      },
    }),
    // Document 5: Another completed for history
    prisma.document.create({
      data: {
        title: 'Prenuptial Agreement - Historical Document',
        documentType: 'PRENUPTIAL_AGREEMENT',
        status: DocumentStatus.COMPLETED,
        partyAId: users[0].id,
        partyBId: users[3].id,
        notaryId: users[4].id,
        templateFields: prenupTemplate,
        fieldValues: {
          partyAFullName: 'Alice Marie Johnson',
          partyBFullName: 'Diana Sofia Martinez',
          partyAAddress: '123 Oak Street, Los Angeles, CA 90001',
          partyBAddress: '321 Medical Center Blvd, New York, NY 10002',
          partyADOB: '1990-03-15',
          partyBDOB: '1987-01-30',
          weddingDate: '2023-12-10',
          partyAAssets: 'Condominium, Stock portfolio',
          partyBAssets: 'Medical license, Retirement accounts',
          propertyDivision: 'Equitable distribution of marital property.',
          debtResponsibility: 'Joint and several liability for debts incurred jointly.',
          spousalSupport: 'Rehabilitative support for up to 3 years.',
          estatePlanning: 'Mutual wills and trusts established.',
          additionalTerms: 'Mediation clause for disputes.',
          governingLaw: 'California',
          effectiveDate: '2023-11-01',
        },
        version: 1,
        partyASignedAt: new Date('2023-10-20T13:00:00Z'),
        partyBSignedAt: new Date('2023-10-22T10:30:00Z'),
        notarizedAt: new Date('2023-10-25T11:00:00Z'),
        completedAt: new Date('2023-10-25T11:00:00Z'),
      },
    }),
  ]);

  console.log(`✅ Created ${documents.length} documents`);

  // Create audit logs for completed documents
  await Promise.all([
    prisma.auditLog.create({
      data: {
        action: 'DOCUMENT_CREATED',
        userId: users[0].id,
        documentId: documents[0].id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        metadata: { note: 'Initial document creation' },
      },
    }),
    prisma.auditLog.create({
      data: {
        action: 'SIGNATURE_ADDED',
        userId: users[0].id,
        documentId: documents[0].id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        metadata: { signatureType: 'DRAW' },
      },
    }),
    prisma.auditLog.create({
      data: {
        action: 'SIGNATURE_ADDED',
        userId: users[2].id,
        documentId: documents[0].id,
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0',
        metadata: { signatureType: 'TYPE' },
      },
    }),
    prisma.auditLog.create({
      data: {
        action: 'NOTARIZATION_COMPLETED',
        userId: users[4].id,
        documentId: documents[0].id,
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0',
        metadata: { notaryLicense: 'NOT-12345-CA' },
      },
    }),
  ]);

  console.log('✅ Created audit logs');

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n👥 Sample User Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Party A (Alice):     alice@example.com / password123');
  console.log('Party A (Charlie):   charlie@example.com / password123');
  console.log('Party B (Bob):       bob@example.com / password123');
  console.log('Party B (Diana):     diana@example.com / password123');
  console.log('Notary (Emily):      notary@example.com / password123');
  console.log('Notary (Frank):      notary2@example.com / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
