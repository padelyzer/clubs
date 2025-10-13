#!/usr/bin/env tsx

import { prisma } from '../lib/config/prisma'
import { getNowInTimezone, getDayBoundariesInTimezone } from '../lib/utils/timezone'

async function validateTimezoneConfig() {
  console.log('🔍 Validando configuración de timezone para todos los clubes...\n')

  try {
    // Get all clubs with their settings
    const clubs = await prisma.club.findMany({
      include: {
        ClubSettings: true,
      },
      orderBy: { name: 'asc' }
    })

    console.log(`📊 Total de clubes encontrados: ${clubs.length}\n`)

    for (const club of clubs) {
      console.log(`🏢 Club: ${club.name} (ID: ${club.id})`)
      console.log(`   Status: ${club.status}`)
      
      // Check if club has settings
      if (club.ClubSettings) {
        const timezone = club.ClubSettings.timezone || 'America/Mexico_City'
        console.log(`   ✅ Timezone configurado: ${timezone}`)
        
        // Test timezone functions
        try {
          const now = getNowInTimezone(timezone)
          const boundaries = getDayBoundariesInTimezone(now, timezone)
          
          console.log(`   📅 Fecha actual en timezone: ${now.toISOString()}`)
          console.log(`   🌅 Inicio del día: ${boundaries.start.toISOString()}`)
          console.log(`   🌇 Fin del día: ${boundaries.end.toISOString()}`)
          
        } catch (timezoneError) {
          console.log(`   ❌ Error con timezone ${timezone}:`, timezoneError.message)
        }
        
      } else {
        console.log(`   ⚠️  Sin configuración ClubSettings - usando default: America/Mexico_City`)
        
        // Create default settings
        try {
          await prisma.clubSettings.create({
            data: {
              id: `club_settings_${club.id}_${Date.now()}`,
              clubId: club.id,
              slotDuration: 90,
              bufferTime: 15,
              advanceBookingDays: 30,
              allowSameDayBooking: true,
              currency: 'MXN',
              taxIncluded: true,
              taxRate: 0,
              cancellationFee: 0,
              noShowFee: 0,
              timezone: 'America/Mexico_City'
            }
          })
          console.log(`   ✅ Configuración default creada`)
        } catch (createError) {
          console.log(`   ❌ Error creando configuración:`, createError.message)
        }
      }
      
      // Check recent bookings for this club
      const recentBookings = await prisma.booking.findMany({
        where: { 
          clubId: club.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
      
      console.log(`   📋 Reservas recientes (últimos 7 días): ${recentBookings.length}`)
      
      if (recentBookings.length > 0) {
        console.log(`   📝 Muestra de reservas:`)
        recentBookings.forEach((booking, index) => {
          console.log(`      ${index + 1}. ${booking.playerName} - ${booking.date.toISOString().split('T')[0]} ${booking.startTime}`)
        })
      }
      
      console.log('') // Empty line for readability
    }

    // Summary
    console.log('\n📈 RESUMEN:')
    console.log(`   Total clubes: ${clubs.length}`)
    console.log(`   Con configuración: ${clubs.filter(c => c.ClubSettings).length}`)
    console.log(`   Sin configuración: ${clubs.filter(c => !c.ClubSettings).length}`)
    
    // Test current time in different timezones
    console.log('\n🌍 COMPARACIÓN DE TIMEZONES (hora actual):')
    const timezones = [
      'America/Mexico_City',
      'America/Cancun', 
      'America/Tijuana',
      'UTC'
    ]
    
    timezones.forEach(tz => {
      try {
        const time = getNowInTimezone(tz)
        console.log(`   ${tz}: ${time.toLocaleString('es-MX', { timeZone: tz })}`)
      } catch (error) {
        console.log(`   ${tz}: ❌ Error - ${error.message}`)
      }
    })

  } catch (error) {
    console.error('❌ Error durante la validación:', error)
  } finally {
    await prisma.$disconnect()
  }
}

validateTimezoneConfig()