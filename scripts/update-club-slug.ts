import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateClubSlug() {
  try {
    // Update the club slug to 'basic5'
    const updatedClub = await prisma.club.update({
      where: { id: 'club-padel-puebla-001' },
      data: { slug: 'basic5' }
    })
    
    console.log('Club slug updated successfully!')
    console.log('- Name:', updatedClub.name)
    console.log('- Old slug: club-padel-puebla')
    console.log('- New slug:', updatedClub.slug)
    console.log('\nNow the user basic5@padelyzer.com will be redirected to: /c/basic5/dashboard')
    
  } catch (error) {
    console.error('Error updating club slug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateClubSlug()
