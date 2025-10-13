import { PrismaClient } from '@prisma/client'
import { addDays, addHours } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🎾 INICIANDO SEED DEL MÓDULO DE CLASES (SIN CRÉDITOS NI MEMBRESÍAS)\n')
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
          { clubId: club.id, name: 'Cancha 1', indoor: false, active: true },
          { clubId: club.id, name: 'Cancha 2', indoor: true, active: true },
          { clubId: club.id, name: 'Cancha 3', indoor: false, active: true }
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
        groupPrice: 30000, // $300 MXN por persona
        clinicPrice: 25000, // $250 MXN por persona
        instructorPaymentType: 'PERCENTAGE',
        instructorPercentage: 60, // 60% para el instructor
        enableBulkDiscount: true,
        bulkDiscountThreshold: 10,
        bulkDiscountPercentage: 15
      }
    })
    
    // 5. Create simple class packages (prepaid bundles)
    console.log('📦 Creando paquetes de clases simples...')
    const packages = await Promise.all([
      prisma.classPackage.create({
        data: {
          clubId: club.id,
          name: 'Paquete 5 Clases',
          description: 'Ideal para principiantes - Ahorra $250',
          classCount: 5,
          price: 125000, // $1,250 MXN (vs $1,500 individual)
          validityDays: 30,
          classTypes: ['GROUP', 'CLINIC'],
          active: true
        }
      }),
      prisma.classPackage.create({
        data: {
          clubId: club.id,
          name: 'Paquete 10 Clases',
          description: 'Para alumnos regulares - Ahorra $800',
          classCount: 10,
          price: 220000, // $2,200 MXN (vs $3,000 individual)
          validityDays: 60,
          classTypes: ['GROUP', 'CLINIC'],
          active: true
        }
      }),
      prisma.classPackage.create({
        data: {
          clubId: club.id,
          name: 'Paquete 20 Clases',
          description: 'Máximo ahorro - $2,000 de descuento',
          classCount: 20,
          price: 400000, // $4,000 MXN (vs $6,000 individual)
          validityDays: 90,
          classTypes: ['GROUP', 'CLINIC'],
          active: true
        }
      })
    ])
    console.log(`✅ ${packages.length} paquetes creados`)
    
    // 6. Create student profiles (simplified without packages/memberships)
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
          totalSpent: 750000, // $7,500 MXN
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
          totalSpent: 150000, // $1,500 MXN
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
          totalSpent: 2500000, // $25,000 MXN
          averageRating: 4.8,
          active: true
        }
      })
    ])
    console.log(`✅ ${students.length} estudiantes creados`)
    
    // 6. Create classes (individual, group, recurring)
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
          price: 60000, // $600 MXN
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
          price: 30000, // $300 MXN por persona
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
          price: 35000, // $350 MXN por persona
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
        price: 50000, // $500 MXN por persona
        currency: 'MXN',
        requirements: 'Nivel intermedio mínimo',
        materials: 'Pelotas incluidas, traer agua y toalla'
      }
    })
    
    const totalClasses = individualClasses.length + groupClasses.length + 1
    console.log(`✅ ${totalClasses} clases creadas`)
    
    // 7. Create class bookings with direct payment (no packages)
    console.log('📝 Creando inscripciones a clases...')
    await Promise.all([
      // Ana en clase individual - pago completo
      prisma.classBooking.create({
        data: {
          classId: individualClasses[0].id,
          studentName: students[0].name,
          studentEmail: students[0].email,
          studentPhone: students[0].phone,
          paymentStatus: 'completed',
          paymentMethod: 'online',
          paidAmount: 60000, // Pago completo $600 MXN
          dueAmount: 0,
          status: 'ENROLLED',
          confirmed: true
        }
      }),
      // Roberto en clase grupal principiante - pendiente de pago
      prisma.classBooking.create({
        data: {
          classId: groupClasses[0].id,
          studentName: students[1].name,
          studentEmail: students[1].email,
          studentPhone: students[1].phone,
          paymentStatus: 'pending',
          paymentMethod: 'onsite',
          paidAmount: 0,
          dueAmount: 30000, // Debe $300 MXN
          status: 'ENROLLED'
        }
      }),
      // Laura en clase grupal intermedio - pago completo
      prisma.classBooking.create({
        data: {
          classId: groupClasses[1].id,
          studentName: students[2].name,
          studentEmail: students[2].email,
          studentPhone: students[2].phone,
          paymentStatus: 'completed',
          paymentMethod: 'transfer',
          paidAmount: 35000, // Pago completo $350 MXN
          dueAmount: 0,
          status: 'ENROLLED',
          confirmed: true,
          notes: 'Pago por transferencia bancaria'
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
    
    // 8. Create package purchase example
    console.log('💳 Creando compra de paquete de ejemplo...')
    await prisma.packagePurchase.create({
      data: {
        packageId: packages[1].id, // Paquete 10 clases
        studentId: students[2].phone, // Laura
        studentName: students[2].name,
        studentEmail: students[2].email,
        studentPhone: students[2].phone,
        purchaseDate: new Date(),
        expirationDate: addDays(new Date(), 60),
        classesUsed: 2, // Ya usó 2 clases
        classesRemaining: 8, // Le quedan 8
        status: 'active',
        paymentStatus: 'completed',
        paidAmount: packages[1].price,
        notes: 'Compra online - Paquete 10 clases'
      }
    })
    console.log('✅ Ejemplo de paquete comprado')
    
    // 9. Create waitlist entries
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
    
    // 9. Create student achievements
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
    
    // 10. Create analytics
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
      students: students.length,
      classes: totalClasses,
      enrollments: 3,
      packagePurchases: 1,
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
    console.log('   Instructores: http://localhost:3000/dashboard/instructors')
    
    console.log('\n💳 SISTEMA DE PAGOS:')
    console.log('   ✅ Pago directo por clase individual')
    console.log('   ✅ Paquetes prepagados (5, 10, 20 clases)')
    console.log('   ❌ Sin membresías mensuales')
    
    console.log('\n📦 PAQUETES DISPONIBLES:')
    packages.forEach(pkg => {
      const savings = (30000 * pkg.classCount) - pkg.price
      console.log(`   ${pkg.name}: $${pkg.price/100} MXN - Ahorro $${savings/100}`)
    })
    
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