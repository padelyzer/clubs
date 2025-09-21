# STORY-009: Pagos con Stripe Connect

## 🎯 Objetivo
Implementar sistema de pagos divididos utilizando Stripe Connect donde cada club maneja sus propios pagos y los jugadores pueden dividir automáticamente entre 4 personas. Este es el diferenciador clave vs competencia.

## 📋 Contexto para Claude Code
El sistema de pagos divididos es la innovación principal de Padelyzer. Permitir que 4 jugadores paguen por separado elimina la fricción más grande del padel: "¿quién paga y cómo dividimos después?". Usamos Stripe Connect para que cada club mantenga control de sus finanzas.

## ✅ Criterios de Aceptación
- [ ] Stripe Connect onboarding para clubes
- [ ] Dashboard para configurar cuenta Stripe
- [ ] Reservas con opción "Dividir pago"
- [ ] Links únicos de pago por jugador
- [ ] Status tracking: 0/4, 1/4, 2/4, 3/4, 4/4 pagado
- [ ] Confirmación automática cuando 4/4 complete
- [ ] Webhook handling para estados de pago
- [ ] Dashboard de ingresos para clubes

## 📝 Instrucciones para Claude Code

### PASO 1: Configuración Stripe Connect
```typescript
// lib/config/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Para Connect
export async function createConnectAccount(email: string, country: string = 'MX') {
  const account = await stripe.accounts.create({
    type: 'express',
    country,
    email,
    business_type: 'individual',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })
  
  return account
}

export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })
  
  return accountLink
}

export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId)
  
  return {
    chargesEnabled: account.charges_enabled,
    detailsSubmitted: account.details_submitted,
    payoutsEnabled: account.payouts_enabled,
  }
}
```

### PASO 2: Onboarding Stripe en Dashboard
```tsx
// app/(web)/(auth)/dashboard/payments/page.tsx
import { requireStaffAuth } from '@/lib/auth/auth'
import { prisma } from '@/lib/config/prisma'
import { StripeOnboarding } from './stripe-onboarding'

export default async function PaymentsPage() {
  const session = await requireStaffAuth()

  const club = await prisma.club.findUnique({
    where: { id: session.user.clubId },
    select: {
      id: true,
      name: true,
      stripeAccountId: true,
      stripeOnboardingCompleted: true,
      email: true,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Pagos</h1>
        <p className="text-gray-600">
          Configura tu cuenta Stripe para recibir pagos directamente
        </p>
      </div>

      {!club.stripeOnboardingCompleted ? (
        <StripeOnboarding club={club} />
      ) : (
        <PaymentsDashboard club={club} />
      )}
    </div>
  )
}
```

### PASO 3: Componente de Onboarding
```tsx
// app/(web)/(auth)/dashboard/payments/stripe-onboarding.tsx
'use client'

import { useState } from 'react'
import { createStripeAccount, completeStripeOnboarding } from './actions'

export function StripeOnboarding({ club }) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(club.stripeAccountId ? 'complete' : 'create')

  async function handleCreateAccount() {
    setLoading(true)
    try {
      const result = await createStripeAccount(club.id)
      if (result.accountLink) {
        window.location.href = result.accountLink
      }
    } catch (error) {
      alert('Error al crear cuenta Stripe')
    } finally {
      setLoading(false)
    }
  }

  async function handleCompleteOnboarding() {
    setLoading(true)
    try {
      await completeStripeOnboarding(club.id)
      window.location.reload()
    } catch (error) {
      alert('Error al completar configuración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            💳
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Configura tu cuenta de pagos
          </h3>
          <p className="text-gray-600 mb-6">
            Para recibir reservas con pago, necesitas una cuenta Stripe Connect
          </p>
        </div>

        {step === 'create' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">¿Qué es Stripe Connect?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Procesamiento seguro de pagos con tarjeta</li>
                <li>• Los pagos van directamente a tu cuenta bancaria</li>
                <li>• Comisión: 3.6% + $3 MXN por transacción</li>
                <li>• Padelyzer no toca tu dinero, solo conecta</li>
              </ul>
            </div>

            <button
              onClick={handleCreateAccount}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : '🚀 Crear cuenta Stripe'}
            </button>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⏳ Configuración Pendiente</h4>
              <p className="text-sm text-yellow-800">
                Tu cuenta Stripe está creada pero necesita completar la configuración
              </p>
            </div>

            <button
              onClick={handleCompleteOnboarding}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : '✅ Completar configuración'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

### PASO 4: Server Actions para Stripe
```typescript
// app/(web)/(auth)/dashboard/payments/actions.ts
'use server'

import { prisma } from '@/lib/config/prisma'
import { createConnectAccount, createAccountLink, getAccountStatus } from '@/lib/config/stripe'
import { requireStaffAuth } from '@/lib/auth/auth'
import { revalidatePath } from 'next/cache'

