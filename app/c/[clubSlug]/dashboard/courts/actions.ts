'use server'

import { requireAuth } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { revalidatePath } from 'next/cache'

export async function createCourt(clubId: string, formData: FormData) {
  const session = await requireAuth()
  
  if (session.clubId !== clubId) {
    throw new Error('Unauthorized')
  }

  const name = formData.get('name') as string
  const type = 'PADEL' // Fixed to PADEL only
  const order = parseInt(formData.get('order') as string)
  const indoor = formData.get('indoor') === 'true'
  const active = formData.get('active') === 'on'

  if (!name || !order) {
    throw new Error('Missing required fields')
  }

  await prisma.court.create({
    data: {
      name,
      type: type as any,
      order,
      indoor,
      active,
      clubId
    }
  })

  revalidatePath('/dashboard/courts')
  revalidatePath('/dashboard/setup')
  revalidatePath('/dashboard')
}

export async function updateCourt(courtId: string, formData: FormData) {
  const session = await requireAuth()
  
  const court = await prisma.court.findUnique({
    where: { id: courtId },
    include: { Club: true }
  })

  if (!court || court.club.id !== session.clubId) {
    throw new Error('Unauthorized')
  }

  const name = formData.get('name') as string
  const type = 'PADEL' // Fixed to PADEL only
  const order = parseInt(formData.get('order') as string)
  const indoor = formData.get('indoor') === 'true'
  const active = formData.get('active') === 'on'

  if (!name || !order) {
    throw new Error('Missing required fields')
  }

  await prisma.court.update({
    where: { id: courtId },
    data: {
      name,
      type: type as any,
      order,
      indoor,
      active
    }
  })

  revalidatePath('/dashboard/courts')
  revalidatePath('/dashboard/setup')
  revalidatePath('/dashboard')
}

export async function deleteCourt(courtId: string) {
  const session = await requireAuth()
  
  const court = await prisma.court.findUnique({
    where: { id: courtId },
    include: { 
      club: true,
      bookings: { where: { status: { not: 'CANCELLED' } } }
    }
  })

  if (!court || court.club.id !== session.clubId) {
    throw new Error('Unauthorized')
  }

  // Check for active bookings
  if (court.bookings.length > 0) {
    throw new Error('Cannot delete court with active bookings')
  }

  await prisma.court.delete({
    where: { id: courtId }
  })

  revalidatePath('/dashboard/courts')
  revalidatePath('/dashboard/setup')
  revalidatePath('/dashboard')
}