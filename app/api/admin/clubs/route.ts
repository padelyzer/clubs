import { NextRequest, NextResponse } from 'next/server'
import { requireApiSuperAdmin } from '@/lib/auth/api-auth'
import { prisma } from '@/lib/config/prisma'
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit'
import { auditSuccess, auditFailure, AuditActions } from '@/lib/security/audit'
import { validateRequest, paginationSchema, formatValidationErrors } from '@/lib/validations/admin'
import { withCache, buildCacheKey, CACHE_TTL, CACHE_PREFIXES } from '@/lib/performance/cache'
import { parsePaginationParams, paginateQuery } from '@/lib/utils/pagination'
import { handleApiError, NotFoundError, successResponse } from '@/lib/errors/api-error'

// GET /api/admin/clubs - Get paginated list of clubs
export async function GET(request: NextRequest) {
  console.log('[Clubs API] Request received')
  
  try {
    // 1. Authentication
    let session
    try {
      session = await requireApiSuperAdmin(request)
      console.log('[Clubs API] Authentication successful for:', session.user.email)
    } catch (authError: any) {
      console.error('[Clubs API] Authentication failed:', authError.message)
      return NextResponse.json(
        { 
          error: { 
            message: authError.message || 'Authentication failed',
            code: 'UNAUTHORIZED'
          } 
        },
        { status: 401 }
      )
    }
    
    // 2. Rate limiting
    const rateLimitResult = await rateLimit(request, 'admin')
    if (!rateLimitResult.success) {
      return createRateLimitResponse()
    }
    
    // 3. Parse and validate query params
    const searchParams = request.nextUrl.searchParams
    const paginationParams = parsePaginationParams(searchParams)
    const validation = validateRequest(paginationSchema, paginationParams)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: formatValidationErrors(validation.errors) },
        { status: 400 }
      )
    }
    
    // 4. Build cache key
    const status = searchParams.get('status') || 'all'
    const cacheKey = buildCacheKey(
      'CLUB_DATA',
      'list',
      status,
      `page-${paginationParams.page}`,
      `limit-${paginationParams.limit}`
    )
    
    // 5. Get data with caching
    const result = await withCache(
      cacheKey,
      async () => {
        // Build where clause
        const where: any = {}
        if (status !== 'all') {
          where.status = status.toUpperCase()
        }
        
        // 6. Paginated query - TEMPORARY FIX: Exclude description field
        const [total, clubs] = await Promise.all([
          prisma.club.count({ where }),
          prisma.club.findMany({
            where,
            select: {
              id: true,
              name: true,
              slug: true,
              email: true,
              phone: true,
              address: true,
              city: true,
              state: true,
              country: true,
              postalCode: true,
              website: true,
              logo: true,
              // description: true, // EXCLUDED - not in production DB
              status: true,
              active: true,
              stripeAccountId: true,
              stripeOnboardingCompleted: true,
              stripePayoutsEnabled: true,
              stripeChargesEnabled: true,
              stripeDetailsSubmitted: true,
              createdAt: true,
              updatedAt: true,
              subscription: {
                include: {
                  plan: true
                }
              },
              _count: {
                select: {
                  User: true,
                  Court: true,
                  Booking: true
                }
              }
            },
            skip: (paginationParams.page - 1) * paginationParams.limit,
            take: paginationParams.limit,
            orderBy: { createdAt: 'desc' }
          })
        ])
        
        return {
          data: clubs,
          pagination: {
            page: paginationParams.page,
            limit: paginationParams.limit,
            total,
            pages: Math.ceil(total / paginationParams.limit),
            hasNext: paginationParams.page < Math.ceil(total / paginationParams.limit),
            hasPrev: paginationParams.page > 1
          }
        }
      },
      CACHE_TTL.MEDIUM
    )
    
    // 7. Audit log
    await auditSuccess(
      request,
      'admin.clubs.list',
      'club',
      'all',
      { status, page: paginationParams.page },
      session?.user?.id
    )
    
    // 8. Return response with headers
    return NextResponse.json({
      clubs: result.data,
      pagination: result.pagination
    }, {
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
      }
    })
    
  } catch (error) {
    // 9. Error handling
    return handleApiError(error)
  }
}

