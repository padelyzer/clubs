'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trophy, Users, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface TournamentData {
  id: string
  name: string
  description: string
  registrationFee: number
  currency: string
  maxPlayers: number
  registeredPlayers: number
  startDate: string
  registrationEnd: string
  status: string
  club: {
    name: string
    stripeAccountId: string
  }
}

function CheckoutForm({ 
  clientSecret, 
  tournamentId,
  registrationId 
}: { 
  clientSecret: string
  tournamentId: string
  registrationId: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/tournament/${tournamentId}/register/success?registration_id=${registrationId}`,
      },
    })

    if (error) {
      setError(error.message || 'Error al procesar el pago')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isProcessing ? 'Procesando...' : 'Confirmar Pago'}
      </Button>
    </form>
  )
}

export default function TournamentRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const [tournament, setTournament] = useState<TournamentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1) // 1: Form, 2: Payment
  const [clientSecret, setClientSecret] = useState('')
  const [registrationId, setRegistrationId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    player1: {
      name: '',
      email: '',
      phone: ''
    },
    player2: {
      name: '',
      email: '',
      phone: ''
    },
    teamName: '',
    paymentMethod: 'PAYMENT_LINK'
  })
  
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    fetchTournament()
  }, [params.slug])

  const fetchTournament = async () => {
    try {
      const response = await fetch(`/api/tournaments/public/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setTournament(data.tournament)
        
        // Check if registration is open
        if (data.tournament.status !== 'REGISTRATION_OPEN') {
          alert('Las inscripciones no están abiertas para este torneo')
          router.push(`/tournament/${params.slug}`)
        }
      }
    } catch (error) {
      console.error('Error fetching tournament:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    // Player 1 validation
    if (!formData.player1.name) newErrors.player1Name = 'Nombre requerido'
    if (!formData.player1.phone) newErrors.player1Phone = 'Teléfono requerido'
    if (formData.player1.phone.length < 10) newErrors.player1Phone = 'Teléfono inválido'
    
    // Player 2 validation
    if (!formData.player2.name) newErrors.player2Name = 'Nombre requerido'
    if (!formData.player2.phone) newErrors.player2Phone = 'Teléfono requerido'
    if (formData.player2.phone.length < 10) newErrors.player2Phone = 'Teléfono inválido'
    
    // Email validation if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.player1.email && !emailRegex.test(formData.player1.email)) {
      newErrors.player1Email = 'Email inválido'
    }
    if (formData.player2.email && !emailRegex.test(formData.player2.email)) {
      newErrors.player2Email = 'Email inválido'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setSubmitting(true)
    
    try {
      // Handle payment link separately
      if (formData.paymentMethod === 'PAYMENT_LINK') {
        const response = await fetch(`/api/tournaments/${tournament?.id}/payment-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player1Name: formData.player1.name,
            player1Email: formData.player1.email,
            player1Phone: formData.player1.phone,
            player2Name: formData.player2.name,
            player2Email: formData.player2.email,
            player2Phone: formData.player2.phone,
            teamName: formData.teamName,
            expiresInMinutes: 1440 // 24 hours
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          // Redirect to payment link
          window.location.href = data.data.paymentLink
        } else {
          alert(data.error || 'Error al generar link de pago')
        }
        return
      }

      // Handle traditional registration for STRIPE and ONSITE
      const response = await fetch(`/api/tournaments/${tournament?.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (formData.paymentMethod === 'STRIPE' && data.paymentIntent) {
          // Move to payment step
          setClientSecret(data.paymentIntent.clientSecret)
          setRegistrationId(data.registration.id)
          setStep(2)
        } else {
          // Onsite payment - show success
          router.push(`/tournament/${params.slug}/register/success?onsite=true`)
        }
      } else {
        alert(data.error || 'Error al procesar inscripción')
      }
    } catch (error) {
      console.error('Error submitting registration:', error)
      alert('Error al procesar inscripción')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Cargando formulario...</div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Torneo no encontrado</h1>
        </div>
      </div>
    )
  }

  const spotsLeft = tournament.maxPlayers - tournament.registeredPlayers

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inscripción al Torneo
          </h1>
          <p className="text-lg text-gray-600">{tournament.name}</p>
          <p className="text-sm text-gray-500 mt-2">
            {tournament.club.name} • {format(new Date(tournament.startDate), "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
              1
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
              2
            </div>
          </div>
        </div>

        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Pareja</CardTitle>
              <CardDescription>
                Inscribe a tu pareja para el torneo. Quedan {spotsLeft} lugares disponibles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Team Name */}
                <div>
                  <Label htmlFor="teamName">Nombre del Equipo (opcional)</Label>
                  <Input
                    id="teamName"
                    value={formData.teamName}
                    onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                    placeholder="Ej: Los Campeones"
                  />
                </div>

                {/* Player 1 */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Jugador 1
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="player1Name">Nombre *</Label>
                      <Input
                        id="player1Name"
                        value={formData.player1.name}
                        onChange={(e) => setFormData({
                          ...formData, 
                          player1: {...formData.player1, name: e.target.value}
                        })}
                        className={errors.player1Name ? 'border-red-500' : ''}
                      />
                      {errors.player1Name && (
                        <p className="text-red-500 text-sm mt-1">{errors.player1Name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="player1Email">Email</Label>
                      <Input
                        id="player1Email"
                        type="email"
                        value={formData.player1.email}
                        onChange={(e) => setFormData({
                          ...formData, 
                          player1: {...formData.player1, email: e.target.value}
                        })}
                        className={errors.player1Email ? 'border-red-500' : ''}
                      />
                      {errors.player1Email && (
                        <p className="text-red-500 text-sm mt-1">{errors.player1Email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="player1Phone">Teléfono *</Label>
                      <Input
                        id="player1Phone"
                        value={formData.player1.phone}
                        onChange={(e) => setFormData({
                          ...formData, 
                          player1: {...formData.player1, phone: e.target.value}
                        })}
                        className={errors.player1Phone ? 'border-red-500' : ''}
                      />
                      {errors.player1Phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.player1Phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Player 2 */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Jugador 2
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="player2Name">Nombre *</Label>
                      <Input
                        id="player2Name"
                        value={formData.player2.name}
                        onChange={(e) => setFormData({
                          ...formData, 
                          player2: {...formData.player2, name: e.target.value}
                        })}
                        className={errors.player2Name ? 'border-red-500' : ''}
                      />
                      {errors.player2Name && (
                        <p className="text-red-500 text-sm mt-1">{errors.player2Name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="player2Email">Email</Label>
                      <Input
                        id="player2Email"
                        type="email"
                        value={formData.player2.email}
                        onChange={(e) => setFormData({
                          ...formData, 
                          player2: {...formData.player2, email: e.target.value}
                        })}
                        className={errors.player2Email ? 'border-red-500' : ''}
                      />
                      {errors.player2Email && (
                        <p className="text-red-500 text-sm mt-1">{errors.player2Email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="player2Phone">Teléfono *</Label>
                      <Input
                        id="player2Phone"
                        value={formData.player2.phone}
                        onChange={(e) => setFormData({
                          ...formData, 
                          player2: {...formData.player2, phone: e.target.value}
                        })}
                        className={errors.player2Phone ? 'border-red-500' : ''}
                      />
                      {errors.player2Phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.player2Phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Método de Pago</h3>
                  <RadioGroup 
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="PAYMENT_LINK" id="payment_link" />
                      <Label htmlFor="payment_link" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              🔗 Link de Pago
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Recomendado
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">Te enviaremos un enlace seguro para pagar</p>
                          </div>
                          <div className="text-lg font-semibold">
                            ${(tournament.registrationFee / 100).toFixed(2)} {tournament.currency}
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="STRIPE" id="stripe" />
                      <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Pagar con Tarjeta (Directo)
                            </div>
                            <p className="text-sm text-gray-500">Pago inmediato en esta página</p>
                          </div>
                          <div className="text-lg font-semibold">
                            ${(tournament.registrationFee / 100).toFixed(2)} {tournament.currency}
                          </div>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="ONSITE" id="onsite" />
                      <Label htmlFor="onsite" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Pagar en el Club</div>
                            <p className="text-sm text-gray-500">Paga directamente en las instalaciones</p>
                          </div>
                          <div className="text-lg font-semibold">
                            ${(tournament.registrationFee / 100).toFixed(2)} {tournament.currency}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {submitting ? 'Procesando...' : 'Continuar con la Inscripción'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Confirmar Pago</CardTitle>
              <CardDescription>
                Total a pagar: ${(tournament.registrationFee / 100).toFixed(2)} {tournament.currency}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm 
                    clientSecret={clientSecret}
                    tournamentId={tournament.id}
                    registrationId={registrationId}
                  />
                </Elements>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}