import jsPDF from 'jspdf'
import QRCode from 'qrcode'

interface MatchPDFData {
  tournamentName: string
  stage: string
  matchNumber: number
  team1Name: string
  team2Name: string
  courtName: string
  startTime?: string
  matchDate?: string
  qrUrl: string
}

export async function generateMatchQRPDF(data: MatchPDFData): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Colors
  const primaryGreen = '#66E7AA'
  const darkGreen = '#182A01'
  const yellow = '#A4DF4E'

  // Page dimensions
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20

  // Header - Tournament Name
  pdf.setFillColor(102, 231, 170) // Primary green
  pdf.rect(0, 0, pageWidth, 40, 'F')
  
  pdf.setTextColor(24, 42, 1) // Dark green
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  const tournamentText = data.tournamentName.toUpperCase()
  const tournamentTextWidth = pdf.getTextWidth(tournamentText)
  pdf.text(tournamentText, (pageWidth - tournamentTextWidth) / 2, 25)

  // Stage/Round
  pdf.setFillColor(164, 223, 78) // Yellow accent
  pdf.rect(margin, 50, pageWidth - (margin * 2), 15, 'F')
  
  pdf.setTextColor(24, 42, 1)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  const stageText = data.stage.toUpperCase()
  const stageTextWidth = pdf.getTextWidth(stageText)
  pdf.text(stageText, (pageWidth - stageTextWidth) / 2, 60)

  // Match Details Section
  let yPosition = 80

  // Match Number
  pdf.setTextColor(75, 85, 99) // Gray
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.text('PARTIDO #', margin, yPosition)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(24, 42, 1)
  pdf.setFontSize(20)
  pdf.text(data.matchNumber.toString(), margin + 30, yPosition)

  // Court and Time
  yPosition += 15
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(75, 85, 99)
  
  if (data.courtName) {
    pdf.text(`Cancha: ${data.courtName}`, margin, yPosition)
  }
  
  if (data.startTime || data.matchDate) {
    const dateTimeText = `${data.matchDate || ''} ${data.startTime || ''}`.trim()
    pdf.text(dateTimeText, pageWidth - margin - pdf.getTextWidth(dateTimeText), yPosition)
  }

  // Teams Section
  yPosition += 25
  
  // VS Box
  pdf.setFillColor(245, 245, 245)
  pdf.rect(margin, yPosition - 10, pageWidth - (margin * 2), 50, 'F')
  
  // Team 1
  pdf.setTextColor(24, 42, 1)
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  const team1Width = pdf.getTextWidth(data.team1Name)
  pdf.text(data.team1Name, (pageWidth / 2) - team1Width - 10, yPosition + 10)
  
  // VS
  pdf.setTextColor(146, 64, 14) // Brown
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.text('VS', pageWidth / 2 - pdf.getTextWidth('VS') / 2, yPosition + 10)
  
  // Team 2
  pdf.setTextColor(24, 42, 1)
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text(data.team2Name, (pageWidth / 2) + 10, yPosition + 10)

  // QR Code Section
  yPosition += 60
  
  // Generate QR code as data URL
  try {
    const qrDataUrl = await QRCode.toDataURL(data.qrUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    // QR Code size and position
    const qrSize = 100
    const qrX = (pageWidth - qrSize) / 2
    
    // Add QR code to PDF
    pdf.addImage(qrDataUrl, 'PNG', qrX, yPosition, qrSize, qrSize)
    
    yPosition += qrSize + 10
  } catch (error) {
    console.error('Error generating QR code:', error)
  }

  // Instructions
  pdf.setFillColor(254, 243, 199) // Light yellow
  pdf.rect(margin, yPosition, pageWidth - (margin * 2), 40, 'F')
  
  pdf.setTextColor(146, 64, 14) // Brown
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('INSTRUCCIONES PARA JUGADORES:', margin + 5, yPosition + 10)
  
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  const instructions = [
    '1. Escanea el código QR con tu celular',
    '2. Selecciona tu equipo/pareja',
    '3. Ingresa el resultado del partido',
    '4. Ambos equipos deben capturar el resultado para validación'
  ]
  
  instructions.forEach((instruction, index) => {
    pdf.text(instruction, margin + 5, yPosition + 18 + (index * 5))
  })

  // Footer
  yPosition = pageHeight - 30
  pdf.setDrawColor(229, 231, 235) // Light gray
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)
  
  yPosition += 10
  pdf.setTextColor(156, 163, 175) // Gray
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'italic')
  const footerText = 'Sistema de Captura de Resultados - Padelyzer'
  const footerWidth = pdf.getTextWidth(footerText)
  pdf.text(footerText, (pageWidth - footerWidth) / 2, yPosition)
  
  // Important notice
  yPosition += 5
  pdf.setTextColor(220, 38, 38) // Red
  pdf.setFont('helvetica', 'bold')
  const noticeText = 'IMPORTANTE: Coloque este código en la cancha correspondiente'
  const noticeWidth = pdf.getTextWidth(noticeText)
  pdf.text(noticeText, (pageWidth - noticeWidth) / 2, yPosition)

  // Download the PDF
  const fileName = `partido_${data.matchNumber}_${data.team1Name.replace(/\s+/g, '_')}_vs_${data.team2Name.replace(/\s+/g, '_')}.pdf`
  pdf.save(fileName)
}

// Alternative function to get PDF as blob (for preview or upload)
export async function generateMatchQRPDFBlob(data: MatchPDFData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // ... (same PDF generation code as above, but instead of pdf.save())
  
  return pdf.output('blob')
}