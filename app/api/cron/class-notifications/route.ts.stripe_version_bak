import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// This endpoint can be called by a cron job service (like Vercel Cron or external service)
// to send daily class reminders
export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized (you can use a secret token)
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Call the notifications API to send reminders
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${headersList.get('host')}`
    
    // Send class reminders
    const reminderResponse = await fetch(`${baseUrl}/api/classes/notifications?type=reminder`, {
      headers: {
        'Cookie': headersList.get('cookie') || ''
      }
    })
    
    const reminderData = await reminderResponse.json()
    
    // Send payment reminders
    const paymentResponse = await fetch(`${baseUrl}/api/classes/notifications?type=pending-payments`, {
      headers: {
        'Cookie': headersList.get('cookie') || ''
      }
    })
    
    const paymentData = await paymentResponse.json()
    
    return NextResponse.json({
      success: true,
      reminders: reminderData,
      paymentReminders: paymentData,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { success: false, error: 'Error running cron job' },
      { status: 500 }
    )
  }
}

// For Vercel Cron Jobs configuration, add this to vercel.json:
/*
{
  "crons": [{
    "path": "/api/cron/class-notifications",
    "schedule": "0 10 * * *"  // Run daily at 10 AM
  }]
}
*/