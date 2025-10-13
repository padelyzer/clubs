import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function generateAllQRCodes() {
  try {
    console.log('🔍 Buscando canchas activas...')
    
    // Obtener todas las canchas activas
    const courts = await prisma.court.findMany({
      where: {
        active: true
      },
      orderBy: {
        order: 'asc'
      }
    })
    
    console.log(`✅ Encontradas ${courts.length} canchas activas`)
    
    const qrCodes = []
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    for (const court of courts) {
      // Verificar si ya existe un QR para esta cancha
      const existingQR = await prisma.courtQRCode.findUnique({
        where: {
          courtId: court.id
        }
      })
      
      if (existingQR) {
        console.log(`⏭️  QR ya existe para ${court.name}`)
        qrCodes.push(existingQR)
        continue
      }
      
      // Generar nuevo QR code
      const qrCode = nanoid(10)
      const accessUrl = `${appUrl}/tournaments/court/${qrCode}/results`
      
      const newQR = await prisma.courtQRCode.create({
        data: {
          id: nanoid(),
          clubId: court.clubId,
          courtId: court.id,
          courtNumber: court.order.toString(),
          qrCode,
          accessUrl,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      console.log(`✨ QR generado para ${court.name} - Código: ${qrCode}`)
      qrCodes.push(newQR)
    }
    
    console.log(`\n🎉 Total de QR codes: ${qrCodes.length}`)
    
    // Mostrar resumen
    const allQRs = await prisma.courtQRCode.findMany({
      include: {
        Court: {
          select: { name: true }
        }
      },
      orderBy: {
        courtNumber: 'asc'
      }
    })
    
    console.log('\n📋 Resumen de QR Codes:')
    allQRs.forEach(qr => {
      console.log(`  - Cancha ${qr.courtNumber} (${qr.Court?.name}): ${qr.accessUrl}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

generateAllQRCodes()