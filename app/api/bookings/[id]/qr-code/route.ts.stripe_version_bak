import { NextRequest, NextResponse } from 'next/server'
import { requireStaffAuth } from '@/lib/auth/actions'
import { QRCodeService } from '@/lib/services/qr-code-service'

interface Params {
  params: Promise<{ id: string }>
}

// Generate QR code for booking
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await requireStaffAuth()
    const paramData = await params
    const { id: bookingId } = paramData

    const qrCode = await QRCodeService.generateBookingQR(bookingId)

    return NextResponse.json({
      success: true,
      qrCode,
      bookingId
    })

  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Error generating QR code' },
      { status: 500 }
    )
  }
}

// Generate check-in QR code
export async function POST(request: NextRequest, { params }: Params) {
  try {
    await requireStaffAuth()
    const paramData = await params
    const { id: bookingId } = paramData
    const body = await request.json()
    const { type = 'booking' } = body

    let qrCode: string

    switch (type) {
      case 'check-in':
        qrCode = await QRCodeService.generateCheckInQR(bookingId)
        break
      case 'payment':
        // For payment, we need split payment ID
        const { splitPaymentId } = body
        if (!splitPaymentId) {
          return NextResponse.json(
            { error: 'Split payment ID required for payment QR' },
            { status: 400 }
          )
        }
        qrCode = await QRCodeService.generatePaymentQR(splitPaymentId)
        break
      default:
        qrCode = await QRCodeService.generateBookingQR(bookingId)
    }

    return NextResponse.json({
      success: true,
      qrCode,
      type,
      bookingId
    })

  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Error generating QR code' },
      { status: 500 }
    )
  }
}