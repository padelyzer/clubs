import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function seedQRTestData() {
  try {
    console.log('🌱 Creando datos de prueba para QR y resultados...')
    
    // Obtener el primer club
    const club = await prisma.club.findFirst()
    if (!club) {
      console.error('❌ No se encontró ningún club')
      return
    }
    
    // Obtener canchas del club
    const courts = await prisma.court.findMany({
      where: { clubId: club.id },
      take: 3
    })
    
    if (courts.length === 0) {
      console.error('❌ No se encontraron canchas')
      return
    }
    
    // Crear QR codes de prueba para las canchas
    console.log('📱 Generando QR codes para canchas...')
    
    for (const court of courts) {
      // Verificar si ya existe un QR para esta cancha
      const existingQR = await prisma.courtQRCode.findUnique({
        where: {
          courtId: court.id
        }
      })
      
      if (!existingQR) {
        const qrCode = `TEST_QR_${court.order.toString().padStart(3, '0')}`
        await prisma.courtQRCode.create({
          data: {
            id: nanoid(),
            clubId: club.id,
            courtId: court.id,
            courtNumber: court.order.toString(),
            qrCode,
            accessUrl: `http://localhost:3002/tournaments/court/${qrCode}/results`,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        console.log(`✅ QR creado para ${court.name}: ${qrCode}`)
      } else {
        console.log(`⏭️ QR ya existe para ${court.name}: ${existingQR.qrCode}`)
      }
    }
    
    // Actualizar algunos partidos para que estén en progreso en estas canchas
    const tournament = await prisma.tournament.findFirst({
      where: { clubId: club.id }
    })
    
    if (tournament) {
      // Obtener partidos programados
      const matches = await prisma.tournamentMatch.findMany({
        where: {
          tournamentId: tournament.id,
          status: 'SCHEDULED'
        },
        take: 3
      })
      
      // Asignar partidos a las canchas con QR
      for (let i = 0; i < Math.min(matches.length, courts.length); i++) {
        await prisma.tournamentMatch.update({
          where: { id: matches[i].id },
          data: {
            courtId: courts[i].id,
            courtNumber: courts[i].order.toString(),
            status: 'IN_PROGRESS',
            actualStartTime: new Date()
          }
        })
        console.log(`✅ Partido ${matches[i].id} asignado a cancha ${courts[i].name}`)
      }
      
      // Crear un resultado con conflicto de prueba
      if (matches.length > 0) {
        const testMatch = matches[0]
        
        // Resultado del equipo 1
        await prisma.tournamentMatchResult.create({
          data: {
            id: nanoid(),
            matchId: testMatch.id,
            submittedBy: 'team1',
            submitterPhone: '555-0001',
            team1Sets: [{ games: 6, tiebreak: null }, { games: 4, tiebreak: null }],
            team2Sets: [{ games: 4, tiebreak: null }, { games: 6, tiebreak: null }],
            team1TotalSets: 1,
            team2TotalSets: 1,
            winner: 'team1',
            duration: 90,
            confirmed: false,
            conflictStatus: 'pending',
            conflictNotes: 'Resultados diferentes reportados',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        
        // Resultado diferente del equipo 2 (para crear conflicto)
        await prisma.tournamentMatchResult.create({
          data: {
            id: nanoid(),
            matchId: testMatch.id,
            submittedBy: 'team2',
            submitterPhone: '555-0002',
            team1Sets: [{ games: 4, tiebreak: null }, { games: 6, tiebreak: null }],
            team2Sets: [{ games: 6, tiebreak: null }, { games: 7, tiebreak: null }],
            team1TotalSets: 1,
            team2TotalSets: 2,
            winner: 'team2',
            duration: 95,
            confirmed: false,
            conflictStatus: 'pending',
            conflictNotes: 'Resultados diferentes reportados',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        
        console.log(`⚠️ Conflicto de prueba creado para partido ${testMatch.id}`)
      }
    }
    
    console.log('\n✅ Datos de prueba creados exitosamente!')
    console.log('\n📱 Para probar:')
    console.log('1. Abre test-qr-generator.html en tu navegador')
    console.log('2. Escanea los QR codes o haz clic en los enlaces')
    console.log('3. Reporta resultados como diferentes equipos')
    console.log('4. Ve a dashboard > QR & Conflictos para ver los conflictos')
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedQRTestData()