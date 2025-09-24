require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // This should point to production Supabase
    }
  }
});

async function checkProductionData() {
  try {
    console.log('🔍 Checking production data...\n');
    
    // Check all bookings with split payment enabled
    const splitBookings = await prisma.booking.findMany({
      where: {
        splitPaymentEnabled: true
      },
      include: {
        SplitPayment: true,
        Court: true,
        Club: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📋 Found ${splitBookings.length} bookings with split payment enabled:`);
    
    if (splitBookings.length === 0) {
      console.log('⚠️  No split payment bookings found in production');
      
      // Let's check recent bookings instead
      console.log('\n🔍 Checking recent bookings...');
      const recentBookings = await prisma.booking.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          Court: true,
          Club: true
        }
      });
      
      console.log(`\nFound ${recentBookings.length} recent bookings:`);
      recentBookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.playerName} - ${booking.date.toLocaleDateString()} (${booking.id})`);
        console.log(`   Split Enabled: ${booking.splitPaymentEnabled}`);
        console.log(`   Club: ${booking.Club ? booking.Club.name : 'Unknown'}`);
        console.log(`   Court: ${booking.Court ? booking.Court.name : 'Unknown'}`);
      });
    } else {
      splitBookings.forEach((booking, index) => {
        console.log(`\n${index + 1}. ${booking.playerName} - ${booking.date.toLocaleDateString()}`);
        console.log(`   ID: ${booking.id}`);
        console.log(`   Club: ${booking.Club ? booking.Club.name : 'Unknown'}`);
        console.log(`   Court: ${booking.Court ? booking.Court.name : 'Unknown'}`);
        console.log(`   Split Count: ${booking.splitPaymentCount}`);
        console.log(`   Split Records: ${booking.SplitPayment.length}`);
        console.log(`   Price: $${booking.price / 100} MXN`);
      });
    }
    
    // Check if the specific booking ID exists at all
    const specificBooking = await prisma.booking.findUnique({
      where: { id: '7a9493bf-0972-4497-aa38-2ccad5145296' }
    });
    
    console.log(`\n🔍 Specific booking check (7a9493bf-0972-4497-aa38-2ccad5145296):`);
    console.log(specificBooking ? '✅ Found' : '❌ Not found');
    
    // Let's check what clubs we have
    const clubs = await prisma.club.findMany();
    console.log(`\n🏢 Available clubs: ${clubs.length}`);
    clubs.forEach(club => {
      console.log(`   - ${club.name} (${club.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionData();