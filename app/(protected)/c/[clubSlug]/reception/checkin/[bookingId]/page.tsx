'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, CreditCard, DollarSign, QrCode } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface BookingDetails {
  id: string
  bookingCode: string
  date: string
  startTime: string
  endTime: string
  duration: number
  status: string
  paymentStatus: string
  price: number
  court: {
    id: string
    name: string
    club: {
      id: string
      name: string
    }
  }
  customer: {
    name: string
    email: string
    phone: string
  }
  notes?: string
}

export default function CheckInPage() {
  const params = useParams()
  const router = useRouter()
  const { bookingId } = params
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [paymentReceived, setPaymentReceived] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`)
      if (!response.ok) {
        throw new Error('Error loading booking')
      }
      
      const data = await response.json()
      setBooking(data)
      
      // If already checked in, redirect back
      if (data.status === 'checked_in') {
        toast({
          title: 'Ya registrado',
          description: 'Este cliente ya hizo check-in',
          variant: 'default'
        })
        router.push(`/c/${params.clubSlug}/reception`)
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar la reserva',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/mobile/bookings/${bookingId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          paymentReceived,
          paymentMethod,
          amount: booking?.price,
          notes
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al hacer check-in')
      }
      
      toast({
        title: 'Check-in exitoso',
        description: paymentReceived 
          ? 'Cliente registrado y pago confirmado' 
          : 'Cliente registrado, pago pendiente'
      })
      
      router.push(`/c/${params.clubSlug}/reception`)
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!booking) {
    return (
      <Alert>
        <AlertDescription>
          No se encontró la reserva
        </AlertDescription>
      </Alert>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price / 100)
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Check-in de Reserva
          </CardTitle>
          <CardDescription>
            Código: {booking.bookingCode}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Detalles de la Reserva</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Cliente</Label>
                <p className="font-medium">{booking.customer.name}</p>
                {booking.customer.phone && (
                  <p className="text-muted-foreground">{booking.customer.phone}</p>
                )}
              </div>
              
              <div>
                <Label className="text-muted-foreground">Cancha</Label>
                <p className="font-medium">{booking.court.name}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Fecha</Label>
                <p className="font-medium">
                  {format(new Date(booking.date), "d 'de' MMMM", { locale: es })}
                </p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Horario</Label>
                <p className="font-medium">
                  {booking.startTime} - {booking.endTime} ({booking.duration} min)
                </p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Monto</Label>
                <p className="font-medium text-lg">{formatPrice(booking.price)}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Estado</Label>
                <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                  {booking.paymentStatus === 'paid' ? 'Pagado' : 'Pago pendiente'}
                </Badge>
              </div>
            </div>
            
            {booking.notes && (
              <div className="bg-muted p-3 rounded text-sm">
                <Label className="text-muted-foreground">Notas de la reserva</Label>
                <p>{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Payment Form */}
          {booking.paymentStatus !== 'paid' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-sm text-muted-foreground">Información de Pago</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="paymentReceived"
                    checked={paymentReceived}
                    onChange={(e) => setPaymentReceived(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="paymentReceived" className="cursor-pointer">
                    Pago recibido
                  </Label>
                </div>
                
                {paymentReceived && (
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Método de pago</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger id="paymentMethod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <span className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Efectivo
                          </span>
                        </SelectItem>
                        <SelectItem value="card">
                          <span className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Tarjeta
                          </span>
                        </SelectItem>
                        <SelectItem value="transfer">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información adicional del check-in..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button 
              onClick={handleCheckIn}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Check-in
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/c/${params.clubSlug}/reception`)}
              disabled={submitting}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}