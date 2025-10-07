import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { addDays, startOfMonth, format } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simplified seed...')

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await prisma.transaction.deleteMany({})
    await prisma.expense.deleteMany({})
    await prisma.classBooking.deleteMany({})
    await prisma.booking.deleteMany({})
    await prisma.class.deleteMany({})
    await prisma.player.deleteMany({})
    await prisma.classInstructor.deleteMany({})
    await prisma.court.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.club.deleteMany({})

    // 1. Create Club
    console.log('🏢 Creating club...')
    const club = await prisma.club.create({
      data: {
        name: 'Club Pádel Premium',
        slug: 'padel-premium',
        city: 'Ciudad de México',
        address: 'Av. Insurgentes Sur 1234',
        phone: '555-123-4567',
        email: 'info@padelpremium.mx',
        updatedAt: new Date()
      }
    })

    // 2. Create Admin User
    console.log('👤 Creating admin user...')
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@padelpremium.mx',
        password: await hash('admin123', 10),
        name: 'Administrador',
        role: 'CLUB_OWNER',
        clubId: club.id,
        emailVerified: new Date(),
        active: true,
        updatedAt: new Date()
      }
    })

    // 3. Create Courts
    console.log('🎾 Creating courts...')
    const courts = await Promise.all([
      prisma.court.create({
        data: {
          clubId: club.id,
          name: 'Cancha 1',
          indoor: false,
          order: 1,
          active: true,
          updatedAt: new Date()
        }
      }),
      prisma.court.create({
        data: {
          clubId: club.id,
          name: 'Cancha 2',
          indoor: false,
          order: 2,
          active: true,
          updatedAt: new Date()
        }
      }),
      prisma.court.create({
        data: {
          clubId: club.id,
          name: 'Cancha 3 - Indoor',
          indoor: true,
          order: 3,
          active: true,
          updatedAt: new Date()
        }
      }),
      prisma.court.create({
        data: {
          clubId: club.id,
          name: 'Cancha 4',
          indoor: false,
          order: 4,
          active: true,
          updatedAt: new Date()
        }
      })
    ])

    // 4. Create Instructors
    console.log('👨‍🏫 Creating instructors...')
    const instructors = await Promise.all([
      prisma.classInstructor.create({
        data: {
          clubId: club.id,
          name: 'Carlos Rodríguez',
          email: 'carlos@padelpremium.mx',
          phone: '555-111-1111',
          specialties: ['Pádel Avanzado'],
          hourlyRate: 50000,
          active: true,
          updatedAt: new Date()
        }
      }),
      prisma.classInstructor.create({
        data: {
          clubId: club.id,
          name: 'María González',
          email: 'maria@padelpremium.mx',
          phone: '555-222-2222',
          specialties: ['Pádel Iniciación'],
          hourlyRate: 40000,
          active: true,
          updatedAt: new Date()
        }
      })
    ])

    // 5. Create Players
    console.log('👥 Creating players...')
    const players = []
    const playerNames = [
      'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 
      'Pedro Sánchez', 'Laura Rodríguez', 'Miguel Hernández', 'Isabel Gómez'
    ]

    for (const name of playerNames) {
      const player = await prisma.player.create({
        data: {
          clubId: club.id,
          name: name,
          email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
          phone: `555-${Math.random().toString().slice(2, 9)}`,
          active: true,
          updatedAt: new Date()
        }
      })
      players.push(player)
    }

    // 6. Generate Bookings (150,000 MXN target)
    console.log('📅 Generating bookings...')
    const currentMonth = startOfMonth(new Date())
    let totalBookingRevenue = 0
    const pricePerHour = 80000 // $800 MXN

    for (let day = 0; day < 15; day++) {
      const date = addDays(currentMonth, day)
      
      // 3-4 reservas por día
      for (let b = 0; b < 4; b++) {
        const court = courts[Math.floor(Math.random() * courts.length)]
        const player = players[Math.floor(Math.random() * players.length)]
        const hour = 9 + Math.floor(Math.random() * 10)
        
        const booking = await prisma.booking.create({
          data: {
            clubId: club.id,
            courtId: court.id,
            date: date,
            startTime: `${hour}:00`,
            endTime: `${hour + 1}:30`,
            duration: 90,
            playerName: player.name,
            playerEmail: player.email,
            playerPhone: player.phone,
            totalPlayers: 4,
            price: pricePerHour * 1.5, // 90 minutes
            paymentStatus: 'completed',
            status: 'CONFIRMED',
            updatedAt: new Date()
          }
        })
        
        // Create transaction
        await prisma.transaction.create({
          data: {
            clubId: club.id,
            type: 'INCOME',
            category: 'BOOKING',
            amount: pricePerHour * 1.5,
            currency: 'MXN',
            description: `Reserva ${court.name} - ${player.name}`,
            reference: booking.id,
            date: date,
            createdBy: adminUser.id,
            updatedAt: new Date()
          }
        })
        
        totalBookingRevenue += pricePerHour * 1.5
      }
    }

    // 7. Generate Classes (150,000 MXN target)
    console.log('🎓 Generating classes...')
    let totalClassRevenue = 0
    const pricePerStudent = 25000 // $250 MXN

    for (let day = 0; day < 15; day++) {
      const date = addDays(currentMonth, day)
      
      // 2 clases por día
      for (let c = 0; c < 2; c++) {
        const instructor = instructors[Math.floor(Math.random() * instructors.length)]
        const court = courts[Math.floor(Math.random() * courts.length)]
        const hour = [10, 16, 18][Math.floor(Math.random() * 3)]
        
        const classEntity = await prisma.class.create({
          data: {
            clubId: club.id,
            instructorId: instructor.id,
            courtId: court.id,
            name: 'Clase Grupal de Pádel',
            type: 'GROUP',
            level: 'INTERMEDIATE',
            status: 'SCHEDULED',
            date: date,
            startTime: `${hour}:00`,
            endTime: `${hour + 1}:30`,
            duration: 90,
            maxStudents: 8,
            currentStudents: 6,
            price: pricePerStudent,
            currency: 'MXN',
            updatedAt: new Date()
          }
        })
        
        // Create bookings for 6 students
        for (let s = 0; s < 6; s++) {
          const student = players[s % players.length]
          
          await prisma.classBooking.create({
            data: {
              classId: classEntity.id,
              studentName: student.name,
              studentEmail: student.email,
              studentPhone: student.phone,
              paymentStatus: 'completed',
              paidAmount: pricePerStudent,
              dueAmount: 0,
              status: 'ENROLLED',
              confirmed: true,
              updatedAt: new Date()
            }
          })
          
          // Create transaction
          await prisma.transaction.create({
            data: {
              clubId: club.id,
              type: 'INCOME',
              category: 'CLASS',
              amount: pricePerStudent,
              currency: 'MXN',
              description: `Clase ${classEntity.name} - ${student.name}`,
              reference: classEntity.id,
              date: date,
                  createdBy: adminUser.id,
              updatedAt: new Date()
            }
          })
          
          totalClassRevenue += pricePerStudent
        }
      }
    }

    // 8. Generate Expenses (150,000 MXN)
    console.log('💸 Generating expenses...')
    const expenseData = [
      { category: 'SALARY', description: 'Nómina empleados', amount: 3500000 },
      { category: 'SALARY', description: 'Nómina instructores', amount: 2000000 },
      { category: 'RENT', description: 'Renta mensual', amount: 4000000 },
      { category: 'UTILITIES', description: 'Electricidad', amount: 800000 },
      { category: 'UTILITIES', description: 'Agua', amount: 300000 },
      { category: 'MAINTENANCE', description: 'Mantenimiento canchas', amount: 500000 },
      { category: 'EQUIPMENT', description: 'Pelotas y redes', amount: 300000 },
      { category: 'MARKETING', description: 'Publicidad digital', amount: 400000 },
      { category: 'OTHER', description: 'Seguros', amount: 400000 }
    ]

    let totalExpenseAmount = 0
    
    for (const expense of expenseData) {
      const date = addDays(currentMonth, Math.floor(Math.random() * 28))
      
      const expenseRecord = await prisma.expense.create({
        data: {
          clubId: club.id,
          category: expense.category as any,
          description: expense.description,
          amount: expense.amount,
          date: date,
          status: 'paid',
          createdBy: adminUser.id,
          updatedAt: new Date()
        }
      })
      
      // Create transaction
      await prisma.transaction.create({
        data: {
          clubId: club.id,
          type: 'EXPENSE',
          category: expense.category,
          amount: expense.amount,
          currency: 'MXN',
          description: expense.description,
          reference: expenseRecord.id,
          date: date,
          createdBy: adminUser.id,
          updatedAt: new Date()
        }
      })
      
      totalExpenseAmount += expense.amount
      
      if (totalExpenseAmount >= 15000000) break // 150,000 MXN limit
    }

    // 9. Create Budget (commented for now - needs schema update)
    // console.log('📊 Creating budget...')
    // await prisma.budget.create({...})

    // Calculate totals
    const totalIncome = totalBookingRevenue + totalClassRevenue
    const totalExpenses = totalExpenseAmount

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('✅ SEED COMPLETADO EXITOSAMENTE!')
    console.log('='.repeat(60))
    console.log('\n📊 RESUMEN:')
    console.log(`🏢 Club: ${club.name}`)
    console.log(`👤 Usuario: admin@padelpremium.mx / admin123`)
    console.log(`🎾 Canchas: ${courts.length}`)
    console.log(`👨‍🏫 Instructores: ${instructors.length}`)
    console.log(`👥 Jugadores: ${players.length}`)
    console.log('\n💰 FINANZAS:')
    console.log(`💚 Ingresos Reservas: $${(totalBookingRevenue / 100).toLocaleString('es-MX')} MXN`)
    console.log(`💚 Ingresos Clases: $${(totalClassRevenue / 100).toLocaleString('es-MX')} MXN`)
    console.log(`💚 Total Ingresos: $${(totalIncome / 100).toLocaleString('es-MX')} MXN`)
    console.log(`🔴 Total Gastos: $${(totalExpenses / 100).toLocaleString('es-MX')} MXN`)
    console.log(`📈 Ganancia: $${((totalIncome - totalExpenses) / 100).toLocaleString('es-MX')} MXN`)
    console.log('='.repeat(60))
    console.log('\n🚀 Sistema listo para pruebas!')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })