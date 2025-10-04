import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tournamentId = '3b8cfa28-c306-4957-b9ba-890a7acf0bf9'
  console.log(`🔍 Checking tournament: ${tournamentId}`)
  
  try {
    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        Club: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true
          }
        }
      }
    })
    
    if (!tournament) {
      console.log('❌ Tournament not found')
      
      // Check what tournaments exist
      const allTournaments = await prisma.tournament.findMany({
        select: {
          id: true,
          name: true,
          status: true,
          Club: {
            select: {
              name: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
      
      console.log(`\n📋 Found ${allTournaments.length} tournaments:`)
      allTournaments.forEach(t => {
        console.log(`   - ${t.name} (${t.id}) [${t.status}] Club: ${t.Club.name} (${t.Club.slug})`)
      })
      
      return
    }
    
    console.log('✅ Tournament found:')
    console.log(`   Name: ${tournament.name}`)
    console.log(`   Status: ${tournament.status}`)
    console.log(`   Type: ${tournament.type}`)
    console.log(`   Club: ${tournament.Club.name} (${tournament.Club.slug})`)
    console.log(`   Start Date: ${tournament.startDate}`)
    console.log(`   End Date: ${tournament.endDate}`)
    console.log(`   Max Players: ${tournament.maxPlayers}`)
    
    // Check if club matches the URL
    const expectedClubSlug = 'club-demo-padelyzer'
    if (tournament.Club.slug !== expectedClubSlug) {
      console.log(`⚠️  Club slug mismatch! Expected: ${expectedClubSlug}, Found: ${tournament.Club.slug}`)
    }
    
  } catch (error) {
    console.error('❌ Error checking tournament:', error)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('💥 Failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })