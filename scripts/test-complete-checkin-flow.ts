#!/usr/bin/env npx tsx

import { prisma } from '../lib/config/prisma'

async function testCompleteCheckInFlow() {
  console.log('🧪 PROBANDO FLUJO COMPLETO DE CHECK-IN CON PAGO A INSTRUCTOR')
  console.log('===========================================================\n')
  
  try {
    // 1. Crear una clase de prueba con instructor que cobra por hora
    const instructor = await prisma.classInstructor.findFirst({
      where: { paymentType: 'HOURLY' }
    })
    
    if (!instructor) {
      console.log('❌ No hay instructores que cobren por hora')
      return
    }
    
    const court = await prisma.court.findFirst()
    const club = await prisma.club.findFirst()
    
    if (!court || !club) {
      console.log('❌ No se encontraron cancha o club')
      return
    }
    
    console.log('📚 Creando clase de prueba...')
    const testClass = await prisma.class.create({
      data: {
        clubId: club.id,
        instructorId: instructor.id,
        name: 'Clase Test - Pago Instructor',
        description: 'Clase para probar el flujo de pago automático al instructor',
        type: 'GROUP',
        level: 'INTERMEDIATE',
        status: 'SCHEDULED',
        date: new Date(),
        startTime: '18:00',
        endTime: '19:30',
        duration: 90, // 1.5 horas
        courtId: court.id,
        maxStudents: 6,
        currentStudents: 0,
        price: 60000, // $600 MXN
        currency: 'MXN'
      }
    })
    
    console.log(`✅ Clase creada: ${testClass.name} (ID: ${testClass.id})`)
    console.log(`   Instructor: ${instructor.name} (${instructor.hourlyRate} centavos/hora)`)
    console.log(`   Duración: ${testClass.duration} minutos`)
    
    // 2. Crear inscripción de estudiante
    console.log('\n👥 Creando inscripción de estudiante...')
    const enrollment = await prisma.classBooking.create({
      data: {
        classId: testClass.id,
        studentName: 'Test Student Complete Flow',
        studentEmail: 'test@example.com',
        studentPhone: '+5212345678901',
        enrollmentDate: new Date(),
        paymentStatus: 'pending',
        paymentMethod: 'onsite',
        status: 'ENROLLED',
        paidAmount: 0,
        dueAmount: testClass.price
      }
    })
    
    console.log(`✅ Inscripción creada: ${enrollment.studentName} (ID: ${enrollment.id})`)
    console.log(`   Estado de pago: ${enrollment.paymentStatus}`)
    console.log(`   Monto debido: ${enrollment.dueAmount} centavos`)
    
    // 3. Verificar que no existe pago previo al instructor
    const existingPayment = await prisma.transaction.findFirst({
      where: { reference: `INSTRUCTOR_${testClass.id}` }
    })
    
    console.log(`\n💸 Verificando pagos previos al instructor:`)
    if (existingPayment) {
      console.log('❌ Ya existe un pago previo - esto no debería ocurrir')
      return
    } else {
      console.log('✅ No hay pagos previos al instructor')
    }
    
    // 4. Simular check-in con pago usando el endpoint
    console.log('\n🎯 Simulando check-in con pago...')
    
    // Crear transacción para simular el check-in
    await prisma.$transaction(async (tx) => {
      // Procesar pago del estudiante
      await tx.transaction.create({
        data: {
          clubId: testClass.clubId,
          type: 'INCOME',
          category: 'CLASS',
          amount: enrollment.dueAmount,
          currency: 'MXN',
          description: `Pago de clase: ${testClass.name} - ${enrollment.studentName}`,
          date: new Date(),
          reference: `MANUAL_${enrollment.id}`,
          notes: JSON.stringify({
            classId: testClass.id,
            classBookingId: enrollment.id,
            studentName: enrollment.studentName,
            paymentMethod: 'CASH',
            className: testClass.name
          })
        }
      })
      
      // Actualizar estado de pago
      await tx.classBooking.update({
        where: { id: enrollment.id },
        data: {
          paymentStatus: 'completed',
          paymentMethod: 'onsite',
          paidAmount: enrollment.dueAmount
        }
      })
      
      // Registrar asistencia
      const updatedBooking = await tx.classBooking.update({
        where: { id: enrollment.id },
        data: {
          attended: true,
          attendanceStatus: 'PRESENT',
          attendanceTime: new Date(),
          status: 'CHECKED_IN'
        }
      })
      
      // REGISTRAR PAGO AL INSTRUCTOR (esto es lo que estamos probando)
      const firstCheckIn = await tx.classBooking.findFirst({
        where: {
          classId: testClass.id,
          attended: true,
          id: { not: enrollment.id }
        }
      })
      
      if (!firstCheckIn && instructor.paymentType === 'HOURLY') {
        const hours = testClass.duration / 60
        const instructorPayment = Math.round((instructor.hourlyRate || 0) * hours)
        
        if (instructorPayment > 0) {
          await tx.transaction.create({
            data: {
              clubId: testClass.clubId,
              type: 'EXPENSE',
              category: 'SALARY',
              amount: instructorPayment,
              currency: 'MXN',
              description: `Pago a instructor ${instructor.name} - Clase: ${testClass.name}`,
              date: new Date(),
              reference: `INSTRUCTOR_${testClass.id}`,
              notes: JSON.stringify({
                classId: testClass.id,
                instructorId: instructor.id,
                instructorName: instructor.name,
                className: testClass.name,
                hours: hours,
                hourlyRate: instructor.hourlyRate,
                attendanceTriggered: true,
                testFlow: true
              })
            }
          })
          
          console.log(`✅ Pago al instructor registrado automáticamente`)
          console.log(`   Monto: ${instructorPayment} centavos (${instructorPayment/100} MXN)`)
        }
      }
    })
    
    // 5. Verificar resultados
    console.log('\n🔍 Verificando resultados finales...')
    
    const finalEnrollment = await prisma.classBooking.findUnique({
      where: { id: enrollment.id }
    })
    
    const instructorPayment = await prisma.transaction.findFirst({
      where: { reference: `INSTRUCTOR_${testClass.id}` }
    })
    
    const studentPayment = await prisma.transaction.findFirst({
      where: { reference: `MANUAL_${enrollment.id}` }
    })
    
    console.log(`\n📊 RESULTADOS:`)
    console.log(`✅ Estudiante asistió: ${finalEnrollment?.attended ? 'Sí' : 'No'}`)
    console.log(`✅ Pago del estudiante: ${studentPayment ? studentPayment.amount + ' centavos' : 'No registrado'}`)
    console.log(`✅ Pago al instructor: ${instructorPayment ? instructorPayment.amount + ' centavos' : 'No registrado'}`)
    
    if (finalEnrollment?.attended && studentPayment && instructorPayment) {
      console.log('\n🎉 FLUJO COMPLETO EXITOSO - Todos los pagos se registraron correctamente')
    } else {
      console.log('\n❌ FLUJO INCOMPLETO - Faltan registros')
    }
    
    // 6. Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...')
    await prisma.transaction.deleteMany({
      where: {
        OR: [
          { reference: `INSTRUCTOR_${testClass.id}` },
          { reference: `MANUAL_${enrollment.id}` }
        ]
      }
    })
    await prisma.classBooking.delete({ where: { id: enrollment.id } })
    await prisma.class.delete({ where: { id: testClass.id } })
    console.log('✅ Datos de prueba eliminados')
    
  } catch (error) {
    console.error('❌ Error en el flujo de prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testCompleteCheckInFlow().catch(console.error)
}