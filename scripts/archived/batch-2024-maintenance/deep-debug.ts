#!/usr/bin/env tsx

/**
 * Deep Debug Script for Padelyzer System
 * Comprehensive analysis of all system components
 */

import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface DebugReport {
  timestamp: Date
  sections: {
    database: any
    authentication: any
    bookings: any
    classes: any
    payments: any
    notifications: any
    errors: any
    recommendations: string[]
  }
}

async function runDeepDebug() {
  console.log('🔍 INICIANDO DEBUG PROFUNDO DEL SISTEMA PADELYZER')
  console.log('='.repeat(60))
  console.log('')

  const report: DebugReport = {
    timestamp: new Date(),
    sections: {
      database: {},
      authentication: {},
      bookings: {},
      classes: {},
      payments: {},
      notifications: {},
      errors: [],
      recommendations: []
    }
  }

  // 1. DATABASE HEALTH CHECK
  console.log('1️⃣ VERIFICANDO SALUD DE LA BASE DE DATOS...')
  try {
    await prisma.$queryRaw`SELECT 1`
    report.sections.database.status = '✅ Conectado'
    
    // Count all tables
    const counts = {
      users: await prisma.user.count(),
      clubs: await prisma.club.count(),
      courts: await prisma.court.count(),
      bookings: await prisma.booking.count(),
      bookingGroups: await prisma.bookingGroup.count(),
      classes: await prisma.class.count(),
      classBookings: await prisma.classBooking.count(),
      classInstructors: await prisma.classInstructor.count(),
      players: await prisma.player.count(),
      transactions: await prisma.transaction.count(),
      payments: await prisma.payment.count(),
      splitPayments: await prisma.splitPayment.count(),
      notifications: await prisma.notification.count()
    }
    
    report.sections.database.tableCounts = counts
    console.log('  📊 Registros totales:')
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`     ${table}: ${count}`)
    })
    
  } catch (error) {
    report.sections.database.status = '❌ Error de conexión'
    report.sections.database.error = error
    console.error('  ❌ Error conectando a la base de datos:', error)
  }

  // 2. AUTHENTICATION FLOW
  console.log('\n2️⃣ ANALIZANDO FLUJO DE AUTENTICACIÓN...')
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            sessions: true,
            accounts: true
          }
        }
      }
    })
    
    report.sections.authentication = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.active).length,
      usersWithSessions: users.filter(u => u._count.sessions > 0).length,
      usersByRole: {}
    }
    
    // Count by role
    const roleCount: Record<string, number> = {}
    users.forEach(u => {
      roleCount[u.role] = (roleCount[u.role] || 0) + 1
    })
    report.sections.authentication.usersByRole = roleCount
    
    console.log('  👥 Usuarios:', users.length)
    console.log('  🔑 Por rol:', roleCount)
    
    // Check for orphaned sessions
    const orphanedSessions = await prisma.session.findMany({
      where: {
        expires: { lt: new Date() }
      }
    })
    
    if (orphanedSessions.length > 0) {
      console.log(`  ⚠️ Sesiones expiradas sin limpiar: ${orphanedSessions.length}`)
      report.sections.errors.push({
        type: 'AUTH',
        message: `${orphanedSessions.length} sesiones expiradas encontradas`,
        severity: 'WARNING'
      })
    }
    
  } catch (error) {
    console.error('  ❌ Error en análisis de autenticación:', error)
    report.sections.authentication.error = error
  }

  // 3. BOOKINGS & RESERVATIONS
  console.log('\n3️⃣ ANALIZANDO SISTEMA DE RESERVAS...')
  try {
    // Regular bookings analysis
    const bookings = await prisma.booking.findMany({
      include: {
        Court: true,
        SplitPayment: true
      }
    })
    
    const bookingStats = {
      total: bookings.length,
      byStatus: {} as Record<string, number>,
      byPaymentStatus: {} as Record<string, number>,
      withSplitPayments: bookings.filter(b => b.SplitPayment.length > 0).length,
      checkedIn: bookings.filter(b => b.checkedIn).length
    }
    
    bookings.forEach(b => {
      bookingStats.byStatus[b.status] = (bookingStats.byStatus[b.status] || 0) + 1
      bookingStats.byPaymentStatus[b.paymentStatus] = (bookingStats.byPaymentStatus[b.paymentStatus] || 0) + 1
    })
    
    report.sections.bookings = bookingStats
    console.log('  📅 Reservas regulares:', bookingStats.total)
    console.log('  💳 Por estado de pago:', bookingStats.byPaymentStatus)
    
    // Check for inconsistencies
    const inconsistentBookings = bookings.filter(b => 
      b.checkedIn && b.paymentStatus === 'pending'
    )
    
    if (inconsistentBookings.length > 0) {
      console.log(`  ⚠️ Reservas con check-in pero pago pendiente: ${inconsistentBookings.length}`)
      report.sections.errors.push({
        type: 'BOOKING',
        message: `${inconsistentBookings.length} reservas con check-in pero sin pago`,
        severity: 'WARNING',
        details: inconsistentBookings.map(b => b.id)
      })
    }
    
  } catch (error) {
    console.error('  ❌ Error en análisis de reservas:', error)
    report.sections.bookings.error = error
  }

  // 4. CLASSES & ENROLLMENTS
  console.log('\n4️⃣ ANALIZANDO SISTEMA DE CLASES...')
  try {
    const classes = await prisma.class.findMany({
      include: {
        bookings: true,
        instructor: true,
        court: true
      }
    })
    
    const classStats = {
      total: classes.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      totalEnrollments: 0,
      averageEnrollments: 0,
      withNoEnrollments: 0,
      overCapacity: 0
    }
    
    classes.forEach(c => {
      classStats.byStatus[c.status] = (classStats.byStatus[c.status] || 0) + 1
      classStats.byType[c.type] = (classStats.byType[c.type] || 0) + 1
      classStats.totalEnrollments += c.bookings.length
      
      if (c.bookings.length === 0) classStats.withNoEnrollments++
      if (c.currentStudents > c.maxStudents) classStats.overCapacity++
    })
    
    classStats.averageEnrollments = classStats.total > 0 
      ? Math.round(classStats.totalEnrollments / classStats.total * 10) / 10 
      : 0
    
    report.sections.classes = classStats
    console.log('  🎓 Clases totales:', classStats.total)
    console.log('  👥 Inscripciones totales:', classStats.totalEnrollments)
    console.log('  📊 Promedio de inscripciones:', classStats.averageEnrollments)
    
    // Check for data inconsistencies
    const inconsistentClasses = classes.filter(c => 
      c.currentStudents !== c.bookings.length
    )
    
    if (inconsistentClasses.length > 0) {
      console.log(`  ⚠️ Clases con contador inconsistente: ${inconsistentClasses.length}`)
      report.sections.errors.push({
        type: 'CLASS',
        message: `${inconsistentClasses.length} clases con contador de estudiantes incorrecto`,
        severity: 'ERROR',
        details: inconsistentClasses.map(c => ({
          id: c.id,
          name: c.name,
          currentStudents: c.currentStudents,
          actualBookings: c.bookings.length
        }))
      })
    }
    
    // Check ClassBookings
    const classBookings = await prisma.classBooking.findMany({
      where: {
        attended: true,
        paymentStatus: 'pending'
      }
    })
    
    if (classBookings.length > 0) {
      console.log(`  ⚠️ Estudiantes con asistencia pero sin pago: ${classBookings.length}`)
      report.sections.errors.push({
        type: 'CLASS_BOOKING',
        message: `${classBookings.length} estudiantes asistieron pero no pagaron`,
        severity: 'WARNING'
      })
    }
    
  } catch (error) {
    console.error('  ❌ Error en análisis de clases:', error)
    report.sections.classes.error = error
  }

  // 5. PAYMENT SYSTEM
  console.log('\n5️⃣ ANALIZANDO SISTEMA DE PAGOS...')
  try {
    const transactions = await prisma.transaction.findMany()
    const payments = await prisma.payment.findMany()
    const splitPayments = await prisma.splitPayment.findMany()
    
    const paymentStats = {
      transactions: {
        total: transactions.length,
        income: transactions.filter(t => t.type === 'INCOME').length,
        expense: transactions.filter(t => t.type === 'EXPENSE').length,
        totalIncome: transactions
          .filter(t => t.type === 'INCOME')
          .reduce((sum, t) => sum + t.amount, 0),
        totalExpense: transactions
          .filter(t => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + t.amount, 0)
      },
      payments: {
        total: payments.length,
        completed: payments.filter(p => p.status === 'completed').length,
        pending: payments.filter(p => p.status === 'pending').length,
        failed: payments.filter(p => p.status === 'failed').length
      },
      splitPayments: {
        total: splitPayments.length,
        completed: splitPayments.filter(p => p.status === 'completed').length,
        pending: splitPayments.filter(p => p.status === 'pending').length
      }
    }
    
    report.sections.payments = paymentStats
    console.log('  💰 Transacciones:', paymentStats.transactions.total)
    console.log('  💵 Ingresos totales: $', paymentStats.transactions.totalIncome / 100, 'MXN')
    console.log('  💸 Gastos totales: $', paymentStats.transactions.totalExpense / 100, 'MXN')
    console.log('  💳 Pagos pendientes:', paymentStats.payments.pending)
    console.log('  🔄 Pagos divididos pendientes:', paymentStats.splitPayments.pending)
    
    // Check orphaned payments
    const orphanedPayments = await prisma.payment.findMany({
      where: {
        AND: [
          { bookingId: null },
          { bookingGroupId: null }
        ]
      }
    })
    
    if (orphanedPayments.length > 0) {
      console.log(`  ⚠️ Pagos sin reserva asociada: ${orphanedPayments.length}`)
      report.sections.errors.push({
        type: 'PAYMENT',
        message: `${orphanedPayments.length} pagos huérfanos encontrados`,
        severity: 'ERROR'
      })
    }
    
  } catch (error) {
    console.error('  ❌ Error en análisis de pagos:', error)
    report.sections.payments.error = error
  }

  // 6. NOTIFICATION SYSTEM
  console.log('\n6️⃣ ANALIZANDO SISTEMA DE NOTIFICACIONES...')
  try {
    const notifications = await prisma.notification.findMany()
    
    const notificationStats = {
      total: notifications.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      pending: notifications.filter(n => n.status === 'pending').length,
      failed: notifications.filter(n => n.status === 'failed').length,
      sent: notifications.filter(n => n.status === 'sent').length
    }
    
    notifications.forEach(n => {
      notificationStats.byStatus[n.status] = (notificationStats.byStatus[n.status] || 0) + 1
      notificationStats.byType[n.type] = (notificationStats.byType[n.type] || 0) + 1
    })
    
    report.sections.notifications = notificationStats
    console.log('  📬 Notificaciones totales:', notificationStats.total)
    console.log('  ⏳ Pendientes de envío:', notificationStats.pending)
    console.log('  ❌ Fallidas:', notificationStats.failed)
    
    // Check old pending notifications
    const oldPendingNotifications = await prisma.notification.findMany({
      where: {
        status: 'pending',
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Older than 24 hours
        }
      }
    })
    
    if (oldPendingNotifications.length > 0) {
      console.log(`  ⚠️ Notificaciones pendientes > 24h: ${oldPendingNotifications.length}`)
      report.sections.errors.push({
        type: 'NOTIFICATION',
        message: `${oldPendingNotifications.length} notificaciones pendientes por más de 24 horas`,
        severity: 'WARNING'
      })
    }
    
  } catch (error) {
    console.error('  ❌ Error en análisis de notificaciones:', error)
    report.sections.notifications.error = error
  }

  // 7. DATA INTEGRITY CHECKS
  console.log('\n7️⃣ VERIFICANDO INTEGRIDAD DE DATOS...')
  
  // Check for clubs without settings
  const clubsWithoutSettings = await prisma.club.findMany({
    where: {
      settings: {
        is: null
      }
    }
  })
  
  if (clubsWithoutSettings.length > 0) {
    console.log(`  ⚠️ Clubes sin configuración: ${clubsWithoutSettings.length}`)
    report.sections.errors.push({
      type: 'DATA_INTEGRITY',
      message: `${clubsWithoutSettings.length} clubes sin configuración`,
      severity: 'ERROR'
    })
  }
  
  // Check for bookings in the past without check-in
  const pastBookingsNoCheckIn = await prisma.booking.findMany({
    where: {
      date: { lt: new Date() },
      checkedIn: false,
      status: { not: 'CANCELLED' }
    }
  })
  
  if (pastBookingsNoCheckIn.length > 0) {
    console.log(`  ⚠️ Reservas pasadas sin check-in: ${pastBookingsNoCheckIn.length}`)
    report.sections.errors.push({
      type: 'DATA_INTEGRITY',
      message: `${pastBookingsNoCheckIn.length} reservas pasadas sin check-in`,
      severity: 'INFO'
    })
  }

  // 8. GENERATE RECOMMENDATIONS
  console.log('\n8️⃣ GENERANDO RECOMENDACIONES...')
  
  if (report.sections.errors.length > 0) {
    // Group errors by type
    const errorsByType: Record<string, number> = {}
    report.sections.errors.forEach(e => {
      errorsByType[e.type] = (errorsByType[e.type] || 0) + 1
    })
    
    // Generate recommendations based on errors
    if (errorsByType['AUTH'] > 0) {
      report.sections.recommendations.push(
        '🔧 Implementar limpieza automática de sesiones expiradas'
      )
    }
    
    if (errorsByType['BOOKING'] > 0 || errorsByType['CLASS_BOOKING'] > 0) {
      report.sections.recommendations.push(
        '💳 Revisar el flujo de pagos y check-in para evitar inconsistencias',
        '📊 Implementar validación de pago antes de permitir check-in'
      )
    }
    
    if (errorsByType['CLASS'] > 0) {
      report.sections.recommendations.push(
        '🔄 Sincronizar contadores de estudiantes con inscripciones reales',
        '📝 Implementar trigger para actualizar currentStudents automáticamente'
      )
    }
    
    if (errorsByType['PAYMENT'] > 0) {
      report.sections.recommendations.push(
        '🧹 Limpiar pagos huérfanos o asociarlos correctamente',
        '🔗 Implementar restricciones de foreign key más estrictas'
      )
    }
    
    if (errorsByType['NOTIFICATION'] > 0) {
      report.sections.recommendations.push(
        '📮 Implementar job de reintento para notificaciones fallidas',
        '⏰ Configurar timeout para notificaciones pendientes'
      )
    }
    
    if (errorsByType['DATA_INTEGRITY'] > 0) {
      report.sections.recommendations.push(
        '🔍 Ejecutar script de migración para corregir datos inconsistentes',
        '✅ Implementar validaciones a nivel de base de datos'
      )
    }
  } else {
    report.sections.recommendations.push(
      '✨ El sistema está funcionando correctamente sin errores críticos'
    )
  }

  // 9. SUMMARY
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DEL DEBUG')
  console.log('='.repeat(60))
  
  const errorCount = report.sections.errors.length
  const criticalErrors = report.sections.errors.filter(e => e.severity === 'ERROR').length
  const warnings = report.sections.errors.filter(e => e.severity === 'WARNING').length
  const info = report.sections.errors.filter(e => e.severity === 'INFO').length
  
  console.log(`\n🔍 Problemas encontrados: ${errorCount}`)
  console.log(`  🔴 Errores críticos: ${criticalErrors}`)
  console.log(`  🟡 Advertencias: ${warnings}`)
  console.log(`  🔵 Información: ${info}`)
  
  console.log('\n💡 RECOMENDACIONES:')
  report.sections.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`)
  })
  
  // Save report to file
  const reportPath = path.join(process.cwd(), `debug-report-${Date.now()}.json`)
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Reporte completo guardado en: ${reportPath}`)
  
  return report
}

// Execute debug
runDeepDebug()
  .then(() => {
    console.log('\n✅ Debug completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error durante el debug:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })