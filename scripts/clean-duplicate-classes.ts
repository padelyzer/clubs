import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDuplicateClasses() {
  try {
    console.log('\n🧹 Cleaning up duplicate test classes...\n')
    
    // Classes to keep (the ones with pending payments)
    const classesToKeep = [
      'cmelzhl680005r4x9nl8aiedv',  // Original group class with pending payments
      'cmelzhl5w0001r4x947zpxcew',  // Original individual class
    ]
    
    // Classes to delete (duplicates with completed payments from testing)
    const classesToDelete = [
      'cmelztg4x0005r4q1itwbp4jv',  // Duplicate with all paid
      'cmem0fh4e0005r4no9ydo0lfw',  // Duplicate with wrong amounts
      'cmelztg4o0001r4q1g4oc1tr6',  // Duplicate individual
      'cmem0fh430001r4nokozvqyke',  // Another duplicate
    ]
    
    for (const classId of classesToDelete) {
      const cls = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          _count: {
            select: { bookings: true }
          }
        }
      })
      
      if (cls) {
        console.log(`Deleting class: ${cls.name}`)
        console.log(`  ID: ${classId}`)
        console.log(`  Students: ${cls._count.bookings}`)
        
        // First delete all bookings
        await prisma.classBooking.deleteMany({
          where: { classId }
        })
        
        // Then delete the class
        await prisma.class.delete({
          where: { id: classId }
        })
        
        console.log('  ✅ Deleted\n')
      }
    }
    
    // Show remaining classes
    console.log('📚 Remaining classes for today:\n')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const remainingClasses = await prisma.class.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    })
    
    for (const cls of remainingClasses) {
      console.log(`- ${cls.name}`)
      console.log(`  ID: ${cls.id}`)
      console.log(`  Time: ${cls.startTime} - ${cls.endTime}`)
      console.log(`  Students: ${cls._count.bookings}`)
      console.log()
    }
    
    console.log('✨ Cleanup complete!')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDuplicateClasses()