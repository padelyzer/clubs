import { prisma } from '../lib/config/prisma'

async function checkClubSchedule() {
  try {
    console.log('🔍 Verificando configuración de horarios del club...\n')
    
    // Obtener el club y su configuración
    const club = await prisma.club.findFirst()
    
    if (!club) {
      console.log('❌ No se encontró club')
      return
    }
    
    console.log(`🏢 Club: ${club.name}`)
    console.log(`   ID: ${club.id}\n`)
    
    // Buscar configuración del club
    const clubSettings = await prisma.clubSettings.findUnique({
      where: { clubId: club.id }
    })
    
    if (clubSettings) {
      console.log('⚙️  Configuración encontrada:')
      console.log(`   ID: ${clubSettings.id}`)
      console.log(`   Zona Horaria: ${clubSettings.timezone}`)
      console.log(`   Moneda: ${clubSettings.currency}`)
      
      // Verificar si hay campos de horarios
      const settings = clubSettings as any
      const scheduleFields = Object.keys(settings).filter(key => 
        key.includes('hour') || key.includes('schedule') || key.includes('time') || 
        key.includes('open') || key.includes('close')
      )
      
      if (scheduleFields.length > 0) {
        console.log('\n📅 Campos relacionados con horarios:')
        scheduleFields.forEach(field => {
          console.log(`   - ${field}: ${settings[field]}`)
        })
      } else {
        console.log('\n❌ No hay campos de horarios en ClubSettings')
      }
    } else {
      console.log('❌ No se encontró configuración para el club')
    }
    
    // Buscar tabla de Schedule si existe
    try {
      // Verificar si existe la tabla Schedule
      const schedules = await prisma.schedule?.findMany({
        where: { clubId: club.id }
      }).catch((): null => null)
      
      if (schedules && schedules.length > 0) {
        console.log('\n📋 Horarios configurados:')
        schedules.forEach((schedule: any) => {
          console.log(`   - ${schedule.dayOfWeek}: ${schedule.openTime} - ${schedule.closeTime}`)
        })
      } else {
        console.log('\n❌ No hay tabla Schedule o está vacía')
      }
    } catch (error) {
      console.log('\n❌ No existe la tabla Schedule en el schema')
    }
    
    // Buscar configuraciones generales que puedan tener horarios
    console.log('\n🔍 Buscando otras configuraciones...')
    
    // Verificar estructura completa de ClubSettings
    if (clubSettings) {
      console.log('\n📋 Estructura completa de ClubSettings:')
      Object.entries(clubSettings).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          console.log(`   - ${key}: ${value}`)
        }
      })
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkClubSchedule()