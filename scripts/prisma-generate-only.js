const { execSync } = require('child_process');

console.log('📦 Generating Prisma Client (without database connection)...\n');

try {
  // Only generate Prisma Client, no database connection needed
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      // Ensure Prisma doesn't try to connect to the database
      PRISMA_HIDE_UPDATE_MESSAGE: 'true',
      // Use a dummy DATABASE_URL to prevent connection attempts
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy'
    }
  });
  
  console.log('\n✅ Prisma Client generated successfully!');
  
  // Now build Next.js
  console.log('\n🏗️  Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('\n✅ Build completed successfully!');
  
} catch (error) {
  console.error('\n❌ Build process failed:', error.message);
  process.exit(1);
}