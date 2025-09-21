import { prisma } from '@/lib/config/prisma'
import { createTransfer, calculateApplicationFee } from '@/lib/config/stripe'

interface CommissionCalculation {
  totalAmount: number
  platformFee: number
  stripeFee: number
  netAmount: number
  feePercentage: number
}

interface TransferResult {
  success: boolean
  transferId?: string
  error?: string
  commission: CommissionCalculation
}

/**
 * Calculate commission breakdown for a payment
 */
export function calculateCommission(
  amount: number, 
  platformFeePercentage: number = 2.5
): CommissionCalculation {
  // Platform fee (Padelyzer commission)
  const platformFee = Math.round(amount * (platformFeePercentage / 100))
  
  // Stripe fee approximation: 3.6% + $3 MXN (converted to cents)
  const stripeFeePercentage = 3.6
  const stripeFixedFee = 300 // $3 MXN in cents
  const stripeFee = Math.round(amount * (stripeFeePercentage / 100)) + stripeFixedFee
  
  // Net amount that goes to the club
  const netAmount = amount - platformFee - stripeFee
  
  return {
    totalAmount: amount,
    platformFee,
    stripeFee,
    netAmount,
    feePercentage: platformFeePercentage,
  }
}

/**
 * Process automatic transfer to connected account after successful payment
 */
export async function processAutomaticTransfer(
  paymentId: string,
  connectedAccountId: string,
  amount: number,
  platformFeePercentage: number = 2.5,
  transferGroup?: string
): Promise<TransferResult> {
  try {
    const commission = calculateCommission(amount, platformFeePercentage)
    
    // Create transfer to connected account (club)
    // The net amount after platform fee
    const transferAmount = amount - commission.platformFee
    
    const transfer = await createTransfer({
      amount: transferAmount,
      destination: connectedAccountId,
      transferGroup,
      metadata: {
        payment_id: paymentId,
        original_amount: amount.toString(),
        platform_fee: commission.platformFee.toString(),
        transfer_type: 'automatic_payout',
      },
    })

    return {
      success: true,
      transferId: transfer.id,
      commission,
    }

  } catch (error) {
    console.error('Error processing automatic transfer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown transfer error',
      commission: calculateCommission(amount, platformFeePercentage),
    }
  }
}

/**
 * Update club's commission rate
 */
export async function updateClubCommissionRate(
  clubId: string,
  newRate: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate rate (should be between 0 and 10%)
    if (newRate < 0 || newRate > 1000) { // 1000 basis points = 10%
      return {
        success: false,
        error: 'La comisión debe estar entre 0% y 10%',
      }
    }

    await prisma.club.update({
      where: { id: clubId },
      data: {
        stripeCommissionRate: Math.round(newRate), // Store in basis points
      },
    })

    return { success: true }

  } catch (error) {
    console.error('Error updating commission rate:', error)
    return {
      success: false,
      error: 'Error actualizando la comisión',
    }
  }
}

/**
 * Get commission summary for a club
 */
export async function getClubCommissionSummary(clubId: string, dateRange?: {
  from: Date
  to: Date
}) {
  try {
    const whereClause: any = {
      booking: {
        clubId,
      },
      status: 'completed',
    }

    if (dateRange) {
      whereClause.completedAt = {
        gte: dateRange.from,
        lte: dateRange.to,
      }
    }

    // Get completed payments
    const completedPayments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            club: true,
          },
        },
      },
    })

    // Get completed split payments
    const completedSplitPayments = await prisma.splitPayment.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            club: true,
          },
        },
      },
    })

    // Calculate totals
    let totalRevenue = 0
    let totalPlatformFees = 0
    let totalStripeFees = 0
    let totalNetAmount = 0
    let transactionCount = 0

    // Process main payments
    completedPayments.forEach(payment => {
      const commission = calculateCommission(
        payment.amount,
        payment.booking.club.stripeCommissionRate / 100
      )
      
      totalRevenue += payment.amount
      totalPlatformFees += payment.stripeApplicationFee || commission.platformFee
      totalStripeFees += commission.stripeFee
      totalNetAmount += commission.netAmount
      transactionCount++
    })

    // Process split payments
    completedSplitPayments.forEach(splitPayment => {
      const commission = calculateCommission(
        splitPayment.amount,
        splitPayment.booking.club.stripeCommissionRate / 100
      )
      
      totalRevenue += splitPayment.amount
      totalPlatformFees += splitPayment.stripeApplicationFee || commission.platformFee
      totalStripeFees += commission.stripeFee
      totalNetAmount += commission.netAmount
      transactionCount++
    })

    return {
      totalRevenue,
      totalPlatformFees,
      totalStripeFees,
      totalNetAmount,
      transactionCount,
      averageTransactionValue: transactionCount > 0 ? totalRevenue / transactionCount : 0,
      platformFeePercentage: completedPayments[0]?.booking.club.stripeCommissionRate / 100 || 2.5,
      effectiveFeePercentage: totalRevenue > 0 ? ((totalPlatformFees + totalStripeFees) / totalRevenue) * 100 : 0,
    }

  } catch (error) {
    console.error('Error getting commission summary:', error)
    throw error
  }
}

