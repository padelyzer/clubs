import { prisma } from '@/lib/config/prisma'

export interface NotificationRecipient {
  phone?: string
  email?: string
  name?: string
}

export interface TournamentNotificationData {
  tournamentName: string
  matchTime?: string
  courtName?: string
  opponentName?: string
  roundName?: string
  result?: string
  nextMatchTime?: string
}

export enum TournamentNotificationType {
  MATCH_REMINDER = 'MATCH_REMINDER',
  MATCH_STARTING = 'MATCH_STARTING',
  RESULT_CONFIRMED = 'RESULT_CONFIRMED',
  RESULT_CONFLICT = 'RESULT_CONFLICT',
  ADVANCED_TO_NEXT_ROUND = 'ADVANCED_TO_NEXT_ROUND',
  TOURNAMENT_COMPLETED = 'TOURNAMENT_COMPLETED',
  MATCH_RESCHEDULED = 'MATCH_RESCHEDULED'
}

export class TournamentNotificationService {
  private static defaultTemplates = {
    [TournamentNotificationType.MATCH_REMINDER]: {
      title: 'Recordatorio de Partido',
      body: '🎾 ¡Tu partido en {{tournamentName}} contra {{opponentName}} es en {{matchTime}} en la cancha {{courtName}}!'
    },
    [TournamentNotificationType.MATCH_STARTING]: {
      title: 'Partido Comenzando',
      body: '⏰ ¡Tu partido contra {{opponentName}} comienza ahora en la cancha {{courtName}}!'
    },
    [TournamentNotificationType.RESULT_CONFIRMED]: {
      title: 'Resultado Confirmado',
      body: '✅ El resultado de tu partido contra {{opponentName}} ha sido confirmado: {{result}}'
    },
    [TournamentNotificationType.RESULT_CONFLICT]: {
      title: 'Conflicto en Resultado',
      body: '⚠️ Hay un conflicto en los resultados de tu partido contra {{opponentName}}. El organizador lo resolverá pronto.'
    },
    [TournamentNotificationType.ADVANCED_TO_NEXT_ROUND]: {
      title: '¡Avanzaste!',
      body: '🎉 ¡Felicidades! Has avanzado a {{roundName}} en {{tournamentName}}. Tu próximo partido es {{nextMatchTime}}'
    },
    [TournamentNotificationType.TOURNAMENT_COMPLETED]: {
      title: 'Torneo Completado',
      body: '🏆 El torneo {{tournamentName}} ha terminado. ¡Gracias por participar!'
    },
    [TournamentNotificationType.MATCH_RESCHEDULED]: {
      title: 'Partido Reprogramado',
      body: '📅 Tu partido contra {{opponentName}} ha sido reprogramado para {{matchTime}} en la cancha {{courtName}}'
    }
  }

