import { NextResponse } from 'next/server'
import { QRCodeService } from '@/lib/services/qr-code-service'

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Generate QR code for booking check-in
    const qrCode = await QRCodeService.generateBookingQR(bookingId)

    return NextResponse.json({
      success: true,
      qrCode,
      bookingId,
      type: 'check-in'
    })

  } catch (error) {
    console.error('Error generating booking QR:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}