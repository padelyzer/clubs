import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { requireTournamentsModule } from '@/lib/saas/middleware'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

// Validation schema for creating tournaments
const createTournamentSchema = z.object({
  name: z.string().min(1, 'El nombre del torneo es requerido'),
  description: z.string().optional(),
  type: z.string().default('SINGLE_ELIMINATION'),
  category: z.string().optional(),
  categories: z.any().optional(),
  registrationStart: z.string().transform(str => new Date(str)),
  registrationEnd: z.string().transform(str => new Date(str)),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional(),
  maxPlayers: z.number().min(2).default(16),
  registrationFee: z.number().min(0).default(0),
  prizePool: z.number().min(0).default(0),
  currency: z.string().default('MXN'),
  matchDuration: z.number().min(30).default(90),
  sets: z.number().min(1).default(3),
  games: z.number().min(1).default(6),
  tiebreak: z.boolean().default(true),
  rules: z.string().optional(),
  notes: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar acceso al módulo de torneos
    const moduleCheck = await requireTournamentsModule(request)
    if (moduleCheck) {
      return moduleCheck // Retorna error 402 si no tiene acceso al módulo
    }

    // 2. Autenticación estándar
    const session = await requireAuthAPI()
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No autorizado',
          details: 'Sesión no válida o expirada'
        },
        { status: 401 }
      )
    }

    if (!session.clubId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Club no encontrado',
          details: 'El usuario no tiene un club asociado'
        },
        { status: 400 }
      )
    }

    // 3. Parámetros de búsqueda opcionales
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 4. Construir filtros - SIEMPRE filtrar por clubId
    const where: any = {
      clubId: session.clubId
    }

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    // 5. Obtener torneos con conteos relacionados
    const [tournaments, totalCount] = await Promise.all([
      prisma.tournament.findMany({
        where,
        include: {
          _count: {
            select: {
              TournamentRegistration: true,
              TournamentMatch: true,
              TournamentRound: true
            }
          }
        },
        orderBy: [
          { status: 'asc' }, // Activos primero
          { startDate: 'desc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.tournament.count({ where })
    ])

    return NextResponse.json({
      success: true,
      tournaments,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      clubInfo: {
        clubId: session.clubId,
        hasModuleAccess: true
      }
    })

  } catch (error) {
    console.error('Error fetching tournaments:', error)
    
    // Error descriptivo basado en el tipo de error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parámetros inválidos',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: 'Error al obtener los torneos. Por favor intenta de nuevo.'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar acceso al módulo de torneos
    const moduleCheck = await requireTournamentsModule(request)
    if (moduleCheck) {
      return moduleCheck
    }

    // 2. Autenticación
    const session = await requireAuthAPI()
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No autorizado',
          details: 'Sesión no válida para crear torneos'
        },
        { status: 401 }
      )
    }

    if (!session.clubId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Club no encontrado',
          details: 'El usuario debe tener un club asociado para crear torneos'
        },
        { status: 400 }
      )
    }

    // 3. Validar datos de entrada
    const body = await request.json()
    const validatedData = createTournamentSchema.parse(body)

    // 4. Verificar que no exista un torneo con el mismo nombre
    const existingTournament = await prisma.tournament.findFirst({
      where: {
        clubId: session.clubId,
        name: validatedData.name
      }
    })

    if (existingTournament) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Torneo duplicado',
          details: `Ya existe un torneo llamado "${validatedData.name}" en tu club`
        },
        { status: 409 }
      )
    }

    // 5. Crear el torneo
    const tournament = await prisma.tournament.create({
      data: {
        ...validatedData,
        clubId: session.clubId,
        status: 'DRAFT',
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            TournamentRegistration: true,
            TournamentMatch: true,
            TournamentRound: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      tournament,
      message: `Torneo "${tournament.name}" creado exitosamente`
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating tournament:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos de torneo inválidos',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear torneo',
        details: 'No se pudo crear el torneo. Verifica los datos e intenta de nuevo.'
      },
      { status: 500 }
    )
  }
}