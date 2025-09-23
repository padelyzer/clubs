'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, UserPlus, CreditCard, DollarSign } from 'lucide-react'
import { useClub } from '@/hooks/useClub'
import { toast } from '@/components/ui/use-toast'

export default function WalkInPage() {
  const params = useParams()
  const router = useRouter()
  const { club, courts } = useClub()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    courtId: '',
    startTime: '',
    duration: 90,
    amount: 800,
    paymentMethod: 'cash',
    notes: ''
  })

  // Generate time slots for the next 4 hours
  const generateTimeSlots = () => {
    const slots = []
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinutes = now.getMinutes()
    
    // Round to next 30 min slot
    let nextHour = currentHour
    let nextMinutes = currentMinutes < 30 ? 30 : 0
    if (currentMinutes >= 30) nextHour++
    
    for (let i = 0; i < 8; i++) {
      const hour = nextHour + Math.floor(i * 0.5)
      const minutes = i % 2 === 0 ? nextMinutes : (nextMinutes + 30) % 60
      
      if (hour < 22) { // Club closes at 22:00
        const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    
    return slots
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!club) return
    
    // Validate form
    if (!formData.customerName || !formData.courtId || !formData.startTime || !formData.amount) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive'
      })
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/clubs/${club.id}/walk-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: formData.amount * 100 // Convert to cents
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar walk-in')
      }
      
      toast({
        title: 'Walk-in registrado',
        description: `${formData.customerName} - ${formData.startTime} - $${formData.amount} MXN`
      })
      
      // Redirect to reception page
      router.push(`/c/${params.clubSlug}/reception`)
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const timeSlots = generateTimeSlots()

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Registrar Walk-in
          </CardTitle>
          <CardDescription>
            Registra un cliente que llega sin reserva previa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Información del Cliente</h3>
              
              <div className="space-y-2">
                <Label htmlFor="customerName">Nombre *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="juan@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Teléfono</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="+52 222 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* Court and Time */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Cancha y Horario</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="court">Cancha *</Label>
                  <Select 
                    value={formData.courtId} 
                    onValueChange={(value) => setFormData({ ...formData, courtId: value })}
                  >
                    <SelectTrigger id="court">
                      <SelectValue placeholder="Selecciona una cancha" />
                    </SelectTrigger>
                    <SelectContent>
                      {courts.map((court) => (
                        <SelectItem key={court.id} value={court.id}>
                          {court.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startTime">Hora de inicio *</Label>
                  <Select 
                    value={formData.startTime} 
                    onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                  >
                    <SelectTrigger id="startTime">
                      <SelectValue placeholder="Selecciona hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duración</Label>
                <Select 
                  value={formData.duration.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
                >
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                    <SelectItem value="120">120 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Información de Pago</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto (MXN) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                      className="pl-10"
                      required
                      min="0"
                      step="50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de pago *</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Información adicional..."
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Walk-in'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/c/${params.clubSlug}/reception`)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}