export async function createStripeAccount(clubId: string) {
  const session = await requireStaffAuth()
  
  if (session.user.clubId !== clubId) {
    throw new Error('Unauthorized')
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { email: true, stripeAccountId: true }
  })

  if (!club) {
    throw new Error('Club not found')
  }

  let accountId = club.stripeAccountId

  // Create account if it doesn't exist
  if (!accountId) {
    const account = await createConnectAccount(club.email)
    accountId = account.id

    await prisma.club.update({
      where: { id: clubId },
      data: { stripeAccountId: accountId }
    })
  }

  // Create onboarding link
  const accountLink = await createAccountLink(
    accountId,
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments?refresh=true`,
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments?success=true`
  )

  return {
    accountId,
    accountLink: accountLink.url
  }
}

export async function completeStripeOnboarding(clubId: string) {
  const session = await requireStaffAuth()
  
  if (session.user.clubId !== clubId) {
    throw new Error('Unauthorized')
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { stripeAccountId: true }
  })

  if (!club?.stripeAccountId) {
    throw new Error('No Stripe account found')
  }

  const status = await getAccountStatus(club.stripeAccountId)

  await prisma.club.update({
    where: { id: clubId },
    data: {
      stripeOnboardingCompleted: status.chargesEnabled && status.detailsSubmitted,
      stripePayoutsEnabled: status.payoutsEnabled
    }
  })

  revalidatePath('/dashboard/payments')
  
  return status
}
```

### PASO 5: Sistema de Reservas con Pagos Divididos
```tsx
// app/(web)/(public)/widget/[clubSlug]/payment-options.tsx
'use client'

import { useState } from 'react'

export function PaymentOptions({ 
  booking, 
  totalPrice, 
  onPaymentMethodSelect 
}: {
  booking: any
  totalPrice: number
  onPaymentMethodSelect: (method: string) => void
}) {
  const [selectedMethod, setSelectedMethod] = useState('ONSITE')
  const perPlayerPrice = Math.round(totalPrice / 4)

  const paymentMethods = [
    {
      id: 'ONSITE',
      title: 'Pagar en el club',
      description: 'Pago en efectivo o terminal al llegar',
      price: totalPrice,
      icon: '🏟️'
    },
    {
      id: 'FULL_ONLINE',
      title: 'Pagar ahora (completo)',
      description: 'Una persona paga todo con tarjeta',
      price: totalPrice,
      icon: '💳'
    },
    {
      id: 'SPLIT_ONLINE',
      title: 'Dividir entre 4 jugadores',
      description: `Cada jugador paga $${perPlayerPrice} por separado`,
      price: perPlayerPrice,
      icon: '🤝',
      highlight: true
    }
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">¿Cómo van a pagar?</h3>
        <p className="text-sm text-gray-600">
          Precio total: <span className="font-semibold text-green-600">${totalPrice} MXN</span>
        </p>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedMethod === method.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${method.highlight ? 'ring-2 ring-blue-200' : ''}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-start">
              <div className="text-2xl mr-3">{method.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{method.title}</h4>
                  {method.highlight && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Recomendado
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                {method.id === 'SPLIT_ONLINE' && (
                  <div className="mt-2 text-xs text-blue-700 bg-blue-50 rounded p-2">
                    💡 Cada jugador recibe su propio link de pago. La cancha se confirma cuando todos paguen.
                  </div>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={() => onPaymentMethodSelect(selectedMethod)}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
      >
        Continuar con {paymentMethods.find(m => m.id === selectedMethod)?.title}
      </button>
    </div>
  )
}
```

### PASO 6: Procesamiento de Pagos Divididos
```typescript
// app/(web)/(public)/widget/[clubSlug]/payment-actions.ts
'use server'

import { prisma } from '@/lib/config/prisma'
import { stripe } from '@/lib/config/stripe'
import { z } from 'zod'

const SplitPaymentSchema = z.object({
  bookingId: z.string().cuid(),
  playerName: z.string().min(2),
  playerEmail: z.string().email(),
  playerPhone: z.string().min(10),
})

export async function createSplitPayment(data: any) {
  try {
    const parsed = SplitPaymentSchema.safeParse(data)
    if (!parsed.success) {
      return { error: 'Datos inválidos' }
    }

    const { bookingId, playerName, playerEmail, playerPhone } = parsed.data

    // Get booking with club info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        club: {
          select: {
            stripeAccountId: true,
            stripeOnboardingCompleted: true,
            name: true
          }
        },
        court: true,
        splitPayments: true
      }
    })

    if (!booking) {
      return { error: 'Reserva no encontrada' }
    }

    if (!booking.club.stripeOnboardingCompleted) {
      return { error: 'El club no tiene pagos configurados' }
    }

    // Check if already 4 players
    if (booking.splitPayments.length >= 4) {
      return { error: 'Esta reserva ya tiene 4 jugadores' }
    }

    // Check if this player already joined
    const existingPlayer = booking.splitPayments.find(
      sp => sp.playerEmail === playerEmail || sp.playerPhone === playerPhone
    )

    if (existingPlayer) {
      return { error: 'Ya tienes un pago registrado para esta reserva' }
    }

    const amountPerPlayer = Math.round(booking.price / 4)

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountPerPlayer * 100, // Stripe uses cents
      currency: 'mxn',
      application_fee_amount: Math.round(amountPerPlayer * 0.05 * 100), // 5% platform fee
      transfer_data: {
        destination: booking.club.stripeAccountId,
      },
      metadata: {
        bookingId,
        playerName,
        playerEmail,
        playerPhone,
        clubName: booking.club.name,
      }
    })

    // Create split payment record
    const splitPayment = await prisma.splitPayment.create({
      data: {
        bookingId,
        playerName,
        playerEmail,
        playerPhone,
        amount: amountPerPlayer,
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
      }
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      splitPaymentId: splitPayment.id,
      amount: amountPerPlayer,
    }

  } catch (error) {
    console.error('Split payment error:', error)
    return { error: 'Error interno del servidor' }
  }
}

