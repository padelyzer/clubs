'use server'

import { prisma } from '@/lib/config/prisma'
import { requireAuth } from '@/lib/auth/actions'
import { redirect } from 'next/navigation'

export async function completeSetup() {
  console.log('🔄 Server Action: completeSetup iniciado')
  const session = await requireAuth()
  console.log('👤 Session obtenida:', { userId: session.userId, clubId: session.clubId })
  
  if (!session.clubId) {
    throw new Error('No club associated with user')
  }

  try {
    console.log('📝 Actualizando club en DB:', session.clubId)
    // Mark setup as complete and activate club
    const updatedClub = await prisma.club.update({
      where: { id: session.clubId },
      data: {
        active: true,
        updatedAt: new Date(),
      }
    })
    console.log('✅ Club actualizado:', { id: updatedClub.id, active: updatedClub.active })

    // Redirect to main dashboard
    console.log('🔄 Redirigiendo a /dashboard')
    redirect('/dashboard')
  } catch (error: any) {
    // Si es un redirect de Next.js, relanzarlo
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('❌ Error completing setup:', error)
    throw new Error('Failed to complete setup')
  }
}

export async function updateClubInfo(formData: FormData) {
  const session = await requireAuth()
  
  if (!session.clubId) {
    throw new Error('No club associated with user')
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const phone = formData.get('phone') as string
  const website = formData.get('website') as string

  try {
    await prisma.club.update({
      where: { id: session.clubId },
      data: {
        name: name || undefined,
        description: description || undefined,
        phone: phone || undefined,
        website: website || undefined,
        updatedAt: new Date(),
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating club info:', error)
    return { error: 'Failed to update club information' }
  }
}