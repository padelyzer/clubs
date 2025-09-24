import { prisma } from '@/lib/config/prisma'

export interface PlayerData {
  name: string
  email?: string | null
  phone: string
  clubId: string
}

/**
 * Busca o crea un Player basado en el teléfono y club
 * Actualiza la información si ya existe
 */
export async function findOrCreatePlayer(data: PlayerData) {
  const { name, email, phone, clubId } = data

  // Primero intentar buscar por teléfono y club
  let player = await prisma.player.findFirst({
    where: {
      clubId,
      phone
    }
  })

  if (player) {
    // Si existe, actualizar información si ha cambiado
    const updates: any = {}
    
    if (name && name !== player.name) {
      updates.name = name
    }
    
    if (email && email !== player.email) {
      updates.email = email
    }
    
    if (Object.keys(updates).length > 0) {
      player = await prisma.player.update({
        where: { id: player.id },
        data: updates
      })
    }
  } else {
    // Si no existe, crear nuevo player
    player = await prisma.player.create({
      data: {
        clubId,
        name,
        email: email || null,
        phone,
        active: true,
        memberSince: new Date()
      }
    })
  }

  return player
}

/**
 * Actualiza contadores del Player después de una reserva
 */
export async function updatePlayerBookingStats(playerId: string, amount: number) {
  const player = await prisma.player.findUnique({
    where: { id: playerId }
  })
  
  if (!player) return
  
  await prisma.player.update({
    where: { id: playerId },
    data: {
      totalBookings: player.totalBookings + 1,
      totalSpent: player.totalSpent + amount,
      lastBookingAt: new Date()
    }
  })
}

/**
 * Actualiza contadores del Player después de una clase
 */
export async function updatePlayerClassStats(playerId: string, amount: number) {
  const player = await prisma.player.findUnique({
    where: { id: playerId }
  })
  
  if (!player) return
  
  await prisma.player.update({
    where: { id: playerId },
    data: {
      totalClasses: player.totalClasses + 1,
      totalSpent: player.totalSpent + amount,
      lastClassAt: new Date()
    }
  })
}

/**
 * Obtiene estadísticas completas de un Player
 */
export async function getPlayerStats(playerId: string) {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      Booking: {
        orderBy: { date: 'desc' },
        take: 10
      },
      ClassBooking: {
        include: {
          Class: {
            include: {
              Instructor: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      _count: {
        select: {
          Booking: true,
          ClassBooking: true,
          Transaction: true
        }
      }
    }
  })
  
  if (!player) return null
  
  return {
    ...player,
    stats: {
      totalBookings: player._count.Booking,
      totalClasses: player._count.ClassBooking,
      totalTransactions: player._count.Transaction,
      totalSpent: player.totalSpent,
      memberSinceDays: Math.floor((Date.now() - player.memberSince.getTime()) / (1000 * 60 * 60 * 24))
    }
  }
}