/**
 * Get pending transfers that need to be processed
 */
export async function getPendingTransfers(clubId?: string) {
  try {
    const whereClause: any = {
      status: 'completed',
      stripeTransferId: null, // No transfer created yet
    }

    if (clubId) {
      whereClause.booking = {
        clubId,
      }
    }

    const pendingPayments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            club: true,
          },
        },
      },
    })

    const pendingSplitPayments = await prisma.splitPayment.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            club: true,
          },
        },
      },
    })

    return {
      pendingPayments,
      pendingSplitPayments,
      totalPendingAmount: [
        ...pendingPayments,
        ...pendingSplitPayments,
      ].reduce((sum, payment) => sum + payment.amount, 0),
    }

  } catch (error) {
    console.error('Error getting pending transfers:', error)
    throw error
  }
}

/**
 * Process all pending transfers for a club
 */
export async function processPendingTransfers(clubId: string) {
  try {
    const { pendingPayments, pendingSplitPayments } = await getPendingTransfers(clubId)
    
    const results = []

    // Process main payments
    for (const payment of pendingPayments) {
      const club = payment.booking.club
      
      if (!club.stripeAccountId) {
        continue
      }

      const result = await processAutomaticTransfer(
        payment.id,
        club.stripeAccountId,
        payment.amount,
        club.stripeCommissionRate / 100,
        `booking_${payment.bookingId}`
      )

      if (result.success && result.transferId) {
        // Update payment with transfer ID
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            stripeTransferId: result.transferId,
          },
        })
      }

      results.push({
        type: 'payment',
        id: payment.id,
        ...result,
      })
    }

    // Process split payments
    for (const splitPayment of pendingSplitPayments) {
      const club = splitPayment.booking.club
      
      if (!club.stripeAccountId) {
        continue
      }

      const result = await processAutomaticTransfer(
        splitPayment.id,
        club.stripeAccountId,
        splitPayment.amount,
        club.stripeCommissionRate / 100,
        `booking_${splitPayment.bookingId}`
      )

      if (result.success && result.transferId) {
        // Update split payment with transfer ID
        await prisma.splitPayment.update({
          where: { id: splitPayment.id },
          data: {
            stripeTransferId: result.transferId,
          },
        })
      }

      results.push({
        type: 'split_payment',
        id: splitPayment.id,
        ...result,
      })
    }

    return {
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    }

  } catch (error) {
    console.error('Error processing pending transfers:', error)
    throw error
  }
}

/**
 * Generate commission report for a date range
 */
export async function generateCommissionReport(
  clubId: string,
  fromDate: Date,
  toDate: Date
) {
  try {
    const summary = await getClubCommissionSummary(clubId, {
      from: fromDate,
      to: toDate,
    })

    // Get detailed transactions
    const detailedTransactions = await prisma.payment.findMany({
      where: {
        booking: { clubId },
        status: 'completed',
        completedAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        booking: {
          include: {
            court: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    const detailedSplitPayments = await prisma.splitPayment.findMany({
      where: {
        booking: { clubId },
        status: 'completed',
        completedAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        booking: {
          include: {
            court: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    return {
      summary,
      transactions: detailedTransactions,
      splitPayments: detailedSplitPayments,
      reportPeriod: {
        from: fromDate,
        to: toDate,
      },
    }

  } catch (error) {
    console.error('Error generating commission report:', error)
    throw error
  }
}