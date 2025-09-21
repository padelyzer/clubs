import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function investigateOrphanTransactions() {
  console.log('🔍 INVESTIGANDO TRANSACCIONES HUÉRFANAS')
  console.log('======================================\n')

  const clubId = 'club-basic5-001'

  // 1. Obtener algunas transacciones huérfanas para análisis
  const orphanTransactions = await prisma.transaction.findMany({
    where: {
      clubId: clubId,
      type: 'INCOME',
      category: 'BOOKING',
      bookingId: null // Estas son las huérfanas
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  console.log('📊 PRIMERAS 10 TRANSACCIONES HUÉRFANAS:')
  console.log('======================================')
  orphanTransactions.forEach((tx, i) => {
    console.log(`${i + 1}. ID: ${tx.id}`)
    console.log(`   Descripción: ${tx.description}`)
    console.log(`   Monto: $${tx.amount / 100}`)
    console.log(`   Fecha: ${tx.date}`)
    console.log(`   Creado: ${tx.createdAt}`)
    console.log(`   CreatedBy: ${tx.createdBy}`)
    console.log(`   Referencia: ${tx.reference}`)
    console.log('   ---')
  })

  // 2. Analizar patrones
  console.log('\n📊 ANÁLISIS DE PATRONES:')
  console.log('=========================')

  const patternAnalysis = await prisma.transaction.groupBy({
    by: ['createdBy'],
    where: {
      clubId: clubId,
      type: 'INCOME',
      category: 'BOOKING',
      bookingId: null
    },
    _count: {
      id: true
    },
    _sum: {
      amount: true
    }
  })

  console.log('Por creador:')
  patternAnalysis.forEach(pattern => {
    console.log(`   ${pattern.createdBy || 'NULL'}: ${pattern._count.id} transacciones, $${(pattern._sum.amount || 0) / 100}`)
  })

  // 3. Verificar si hay descripción patterns
  const descriptionPatterns = await prisma.$queryRaw`
    SELECT LEFT(description, 20) as pattern, COUNT(*) as count, SUM(amount) as total_amount
    FROM "Transaction"
    WHERE "clubId" = ${clubId} AND "type" = 'INCOME' AND "category" = 'BOOKING' AND "bookingId" IS NULL
    GROUP BY LEFT(description, 20)
    ORDER BY count DESC
    LIMIT 10
  `

  console.log('\nPatrones de descripción:')
  ;(descriptionPatterns as any[]).forEach(pattern => {
    console.log(`   "${pattern.pattern}...": ${pattern.count} veces, $${pattern.total_amount / 100}`)
  })

  // 4. Verificar fechas de creación
  const dateAnalysis = await prisma.$queryRaw`
    SELECT DATE("createdAt") as creation_date, COUNT(*) as count, SUM(amount) as total_amount
    FROM "Transaction"
    WHERE "clubId" = ${clubId} AND "type" = 'INCOME' AND "category" = 'BOOKING' AND "bookingId" IS NULL
    GROUP BY DATE("createdAt")
    ORDER BY creation_date DESC
    LIMIT 10
  `

  console.log('\nPor fecha de creación:')
  ;(dateAnalysis as any[]).forEach(date => {
    console.log(`   ${date.creation_date}: ${date.count} transacciones, $${date.total_amount / 100}`)
  })

  // 5. Propuesta de limpieza
  console.log('\n🧹 PROPUESTA DE LIMPIEZA:')
  console.log('==========================')

  const totalOrphans = await prisma.transaction.count({
    where: {
      clubId: clubId,
      type: 'INCOME',
      category: 'BOOKING',
      bookingId: null
    }
  })

  const totalOrphanAmount = await prisma.transaction.aggregate({
    where: {
      clubId: clubId,
      type: 'INCOME',
      category: 'BOOKING',
      bookingId: null
    },
    _sum: {
      amount: true
    }
  })

  console.log(`Total de transacciones huérfanas: ${totalOrphans}`)
  console.log(`Monto total huérfano: $${(totalOrphanAmount._sum.amount || 0) / 100}`)
  console.log('\nOpciones:')
  console.log('1. ELIMINAR todas las transacciones huérfanas (recomendado si son datos de prueba)')
  console.log('2. CONSERVAR y marcar como "datos históricos"')
  console.log('3. INVESTIGAR más para ver si se pueden asociar a reservas')

  // 6. Verificar si alguna referencia puede coincidir con bookingIds
  const possibleMatches = await prisma.$queryRaw`
    SELECT t.id as transaction_id, t.reference, t.description, b.id as booking_id, b."playerName"
    FROM "Transaction" t
    LEFT JOIN "Booking" b ON t.reference LIKE '%' || b.id || '%'
    WHERE t."clubId" = ${clubId}
      AND t."type" = 'INCOME'
      AND t."category" = 'BOOKING'
      AND t."bookingId" IS NULL
      AND b.id IS NOT NULL
    LIMIT 5
  `

  if ((possibleMatches as any[]).length > 0) {
    console.log('\n🔍 POSIBLES COINCIDENCIAS ENCONTRADAS:')
    console.log('====================================')
    ;(possibleMatches as any[]).forEach(match => {
      console.log(`   Transacción ${match.transaction_id} podría ser de reserva ${match.booking_id} (${match.playerName})`)
    })
  } else {
    console.log('\n❌ No se encontraron coincidencias obvias entre referencias y booking IDs')
  }

  await prisma.$disconnect()
}

investigateOrphanTransactions().catch(console.error)