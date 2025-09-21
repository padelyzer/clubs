import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schemas
const createPayrollSchema = z.object({
  employeeName: z.string().min(1).max(100),
  employeeRole: z.string().min(1).max(100),
  period: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM format
  baseSalary: z.number().min(0),
  bonuses: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  notes: z.string().optional()
})

const updatePayrollSchema = z.object({
  status: z.enum(['pending', 'paid', 'cancelled']),
  paidAt: z.string().optional(),
  notes: z.string().optional()
})

// GET - Retrieve payroll records
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    
    const period = searchParams.get('period')
    const status = searchParams.get('status')
    const employeeName = searchParams.get('employee')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      clubId: session.clubId
    }

    // Period filter
    if (period) {
      where.period = period
    }

    // Status filter
    if (status) {
      where.status = status
    }

    // Employee filter
    if (employeeName) {
      where.employeeName = {
        contains: employeeName,
        mode: 'insensitive'
      }
    }

    // Get payroll records
    const [payrollRecords, total, summary] = await Promise.all([
      prisma.payroll.findMany({
        where,
        orderBy: [
          { period: 'desc' },
          { employeeName: 'asc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.payroll.count({ where }),
      // Get summary for current query
      prisma.payroll.aggregate({
        where,
        _sum: {
          baseSalary: true,
          bonuses: true,
          deductions: true,
          netAmount: true
        },
        _count: true
      })
    ])

    return NextResponse.json({
      success: true,
      payroll: payrollRecords,
      summary: {
        totalRecords: summary._count,
        totalBaseSalary: summary._sum.baseSalary || 0,
        totalBonuses: summary._sum.bonuses || 0,
        totalDeductions: summary._sum.deductions || 0,
        totalNetAmount: summary._sum.netAmount || 0
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Error fetching payroll:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener nómina' },
      { status: 500 }
    )
  }
}

// POST - Create new payroll record
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    
    const validatedData = createPayrollSchema.parse(body)
    
    // Calculate net amount
    const netAmount = validatedData.baseSalary + validatedData.bonuses - validatedData.deductions
    
    // Check if payroll already exists for this employee and period
    const existing = await prisma.payroll.findFirst({
      where: {
        clubId: session.clubId,
        employeeName: validatedData.employeeName,
        period: validatedData.period
      }
    })

    if (existing) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Ya existe un registro de nómina para ${validatedData.employeeName} en el periodo ${validatedData.period}` 
        },
        { status: 409 }
      )
    }

    // Create payroll record
    const payroll = await prisma.payroll.create({
      data: {
        id: nanoid(),
        clubId: session.clubId,
        employeeName: validatedData.employeeName,
        employeeRole: validatedData.employeeRole,
        period: validatedData.period,
        baseSalary: validatedData.baseSalary,
        bonuses: validatedData.bonuses,
        deductions: validatedData.deductions,
        netAmount,
        status: 'pending',
        notes: validatedData.notes,
        updatedAt: new Date()
      }
    })

    // Create expense transaction for payroll
    await prisma.transaction.create({
      data: {
        id: nanoid(),
        clubId: session.clubId,
        type: 'EXPENSE',
        category: 'SALARY',
        amount: netAmount,
        currency: 'MXN',
        description: `Nómina ${validatedData.employeeName} - ${validatedData.period}`,
        reference: payroll.id,
        date: new Date(),
        createdBy: session.userId,
        notes: `Salario base: $${(validatedData.baseSalary / 100).toFixed(2)}, Bonos: $${(validatedData.bonuses / 100).toFixed(2)}, Deducciones: $${(validatedData.deductions / 100).toFixed(2)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      payroll,
      message: 'Registro de nómina creado exitosamente' 
    })

  } catch (error) {
    console.error('Error creating payroll:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear registro de nómina' },
      { status: 500 }
    )
  }
}

// PUT - Update payroll status
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de nómina requerido' },
        { status: 400 }
      )
    }

    const validatedData = updatePayrollSchema.parse(updateData)
    
    // Check if payroll exists and belongs to club
    const existingPayroll = await prisma.payroll.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!existingPayroll) {
      return NextResponse.json(
        { success: false, error: 'Registro de nómina no encontrado' },
        { status: 404 }
      )
    }

    // Update payroll
    const updatedPayroll = await prisma.payroll.update({
      where: { id },
      data: {
        status: validatedData.status,
        paidAt: validatedData.status === 'paid' && validatedData.paidAt 
          ? new Date(validatedData.paidAt) 
          : validatedData.status === 'paid' 
            ? new Date() 
            : null,
        notes: validatedData.notes || existingPayroll.notes
      }
    })

    return NextResponse.json({
      success: true,
      payroll: updatedPayroll,
      message: 'Registro de nómina actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating payroll:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar registro de nómina' },
      { status: 500 }
    )
  }
}

// DELETE - Delete payroll record
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de nómina requerido' },
        { status: 400 }
      )
    }

    // Check if payroll exists and belongs to club
    const payroll = await prisma.payroll.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!payroll) {
      return NextResponse.json(
        { success: false, error: 'Registro de nómina no encontrado' },
        { status: 404 }
      )
    }

    // Don't delete if already paid
    if (payroll.status === 'paid') {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar un registro de nómina pagado' },
        { status: 400 }
      )
    }

    // Delete payroll and related transaction
    await Promise.all([
      prisma.payroll.delete({ where: { id } }),
      prisma.transaction.deleteMany({
        where: {
          reference: id,
          category: 'SALARY'
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Registro de nómina eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting payroll:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar registro de nómina' },
      { status: 500 }
    )
  }
}