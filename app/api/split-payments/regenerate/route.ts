import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { stripe } from '@/lib/config/stripe'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    if (!session?.clubId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { bookingId, splitPaymentId } = await request.json()

    if (!bookingId || !splitPaymentId) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    // Obtener el split payment
    const splitPayment = await prisma.splitPayment.findUnique({
      where: { id: splitPaymentId },
      include: {
        booking: {
          include: {
            club: true,
            court: true
          }
        },
        bookingGroup: {
          include: {
            club: true,
            bookings: {
              include: {
                court: true
              }
            }
          }
        }
      }
    })

    if (!splitPayment) {
      return NextResponse.json(
        { success: false, error: 'Pago dividido no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el split payment pertenece al booking o booking group
    const isValidPayment = splitPayment.bookingId === bookingId || 
                          splitPayment.bookingGroupId === bookingId
    
    if (!isValidPayment) {
      return NextResponse.json(
        { success: false, error: 'El pago no corresponde a esta reserva' },
        { status: 400 }
      )
    }

    // Verificar que no esté ya completado
    if (splitPayment.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Este pago ya está completado' },
        { status: 400 }
      )
    }

    // Si ya tiene Payment Intent, no crear uno nuevo
    if (splitPayment.stripePaymentIntentId) {
      return NextResponse.json({
        success: true,
        paymentIntentId: splitPayment.stripePaymentIntentId,
        paymentLink: `/pay/${bookingId}?split=${splitPaymentId}`,
        message: 'El pago ya tiene un link generado'
      })
    }

    // Obtener configuración de Stripe del club
    const clubSettings = await prisma.clubSettings.findUnique({
      where: { clubId: session.clubId }
    })

    // Para modo de prueba, permitir continuar sin Stripe Account ID
    const isTestMode = process.env.NODE_ENV === 'development' || !clubSettings?.stripeAccountId

    // Generar un ID único para el Payment Intent
    const uniqueId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    let paymentIntent: any

    if (isTestMode) {
      // Modo de prueba: simular Payment Intent
      console.log('🧪 Modo de prueba: simulando Payment Intent')
      paymentIntent = {
        id: uniqueId,
        client_secret: `${uniqueId}_secret_${Math.random().toString(36).substr(2, 9)}`,
        amount: splitPayment.amount,
        currency: 'mxn',
        status: 'requires_payment_method'
      }
    } else {
      // Crear Payment Intent real de Stripe
      paymentIntent = await stripe.paymentIntents.create({
        amount: splitPayment.amount,
        currency: 'mxn',
        payment_method_types: ['card'],
        metadata: {
          bookingId: bookingId,
          splitPaymentId: splitPaymentId,
          playerName: splitPayment.playerName,
          type: 'split_payment'
        },
        application_fee_amount: Math.round(splitPayment.amount * 0.05), // 5% de comisión
        transfer_data: {
          destination: clubSettings?.stripeAccountId
        }
      }, {
        idempotencyKey: uniqueId
      })
    }

    // Actualizar el split payment con el Payment Intent ID
    await prisma.splitPayment.update({
      where: { id: splitPaymentId },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        status: 'processing',
        updatedAt: new Date()
      }
    })

    // Generar link de pago
    const paymentLink = `/pay/${bookingId}?split=${splitPaymentId}`

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      paymentLink,
      clientSecret: paymentIntent.client_secret,
      message: 'Payment Intent generado exitosamente'
    })

  } catch (error) {
    console.error('Error regenerating payment intent:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al generar Payment Intent' 
      },
      { status: 500 }
    )
  }
}