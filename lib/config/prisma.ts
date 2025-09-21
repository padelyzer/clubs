import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Always create a new instance to ensure fresh connection
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://padelyzer:padelyzer_dev_2024@localhost:5432/padelyzer_db?schema=public'
      }
    }
  })
}

// Force new connection on every restart in development
if (process.env.NODE_ENV === 'development') {
  // Disconnect any existing connection
  if (globalForPrisma.prisma) {
    globalForPrisma.prisma.$disconnect()
  }
  globalForPrisma.prisma = createPrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma