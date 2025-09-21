#!/usr/bin/env tsx

/**
 * Simplified Test Environment Setup Script for Padelyzer
 * Creates essential test data for system testing
 */

import { prisma } from '@/lib/config/prisma'
import bcrypt from 'bcryptjs'

// Test credentials
const TEST_PASSWORD = 'Test123!@#'

async function main() {
  console.log('\n🚀 PADELYZER SIMPLE TEST SETUP\n')
  
  try {
    // 1. Clean database
    console.log('🧹 Cleaning database...')
    await prisma.$executeRaw`TRUNCATE "User", "Club", "SubscriptionPlan", "ClubSubscription" CASCADE`
    console.log('✅ Database cleaned\n')
    
    // 2. Create subscription plans
    console.log('📋 Creating subscription plans...')
    const trialPlan = await prisma.subscriptionPlan.create({
      data: {
        id: 'plan-trial',
        name: 'trial',
        displayName: 'Trial - 14 días',
        description: 'Prueba gratis',
        price: 0,
        currency: 'MXN',
        interval: 'month',
        features: { all: true },
        maxUsers: 5,
        maxCourts: 10,
        maxBookings: 1000,
        commissionRate: 5,
        isActive: true,
        sortOrder: 1,
        updatedAt: new Date()
      }
    })
    
    await prisma.subscriptionPlan.create({
      data: {
        id: 'plan-basic',
        name: 'basic',
        displayName: 'Básico',
        description: 'Plan básico',
        price: 199900,
        currency: 'MXN',
        interval: 'month',
        features: { all: true },
        maxUsers: 10,
        maxCourts: 20,
        maxBookings: 5000,
        commissionRate: 3,
        isActive: true,
        sortOrder: 2,
        updatedAt: new Date()
      }
    })
    console.log('✅ Plans created\n')
    
    // 3. Create test club
    console.log('🏢 Creating test club...')
    const club = await prisma.club.create({
      data: {
        id: 'club-test',
        name: 'Club Padel Test',
        slug: 'club-padel-test',
        email: 'club@test.com',
        phone: '2221234567',
        address: 'Av. Test 123',
        city: 'Puebla',
        state: 'Puebla',
        status: 'APPROVED',
        active: true,
        approvedAt: new Date(),
        approvedBy: 'system',
        updatedAt: new Date()
      }
    })
    
    // Create subscription for club
    await prisma.clubSubscription.create({
      data: {
        id: 'sub-test',
        clubId: club.id,
        planId: trialPlan.id,
        status: 'TRIALING',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    })
    console.log('✅ Club created with trial subscription\n')
    
    // 4. Create test users
    console.log('👥 Creating test users...')
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10)
    
    await prisma.user.create({
      data: {
        id: 'user-admin',
        email: 'admin@test.com',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        active: true,
        updatedAt: new Date()
      }
    })
    
    await prisma.user.create({
      data: {
        id: 'user-owner',
        email: 'owner@test.com',
        name: 'Club Owner',
        password: hashedPassword,
        role: 'CLUB_OWNER',
        clubId: club.id,
        active: true,
        updatedAt: new Date()
      }
    })
    
    await prisma.user.create({
      data: {
        id: 'user-staff',
        email: 'staff@test.com',
        name: 'Staff',
        password: hashedPassword,
        role: 'CLUB_STAFF',
        clubId: club.id,
        active: true,
        updatedAt: new Date()
      }
    })
    
    await prisma.user.create({
      data: {
        id: 'user-player',
        email: 'player@test.com',
        name: 'Player',
        password: hashedPassword,
        role: 'USER',
        active: true,
        updatedAt: new Date()
      }
    })
    console.log('✅ Users created\n')
    
    // Print credentials
    console.log('=====================================')
    console.log('🔑 TEST CREDENTIALS')
    console.log('=====================================')
    console.log('Super Admin:')
    console.log('  Email: admin@test.com')
    console.log('  Password:', TEST_PASSWORD)
    console.log('  URL: http://localhost:3000/admin')
    console.log('')
    console.log('Club Owner:')
    console.log('  Email: owner@test.com')
    console.log('  Password:', TEST_PASSWORD)
    console.log('  URL: http://localhost:3000/dashboard')
    console.log('')
    console.log('Club Staff:')
    console.log('  Email: staff@test.com')
    console.log('  Password:', TEST_PASSWORD)
    console.log('  URL: http://localhost:3000/dashboard')
    console.log('')
    console.log('Player:')
    console.log('  Email: player@test.com')
    console.log('  Password:', TEST_PASSWORD)
    console.log('  URL: http://localhost:3000/login')
    console.log('=====================================\n')
    
    console.log('✅ TEST ENVIRONMENT READY!')
    console.log('🚀 Start the app with: npm run dev')
    console.log('')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()