import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function generateAttendanceReport() {
  console.log('📊 REPORTE DE ASISTENCIA Y ESTADÍSTICAS')
  console.log('=' + '='.repeat(49))
  
  // Get all classes with bookings
  const classes = await prisma.class.findMany({
    where: {
      status: { in: ['IN_PROGRESS', 'COMPLETED'] }
    },
    include: {
      bookings: true,
      instructor: true
    }
  })
  
  for (const cls of classes) {
    const totalStudents = cls.bookings.length
    const attended = cls.bookings.filter(b => b.attended).length
    const absent = cls.bookings.filter(b => b.attendanceStatus === 'ABSENT').length
    const late = cls.bookings.filter(b => b.attendanceStatus === 'LATE').length
    const paid = cls.bookings.filter(b => b.paymentStatus === 'completed').length
    
    const attendanceRate = totalStudents > 0 ? (attended / totalStudents * 100).toFixed(1) : 0
    const paymentRate = totalStudents > 0 ? (paid / totalStudents * 100).toFixed(1) : 0
    const revenue = cls.bookings
      .filter(b => b.paymentStatus === 'completed')
      .reduce((sum, b) => sum + (b.paidAmount || 0), 0)
    
    console.log(`\n📚 ${cls.name}`)
    console.log(`   Instructor: ${cls.instructor?.name}`)
    console.log(`   Fecha: ${cls.date.toLocaleDateString()} | ${cls.startTime} - ${cls.endTime}`)
    console.log(`   Capacidad: ${totalStudents}/${cls.maxStudents} (${(totalStudents/cls.maxStudents*100).toFixed(0)}% ocupación)`)
    console.log(`   Asistencia: ${attended} presente, ${late} tarde, ${absent} ausente`)
    console.log(`   Tasa asistencia: ${attendanceRate}%`)
    console.log(`   Pagos: ${paid}/${totalStudents} completados (${paymentRate}%)`)
    console.log(`   Ingresos: $${(revenue/100).toFixed(2)} MXN`)
  }
  
  // Resumen general
  const allBookings = await prisma.classBooking.findMany()
  const totalRevenue = allBookings
    .filter(b => b.paymentStatus === 'completed')
    .reduce((sum, b) => sum + (b.paidAmount || 0), 0)
  
  const totalAttended = allBookings.filter(b => b.attended).length
  const overallAttendanceRate = allBookings.length > 0 
    ? (totalAttended / allBookings.length * 100).toFixed(1) 
    : 0
  
  console.log('\n' + '='.repeat(50))
  console.log('📈 RESUMEN GENERAL')
  console.log(`   Total estudiantes inscritos: ${allBookings.length}`)
  console.log(`   Tasa de asistencia global: ${overallAttendanceRate}%`)
  console.log(`   Ingresos totales: $${(totalRevenue/100).toFixed(2)} MXN`)
  
  // Top estudiantes
  const studentStats = allBookings.reduce((acc, b) => {
    if (!acc[b.studentName]) {
      acc[b.studentName] = { classes: 0, attended: 0, paid: 0 }
    }
    acc[b.studentName].classes++
    if (b.attended) acc[b.studentName].attended++
    if (b.paymentStatus === 'completed') acc[b.studentName].paid += b.paidAmount || 0
    return acc
  }, {} as Record<string, any>)
  
  console.log('\n🏆 TOP 3 ESTUDIANTES MÁS ACTIVOS:')
  Object.entries(studentStats)
    .sort((a, b) => b[1].classes - a[1].classes)
    .slice(0, 3)
    .forEach(([name, stats], i) => {
      console.log(`   ${i+1}. ${name}: ${stats.classes} clases, ${stats.attended} asistencias, $${(stats.paid/100).toFixed(2)} MXN pagado`)
    })
}

generateAttendanceReport()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