  /**
   * Send notification to tournament participants
   */
  static async sendTournamentNotification(
    type: TournamentNotificationType,
    recipients: NotificationRecipient[],
    data: TournamentNotificationData,
    clubId: string
  ): Promise<void> {
    try {
      const template = this.defaultTemplates[type]
      if (!template) {
        console.error('Unknown tournament notification type:', type)
        return
      }

      // Replace template variables
      const message = this.replaceTemplateVariables(template.body, data)

      // Filter valid recipients (must have phone)
      const validRecipients = recipients.filter(r => r.phone && r.phone.trim() !== '')

      if (validRecipients.length === 0) {
        console.warn('No valid recipients for tournament notification')
        return
      }

      // Create notifications in database for tracking
      for (const recipient of validRecipients) {
        await prisma.notification.create({
          data: {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            clubId,
            type: 'tournament',
            title: template.title,
            message,
            recipient: recipient.phone!,
            recipientName: recipient.name,
            status: 'pending',
            scheduledFor: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              notificationType: type,
              tournamentData: data
            }
          }
        })
      }

      // Send WhatsApp messages
      await this.sendWhatsAppMessages(validRecipients, message, clubId)
      
    } catch (error) {
      console.error('Error sending tournament notification:', error)
    }
  }

  /**
   * Send match reminder notifications
   */
  static async sendMatchReminders(matchId: string, minutesBefore: number = 30): Promise<void> {
    try {
      const match = await prisma.tournamentMatch.findUnique({
        where: { id: matchId },
        include: {
          Tournament: {
            select: { name: true, clubId: true }
          },
          Court: {
            select: { name: true }
          }
        }
      })

      if (!match || !match.Tournament) {
        console.error('Match or tournament not found for reminder')
        return
      }

      // Get team contact information from registrations
      const registrations = await prisma.tournamentRegistration.findMany({
        where: {
          tournamentId: match.tournamentId,
          OR: [
            { teamName: match.team1Name },
            { teamName: match.team2Name }
          ]
        },
        select: {
          teamName: true,
          player1Name: true,
          player2Name: true,
          // Note: You'll need to add phone fields to registrations or link to players
          contactPhone: true, // Assuming this field exists
          contactEmail: true  // Assuming this field exists
        }
      })

      const recipients: NotificationRecipient[] = []
      
      for (const reg of registrations) {
        if (reg.contactPhone) {
          recipients.push({
            phone: reg.contactPhone,
            email: reg.contactEmail || undefined,
            name: reg.player1Name || reg.teamName
          })
        }
      }

      const data: TournamentNotificationData = {
        tournamentName: match.Tournament.name,
        matchTime: this.formatMatchTime(match.scheduledAt),
        courtName: match.Court?.name || `Cancha ${match.courtNumber}`,
        opponentName: match.team1Name === registrations[0]?.teamName ? match.team2Name : match.team1Name
      }

      await this.sendTournamentNotification(
        TournamentNotificationType.MATCH_REMINDER,
        recipients,
        data,
        match.Tournament.clubId
      )

    } catch (error) {
      console.error('Error sending match reminders:', error)
    }
  }

  /**
   * Send result confirmation notifications
   */
  static async sendResultNotifications(matchId: string, result: string): Promise<void> {
    try {
      const match = await prisma.tournamentMatch.findUnique({
        where: { id: matchId },
        include: {
          Tournament: {
            select: { name: true, clubId: true }
          }
        }
      })

      if (!match || !match.Tournament) {
        console.error('Match or tournament not found for result notification')
        return
      }

      // Get team contact information
      const recipients = await this.getMatchParticipants(matchId)

      const data: TournamentNotificationData = {
        tournamentName: match.Tournament.name,
        opponentName: match.team1Name, // This would need logic to determine opponent for each recipient
        result
      }

      await this.sendTournamentNotification(
        TournamentNotificationType.RESULT_CONFIRMED,
        recipients,
        data,
        match.Tournament.clubId
      )

    } catch (error) {
      console.error('Error sending result notifications:', error)
    }
  }

  /**
   * Send round advancement notifications
   */
  static async sendAdvancementNotifications(
    tournamentId: string,
    advancedPlayers: string[],
    nextRoundName: string
  ): Promise<void> {
    try {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        select: { name: true, clubId: true }
      })

      if (!tournament) {
        console.error('Tournament not found for advancement notification')
        return
      }

      // Get contact info for advanced players
      const recipients = await this.getPlayersContactInfo(tournamentId, advancedPlayers)

      const data: TournamentNotificationData = {
        tournamentName: tournament.name,
        roundName: nextRoundName,
        nextMatchTime: 'próximamente' // Could be enhanced with actual next match time
      }

      await this.sendTournamentNotification(
        TournamentNotificationType.ADVANCED_TO_NEXT_ROUND,
        recipients,
        data,
        tournament.clubId
      )

    } catch (error) {
      console.error('Error sending advancement notifications:', error)
    }
  }

  /**
   * Get match participants contact information
   */
  private static async getMatchParticipants(matchId: string): Promise<NotificationRecipient[]> {
    try {
      const match = await prisma.tournamentMatch.findUnique({
        where: { id: matchId },
        select: { tournamentId: true, team1Name: true, team2Name: true }
      })

      if (!match) return []

      const registrations = await prisma.tournamentRegistration.findMany({
        where: {
          tournamentId: match.tournamentId,
          OR: [
            { teamName: match.team1Name },
            { teamName: match.team2Name }
          ]
        },
        select: {
          player1Name: true,
          contactPhone: true,
          contactEmail: true
        }
      })

      return registrations
        .filter(reg => reg.contactPhone)
        .map(reg => ({
          phone: reg.contactPhone!,
          email: reg.contactEmail || undefined,
          name: reg.player1Name
        }))

    } catch (error) {
      console.error('Error getting match participants:', error)
      return []
    }
  }

  /**
   * Get contact info for specific players
   */
  private static async getPlayersContactInfo(
    tournamentId: string,
    playerNames: string[]
  ): Promise<NotificationRecipient[]> {
    try {
      const registrations = await prisma.tournamentRegistration.findMany({
        where: {
          tournamentId,
          OR: playerNames.map(name => ({
            OR: [
              { teamName: name },
              { player1Name: name },
              { player2Name: name }
            ]
          }))
        },
        select: {
          player1Name: true,
          contactPhone: true,
          contactEmail: true
        }
      })

      return registrations
        .filter(reg => reg.contactPhone)
        .map(reg => ({
          phone: reg.contactPhone!,
          email: reg.contactEmail || undefined,
          name: reg.player1Name
        }))

    } catch (error) {
      console.error('Error getting players contact info:', error)
      return []
    }
  }

  /**
   * Replace template variables in message
   */
  private static replaceTemplateVariables(template: string, data: TournamentNotificationData): string {
    let message = template

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
      }
    })

    // Remove any remaining unreplaced variables
    message = message.replace(/\{\{[^}]+\}\}/g, '')

    return message
  }

  /**
   * Send WhatsApp messages using existing service
   */
  private static async sendWhatsAppMessages(
    recipients: NotificationRecipient[],
    message: string,
    clubId: string
  ): Promise<void> {
    try {
      // This would integrate with your existing WhatsApp service
      // For now, just log the notifications that would be sent
      console.log(`Sending tournament notifications to ${recipients.length} recipients:`)
      recipients.forEach(recipient => {
        console.log(`- ${recipient.name} (${recipient.phone}): ${message}`)
      })

      // Example integration with existing WhatsApp API:
      // await fetch('/api/whatsapp/send-bulk', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     clubId,
      //     recipients: recipients.map(r => ({
      //       phone: r.phone,
      //       name: r.name,
      //       message
      //     }))
      //   })
      // })

    } catch (error) {
      console.error('Error sending WhatsApp messages:', error)
    }
  }

  /**
   * Format match time for notifications
   */
  private static formatMatchTime(scheduledAt: Date | null): string {
    if (!scheduledAt) return 'por confirmar'

    const date = new Date(scheduledAt)
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}