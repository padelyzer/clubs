import { PrismaClient as SqliteClient } from '@prisma/client'
import { PrismaClient as PostgresClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Create SQLite client with old connection
const sqliteDb = new SqliteClient({
  datasourceUrl: 'file:./prisma/dev.db'
})

// Create PostgreSQL client with new connection
const postgresDb = new PostgresClient({
  datasourceUrl: process.env.DATABASE_URL
})

async function migrate() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...')
  
  try {
    // Test connections
    await sqliteDb.$connect()
    console.log('✅ Connected to SQLite')
    
    await postgresDb.$connect()
    console.log('✅ Connected to PostgreSQL')
    
    // Start transaction
    console.log('\n📦 Migrating data...')
    
    // 1. Migrate Clubs
    console.log('→ Migrating clubs...')
    const clubs = await sqliteDb.club.findMany()
    for (const club of clubs) {
      await postgresDb.club.upsert({
        where: { id: club.id },
        update: {},
        create: club
      })
    }
    console.log(`  ✓ ${clubs.length} clubs migrated`)
    
    // 2. Migrate Users
    console.log('→ Migrating users...')
    const users = await sqliteDb.user.findMany()
    for (const user of users) {
      await postgresDb.user.upsert({
        where: { id: user.id },
        update: {},
        create: user
      })
    }
    console.log(`  ✓ ${users.length} users migrated`)
    
    // 3. Migrate Courts
    console.log('→ Migrating courts...')
    const courts = await sqliteDb.court.findMany()
    for (const court of courts) {
      await postgresDb.court.upsert({
        where: { id: court.id },
        update: {},
        create: court
      })
    }
    console.log(`  ✓ ${courts.length} courts migrated`)
    
    // 4. Migrate Schedules
    console.log('→ Migrating schedules...')
    const schedules = await sqliteDb.schedule.findMany()
    for (const schedule of schedules) {
      await postgresDb.schedule.upsert({
        where: { id: schedule.id },
        update: {},
        create: schedule
      })
    }
    console.log(`  ✓ ${schedules.length} schedules migrated`)
    
    // 5. Migrate Pricing
    console.log('→ Migrating pricing...')
    const pricings = await sqliteDb.pricing.findMany()
    for (const pricing of pricings) {
      await postgresDb.pricing.upsert({
        where: { id: pricing.id },
        update: {},
        create: pricing
      })
    }
    console.log(`  ✓ ${pricings.length} pricing rules migrated`)
    
    // 6. Migrate Bookings
    console.log('→ Migrating bookings...')
    const bookings = await sqliteDb.booking.findMany()
    for (const booking of bookings) {
      await postgresDb.booking.upsert({
        where: { id: booking.id },
        update: {},
        create: booking
      })
    }
    console.log(`  ✓ ${bookings.length} bookings migrated`)
    
    // 7. Migrate Payments
    console.log('→ Migrating payments...')
    const payments = await sqliteDb.payment.findMany()
    for (const payment of payments) {
      await postgresDb.payment.upsert({
        where: { id: payment.id },
        update: {},
        create: payment
      })
    }
    console.log(`  ✓ ${payments.length} payments migrated`)
    
    // 8. Migrate SplitPayments
    console.log('→ Migrating split payments...')
    const splitPayments = await sqliteDb.splitPayment.findMany()
    for (const splitPayment of splitPayments) {
      await postgresDb.splitPayment.upsert({
        where: { id: splitPayment.id },
        update: {},
        create: splitPayment
      })
    }
    console.log(`  ✓ ${splitPayments.length} split payments migrated`)
    
    // 9. Migrate Notifications
    console.log('→ Migrating notifications...')
    const notifications = await sqliteDb.notification.findMany()
    for (const notification of notifications) {
      await postgresDb.notification.upsert({
        where: { id: notification.id },
        update: {},
        create: notification
      })
    }
    console.log(`  ✓ ${notifications.length} notifications migrated`)
    
    console.log('\n✅ Migration completed successfully!')
    
    // Create backup of SQLite database
    const backupPath = path.join(process.cwd(), 'prisma', `dev.db.backup.${Date.now()}`)
    fs.copyFileSync(
      path.join(process.cwd(), 'prisma', 'dev.db'),
      backupPath
    )
    console.log(`📁 SQLite backup created at: ${backupPath}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await sqliteDb.$disconnect()
    await postgresDb.$disconnect()
  }
}

// Run migration
migrate().catch(console.error)