import { prisma } from '../lib/config/prisma'

async function diagnosePayroll() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE NÓMINA\n')
  console.log('=' .repeat(50))
  
  try {
    // 1. Verificar datos en la base de datos
    console.log('\n1️⃣ VERIFICANDO BASE DE DATOS:')
    console.log('-'.repeat(30))
    
    const septemberData = await prisma.payroll.findMany({
      where: { 
        clubId: 'club-basic5-001',
        period: '2025-09'
      }
    })
    
    console.log(`✅ Registros en Sept 2025: ${septemberData.length}`)
    
    if (septemberData.length > 0) {
      console.log('\n📋 Muestra de datos (primeros 3):')
      septemberData.slice(0, 3).forEach((record, i) => {
        console.log(`\n  Registro ${i + 1}:`)
        console.log(`    ID: ${record.id}`)
        console.log(`    Empleado: ${record.employeeName}`)
        console.log(`    Rol: ${record.employeeRole}`)
        console.log(`    Salario Base: ${record.baseSalary} centavos ($${record.baseSalary/100})`)
        console.log(`    Bonos: ${record.bonuses} centavos ($${record.bonuses/100})`)
        console.log(`    Deducciones: ${record.deductions} centavos ($${record.deductions/100})`)
        console.log(`    Monto Neto: ${record.netAmount} centavos ($${record.netAmount/100})`)
        console.log(`    Estado: ${record.status}`)
        console.log(`    Periodo: ${record.period}`)
      })
      
      // Calcular totales
      const totals = septemberData.reduce((acc, record) => {
        acc.baseSalary += record.baseSalary
        acc.bonuses += record.bonuses
        acc.deductions += record.deductions
        acc.netAmount += record.netAmount
        return acc
      }, { baseSalary: 0, bonuses: 0, deductions: 0, netAmount: 0 })
      
      console.log('\n💰 TOTALES PARA SEPTIEMBRE 2025:')
      console.log(`    Total Salarios Base: $${totals.baseSalary/100}`)
      console.log(`    Total Bonos: $${totals.bonuses/100}`)
      console.log(`    Total Deducciones: $${totals.deductions/100}`)
      console.log(`    Total Neto: $${totals.netAmount/100}`)
    }
    
    // 2. Verificar estructura de datos
    console.log('\n2️⃣ ESTRUCTURA DE DATOS:')
    console.log('-'.repeat(30))
    
    // Agrupar por tipo de empleado
    const byRole = septemberData.reduce((acc, record) => {
      const type = record.employeeRole?.toLowerCase().includes('instructor') ? 'Instructor' : 'Fijo'
      if (!acc[type]) acc[type] = []
      acc[type].push(record)
      return acc
    }, {} as Record<string, typeof septemberData>)
    
    Object.entries(byRole).forEach(([type, records]) => {
      console.log(`\n  ${type}: ${records.length} empleados`)
      const total = records.reduce((sum, r) => sum + r.netAmount, 0)
      console.log(`    Total: $${total/100}`)
    })
    
    // 3. Verificar empleados únicos
    console.log('\n3️⃣ EMPLEADOS ÚNICOS:')
    console.log('-'.repeat(30))
    
    const uniqueEmployees = new Set(septemberData.map(r => r.employeeName))
    console.log(`✅ Total de empleados únicos: ${uniqueEmployees.size}`)
    console.log('\n  Lista de empleados:')
    Array.from(uniqueEmployees).forEach((name, i) => {
      const records = septemberData.filter(r => r.employeeName === name)
      console.log(`    ${i + 1}. ${name} - ${records.length} registro(s)`)
    })
    
    // 4. Verificar todos los periodos
    console.log('\n4️⃣ TODOS LOS PERIODOS DISPONIBLES:')
    console.log('-'.repeat(30))
    
    const allPeriods = await prisma.payroll.findMany({
      where: { clubId: 'club-basic5-001' },
      select: { period: true },
      distinct: ['period'],
      orderBy: { period: 'desc' }
    })
    
    console.log('Periodos encontrados:')
    allPeriods.forEach(p => {
      console.log(`  - ${p.period}`)
    })
    
    // 5. Simular llamada al API
    console.log('\n5️⃣ SIMULACIÓN DE RESPUESTA API:')
    console.log('-'.repeat(30))
    
    const apiResponse = {
      success: true,
      payroll: septemberData,
      summary: {
        totalRecords: septemberData.length,
        totalBaseSalary: septemberData.reduce((sum, r) => sum + r.baseSalary, 0),
        totalBonuses: septemberData.reduce((sum, r) => sum + r.bonuses, 0),
        totalDeductions: septemberData.reduce((sum, r) => sum + r.deductions, 0),
        totalNetAmount: septemberData.reduce((sum, r) => sum + r.netAmount, 0)
      }
    }
    
    console.log('Estructura de respuesta API:')
    console.log(JSON.stringify({
      success: apiResponse.success,
      payroll: `Array con ${apiResponse.payroll.length} registros`,
      summary: apiResponse.summary
    }, null, 2))
    
    console.log('\n✅ DIAGNÓSTICO COMPLETADO')
    console.log('=' .repeat(50))
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnosePayroll().catch(console.error)