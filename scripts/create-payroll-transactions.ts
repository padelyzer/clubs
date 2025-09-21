import { prisma } from '../lib/config/prisma'
import { nanoid } from 'nanoid'

async function createPayrollTransactions() {
  console.log('📋 Creando transacciones de gastos para la nómina de Septiembre 2025...')

  try {
    // Obtener todos los registros de nómina de Sept 2025
    const payrollRecords = await prisma.payroll.findMany({
      where: {
        clubId: 'club-basic5-001',
        period: '2025-09'
      }
    })

    console.log(`✅ Encontrados ${payrollRecords.length} registros de nómina`)

    // Crear una transacción de gasto por cada registro de nómina
    const transactions = []
    for (const record of payrollRecords) {
      const transaction = {
        id: nanoid(),
        clubId: 'club-basic5-001',
        type: 'EXPENSE' as const,
        category: 'SALARY' as const,
        amount: record.netAmount,
        currency: 'MXN',
        description: `Nómina ${record.employeeName} - ${record.period}`,
        reference: `PAYROLL-${record.id}`,
        date: new Date('2025-09-30'), // Último día del mes
        createdBy: 'system',
        notes: `Pago de nómina: ${record.employeeRole}. Salario base: $${(record.baseSalary / 100).toFixed(2)}, Bonos: $${(record.bonuses / 100).toFixed(2)}, Deducciones: $${(record.deductions / 100).toFixed(2)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      transactions.push(transaction)
    }

    // Insertar todas las transacciones
    const result = await prisma.transaction.createMany({
      data: transactions,
      skipDuplicates: true
    })

    console.log(`✅ Creadas ${result.count} transacciones de nómina`)

    // Calcular el total
    const total = transactions.reduce((sum, t) => sum + t.amount, 0)
    console.log(`💰 Total en gastos de nómina: $${(total / 100).toFixed(2)}`)

    // Verificar el nuevo total de gastos
    const totalExpenses = await prisma.transaction.aggregate({
      where: {
        clubId: 'club-basic5-001',
        type: 'EXPENSE',
        date: {
          gte: new Date('2025-09-01'),
          lt: new Date('2025-10-01')
        }
      },
      _sum: {
        amount: true
      }
    })

    console.log(`\n📊 RESUMEN DE GASTOS SEPT 2025:`)
    console.log(`   Total gastos (incluyendo nómina): $${((totalExpenses._sum.amount || 0) / 100).toFixed(2)}`)

    // Mostrar desglose por categoría
    const breakdown = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        clubId: 'club-basic5-001',
        type: 'EXPENSE',
        date: {
          gte: new Date('2025-09-01'),
          lt: new Date('2025-10-01')
        }
      },
      _sum: {
        amount: true
      },
      _count: true
    })

    console.log('\n📈 Desglose por categoría:')
    breakdown.forEach(cat => {
      console.log(`   - ${cat.category}: $${((cat._sum.amount || 0) / 100).toFixed(2)} (${cat._count} transacciones)`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createPayrollTransactions()