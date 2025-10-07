'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode.js'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Printer, Share2 } from 'lucide-react'

interface TournamentQRProps {
  tournamentId: string
  tournamentName: string
  clubName: string
  startDate: string
}

export function TournamentQR({ tournamentId, tournamentName, clubName, startDate }: TournamentQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    generateQR()
  }, [tournamentId])

  const generateQR = () => {
    if (!canvasRef.current) return

    const publicUrl = `${window.location.origin}/tournament/${tournamentId}`
    
    const qr = new QRCode({
      content: publicUrl,
      padding: 4,
      width: 256,
      height: 256,
      color: "#000000",
      background: "#ffffff",
      ecl: "M"
    })

    const svg = qr.svg()
    
    // Convert SVG to canvas
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Create image from SVG
    const img = new Image()
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    
    img.onload = () => {
      canvas.width = 256
      canvas.height = 256
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      
      // Convert canvas to data URL for download
      setQrDataUrl(canvas.toDataURL('image/png'))
    }
    
    img.src = url
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR del Torneo - ${tournamentName}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: white;
            }
            .container {
              text-align: center;
              padding: 40px;
              border: 2px solid #e5e7eb;
              border-radius: 16px;
              max-width: 400px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 8px;
              color: #111827;
            }
            .subtitle {
              color: #6b7280;
              margin-bottom: 24px;
              font-size: 14px;
            }
            .qr-container {
              background: white;
              padding: 24px;
              border-radius: 8px;
              display: inline-block;
              border: 1px solid #e5e7eb;
            }
            canvas {
              display: block;
            }
            .url {
              margin-top: 16px;
              padding: 8px 12px;
              background: #f3f4f6;
              border-radius: 6px;
              font-size: 12px;
              color: #374151;
              word-break: break-all;
            }
            @media print {
              body {
                min-height: unset;
              }
              .container {
                border: none;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${tournamentName}</h1>
            <div class="subtitle">${clubName} • ${new Date(startDate).toLocaleDateString('es-MX', { 
              day: 'numeric',
              month: 'long', 
              year: 'numeric' 
            })}</div>
            <div class="qr-container">
              <img src="${qrDataUrl}" width="256" height="256" />
            </div>
            <div class="url">
              ${window.location.origin}/tournament/${tournamentId}
            </div>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `torneo-${tournamentId}-qr.png`
    link.href = qrDataUrl
    link.click()
  }

  const handleShare = async () => {
    const publicUrl = `${window.location.origin}/tournament/${tournamentId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: tournamentName,
          text: `¡Inscríbete al torneo ${tournamentName}!`,
          url: publicUrl
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(publicUrl)
      alert('Enlace copiado al portapapeles')
    }
  }

  return (
    <Card className="p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{tournamentName}</h3>
        <p className="text-sm text-gray-600 mb-4">{clubName}</p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4 inline-block">
          <canvas ref={canvasRef} className="hidden" />
          {qrDataUrl && (
            <img src={qrDataUrl} width="256" height="256" alt="QR Code" />
          )}
        </div>
        
        <div className="text-xs text-gray-500 mb-4">
          Escanea para ver detalles e inscribirte
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>
    </Card>
  )
}