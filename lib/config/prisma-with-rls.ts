import { PrismaClient } from '@prisma/client'
import { validateRequest } from '@/lib/auth/lucia'

// Extend PrismaClient to automatically set RLS context
const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

  // Middleware to set RLS context for each query
  client.$use(async (params, next) => {
    // Get current session
    const { user } = await validateRequest().catch(() => ({ user: null }))
    
    if (user && user.clubId) {
      // Set the club context for RLS
      await client.$executeRawUnsafe(`SET LOCAL app.current_club_id = '${user.clubId}'`)
      
      // Set super admin flag if applicable
      if (user.role === 'SUPER_ADMIN') {
        await client.$executeRawUnsafe(`SET LOCAL app.is_super_admin = 'true'`)
      }
    }
    
    return next(params)
  })

  return client
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

export { prisma }

// Helper to create a Prisma client with specific club context
export function createPrismaClient(clubId?: string, isSuperAdmin = false) {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

  // Set context before returning
  if (clubId) {
    client.$executeRawUnsafe(`SET LOCAL app.current_club_id = '${clubId}'`).catch(() => {})
  }
  
  if (isSuperAdmin) {
    client.$executeRawUnsafe(`SET LOCAL app.is_super_admin = 'true'`).catch(() => {})
  }

  return client
}

// Helper for transactions with RLS context
export async function prismaTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>,
  clubId?: string
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    if (clubId) {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_club_id = '${clubId}'`)
    }
    return fn(tx as PrismaClient)
  })
}