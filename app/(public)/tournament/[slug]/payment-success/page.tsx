'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Trophy, Users } from 'lucide-react'
import Link from 'next/link'

interface PaymentStatus {
  id: string
  status: string
  amount: number
  currency: string
  tournament: {
    id: string
    name: string
    registrationFee: number
    currency: string
  }
  metadata: any
  expired: boolean
}

export default function PaymentSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const registrationId = searchParams.get('registration')
  
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!registrationId) {
      setError('ID de registro no encontrado')
      setLoading(false)
      return
    }

    fetchPaymentStatus()
  }, [registrationId])

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(
        `/api/tournaments/${params.slug}/payment-link?registrationId=${registrationId}`
      )
      
      const data = await response.json()
      
      if (data.success) {
        setPaymentStatus(data.data)
      } else {
        setError(data.error || 'Error al verificar el pago')
      }
    } catch (error) {
      console.error('Error fetching payment status:', error)
      setError('Error al verificar el estado del pago')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando estado del pago...</p>
        </div>
      </div>
    )
  }

  if (error || !paymentStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href={`/tournament/${params.slug}`}>
              <Button>Volver al Torneo</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isPaymentSuccessful = paymentStatus.status === 'completed'
  const isPending = paymentStatus.status === 'pending'
  const isExpired = paymentStatus.expired

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            {isPaymentSuccessful ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-green-600">
                  ¡Pago Exitoso!
                </CardTitle>
                <CardDescription className="text-lg">
                  Tu inscripción al torneo ha sido confirmada
                </CardDescription>
              </>
            ) : isPending ? (
              <>
                <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-yellow-600">
                  Pago Pendiente
                </CardTitle>
                <CardDescription className="text-lg">
                  Tu pago está siendo procesado
                </CardDescription>
              </>
            ) : isExpired ? (
              <>
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-red-600">
                  Link Expirado
                </CardTitle>
                <CardDescription className="text-lg">
                  El enlace de pago ha expirado
                </CardDescription>
              </>
            ) : (
              <>
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-red-600">
                  Pago No Completado
                </CardTitle>
                <CardDescription className="text-lg">
                  Hubo un problema con tu pago
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Tournament Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-lg">{paymentStatus.tournament.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Monto:</span>
                  <div className="font-semibold">
                    ${(paymentStatus.amount / 100).toFixed(2)} {paymentStatus.currency}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Estado:</span>
                  <div className="font-semibold capitalize">
                    {paymentStatus.status === 'completed' ? 'Confirmado' : 
                     paymentStatus.status === 'pending' ? 'Pendiente' : 
                     paymentStatus.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Players Info */}
            {paymentStatus.metadata && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-lg">Información de la Pareja</h3>
                </div>
                
                {paymentStatus.metadata.teamName && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">Nombre del Equipo:</span>
                    <div className="font-semibold">{paymentStatus.metadata.teamName}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium">Jugador 1:</h4>
                    <div>{paymentStatus.metadata.player1Name}</div>
                    {paymentStatus.metadata.player1Email && (
                      <div className="text-gray-600">{paymentStatus.metadata.player1Email}</div>
                    )}
                    <div className="text-gray-600">{paymentStatus.metadata.player1Phone}</div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Jugador 2:</h4>
                    <div>{paymentStatus.metadata.player2Name}</div>
                    {paymentStatus.metadata.player2Email && (
                      <div className="text-gray-600">{paymentStatus.metadata.player2Email}</div>
                    )}
                    <div className="text-gray-600">{paymentStatus.metadata.player2Phone}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Status-specific messages and actions */}
            {isPaymentSuccessful && (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    🎉 <strong>¡Felicidades!</strong> Tu inscripción ha sido confirmada. 
                    Recibirás más información sobre el torneo por email y/o SMS.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Link href={`/tournament/${params.slug}`}>
                    <Button variant="outline">Ver Torneo</Button>
                  </Link>
                  <Link href="/">
                    <Button>Ir al Inicio</Button>
                  </Link>
                </div>
              </div>
            )}

            {isPending && (
              <div className="text-center space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    ⏳ Tu pago está siendo procesado. Te notificaremos una vez que se confirme.
                  </p>
                </div>
                <Button onClick={fetchPaymentStatus} variant="outline">
                  Verificar Estado
                </Button>
              </div>
            )}

            {(isExpired || (!isPaymentSuccessful && !isPending)) && (
              <div className="text-center space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">
                    {isExpired 
                      ? '⏰ El enlace de pago ha expirado. Puedes intentar registrarte nuevamente.'
                      : '❌ No pudimos procesar tu pago. Por favor intenta de nuevo.'
                    }
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Link href={`/tournament/${params.slug}/register`}>
                    <Button>Intentar Nuevamente</Button>
                  </Link>
                  <Link href={`/tournament/${params.slug}`}>
                    <Button variant="outline">Ver Torneo</Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Transaction ID */}
            <div className="text-center text-xs text-gray-500 border-t pt-4">
              ID de Transacción: {paymentStatus.id}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}