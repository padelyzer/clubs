import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { requireAuthAPI } from '@/lib/auth/actions'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Buscar configuración de Stripe del club
    const stripeProvider = await prisma.paymentProvider.findFirst({
      where: {
        clubId: session.clubId,
        providerId: 'stripe'
      }
    })

    if (!stripeProvider) {
      return NextResponse.json({
        success: true,
        data: {
          enabled: false,
          hasConfig: false,
          publicKey: '',
          secretKey: ''
        }
      })
    }

    const config = stripeProvider.config as any || {}

    return NextResponse.json({
      success: true,
      data: {
        enabled: stripeProvider.enabled,
        hasConfig: !!(config.publicKey && config.secretKey),
        publicKey: config.publicKey || '',
        secretKey: config.secretKey ? '••••••••••••••••' + config.secretKey.slice(-4) : ''
      }
    })

  } catch (error) {
    console.error('Error fetching Stripe settings:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración de Stripe' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { publicKey, secretKey, enabled } = body

    if (!publicKey || !secretKey) {
      return NextResponse.json(
        { error: 'Se requieren tanto la clave pública como la secreta' },
        { status: 400 }
      )
    }

    // Validar formato de las claves
    if (!publicKey.startsWith('pk_test_') && !publicKey.startsWith('pk_live_')) {
      return NextResponse.json(
        { error: 'Formato de clave pública inválido' },
        { status: 400 }
      )
    }

    if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
      return NextResponse.json(
        { error: 'Formato de clave secreta inválido' },
        { status: 400 }
      )
    }

    // Buscar proveedor existente
    const existingProvider = await prisma.paymentProvider.findFirst({
      where: {
        clubId: session.clubId,
        providerId: 'stripe'
      }
    })

    const stripeConfig = {
      publicKey,
      secretKey,
      environment: publicKey.startsWith('pk_test_') ? 'test' : 'live'
    }

    let provider
    if (existingProvider) {
      // Actualizar proveedor existente
      provider = await prisma.paymentProvider.update({
        where: { id: existingProvider.id },
        data: {
          enabled: enabled !== false,
          config: stripeConfig,
          fees: {
            fixed: 30, // 30 centavos
            percentage: 2.9 // 2.9%
          }
        }
      })
    } else {
      // Crear nuevo proveedor
      provider = await prisma.paymentProvider.create({
        data: {
          clubId: session.clubId,
          providerId: 'stripe',
          name: 'Stripe',
          enabled: enabled !== false,
          config: stripeConfig,
          fees: {
            fixed: 30, // 30 centavos
            percentage: 2.9 // 2.9%
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración de Stripe actualizada exitosamente',
      data: {
        enabled: provider.enabled,
        hasConfig: true,
        environment: stripeConfig.environment
      }
    })

  } catch (error) {
    console.error('Error updating Stripe settings:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración de Stripe' },
      { status: 500 }
    )
  }
}