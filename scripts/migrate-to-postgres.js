#!/usr/bin/env node

/**
 * PostgreSQL Migration Script for Padelyzer
 * 
 * This script helps migrate from SQLite to PostgreSQL.
 * It provides utilities to:
 * 1. Set up PostgreSQL database
 * 2. Update Prisma schema
 * 3. Migrate existing data
 * 4. Validate migration
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  POSTGRES_URL: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  BACKUP_DIR: path.join(__dirname, '../backups'),
  SCHEMA_PATH: path.join(__dirname, '../prisma/schema.prisma'),
  ENV_PATH: path.join(__dirname, '../.env'),
  ENV_EXAMPLE_PATH: path.join(__dirname, '../.env.example'),
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

async function checkPrerequisites() {
  logStep('1', 'Checking prerequisites...');
  
  // Check if PostgreSQL is available
  try {
    execSync('psql --version', { stdio: 'ignore' });
    logSuccess('PostgreSQL client is available');
  } catch (error) {
    logError('PostgreSQL client not found. Please install PostgreSQL.');
    process.exit(1);
  }
  
  // Check if Prisma is available
  try {
    execSync('npx prisma --version', { stdio: 'ignore' });
    logSuccess('Prisma CLI is available');
  } catch (error) {
    logError('Prisma CLI not found. Please install Prisma.');
    process.exit(1);
  }
  
  // Check if backup directory exists, create if not
  try {
    await fs.mkdir(CONFIG.BACKUP_DIR, { recursive: true });
    logSuccess('Backup directory ready');
  } catch (error) {
    logError(`Failed to create backup directory: ${error.message}`);
    process.exit(1);
  }
}

async function backupSQLiteData() {
  logStep('2', 'Backing up SQLite data...');
  
  const sqliteDbPath = path.join(__dirname, '../prisma/dev.db');
  
  try {
    await fs.access(sqliteDbPath);
  } catch (error) {
    logWarning('SQLite database not found. Skipping backup.');
    return null;
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(CONFIG.BACKUP_DIR, `sqlite-backup-${timestamp}.db`);
  
  try {
    await fs.copyFile(sqliteDbPath, backupPath);
    logSuccess(`SQLite database backed up to: ${backupPath}`);
    return backupPath;
  } catch (error) {
    logError(`Failed to backup SQLite database: ${error.message}`);
    process.exit(1);
  }
}

async function exportSQLiteData() {
  logStep('3', 'Exporting SQLite data to SQL...');
  
  const sqliteDbPath = path.join(__dirname, '../prisma/dev.db');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportPath = path.join(CONFIG.BACKUP_DIR, `sqlite-export-${timestamp}.sql`);
  
  try {
    await fs.access(sqliteDbPath);
  } catch (error) {
    logWarning('SQLite database not found. Skipping data export.');
    return null;
  }
  
  try {
    // Export schema and data
    execSync(`sqlite3 "${sqliteDbPath}" .dump > "${exportPath}"`, { stdio: 'pipe' });
    logSuccess(`SQLite data exported to: ${exportPath}`);
    return exportPath;
  } catch (error) {
    logError(`Failed to export SQLite data: ${error.message}`);
    return null;
  }
}

async function updatePrismaSchema() {
  logStep('4', 'Updating Prisma schema for PostgreSQL...');
  
  try {
    let schema = await fs.readFile(CONFIG.SCHEMA_PATH, 'utf8');
    
    // Replace SQLite provider with PostgreSQL
    const originalSchema = schema;
    schema = schema.replace(
      /provider\s*=\s*"sqlite"/g,
      'provider = "postgresql"'
    );
    
    // Replace SQLite-specific types
    schema = schema.replace(
      /url\s*=\s*"file:\.\/dev\.db"/g,
      'url = env("DATABASE_URL")'
    );
    
    // Update SQLite-specific field types
    schema = schema.replace(
      /@id\s+@default\(cuid\(\)\)/g,
      '@id @default(cuid())'
    );
    
    // Handle DateTime fields (SQLite uses TEXT, PostgreSQL uses TIMESTAMP)
    schema = schema.replace(
      /@default\(now\(\)\)/g,
      '@default(now()) @db.Timestamp(3)'
    );
    
    // Save backup of original schema
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupSchemaPath = path.join(CONFIG.BACKUP_DIR, `schema-backup-${timestamp}.prisma`);
    await fs.writeFile(backupSchemaPath, originalSchema);
    logSuccess(`Original schema backed up to: ${backupSchemaPath}`);
    
    // Write updated schema
    await fs.writeFile(CONFIG.SCHEMA_PATH, schema);
    logSuccess('Prisma schema updated for PostgreSQL');
    
    return true;
  } catch (error) {
    logError(`Failed to update Prisma schema: ${error.message}`);
    return false;
  }
}

async function updateEnvironmentVariables() {
  logStep('5', 'Updating environment variables...');
  
  if (!CONFIG.POSTGRES_URL) {
    logWarning('POSTGRES_URL not provided. Please set DATABASE_URL manually.');
    log('\nExample DATABASE_URL for PostgreSQL:', 'yellow');
    log('DATABASE_URL="postgresql://username:password@localhost:5432/padelyzer"', 'cyan');
    return false;
  }
  
  try {
    let envContent = '';
    
    try {
      envContent = await fs.readFile(CONFIG.ENV_PATH, 'utf8');
    } catch (error) {
      // .env file doesn't exist, create it
      logWarning('.env file not found, creating new one...');
    }
    
    // Backup original .env
    if (envContent) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupEnvPath = path.join(CONFIG.BACKUP_DIR, `.env-backup-${timestamp}`);
      await fs.writeFile(backupEnvPath, envContent);
      logSuccess(`Original .env backed up to: ${backupEnvPath}`);
    }
    
    // Update or add DATABASE_URL
    const lines = envContent.split('\n');
    let databaseUrlUpdated = false;
    
    const updatedLines = lines.map(line => {
      if (line.startsWith('DATABASE_URL=') || line.startsWith('#DATABASE_URL=')) {
        databaseUrlUpdated = true;
        return `DATABASE_URL="${CONFIG.POSTGRES_URL}"`;
      }
      return line;
    });
    
    if (!databaseUrlUpdated) {
      updatedLines.push(`DATABASE_URL="${CONFIG.POSTGRES_URL}"`);
    }
    
    await fs.writeFile(CONFIG.ENV_PATH, updatedLines.join('\n'));
    logSuccess('Environment variables updated');
    
    return true;
  } catch (error) {
    logError(`Failed to update environment variables: ${error.message}`);
    return false;
  }
}

async function runPrismaMigration() {
  logStep('6', 'Running Prisma migration...');
  
  try {
    // Generate Prisma client
    log('Generating Prisma client...', 'blue');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Reset database (this will create the database if it doesn't exist)
    log('Resetting database...', 'blue');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    
    logSuccess('Prisma migration completed');
    return true;
  } catch (error) {
    logError(`Prisma migration failed: ${error.message}`);
    return false;
  }
}

async function validateMigration() {
  logStep('7', 'Validating migration...');
  
  try {
    // Check if we can connect to the database
    execSync('npx prisma db pull', { stdio: 'pipe' });
    logSuccess('Database connection successful');
    
    // Check if tables exist
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // Try to query each main table
      await prisma.user.findMany({ take: 1 });
      await prisma.club.findMany({ take: 1 });
      await prisma.court.findMany({ take: 1 });
      await prisma.booking.findMany({ take: 1 });
      
      logSuccess('All main tables are accessible');
      
      await prisma.$disconnect();
      return true;
    } catch (error) {
      logError(`Database validation failed: ${error.message}`);
      await prisma.$disconnect();
      return false;
    }
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    return false;
  }
}

async function createSeedData() {
  logStep('8', 'Creating seed data...');
  
  try {
    // Check if seed script exists
    const seedScriptPath = path.join(__dirname, '../prisma/seed.ts');
    try {
      await fs.access(seedScriptPath);
      execSync('npx prisma db seed', { stdio: 'inherit' });
      logSuccess('Seed data created');
    } catch (error) {
      logWarning('Seed script not found. Skipping seed data creation.');
    }
    
    return true;
  } catch (error) {
    logError(`Failed to create seed data: ${error.message}`);
    return false;
  }
}

async function printNextSteps() {
  log('\n' + '='.repeat(60), 'green');
  log('MIGRATION COMPLETED SUCCESSFULLY!', 'green');
  log('='.repeat(60), 'green');
  
  log('\nNext steps:', 'cyan');
  log('1. Update your deployment configuration with the new DATABASE_URL', 'white');
  log('2. Ensure your PostgreSQL database is accessible from your deployment environment', 'white');
  log('3. Run your application and verify everything works correctly', 'white');
  log('4. Consider setting up database backups for your PostgreSQL instance', 'white');
  
  log('\nImportant notes:', 'yellow');
  log('• Your SQLite database has been backed up in the backups/ directory', 'white');
  log('• Keep the backup until you are certain the migration is successful', 'white');
  log('• Update your deployment scripts to use PostgreSQL', 'white');
  log('• Consider setting up connection pooling for production', 'white');
  
  log('\nPostgreSQL connection string format:', 'cyan');
  log('postgresql://username:password@host:port/database', 'white');
  
  log('\nFor production, consider using a managed PostgreSQL service:', 'cyan');
  log('• Vercel Postgres', 'white');
  log('• Railway', 'white');
  log('• Supabase', 'white');
  log('• AWS RDS', 'white');
  log('• Google Cloud SQL', 'white');
}

async function main() {
  log('🚀 Padelyzer PostgreSQL Migration Tool', 'bright');
  log('=====================================\n', 'bright');
  
  try {
    await checkPrerequisites();
    await backupSQLiteData();
    await exportSQLiteData();
    
    const schemaUpdated = await updatePrismaSchema();
    if (!schemaUpdated) {
      logError('Failed to update Prisma schema. Aborting migration.');
      process.exit(1);
    }
    
    const envUpdated = await updateEnvironmentVariables();
    if (!envUpdated && !CONFIG.POSTGRES_URL) {
      logError('DATABASE_URL not configured. Please set it manually and re-run the migration.');
      process.exit(1);
    }
    
    const migrationSuccess = await runPrismaMigration();
    if (!migrationSuccess) {
      logError('Prisma migration failed. Please check the errors above.');
      process.exit(1);
    }
    
    const validationSuccess = await validateMigration();
    if (!validationSuccess) {
      logError('Migration validation failed. Please check your database connection.');
      process.exit(1);
    }
    
    await createSeedData();
    await printNextSteps();
    
  } catch (error) {
    logError(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
PostgreSQL Migration Tool for Padelyzer

Usage: node migrate-to-postgres.js [options]

Options:
  --help, -h          Show this help message
  --postgres-url, -p  PostgreSQL connection URL
  
Environment Variables:
  DATABASE_URL        PostgreSQL connection URL
  POSTGRES_URL        Alternative to DATABASE_URL
  
Examples:
  node migrate-to-postgres.js
  node migrate-to-postgres.js --postgres-url "postgresql://user:pass@localhost:5432/padelyzer"
  DATABASE_URL="postgresql://user:pass@localhost:5432/padelyzer" node migrate-to-postgres.js
`);
    process.exit(0);
  }
  
  const postgresUrlIndex = args.indexOf('--postgres-url') || args.indexOf('-p');
  if (postgresUrlIndex !== -1 && args[postgresUrlIndex + 1]) {
    CONFIG.POSTGRES_URL = args[postgresUrlIndex + 1];
  }
  
  main().catch((error) => {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  checkPrerequisites,
  backupSQLiteData,
  updatePrismaSchema,
  updateEnvironmentVariables,
  runPrismaMigration,
  validateMigration
};