/**
 * Bracket Generator Service
 * Servicio para generar brackets de eliminación simple automáticamente
 */

import { prisma } from '@/lib/config/prisma'
import { v4 as uuidv4 } from 'uuid'

export type SeedingMethod = 'random' | 'ranked' | 'serpentine'
export type BracketType = 'single_elimination' | 'double_elimination'

interface Team {
  teamName: string
  player1Name: string
  player2Name: string
  category: string
  modality: string
  seed?: number
}

interface GenerateBracketsParams {
  tournamentId: string
  categories?: string[] // Si no se especifica, genera para todas
  seedingMethod?: SeedingMethod
  bracketType?: BracketType
}

interface BracketGenerationResult {
  success: boolean
  message: string
  rounds: number
  matchesCreated: number
  categoriesProcessed: string[]
  errors?: string[]
}

export class BracketGenerator {
  /**
   * Genera brackets para un torneo
   */
  static async generateBrackets(params: GenerateBracketsParams): Promise<BracketGenerationResult> {
    const {
      tournamentId,
      categories,
      seedingMethod = 'random',
      bracketType = 'single_elimination'
    } = params

    const errors: string[] = []
    const categoriesProcessed: string[] = []
    let totalMatchesCreated = 0
    let totalRounds = 0

    try {
      // 1. Obtener torneo
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          TournamentRegistration: {
            where: { confirmed: true }
            // No requerir checkedIn - los brackets se pueden generar antes del día del torneo
          }
        }
      })

      if (!tournament) {
        return {
          success: false,
          message: 'Torneo no encontrado',
          rounds: 0,
          matchesCreated: 0,
          categoriesProcessed: []
        }
      }

      // 2. Obtener categorías del torneo
      const tournamentCategories = tournament.categories as { code: string; name: string; modality: string }[]
      const categoriesToProcess = categories || tournamentCategories.map(c => c.code)

      // 3. Agrupar equipos por categoría
      const teamsByCategory = this.groupTeamsByCategory(tournament.TournamentRegistration)

      // 4. Generar brackets para cada categoría
      for (const categoryCode of categoriesToProcess) {
        const teams = teamsByCategory.get(categoryCode)

        if (!teams || teams.length < 2) {
          errors.push(`Categoría ${categoryCode}: Necesita al menos 2 equipos (tiene ${teams?.length || 0})`)
          continue
        }

        try {
          const result = await this.generateCategoryBracket({
            tournamentId,
            categoryCode,
            teams,
            seedingMethod,
            bracketType
          })

          totalMatchesCreated += result.matchesCreated
          totalRounds = Math.max(totalRounds, result.rounds)
          categoriesProcessed.push(categoryCode)
        } catch (error) {
          errors.push(`Error en categoría ${categoryCode}: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }
      }

      // 5. Actualizar estado del torneo
      if (categoriesProcessed.length > 0) {
        await prisma.tournament.update({
          where: { id: tournamentId },
          data: {
            status: 'ACTIVE',
            updatedAt: new Date()
          }
        })
      }

      return {
        success: categoriesProcessed.length > 0,
        message: categoriesProcessed.length > 0
          ? `Brackets generados exitosamente para ${categoriesProcessed.length} categoría(s)`
          : 'No se pudieron generar brackets',
        rounds: totalRounds,
        matchesCreated: totalMatchesCreated,
        categoriesProcessed,
        errors: errors.length > 0 ? errors : undefined
      }

    } catch (error) {
      console.error('Error generando brackets:', error)
      return {
        success: false,
        message: 'Error al generar brackets',
        rounds: 0,
        matchesCreated: 0,
        categoriesProcessed,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      }
    }
  }

  /**
   * Genera bracket para una categoría específica
   */
  private static async generateCategoryBracket(params: {
    tournamentId: string
    categoryCode: string
    teams: Team[]
    seedingMethod: SeedingMethod
    bracketType: BracketType
  }): Promise<{ matchesCreated: number; rounds: number }> {
    const { tournamentId, categoryCode, teams, seedingMethod } = params

    // 1. Ordenar equipos según método de seeding
    const seededTeams = this.seedTeams(teams, seedingMethod)

    // 2. Calcular estructura del bracket
    const bracketSize = this.getNextPowerOfTwo(seededTeams.length)
    const numRounds = Math.log2(bracketSize)
    const firstRoundMatches = bracketSize / 2
    const byes = bracketSize - seededTeams.length

    // 3. Crear rondas
    const rounds = this.createRoundNames(numRounds)

    let matchesCreated = 0

    // 4. Generar primera ronda
    const firstRoundPairs = this.createFirstRoundPairs(seededTeams, bracketSize, byes)

    // Crear registro de ronda (solo una vez para la primera ronda)
    const firstRoundId = uuidv4()
    const existingFirstRound = await prisma.tournamentRound.findFirst({
      where: {
        tournamentId,
        category: categoryCode,
        stage: rounds[0]
      }
    })

    const roundIdToUse = existingFirstRound?.id || firstRoundId

    if (!existingFirstRound) {
      await prisma.tournamentRound.create({
        data: {
          id: firstRoundId,
          tournamentId,
          name: rounds[0],
          stage: rounds[0],
          stageLabel: rounds[0],
          category: categoryCode,
          modality: teams[0]?.modality || 'M',
          status: 'pending',
          matchesCount: firstRoundMatches,
          completedMatches: 0,
          updatedAt: new Date()
        }
      })
    }

    for (let i = 0; i < firstRoundPairs.length; i++) {
      const pair = firstRoundPairs[i]

      // Crear match
      await prisma.tournamentMatch.create({
        data: {
          id: uuidv4(),
          tournamentId,
          roundId: roundIdToUse,
          round: rounds[0],
          matchNumber: i + 1,
          team1Name: pair.team1?.teamName || 'TBD',
          team1Player1: pair.team1?.player1Name,
          team1Player2: pair.team1?.player2Name,
          team2Name: pair.team2?.teamName || 'TBD',
          team2Player1: pair.team2?.player1Name,
          team2Player2: pair.team2?.player2Name,
          status: pair.isBye ? 'COMPLETED' : 'SCHEDULED',
          winner: pair.isBye ? pair.team1?.teamName : undefined,
          courtNumber: null,
          scheduledAt: null,
          updatedAt: new Date()
        }
      })

      matchesCreated++
    }

    // 5. Crear rondas subsecuentes (vacías, se llenarán con ganadores)
    for (let roundIdx = 1; roundIdx < rounds.length; roundIdx++) {
      const roundName = rounds[roundIdx]
      const matchesInRound = Math.pow(2, numRounds - roundIdx - 1)

      const roundId = uuidv4()

      await prisma.tournamentRound.create({
        data: {
          id: roundId,
          tournamentId,
          name: roundName,
          stage: roundName,
          stageLabel: roundName,
          category: categoryCode,
          modality: teams[0]?.modality || 'M',
          status: 'pending',
          matchesCount: matchesInRound,
          completedMatches: 0,
          updatedAt: new Date()
        }
      })

      // Crear matches vacíos (se llenarán con ganadores)
      for (let matchNum = 0; matchNum < matchesInRound; matchNum++) {
        await prisma.tournamentMatch.create({
          data: {
            id: uuidv4(),
            tournamentId,
            roundId,
            round: roundName,
            matchNumber: matchNum + 1,
            team1Name: 'TBD',
            team2Name: 'TBD',
            status: 'SCHEDULED',
            courtNumber: null,
            scheduledAt: null,
            updatedAt: new Date()
          }
        })

        matchesCreated++
      }
    }

    return {
      matchesCreated,
      rounds: rounds.length
    }
  }

  /**
   * Agrupa equipos por categoría
   */
  private static groupTeamsByCategory(registrations: any[]): Map<string, Team[]> {
    const teamsByCategory = new Map<string, Team[]>()

    for (const reg of registrations) {
      // Usar solo el código de categoría (ya incluye la modalidad, ej: M_OPEN, F_OPEN, MX_A)
      const categoryKey = reg.category

      if (!teamsByCategory.has(categoryKey)) {
        teamsByCategory.set(categoryKey, [])
      }

      teamsByCategory.get(categoryKey)!.push({
        teamName: reg.teamName,
        player1Name: reg.player1Name,
        player2Name: reg.player2Name,
        category: reg.category,
        modality: reg.modality
      })
    }

    return teamsByCategory
  }

  /**
   * Ordena equipos según método de seeding
   */
  private static seedTeams(teams: Team[], method: SeedingMethod): Team[] {
    switch (method) {
      case 'random':
        return this.shuffleArray([...teams])

      case 'ranked':
        // Por ahora, random (en el futuro se puede implementar ranking)
        return this.shuffleArray([...teams])

      case 'serpentine':
        // Método serpentine para torneos round-robin
        return this.shuffleArray([...teams])

      default:
        return teams
    }
  }

  /**
   * Obtiene la siguiente potencia de 2
   */
  private static getNextPowerOfTwo(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)))
  }

  /**
   * Crea nombres de rondas según número total
   */
  private static createRoundNames(numRounds: number): string[] {
    const roundNames: string[] = []

    for (let i = 0; i < numRounds; i++) {
      const matchesInRound = Math.pow(2, numRounds - i - 1)

      if (matchesInRound === 1) {
        roundNames.push('Final')
      } else if (matchesInRound === 2) {
        roundNames.push('Semifinal')
      } else if (matchesInRound === 4) {
        roundNames.push('Cuartos de Final')
      } else if (matchesInRound === 8) {
        roundNames.push('Octavos de Final')
      } else {
        roundNames.push(`Ronda ${i + 1}`)
      }
    }

    return roundNames
  }

  /**
   * Crea pares para la primera ronda con byes
   */
  private static createFirstRoundPairs(
    teams: Team[],
    bracketSize: number,
    byes: number
  ): { team1: Team | null; team2: Team | null; isBye: boolean }[] {
    const pairs: { team1: Team | null; team2: Team | null; isBye: boolean }[] = []
    const numMatches = bracketSize / 2

    let teamIndex = 0

    for (let i = 0; i < numMatches; i++) {
      // Si hay byes, distribuirlos
      if (i < byes) {
        // Bye: un equipo pasa directo
        pairs.push({
          team1: teams[teamIndex] || null,
          team2: null,
          isBye: true
        })
        teamIndex++
      } else {
        // Match normal
        pairs.push({
          team1: teams[teamIndex] || null,
          team2: teams[teamIndex + 1] || null,
          isBye: false
        })
        teamIndex += 2
      }
    }

    return pairs
  }

  /**
   * Mezcla un array aleatoriamente (Fisher-Yates)
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Verifica si se pueden generar brackets para un torneo
   */
  static async canGenerateBrackets(tournamentId: string): Promise<{
    canGenerate: boolean
    message: string
    details?: any
  }> {
    try {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          TournamentRegistration: {
            where: { confirmed: true }
          },
          TournamentMatch: true
        }
      })

      if (!tournament) {
        return {
          canGenerate: false,
          message: 'Torneo no encontrado'
        }
      }

      // Verificar si ya hay brackets generados
      if (tournament.TournamentMatch.length > 0) {
        return {
          canGenerate: false,
          message: 'Los brackets ya han sido generados para este torneo'
        }
      }

      // Verificar si hay equipos inscritos
      if (tournament.TournamentRegistration.length < 2) {
        return {
          canGenerate: false,
          message: 'Se necesitan al menos 2 equipos inscritos para generar brackets'
        }
      }

      // Agrupar por categoría
      const teamsByCategory = this.groupTeamsByCategory(tournament.TournamentRegistration)
      const categoryDetails: any[] = []

      for (const [category, teams] of teamsByCategory) {
        categoryDetails.push({
          category,
          teams: teams.length,
          canGenerate: teams.length >= 2
        })
      }

      return {
        canGenerate: true,
        message: 'Listo para generar brackets',
        details: {
          totalTeams: tournament.TournamentRegistration.length,
          categories: categoryDetails
        }
      }

    } catch (error) {
      return {
        canGenerate: false,
        message: 'Error al verificar estado del torneo'
      }
    }
  }
}
