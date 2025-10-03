import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { nanoid } from 'nanoid'

// GET: Obtener todos los QR codes de las canchas del club
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    if (!session?.clubId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const qrCodes = await prisma.courtQRCode.findMany({
      where: { 
        clubId: session.clubId,
        isActive: true
      },
      include: {
        Court: true
      },
      orderBy: {
        courtNumber: 'asc'
      }
    })

    return NextResponse.json(qrCodes)
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return NextResponse.json(
      { error: 'Error al obtener códigos QR' },
      { status: 500 }
    )
  }
}

// POST: Generar QR codes para todas las canchas
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    if (!session?.clubId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener todas las canchas activas del club
    const courts = await prisma.court.findMany({
      where: {
        clubId: session.clubId,
        active: true
      },
      orderBy: {
        order: 'asc'
      }
    })

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
        qrCodes.push(existingQR)
        continue
      }

      // Generar nuevo QR code
      const qrCode = nanoid(10)
      const accessUrl = `${appUrl}/tournaments/court/${qrCode}/results`
      
      const newQR = await prisma.courtQRCode.create({
        data: {
          id: nanoid(),
          clubId: session.clubId,
          courtId: court.id,
          courtNumber: court.order.toString(),
          qrCode,
          accessUrl,
          isActive: true
        }
      })

      qrCodes.push(newQR)
    }

    return NextResponse.json({
      message: 'QR codes generados exitosamente',
      qrCodes
    })
  } catch (error) {
    console.error('Error generating QR codes:', error)
    return NextResponse.json(
      { error: 'Error al generar códigos QR' },
      { status: 500 }
    )
  }
}