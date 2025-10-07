import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - Get a specific booking group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const paramData = await params
    const { id: bookingGroupId } = paramData

    const bookingGroup = await prisma.bookingGroup.findUnique({
      where: {
        id: bookingGroupId,
        clubId: session.clubId
      },
      include: {
        bookings: {
          include: {
            court: true
          },
          orderBy: {
            court: {
              name: 'asc'
            }
          }
        },
        splitPayments: {
          orderBy: { createdAt: 'asc' },
          include: {
            _count: {
              select: {
                notifications: true
              }
            }
          }
        },
        payments: true,
        transactions: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            splitPayments: true,
            payments: true,
            bookings: true,
            transactions: true
          }
        }
      }
    })

    if (!bookingGroup) {
      return NextResponse.json(
        { success: false, error: 'Grupo de reservas no encontrado' },
        { status: 404 }
      )
    }

    // Add computed fields
    const splitPaymentProgress = bookingGroup.splitPaymentEnabled 
      ? bookingGroup.splitPayments.filter(sp => sp.status === 'completed').length
      : 0

    const result = {
      ...bookingGroup,
      splitPaymentProgress,
      splitPaymentComplete: bookingGroup.splitPaymentEnabled 
        ? splitPaymentProgress === bookingGroup.splitPaymentCount
        : true,
      courtNames: bookingGroup.bookings.map(b => b.court.name).join(', '),
      totalPaid: bookingGroup.splitPayments
        .filter(sp => sp.status === 'completed')
        .reduce((sum, sp) => sum + sp.amount, 0),
      summary: {
        courts: bookingGroup.bookings.length,
        totalPrice: bookingGroup.totalPrice / 100, // Convert to MXN
        playersExpected: bookingGroup.totalPlayers,
        splitPayments: bookingGroup.splitPaymentEnabled ? bookingGroup.splitPaymentCount : 0,
        completedPayments: splitPaymentProgress
      }
    }

    return NextResponse.json({ 
      success: true, 
      bookingGroup: result 
    })

  } catch (error) {
    console.error('Error fetching booking group:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener grupo de reservas' },
      { status: 500 }
    )
  }
}

// PUT - Update booking group
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const paramData = await params
    const { id: bookingGroupId } = paramData
    const body = await request.json()

    // For now, we'll support basic updates like notes, player info
    const updateData: any = {}

    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    if (body.playerName) {
      updateData.playerName = body.playerName
    }

    if (body.playerEmail !== undefined) {
      updateData.playerEmail = body.playerEmail
    }

    if (body.playerPhone) {
      updateData.playerPhone = body.playerPhone
    }

    if (body.totalPlayers) {
      updateData.totalPlayers = body.totalPlayers
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay datos para actualizar' },
        { status: 400 }
      )
    }

    updateData.updatedAt = new Date()

    const updatedBookingGroup = await prisma.bookingGroup.update({
      where: {
        id: bookingGroupId,
        clubId: session.clubId
      },
      data: updateData,
      include: {
        bookings: {
          include: {
            court: true
          }
        },
        splitPayments: true
      }
    })

    return NextResponse.json({
      success: true,
      bookingGroup: updatedBookingGroup,
      message: 'Grupo de reservas actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating booking group:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar grupo de reservas' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel booking group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const paramData = await params
    const { id: bookingGroupId } = paramData

    // Get booking group with related data
    const bookingGroup = await prisma.bookingGroup.findUnique({
      where: {
        id: bookingGroupId,
        clubId: session.clubId
      },
      include: {
        bookings: true,
        splitPayments: {
          where: { status: 'completed' }
        },
        payments: {
          where: { status: 'completed' }
        }
      }
    })

    if (!bookingGroup) {
      return NextResponse.json(
        { success: false, error: 'Grupo de reservas no encontrado' },
        { status: 404 }
      )
    }

    if (bookingGroup.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Este grupo ya está cancelado' },
        { status: 400 }
      )
    }

    if (bookingGroup.status === 'IN_PROGRESS' || bookingGroup.status === 'COMPLETED') {
      return NextResponse.json(
        { 
          success: false, 
          error: `No se puede cancelar un grupo ${
            bookingGroup.status === 'IN_PROGRESS' ? 'en progreso' : 'completado'
          }` 
        },
        { status: 400 }
      )
    }

    // Start database transaction for cancellation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update booking group status
      const cancelledGroup = await tx.bookingGroup.update({
        where: { id: bookingGroupId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          notes: bookingGroup.notes ? 
            `${bookingGroup.notes}\nCancelado desde dashboard administrativo` :
            'Cancelado desde dashboard administrativo'
        }
      })

      // 2. Cancel all individual bookings in the group
      await tx.booking.updateMany({
        where: { bookingGroupId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      })

      // 3. Cancel pending split payments
      if (bookingGroup.splitPaymentEnabled) {
        await tx.splitPayment.updateMany({
          where: {
            bookingGroupId,
            status: 'pending'
          },
          data: {
            status: 'cancelled'
          }
        })
      }

      // 4. Create cancellation notifications for each individual booking
      // Since notifications are linked to individual bookings, we create one for each
      for (const booking of bookingGroup.bookings) {
        await tx.notification.create({
          data: {
            bookingId: booking.id,
            type: 'WHATSAPP',
            template: 'BOOKING_CANCELLED',
            recipient: bookingGroup.playerPhone,
            status: 'pending'
          }
        })
      }

      return cancelledGroup
    })

    console.log(`🗑️ Cancelled booking group: ${bookingGroup.name} (${bookingGroupId})`)

    return NextResponse.json({
      success: true,
      bookingGroup: result,
      message: `Grupo "${bookingGroup.name}" cancelado exitosamente`
    })

  } catch (error) {
    console.error('Error cancelling booking group:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cancelar grupo de reservas' },
      { status: 500 }
    )
  }
}