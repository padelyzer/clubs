const { execSync } = require('child_process');

console.log('🚀 Starting safe migration process...\n');

try {
  // 1. Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 2. Check migration status
  console.log('\n🔍 Checking migration status...');
  try {
    const status = execSync('npx prisma migrate status').toString();
    console.log(status);
    
    if (status.includes('No pending migrations')) {
      console.log('✅ No pending migrations to apply\n');
    } else {
      console.log('📋 Found pending migrations\n');
      
      // 3. Apply migrations with timeout
      console.log('🔄 Applying migrations (timeout: 2 minutes)...');
      execSync('npx prisma migrate deploy --skip-seed', { 
        stdio: 'inherit',
        timeout: 120000 // 2 minutes timeout
      });
      
      console.log('\n✅ Migrations applied successfully!\n');
    }
  } catch (statusError) {
    // If status check fails, it might mean no migrations table exists
    console.log('⚠️  Migration status check failed, attempting to apply migrations...');
    
    try {
      execSync('npx prisma migrate deploy --skip-seed', { 
        stdio: 'inherit',
        timeout: 120000 // 2 minutes timeout
      });
      console.log('\n✅ Migrations applied successfully!\n');
    } catch (migrateError) {
      console.error('❌ Migration failed:', migrateError.message);
      console.log('\n⚠️  Continuing with build despite migration failure...\n');
    }
  }
  
  // 4. Build Next.js
  console.log('🏗️  Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('\n✅ Build completed successfully!');
  
} catch (error) {
  console.error('\n❌ Build process failed:', error.message);
  process.exit(1);
}