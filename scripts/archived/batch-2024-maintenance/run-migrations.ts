#!/usr/bin/env node
import { execSync } from 'child_process'

console.log('🚀 Running database migrations...')

try {
  // Check if DIRECT_URL is available
  if (!process.env.DIRECT_URL) {
    console.error('❌ Error: DIRECT_URL environment variable is not set')
    console.log('ℹ️  DIRECT_URL is required for running migrations')
    console.log('ℹ️  Please set it in your environment variables')
    process.exit(1)
  }

  // Run migrations
  console.log('📦 Running prisma migrate deploy...')
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DIRECT_URL // Use direct URL for migrations
    }
  })

  console.log('✅ Migrations completed successfully!')
} catch (error) {
  console.error('❌ Migration failed:', error)
  process.exit(1)
}