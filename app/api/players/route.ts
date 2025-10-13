import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

// Validation schemas
const createPlayerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(7).max(20),
  level: z.enum(['Open', 'Primera Fuerza', 'Segunda Fuerza', 'Tercera Fuerza', 'Cuarta Fuerza', 'Quinta Fuerza', 'Sexta Fuerza']).optional(),
  gender: z.enum(['male', 'female']).optional(),
  notes: z.string().optional(),
  memberNumber: z.string().optional()
})

const updatePlayerSchema = createPlayerSchema.partial()

// GET - Retrieve all players for the club (SIMPLIFIED VERSION)
export async function GET(request: NextRequest) {
  try {
    console.log('[GET Players] Starting...')
    
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    console.log('[GET Players] Auth OK, clubId:', session.clubId)
    
    // Simplified URL parsing to avoid Next.js 15 issues
    let search = null
    let active = null
    let level = null
    let page = 0
    let pageSize = 20
    let offset = 0
    
    try {
      const { searchParams } = new URL(request.url)
      search = searchParams.get('search')
      active = searchParams.get('active')
      level = searchParams.get('level')
      page = parseInt(searchParams.get('page') || '0')
      pageSize = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Max 50 per page
      offset = page * pageSize
      console.log('[GET Players] URL params parsed successfully')
    } catch (urlError) {
      console.log('[GET Players] URL parsing error, using defaults:', urlError)
    }

    const where: any = {
      clubId: session.clubId
    }

    // Active filter
    if (active !== null) {
      where.active = active === 'true'
    }

    // Level filter
    if (level) {
      where.level = level
    }

    // Search filter (name, email, phone)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { memberNumber: { contains: search } }
      ]
    }

    console.log('[GET Players] Where clause:', where)
    
    // Get players with basic pagination - simplified
    console.log('[GET Players] Fetching players...')
    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: [{ name: 'asc' }],
        // Only select essential fields
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          memberNumber: true,
          level: true,
          gender: true,
          active: true,
          createdAt: true,
          lastBookingAt: true,
          totalBookings: true,
          totalSpent: true
        }
      }),
      prisma.player.count({ where })
    ])

    console.log('[GET Players] Found players:', players.length, 'Total:', total)

    // Use the cached stats from the player record (simplified)
    const playersWithStats = players

    return NextResponse.json({
      success: true,
      players: playersWithStats,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasMore: (page + 1) * pageSize < total
      }
    })

  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener jugadores' },
      { status: 500 }
    )
  }
}

