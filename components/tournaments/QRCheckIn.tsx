'use client'

import React, { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { QrCode, Check, X, Camera, UserCheck, Download, Share2, Smartphone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNotify } from '@/hooks/use-notify'

interface Registration {
  id: string
  player1Name: string
  player2Name: string
  player1Email: string
  player2Email: string
  checkedIn: boolean
  checkedInAt?: string
  qrCode?: string
}

interface QRCheckInProps {
  tournamentId: string
  registrations: Registration[]
  onCheckIn: (registrationId: string) => Promise<void>
}

export function QRCheckIn({ tournamentId, registrations, onCheckIn }: QRCheckInProps) {
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({})
  const [scanning, setScanning] = useState(false)
  const [checkInCode, setCheckInCode] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { notify } = useNotify()

  useEffect(() => {
    generateQRCodes()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [registrations])

  const generateQRCodes = async () => {
    const codes: Record<string, string> = {}
    
    for (const reg of registrations) {
      const checkInData = {
        tournamentId,
        registrationId: reg.id,
        timestamp: Date.now()
      }
      
      try {
        const qr = await QRCode.toDataURL(JSON.stringify(checkInData), {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        codes[reg.id] = qr
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }
    
    setQrCodes(codes)
  }

  const handleScanQR = async () => {
    setScanning(true)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      notify.error('No se pudo acceder a la cámara')
      setScanning(false)
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setScanning(false)
  }

  const handleManualCheckIn = async () => {
    if (!checkInCode) return
    
    try {
      const data = JSON.parse(checkInCode)
      if (data.tournamentId === tournamentId && data.registrationId) {
        await onCheckIn(data.registrationId)
        notify.success('El jugador ha sido registrado correctamente')
        setCheckInCode('')
      }
    } catch (error) {
      notify.error('El código QR no es válido para este torneo')
    }
  }

  const downloadQR = (registrationId: string, playerNames: string) => {
    const link = document.createElement('a')
    link.download = `qr-checkin-${playerNames.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = qrCodes[registrationId]
    link.click()
  }

  const shareQR = async (registration: Registration) => {
    const qrBlob = await fetch(qrCodes[registration.id]).then(r => r.blob())
    const file = new File([qrBlob], 'qr-checkin.png', { type: 'image/png' })
    
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'QR Check-in Torneo',
          text: `QR para check-in de ${registration.player1Name} y ${registration.player2Name}`,
          files: [file]
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copiar enlace
      const checkInUrl = `${window.location.origin}/checkin/${tournamentId}/${registration.id}`
      await navigator.clipboard.writeText(checkInUrl)
      notify.success('El enlace de check-in ha sido copiado al portapapeles')
    }
  }

  const sendQRByWhatsApp = (registration: Registration) => {
    const message = encodeURIComponent(
      `🎾 *Check-in para el Torneo*\n\n` +
      `Jugadores: ${registration.player1Name} y ${registration.player2Name}\n\n` +
      `Por favor, muestra este código QR en la entrada del torneo.\n\n` +
      `También puedes hacer check-in en: ${window.location.origin}/checkin/${tournamentId}/${registration.id}`
    )
    
    const whatsappUrl = `https://wa.me/?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const checkedInCount = registrations.filter(r => r.checkedIn).length
  const pendingCount = registrations.filter(r => !r.checkedIn).length

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Inscritos</p>
              <p className="text-2xl font-bold">{registrations.length}</p>
            </div>
            <QrCode className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Check-in Completado</p>
              <p className="text-2xl font-bold text-green-600">{checkedInCount}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <X className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Scanner Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Escáner QR</h3>
          <Button
            onClick={scanning ? stopScanning : handleScanQR}
            variant={scanning ? 'destructive' : 'default'}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            {scanning ? 'Detener Escáner' : 'Iniciar Escáner'}
          </Button>
        </div>

        {scanning && (
          <div className="relative">
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
              style={{ maxHeight: '400px' }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white rounded-lg opacity-50"></div>
            </div>
          </div>
        )}

        {/* Manual Input */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Código Manual (para pruebas)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value)}
              placeholder="Pegar código QR aquí"
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <Button onClick={handleManualCheckIn}>
              Verificar
            </Button>
          </div>
        </div>
      </Card>

      {/* Registrations List with QR Codes */}
      <Card className="overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <h3 className="text-lg font-semibold">Códigos QR de Check-in</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Comparte estos códigos con los jugadores para un check-in rápido
          </p>
        </div>

        <div className="divide-y">
          {registrations.map((registration) => (
            <div key={registration.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">
                      {registration.player1Name} & {registration.player2Name}
                    </h4>
                    {registration.checkedIn ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Check-in completado
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                  
                  {registration.checkedInAt && (
                    <p className="text-sm text-muted-foreground">
                      Check-in: {new Date(registration.checkedInAt).toLocaleString('es')}
                    </p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRegistration(registration)}
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      Ver QR
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadQR(registration.id, `${registration.player1Name}-${registration.player2Name}`)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareQR(registration)}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Compartir
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendQRByWhatsApp(registration)}
                    >
                      <Smartphone className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>

                    {!registration.checkedIn && (
                      <Button
                        size="sm"
                        onClick={() => onCheckIn(registration.id)}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Check-in Manual
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* QR Modal */}
      {selectedRegistration && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRegistration(null)}
        >
          <Card className="max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                QR Check-in
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedRegistration.player1Name} & {selectedRegistration.player2Name}
              </p>
              
              {qrCodes[selectedRegistration.id] && (
                <img 
                  src={qrCodes[selectedRegistration.id]} 
                  alt="QR Code"
                  className="mx-auto mb-4"
                />
              )}
              
              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 mb-4">
                <p>Este código contiene:</p>
                <p className="font-mono mt-1">
                  {JSON.stringify({
                    tournamentId,
                    registrationId: selectedRegistration.id,
                    timestamp: Date.now()
                  }, null, 2)}
                </p>
              </div>
              
              <Button 
                onClick={() => setSelectedRegistration(null)}
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}