export async function checkBookingPaymentStatus(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      splitPayments: true,
    }
  })

  if (!booking) {
    return { error: 'Reserva no encontrada' }
  }

  const completedPayments = booking.splitPayments.filter(sp => sp.status === 'completed')
  const totalPlayers = booking.splitPayments.length
  const isFullyPaid = completedPayments.length === 4

  if (isFullyPaid && booking.paymentStatus !== 'completed') {
    // Update booking to confirmed
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'completed',
        status: 'CONFIRMED',
      }
    })
  }

  return {
    totalPlayers,
    completedPayments: completedPayments.length,
    isFullyPaid,
    players: booking.splitPayments.map(sp => ({
      name: sp.playerName,
      status: sp.status,
      amount: sp.amount
    }))
  }
}
```

### PASO 7: Webhooks de Stripe
```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/config/stripe'
import { prisma } from '@/lib/config/prisma'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object)
      break
    
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object)
      break
    
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return Response.json({ received: true })
}

async function handlePaymentSucceeded(paymentIntent: any) {
  const { bookingId, playerName, playerEmail } = paymentIntent.metadata

  // Update split payment status
  await prisma.splitPayment.updateMany({
    where: {
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    },
    data: {
      status: 'completed',
      completedAt: new Date(),
    }
  })

  // Check if booking is now fully paid
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { splitPayments: true }
  })

  if (booking) {
    const completedPayments = booking.splitPayments.filter(sp => sp.status === 'completed')
    
    if (completedPayments.length === 4) {
      // All players paid - confirm booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'completed',
          status: 'CONFIRMED',
        }
      })

      // TODO: Send WhatsApp confirmations to all players
      console.log(`Booking ${bookingId} fully paid and confirmed`)
    }
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  await prisma.splitPayment.updateMany({
    where: {
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    },
    data: {
      status: 'failed',
    }
  })
}
```

### PASO 8: Dashboard de Ingresos
```tsx
// app/(web)/(auth)/dashboard/earnings/page.tsx
import { requireStaffAuth } from '@/lib/auth/auth'
import { prisma } from '@/lib/config/prisma'
import { EarningsDashboard } from './earnings-dashboard'

export default async function EarningsPage() {
  const session = await requireStaffAuth()

  const club = await prisma.club.findUnique({
    where: { id: session.user.clubId },
    include: {
      bookings: {
        where: {
          paymentStatus: 'completed',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        include: {
          splitPayments: true,
          court: true
        }
      }
    }
  })

  const monthlyEarnings = club.bookings.reduce((total, booking) => total + booking.price, 0)
  const totalBookings = club.bookings.length
  const avgBookingValue = totalBookings > 0 ? monthlyEarnings / totalBookings : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ingresos y Pagos</h1>
        <p className="text-gray-600">
          Resumen de tus ingresos del mes actual
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              💰
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-gray-900">
                ${monthlyEarnings.toLocaleString()} MXN
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              📅
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Reservas Pagadas</p>
              <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              📊
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Valor Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                ${Math.round(avgBookingValue)} MXN
              </p>
            </div>
          </div>
        </div>
      </div>

      <EarningsDashboard bookings={club.bookings} />
    </div>
  )
}
```

## 🔍 Verificación
```bash
# Claude, verificar el sistema de pagos:
npm run dev

# Flow de prueba:
# 1. Configurar cuenta Stripe en dashboard
# 2. Crear reserva con opción "dividir pago"
# 3. Simular 4 pagos diferentes
# 4. Verificar confirmación automática
# 5. Revisar dashboard de ingresos
```

## ⚠️ NO HACER
- NO implementar Stripe Express (solo Connect)
- NO agregar criptomonedas o métodos alternativos
- NO crear sistema de reembolsos automático
- NO implementar subscripciones de membresía

## Definition of Done
- [ ] Stripe Connect onboarding funcional
- [ ] Pagos divididos funcionando end-to-end
- [ ] Webhooks procesando correctamente
- [ ] Dashboard de ingresos con métricas básicas
- [ ] Status tracking visual 0/4 → 4/4
- [ ] Confirmación automática al completar 4/4 pagos
- [ ] Platform fee de 5% aplicado correctamente