#!/usr/bin/env npx tsx

import { prisma } from '../lib/config/prisma'

async function fixInstructorPayment() {
  console.log('🔧 REGISTRANDO PAGO FALTANTE AL INSTRUCTOR')
  console.log('=========================================\n')
  
  // Obtener la clase de prueba
  const testClass = await prisma.class.findFirst({
    include: {
      Instructor: true,
      ClassBooking: true
    },
    where: {
      Instructor: {
        paymentType: 'HOURLY'
      }
    }
  })
  
  if (!testClass) {
    console.log('❌ No se encontró clase de prueba')
    return
  }
  
  console.log(`📚 Clase: ${testClass.name}`)
  console.log(`👨‍🏫 Instructor: ${testClass.Instructor?.name} (Tipo: ${testClass.Instructor?.paymentType})`)
  console.log(`💰 Tarifa por hora: ${testClass.Instructor?.hourlyRate} centavos`)
  
  // Verificar si ya existe transacción de instructor
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      reference: `INSTRUCTOR_${testClass.id}`
    }
  })
  
  if (existingTransaction) {
    console.log('✅ Ya existe pago al instructor, no se duplicará')
    console.log(`   Transacción: ${existingTransaction.description} - ${existingTransaction.amount} centavos`)
    return
  }
  
  // Verificar si hay estudiantes que asistieron
  const attendedStudents = await prisma.classBooking.findMany({
    where: {
      classId: testClass.id,
      attended: true
    }
  })
  
  console.log(`\n👥 Estudiantes que asistieron: ${attendedStudents.length}`)
  
  if (attendedStudents.length === 0) {
    console.log('❌ No hay estudiantes que hayan asistido, no se registra pago al instructor')
    return
  }
  
  // Calcular pago al instructor
  const hours = testClass.duration / 60
  const instructorPayment = Math.round((testClass.Instructor?.hourlyRate || 0) * hours)

  console.log(`\n💵 Calculando pago al instructor:`)
  console.log(`   Duración: ${testClass.duration} minutos = ${hours} horas`)
  console.log(`   Tarifa: ${testClass.Instructor?.hourlyRate} centavos/hora`)
  console.log(`   Pago total: ${instructorPayment} centavos (${instructorPayment/100} MXN)`)
  
  // Registrar pago al instructor
  try {
    const transaction = await prisma.transaction.create({
      data: {
        clubId: testClass.clubId,
        type: 'EXPENSE',
        category: 'SALARY',
        amount: instructorPayment,
        currency: 'MXN',
        description: `Pago a instructor ${testClass.Instructor?.name} - Clase: ${testClass.name}`,
        date: new Date(),
        reference: `INSTRUCTOR_${testClass.id}`,
        notes: JSON.stringify({
          classId: testClass.id,
          instructorId: testClass.instructorId,
          instructorName: testClass.Instructor?.name,
          className: testClass.name,
          hours: hours,
          hourlyRate: testClass.Instructor?.hourlyRate,
          attendanceCount: attendedStudents.length,
          manuallyTriggered: true,
          reason: 'Missing instructor payment for attended class'
        })
      }
    })
    
    console.log(`\n✅ PAGO REGISTRADO EXITOSAMENTE`)
    console.log(`   ID: ${transaction.id}`)
    console.log(`   Referencia: ${transaction.reference}`)
    console.log(`   Monto: ${transaction.amount} centavos`)
    
  } catch (error) {
    console.error('❌ Error al registrar pago:', error)
  }
  
  await prisma.$disconnect()
}

if (require.main === module) {
  fixInstructorPayment().catch(console.error)
}