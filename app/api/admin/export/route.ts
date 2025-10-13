import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // clubs, users, bookings, finance
    const format = searchParams.get('format') || 'csv' // csv, json
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    
    let data: any[] = []
    let filename = 'export'
    
    switch (type) {
      case 'clubs':
        data = await prisma.club.findMany({
          include: {
            _count: {
              select: {
                User: true,
                Court: true,
                Booking: true
              }
            }
          }
        })
        filename = 'clubes'
        break

      case 'users':
        data = await prisma.user.findMany({
          include: {
            Club: {
              select: {
                name: true,
                status: true
              }
            }
          }
        })
        filename = 'usuarios'
        break
        
      case 'bookings':
        const whereClause: any = {}
        if (dateFrom) {
          whereClause.createdAt = { gte: new Date(dateFrom) }
        }
        if (dateTo) {
          whereClause.createdAt = { 
            ...whereClause.createdAt,
            lte: new Date(dateTo) 
          }
        }
        
        data = await prisma.booking.findMany({
          where: whereClause,
          include: {
            Club: {
              select: {
                name: true,
                city: true,
                state: true
              }
            },
            Court: {
              select: {
                name: true,
                type: true
              }
            }
          }
        })
        filename = 'reservas'
        break

      case 'finance':
        data = await prisma.booking.findMany({
          where: {
            paymentStatus: 'completed',
            ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
            ...(dateTo && { createdAt: { lte: new Date(dateTo) } })
          },
          include: {
            Club: {
              select: {
                name: true,
                stripeCommissionRate: true
              }
            },
            Payment: true
          }
        })
        filename = 'finanzas'
        break
        
      default:
        return NextResponse.json(
          { error: 'Tipo de exportación no válido' },
          { status: 400 }
        )
    }
    
    if (format === 'json') {
      return NextResponse.json(data, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    }
    
    // Generar CSV
    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No hay datos para exportar' },
        { status: 404 }
      )
    }
    
    const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object')
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          if (value === null || value === undefined) return ''
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\\n')
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
    
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}