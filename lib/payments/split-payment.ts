import { prisma } from '@/lib/config/prisma'
import { generatePaymentLink } from './payment-links'
import { sendWhatsAppNotification } from './notifications'
import { onPaymentCompleted } from '@/lib/whatsapp/notification-hooks'
import { WhatsAppService } from '@/lib/services/whatsapp-service'
import { nanoid } from 'nanoid'

interface SplitPaymentData {
  bookingId: string
  playerName: string
  playerEmail?: string
  playerPhone: string
  amount: number
}

export async function createSplitPayments(
  bookingId: string,
  splitCount: number,
  totalAmount: number,
  playerInfo: {
    name: string
    email?: string
    phone: string
  },
  playersPerCourt?: number,
  bookingGroupId?: string
) {
  const splitAmount = Math.ceil(totalAmount / splitCount)
  const splitPayments = []

  // Create split payment records
  for (let i = 0; i < splitCount; i++) {
    const splitPayment = await prisma.splitPayment.create({
      data: {
        ...(bookingGroupId ? { bookingGroupId } : { bookingId }),
        playerName: i === 0 ? playerInfo.name : `Jugador ${i + 1}`,
        playerEmail: i === 0 ? playerInfo.email : '',
        playerPhone: i === 0 ? playerInfo.phone : '',
        amount: splitAmount,
        status: 'pending'
      }
    })

    splitPayments.push(splitPayment)
  }

  return splitPayments
}

export async function generateSplitPaymentLinks(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      court: true,
      club: true,
      splitPayments: {
        where: { status: 'pending' }
      }
    }
  })

  if (!booking) {
    throw new Error('Reserva no encontrada')
  }

  if (!booking.splitPaymentEnabled) {
    throw new Error('Esta reserva no tiene pagos divididos habilitados')
  }

  const paymentLinks = []

  // Generate payment links for each pending split payment
  for (const splitPayment of booking.splitPayments) {
    try {
      // Generate unique payment link for this split payment
      const paymentLink = await generatePaymentLink({
        splitPaymentId: splitPayment.id,
        amount: splitPayment.amount,
        description: `Pago para reserva en ${booking.court.name} - ${booking.club.name}`,
        playerName: splitPayment.playerName,
        playerEmail: splitPayment.playerEmail,
        playerPhone: splitPayment.playerPhone,
        bookingId: booking.id
      })

      paymentLinks.push({
        splitPaymentId: splitPayment.id,
        playerName: splitPayment.playerName,
        playerPhone: splitPayment.playerPhone,
        amount: splitPayment.amount,
        paymentLink
      })

      // Send WhatsApp notification if phone number is provided
      if (splitPayment.playerPhone) {
        // Use new WhatsApp service instead of old notification system
        try {
          await WhatsAppService.sendPaymentPendingNotifications(booking.id)
        } catch (error) {
          console.error('Error with new WhatsApp service, falling back:', error)
          await sendSplitPaymentNotification(splitPayment.id, paymentLink)
        }
      }

    } catch (error) {
      console.error(`Error generating payment link for split payment ${splitPayment.id}:`, error)
    }
  }

  return paymentLinks
}

