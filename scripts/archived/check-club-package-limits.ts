import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkClubPackage() {
  const clubPackage = await prisma.clubPackage.findFirst({
    where: { 
      clubId: 'club-basic5-001',
      isActive: true
    },
    include: {
      package: true
    }
  });
  
  console.log('Club Package:', JSON.stringify(clubPackage, null, 2));
  
  if (clubPackage?.package) {
    console.log('\nPackage limits:');
    console.log('- Max Courts:', clubPackage.package.maxCourts);
    console.log('- Max Users:', clubPackage.package.maxUsers);
    console.log('- Max Bookings/Month:', clubPackage.package.maxBookingsMonth);
  }
  
  const courtCount = await prisma.court.count({
    where: { 
      clubId: 'club-basic5-001',
      active: true
    }
  });
  
  console.log('\nCurrent active courts:', courtCount);
  
  await prisma.$disconnect();
}

checkClubPackage();