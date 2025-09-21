import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/modules/shared/auth'
import { ResponseBuilder } from '@/lib/modules/shared/response'
import { TournamentNotificationService, TournamentNotificationType } from '@/lib/services/tournament-notification-service'

// POST: Send tournament notifications
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await AuthService.requireClubStaff()
    const { id } = await params
    const body = await req.json()
    
    const { 
      type, 
      recipients, 
      data 
    } = body

    if (!type || !recipients || !Array.isArray(recipients)) {
      return ResponseBuilder.badRequest('Missing required fields: type, recipients')
    }

    // Validate notification type
    if (!Object.values(TournamentNotificationType).includes(type)) {
      return ResponseBuilder.badRequest('Invalid notification type')
    }

    await TournamentNotificationService.sendTournamentNotification(
      type,
      recipients,
      data,
      session.clubId!
    )

    return ResponseBuilder.success({
      message: 'Notifications sent successfully',
      recipientCount: recipients.length
    })
    
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return ResponseBuilder.serverError(error)
  }
}

// POST: Send match reminders
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await AuthService.requireClubStaff()
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const matchId = searchParams.get('matchId')
    
    if (action === 'send_reminders' && matchId) {
      await TournamentNotificationService.sendMatchReminders(matchId)
      
      return ResponseBuilder.success({
        message: 'Match reminders sent successfully'
      })
    }

    return ResponseBuilder.success({
      message: 'Tournament notifications API ready',
      availableActions: ['send_reminders']
    })
    
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return ResponseBuilder.serverError(error)
  }
}