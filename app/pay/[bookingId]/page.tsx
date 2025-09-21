'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

interface BookingDetails {
  id: string
  date: string
  startTime: string
  endTime: string
  clubName: string
  courtName: string
  playerName: string
  totalPlayers: number
  price: number
  splitPaymentEnabled: boolean
  splitPaymentCount: number
  isGroup?: boolean
}

interface PaymentPageProps {
  bookingId: string
  splitPaymentId?: string
}

function PaymentForm({ bookingId, splitPaymentId }: PaymentPageProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [amount, setAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'oxxo' | 'spei'>('card')
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '' })
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null)

  useEffect(() => {
    createPaymentIntent()
  }, [bookingId, splitPaymentId])

  const createPaymentIntent = async () => {
    try {
      setLoading(true)
      console.log('[PaymentForm] Creating payment intent for:', { bookingId, splitPaymentId })
      
      // Usar el nuevo endpoint que maneja las llaves del club
      const response = await fetch('/api/stripe/payments/create-intent-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          splitPaymentId,
        }),
      })

      const data = await response.json()
      console.log('[PaymentForm] Response:', { status: response.status, data })

      if (!response.ok) {
        console.error('[PaymentForm] Error from API:', data.error)
        throw new Error(data.error || 'Error creating payment intent')
      }

      setClientSecret(data.clientSecret)
      setAmount(data.amount)
      setBooking(data.bookingDetails)
      console.log('[PaymentForm] Payment intent created successfully')
    } catch (err) {
      console.error('[PaymentForm] Error in createPaymentIntent:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setLoading(true)
    setError(null)

    // Detectar si estamos en modo de prueba (client_secret simulado)
    const isTestMode = clientSecret.includes('_secret_') && !clientSecret.startsWith('pi_test_') && !clientSecret.startsWith('pi_live_')
    
    if (isTestMode) {
      console.log('🧪 Modo de prueba detectado, simulando pago exitoso...')
      
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simular pago exitoso y confirmar en el backend
      try {
        const response = await fetch('/api/stripe/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: clientSecret.split('_secret_')[0],
            testMode: true
          }),
        })

        if (response.ok) {
          setSuccess(true)
        } else {
          const data = await response.json()
          setError(data.error || 'Error confirmando el pago')
        }
      } catch (err) {
        setError('Error confirmando el pago')
      }
      
      setLoading(false)
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('No se pudo cargar el formulario de tarjeta')
      setLoading(false)
      return
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: booking?.playerName || 'Cliente',
        },
      },
    })

    if (confirmError) {
      setError(confirmError.message || 'Error procesando el pago')
    } else if (paymentIntent?.status === 'succeeded') {
      // Confirm payment on our backend
      try {
        console.log('[PaymentForm] Confirming payment with bookingId:', bookingId)
        const response = await fetch('/api/stripe/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            bookingId: bookingId, // Include the booking ID to help identify ClassBookings
            testMode: true,
          }),
        })

        if (response.ok) {
          setSuccess(true)
        } else {
          const data = await response.json()
          setError(data.error || 'Error confirmando el pago')
        }
      } catch (err) {
        setError('Error confirmando el pago')
      }
    }

    setLoading(false)
  }

  const handleOxxoPayment = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      setError('Por favor ingresa tu nombre y email para continuar con OXXO')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/payments/oxxo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          splitPaymentId,
          customerInfo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error creating OXXO payment')
      }

      setPaymentMethod('oxxo')
      setPaymentInstructions(data.instructions)
      setClientSecret(data.clientSecret)
      
      // For OXXO, we show instructions immediately
      setSuccess(true)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleSpeiPayment = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      setError('Por favor ingresa tu nombre y email para continuar con SPEI')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/payments/spei', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          splitPaymentId,
          customerInfo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error creating SPEI payment')
      }

      setPaymentMethod('spei')
      setPaymentInstructions(data.instructions)
      setClientSecret(data.clientSecret)
      
      // For SPEI, we show transfer details immediately
      setSuccess(true)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2)
  }

  if (loading && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del pago...</p>
        </div>
      </div>
    )
  }

  if (success) {
    if (paymentMethod === 'card') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
            <p className="text-gray-600 mb-6">
              Tu pago de ${formatAmount(amount)} MXN ha sido procesado correctamente.
            </p>
            {booking && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Detalles de la reserva:</h3>
                <p><strong>Club:</strong> {booking.clubName}</p>
                <p><strong>Cancha:</strong> {booking.courtName}</p>
                <p><strong>Fecha:</strong> {new Date(booking.date).toLocaleDateString('es-MX')}</p>
                <p><strong>Hora:</strong> {booking.startTime} - {booking.endTime}</p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Recibirás una confirmación por WhatsApp en breve.
            </p>
          </div>
        </div>
      )
    }

    // OXXO or SPEI payment instructions
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className={`${paymentMethod === 'oxxo' ? 'bg-red-600' : 'bg-blue-600'} text-white p-6`}>
              <h1 className="text-2xl font-bold">{paymentInstructions?.title}</h1>
              <p className="text-white/90">{paymentInstructions?.description}</p>
            </div>

            {/* Booking Details */}
            {booking && (
              <div className="p-6 border-b">
                <h2 className="font-semibold text-gray-900 mb-3">Detalles de la reserva</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Club:</strong> {booking.clubName}</p>
                    <p><strong>Cancha:</strong> {booking.courtName}</p>
                  </div>
                  <div>
                    <p><strong>Fecha:</strong> {new Date(booking.date).toLocaleDateString('es-MX')}</p>
                    <p><strong>Hora:</strong> {booking.startTime} - {booking.endTime}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-lg font-bold">Monto a pagar: ${formatAmount(amount)} MXN</p>
                </div>
              </div>
            )}

            {/* Payment Instructions */}
            <div className="p-6">
              {paymentMethod === 'oxxo' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Instrucciones para pagar en OXXO:</h3>
                  <div className="space-y-3">
                    {paymentInstructions?.steps?.map((step: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                      <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Importante:</p>
                        <p className="text-sm text-yellow-700">Tienes {paymentInstructions?.expirationHours} horas para completar el pago.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'spei' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Datos para transferencia SPEI:</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded">
                        <label className="text-xs font-medium text-gray-500 uppercase">CLABE</label>
                        <p className="text-lg font-mono font-bold">646180157000000004</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <label className="text-xs font-medium text-gray-500 uppercase">Referencia</label>
                        <p className="text-lg font-mono font-bold">PAD{booking?.id.substring(0, 8).toUpperCase()}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <label className="text-xs font-medium text-gray-500 uppercase">Banco</label>
                        <p className="text-lg font-bold">STP</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <label className="text-xs font-medium text-gray-500 uppercase">Beneficiario</label>
                        <p className="text-lg font-bold">{booking?.clubName}</p>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-3">Pasos para transferir:</h4>
                  <div className="space-y-3">
                    {paymentInstructions?.steps?.map((step: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex">
                      <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Tiempo límite:</p>
                        <p className="text-sm text-blue-700">Tienes {paymentInstructions?.expirationHours} horas para completar la transferencia.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Una vez procesado el pago, recibirás una confirmación por WhatsApp.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  Verificar estado del pago
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 text-white p-6">
            <h1 className="text-2xl font-bold">
              {booking ? `Reserva: ${booking.playerName}` : 'Reserva'}
            </h1>
            {splitPaymentId ? (
              <p className="text-green-100">Pago dividido - Tu parte</p>
            ) : (
              <p className="text-green-100">Pago completo</p>
            )}
          </div>

          {/* Booking Details */}
          {booking && (
            <div className="p-6 border-b">
              <h2 className="font-semibold text-gray-900 mb-3">Detalles de la reserva</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Club:</strong> {booking.clubName}</p>
                <p><strong>Cancha:</strong> {booking.courtName}</p>
                <p><strong>Fecha:</strong> {new Date(booking.date).toLocaleDateString('es-MX')}</p>
                <p><strong>Hora:</strong> {booking.startTime} - {booking.endTime}</p>
                {booking.splitPaymentEnabled && (
                  <p><strong>Jugadores:</strong> {booking.totalPlayers}</p>
                )}
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                {splitPaymentId ? 'Tu parte:' : 'Total a pagar:'}
              </span>
              <span className="text-2xl font-bold text-green-600">
                ${formatAmount(amount)} MXN
              </span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">Error: {error}</p>
                <p className="text-xs text-red-500 mt-1">BookingId: {bookingId}</p>
              </div>
            )}

            {/* Customer Information for alternative payment methods */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Información del Cliente</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Información de la tarjeta
                </label>
                <div className="p-3 border border-gray-300 rounded-md bg-white">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                      },
                      hidePostalCode: true,
                      disableLink: true,
                    }}
                  />
                </div>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={!stripe || loading || !clientSecret}
                  className="w-full py-3 px-4 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#374151'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#000000'
                    }
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </span>
                  ) : (
                    `Pagar $${formatAmount(amount)} MXN`
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Pagos seguros procesados por Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const bookingId = params.bookingId as string
  const splitPaymentId = searchParams.get('split') || undefined
  const [stripePromise, setStripePromise] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar la configuración de Stripe del club
    fetchStripeConfig()
  }, [bookingId])

  const fetchStripeConfig = async () => {
    try {
      // Primero intentar obtener la configuración del club
      const response = await fetch(`/api/stripe/config?bookingId=${bookingId}`)
      const data = await response.json()
      
      let publicKey = null
      if (data.success && data.publicKey) {
        publicKey = data.publicKey
        console.log('Using club-specific Stripe public key')
      } else {
        // Fallback a la llave global
        publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51IeqH4HZxVJhPIzs1kLkQzYWFRRLGzMrDKQqFYDWZ8eXKoGHXaQYKlePQCwpqDe3Bq5JQwGmVpVGYbNdBOgO00V000pZQOtRJ'
        console.log('Using global Stripe public key')
      }
      
      if (publicKey) {
        const stripe = await loadStripe(publicKey)
        setStripePromise(stripe)
      }
    } catch (error) {
      console.error('Error loading Stripe config:', error)
      // Usar llave por defecto en caso de error
      const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51IeqH4HZxVJhPIzs1kLkQzYWFRRLGzMrDKQqFYDWZ8eXKoGHXaQYKlePQCwpqDe3Bq5JQwGmVpVGYbNdBOgO00V000pZQOtRJ'
      const stripe = await loadStripe(publicKey)
      setStripePromise(stripe)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Cargando sistema de pago...</p>
        </div>
      </div>
    )
  }

  // Si Stripe no está configurado, mostrar mensaje alternativo
  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sistema de Pago No Disponible</h2>
            <p className="text-gray-600 mb-6">
              El sistema de pago en línea no está configurado actualmente. Por favor, contacta al club para coordinar el pago.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm bookingId={bookingId} splitPaymentId={splitPaymentId} />
    </Elements>
  )
}