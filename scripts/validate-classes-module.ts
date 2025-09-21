import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ValidationResult {
  module: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  checks: Array<{
    name: string
    status: 'PASS' | 'FAIL' | 'WARNING'
    message: string
    details?: any
  }>
}

async function validateClassesModule(): Promise<ValidationResult> {
  const result: ValidationResult = {
    module: 'Classes Module',
    status: 'PASS',
    checks: []
  }
  
  console.log('🔍 VALIDACIÓN COMPLETA DEL MÓDULO DE CLASES\n')
  console.log('=' .repeat(60))
  
  // 1. Check database tables exist
  console.log('\n📊 1. VERIFICANDO TABLAS DE BASE DE DATOS...')
  const tables = [
    'Class', 'ClassInstructor', 'ClassBooking', 'ClassHistory',
    'ClassNotification', 'ClassPricing', 'ClassRecurrence',
    // Removed: 'ClassPackage', 'PackagePurchase', 'ClassPackageUsage',
    // Removed: 'ClassMembership', 'MembershipSubscription',
    'StudentProfile', 'StudentProgress', 'StudentAchievement', 
    'ClassWaitlist', 'InstructorPayroll', 'PayrollDetail', 
    'ClassAnalytics', 'StudentRetention'
  ]
  
  for (const table of tables) {
    try {
      const count = await (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)].count()
      result.checks.push({
        name: `Table ${table}`,
        status: 'PASS',
        message: `✅ Tabla existe con ${count} registros`
      })
    } catch (error) {
      result.checks.push({
        name: `Table ${table}`,
        status: 'FAIL',
        message: `❌ Error accediendo tabla`,
        details: error
      })
      result.status = 'FAIL'
    }
  }
  
  // 2. Check relationships
  console.log('\n🔗 2. VERIFICANDO RELACIONES...')
  try {
    // Check instructor -> classes relationship
    const instructorWithClasses = await prisma.classInstructor.findFirst({
      include: { classes: true }
    })
    result.checks.push({
      name: 'Instructor -> Classes',
      status: instructorWithClasses ? 'PASS' : 'WARNING',
      message: instructorWithClasses 
        ? `✅ Relación funciona (${instructorWithClasses.classes.length} clases)`
        : '⚠️ No hay datos para verificar'
    })
    
    // Check class -> bookings relationship
    const classWithBookings = await prisma.class.findFirst({
      include: { bookings: true }
    })
    result.checks.push({
      name: 'Class -> Bookings',
      status: classWithBookings ? 'PASS' : 'WARNING',
      message: classWithBookings
        ? `✅ Relación funciona (${classWithBookings.bookings.length} inscripciones)`
        : '⚠️ No hay datos para verificar'
    })
    
    // Removed package -> purchases relationship check (no packages/memberships)
    
  } catch (error: any) {
    result.checks.push({
      name: 'Relationships',
      status: 'FAIL',
      message: '❌ Error verificando relaciones',
      details: error.message
    })
    result.status = 'FAIL'
  }
  
  // 3. Check data integrity
  console.log('\n✅ 3. VERIFICANDO INTEGRIDAD DE DATOS...')
  try {
    // Check for orphaned bookings
    const orphanedBookings = await prisma.classBooking.findMany({
      where: {
        class: { is: null }
      }
    })
    result.checks.push({
      name: 'Orphaned Bookings',
      status: orphanedBookings.length === 0 ? 'PASS' : 'WARNING',
      message: orphanedBookings.length === 0
        ? '✅ No hay inscripciones huérfanas'
        : `⚠️ ${orphanedBookings.length} inscripciones sin clase`
    })
    
    // Removed package validity check (no packages/memberships)
    
    // Check class capacity
    const overbooked = await prisma.class.findMany({
      where: {
        currentStudents: {
          gt: prisma.class.fields.maxStudents
        }
      }
    })
    result.checks.push({
      name: 'Class Overbooking',
      status: overbooked.length === 0 ? 'PASS' : 'FAIL',
      message: overbooked.length === 0
        ? '✅ No hay clases sobrevendidas'
        : `❌ ${overbooked.length} clases exceden capacidad`
    })
    
  } catch (error: any) {
    result.checks.push({
      name: 'Data Integrity',
      status: 'FAIL',
      message: '❌ Error verificando integridad',
      details: error.message
    })
    result.status = 'FAIL'
  }
  
  // 4. Check business rules
  console.log('\n📋 4. VERIFICANDO REGLAS DE NEGOCIO...')
  try {
    // Check pricing configuration
    const pricing = await prisma.classPricing.findFirst()
    result.checks.push({
      name: 'Pricing Configuration',
      status: pricing ? 'PASS' : 'WARNING',
      message: pricing
        ? '✅ Configuración de precios existe'
        : '⚠️ No hay configuración de precios'
    })
    
    // Check instructor payroll consistency
    const payrolls = await prisma.instructorPayroll.findMany({
      include: { details: true }
    })
    let payrollConsistent = true
    for (const payroll of payrolls) {
      const detailSum = payroll.details.reduce((sum, d) => sum + d.amount, 0)
      if (Math.abs(detailSum - payroll.grossAmount) > 100) { // Allow small rounding differences
        payrollConsistent = false
        break
      }
    }
    result.checks.push({
      name: 'Payroll Consistency',
      status: payrollConsistent ? 'PASS' : 'WARNING',
      message: payrollConsistent
        ? '✅ Liquidaciones consistentes'
        : '⚠️ Inconsistencias en liquidaciones'
    })
    
    // Check waitlist ordering
    const waitlistIssues = await prisma.$queryRaw`
      SELECT "classId", COUNT(*) as duplicates
      FROM "ClassWaitlist"
      GROUP BY "classId", "position"
      HAVING COUNT(*) > 1
    ` as any[]
    result.checks.push({
      name: 'Waitlist Ordering',
      status: waitlistIssues.length === 0 ? 'PASS' : 'FAIL',
      message: waitlistIssues.length === 0
        ? '✅ Lista de espera ordenada correctamente'
        : `❌ ${waitlistIssues.length} clases con posiciones duplicadas`
    })
    
  } catch (error: any) {
    result.checks.push({
      name: 'Business Rules',
      status: 'FAIL',
      message: '❌ Error verificando reglas de negocio',
      details: error.message
    })
    result.status = 'FAIL'
  }
  
  // 5. Test API endpoints
  console.log('\n🌐 5. VERIFICANDO APIs...')
  const baseUrl = 'http://localhost:3000/api'
  const endpoints = [
    { path: '/classes', method: 'GET', name: 'List Classes' },
    { path: '/classes/recurrence', method: 'GET', name: 'Recurrence Info' },
    // Removed: { path: '/classes/packages', method: 'GET', name: 'List Packages' },
    // Removed: { path: '/classes/memberships', method: 'GET', name: 'List Memberships' },
    { path: '/instructors', method: 'GET', name: 'List Instructors' }
  ]
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      })
      result.checks.push({
        name: `API: ${endpoint.name}`,
        status: response.ok ? 'PASS' : 'WARNING',
        message: response.ok
          ? `✅ ${endpoint.method} ${endpoint.path} (${response.status})`
          : `⚠️ ${endpoint.method} ${endpoint.path} (${response.status})`
      })
    } catch (error: any) {
      result.checks.push({
        name: `API: ${endpoint.name}`,
        status: 'WARNING',
        message: `⚠️ No se pudo verificar ${endpoint.path}`,
        details: error.message
      })
    }
  }
  
  // 6. Performance checks
  console.log('\n⚡ 6. VERIFICANDO RENDIMIENTO...')
  const startTime = Date.now()
  try {
    // Test complex query performance
    await prisma.class.findMany({
      include: {
        instructor: true,
        court: true,
        bookings: {
          include: {
            player: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      take: 100
    })
    const queryTime = Date.now() - startTime
    result.checks.push({
      name: 'Query Performance',
      status: queryTime < 1000 ? 'PASS' : 'WARNING',
      message: queryTime < 1000
        ? `✅ Consultas rápidas (${queryTime}ms)`
        : `⚠️ Consultas lentas (${queryTime}ms)`
    })
  } catch (error: any) {
    result.checks.push({
      name: 'Query Performance',
      status: 'FAIL',
      message: '❌ Error en prueba de rendimiento',
      details: error.message
    })
  }
  
  // Calculate final status
  const failCount = result.checks.filter(c => c.status === 'FAIL').length
  const warningCount = result.checks.filter(c => c.status === 'WARNING').length
  
  if (failCount > 0) {
    result.status = 'FAIL'
  } else if (warningCount > 3) {
    result.status = 'WARNING'
  }
  
  return result
}

// Generate validation report
async function generateReport() {
  console.log('\n📝 GENERANDO REPORTE DE VALIDACIÓN...\n')
  
  const result = await validateClassesModule()
  
  console.log('\n' + '=' .repeat(60))
  console.log('📊 REPORTE DE VALIDACIÓN - MÓDULO DE CLASES')
  console.log('=' .repeat(60))
  
  // Summary
  const passCount = result.checks.filter(c => c.status === 'PASS').length
  const failCount = result.checks.filter(c => c.status === 'FAIL').length
  const warningCount = result.checks.filter(c => c.status === 'WARNING').length
  
  console.log('\n📈 RESUMEN:')
  console.log(`   Total de verificaciones: ${result.checks.length}`)
  console.log(`   ✅ Exitosas: ${passCount}`)
  console.log(`   ❌ Fallidas: ${failCount}`)
  console.log(`   ⚠️  Advertencias: ${warningCount}`)
  
  // Status
  console.log('\n🎯 ESTADO GENERAL:')
  if (result.status === 'PASS') {
    console.log('   ✅ MÓDULO VALIDADO CORRECTAMENTE')
  } else if (result.status === 'WARNING') {
    console.log('   ⚠️  MÓDULO FUNCIONAL CON ADVERTENCIAS')
  } else {
    console.log('   ❌ MÓDULO CON ERRORES CRÍTICOS')
  }
  
  // Detailed results
  console.log('\n📋 DETALLE DE VERIFICACIONES:')
  const groupedChecks = {
    database: result.checks.filter(c => c.name.includes('Table') || c.name.includes('Relationship')),
    integrity: result.checks.filter(c => c.name.includes('Orphaned') || c.name.includes('Expiration') || c.name.includes('Overbooking')),
    business: result.checks.filter(c => c.name.includes('Pricing') || c.name.includes('Payroll') || c.name.includes('Waitlist')),
    api: result.checks.filter(c => c.name.includes('API')),
    performance: result.checks.filter(c => c.name.includes('Performance'))
  }
  
  Object.entries(groupedChecks).forEach(([group, checks]) => {
    if (checks.length > 0) {
      console.log(`\n   ${group.toUpperCase()}:`)
      checks.forEach(check => {
        console.log(`   ${check.message}`)
        if (check.details) {
          console.log(`      Detalles: ${JSON.stringify(check.details)}`)
        }
      })
    }
  })
  
  // Recommendations
  console.log('\n💡 RECOMENDACIONES:')
  if (failCount > 0) {
    console.log('   1. Revisar errores críticos antes de usar en producción')
    console.log('   2. Verificar migraciones de base de datos')
    console.log('   3. Asegurar que todas las APIs estén funcionando')
  }
  if (warningCount > 0) {
    console.log('   1. Revisar advertencias para mejorar estabilidad')
    console.log('   2. Considerar agregar más datos de prueba')
    console.log('   3. Optimizar consultas lentas si las hay')
  }
  if (result.status === 'PASS') {
    console.log('   ✨ El módulo está listo para producción')
    console.log('   📚 Considerar agregar más pruebas automatizadas')
    console.log('   📊 Monitorear métricas de uso en producción')
  }
  
  // Statistics
  console.log('\n📊 ESTADÍSTICAS DEL MÓDULO:')
  const stats = await prisma.$transaction([
    prisma.class.count(),
    prisma.classInstructor.count(),
    prisma.classBooking.count(),
    prisma.studentProfile.count(),
    // Removed: prisma.classPackage.count(),
    // Removed: prisma.classMembership.count()
  ])
  
  console.log(`   Clases: ${stats[0]}`)
  console.log(`   Instructores: ${stats[1]}`)
  console.log(`   Inscripciones: ${stats[2]}`)
  console.log(`   Estudiantes: ${stats[3]}`)
  console.log(`   Sistema: Pago directo por clase (sin créditos ni membresías)`)
  
  console.log('\n' + '=' .repeat(60))
  console.log('✅ VALIDACIÓN COMPLETADA')
  console.log('=' .repeat(60))
  
  return result
}

// Run validation
generateReport()
  .then(() => {
    console.log('\n✨ Proceso finalizado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error durante validación:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })