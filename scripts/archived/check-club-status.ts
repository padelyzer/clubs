import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkClubStatus() {
  try {
    const club = await prisma.club.findUnique({
      where: { id: 'club-padel-puebla-001' }
    })
    
    console.log('Club status check:')
    console.log('- Name:', club?.name)
    console.log('- Slug:', club?.slug)
    console.log('- Active:', club?.active)
    console.log('- Status:', club?.status)
    console.log('')
    console.log('The club needs:')
    console.log('- active: true')
    console.log('- status: APPROVED')
    console.log('')
    
    if (!club?.active || club?.status !== 'APPROVED') {
      console.log('❌ Club does NOT meet requirements for access')
      console.log('Updating club to be active...')
      
      const updated = await prisma.club.update({
        where: { id: 'club-padel-puebla-001' },
        data: { 
          active: true,
          status: 'APPROVED'
        }
      })
      
      console.log('✅ Club updated:')
      console.log('- Active:', updated.active)
      console.log('- Status:', updated.status)
    } else {
      console.log('✅ Club meets all requirements')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClubStatus()