// POST - Create new player
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    
    // Clean phone number by removing spaces
    if (body.phone) {
      body.phone = body.phone.replace(/\s/g, '')
    }
    
    const validatedData = createPlayerSchema.parse(body)
    
    // Check if player with same phone already exists
    const existingPlayer = await prisma.player.findUnique({
      where: {
        clubId_phone: {
          clubId: session.clubId,
          phone: validatedData.phone
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    })

    if (existingPlayer) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe un jugador con este número de teléfono',
          existingPlayer 
        },
        { status: 409 }
      )
    }

    // Generate member number if not provided
    let memberNumber = validatedData.memberNumber
    if (!memberNumber) {
      // Get current year
      const currentYear = new Date().getFullYear()
      
      // Get club prefix (first 3 letters of club name or default)
      const club = await prisma.club.findUnique({
        where: { id: session.clubId },
        select: { name: true }
      })
      const clubPrefix = club?.name ? club.name.substring(0, 3).toUpperCase() : 'PAD'
      
      // Find the last member number for this club and year
      const yearPattern = `${clubPrefix}-${currentYear}-%`
      const lastPlayer = await prisma.player.findFirst({
        where: { 
          clubId: session.clubId,
          memberNumber: { 
            startsWith: `${clubPrefix}-${currentYear}-`
          }
        },
        select: {
          memberNumber: true
        },
        orderBy: { memberNumber: 'desc' }
      })
      
      // Generate next member number
      if (lastPlayer && lastPlayer.memberNumber) {
        // Extract the sequential number from format: PAD-2024-0001
        const parts = lastPlayer.memberNumber.split('-')
        const lastNum = parseInt(parts[2], 10)
        memberNumber = `${clubPrefix}-${currentYear}-${String(lastNum + 1).padStart(4, '0')}`
      } else {
        memberNumber = `${clubPrefix}-${currentYear}-0001`
      }
    } else {
      // Check member number uniqueness if provided
      const existingClient = await prisma.player.findFirst({
        where: {
          clubId: session.clubId,
          memberNumber: memberNumber
        },
        select: {
          id: true,
          memberNumber: true
        }
      })

      if (existingClient) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Ya existe un jugador con este número de cliente' 
          },
          { status: 409 }
        )
      }
    }

    // Generate unique player ID
    const playerId = `player_${session.clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create player
    console.log('Creating player with data:', {
      id: playerId,
      clubId: session.clubId,
      name: validatedData.name,
      email: validatedData.email || null,
      phone: validatedData.phone,
      level: validatedData.level || null,
      gender: validatedData.gender || null,
      notes: validatedData.notes || null,
      memberNumber: memberNumber
    })
    
    const player = await prisma.player.create({
      data: {
        id: playerId,
        clubId: session.clubId,
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone,
        level: validatedData.level || undefined,
        gender: validatedData.gender || undefined,
        notes: validatedData.notes || undefined,
        memberNumber: memberNumber,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      player,
      message: 'Jugador registrado exitosamente' 
    })

  } catch (error) {
    console.error('Error creating player:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear jugador' },
      { status: 500 }
    )
  }
}

// PUT - Update player
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { id, ...updateData } = body
    
    console.log('PUT /api/players - Received body:', body)
    console.log('Session clubId:', session.clubId)
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID del jugador es requerido' },
        { status: 400 }
      )
    }

    // Clean phone number by removing spaces
    if (updateData.phone) {
      updateData.phone = updateData.phone.replace(/\s/g, '')
    }

    const validatedData = updatePlayerSchema.parse(updateData)
    
    // Check if player exists and belongs to club
    const existingPlayer = await prisma.player.findFirst({
      where: {
        id,
        clubId: session.clubId
      },
      select: {
        id: true,
        phone: true,
        memberNumber: true,
        name: true
      }
    })

    console.log('Found player:', existingPlayer)

    if (!existingPlayer) {
      console.log('Player not found with id:', id, 'and clubId:', session.clubId)
      return NextResponse.json(
        { success: false, error: 'Jugador no encontrado' },
        { status: 404 }
      )
    }

    // Check phone uniqueness if being updated
    if (validatedData.phone && validatedData.phone !== existingPlayer.phone) {
      const phoneExists = await prisma.player.findFirst({
        where: {
          clubId: session.clubId,
          phone: validatedData.phone,
          id: { not: id }
        },
        select: {
          id: true,
          phone: true
        }
      })

      if (phoneExists) {
        return NextResponse.json(
          { success: false, error: 'Este número de teléfono ya está registrado' },
          { status: 409 }
        )
      }
    }

    // Check member number uniqueness if being updated
    if (validatedData.memberNumber && validatedData.memberNumber !== existingPlayer.memberNumber) {
      const clientExists = await prisma.player.findFirst({
        where: {
          clubId: session.clubId,
          memberNumber: validatedData.memberNumber,
          id: { not: id }
        },
        select: {
          id: true,
          memberNumber: true
        }
      })

      if (clientExists) {
        return NextResponse.json(
          { success: false, error: 'Este número de cliente ya está registrado' },
          { status: 409 }
        )
      }
    }

    // Update player
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      player: updatedPlayer,
      message: 'Jugador actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating player:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar jugador' },
      { status: 500 }
    )
  }
}

// DELETE - Delete player (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID del jugador es requerido' },
        { status: 400 }
      )
    }

    // Check if player exists and belongs to club
    const player = await prisma.player.findFirst({
      where: {
        id,
        clubId: session.clubId
      },
      select: {
        id: true,
        name: true
      }
    })

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Jugador no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete - just mark as inactive
    await prisma.player.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Jugador desactivado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar jugador' },
      { status: 500 }
    )
  }
}