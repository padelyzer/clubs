import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUserAndClub() {
  try {
    // Check user basic5
    const user = await prisma.user.findUnique({
      where: { email: 'basic5@padelyzer.com' },
      include: { Club: true }
    })
    
    if (user) {
      console.log('User found:')
      console.log('- ID:', user.id)
      console.log('- Email:', user.email)
      console.log('- Name:', user.name)
      console.log('- Role:', user.role)
      console.log('- ClubId:', user.clubId)
      
      if (user.Club) {
        console.log('\nClub details:')
        console.log('- ID:', user.Club.id)
        console.log('- Name:', user.Club.name)
        console.log('- Slug:', user.Club.slug)
        console.log('- Status:', user.Club.status)
      } else {
        console.log('\nNo club found for this user')
      }
    } else {
      console.log('User basic5@padelyzer.com not found')
    }
    
    // List all clubs
    console.log('\n=== All Clubs in Database ===')
    const clubs = await prisma.club.findMany({
      select: { id: true, name: true, slug: true, status: true }
    })
    
    clubs.forEach(club => {
      console.log(`- ${club.name} (slug: ${club.slug}, id: ${club.id}, status: ${club.status})`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserAndClub()