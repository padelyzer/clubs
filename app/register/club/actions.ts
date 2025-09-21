'use server'

import { prisma } from '@/lib/config/prisma'
import { generateSlug } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const ClubRegistrationSchema = z.object({
  clubName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(10),
  city: z.string().min(2),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  
  ownerName: z.string().min(2).max(100),
  ownerEmail: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
})

export async function registerClub(data: any) {
  try {
    // Validate input
    const parsed = ClubRegistrationSchema.safeParse(data)
    if (!parsed.success) {
      return { error: 'Datos inválidos: ' + parsed.error.issues[0].message }
    }

    const { 
      clubName, email, phone, address, city, website, description,
      ownerName, ownerEmail, password, confirmPassword 
    } = parsed.data

    // Check passwords match
    if (password !== confirmPassword) {
      return { error: 'Las contraseñas no coinciden' }
    }

    // Check if club email already exists
    const existingClub = await prisma.club.findFirst({
      where: { email }
    })

    if (existingClub) {
      return { error: 'Ya existe un club registrado con este email' }
    }

    // Check if owner email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: ownerEmail }
    })

    if (existingUser) {
      return { error: 'Ya existe una cuenta con este email personal' }
    }

    // Generate unique slug
    let slug = generateSlug(clubName)
    let slugCounter = 0
    let finalSlug = slug

    while (await prisma.club.findUnique({ where: { slug: finalSlug } })) {
      slugCounter++
      finalSlug = `${slug}-${slugCounter}`
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create club and owner in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create club
      const club = await tx.club.create({
        data: {
          name: clubName,
          slug: finalSlug,
          email,
          phone,
          address,
          city,
          website: website || null,
          description: description || null,
          status: 'PENDING',
          active: false,
        }
      })

      // Create owner user
      const user = await tx.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          password: hashedPassword,
          role: 'CLUB_OWNER',
          clubId: club.id,
          active: true,
        }
      })

      return { club, user }
    })

    // Notify super admins of new registration
    const { ClubAdminIntegrationService } = await import('@/lib/services/club-admin-integration')
    await ClubAdminIntegrationService.notifyNewClubRegistration({
      clubId: result.club.id,
      clubName: result.club.name,
      ownerEmail: ownerEmail,
      city: city
    })

    return {
      success: true,
      clubId: result.club.id,
      clubSlug: result.club.slug,
      message: 'Club registrado exitosamente. Será revisado en menos de 24 horas.'
    }

  } catch (error) {
    console.error('Club registration error:', error)
    return { error: 'Error interno. Intenta de nuevo.' }
  }
}