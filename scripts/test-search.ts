import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
  // Simular la búsqueda como lo haría el frontend
  const searchQuery = 'juan'

  const allTransactions = await prisma.transaction.findMany({
    where: {
      clubId: 'club-basic5-001',
      type: 'INCOME'
    },
    include: {
      Booking: {
        select: {
          playerName: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    },
    take: 500
  })

  // Simular el filtro del frontend
  const filtered = allTransactions.filter(t => {
    // Extract player name like frontend does
    let playerName = 'Cliente'
    if (t.Booking?.playerName) {
      playerName = t.Booking.playerName
    } else if (t.description && t.description.includes(' - ')) {
      const parts = t.description.split(' - ')
      const lastPart = parts[parts.length - 1].trim()
      if (!lastPart.match(/^\d{1,2}:\d{2}$/)) {
        playerName = lastPart
      }
    }

    const query = searchQuery.toLowerCase()
    return (
      t.description.toLowerCase().includes(query) ||
      playerName.toLowerCase().includes(query)
    )
  })

  console.log(`Found ${filtered.length} transactions matching 'juan':`)
  filtered.slice(0, 5).forEach(t => {
    let playerName = 'Cliente'
    if (t.Booking?.playerName) {
      playerName = t.Booking.playerName
    } else if (t.description && t.description.includes(' - ')) {
      const parts = t.description.split(' - ')
      const lastPart = parts[parts.length - 1].trim()
      if (!lastPart.match(/^\d{1,2}:\d{2}$/)) {
        playerName = lastPart
      }
    }

    console.log(`- ${t.description} | Player: ${playerName} | Amount: $${t.amount/100}`)
  })

  await prisma.$disconnect()
}

test().catch(console.error)