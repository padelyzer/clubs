import { PrismaClient } from '@prisma/client'
import { addDays, addWeeks, startOfMonth, setHours, setMinutes } from 'date-fns'

const prisma = new PrismaClient()

async function createClassesWithIncome() {
  try {
    console.log('🎾 Creando clases con transacciones de ingreso...')
    console.log('=' .repeat(60))

    const clubId = 'cmers0a3v0000r4ujqpxd0qls'
    const currentMonth = startOfMonth(new Date())
    
    // First, ensure we have an instructor
    let instructor = await prisma.classInstructor.findFirst({
      where: { clubId }
    })
    
    if (!instructor) {
      console.log('👨‍🏫 Creando instructor...')
      instructor = await prisma.classInstructor.create({
        data: {
          clubId,
          name: 'Carlos Mendoza',
          email: 'carlos.mendoza@padel.com',
          phone: '555-0001',
          bio: 'Instructor certificado con 10 años de experiencia',
          specialties: ['Técnica', 'Táctica', 'Preparación física'],
          hourlyRate: 50000, // $500 MXN per hour
          active: true
        }
      })
    }

    // Get a court for the classes
    const court = await prisma.court.findFirst({
      where: { clubId, active: true }
    })
    
    if (!court) {
      console.error('❌ No se encontraron canchas activas')
      return
    }

    // Define 3 types of classes
    const classTypes = [
      {
        name: 'Clase Individual - Técnica Avanzada',
        type: 'INDIVIDUAL' as const,
        level: 'ADVANCED' as const,
        price: 100000, // $1,000 MXN
        maxStudents: 1,
        duration: 60,
        description: 'Clase personalizada enfocada en perfeccionar técnica avanzada'
      },
      {
        name: 'Clase Grupal - Nivel Intermedio',
        type: 'GROUP' as const,
        level: 'INTERMEDIATE' as const,
        price: 50000, // $500 MXN per student
        maxStudents: 8,
        duration: 90,
        description: 'Clase grupal para jugadores con experiencia media'
      },
      {
        name: 'Clínica de Iniciación',
        type: 'CLINIC' as const,
        level: 'BEGINNER' as const,
        price: 30000, // $300 MXN per student
        maxStudents: 12,
        duration: 120,
        description: 'Clínica intensiva para principiantes'
      }
    ]

    // Student names for bookings
    const students = [
      { name: 'Ana García', email: 'ana@email.com', phone: '555-1001' },
      { name: 'Roberto Sánchez', email: 'roberto@email.com', phone: '555-1002' },
      { name: 'María López', email: 'maria@email.com', phone: '555-1003' },
      { name: 'Diego Martínez', email: 'diego@email.com', phone: '555-1004' },
      { name: 'Laura Rodríguez', email: 'laura@email.com', phone: '555-1005' },
      { name: 'Carlos Pérez', email: 'carlos@email.com', phone: '555-1006' },
      { name: 'Sofía Hernández', email: 'sofia@email.com', phone: '555-1007' },
      { name: 'Miguel Torres', email: 'miguel@email.com', phone: '555-1008' },
      { name: 'Valentina Ruiz', email: 'valentina@email.com', phone: '555-1009' },
      { name: 'Andrés Gómez', email: 'andres@email.com', phone: '555-1010' }
    ]

    let totalClasses = 0
    let totalIncome = 0

    // Create recurring classes (weekly) for the month
    for (const classType of classTypes) {
      console.log(`\n📚 Creando clases tipo: ${classType.name}`)
      
      // Create 4 classes (one per week) for each type
      for (let week = 0; week < 4; week++) {
        const classDate = addWeeks(currentMonth, week)
        // Set different times for each class type
        const startHour = classType.type === 'INDIVIDUAL' ? 10 : 
                         classType.type === 'GROUP' ? 16 : 18
        const classDateTime = setMinutes(setHours(classDate, startHour), 0)
        
        // Create the class
        const newClass = await prisma.class.create({
          data: {
            clubId,
            instructorId: instructor.id,
            name: `${classType.name} - Semana ${week + 1}`,
            description: classType.description,
            type: classType.type,
            level: classType.level,
            status: 'SCHEDULED',
            date: classDateTime,
            startTime: `${startHour}:00`,
            endTime: `${startHour + Math.floor(classType.duration / 60)}:${classType.duration % 60 || '00'}`,
            duration: classType.duration,
            courtId: court.id,
            maxStudents: classType.maxStudents,
            currentStudents: 0,
            price: classType.price,
            currency: 'MXN',
            isRecurring: true,
            recurrencePattern: JSON.stringify({
              pattern: 'WEEKLY',
              interval: 1,
              endDate: addWeeks(classDateTime, 4)
            })
          }
        })
        
        console.log(`  ✓ Clase creada: ${newClass.name}`)
        totalClasses++

        // Add students to the class (8 for group and clinic, 1 for individual)
        const numStudents = classType.type === 'INDIVIDUAL' ? 1 : 8
        let classIncome = 0
        
        for (let i = 0; i < numStudents && i < students.length; i++) {
          const student = students[i]
          
          // Create class booking
          const booking = await prisma.classBooking.create({
            data: {
              classId: newClass.id,
              studentName: student.name,
              studentEmail: student.email,
              studentPhone: student.phone,
              paymentStatus: 'completed',
              paymentMethod: i % 2 === 0 ? 'cash' : 'transfer',
              paidAmount: classType.price,
              dueAmount: 0,
              status: 'ENROLLED',
              confirmed: true,
              attended: week < 2, // Mark as attended for past weeks
              attendanceStatus: week < 2 ? 'PRESENT' : null
            }
          })
          
          classIncome += classType.price
        }
        
        // Update current students count
        await prisma.class.update({
          where: { id: newClass.id },
          data: { currentStudents: numStudents }
        })
        
        // Create income transaction for this class
        const transaction = await prisma.transaction.create({
          data: {
            clubId,
            type: 'INCOME',
            category: 'CLASS',
            amount: classIncome,
            currency: 'MXN',
            description: `Ingresos de ${newClass.name} - ${numStudents} estudiantes`,
            reference: `CLASS-${newClass.id}`,
            date: classDateTime,
            notes: `Clase ${classType.type} con ${numStudents} estudiantes inscritos`
          }
        })
        
        console.log(`  💰 Transacción creada: $${classIncome / 100} MXN`)
        totalIncome += classIncome
      }
    }

    // Create some additional one-time special classes
    console.log('\n🌟 Creando clases especiales...')
    
    const specialClasses = [
      {
        name: 'Masterclass con Profesional',
        type: 'CLINIC' as const,
        price: 150000, // $1,500 MXN
        students: 10
      },
      {
        name: 'Taller de Estrategia y Táctica',
        type: 'GROUP' as const,
        price: 75000, // $750 MXN
        students: 6
      }
    ]

    for (const special of specialClasses) {
      const classDate = addDays(currentMonth, Math.floor(Math.random() * 20) + 5)
      
      const specialClass = await prisma.class.create({
        data: {
          clubId,
          instructorId: instructor.id,
          name: special.name,
          description: 'Clase especial con contenido exclusivo',
          type: special.type,
          level: 'INTERMEDIATE',
          status: 'SCHEDULED',
          date: classDate,
          startTime: '11:00',
          endTime: '13:00',
          duration: 120,
          courtId: court.id,
          maxStudents: 12,
          currentStudents: special.students,
          price: special.price,
          currency: 'MXN',
          isRecurring: false
        }
      })
      
      // Add students
      for (let i = 0; i < special.students && i < students.length; i++) {
        const student = students[i]
        await prisma.classBooking.create({
          data: {
            classId: specialClass.id,
            studentName: student.name,
            studentEmail: student.email,
            studentPhone: student.phone,
            paymentStatus: 'completed',
            paymentMethod: 'transfer',
            paidAmount: special.price,
            dueAmount: 0,
            status: 'ENROLLED',
            confirmed: true
          }
        })
      }
      
      // Create transaction
      const specialIncome = special.price * special.students
      await prisma.transaction.create({
        data: {
          clubId,
          type: 'INCOME',
          category: 'CLASS',
          amount: specialIncome,
          currency: 'MXN',
          description: special.name,
          reference: `SPECIAL-CLASS-${specialClass.id}`,
          date: classDate,
          notes: `Clase especial con ${special.students} estudiantes`
        }
      })
      
      console.log(`  ✓ ${special.name}: $${specialIncome / 100} MXN`)
      totalIncome += specialIncome
      totalClasses++
    }

    // Summary
    console.log('\n' + '=' .repeat(60))
    console.log('📊 RESUMEN:')
    console.log(`  ✓ ${totalClasses} clases creadas`)
    console.log(`  ✓ Ingreso total generado: $${totalIncome / 100} MXN`)
    console.log(`  ✓ Tipos: Individual, Grupal, Clínica`)
    console.log(`  ✓ Clases recurrentes semanales configuradas`)
    console.log(`  ✓ 8 estudiantes promedio por clase grupal`)
    console.log('=' .repeat(60))
    console.log('✅ Clases con ingresos creadas exitosamente')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createClassesWithIncome()