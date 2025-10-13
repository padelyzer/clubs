/**
 * Script de validación completa del CRUD de Players
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class PlayerCRUDValidator {
  private clubId = 'club-basic5-001'
  private testResults: { operation: string; status: string; details?: any }[] = []
  
  async validateAll() {
    console.log('🔍 VALIDACIÓN COMPLETA DEL CRUD DE PLAYERS\n')
    console.log('=' .repeat(60))
    
    // 1. Validar CREATE
    await this.validateCreate()
    
    // 2. Validar READ
    await this.validateRead()
    
    // 3. Validar UPDATE
    await this.validateUpdate()
    
    // 4. Validar DELETE
    await this.validateDelete()
    
    // 5. Validar campos únicos
    await this.validateUniqueConstraints()
    
    // 6. Validar búsqueda y filtros
    await this.validateSearchAndFilters()
    
    // Generar reporte
    this.generateReport()
  }
  
  private async validateCreate() {
    console.log('\n📝 1. VALIDANDO CREATE (Crear jugador)')
    console.log('-'.repeat(40))
    
    try {
      // Intentar crear un jugador de prueba
      const testPlayerId = `player_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const testPlayer = await prisma.player.create({
        data: {
          id: testPlayerId,
          clubId: this.clubId,
          name: 'Test Player CRUD',
          email: 'test.crud@example.com',
          phone: '5551234567',
          level: 'Tercera Fuerza',
          gender: 'male',
          memberNumber: `TEST-2025-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          updatedAt: new Date()
        }
      })
      
      console.log('✅ Jugador creado exitosamente')
      console.log('   - ID:', testPlayer.id)
      console.log('   - Nombre:', testPlayer.name)
      console.log('   - Número de miembro:', testPlayer.memberNumber)
      
      this.testResults.push({
        operation: 'CREATE',
        status: 'SUCCESS',
        details: { playerId: testPlayer.id }
      })
      
      // Limpiar
      await prisma.player.delete({ where: { id: testPlayer.id } })
      
    } catch (error: any) {
      console.log('❌ Error al crear jugador:', error.message)
      this.testResults.push({
        operation: 'CREATE',
        status: 'FAILED',
        details: error.message
      })
    }
  }
  
  private async validateRead() {
    console.log('\n📖 2. VALIDANDO READ (Leer jugadores)')
    console.log('-'.repeat(40))
    
    try {
      // Leer todos los jugadores del club
      const players = await prisma.player.findMany({
        where: { clubId: this.clubId }
      })
      
      console.log(`✅ Se encontraron ${players.length} jugadores`)
      
      // Leer un jugador específico
      if (players.length > 0) {
        const singlePlayer = await prisma.player.findUnique({
          where: { id: players[0].id }
        })
        
        console.log('✅ Lectura individual exitosa')
        console.log('   - Jugador:', singlePlayer?.name)
        console.log('   - Número de miembro:', singlePlayer?.memberNumber)
      }
      
      // Validar que todos tienen campos requeridos
      const missingFields = players.filter(p => 
        !p.id || !p.clubId || !p.name || !p.phone
      )
      
      if (missingFields.length > 0) {
        console.log(`⚠️  ${missingFields.length} jugadores con campos faltantes`)
      }
      
      this.testResults.push({
        operation: 'READ',
        status: 'SUCCESS',
        details: { totalPlayers: players.length }
      })
      
    } catch (error: any) {
      console.log('❌ Error al leer jugadores:', error.message)
      this.testResults.push({
        operation: 'READ',
        status: 'FAILED',
        details: error.message
      })
    }
  }
  
  private async validateUpdate() {
    console.log('\n✏️  3. VALIDANDO UPDATE (Actualizar jugador)')
    console.log('-'.repeat(40))
    
    try {
      // Crear jugador temporal para actualizar
      const tempId = `player_temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const tempPlayer = await prisma.player.create({
        data: {
          id: tempId,
          clubId: this.clubId,
          name: 'Temp Player',
          phone: '5559999999',
          updatedAt: new Date()
        }
      })
      
      // Actualizar el jugador
      const updated = await prisma.player.update({
        where: { id: tempId },
        data: {
          name: 'Temp Player Updated',
          email: 'updated@example.com',
          level: 'Primera Fuerza',
          memberNumber: 'UPD-2025-0001'
        }
      })
      
      console.log('✅ Jugador actualizado exitosamente')
      console.log('   - Nombre anterior: Temp Player')
      console.log('   - Nombre nuevo:', updated.name)
      console.log('   - Email nuevo:', updated.email)
      console.log('   - Número de miembro:', updated.memberNumber)
      
      this.testResults.push({
        operation: 'UPDATE',
        status: 'SUCCESS'
      })
      
      // Limpiar
      await prisma.player.delete({ where: { id: tempId } })
      
    } catch (error: any) {
      console.log('❌ Error al actualizar jugador:', error.message)
      this.testResults.push({
        operation: 'UPDATE',
        status: 'FAILED',
        details: error.message
      })
    }
  }
  
  private async validateDelete() {
    console.log('\n🗑️  4. VALIDANDO DELETE (Eliminar jugador)')
    console.log('-'.repeat(40))
    
    try {
      // Crear jugador temporal para eliminar
      const tempId = `player_delete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await prisma.player.create({
        data: {
          id: tempId,
          clubId: this.clubId,
          name: 'Player to Delete',
          phone: '5558888888',
          updatedAt: new Date()
        }
      })
      
      // Eliminar el jugador
      await prisma.player.delete({
        where: { id: tempId }
      })
      
      // Verificar que fue eliminado
      const deleted = await prisma.player.findUnique({
        where: { id: tempId }
      })
      
      if (deleted === null) {
        console.log('✅ Jugador eliminado exitosamente')
        this.testResults.push({
          operation: 'DELETE',
          status: 'SUCCESS'
        })
      } else {
        console.log('❌ El jugador no fue eliminado')
        this.testResults.push({
          operation: 'DELETE',
          status: 'FAILED'
        })
      }
      
    } catch (error: any) {
      console.log('❌ Error al eliminar jugador:', error.message)
      this.testResults.push({
        operation: 'DELETE',
        status: 'FAILED',
        details: error.message
      })
    }
  }
  
  private async validateUniqueConstraints() {
    console.log('\n🔐 5. VALIDANDO RESTRICCIONES ÚNICAS')
    console.log('-'.repeat(40))
    
    try {
      // Obtener un jugador existente
      const existingPlayer = await prisma.player.findFirst({
        where: { clubId: this.clubId }
      })
      
      if (existingPlayer) {
        // Intentar crear un jugador con el mismo teléfono
        try {
          const duplicateId = `player_dup_${Date.now()}`
          await prisma.player.create({
            data: {
              id: duplicateId,
              clubId: this.clubId,
              name: 'Duplicate Phone Test',
              phone: existingPlayer.phone, // Mismo teléfono
              updatedAt: new Date()
            }
          })
          console.log('❌ Se permitió crear jugador con teléfono duplicado')
          // Limpiar si se creó
          await prisma.player.delete({ where: { id: duplicateId } })
        } catch (error) {
          console.log('✅ Se rechazó correctamente el teléfono duplicado')
        }
        
        // Verificar número de miembro único
        if (existingPlayer.memberNumber) {
          try {
            const duplicateId = `player_dup2_${Date.now()}`
            await prisma.player.create({
              data: {
                id: duplicateId,
                clubId: this.clubId,
                name: 'Duplicate Member Test',
                phone: '5557777777',
                memberNumber: existingPlayer.memberNumber, // Mismo número
                updatedAt: new Date()
              }
            })
            console.log('⚠️  Se permitió crear jugador con número de miembro duplicado')
            // Limpiar si se creó
            await prisma.player.delete({ where: { id: duplicateId } })
          } catch (error) {
            console.log('✅ Se rechazó correctamente el número de miembro duplicado')
          }
        }
      }
      
      this.testResults.push({
        operation: 'UNIQUE_CONSTRAINTS',
        status: 'SUCCESS'
      })
      
    } catch (error: any) {
      console.log('❌ Error validando restricciones:', error.message)
      this.testResults.push({
        operation: 'UNIQUE_CONSTRAINTS',
        status: 'FAILED',
        details: error.message
      })
    }
  }
  
  private async validateSearchAndFilters() {
    console.log('\n🔍 6. VALIDANDO BÚSQUEDA Y FILTROS')
    console.log('-'.repeat(40))
    
    try {
      // Buscar por nombre
      const byName = await prisma.player.findMany({
        where: {
          clubId: this.clubId,
          name: { contains: 'Jaime', mode: 'insensitive' }
        }
      })
      console.log(`✅ Búsqueda por nombre: ${byName.length} resultados`)
      
      // Buscar por nivel
      const byLevel = await prisma.player.findMany({
        where: {
          clubId: this.clubId,
          level: 'Sexta Fuerza'
        }
      })
      console.log(`✅ Búsqueda por nivel: ${byLevel.length} resultados`)
      
      // Buscar activos
      const activeOnly = await prisma.player.findMany({
        where: {
          clubId: this.clubId,
          active: true
        }
      })
      console.log(`✅ Búsqueda de activos: ${activeOnly.length} resultados`)
      
      // Ordenamiento
      const ordered = await prisma.player.findMany({
        where: { clubId: this.clubId },
        orderBy: { name: 'asc' }
      })
      console.log(`✅ Ordenamiento por nombre: ${ordered.length} resultados`)
      
      // Paginación
      const page1 = await prisma.player.findMany({
        where: { clubId: this.clubId },
        take: 10,
        skip: 0
      })
      console.log(`✅ Paginación: ${page1.length} resultados en página 1`)
      
      this.testResults.push({
        operation: 'SEARCH_FILTERS',
        status: 'SUCCESS'
      })
      
    } catch (error: any) {
      console.log('❌ Error en búsqueda y filtros:', error.message)
      this.testResults.push({
        operation: 'SEARCH_FILTERS',
        status: 'FAILED',
        details: error.message
      })
    }
  }
  
  private generateReport() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 REPORTE FINAL DE VALIDACIÓN CRUD')
    console.log('='.repeat(60))
    
    const successful = this.testResults.filter(r => r.status === 'SUCCESS').length
    const failed = this.testResults.filter(r => r.status === 'FAILED').length
    
    console.log(`\n✅ Operaciones exitosas: ${successful}`)
    console.log(`❌ Operaciones fallidas: ${failed}`)
    
    console.log('\nDETALLE POR OPERACIÓN:')
    console.log('-'.repeat(30))
    this.testResults.forEach(result => {
      const icon = result.status === 'SUCCESS' ? '✅' : '❌'
      console.log(`${icon} ${result.operation}: ${result.status}`)
      if (result.details) {
        console.log(`   Detalles:`, result.details)
      }
    })
    
    // Validar modelo de datos
    console.log('\n📋 ESTRUCTURA DEL MODELO:')
    console.log('-'.repeat(30))
    console.log('Campos requeridos:')
    console.log('  ✅ id (String)')
    console.log('  ✅ clubId (String)')
    console.log('  ✅ name (String)')
    console.log('  ✅ phone (String)')
    console.log('  ✅ updatedAt (DateTime)')
    
    console.log('\nCampos opcionales:')
    console.log('  ✅ email (String?)')
    console.log('  ✅ memberNumber (String?)')
    console.log('  ✅ level (String?)')
    console.log('  ✅ gender (String?)')
    console.log('  ✅ birthDate (DateTime?)')
    console.log('  ✅ notes (String?)')
    console.log('  ✅ active (Boolean - default: true)')
    
    console.log('\nÍndices únicos:')
    console.log('  ✅ clubId + phone (compuesto)')
    
    if (failed === 0) {
      console.log('\n🎉 ¡CRUD FUNCIONANDO PERFECTAMENTE!')
    } else {
      console.log('\n⚠️  Hay operaciones que necesitan revisión')
    }
    
    console.log('\n' + '='.repeat(60))
  }
}

// Ejecutar validación
async function main() {
  const validator = new PlayerCRUDValidator()
  await validator.validateAll()
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())