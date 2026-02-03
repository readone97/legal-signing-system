import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPass = await bcrypt.hash('pass123', 10);

  // Users (2 per role)
  await prisma.user.createMany({
    data: [
      { email: 'partyA1@example.com', password: hashedPass, role: 'PARTY_A' },
      { email: 'partyA2@example.com', password: hashedPass, role: 'PARTY_A' },
      { email: 'partyB1@example.com', password: hashedPass, role: 'PARTY_B' },
      { email: 'partyB2@example.com', password: hashedPass, role: 'PARTY_B' },
      { email: 'notary1@example.com', password: hashedPass, role: 'NOTARY' },
      { email: 'notary2@example.com', password: hashedPass, role: 'NOTARY' },
    ],
  });

  // Sample Documents (5)
  const creator = await prisma.user.findFirst({ where: { email: 'partyA1@example.com' } });
  if (creator) {
    await prisma.document.createMany({
      data: [
        { title: 'Prenup Sample 1', status: 'DRAFT', creatorId: creator.id, docusealId: 'sample1' },
        { title: 'Prenup Sample 2', status: 'PENDING_PARTY_B', creatorId: creator.id, docusealId: 'sample2' },
        { title: 'Prenup Sample 3', status: 'PENDING_NOTARY', creatorId: creator.id, docusealId: 'sample3' },
        { title: 'Prenup Sample 4', status: 'COMPLETED', creatorId: creator.id, docusealId: 'sample4' },
        { title: 'Prenup Sample 5', status: 'DRAFT', creatorId: creator.id, docusealId: 'sample5' },
      ],
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());