export async function processSplitPaymentCompletion(splitPaymentId: string) {
  const splitPayment = await prisma.splitPayment.findUnique({
    where: { id: splitPaymentId },
    include: {
      booking: {
        include: {
          splitPayments: true,
          court: true,
          club: true
        }
      },
      bookingGroup: {
        include: {
          splitPayments: true,
          bookings: {
            include: {
              court: true
            }
          },
          club: true
        }
      }
    }
  })

  if (!splitPayment) {
    throw new Error('Pago dividido no encontrado')
  }

  // Update split payment status
  await prisma.splitPayment.update({
    where: { id: splitPaymentId },
    data: {
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Determine if it's a booking or bookingGroup
  const isGroup = !!splitPayment.bookingGroup
  const bookingData = isGroup ? splitPayment.bookingGroup : splitPayment.booking
  const clubId = bookingData.clubId
  const courtInfo = isGroup 
    ? splitPayment.bookingGroup.bookings.map(b => b.court.name).join(', ')
    : splitPayment.booking.court.name

  // Create transaction in finance module for split payment
  await prisma.transaction.create({
    data: {
      id: nanoid(),
      clubId: clubId,
      type: 'INCOME',
      category: 'BOOKING',
      amount: splitPayment.amount,
      currency: 'MXN',
      description: `Pago dividido - ${splitPayment.playerName}`,
      reference: `split-${splitPaymentId}`,
      bookingId: splitPayment.bookingId, // Solo usar bookingId, que es el campo válido en Transaction
      date: new Date(),
      createdBy: clubId, // Using clubId as we don't have user context
      notes: `Pago dividido (${splitPayment.playerName}) para reserva del ${bookingData.date.toLocaleDateString('es-MX')} a las ${bookingData.startTime}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Trigger WhatsApp payment completion notification
  try {
    await onPaymentCompleted(splitPaymentId)
  } catch (error) {
    console.error('Error sending payment completion WhatsApp notification:', error)
  }

  // Check if all split payments are completed
  const allSplitPayments = isGroup 
    ? splitPayment.bookingGroup.splitPayments 
    : splitPayment.booking.splitPayments
  const completedPayments = allSplitPayments.filter(sp => 
    sp.status === 'completed' || sp.id === splitPaymentId
  ).length

  const isFullyPaid = completedPayments === bookingData.splitPaymentCount

  // Update booking or bookingGroup payment status if fully paid
  if (isFullyPaid) {
    if (isGroup) {
      await prisma.bookingGroup.update({
        where: { id: splitPayment.bookingGroupId },
        data: {
          paymentStatus: 'completed',
          status: 'CONFIRMED',
          updatedAt: new Date()
        }
      })
    } else {
      await prisma.booking.update({
        where: { id: splitPayment.bookingId },
        data: {
          paymentStatus: 'completed',
          status: 'CONFIRMED',
          updatedAt: new Date()
        }
      })
    }

    // Send confirmation notification to main player using new WhatsApp service
    try {
      const entityId = isGroup ? splitPayment.bookingGroupId : splitPayment.bookingId
      await WhatsAppService.sendBookingConfirmation(entityId)
    } catch (error) {
      console.error('Error sending booking confirmation WhatsApp notification:', error)
      // Fallback to old notification system
      const entityId = isGroup ? splitPayment.bookingGroupId : splitPayment.bookingId
      await sendBookingConfirmationNotification(entityId)
    }
  }

  return {
    splitPayment,
    isFullyPaid,
    completedPayments,
    totalPayments: bookingData.splitPaymentCount
  }
}

export async function getSplitPaymentStatus(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      splitPayments: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!booking) {
    throw new Error('Reserva no encontrada')
  }

  const completedPayments = booking.splitPayments.filter(sp => sp.status === 'completed').length
  const pendingPayments = booking.splitPayments.filter(sp => sp.status === 'pending').length
  const failedPayments = booking.splitPayments.filter(sp => sp.status === 'failed').length

  return {
    totalPayments: booking.splitPaymentCount,
    completedPayments,
    pendingPayments,
    failedPayments,
    isFullyPaid: completedPayments === booking.splitPaymentCount,
    progress: Math.round((completedPayments / booking.splitPaymentCount) * 100),
    splitPayments: booking.splitPayments
  }
}

export async function resendSplitPaymentNotification(splitPaymentId: string) {
  const splitPayment = await prisma.splitPayment.findUnique({
    where: { id: splitPaymentId },
    include: {
      booking: {
        include: {
          court: true,
          club: true
        }
      }
    }
  })

  if (!splitPayment) {
    throw new Error('Pago dividido no encontrado')
  }

  if (splitPayment.status !== 'pending') {
    throw new Error('Este pago ya fue procesado')
  }

  // Generate new payment link
  const paymentLink = await generatePaymentLink({
    splitPaymentId: splitPayment.id,
    amount: splitPayment.amount,
    description: `Pago para reserva en ${splitPayment.booking.court.name} - ${splitPayment.booking.club.name}`,
    playerName: splitPayment.playerName,
    playerEmail: splitPayment.playerEmail,
    playerPhone: splitPayment.playerPhone,
    bookingId: splitPayment.booking.id
  })

  // Send WhatsApp notification
  if (splitPayment.playerPhone) {
    await sendSplitPaymentNotification(splitPayment.id, paymentLink)
  }

  return { success: true, paymentLink }
}

// Helper function to send WhatsApp notification for split payment
async function sendSplitPaymentNotification(splitPaymentId: string, paymentLink: string) {
  const splitPayment = await prisma.splitPayment.findUnique({
    where: { id: splitPaymentId },
    include: {
      booking: {
        include: {
          court: true,
          club: true
        }
      }
    }
  })

  if (!splitPayment || !splitPayment.playerPhone) {
    return
  }

  const message = `🏓 ¡Hola ${splitPayment.playerName}!

Tu reserva en ${splitPayment.booking.club.name} está confirmada:
📅 ${new Date(splitPayment.booking.date).toLocaleDateString('es-MX')}
🕐 ${splitPayment.booking.startTime} - ${splitPayment.booking.endTime}
🏟️ ${splitPayment.booking.court.name}

💰 Completa tu pago de $${(splitPayment.amount / 100).toFixed(2)} MXN:
${paymentLink}

¡Nos vemos en la cancha! 🎾`

  try {
    await sendWhatsAppNotification(
      splitPayment.playerPhone,
      message,
      'split_payment_reminder'
    )

    // Create notification record
    await prisma.notification.create({
      data: {
        bookingId: splitPayment.bookingId,
        splitPaymentId: splitPayment.id,
        type: 'WHATSAPP',
        template: 'split_payment_reminder',
        recipient: splitPayment.playerPhone,
        status: 'sent'
      }
    })
  } catch (error) {
    console.error('Error sending split payment notification:', error)
    
    // Create failed notification record
    await prisma.notification.create({
      data: {
        bookingId: splitPayment.bookingId,
        splitPaymentId: splitPayment.id,
        type: 'WHATSAPP',
        template: 'split_payment_reminder',
        recipient: splitPayment.playerPhone,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
}

// Helper function to send booking confirmation
async function sendBookingConfirmationNotification(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      court: true,
      club: true
    }
  })

  if (!booking || !booking.playerPhone) {
    return
  }

  const message = `✅ ¡Pago completo! Tu reserva está confirmada

📍 ${booking.club.name}
📅 ${new Date(booking.date).toLocaleDateString('es-MX')}
🕐 ${booking.startTime} - ${booking.endTime}
🏟️ ${booking.court.name}

💰 Pago completado: $${(booking.price / 100).toFixed(2)} MXN

¡Te esperamos! 🎾`

  try {
    await sendWhatsAppNotification(
      booking.playerPhone,
      message,
      'booking_confirmation'
    )

    await prisma.notification.create({
      data: {
        bookingId: booking.id,
        type: 'WHATSAPP',
        template: 'booking_confirmation',
        recipient: booking.playerPhone,
        status: 'sent'
      }
    })
  } catch (error) {
    console.error('Error sending booking confirmation:', error)
  }
}