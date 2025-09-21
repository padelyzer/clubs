import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function testIncomeSearch() {
  console.log('🔍 Testing income search functionality...\n')

  // Fetch transactions like the API does
  const transactions = await prisma.transaction.findMany({
    where: {
      clubId: 'club-basic5-001',
      type: 'INCOME'
    },
    include: {
      Booking: {
        select: {
          playerName: true,
          Court: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      date: 'desc'
    },
    take: 500
  })

  console.log(`✅ Loaded ${transactions.length} income transactions\n`)

  // Map transactions like the frontend does
  const mappedTransactions = transactions.map(t => {
    let playerName = 'Cliente'

    // Extract player name with the EXACT logic from frontend
    if (t.Booking?.playerName) {
      playerName = t.Booking.playerName
    } else if (t.description && t.description.includes(' - ')) {
      const parts = t.description.split(' - ')
      const lastPart = parts[parts.length - 1].trim()
      // Check if last part is a time (HH:MM) or a name
      if (!lastPart.match(/^\d{1,2}:\d{2}$/)) {
        playerName = lastPart
      }
    }

    return {
      id: t.id,
      description: t.description || '',
      playerName: playerName,
      courtName: t.Booking?.Court?.name || '',
      amount: t.amount,
      date: t.date,
      hasBooking: !!t.Booking,
      reference: t.reference || t.id.substring(0, 8)
    }
  })

  // Test search for "juan"
  const searchQuery = 'juan'
  const filteredTransactions = mappedTransactions.filter(transaction => {
    const query = searchQuery.toLowerCase()
    return (
      transaction.description.toLowerCase().includes(query) ||
      transaction.playerName.toLowerCase().includes(query) ||
      transaction.reference.toLowerCase().includes(query)
    )
  })

  console.log(`🔎 Search for "${searchQuery}":\n`)
  console.log(`Found ${filteredTransactions.length} transactions\n`)

  // Show first 5 results
  filteredTransactions.slice(0, 5).forEach((t, i) => {
    console.log(`${i + 1}. ${t.description}`)
    console.log(`   Player: ${t.playerName}`)
    console.log(`   Amount: $${t.amount / 100}`)
    console.log(`   Has Booking: ${t.hasBooking}`)
    console.log(`   Reference: ${t.reference}`)
    console.log('')
  })

  // Check if Juan Pérez transaction from Sept 16 exists
  const juanSept16 = mappedTransactions.find(t =>
    t.description.includes('Juan Pérez') &&
    t.date.toISOString().startsWith('2024-09')
  )

  if (juanSept16) {
    console.log('✅ Found Juan Pérez Sept transaction:')
    console.log(`   Position in list: ${mappedTransactions.indexOf(juanSept16) + 1}`)
    console.log(`   Description: ${juanSept16.description}`)
    console.log(`   Player Name: ${juanSept16.playerName}`)
    console.log(`   Date: ${juanSept16.date}`)
  } else {
    console.log('❌ Juan Pérez Sept transaction not found')
  }

  await prisma.$disconnect()
}

testIncomeSearch().catch(console.error)