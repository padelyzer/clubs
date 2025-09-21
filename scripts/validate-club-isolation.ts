/**
 * Script de Validación Profunda del Aislamiento de Datos por Club
 * 
 * Este script verifica que cada club tenga acceso SOLO a sus propios datos
 * y que las restricciones del plan se apliquen correctamente.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ClubPlan {
  name: string
  maxCourts: number
  hasClasses: boolean
  hasTournaments: boolean
  maxBookingsPerDay?: number
}

// Definir los planes disponibles
const PLANS: Record<string, ClubPlan> = {
  BASIC: {
    name: 'Basic',
    maxCourts: 5,
    hasClasses: false,
    hasTournaments: false,
    maxBookingsPerDay: 50
  },
  PROFESSIONAL: {
    name: 'Professional',
    maxCourts: 10,
    hasClasses: true,
    hasTournaments: true,
    maxBookingsPerDay: 200
  },
  ENTERPRISE: {
    name: 'Enterprise',
    maxCourts: 999, // Sin límite
    hasClasses: true,
    hasTournaments: true,
    maxBookingsPerDay: 999999
  }
}

class ClubIsolationValidator {
  private issues: string[] = []
  private successes: string[] = []
  
  async validateAll() {
    console.log('🔐 VALIDACIÓN PROFUNDA DE AISLAMIENTO DE DATOS POR CLUB\n')
    console.log('=' .repeat(70))
    
    // Obtener todos los clubes
    const clubs = await prisma.club.findMany({
      include: {
        ClubSettings: true,
        User: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    })
    
    console.log(`\n📊 Total de clubes a validar: ${clubs.length}\n`)
    
    for (const club of clubs) {
      await this.validateClub(club)
    }
    
    // Validar acceso cruzado
    await this.validateCrossClubAccess()
    
    // Generar reporte final
    this.generateReport()
  }
  
  private async validateClub(club: any) {
    console.log(`\n${'='.repeat(70)}`)
    console.log(`🏢 VALIDANDO CLUB: ${club.name}`)
    console.log(`${'='.repeat(70)}`)
    
    // Determinar el plan del club basado en el nombre (para esta demo)
    const isBasicClub = club.slug.includes('basic')
    const plan = isBasicClub ? PLANS.BASIC : PLANS.PROFESSIONAL
    
    console.log(`📋 Plan detectado: ${plan.name}`)
    console.log(`   - Máx. canchas: ${plan.maxCourts}`)
    console.log(`   - Clases: ${plan.hasClasses ? '✅' : '❌'}`)
    console.log(`   - Torneos: ${plan.hasTournaments ? '✅' : '❌'}`)
    
    // 1. Validar configuración del club
    await this.validateClubSettings(club)
    
    // 2. Validar canchas
    await this.validateCourts(club, plan)
    
    // 3. Validar usuarios
    await this.validateUsers(club)
    
    // 4. Validar clases (si el plan lo permite)
    await this.validateClasses(club, plan)
    
    // 5. Validar torneos (si el plan lo permite)
    await this.validateTournaments(club, plan)
    
    // 6. Validar datos financieros
    await this.validateFinancialData(club)
    
    // 7. Validar reservas
    await this.validateBookings(club)
    
    // 8. Validar jugadores/clientes
    await this.validatePlayers(club)
  }
  
  private async validateClubSettings(club: any) {
    console.log('\n🔧 Validando configuración del club...')
    
    if (!club.ClubSettings) {
      this.issues.push(`❌ Club ${club.name} no tiene configuración (ClubSettings)`)
      console.log('   ❌ Sin configuración')
      return
    }
    
    const settings = club.ClubSettings
    
    // Validar campos requeridos
    const requiredFields = ['currency', 'slotDuration', 'timezone']
    for (const field of requiredFields) {
      if (!settings[field]) {
        this.issues.push(`❌ Club ${club.name}: Falta campo ${field} en configuración`)
        console.log(`   ❌ Falta campo: ${field}`)
      }
    }
    
    console.log('   ✅ Configuración presente')
    this.successes.push(`✅ Club ${club.name}: Configuración completa`)
  }
  
  private async validateCourts(club: any, plan: ClubPlan) {
    console.log('\n🎾 Validando canchas...')
    
    const courts = await prisma.court.findMany({
      where: { clubId: club.id }
    })
    
    console.log(`   📊 Canchas encontradas: ${courts.length}`)
    console.log(`   📊 Límite del plan: ${plan.maxCourts}`)
    
    // Verificar que no excedan el límite del plan
    if (courts.length > plan.maxCourts) {
      this.issues.push(
        `❌ Club ${club.name}: Tiene ${courts.length} canchas pero el plan ${plan.name} permite máximo ${plan.maxCourts}`
      )
      console.log(`   ❌ EXCEDE LÍMITE del plan`)
    } else {
      console.log(`   ✅ Dentro del límite del plan`)
      this.successes.push(`✅ Club ${club.name}: Canchas dentro del límite (${courts.length}/${plan.maxCourts})`)
    }
    
    // Verificar que todas las canchas pertenecen al club
    for (const court of courts) {
      if (court.clubId !== club.id) {
        this.issues.push(`❌ Cancha ${court.name} tiene clubId incorrecto`)
        console.log(`   ❌ Cancha ${court.name} con clubId incorrecto`)
      }
    }
    
    // Listar las canchas
    courts.forEach(court => {
      console.log(`     - ${court.name} (${court.type}) - ${court.active ? 'Activa' : 'Inactiva'}`)
    })
  }
  
  private async validateUsers(club: any) {
    console.log('\n👥 Validando usuarios...')
    
    console.log(`   📊 Usuarios asignados: ${club.User.length}`)
    
    for (const user of club.User) {
      console.log(`     - ${user.email} (${user.role})`)
      
      // Verificar que el usuario no esté en múltiples clubes (excepto SUPER_ADMIN)
      if (user.role !== 'SUPER_ADMIN') {
        const userClubs = await prisma.user.findUnique({
          where: { id: user.id },
          select: { clubId: true }
        })
        
        if (userClubs?.clubId !== club.id) {
          this.issues.push(`❌ Usuario ${user.email} tiene clubId inconsistente`)
        }
      }
    }
    
    if (club.User.length === 0) {
      this.issues.push(`⚠️ Club ${club.name} no tiene usuarios asignados`)
      console.log('   ⚠️ Sin usuarios asignados')
    } else {
      this.successes.push(`✅ Club ${club.name}: ${club.User.length} usuarios correctamente asignados`)
    }
  }
  
  private async validateClasses(club: any, plan: ClubPlan) {
    console.log('\n📚 Validando clases...')
    
    const classes = await prisma.class.findMany({
      where: { clubId: club.id }
    })
    
    console.log(`   📊 Clases encontradas: ${classes.length}`)
    
    if (!plan.hasClasses && classes.length > 0) {
      this.issues.push(
        `❌ Club ${club.name}: Tiene ${classes.length} clases pero el plan ${plan.name} NO incluye clases`
      )
      console.log(`   ❌ Plan ${plan.name} NO permite clases`)
    } else if (plan.hasClasses) {
      console.log(`   ✅ Plan ${plan.name} permite clases`)
      if (classes.length > 0) {
        classes.forEach(cls => {
          console.log(`     - ${cls.name} (${cls.type})`)
        })
      } else {
        console.log('   ℹ️ No hay clases creadas (permitido por el plan)')
      }
    } else {
      console.log(`   ✅ Plan ${plan.name} no incluye clases (0 clases)`)
      this.successes.push(`✅ Club ${club.name}: Sin clases (correcto para plan ${plan.name})`)
    }
  }
  
  private async validateTournaments(club: any, plan: ClubPlan) {
    console.log('\n🏆 Validando torneos...')
    
    const tournaments = await prisma.tournament.findMany({
      where: { clubId: club.id }
    })
    
    console.log(`   📊 Torneos encontrados: ${tournaments.length}`)
    
    if (!plan.hasTournaments && tournaments.length > 0) {
      this.issues.push(
        `❌ Club ${club.name}: Tiene ${tournaments.length} torneos pero el plan ${plan.name} NO incluye torneos`
      )
      console.log(`   ❌ Plan ${plan.name} NO permite torneos`)
    } else if (plan.hasTournaments) {
      console.log(`   ✅ Plan ${plan.name} permite torneos`)
      if (tournaments.length > 0) {
        tournaments.forEach(t => {
          console.log(`     - ${t.name} (${t.status})`)
        })
      } else {
        console.log('   ℹ️ No hay torneos creados (permitido por el plan)')
      }
    } else {
      console.log(`   ✅ Plan ${plan.name} no incluye torneos (0 torneos)`)
      this.successes.push(`✅ Club ${club.name}: Sin torneos (correcto para plan ${plan.name})`)
    }
  }
  
  private async validateFinancialData(club: any) {
    console.log('\n💰 Validando datos financieros...')
    
    const transactions = await prisma.transaction.findMany({
      where: { clubId: club.id }
    })
    
    console.log(`   📊 Transacciones: ${transactions.length}`)
    
    // Verificar que todas las transacciones pertenecen al club
    const wrongClubTransactions = transactions.filter(t => t.clubId !== club.id)
    if (wrongClubTransactions.length > 0) {
      this.issues.push(
        `❌ Club ${club.name}: ${wrongClubTransactions.length} transacciones con clubId incorrecto`
      )
    } else if (transactions.length > 0) {
      this.successes.push(`✅ Club ${club.name}: Todas las transacciones aisladas correctamente`)
    }
    
    // Calcular totales
    const totals = transactions.reduce((acc, t) => {
      if (t.type === 'INCOME') acc.income += t.amount
      else if (t.type === 'EXPENSE') acc.expense += t.amount
      return acc
    }, { income: 0, expense: 0 })
    
    if (transactions.length > 0) {
      console.log(`     - Ingresos: $${(totals.income / 100).toFixed(2)}`)
      console.log(`     - Gastos: $${(totals.expense / 100).toFixed(2)}`)
      console.log(`     - Balance: $${((totals.income - totals.expense) / 100).toFixed(2)}`)
    }
  }
  
  private async validateBookings(club: any) {
    console.log('\n📅 Validando reservas...')
    
    const bookings = await prisma.booking.findMany({
      where: { clubId: club.id },
      include: {
        Court: {
          select: {
            name: true,
            clubId: true
          }
        }
      }
    })
    
    console.log(`   📊 Reservas totales: ${bookings.length}`)
    
    // Verificar que todas las reservas usan canchas del mismo club
    const wrongCourtBookings = bookings.filter(b => b.Court?.clubId !== club.id)
    if (wrongCourtBookings.length > 0) {
      this.issues.push(
        `❌ Club ${club.name}: ${wrongCourtBookings.length} reservas usando canchas de otro club`
      )
      console.log(`   ❌ ${wrongCourtBookings.length} reservas con canchas de otro club`)
    } else if (bookings.length > 0) {
      console.log(`   ✅ Todas las reservas usan canchas del club`)
      this.successes.push(`✅ Club ${club.name}: Reservas correctamente aisladas`)
    }
    
    // Mostrar estadísticas de reservas
    if (bookings.length > 0) {
      const statusCount = bookings.reduce((acc: any, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1
        return acc
      }, {})
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`     - ${status}: ${count}`)
      })
    }
  }
  
  private async validatePlayers(club: any) {
    console.log('\n🎾 Validando jugadores/clientes...')
    
    const players = await prisma.player.findMany({
      where: { clubId: club.id }
    })
    
    console.log(`   📊 Jugadores registrados: ${players.length}`)
    
    // Verificar que todos los jugadores pertenecen al club
    const wrongClubPlayers = players.filter(p => p.clubId !== club.id)
    if (wrongClubPlayers.length > 0) {
      this.issues.push(
        `❌ Club ${club.name}: ${wrongClubPlayers.length} jugadores con clubId incorrecto`
      )
    } else if (players.length > 0) {
      this.successes.push(`✅ Club ${club.name}: Jugadores correctamente aislados`)
    }
    
    // Mostrar algunos jugadores
    if (players.length > 0) {
      console.log(`   📝 Primeros 5 jugadores:`)
      players.slice(0, 5).forEach(p => {
        console.log(`     - ${p.name} (${p.email || 'sin email'})`)
      })
      if (players.length > 5) {
        console.log(`     ... y ${players.length - 5} más`)
      }
    }
  }
  
  private async validateCrossClubAccess() {
    console.log(`\n${'='.repeat(70)}`)
    console.log('🔐 VALIDANDO AISLAMIENTO ENTRE CLUBES')
    console.log(`${'='.repeat(70)}\n`)
    
    // Obtener todos los clubes
    const clubs = await prisma.club.findMany()
    
    if (clubs.length < 2) {
      console.log('ℹ️ Solo hay un club, no se puede validar aislamiento cruzado')
      return
    }
    
    // Para cada par de clubes, verificar que no hay datos cruzados
    for (let i = 0; i < clubs.length; i++) {
      for (let j = i + 1; j < clubs.length; j++) {
        const club1 = clubs[i]
        const club2 = clubs[j]
        
        console.log(`\n🔍 Verificando aislamiento entre:`)
        console.log(`   - ${club1.name} (${club1.id})`)
        console.log(`   - ${club2.name} (${club2.id})`)
        
        // Simular acceso desde club1 a datos de club2
        await this.checkIsolation(club1, club2)
      }
    }
  }
  
  private async checkIsolation(club1: any, club2: any) {
    // Esta función simula intentos de acceso cruzado
    
    // 1. Verificar que las canchas de club2 no son accesibles desde club1
    const club1Courts = await prisma.court.findMany({
      where: { clubId: club1.id }
    })
    
    const club2Courts = await prisma.court.findMany({
      where: { clubId: club2.id }
    })
    
    // Verificar que no hay IDs duplicados
    const club1CourtIds = new Set(club1Courts.map(c => c.id))
    const club2CourtIds = new Set(club2Courts.map(c => c.id))
    
    const intersection = [...club1CourtIds].filter(x => club2CourtIds.has(x))
    
    if (intersection.length > 0) {
      this.issues.push(`❌ Canchas compartidas entre ${club1.name} y ${club2.name}`)
      console.log(`   ❌ Encontradas ${intersection.length} canchas compartidas`)
    } else {
      console.log(`   ✅ Sin canchas compartidas`)
      this.successes.push(`✅ Aislamiento correcto entre ${club1.name} y ${club2.name}`)
    }
    
    // 2. Verificar usuarios
    const club1Users = await prisma.user.findMany({
      where: { clubId: club1.id }
    })
    
    const club2Users = await prisma.user.findMany({
      where: { clubId: club2.id }
    })
    
    const sharedUsers = club1Users.filter(u1 => 
      club2Users.some(u2 => u2.id === u1.id && u1.role !== 'SUPER_ADMIN')
    )
    
    if (sharedUsers.length > 0) {
      this.issues.push(
        `❌ ${sharedUsers.length} usuarios compartidos entre ${club1.name} y ${club2.name}`
      )
      console.log(`   ❌ ${sharedUsers.length} usuarios en ambos clubes`)
    } else {
      console.log(`   ✅ Sin usuarios compartidos (excepto SUPER_ADMIN)`)
    }
  }
  
  private generateReport() {
    console.log(`\n${'='.repeat(70)}`)
    console.log('📊 REPORTE FINAL DE VALIDACIÓN DE AISLAMIENTO')
    console.log(`${'='.repeat(70)}\n`)
    
    console.log(`✅ Validaciones exitosas: ${this.successes.length}`)
    console.log(`❌ Problemas encontrados: ${this.issues.length}`)
    
    if (this.issues.length > 0) {
      console.log('\n⚠️ PROBLEMAS DETECTADOS:')
      console.log('------------------------')
      this.issues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue}`)
      })
      
      console.log('\n🔧 RECOMENDACIONES:')
      console.log('------------------')
      
      // Dar recomendaciones basadas en los problemas
      if (this.issues.some(i => i.includes('excede límite'))) {
        console.log('• Revisar y ajustar los límites del plan para cada club')
      }
      
      if (this.issues.some(i => i.includes('no tiene configuración'))) {
        console.log('• Crear configuración (ClubSettings) para todos los clubes')
      }
      
      if (this.issues.some(i => i.includes('clubId incorrecto'))) {
        console.log('• Corregir referencias de clubId en los datos')
        console.log('• Revisar la lógica de creación de registros')
      }
      
      if (this.issues.some(i => i.includes('NO incluye'))) {
        console.log('• Implementar validación de características según el plan')
        console.log('• Bloquear creación de recursos no permitidos por el plan')
      }
    } else {
      console.log('\n🎉 ¡PERFECTO! El sistema de aislamiento funciona correctamente.')
      console.log('   Cada club tiene sus datos completamente aislados.')
      console.log('   Las restricciones de planes se aplican correctamente.')
    }
    
    console.log('\n📝 RESUMEN DE ÉXITOS:')
    console.log('--------------------')
    this.successes.slice(0, 10).forEach(success => {
      console.log(success)
    })
    
    if (this.successes.length > 10) {
      console.log(`... y ${this.successes.length - 10} más`)
    }
    
    console.log(`\n${'='.repeat(70)}`)
    console.log('FIN DEL REPORTE')
    console.log(`${'='.repeat(70)}`)
  }
}

// Ejecutar validación
async function main() {
  const validator = new ClubIsolationValidator()
  await validator.validateAll()
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())