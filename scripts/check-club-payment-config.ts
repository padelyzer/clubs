import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Get the first club and its settings
    const club = await prisma.club.findFirst({
      include: {
        settings: true
      }
    })
    
    if (!club) {
      console.log('No club found.')
      return
    }

    console.log(`Club: ${club.name}`)
    console.log('Payment Settings:')
    console.log('=================')
    
    if (club.settings) {
      console.log(`Accept Cash: ${club.settings.acceptCash}`)
      console.log(`Terminal Enabled: ${club.settings.terminalEnabled}`)
      console.log(`Transfer Enabled: ${club.settings.transferEnabled}`)
      
      if (!club.settings.transferEnabled) {
        console.log('\nEnabling transfer payments...')
        await prisma.clubSettings.update({
          where: { clubId: club.id },
          data: { transferEnabled: true }
        })
        console.log('✅ Transfer payments enabled!')
      }
    } else {
      console.log('No settings found for this club.')
      console.log('Creating default club settings...')
      
      // Create default club settings
      await prisma.clubSettings.create({
        data: {
          clubId: club.id,
          acceptCash: true,
          terminalEnabled: false,
          transferEnabled: true
        }
      })
      
      console.log('✅ Default club settings created!')
      console.log('Accept Cash: true')
      console.log('Terminal Enabled: false')
      console.log('Transfer Enabled: true')
    }

  } catch (error) {
    console.error('Error checking club payment settings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()