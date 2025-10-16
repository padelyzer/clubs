/**
 * Tournament Page Types
 * Extracted from page.tsx (4,198 lines)
 * Date: October 15, 2025
 */

export type ViewType = 'overview' | 'registrations' | 'schedule' | 'brackets' | 'capture' | 'tv'

export type TournamentData = {
  tournament: {
    id: string
    name: string
    startDate: string
    endDate: string
    status: 'active' | 'pending' | 'completed'
    club: {
      name: string
    }
  }
  categories: Category[]
  matches: {
    upcoming: Match[]
    inProgress: Match[]
    completed: Match[]
  }
  stats: TournamentStats
}

export type Category = {
  code: string
  name: string
  modality: 'masculine' | 'feminine' | 'mixed'
  teams: number
  totalMatches: number
  completedMatches: number
  status: 'active' | 'completed'
}

export type Match = {
  id: string
  team1Name: string
  team2Name: string
  team1Score: string | null
  team2Score: string | null
  team1Sets: number[] | null
  team2Sets: number[] | null
  round: string
  courtNumber: number | null
  status: 'pending' | 'in_progress' | 'completed'
  scheduledAt: string | null
  startTime: string | null
  winner: string | null
}

export type TournamentStats = {
  totalTeams: number
  totalMatches: number
  completedMatches: number
  pendingMatches: number
  inProgressMatches: number
  todayMatches: number
}

export type Registration = {
  id: string
  teamName: string
  player1Name: string
  player1Email: string
  player1Phone: string
  player2Name: string
  player2Email: string
  player2Phone: string
  category: string
  modality: 'M' | 'F' | 'X'
  paymentStatus: 'pending' | 'completed'
  confirmed: boolean
  checkedIn: boolean
}

export type TeamFormData = {
  teamName: string
  player1Name: string
  player1Email: string
  player1Phone: string
  player2Name: string
  player2Email: string
  player2Phone: string
  category: string
  modality: string
  paymentStatus: string
}
