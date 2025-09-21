import { NextResponse } from 'next/server'
import { QRCodeService } from '@/lib/services/qr-code-service'

export async function POST(request: Request) {
  try {
    const { phoneNumber, message } = await request.json()

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Generate QR code with WhatsApp link
    const qrCode = await QRCodeService.generateWhatsAppQR(phoneNumber, message)

    // Also return the WhatsApp link for testing
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '')
    const formattedPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone
    const encodedMessage = encodeURIComponent(message)
    const whatsappLink = `https://wa.me/${formattedPhone}?text=${encodedMessage}`

    return NextResponse.json({
      success: true,
      qrCode,
      whatsappLink,
      destination: `+${formattedPhone}`,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
    })

  } catch (error) {
    console.error('Error generating WhatsApp QR:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}