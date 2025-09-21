/**
 * Script para corregir la configuración del Club Basic5
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Corrigiendo configuración del Club Basic5...\n')
  
  const clubId = 'club-basic5-001'
  
  // 1. Crear ClubSettings si no existe
  const existingSettings = await prisma.clubSettings.findUnique({
    where: { clubId }
  })
  
  if (!existingSettings) {
    const settings = await prisma.clubSettings.create({
      data: {
        id: `settings_${clubId}`,
        clubId,
        currency: 'MXN',
        slotDuration: 90,
        bufferTime: 15,
        advanceBookingDays: 30,
        allowSameDayBooking: true,
        taxIncluded: true,
        taxRate: 16,
        cancellationFee: 0,
        noShowFee: 50,
        timezone: 'America/Mexico_City',
        updatedAt: new Date()
      }
    })
    console.log('✅ ClubSettings creado para Basic5')
  } else {
    console.log('✓ ClubSettings ya existe')
  }
  
  // 2. Crear canchas si no existen
  const courts = await prisma.court.findMany({
    where: { clubId }
  })
  
  if (courts.length === 0) {
    for (let i = 1; i <= 3; i++) {
      await prisma.court.create({
        data: {
          id: `court_${clubId}_${i}`,
          clubId,
          name: `Cancha ${i}`,
          type: 'PADEL',
          indoor: false,
          order: i,
          active: true,
          updatedAt: new Date()
        }
      })
    }
    console.log('✅ 3 canchas creadas para Basic5')
  } else {
    console.log(`✓ Ya existen ${courts.length} canchas`)
  }
  
  // 3. Crear pricing default si no existe
  const pricing = await prisma.pricing.findFirst({
    where: { 
      clubId,
      isDefault: true
    }
  })
  
  if (!pricing) {
    await prisma.pricing.create({
      data: {
        id: `pricing_${clubId}_default`,
        clubId,
        name: 'Precio Regular',
        basePrice: 50000, // $500 MXN
        currency: 'MXN',
        isDefault: true,
        active: true,
        updatedAt: new Date()
      }
    })
    console.log('✅ Pricing default creado para Basic5')
  } else {
    console.log('✓ Pricing default ya existe')
  }
  
  console.log('\n✅ Configuración del Club Basic5 completada')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())