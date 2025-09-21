import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()
    console.log('Received setup data:', JSON.stringify(data, null, 2))
    console.log('Session data:', { clubId: session.clubId, userId: session.userId })

    // Start a transaction to ensure all data is saved together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update club information
      console.log('Step 1: Updating club information...')
      const updatedClub = await tx.club.update({
        where: { id: session.clubId },
        data: {
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'México',
          postalCode: data.postalCode || '',
          initialSetupCompleted: true,
          initialSetupCompletedAt: new Date()
        }
      })
      console.log('Step 1 completed: Club updated')

      // 2. Create or update ClubSettings
      console.log('Step 2: Creating/updating club settings...')
      let clubSettings = await tx.clubSettings.findFirst({
        where: { clubId: session.clubId }
      })

      const settingsData = {
        timezone: data.timezone || 'America/Mexico_City',
        currency: data.currency || 'MXN',
        slotDuration: data.slotDuration || 90,
        bufferTime: data.bufferTime || 15,
        advanceBookingDays: data.advanceBookingDays || 30,
        allowSameDayBooking: data.allowSameDayBooking !== undefined ? data.allowSameDayBooking : true,
        acceptCash: data.acceptCash || false,
        accountHolder: data.transferEnabled ? (data.accountHolder || null) : null,
        accountNumber: data.transferEnabled ? (data.accountNumber || null) : null,
        bankName: data.transferEnabled ? (data.bankName || null) : null,
        clabe: data.transferEnabled ? (data.clabe || null) : null,
        terminalId: data.terminalEnabled ? (data.terminalId || null) : null,
        updatedAt: new Date()
      }

      if (!clubSettings) {
        clubSettings = await tx.clubSettings.create({
          data: {
            id: nanoid(),
            clubId: session.clubId,
            ...settingsData,
            createdAt: new Date()
          }
        })
      } else {
        clubSettings = await tx.clubSettings.update({
          where: { id: clubSettings.id },
          data: settingsData
        })
      }
      console.log('Step 2 completed: Club settings saved')

      // 3. Create courts from setup data
      console.log('Step 3: Creating courts from setup data...')
      const existingCourts = await tx.court.count({
        where: { clubId: session.clubId }
      })

      if (existingCourts === 0 && data.courts && data.courts.length > 0) {
        const courtsToCreate = data.courts.map((court: any) => ({
          id: nanoid(),
          clubId: session.clubId,
          name: court.name || `Cancha ${court.order}`,
          type: court.type || 'PADEL',
          indoor: court.indoor !== undefined ? court.indoor : true,
          active: court.active !== undefined ? court.active : true,
          order: court.order || 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }))

        await tx.court.createMany({
          data: courtsToCreate
        })
        console.log(`Created ${courtsToCreate.length} courts from setup data`)
      } else if (existingCourts === 0) {
        // Fallback: create default courts if no courts data provided
        await tx.court.createMany({
          data: [
            {
              id: nanoid(),
              clubId: session.clubId,
              name: 'Cancha 1',
              type: 'PADEL',
              indoor: true,
              active: true,
              order: 1,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: nanoid(),
              clubId: session.clubId,
              name: 'Cancha 2',
              type: 'PADEL',
              indoor: true,
              active: true,
              order: 2,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        })
        console.log('Created default courts as fallback')
      }
      console.log('Step 3 completed: Courts created')

      // 4. Create pricing configurations based on setup data
      console.log('Step 4: Creating pricing configurations...')
      const existingPricing = await tx.pricing.count({
        where: { clubId: session.clubId }
      })

      if (existingPricing === 0) {
        // Crear tarifa estándar (7:00-22:00)
        console.log('Creating standard pricing...')
        await tx.pricing.create({
          data: {
            id: nanoid(),
            clubId: session.clubId,
            startTime: '07:00',
            endTime: '22:00',
            price: (data.basePrice ? data.basePrice * 100 : 50000), // Convertir pesos a centavos
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })

        // Crear tarifa de fin de semana si es diferente (sábados y domingos)
        if (data.weekendPrice && data.weekendPrice !== data.basePrice) {
          // Sábado
          await tx.pricing.create({
            data: {
              id: nanoid(),
              clubId: session.clubId,
              dayOfWeek: 6, // Sábado
              startTime: '08:00',
              endTime: '23:00',
              price: data.weekendPrice * 100, // Convertir a centavos
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
          // Domingo
          await tx.pricing.create({
            data: {
              id: nanoid(),
              clubId: session.clubId,
              dayOfWeek: 0, // Domingo
              startTime: '08:00',
              endTime: '21:00',
              price: data.weekendPrice * 100, // Convertir a centavos
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
        }

        // Crear tarifa hora pico si está habilitada (19:00-22:00)
        if (data.enablePeakPricing && data.peakHourPrice) {
          await tx.pricing.create({
            data: {
              id: nanoid(),
              clubId: session.clubId,
              startTime: '19:00',
              endTime: '22:00',
              price: data.peakHourPrice * 100, // Convertir a centavos
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
        }

        // Crear tarifa hora valle si está habilitada (07:00-15:00)
        if (data.enableOffPeakPricing && data.offPeakPrice) {
          await tx.pricing.create({
            data: {
              id: nanoid(),
              clubId: session.clubId,
              startTime: '07:00',
              endTime: '15:00',
              price: data.offPeakPrice * 100, // Convertir a centavos
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
        }
      }
      console.log('Step 4 completed: Pricing configurations created')

      // 5. Create schedule rules based on operating hours
      console.log('Step 5: Creating schedule rules...')
      const existingSchedule = await tx.scheduleRule.count({
        where: { clubId: session.clubId }
      })

      if (existingSchedule === 0 && data.operatingHours) {
        const scheduleRules = []
        const dayMapping: { [key: string]: number } = {
          monday: 1,    // Lunes
          tuesday: 2,   // Martes
          wednesday: 3, // Miércoles
          thursday: 4,  // Jueves
          friday: 5,    // Viernes
          saturday: 6,  // Sábado
          sunday: 0     // Domingo
        }

        for (const [day, hours] of Object.entries(data.operatingHours) as [string, any][]) {
          if (hours.isOpen) {
            scheduleRules.push({
              id: nanoid(),
              clubId: session.clubId,
              name: `Horario ${day}`,
              dayOfWeek: dayMapping[day],
              startTime: hours.open,
              endTime: hours.close,
              enabled: true,
              createdAt: new Date(),
              updatedAt: new Date()
            })
          }
        }

        if (scheduleRules.length > 0) {
          await tx.scheduleRule.createMany({
            data: scheduleRules
          })
        }
      }
      console.log('Step 5 completed: Schedule rules created')

      // 6. Save payment methods if transfer is enabled
      console.log('Step 6: Creating payment methods...')
      if (data.transferEnabled && data.accountHolder) {
        const existingBankTransfer = await tx.paymentProvider.findFirst({
          where: {
            clubId: session.clubId,
            type: 'BANK_TRANSFER'
          }
        })

        if (!existingBankTransfer) {
          await tx.paymentProvider.create({
            data: {
              id: nanoid(),
              clubId: session.clubId,
              type: 'BANK_TRANSFER',
              name: data.bankName || 'Transferencia Bancaria',
              enabled: true,
              config: JSON.stringify({
                accountHolder: data.accountHolder,
                accountNumber: data.accountNumber,
                bankName: data.bankName,
                clabe: data.clabe
              }),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
        }
      }
      console.log('Step 6 completed: Payment methods created')
      console.log('🎉 All setup steps completed successfully!')

      return updatedClub
    })

    // Get club slug for redirect URL
    const clubSlug = result.slug

    return NextResponse.json({
      success: true,
      message: 'Configuración completada exitosamente',
      club: result,
      redirectUrl: `/c/${clubSlug}/dashboard`
    })

  } catch (error) {
    console.error('Error completing setup:', error)
    return NextResponse.json(
      { error: 'Error al completar la configuración' },
      { status: 500 }
    )
  }
}