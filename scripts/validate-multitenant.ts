/**
 * Script de Validación del Sistema Multitenant
 * 
 * Este script verifica que el sistema de aislamiento de datos
 * esté funcionando correctamente para todos los clubes.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ValidationResult {
  passed: boolean
  message: string
  details?: any
}

class MultitenantValidator {
  private results: ValidationResult[] = []
  
  async validateAll() {
    console.log('🔍 INICIANDO VALIDACIÓN DEL SISTEMA MULTITENANT\n')
    console.log('=' .repeat(60))
    
    // 1. Verificar estructura de clubes
    await this.validateClubStructure()
    
    // 2. Verificar usuarios y sus asignaciones
    await this.validateUserAssignments()
    
    // 3. Verificar aislamiento de datos
    await this.validateDataIsolation()
    
    // 4. Verificar integridad referencial
    await this.validateReferentialIntegrity()
    
    // 5. Verificar que no hay datos huérfanos
    await this.validateNoOrphanData()
    
    // 6. Generar reporte final
    this.generateReport()
  }
  
  private async validateClubStructure() {
    console.log('\n📊 1. VALIDANDO ESTRUCTURA DE CLUBES')
    console.log('-'.repeat(40))
    
    try {
      // Obtener todos los clubes
      const clubs = await prisma.club.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          active: true,
          status: true,
          _count: {
            select: {
              User: true,
              Booking: true,
              Player: true,
              Court: true,
              Tournament: true,
              Transaction: true
            }
          }
        }
      })
      
      console.log(`✓ Total de clubes: ${clubs.length}`)
      
      for (const club of clubs) {
        console.log(`\n  Club: ${club.name} (${club.slug})`)
        console.log(`    ID: ${club.id}`)
        console.log(`    Estado: ${club.active ? 'Activo' : 'Inactivo'} - ${club.status}`)
        console.log(`    Usuarios: ${club._count.User}`)
        console.log(`    Reservas: ${club._count.Booking}`)
        console.log(`    Clientes: ${club._count.Player}`)
        console.log(`    Canchas: ${club._count.Court}`)
        console.log(`    Torneos: ${club._count.Tournament}`)
        console.log(`    Transacciones: ${club._count.Transaction}`)
        
        // Validar que cada club tenga al menos configuración básica
        const settings = await prisma.clubSettings.findUnique({
          where: { clubId: club.id }
        })
        
        if (!settings) {
          this.results.push({
            passed: false,
            message: `Club ${club.name} no tiene configuración (ClubSettings)`,
            details: { clubId: club.id }
          })
        } else {
          console.log(`    ✓ Configuración OK`)
        }
        
        // Validar que tenga al menos una cancha
        if (club._count.Court === 0) {
          this.results.push({
            passed: false,
            message: `Club ${club.name} no tiene canchas`,
            details: { clubId: club.id }
          })
        }
      }
      
      // Verificar slugs únicos
      const slugs = clubs.map(c => c.slug)
      const uniqueSlugs = new Set(slugs)
      if (slugs.length !== uniqueSlugs.size) {
        this.results.push({
          passed: false,
          message: 'Hay slugs duplicados entre clubes',
          details: { slugs }
        })
      } else {
        this.results.push({
          passed: true,
          message: 'Todos los slugs son únicos'
        })
      }
      
    } catch (error) {
      this.results.push({
        passed: false,
        message: 'Error validando estructura de clubes',
        details: error
      })
    }
  }
  
  private async validateUserAssignments() {
    console.log('\n👥 2. VALIDANDO ASIGNACIÓN DE USUARIOS')
    console.log('-'.repeat(40))
    
    try {
      // Usuarios sin club
      const usersWithoutClub = await prisma.user.findMany({
        where: { clubId: null },
        select: { id: true, email: true, role: true }
      })
      
      if (usersWithoutClub.length > 0) {
        console.log(`⚠️  Usuarios sin club asignado: ${usersWithoutClub.length}`)
        for (const user of usersWithoutClub) {
          console.log(`    - ${user.email} (${user.role})`)
        }
        
        // Solo es problema si no son SUPER_ADMIN
        const nonAdminWithoutClub = usersWithoutClub.filter(u => u.role !== 'SUPER_ADMIN')
        if (nonAdminWithoutClub.length > 0) {
          this.results.push({
            passed: false,
            message: `${nonAdminWithoutClub.length} usuarios no-admin sin club`,
            details: nonAdminWithoutClub
          })
        }
      } else {
        console.log('✓ Todos los usuarios tienen club asignado')
      }
      
      // Verificar que clubId de usuarios existe
      const usersWithClub = await prisma.user.findMany({
        where: { clubId: { not: null } },
        include: { Club: true }
      })
      
      const usersWithInvalidClub = usersWithClub.filter(u => !u.Club)
      if (usersWithInvalidClub.length > 0) {
        this.results.push({
          passed: false,
          message: 'Usuarios con clubId inválido',
          details: usersWithInvalidClub.map(u => ({ email: u.email, clubId: u.clubId }))
        })
      } else {
        console.log('✓ Todos los clubId de usuarios son válidos')
        this.results.push({
          passed: true,
          message: 'Asignación de usuarios correcta'
        })
      }
      
    } catch (error) {
      this.results.push({
        passed: false,
        message: 'Error validando asignación de usuarios',
        details: error
      })
    }
  }
  
  private async validateDataIsolation() {
    console.log('\n🔒 3. VALIDANDO AISLAMIENTO DE DATOS')
    console.log('-'.repeat(40))
    
    try {
      // Verificar que cada tipo de dato tiene clubId válido
      const tables = [
        { name: 'Booking', model: prisma.booking },
        { name: 'Player', model: prisma.player },
        { name: 'Court', model: prisma.court },
        { name: 'Tournament', model: prisma.tournament },
        { name: 'Transaction', model: prisma.transaction },
        { name: 'Class', model: prisma.class }
      ]
      
      for (const table of tables) {
        const records = await (table.model as any).findMany({
          select: { clubId: true }
        })
        
        const uniqueClubIds = [...new Set(records.map((r: any) => r.clubId))]
        
        // Verificar que todos los clubIds existen
        const validClubs = await prisma.club.findMany({
          where: { id: { in: uniqueClubIds } },
          select: { id: true }
        })
        
        const validClubIds = new Set(validClubs.map(c => c.id))
        const invalidClubIds = uniqueClubIds.filter(id => !validClubIds.has(id))
        
        if (invalidClubIds.length > 0) {
          this.results.push({
            passed: false,
            message: `${table.name} tiene registros con clubId inválido`,
            details: { invalidClubIds }
          })
          console.log(`❌ ${table.name}: ${invalidClubIds.length} clubIds inválidos`)
        } else {
          console.log(`✓ ${table.name}: Todos los clubIds son válidos (${uniqueClubIds.length} clubes)`)
        }
      }
      
      this.results.push({
        passed: true,
        message: 'Aislamiento de datos verificado'
      })
      
    } catch (error) {
      this.results.push({
        passed: false,
        message: 'Error validando aislamiento de datos',
        details: error
      })
    }
  }
  
  private async validateReferentialIntegrity() {
    console.log('\n🔗 4. VALIDANDO INTEGRIDAD REFERENCIAL')
    console.log('-'.repeat(40))
    
    try {
      // Verificar que las reservas apuntan a canchas del mismo club
      const bookingsWithWrongCourt = await prisma.$queryRaw`
        SELECT b.id, b."clubId" as booking_club, c."clubId" as court_club
        FROM "Booking" b
        JOIN "Court" c ON b."courtId" = c.id
        WHERE b."clubId" != c."clubId"
      ` as any[]
      
      if (bookingsWithWrongCourt.length > 0) {
        this.results.push({
          passed: false,
          message: `${bookingsWithWrongCourt.length} reservas apuntan a canchas de otro club`,
          details: bookingsWithWrongCourt
        })
        console.log(`❌ ${bookingsWithWrongCourt.length} reservas con cancha incorrecta`)
      } else {
        console.log('✓ Todas las reservas usan canchas del mismo club')
      }
      
      // Verificar que las clases apuntan a canchas del mismo club
      const classesWithWrongCourt = await prisma.$queryRaw`
        SELECT cl.id, cl."clubId" as class_club, c."clubId" as court_club
        FROM "Class" cl
        LEFT JOIN "Court" c ON cl."courtId" = c.id
        WHERE cl."courtId" IS NOT NULL AND cl."clubId" != c."clubId"
      ` as any[]
      
      if (classesWithWrongCourt.length > 0) {
        this.results.push({
          passed: false,
          message: `${classesWithWrongCourt.length} clases apuntan a canchas de otro club`,
          details: classesWithWrongCourt
        })
        console.log(`❌ ${classesWithWrongCourt.length} clases con cancha incorrecta`)
      } else {
        console.log('✓ Todas las clases usan canchas del mismo club')
        this.results.push({
          passed: true,
          message: 'Integridad referencial correcta'
        })
      }
      
    } catch (error) {
      this.results.push({
        passed: false,
        message: 'Error validando integridad referencial',
        details: error
      })
    }
  }
  
  private async validateNoOrphanData() {
    console.log('\n🔍 5. VALIDANDO DATOS HUÉRFANOS')
    console.log('-'.repeat(40))
    
    try {
      // En Prisma, clubId es requerido por lo que no puede ser null
      // Verificamos si hay registros apuntando a clubs que no existen
      
      // Obtener todos los clubIds válidos
      const validClubs = await prisma.club.findMany({
        select: { id: true }
      })
      const validClubIds = new Set(validClubs.map(c => c.id))
      
      // Verificar bookings
      const allBookings = await prisma.booking.findMany({
        select: { id: true, clubId: true }
      })
      const orphanBookings = allBookings.filter(b => !validClubIds.has(b.clubId))
      
      // Verificar players
      const allPlayers = await prisma.player.findMany({
        select: { id: true, clubId: true }
      })
      const orphanPlayers = allPlayers.filter(p => !validClubIds.has(p.clubId))
      
      // Verificar courts
      const allCourts = await prisma.court.findMany({
        select: { id: true, clubId: true }
      })
      const orphanCourts = allCourts.filter(c => !validClubIds.has(c.clubId))
      
      const orphanData = [
        { table: 'Booking', count: orphanBookings.length },
        { table: 'Player', count: orphanPlayers.length },
        { table: 'Court', count: orphanCourts.length }
      ].filter(d => d.count > 0)
      
      if (orphanData.length > 0) {
        this.results.push({
          passed: false,
          message: 'Hay datos apuntando a clubs que no existen',
          details: orphanData
        })
        orphanData.forEach(d => {
          console.log(`❌ ${d.table}: ${d.count} registros con clubId inválido`)
        })
      } else {
        console.log('✓ No hay datos huérfanos')
        this.results.push({
          passed: true,
          message: 'No hay datos huérfanos'
        })
      }
      
    } catch (error) {
      this.results.push({
        passed: false,
        message: 'Error validando datos huérfanos',
        details: error
      })
    }
  }
  
  private generateReport() {
    console.log('\n' + '='.repeat(60))
    console.log('📋 REPORTE FINAL DE VALIDACIÓN')
    console.log('='.repeat(60))
    
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    
    console.log(`\n✅ Pruebas pasadas: ${passed}`)
    console.log(`❌ Pruebas fallidas: ${failed}`)
    
    if (failed > 0) {
      console.log('\n⚠️  PROBLEMAS ENCONTRADOS:')
      this.results.filter(r => !r.passed).forEach((r, i) => {
        console.log(`\n${i + 1}. ${r.message}`)
        if (r.details) {
          console.log('   Detalles:', JSON.stringify(r.details, null, 2))
        }
      })
    } else {
      console.log('\n🎉 ¡SISTEMA MULTITENANT FUNCIONANDO CORRECTAMENTE!')
    }
    
    console.log('\n' + '='.repeat(60))
  }
}

// Ejecutar validación
async function main() {
  const validator = new MultitenantValidator()
  await validator.validateAll()
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())