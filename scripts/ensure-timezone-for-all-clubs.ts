#!/usr/bin/env tsx

import { prisma } from '../lib/config/prisma'
import { getSmartDefaultTimezone } from '../lib/utils/timezone-detection'

async function ensureTimezoneForAllClubs() {
  console.log('🔧 Ensuring timezone configuration for all clubs...\n')
  
  try {
    // Get all active clubs
    const clubs = await prisma.club.findMany({
      where: { 
        status: 'APPROVED',
        active: true 
      },
      include: {
        ClubSettings: true
      }
    })

    console.log(`📊 Found ${clubs.length} active clubs to check\n`)

    let fixedCount = 0
    let alreadyConfiguredCount = 0

    for (const club of clubs) {
      console.log(`🏢 Checking ${club.name} (${club.id})`)
      
      if (!club.ClubSettings) {
        // No ClubSettings exist - create them
        const smartTimezone = getSmartDefaultTimezone({
          city: club.city || '',
          state: club.state || '',
          country: club.country || 'Mexico'
        })

        const clubSettingsId = `club_settings_${club.id}_${Date.now()}`
        
        await prisma.clubSettings.create({
          data: {
            id: clubSettingsId,
            clubId: club.id,
            currency: 'MXN',
            slotDuration: 90,
            bufferTime: 15,
            advanceBookingDays: 30,
            allowSameDayBooking: true,
            taxIncluded: true,
            taxRate: 16,
            cancellationFee: 0,
            noShowFee: 50,
            timezone: smartTimezone,
            acceptCash: true,
            terminalEnabled: false,
            transferEnabled: true,
            updatedAt: new Date()
          }
        })

        console.log(`   ✅ Created ClubSettings with timezone: ${smartTimezone}`)
        fixedCount++
      } else if (!club.ClubSettings.timezone) {
        // ClubSettings exist but no timezone - add timezone
        const smartTimezone = getSmartDefaultTimezone({
          city: club.city || '',
          state: club.state || '',
          country: club.country || 'Mexico'
        })

        await prisma.clubSettings.update({
          where: { id: club.ClubSettings.id },
          data: { 
            timezone: smartTimezone,
            updatedAt: new Date()
          }
        })

        console.log(`   ✅ Added timezone: ${smartTimezone}`)
        fixedCount++
      } else {
        console.log(`   ✓ Already configured with timezone: ${club.ClubSettings.timezone}`)
        alreadyConfiguredCount++
      }
    }

    // Verification - check all clubs have timezone now
    const allClubsAfterFix = await prisma.club.findMany({
      where: {
        status: 'APPROVED',
        active: true
      },
      include: {
        ClubSettings: true
      }
    })

    const clubsWithoutTimezone = allClubsAfterFix.filter(club => 
      !club.ClubSettings?.timezone || club.ClubSettings.timezone === ''
    )

    console.log('\n' + '='.repeat(60))
    console.log('📋 SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Clubs already configured: ${alreadyConfiguredCount}`)
    console.log(`🔧 Clubs fixed: ${fixedCount}`)
    console.log(`❌ Clubs still missing timezone: ${clubsWithoutTimezone.length}`)
    console.log(`📊 Total clubs processed: ${clubs.length}`)

    if (clubsWithoutTimezone.length === 0) {
      console.log('\n🎉 SUCCESS: All active clubs now have timezone configured!')
    } else {
      console.log('\n⚠️  WARNING: Some clubs still missing timezone:')
      clubsWithoutTimezone.forEach(club => {
        console.log(`   - ${club.name} (${club.id})`)
      })
    }

    // Create validation for future
    console.log('\n📝 Future clubs will automatically get:')
    console.log('   ✓ ClubSettings created during approval process')
    console.log('   ✓ Smart timezone detection based on location')
    console.log('   ✓ Fallback to America/Mexico_City if detection fails')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

ensureTimezoneForAllClubs()