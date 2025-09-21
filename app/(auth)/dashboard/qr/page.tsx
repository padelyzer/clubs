'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QrCode, MessageSquare, CreditCard, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function QRGeneratorPage() {
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrType, setQrType] = useState<'whatsapp' | 'payment' | 'checkin'>('whatsapp')
  
  // WhatsApp fields
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  
  // Booking fields
  const [bookingId, setBookingId] = useState('')

  const generateQR = async () => {
    setLoading(true)
    try {
      let response
      
      if (qrType === 'whatsapp') {
        if (!phoneNumber || !message) {
          toast.error('Por favor completa todos los campos')
          return
        }
        
        response = await fetch('/api/qr/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber, message })
        })
      } else if (qrType === 'checkin') {
        if (!bookingId) {
          toast.error('Por favor ingresa el ID de la reserva')
          return
        }
        
        response = await fetch('/api/qr/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId })
        })
      }
      
      if (response && response.ok) {
        const data = await response.json()
        setQrCode(data.qrCode)
        toast.success('QR generado exitosamente')
      } else {
        toast.error('Error generando QR')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error generando QR')
    } finally {
      setLoading(false)
    }
  }

  const testData = () => {
    if (qrType === 'whatsapp') {
      setPhoneNumber('2213577517')
      setMessage('¡Hola! Tu reserva en Club Padel Puebla ha sido confirmada para el 27/08 a las 19:00. ¡Te esperamos! 🎾')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Generador de Códigos QR</h1>
        <p className="text-muted-foreground">
          Genera códigos QR para WhatsApp, pagos y check-in
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del QR</CardTitle>
            <CardDescription>
              Selecciona el tipo de QR y completa los datos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Type Selection */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={qrType === 'whatsapp' ? 'default' : 'outline'}
                onClick={() => setQrType('whatsapp')}
                className="w-full"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant={qrType === 'payment' ? 'default' : 'outline'}
                onClick={() => setQrType('payment')}
                className="w-full"
                disabled
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Pago
              </Button>
              <Button
                variant={qrType === 'checkin' ? 'default' : 'outline'}
                onClick={() => setQrType('checkin')}
                className="w-full"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Check-in
              </Button>
            </div>

            {/* WhatsApp Fields */}
            {qrType === 'whatsapp' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Número de WhatsApp del Cliente</Label>
                  <Input
                    id="phone"
                    placeholder="Ej: 2213577517"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Sin espacios ni caracteres especiales
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Escribe el mensaje que el club enviará al cliente..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  variant="outline" 
                  onClick={testData}
                  className="w-full"
                >
                  Usar datos de prueba
                </Button>
              </>
            )}

            {/* Check-in Fields */}
            {qrType === 'checkin' && (
              <div className="space-y-2">
                <Label htmlFor="bookingId">ID de Reserva</Label>
                <Input
                  id="bookingId"
                  placeholder="Ej: cmemgh2wt0001r4bgzh6yudow"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Ingresa el ID de la reserva para generar QR de check-in
                </p>
              </div>
            )}

            <Button 
              onClick={generateQR} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>Generando...</>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Generar QR
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* QR Display */}
        <Card>
          <CardHeader>
            <CardTitle>Código QR Generado</CardTitle>
            <CardDescription>
              Escanea este código con tu dispositivo móvil
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
            {qrCode ? (
              <div className="space-y-4 text-center">
                <img 
                  src={qrCode} 
                  alt="QR Code" 
                  className="border rounded-lg shadow-lg"
                />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {qrType === 'whatsapp' && 'Este QR abrirá WhatsApp con el cliente como destinatario'}
                    {qrType === 'checkin' && 'Este QR permite el check-in de la reserva'}
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.download = `qr-${qrType}-${Date.now()}.png`
                      link.href = qrCode
                      link.click()
                    }}
                  >
                    Descargar QR
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <QrCode className="h-24 w-24 mx-auto mb-4 opacity-20" />
                <p>El código QR aparecerá aquí</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>QR de WhatsApp:</strong>
            <p className="text-sm text-muted-foreground">
              Genera un QR que al escanearlo abre WhatsApp con el número del cliente como destinatario 
              y un mensaje pre-escrito desde la perspectiva del club.
            </p>
          </div>
          <div>
            <strong>QR de Check-in:</strong>
            <p className="text-sm text-muted-foreground">
              Genera un QR para que los clientes puedan hacer check-in al llegar al club. 
              El QR contiene información de la reserva.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}