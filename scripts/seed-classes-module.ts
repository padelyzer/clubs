import { PrismaClient } from '@prisma/client'
import { addDays, addHours, addWeeks, format } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🎾 INICIANDO SEED DEL MÓDULO DE CLASES AVANZADO\n')
  console.log('=' .repeat(60))
  
  try {
    // 1. Create test club if not exists
    let club = await prisma.club.findFirst()
    if (!club) {
      console.log('📍 Creando club de prueba...')
      club = await prisma.club.create({
        data: {
          name: 'Club Padel Puebla',
          slug: 'club-padel-puebla',
          email: 'info@clubpadelpuebla.com',
          phone: '2221234567',
          address: 'Av. Principal 123',
          city: 'Puebla',
          state: 'Puebla',
          country: 'Mexico',
          status: 'APPROVED',
          active: true,
          whatsappNumber: '+525549125610'
        }
      })
    }
    
    // 2. Create courts if not exist
    const courtCount = await prisma.court.count({ where: { clubId: club.id } })
    if (courtCount === 0) {
      console.log('🎾 Creando canchas...')
      await prisma.court.createMany({
        data: [
          { clubId: club.id, name: 'Cancha 1', type: 'PADEL', indoor: false, active: true },
          { clubId: club.id, name: 'Cancha 2', type: 'PADEL', indoor: true, active: true },
          { clubId: club.id, name: 'Cancha 3', type: 'PADEL', indoor: false, active: true }
        ]
      })
    }
    const courts = await prisma.court.findMany({ where: { clubId: club.id } })
    
    // 3. Create instructors
    console.log('👨‍🏫 Creando instructores...')
    const instructors = await Promise.all([
      prisma.classInstructor.create({
        data: {
          clubId: club.id,
          name: 'Carlos Mendoza',
          email: 'carlos@clubpadel.com',
          phone: '2223334444',
          bio: 'Instructor certificado con 10 años de experiencia',
          specialties: ['Técnica', 'Táctica', 'Preparación física'],
          hourlyRate: 50000, // $500 MXN/hora
          paymentType: 'HOURLY',
          active: true
        }
      }),
      prisma.classInstructor.create({
        data: {
          clubId: club.id,
          name: 'María Fernández',
          email: 'maria@clubpadel.com',
          phone: '2224445555',
          bio: 'Ex-jugadora profesional, especialista en alto rendimiento',
          specialties: ['Alto rendimiento', 'Competición', 'Mentalidad'],
          hourlyRate: 70000, // $700 MXN/hora
          paymentType: 'HOURLY',
          active: true
        }
      }),
      prisma.classInstructor.create({
        data: {
          clubId: club.id,
          name: 'Luis García',
          email: 'luis@clubpadel.com',
          phone: '2225556666',
          bio: 'Especialista en iniciación y clases grupales',
          specialties: ['Iniciación', 'Niños', 'Grupos'],
          hourlyRate: 40000, // $400 MXN/hora
          monthlyRate: 1500000, // $15,000 MXN/mes
          paymentType: 'MONTHLY',
          active: true
        }
      })
    ])
    console.log(`✅ ${instructors.length} instructores creados`)
    
    // 4. Create class pricing configuration
    console.log('💰 Configurando precios de clases...')
    await prisma.classPricing.upsert({
      where: { clubId: club.id },
      update: {},
      create: {
        clubId: club.id,
        individualPrice: 60000, // $600 MXN
        groupPrice: 30000, // $300 MXN
        clinicPrice: 25000, // $250 MXN
        instructorPaymentType: 'PERCENTAGE',
        instructorPercentage: 60, // 60% para el instructor
        enableBulkDiscount: true,
        bulkDiscountThreshold: 10,
        bulkDiscountPercentage: 15
      }
    })
    
    // 5. Create class packages
    console.log('📦 Creando paquetes de clases...')
    const packages = await Promise.all([
      prisma.classPackage.create({
        data: {
          clubId: club.id,
          name: 'Paquete Iniciación',
          description: '5 clases grupales para principiantes',
          classCount: 5,
          price: 125000, // $1,250 MXN ($250 por clase)
          validityDays: 30,
          classTypes: ['GROUP', 'CLINIC'],
          active: true
        }
      }),
      prisma.classPackage.create({
        data: {
          clubId: club.id,
          name: 'Paquete Intermedio',
          description: '10 clases para jugadores regulares',
          classCount: 10,
          price: 220000, // $2,200 MXN ($220 por clase)
          validityDays: 60,
          classTypes: ['GROUP', 'CLINIC', 'INTENSIVE'],
          active: true
        }
      }),
      prisma.classPackage.create({
        data: {
          clubId: club.id,
          name: 'Paquete Avanzado',
          description: '20 clases con descuento especial',
          classCount: 20,
          price: 400000, // $4,000 MXN ($200 por clase)
          validityDays: 90,
          classTypes: ['GROUP', 'CLINIC', 'INTENSIVE', 'INDIVIDUAL'],
          active: true
        }
      })
    ])
    console.log(`✅ ${packages.length} paquetes creados`)
    
    // 6. Create memberships
    console.log('🎫 Creando membresías...')
    const memberships = await Promise.all([
      prisma.classMembership.create({
        data: {
          clubId: club.id,
          name: 'Membresía Básica',
          description: 'Acceso a 8 clases grupales al mes',
          type: 'LIMITED',
          classLimit: 8,
          price: 180000, // $1,800 MXN/mes
          benefits: ['Clases grupales', 'Acceso a clinicas', 'Descuento 10% en tienda'],
          active: true
        }
      }),
      prisma.classMembership.create({
        data: {
          clubId: club.id,
          name: 'Membresía Premium',
          description: 'Clases ilimitadas + beneficios exclusivos',
          type: 'UNLIMITED',
          classLimit: null,
          price: 350000, // $3,500 MXN/mes
          benefits: [
            'Clases ilimitadas',
            'Clases individuales con descuento',
            'Acceso prioritario',
            'Eventos exclusivos',
            'Descuento 20% en tienda'
          ],
          active: true
        }
      })
    ])
    console.log(`✅ ${memberships.length} membresías creadas`)
    
    // 7. Create student profiles
    console.log('👥 Creando perfiles de estudiantes...')
    const students = await Promise.all([
      prisma.studentProfile.create({
        data: {
          studentId: 'student_001',
          name: 'Ana Martínez',
          email: 'ana@email.com',
          phone: '2221112222',
          birthDate: new Date('1990-05-15'),
          level: 'INTERMEDIATE',
          preferredDays: ['1', '3', '5'], // Lunes, Miércoles, Viernes
          preferredTimes: ['18:00', '19:00'],
          goals: 'Mejorar técnica y participar en torneos',
          totalClasses: 25,
          totalSpent: 750000,
          averageRating: 4.5,
          active: true
        }
      }),
      prisma.studentProfile.create({
        data: {
          studentId: 'student_002',
          name: 'Roberto Silva',
          email: 'roberto@email.com',
          phone: '2222223333',
          level: 'BEGINNER',
          preferredDays: ['6', '0'], // Sábado, Domingo
          preferredTimes: ['10:00', '11:00'],
          goals: 'Aprender los fundamentos del padel',
          totalClasses: 5,
          totalSpent: 150000,
          active: true
        }
      }),
      prisma.studentProfile.create({
        data: {
          studentId: 'student_003',
          name: 'Laura González',
          email: 'laura@email.com',
          phone: '2223334444',
          birthDate: new Date('1985-08-20'),
          level: 'ADVANCED',
          preferredDays: ['1', '2', '3', '4', '5'],
          preferredTimes: ['07:00', '08:00'],
          goals: 'Mantener nivel competitivo',
          totalClasses: 100,
          totalSpent: 2500000,
          averageRating: 4.8,
          active: true
        }
      })
    ])
    console.log(`✅ ${students.length} estudiantes creados`)
    
    // 8. Create classes (individual, group, recurring)
    console.log('📚 Creando clases...')
    const tomorrow = addDays(new Date(), 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    // Individual classes
    const individualClasses = await Promise.all([
      prisma.class.create({
        data: {
          clubId: club.id,
          instructorId: instructors[1].id, // María (alto rendimiento)
          courtId: courts[0].id,
          name: 'Clase Individual - Técnica Avanzada',
          description: 'Perfeccionamiento de golpes y estrategia',
          type: 'INDIVIDUAL',
          level: 'ADVANCED',
          status: 'SCHEDULED',
          date: addHours(tomorrow, 10),
          startTime: '10:00',
          endTime: '11:00',
          duration: 60,
          maxStudents: 1,
          price: 60000,
          currency: 'MXN'
        }
      })
    ])
    
    // Group classes
    const groupClasses = await Promise.all([
      prisma.class.create({
        data: {
          clubId: club.id,
          instructorId: instructors[2].id, // Luis (grupos)
          courtId: courts[1].id,
          name: 'Clase Grupal - Iniciación',
          description: 'Aprende los fundamentos del padel',
          type: 'GROUP',
          level: 'BEGINNER',
          status: 'SCHEDULED',
          date: addHours(tomorrow, 18),
          startTime: '18:00',
          endTime: '19:30',
          duration: 90,
          maxStudents: 8,
          price: 30000,
          currency: 'MXN',
          notes: 'Traer raqueta propia o solicitar prestada'
        }
      }),
      prisma.class.create({
        data: {
          clubId: club.id,
          instructorId: instructors[0].id, // Carlos
          courtId: courts[2].id,
          name: 'Clase Grupal - Intermedio',
          description: 'Mejora tu juego con ejercicios tácticos',
          type: 'GROUP',
          level: 'INTERMEDIATE',
          status: 'SCHEDULED',
          date: addHours(tomorrow, 19),
          startTime: '19:00',
          endTime: '20:30',
          duration: 90,
          maxStudents: 6,
          price: 35000,
          currency: 'MXN'
        }
      })
    ])
    
    // Clinic
    const clinic = await prisma.class.create({
      data: {
        clubId: club.id,
        instructorId: instructors[1].id,
        courtId: courts[0].id,
        name: 'Clínica de Fin de Semana',
        description: 'Intensivo de técnica y táctica',
        type: 'CLINIC',
        level: 'MIXED',
        status: 'SCHEDULED',
        date: addDays(tomorrow, 5), // Sábado
        startTime: '09:00',
        endTime: '13:00',
        duration: 240,
        maxStudents: 12,
        price: 50000,
        currency: 'MXN',
        requirements: 'Nivel intermedio mínimo',
        materials: 'Pelotas incluidas, traer agua y toalla'
      }
    })
    
    const totalClasses = individualClasses.length + groupClasses.length + 1
    console.log(`✅ ${totalClasses} clases creadas`)
    
    // 9. Create class bookings with students
    console.log('📝 Creando inscripciones a clases...')
    await Promise.all([
      // Ana en clase individual
      prisma.classBooking.create({
        data: {
          classId: individualClasses[0].id,
          studentName: students[0].name,
          studentEmail: students[0].email,
          studentPhone: students[0].phone,
          // playerId is optional, relates to Player table
          paymentStatus: 'completed',
          paymentMethod: 'online',
          paidAmount: 60000,
          dueAmount: 0,
          status: 'ENROLLED',
          confirmed: true
        }
      }),
      // Roberto en clase grupal principiante
      prisma.classBooking.create({
        data: {
          classId: groupClasses[0].id,
          studentName: students[1].name,
          studentEmail: students[1].email,
          studentPhone: students[1].phone,
          // playerId is optional
          paymentStatus: 'pending',
          paymentMethod: 'onsite',
          paidAmount: 0,
          dueAmount: 30000,
          status: 'ENROLLED'
        }
      }),
      // Laura en clase grupal intermedio
      prisma.classBooking.create({
        data: {
          classId: groupClasses[1].id,
          studentName: students[2].name,
          studentEmail: students[2].email,
          studentPhone: students[2].phone,
          // playerId is optional
          paymentStatus: 'completed',
          paymentMethod: 'package', // Usando paquete
          paidAmount: 0,
          dueAmount: 0,
          status: 'ENROLLED',
          confirmed: true,
          notes: 'Pagado con paquete'
        }
      })
    ])
    
    // Update class current students
    await prisma.class.update({
      where: { id: individualClasses[0].id },
      data: { currentStudents: 1 }
    })
    await prisma.class.update({
      where: { id: groupClasses[0].id },
      data: { currentStudents: 1 }
    })
    await prisma.class.update({
      where: { id: groupClasses[1].id },
      data: { currentStudents: 1 }
    })
    
    console.log('✅ Inscripciones creadas')
    
    // 10. Create package purchases
    console.log('💳 Creando compras de paquetes...')
    await prisma.packagePurchase.create({
      data: {
        packageId: packages[1].id, // Paquete Intermedio
        studentId: students[2].studentId, // Laura
        studentName: students[2].name,
        studentEmail: students[2].email,
        studentPhone: students[2].phone,
        purchaseDate: addDays(new Date(), -15),
        expirationDate: addDays(new Date(), 45),
        classesUsed: 3,
        classesRemaining: 7,
        status: 'active',
        paymentStatus: 'completed',
        paidAmount: 220000
      }
    })
    
    // 11. Create membership subscription
    console.log('🎟️ Creando suscripciones a membresías...')
    await prisma.membershipSubscription.create({
      data: {
        membershipId: memberships[1].id, // Premium
        studentId: students[0].studentId, // Ana
        studentName: students[0].name,
        studentEmail: students[0].email,
        studentPhone: students[0].phone,
        startDate: addDays(new Date(), -30),
        endDate: addDays(new Date(), 30),
        status: 'active',
        classesUsed: 12,
        lastBillingDate: addDays(new Date(), -30),
        nextBillingDate: addDays(new Date(), 30),
        autoRenew: true
      }
    })
    
    // 12. Create waitlist entries
    console.log('⏳ Creando lista de espera...')
    await prisma.classWaitlist.create({
      data: {
        classId: individualClasses[0].id,
        studentId: 'student_004',
        studentName: 'Pedro Ramírez',
        studentPhone: '2225557777',
        studentEmail: 'pedro@email.com',
        position: 1,
        priority: 5,
        status: 'waiting',
        expiresAt: addDays(new Date(), 2)
      }
    })
    
    // 13. Create student achievements
    console.log('🏆 Creando logros de estudiantes...')
    await Promise.all([
      prisma.studentAchievement.create({
        data: {
          studentId: students[2].id, // Laura
          type: 'CLASSES_MILESTONE',
          name: '100 Clases Completadas',
          description: 'Has alcanzado el hito de 100 clases',
          metadata: { totalClasses: 100, date: new Date() }
        }
      }),
      prisma.studentAchievement.create({
        data: {
          studentId: students[0].id, // Ana
          type: 'SKILL_LEVEL',
          name: 'Nivel Intermedio',
          description: 'Has alcanzado el nivel intermedio',
          metadata: { previousLevel: 'BEGINNER', newLevel: 'INTERMEDIATE' }
        }
      })
    ])
    
    // 14. Create some student progress records
    console.log('📈 Creando registros de progreso...')
    await prisma.studentProgress.create({
      data: {
        studentId: students[0].id,
        classId: individualClasses[0].id,
        instructorId: instructors[1].id,
        date: new Date(),
        skillsEvaluated: {
          forehand: 8,
          backhand: 7,
          volley: 7,
          serve: 6,
          tactics: 8
        },
        overallScore: 7.2,
        strengths: 'Excelente derecha y comprensión táctica',
        improvements: 'Trabajar en el servicio y revés',
        instructorNotes: 'Muestra gran progreso en las últimas semanas'
      }
    })
    
    // 15. Create a sample payroll for instructor
    console.log('💵 Creando liquidación de instructor...')
    const lastMonth = addDays(new Date(), -30)
    const payroll = await prisma.instructorPayroll.create({
      data: {
        instructorId: instructors[0].id,
        periodStart: lastMonth,
        periodEnd: new Date(),
        totalClasses: 20,
        totalHours: 30,
        totalStudents: 120,
        grossAmount: 1500000, // $15,000 MXN
        deductions: 0,
        netAmount: 1500000,
        status: 'pending',
        notes: 'Liquidación mensual'
      }
    })
    
    // 16. Generate analytics
    console.log('📊 Generando analytics...')
    await prisma.classAnalytics.create({
      data: {
        clubId: club.id,
        period: 'MONTHLY',
        periodDate: new Date(),
        totalClasses: 45,
        totalStudents: 280,
        totalRevenue: 8500000, // $85,000 MXN
        avgAttendance: 6.2,
        avgRating: 4.5,
        metricsbyType: {
          INDIVIDUAL: { count: 10, revenue: 6000000, students: 10 },
          GROUP: { count: 30, revenue: 9000000, students: 240 },
          CLINIC: { count: 5, revenue: 2500000, students: 30 }
        },
        metricsByInstructor: {
          [instructors[0].id]: { classes: 15, revenue: 4500000, rating: 4.6 },
          [instructors[1].id]: { classes: 20, revenue: 7000000, rating: 4.8 },
          [instructors[2].id]: { classes: 10, revenue: 3000000, rating: 4.2 }
        },
        attendanceTrend: 15.5, // +15.5%
        revenueTrend: 22.3 // +22.3%
      }
    })
    
    console.log('\n' + '=' .repeat(60))
    console.log('✨ SEED COMPLETADO EXITOSAMENTE\n')
    
    // Generate summary
    const summary = {
      club: club.name,
      instructors: instructors.length,
      packages: packages.length,
      memberships: memberships.length,
      students: students.length,
      classes: totalClasses,
      enrollments: 3,
      waitlist: 1,
      achievements: 2
    }
    
    console.log('📊 RESUMEN:')
    Object.entries(summary).forEach(([key, value]) => {
      console.log(`   ${key.padEnd(15)}: ${value}`)
    })
    
    console.log('\n🔗 ACCESOS:')
    console.log('   Dashboard: http://localhost:3000/dashboard')
    console.log('   Clases: http://localhost:3000/dashboard/classes')
    console.log('   Instructores: http://localhost:3000/dashboard/coaches')
    
    return summary
    
  } catch (error) {
    console.error('❌ Error en seed:', error)
    throw error
  }
}

main()
  .then((summary) => {
    console.log('\n✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })