import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
    }
  }
})

async function fixClubScheduleRules() {
  console.log('🔧 Configurando horarios para Club Demo Padelyzer...\n')
  
  try {
    // 1. Find club
    const club = await prisma.club.findFirst({
      where: { slug: 'club-demo-padelyzer' }
    })
    
    if (!club) {
      console.log('❌ Club no encontrado')
      return
    }
    
    console.log('✅ Club encontrado:', club.name)
    
    // 2. Create schedule rules for all days
    console.log('\n📅 Creando reglas de horario...')
    const daysOfWeek = [
      { day: 1, name: 'Lunes' },
      { day: 2, name: 'Martes' },
      { day: 3, name: 'Miércoles' },
      { day: 4, name: 'Jueves' },
      { day: 5, name: 'Viernes' },
      { day: 6, name: 'Sábado' },
      { day: 0, name: 'Domingo' }
    ]
    
    for (const { day, name } of daysOfWeek) {
      // Check if rule already exists
      const existing = await prisma.scheduleRule.findFirst({
        where: {
          clubId: club.id,
          dayOfWeek: day
        }
      })
      
      if (!existing) {
        await prisma.scheduleRule.create({
          data: {
            id: `schedule_${club.id}_${day}_${Date.now()}`,
            clubId: club.id,
            name: `Horario ${name}`,
            dayOfWeek: day,
            startTime: '07:00',
            endTime: '23:00',
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        console.log(`✅ Regla creada para ${name}`)
      } else {
        console.log(`⚠️  Ya existe regla para ${name}`)
      }
    }
    
    // 3. Update club settings to include operating hours
    console.log('\n🕐 Actualizando horario de operación...')
    const operatingHours = {
      monday: { open: '07:00', close: '23:00' },
      tuesday: { open: '07:00', close: '23:00' },
      wednesday: { open: '07:00', close: '23:00' },
      thursday: { open: '07:00', close: '23:00' },
      friday: { open: '07:00', close: '23:00' },
      saturday: { open: '07:00', close: '23:00' },
      sunday: { open: '07:00', close: '23:00' }
    }
    
    await prisma.clubSettings.update({
      where: { clubId: club.id },
      data: {
        operatingHours: operatingHours,
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Horario de operación actualizado')
    
    // 4. Verify configuration
    console.log('\n✅ Configuración completada!')
    console.log('   Horario: 7:00 AM - 11:00 PM todos los días')
    console.log('   Slots de 90 minutos disponibles')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixClubScheduleRules()