import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppService } from '@/lib/services/whatsapp-service'

interface BulkRecipient {
  phone: string
  templateName: string
  templateData: Record<string, string>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipients }: { recipients: BulkRecipient[] } = body

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid recipients array' },
        { status: 400 }
      )
    }

    // Validate recipient limit (prevent spam)
    if (recipients.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 recipients allowed per bulk send' },
        { status: 400 }
      )
    }

    // Validate each recipient
    for (const recipient of recipients) {
      if (!recipient.phone || !recipient.templateName) {
        return NextResponse.json(
          { error: 'Each recipient must have phone and templateName' },
          { status: 400 }
        )
      }

      // Validate phone number format
      if (!recipient.phone.match(/^\+?[1-9]\d{1,14}$/)) {
        return NextResponse.json(
          { error: `Invalid phone number format: ${recipient.phone}` },
          { status: 400 }
        )
      }
    }

    // Send bulk messages
    const result = await WhatsAppService.sendBulkMessages(recipients)

    // Calculate statistics
    const stats = {
      total: result.results.length,
      successful: result.results.filter(r => r.result.success).length,
      failed: result.results.filter(r => !r.result.success).length
    }

    return NextResponse.json({
      success: true,
      stats,
      results: result.results
    })

  } catch (error: any) {
    console.error('WhatsApp bulk send API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}