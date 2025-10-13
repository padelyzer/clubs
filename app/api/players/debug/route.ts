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

// DEBUG POST - Create new player with detailed error logging
export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG Player Creation] Starting...')
    
    const session = await requireAuthAPI()
    
    if (!session) {
      console.log('[DEBUG Player Creation] No session')
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    console.log('[DEBUG Player Creation] Session OK:', session.clubId)
    
    const body = await request.json()
    console.log('[DEBUG Player Creation] Raw body:', body)
    
    // Clean phone number by removing spaces
    if (body.phone) {
      body.phone = body.phone.replace(/\s/g, '')
      console.log('[DEBUG Player Creation] Phone cleaned:', body.phone)
    }
    
    console.log('[DEBUG Player Creation] About to validate with Zod...')
    const validatedData = createPlayerSchema.parse(body)
    console.log('[DEBUG Player Creation] Zod validation passed:', validatedData)
    
    // Check if player with same phone already exists
    console.log('[DEBUG Player Creation] Checking for existing phone...')
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
    console.log('[DEBUG Player Creation] Existing player check result:', existingPlayer ? 'FOUND' : 'NOT_FOUND')

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
    console.log('[DEBUG Player Creation] Generating member number...')
    let memberNumber = validatedData.memberNumber
    if (!memberNumber) {
      // Get current year
      const currentYear = new Date().getFullYear()
      
      console.log('[DEBUG Player Creation] Getting club info...')
      // Get club prefix (first 3 letters of club name or default)
      const club = await prisma.club.findUnique({
        where: { id: session.clubId },
        select: { name: true }
      })
      console.log('[DEBUG Player Creation] Club found:', club?.name)
      const clubPrefix = club?.name ? club.name.substring(0, 3).toUpperCase() : 'PAD'
      
      console.log('[DEBUG Player Creation] Finding last member number...')
      // Find the last member number for this club and year
      const yearPattern = `${clubPrefix}-${currentYear}-%`
      const lastPlayer = await prisma.player.findFirst({
        where: { 
          clubId: session.clubId,
          memberNumber: { 
            startsWith: `${clubPrefix}-${currentYear}-`
          }
        },
        orderBy: { memberNumber: 'desc' }
      })
      console.log('[DEBUG Player Creation] Last player found:', lastPlayer?.memberNumber)
      
      // Generate next member number
      if (lastPlayer && lastPlayer.memberNumber) {
        // Extract the sequential number from format: PAD-2024-0001
        const parts = lastPlayer.memberNumber.split('-')
        const lastNum = parseInt(parts[2], 10)
        memberNumber = `${clubPrefix}-${currentYear}-${String(lastNum + 1).padStart(4, '0')}`
      } else {
        memberNumber = `${clubPrefix}-${currentYear}-0001`
      }
      console.log('[DEBUG Player Creation] Generated member number:', memberNumber)
    } else {
      console.log('[DEBUG Player Creation] Checking member number uniqueness...')
      // Check member number uniqueness if provided
      const existingClient = await prisma.player.findFirst({
        where: {
          clubId: session.clubId,
          memberNumber: memberNumber
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
    console.log('[DEBUG Player Creation] Generating player ID...')
    const playerId = `player_${session.clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('[DEBUG Player Creation] Generated player ID:', playerId)
    
    // Create player
    console.log('[DEBUG Player Creation] About to create player with data:', {
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

    console.log('[DEBUG Player Creation] Player created successfully:', player.id)

    return NextResponse.json({ 
      success: true, 
      player,
      message: 'Jugador registrado exitosamente',
      debug: {
        type: 'DEBUG_MODE',
        playerCreated: true,
        playerId: player.id,
        memberNumber: player.memberNumber
      }
    })

  } catch (error) {
    console.error('[DEBUG Player Creation] DETAILED ERROR:', error)
    
    if (error instanceof z.ZodError) {
      console.error('[DEBUG Player Creation] Zod validation error:', error.issues)
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear jugador',
        debug: {
          type: 'ERROR_MODE',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : 'No stack',
          errorName: error instanceof Error ? error.name : 'Unknown'
        }
      },
      { status: 500 }
    )
  }
}