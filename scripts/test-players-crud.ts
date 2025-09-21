import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPlayersCRUD() {
  console.log('\n👥 PRUEBAS CRUD - MÓDULO DE CLIENTES')
  console.log('=' .repeat(50))
  
  try {
    // Get club
    const club = await prisma.club.findFirst()
    if (!club) throw new Error('No club found')
    
    // Test 1: CREATE - Crear nuevos clientes
    console.log('\n📝 TEST 1: CREAR CLIENTES')
    console.log('-'.repeat(30))
    
    const testPlayers = [
      {
        name: 'Roberto Martínez',
        email: 'roberto.martinez@email.com',
        phone: '5551111111',
        level: 'Primera Fuerza',
        gender: 'male',
        birthDate: new Date('1990-05-15'),
        notes: 'Cliente VIP - Descuento 10%',
        clientNumber: 'CL100'
      },
      {
        name: 'Patricia González',
        email: 'patricia.g@email.com',
        phone: '5552222222',
        level: 'Segunda Fuerza',
        gender: 'female',
        birthDate: new Date('1985-08-20'),
        notes: 'Prefiere horarios matutinos'
      },
      {
        name: 'Miguel Ángel Rodríguez',
        phone: '5553333333',
        level: 'Tercera Fuerza',
        gender: 'male',
        // Sin email ni fecha de nacimiento
      },
      {
        name: 'Ana Sofía Hernández',
        email: 'ana.sofia@email.com',
        phone: '5554444444',
        level: 'Open',
        gender: 'female',
        birthDate: new Date('1995-12-10'),
        notes: 'Jugadora profesional'
      },
      {
        name: 'Carlos Mendoza Jr.',
        phone: '5555555555',
        // Datos mínimos
      }
    ]
    
    const createdPlayers = []
    for (const playerData of testPlayers) {
      try {
        const player = await prisma.player.create({
          data: {
            clubId: club.id,
            ...playerData,
            active: true
          }
        })
        createdPlayers.push(player)
        console.log(`  ✅ Cliente creado: ${player.name} (${player.clientNumber || 'Auto-generado'})`)
      } catch (error: any) {
        console.log(`  ❌ Error creando ${playerData.name}: ${error.message}`)
      }
    }
    
    // Test 2: READ - Leer clientes
    console.log('\n🔍 TEST 2: LEER CLIENTES')
    console.log('-'.repeat(30))
    
    // Buscar todos los clientes
    const allPlayers = await prisma.player.findMany({
      where: { clubId: club.id },
      orderBy: { name: 'asc' }
    })
    console.log(`  📊 Total de clientes: ${allPlayers.length}`)
    
    // Buscar por nivel
    const openPlayers = await prisma.player.findMany({
      where: { 
        clubId: club.id,
        level: 'Open'
      }
    })
    console.log(`  🎾 Jugadores nivel Open: ${openPlayers.length}`)
    
    // Buscar activos
    const activePlayers = await prisma.player.count({
      where: { 
        clubId: club.id,
        active: true
      }
    })
    console.log(`  ✅ Clientes activos: ${activePlayers}`)
    
    // Buscar por teléfono
    const phoneSearch = await prisma.player.findUnique({
      where: {
        clubId_phone: {
          clubId: club.id,
          phone: '5551111111'
        }
      }
    })
    console.log(`  📱 Búsqueda por teléfono: ${phoneSearch ? phoneSearch.name : 'No encontrado'}`)
    
    // Test 3: UPDATE - Actualizar clientes
    console.log('\n✏️ TEST 3: ACTUALIZAR CLIENTES')
    console.log('-'.repeat(30))
    
    if (createdPlayers.length > 0) {
      const playerToUpdate = createdPlayers[0]
      
      // Actualizar nivel
      const updatedLevel = await prisma.player.update({
        where: { id: playerToUpdate.id },
        data: { level: 'Open' }
      })
      console.log(`  ✅ Nivel actualizado: ${updatedLevel.name} -> ${updatedLevel.level}`)
      
      // Actualizar email
      const updatedEmail = await prisma.player.update({
        where: { id: createdPlayers[1].id },
        data: { email: 'nuevo.email@test.com' }
      })
      console.log(`  ✅ Email actualizado: ${updatedEmail.name} -> ${updatedEmail.email}`)
      
      // Actualizar notas
      const updatedNotes = await prisma.player.update({
        where: { id: createdPlayers[2].id },
        data: { notes: 'Cliente frecuente - Martes y Jueves' }
      })
      console.log(`  ✅ Notas actualizadas: ${updatedNotes.name}`)
      
      // Actualizar múltiples campos
      const multiUpdate = await prisma.player.update({
        where: { id: createdPlayers[3].id },
        data: {
          level: 'Primera Fuerza',
          notes: 'Ascendió de categoría',
          gender: 'female'
        }
      })
      console.log(`  ✅ Actualización múltiple: ${multiUpdate.name}`)
    }
    
    // Test 4: VALIDACIONES
    console.log('\n⚠️ TEST 4: VALIDACIONES')
    console.log('-'.repeat(30))
    
    // Intentar crear cliente con teléfono duplicado
    try {
      await prisma.player.create({
        data: {
          clubId: club.id,
          name: 'Duplicado Test',
          phone: '5551111111', // Teléfono ya existe
          active: true
        }
      })
      console.log('  ❌ ERROR: Se permitió crear cliente con teléfono duplicado')
    } catch (error) {
      console.log('  ✅ Validación correcta: No se permite teléfono duplicado')
    }
    
    // Intentar crear con número de cliente duplicado
    try {
      await prisma.player.create({
        data: {
          clubId: club.id,
          name: 'Cliente Duplicado',
          phone: '5559999999',
          clientNumber: 'CL100', // Ya existe
          active: true
        }
      })
      console.log('  ❌ ERROR: Se permitió número de cliente duplicado')
    } catch (error) {
      console.log('  ✅ Validación correcta: No se permite número de cliente duplicado')
    }
    
    // Test 5: BÚSQUEDAS Y FILTROS
    console.log('\n🔎 TEST 5: BÚSQUEDAS Y FILTROS')
    console.log('-'.repeat(30))
    
    // Buscar por nombre parcial
    const nameSearch = await prisma.player.findMany({
      where: {
        clubId: club.id,
        name: {
          contains: 'González',
          mode: 'insensitive'
        }
      }
    })
    console.log(`  🔍 Búsqueda "González": ${nameSearch.length} resultados`)
    
    // Buscar por género
    const femaleCount = await prisma.player.count({
      where: {
        clubId: club.id,
        gender: 'female'
      }
    })
    console.log(`  👩 Clientas mujeres: ${femaleCount}`)
    
    const maleCount = await prisma.player.count({
      where: {
        clubId: club.id,
        gender: 'male'
      }
    })
    console.log(`  👨 Clientes hombres: ${maleCount}`)
    
    // Buscar por rango de niveles
    const topPlayers = await prisma.player.findMany({
      where: {
        clubId: club.id,
        level: {
          in: ['Open', 'Primera Fuerza']
        }
      }
    })
    console.log(`  🏆 Jugadores top (Open/Primera): ${topPlayers.length}`)
    
    // Test 6: DELETE - Eliminar (soft delete)
    console.log('\n🗑️ TEST 6: ELIMINAR CLIENTES (SOFT DELETE)')
    console.log('-'.repeat(30))
    
    if (createdPlayers.length > 4) {
      const playerToDelete = createdPlayers[4]
      
      // Soft delete
      const deleted = await prisma.player.update({
        where: { id: playerToDelete.id },
        data: { active: false }
      })
      console.log(`  ✅ Cliente desactivado: ${deleted.name}`)
      
      // Verificar que no aparece en búsquedas activas
      const activeAfterDelete = await prisma.player.findMany({
        where: {
          clubId: club.id,
          active: true,
          id: playerToDelete.id
        }
      })
      console.log(`  ✅ Verificación: Cliente no aparece en activos (${activeAfterDelete.length} resultados)`)
      
      // Pero sigue existiendo en la base de datos
      const stillExists = await prisma.player.findUnique({
        where: { id: playerToDelete.id }
      })
      console.log(`  ✅ Cliente aún existe en BD: ${stillExists ? 'Sí' : 'No'}`)
    }
    
    // Test 7: ESTADÍSTICAS
    console.log('\n📊 TEST 7: ESTADÍSTICAS DE CLIENTES')
    console.log('-'.repeat(30))
    
    const stats = {
      total: await prisma.player.count({ where: { clubId: club.id } }),
      active: await prisma.player.count({ where: { clubId: club.id, active: true } }),
      inactive: await prisma.player.count({ where: { clubId: club.id, active: false } }),
      withEmail: await prisma.player.count({ 
        where: { 
          clubId: club.id, 
          email: { not: null } 
        } 
      }),
      withBirthdate: await prisma.player.count({ 
        where: { 
          clubId: club.id, 
          birthDate: { not: null } 
        } 
      }),
      withLevel: await prisma.player.count({ 
        where: { 
          clubId: club.id, 
          level: { not: null } 
        } 
      })
    }
    
    console.log(`  📈 Estadísticas generales:`)
    console.log(`     - Total de clientes: ${stats.total}`)
    console.log(`     - Activos: ${stats.active}`)
    console.log(`     - Inactivos: ${stats.inactive}`)
    console.log(`     - Con email: ${stats.withEmail}`)
    console.log(`     - Con fecha nacimiento: ${stats.withBirthdate}`)
    console.log(`     - Con nivel asignado: ${stats.withLevel}`)
    
    // Distribución por nivel
    const levelDistribution = await prisma.player.groupBy({
      by: ['level'],
      where: { 
        clubId: club.id,
        level: { not: null }
      },
      _count: true
    })
    
    console.log(`\n  🎯 Distribución por nivel:`)
    levelDistribution.forEach(level => {
      console.log(`     - ${level.level}: ${level._count} jugadores`)
    })
    
    console.log('\n✅ PRUEBAS CRUD COMPLETADAS')
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error)
    throw error
  }
}

testPlayersCRUD()
  .catch(console.error)
  .finally(() => prisma.$disconnect())