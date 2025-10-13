#!/usr/bin/env npx tsx

import { prisma } from '../lib/config/prisma'

async function testInstructorPayment() {
  console.log('🧪 PROBANDO FLUJO DE PAGO A INSTRUCTOR')
  console.log('=====================================\n')
  
  // Encontrar una clase con instructor que cobra por hora
  const classes = await prisma.class.findMany({
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
  
  if (classes.length === 0) {
    console.log('❌ No hay clases con instructores que cobren por hora')
    return
  }
  
  const testClass = classes[0]
  console.log(`📚 Clase de prueba: ${testClass.name}`)
  console.log(`👨‍🏫 Instructor: ${testClass.Instructor?.name}`)
  console.log(`💰 Tarifa por hora: ${testClass.Instructor?.hourlyRate} centavos`)
  console.log(`⏱️ Duración: ${testClass.duration} minutos`)

  const hours = testClass.duration / 60
  const expectedPayment = Math.round((testClass.Instructor?.hourlyRate || 0) * hours)
  console.log(`💵 Pago esperado: ${expectedPayment} centavos (${expectedPayment/100} MXN)`)
  
  // Verificar transacciones existentes para esta clase
  const existingTransactions = await prisma.transaction.findMany({
    where: {
      reference: `INSTRUCTOR_${testClass.id}`
    }
  })
  
  console.log(`\n💸 Transacciones existentes de instructor:`)
  if (existingTransactions.length === 0) {
    console.log('  ✅ No hay pagos duplicados')
  } else {
    existingTransactions.forEach((tx, i) => {
      console.log(`  ${i + 1}. ${tx.description} - ${tx.amount} centavos (${tx.date.toISOString()})`)
    })
  }
  
  // Verificar inscripciones y asistencias
  const enrollments = await prisma.classBooking.findMany({
    where: { classId: testClass.id }
  })
  
  console.log(`\n👥 Inscripciones en la clase:`)
  enrollments.forEach((enrollment, i) => {
    const attendanceStatus = enrollment.attended ? '✅ Asistió' : '❌ No asistió'
    console.log(`  ${i + 1}. ${enrollment.studentName} - ${attendanceStatus}`)
  })
  
  const attendedCount = enrollments.filter(e => e.attended).length
  console.log(`\n📊 Resumen: ${attendedCount} de ${enrollments.length} estudiantes asistieron`)
  
  if (attendedCount > 0 && existingTransactions.length === 0) {
    console.log('⚠️  ADVERTENCIA: Hay estudiantes que asistieron pero no se registró pago al instructor')
  } else if (attendedCount > 0 && existingTransactions.length === 1) {
    console.log('✅ CORRECTO: Se registró exactamente un pago al instructor')
  } else if (existingTransactions.length > 1) {
    console.log('❌ PROBLEMA: Hay múltiples pagos registrados al instructor (duplicación)')
  }
  
  await prisma.$disconnect()
}

if (require.main === module) {
  testInstructorPayment().catch(console.error)
}