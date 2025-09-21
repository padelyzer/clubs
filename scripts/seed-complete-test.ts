import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { addDays, subDays, startOfMonth, endOfMonth, format } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting complete test data seed...')

  try {
    // 1. Clear existing data (opcional)
    console.log('🧹 Clearing existing test data...')
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

    // 2. Create Club
    console.log('🏢 Creating club...')
    const club = await prisma.club.create({
      data: {
        id: 'test-club-001',
        name: 'Club Pádel Premium México',
        slug: 'padel-premium-mx',
        description: 'El mejor club de pádel en México',
        address: 'Av. Insurgentes Sur 1234, CDMX',
        city: 'Ciudad de México',
        phone: '555-123-4567',
        email: 'info@padelpremium.mx',
        website: 'https://padelpremium.mx'
      }
    })

    // 3. Create Admin User
    console.log('👤 Creating admin user...')
    const adminUser = await prisma.user.create({
      data: {
        id: 'admin-001',
        email: 'admin@padelpremium.mx',
        password: await hash('admin123', 10),
        name: 'Administrador Principal',
        role: 'CLUB_OWNER',
        clubId: club.id,
        emailVerified: new Date(),
        active: true
      }
    })

    // 4. Create Courts (6 canchas)
    console.log('🎾 Creating courts...')
    const courts = await Promise.all([
      prisma.court.create({
        data: {
          clubId: club.id,
          name: 'Cancha 1 - Cristal',
          type: 'PADEL',
          description: 'Cancha profesional con paredes de cristal',
          surface: 'SYNTHETIC',
          indoor: false,
          lighting: true,
          active: true,
          pricePerHour: 80000 // $800 MXN
        }
      }),
      prisma.court.create({
        data: {
          clubId: club.id,
          name: 'Cancha 2 - Panorámica',
          type: 'PADEL',
          description: 'Cancha con vista panorámica',
          surface: 'SYNTHETIC',
          indoor: false,
          lighting: true,
          active: true,
          pricePerHour: 80000
        }
      }),
      prisma.court.create({
        data: {
          clubId: club.id,
          name: 'Cancha 3 - Indoor',
          type: 'PADEL',
          description: 'Cancha techada profesional',
          surface: 'SYNTHETIC',
          indoor: true,
          lighting: true,
          active: true,
          pricePerHour: 100000 // $1000 MXN
        }
      }),
      prisma.court.create({
        data: {
          clubId: club.id,
          name: 'Cancha 4 - Central',
          type: 'PADEL',
          description: 'Cancha central para torneos',
          surface: 'SYNTHETIC',
          indoor: false,
          lighting: true,
          active: true,
          pricePerHour: 90000
        }
      })
    ])

    // 5. Create Instructors
    console.log('👨‍🏫 Creating instructors...')
    const instructors = await Promise.all([
      prisma.classInstructor.create({
        data: {
          clubId: club.id,
          name: 'Carlos Rodríguez',
          email: 'carlos@padelpremium.mx',
          phone: '555-111-1111',
          specialties: ['Pádel Avanzado', 'Técnica', 'Competición'],
          bio: 'Ex jugador profesional con 15 años de experiencia',
          certifications: ['Certificación WPT', 'Instructor Nivel 3'],
          hourlyRate: 50000, // $500 MXN por hora
          active: true
        }
      }),
      prisma.classInstructor.create({
        data: {
          clubId: club.id,
          name: 'María González',
          email: 'maria@padelpremium.mx',
          phone: '555-222-2222',
          specialties: ['Pádel Iniciación', 'Niños', 'Fitness'],
          bio: 'Especialista en formación de base',
          certifications: ['Instructora Certificada', 'Pádel Kids'],
          hourlyRate: 40000,
          active: true
        }
      }),
      prisma.classInstructor.create({
        data: {
          clubId: club.id,
          name: 'Roberto López',
          email: 'roberto@padelpremium.mx',
          phone: '555-333-3333',
          specialties: ['Pádel Intermedio', 'Estrategia', 'Dobles'],
          bio: 'Campeón nacional de dobles 2020',
          certifications: ['Certificación Nacional', 'Táctica Avanzada'],
          hourlyRate: 45000,
          active: true
        }
      })
    ])

    // 6. Create Players/Customers (20 clientes)
    console.log('👥 Creating players...')
    const players = []
    const playerNames = [
      'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Pedro Sánchez',
      'Laura Rodríguez', 'Miguel Hernández', 'Isabel Gómez', 'Francisco Díaz', 'Carmen Moreno',
      'José Ruiz', 'Lucía Jiménez', 'Antonio Torres', 'Elena Álvarez', 'Manuel Romero',
      'Rosa Castro', 'David Ortiz', 'Patricia Rubio', 'Alejandro Molina', 'Sofía Delgado'
    ]

    for (let i = 0; i < playerNames.length; i++) {
      const player = await prisma.player.create({
        data: {
          clubId: club.id,
          name: playerNames[i],
          email: `player${i + 1}@example.com`,
          phone: `555-${String(i + 1).padStart(3, '0')}-${String(i + 1000).padStart(4, '0')}`,
          level: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'][Math.floor(Math.random() * 3)] as any,
          preferredHand: Math.random() > 0.5 ? 'RIGHT' : 'LEFT',
          active: true
        }
      })
      players.push(player)
    }

    // 7. Generate Bookings (Reservas) - Target: 150,000 MXN
    console.log('📅 Generating bookings for 150,000 MXN...')
    const bookings = []
    const currentMonth = startOfMonth(new Date())
    let totalBookingRevenue = 0
    const targetBookingRevenue = 15000000 // en centavos (150,000 MXN)

    // Generar reservas hasta alcanzar 150,000 MXN
    for (let day = 0; day < 30 && totalBookingRevenue < targetBookingRevenue; day++) {
      const date = addDays(currentMonth, day)
      
      // 3-5 reservas por día
      const bookingsPerDay = Math.floor(Math.random() * 3) + 3
      
      for (let b = 0; b < bookingsPerDay && totalBookingRevenue < targetBookingRevenue; b++) {
        const court = courts[Math.floor(Math.random() * courts.length)]
        const player = players[Math.floor(Math.random() * players.length)]
        const hour = Math.floor(Math.random() * 10) + 9 // 9:00 - 19:00
        const duration = Math.random() > 0.3 ? 90 : 60 // 60 o 90 minutos
        const price = duration === 90 ? court.pricePerHour * 1.5 : court.pricePerHour
        
        const booking = await prisma.booking.create({
          data: {
            clubId: club.id,
            courtId: court.id,
            date: date,
            startTime: `${hour}:00`,
            endTime: `${hour + Math.floor(duration/60)}:${duration % 60 || '00'}`,
            duration: duration,
            playerName: player.name,
            playerEmail: player.email,
            playerPhone: player.phone,
            totalPlayers: 4,
            price: price,
            paymentStatus: Math.random() > 0.2 ? 'completed' : 'pending',
            status: 'CONFIRMED',
            type: 'REGULAR'
          }
        })
        
        bookings.push(booking)
        
        // Crear transacción si está pagada
        if (booking.paymentStatus === 'completed') {
          await prisma.transaction.create({
            data: {
              clubId: club.id,
              type: 'INCOME',
              category: 'BOOKING',
              amount: price,
              currency: 'MXN',
              description: `Reserva ${court.name} - ${player.name}`,
              reference: booking.id,
              date: date,
              status: 'completed',
              paymentMethod: ['cash', 'card', 'transfer'][Math.floor(Math.random() * 3)],
              createdBy: adminUser.id
            }
          })
          totalBookingRevenue += price
        }
      }
    }

    console.log(`✅ Created ${bookings.length} bookings - Revenue: ${totalBookingRevenue / 100} MXN`)

    // 8. Generate Classes - Target: 150,000 MXN
    console.log('🎓 Generating classes for 150,000 MXN...')
    const classes = []
    let totalClassRevenue = 0
    const targetClassRevenue = 15000000 // en centavos

    for (let day = 0; day < 30 && totalClassRevenue < targetClassRevenue; day++) {
      const date = addDays(currentMonth, day)
      
      // 2-3 clases por día
      const classesPerDay = Math.floor(Math.random() * 2) + 2
      
      for (let c = 0; c < classesPerDay && totalClassRevenue < targetClassRevenue; c++) {
        const instructor = instructors[Math.floor(Math.random() * instructors.length)]
        const court = courts[Math.floor(Math.random() * courts.length)]
        const hour = [8, 10, 16, 18, 19][Math.floor(Math.random() * 5)]
        const classType = ['GROUP', 'PRIVATE', 'SEMI_PRIVATE'][Math.floor(Math.random() * 3)]
        const level = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'][Math.floor(Math.random() * 3)]
        
        let maxStudents, pricePerStudent
        if (classType === 'GROUP') {
          maxStudents = 8
          pricePerStudent = 25000 // $250 MXN por alumno
        } else if (classType === 'PRIVATE') {
          maxStudents = 1
          pricePerStudent = 100000 // $1000 MXN clase privada
        } else {
          maxStudents = 2
          pricePerStudent = 60000 // $600 MXN por alumno
        }
        
        const currentStudents = Math.min(
          Math.floor(Math.random() * maxStudents) + 1,
          maxStudents
        )
        
        const classEntity = await prisma.class.create({
          data: {
            clubId: club.id,
            instructorId: instructor.id,
            courtId: court.id,
            name: `Clase de ${level === 'BEGINNER' ? 'Iniciación' : level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}`,
            description: `Clase ${classType === 'GROUP' ? 'grupal' : classType === 'PRIVATE' ? 'privada' : 'semi-privada'} con ${instructor.name}`,
            type: classType as any,
            level: level as any,
            status: 'SCHEDULED',
            date: date,
            startTime: `${hour}:00`,
            endTime: `${hour + 1}:30`,
            duration: 90,
            maxStudents: maxStudents,
            currentStudents: currentStudents,
            price: pricePerStudent,
            currency: 'MXN'
          }
        })
        
        // Crear reservas de clase para cada estudiante
        for (let s = 0; s < currentStudents; s++) {
          const student = players[Math.floor(Math.random() * players.length)]
          const paid = Math.random() > 0.1 // 90% pagadas
          
          await prisma.classBooking.create({
            data: {
              classId: classEntity.id,
              studentName: student.name,
              studentEmail: student.email,
              studentPhone: student.phone,
              playerId: student.id,
              paymentStatus: paid ? 'completed' : 'pending',
              paidAmount: paid ? pricePerStudent : 0,
              dueAmount: paid ? 0 : pricePerStudent,
              status: 'ENROLLED',
              confirmed: true
            }
          })
          
          if (paid) {
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
                status: 'completed',
                paymentMethod: ['cash', 'card', 'transfer'][Math.floor(Math.random() * 3)],
                createdBy: adminUser.id
              }
            })
            totalClassRevenue += pricePerStudent
          }
        }
        
        classes.push(classEntity)
      }
    }

    console.log(`✅ Created ${classes.length} classes - Revenue: ${totalClassRevenue / 100} MXN`)

    // 9. Generate Expenses - Target: 150,000 MXN
    console.log('💸 Generating expenses for 150,000 MXN...')
    const expenses = []
    const expenseCategories = [
      { category: 'SALARY', description: 'Nómina empleados', amount: 3500000, vendor: 'Nómina' },
      { category: 'SALARY', description: 'Nómina instructores', amount: 2500000, vendor: 'Nómina' },
      { category: 'RENT', description: 'Renta mensual', amount: 4000000, vendor: 'Inmobiliaria XYZ' },
      { category: 'UTILITIES', description: 'Electricidad', amount: 800000, vendor: 'CFE' },
      { category: 'UTILITIES', description: 'Agua', amount: 300000, vendor: 'SACMEX' },
      { category: 'UTILITIES', description: 'Internet y telefonía', amount: 150000, vendor: 'Telmex' },
      { category: 'MAINTENANCE', description: 'Mantenimiento canchas', amount: 500000, vendor: 'Servicios Pro' },
      { category: 'MAINTENANCE', description: 'Limpieza', amount: 300000, vendor: 'Clean Service' },
      { category: 'EQUIPMENT', description: 'Pelotas de pádel', amount: 150000, vendor: 'Deportes México' },
      { category: 'EQUIPMENT', description: 'Redes y accesorios', amount: 200000, vendor: 'Pádel Shop' },
      { category: 'MARKETING', description: 'Publicidad digital', amount: 250000, vendor: 'Marketing Agency' },
      { category: 'MARKETING', description: 'Material promocional', amount: 150000, vendor: 'Imprenta Digital' },
      { category: 'OTHER', description: 'Seguro del club', amount: 400000, vendor: 'Seguros AXA' },
      { category: 'OTHER', description: 'Software y licencias', amount: 200000, vendor: 'Tech Solutions' }
    ]

    let totalExpenseAmount = 0
    const targetExpenseAmount = 15000000 // 150,000 MXN en centavos

    // Distribuir gastos a lo largo del mes
    for (const expenseData of expenseCategories) {
      if (totalExpenseAmount >= targetExpenseAmount) break
      
      const date = addDays(currentMonth, Math.floor(Math.random() * 28))
      const amount = Math.min(expenseData.amount, targetExpenseAmount - totalExpenseAmount)
      
      const expense = await prisma.expense.create({
        data: {
          clubId: club.id,
          category: expenseData.category as any,
          description: expenseData.description,
          amount: amount,
          date: date,
          vendor: expenseData.vendor,
          status: Math.random() > 0.3 ? 'paid' : 'approved',
          createdBy: adminUser.id
        }
      })
      
      // Crear transacción para gastos pagados
      if (expense.status === 'paid') {
        await prisma.transaction.create({
          data: {
            clubId: club.id,
            type: 'EXPENSE',
            category: expense.category,
            amount: amount,
            currency: 'MXN',
            description: expense.description,
            reference: expense.id,
            date: date,
            status: 'completed',
            paymentMethod: 'transfer',
            createdBy: adminUser.id
          }
        })
      }
      
      expenses.push(expense)
      totalExpenseAmount += amount
    }

    console.log(`✅ Created ${expenses.length} expenses - Total: ${totalExpenseAmount / 100} MXN`)

    // 10. Create some additional transactions for variety
    console.log('💰 Creating additional transactions...')
    
    // Membresías
    for (let i = 0; i < 5; i++) {
      const player = players[Math.floor(Math.random() * players.length)]
      await prisma.transaction.create({
        data: {
          clubId: club.id,
          type: 'INCOME',
          category: 'MEMBERSHIP',
          amount: 150000, // $1500 MXN
          currency: 'MXN',
          description: `Membresía mensual - ${player.name}`,
          date: addDays(currentMonth, Math.floor(Math.random() * 30)),
          status: 'completed',
          paymentMethod: 'card',
          createdBy: adminUser.id
        }
      })
    }

    // Venta de equipamiento
    for (let i = 0; i < 3; i++) {
      const player = players[Math.floor(Math.random() * players.length)]
      await prisma.transaction.create({
        data: {
          clubId: club.id,
          type: 'INCOME',
          category: 'EQUIPMENT',
          amount: Math.floor(Math.random() * 50000) + 20000,
          currency: 'MXN',
          description: `Venta equipamiento - ${player.name}`,
          date: addDays(currentMonth, Math.floor(Math.random() * 30)),
          status: 'completed',
          paymentMethod: 'cash',
          createdBy: adminUser.id
        }
      })
    }

    // 11. Create Payroll records for current month
    console.log('💼 Creating payroll records...')
    await prisma.payroll.create({
      data: {
        clubId: club.id,
        employeeName: 'Juan Pérez',
        employeeRole: 'Gerente General',
        period: format(currentMonth, 'yyyy-MM'),
        periodStart: startOfMonth(currentMonth),
        periodEnd: endOfMonth(currentMonth),
        baseSalary: 3500000,
        bonuses: 50000,
        deductions: 70000,
        netAmount: 3480000,
        status: 'paid',
        paidAt: new Date(),
        createdBy: adminUser.id
      }
    })

    await prisma.payroll.create({
      data: {
        clubId: club.id,
        employeeName: 'María García',
        employeeRole: 'Recepcionista',
        period: format(currentMonth, 'yyyy-MM'),
        periodStart: startOfMonth(currentMonth),
        periodEnd: endOfMonth(currentMonth),
        baseSalary: 1500000,
        bonuses: 0,
        deductions: 30000,
        netAmount: 1470000,
        status: 'paid',
        paidAt: new Date(),
        createdBy: adminUser.id
      }
    })

    // Instructor payroll
    for (const instructor of instructors) {
      const classesCount = classes.filter(c => c.instructorId === instructor.id).length
      await prisma.instructorPayroll.create({
        data: {
          clubId: club.id,
          instructorId: instructor.id,
          period: format(currentMonth, 'yyyy-MM'),
          periodStart: startOfMonth(currentMonth),
          periodEnd: endOfMonth(currentMonth),
          totalClasses: classesCount,
          totalHours: classesCount * 1.5,
          totalStudents: classesCount * 4,
          baseAmount: classesCount * instructor.hourlyRate,
          bonuses: 0,
          deductions: 0,
          netAmount: classesCount * instructor.hourlyRate,
          status: 'paid',
          paidAt: new Date(),
          createdBy: adminUser.id
        }
      })
    }

    // 12. Create Budget for current month
    console.log('📊 Creating budget...')
    const budget = await prisma.budget.create({
      data: {
        clubId: club.id,
        period: format(currentMonth, 'yyyy-MM'),
        totalBudget: 20000000, // 200,000 MXN
        notes: 'Presupuesto mensual estándar',
        categories: {
          create: [
            { category: 'BOOKING', budgetAmount: 7000000, actualAmount: 0 },
            { category: 'CLASS', budgetAmount: 7000000, actualAmount: 0 },
            { category: 'MEMBERSHIP', budgetAmount: 1000000, actualAmount: 0 },
            { category: 'SALARY', budgetAmount: 6000000, actualAmount: 0 },
            { category: 'RENT', budgetAmount: 4000000, actualAmount: 0 },
            { category: 'UTILITIES', budgetAmount: 1500000, actualAmount: 0 },
            { category: 'MAINTENANCE', budgetAmount: 1000000, actualAmount: 0 },
            { category: 'MARKETING', budgetAmount: 500000, actualAmount: 0 },
            { category: 'OTHER', budgetAmount: 1000000, actualAmount: 0 }
          ]
        }
      }
    })

    // 13. Generate Financial Report
    console.log('📈 Generating financial report...')
    const incomeTransactions = await prisma.transaction.aggregate({
      where: {
        clubId: club.id,
        type: 'INCOME',
        date: {
          gte: startOfMonth(currentMonth),
          lte: endOfMonth(currentMonth)
        }
      },
      _sum: { amount: true }
    })

    const expenseTransactions = await prisma.transaction.aggregate({
      where: {
        clubId: club.id,
        type: 'EXPENSE',
        date: {
          gte: startOfMonth(currentMonth),
          lte: endOfMonth(currentMonth)
        }
      },
      _sum: { amount: true }
    })

    const totalIncome = incomeTransactions._sum.amount || 0
    const totalExpenses = expenseTransactions._sum.amount || 0

    await prisma.financialReport.create({
      data: {
        clubId: club.id,
        type: 'MONTHLY',
        period: format(currentMonth, 'yyyy-MM'),
        startDate: startOfMonth(currentMonth),
        endDate: endOfMonth(currentMonth),
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        netProfit: totalIncome - totalExpenses,
        data: {
          income: {
            bookings: totalBookingRevenue,
            classes: totalClassRevenue,
            memberships: 750000,
            other: 150000
          },
          expenses: {
            salaries: 6000000,
            rent: 4000000,
            utilities: 1250000,
            maintenance: 800000,
            marketing: 400000,
            other: 600000
          }
        },
        status: 'FINAL',
        createdBy: adminUser.id
      }
    })

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('✨ TEST DATA SEED COMPLETED SUCCESSFULLY!')
    console.log('='.repeat(60))
    console.log('\n📊 RESUMEN DE DATOS CREADOS:')
    console.log('='.repeat(60))
    console.log(`🏢 Club: ${club.name}`)
    console.log(`👤 Admin User: admin@padelpremium.mx / admin123`)
    console.log(`🎾 Canchas: ${courts.length}`)
    console.log(`👨‍🏫 Instructores: ${instructors.length}`)
    console.log(`👥 Jugadores: ${players.length}`)
    console.log(`📅 Reservas: ${bookings.length}`)
    console.log(`🎓 Clases: ${classes.length}`)
    console.log(`💸 Gastos: ${expenses.length}`)
    console.log('\n💰 RESUMEN FINANCIERO:')
    console.log('='.repeat(60))
    console.log(`💚 Ingresos por Reservas: $${(totalBookingRevenue / 100).toLocaleString('es-MX')} MXN`)
    console.log(`💚 Ingresos por Clases: $${(totalClassRevenue / 100).toLocaleString('es-MX')} MXN`)
    console.log(`💚 Total Ingresos: $${(totalIncome / 100).toLocaleString('es-MX')} MXN`)
    console.log(`🔴 Total Gastos: $${(totalExpenses / 100).toLocaleString('es-MX')} MXN`)
    console.log(`📈 Ganancia Neta: $${((totalIncome - totalExpenses) / 100).toLocaleString('es-MX')} MXN`)
    console.log('='.repeat(60))
    console.log('\n🚀 El sistema está listo para pruebas completas!')
    console.log('   Accede con: admin@padelpremium.mx / admin123')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error seeding database:', error)
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