// POST /api/admin/clubs - Create a new club
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await requireApiSuperAdmin(request)
    
    // Rate limiting
    const rateLimitResult = await rateLimit(request, 'admin')
    if (!rateLimitResult.success) {
      return createRateLimitResponse()
    }
    
    // Parse body
    const body = await request.json()
    
    // Generate unique IDs
    const { v4: uuidv4 } = await import('uuid')
    const clubId = uuidv4()
    const adminUserId = uuidv4()
    const settingsId = uuidv4()
    const clubPackageId = uuidv4()
    
    // Check if email already exists
    const existingClub = await prisma.club.findFirst({
      where: { 
        OR: [
          { email: body.email },
          { slug: body.slug }
        ]
      }
    })
    
    if (existingClub) {
      return NextResponse.json(
        { error: existingClub.email === body.email ? 'Un club con este email ya existe' : 'Este slug ya está en uso' },
        { status: 400 }
      )
    }
    
    // Import bcrypt for password hashing
    const bcrypt = await import('bcryptjs')
    
    // Use transaction to create club and admin user together
    const result = await prisma.$transaction(async (tx) => {
      // Create club with minimal configuration
      const club = await tx.club.create({
        data: {
          id: clubId,
          name: body.name,
          slug: body.slug,
          email: body.email,
          phone: body.phone,
          address: body.address || '',
          city: body.city || '',
          state: body.state || '',
          country: body.country || '',
          postalCode: body.postalCode || '',
          description: body.description || '',
          website: body.website || null,
          status: 'APPROVED',
          active: true,
          updatedAt: new Date()
        }
      })
      
      // No crear ClubSettings iniciales - se creará en el asistente de configuración
      const settings = null
      
      // Generate simple password for club admin
      const defaultPassword = `admin123`
      const hashedPassword = await bcrypt.hash(defaultPassword, 10)
      
      // Create club admin user with minimal data
      const adminUser = await tx.user.create({
        data: {
          id: adminUserId,
          email: body.adminEmail || `admin@${body.slug}.com`,
          name: body.adminName || `Admin`,
          password: hashedPassword,
          role: 'CLUB_OWNER',
          clubId: clubId,
          emailVerified: new Date(),
          active: true,
          updatedAt: new Date()
        }
      })
      
      // Create ClubPackage association if packageId provided
      let clubPackage = null
      if (body.packageId) {
        // Verify package exists
        const packageExists = await tx.saasPackage.findUnique({
          where: { id: body.packageId }
        })
        
        if (packageExists) {
          clubPackage = await tx.clubPackage.create({
            data: {
              id: clubPackageId,
              clubId: clubId,
              packageId: body.packageId,
              isActive: true,
              activatedAt: new Date()
            }
          })
        }
      } else {
        // If no package selected, try to assign default package
        const defaultPackage = await tx.saasPackage.findFirst({
          where: { isDefault: true, isActive: true }
        })
        
        if (defaultPackage) {
          clubPackage = await tx.clubPackage.create({
            data: {
              id: clubPackageId,
              clubId: clubId,
              packageId: defaultPackage.id,
              isActive: true,
              activatedAt: new Date()
            }
          })
        }
      }
      
      return { club, settings, adminUser, defaultPassword, clubPackage }
    })
    
    // Audit success
    await auditSuccess(
      request,
      'admin.club.create',
      'club',
      clubId,
      { name: body.name, email: body.email, adminEmail: result.adminUser.email },
      session?.user?.id
    )
    
    return NextResponse.json({ 
      success: true,
      club: result.club,
      adminCredentials: {
        email: result.adminUser.email,
        password: result.defaultPassword,
        message: 'Guarda estas credenciales, la contraseña no se mostrará de nuevo'
      },
      message: 'Club y usuario administrador creados exitosamente' 
    })
    
  } catch (error) {
    console.error('Error creating club:', error)
    return handleApiError(error)
  }
}

// Import required schemas
import { approveClubSchema } from '@/lib/validations/admin'
import { cacheInvalidators } from '@/lib/performance/cache'