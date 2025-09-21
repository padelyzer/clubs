import { prisma } from '../lib/config/prisma'
import { nanoid } from 'nanoid'

async function seedPayrollData() {
  console.log('🌱 Seeding payroll data...')

  try {
    // Get the first club (basic5)
    const club = await prisma.club.findFirst({
      where: { id: 'club-basic5-001' }
    })

    if (!club) {
      console.error('❌ Club not found')
      return
    }

    console.log(`📍 Adding payroll data for club: ${club.name}`)

    const currentMonth = new Date()
    const period = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    const lastPeriod = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

    // Define employees
    const employees = [
      // Fixed employees
      { name: 'María González', role: 'Administrador', baseSalary: 1500000, type: 'fixed' },
      { name: 'Juan Pérez', role: 'Recepcionista', baseSalary: 1000000, type: 'fixed' },
      { name: 'Ana Rodríguez', role: 'Mantenimiento', baseSalary: 900000, type: 'fixed' },
      { name: 'Carlos López', role: 'Gerente General', baseSalary: 2500000, type: 'fixed' },
      { name: 'Laura Martínez', role: 'Contador', baseSalary: 1800000, type: 'fixed' },
      
      // Instructors
      { name: 'Pedro Sánchez', role: 'Instructor de Pádel', baseSalary: 50000, type: 'instructor' }, // per class
      { name: 'Sofia Hernández', role: 'Instructora de Tenis', baseSalary: 60000, type: 'instructor' },
      { name: 'Diego Ramírez', role: 'Entrenador Personal', baseSalary: 70000, type: 'instructor' },
      { name: 'Valentina Torres', role: 'Coach de Alto Rendimiento', baseSalary: 80000, type: 'instructor' },
    ]

    // Create payroll records for current month (pending)
    for (const emp of employees) {
      const existing = await prisma.payroll.findFirst({
        where: {
          clubId: club.id,
          employeeName: emp.name,
          period: period
        }
      })

      if (!existing) {
        const netAmount = emp.type === 'fixed' 
          ? emp.baseSalary 
          : emp.baseSalary * (Math.floor(Math.random() * 15) + 10) // 10-25 classes for instructors

        const payrollId = nanoid()
        
        await prisma.payroll.create({
          data: {
            id: payrollId,
            clubId: club.id,
            employeeName: emp.name,
            employeeRole: emp.role,
            period: period,
            baseSalary: emp.baseSalary,
            bonuses: Math.random() > 0.7 ? Math.floor(Math.random() * 200000) : 0,
            deductions: Math.floor(Math.random() * 100000),
            netAmount: netAmount,
            status: 'pending',
            notes: `Nómina del mes ${currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`,
            updatedAt: new Date()
          }
        })

        console.log(`✅ Created payroll for ${emp.name} - ${period}`)
      }
    }

    // Create payroll records for last month (paid)
    for (const emp of employees) {
      const existing = await prisma.payroll.findFirst({
        where: {
          clubId: club.id,
          employeeName: emp.name,
          period: lastPeriod
        }
      })

      if (!existing) {
        const netAmount = emp.type === 'fixed' 
          ? emp.baseSalary 
          : emp.baseSalary * (Math.floor(Math.random() * 15) + 10)

        const payrollId = nanoid()
        const paidDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 28)
        
        await prisma.payroll.create({
          data: {
            id: payrollId,
            clubId: club.id,
            employeeName: emp.name,
            employeeRole: emp.role,
            period: lastPeriod,
            baseSalary: emp.baseSalary,
            bonuses: Math.random() > 0.7 ? Math.floor(Math.random() * 200000) : 0,
            deductions: Math.floor(Math.random() * 100000),
            netAmount: netAmount,
            status: 'paid',
            paidAt: paidDate,
            notes: `Nómina del mes ${lastMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`,
            updatedAt: paidDate
          }
        })

        // Create corresponding transaction for paid payroll
        await prisma.transaction.create({
          data: {
            id: nanoid(),
            clubId: club.id,
            type: 'EXPENSE',
            category: 'SALARY',
            amount: netAmount,
            currency: 'MXN',
            description: `Nómina ${emp.name} - ${lastPeriod}`,
            reference: payrollId,
            date: paidDate,
            createdBy: 'system',
            notes: `Pago de nómina procesado`,
            createdAt: paidDate,
            updatedAt: paidDate
          }
        })

        console.log(`✅ Created paid payroll for ${emp.name} - ${lastPeriod}`)
      }
    }

    console.log('✨ Payroll data seeded successfully!')

  } catch (error) {
    console.error('❌ Error seeding payroll data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPayrollData().catch(console.error)