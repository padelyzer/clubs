import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

// Use production database URL - Supabase production
const PRODUCTION_DATABASE_URL = 'postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL
    }
  }
})

async function verifyStripeConfig() {
  const clubId = '90e75af6-4ef5-49bf-adb3-a6f2a78e2e8d' // Club Demo Padelyzer
  console.log(`🔍 Verificando configuración de Stripe para club: ${clubId}`)
  
  try {
    await prisma.$connect()
    console.log('✅ Conexión exitosa a Supabase')
    
    // Obtener configuración de Stripe
    const stripeProvider = await prisma.paymentProvider.findFirst({
      where: {
        clubId: clubId,
        providerId: 'stripe',
        enabled: true
      }
    })
    
    if (!stripeProvider || !stripeProvider.config) {
      console.log('❌ No hay configuración de Stripe')
      return
    }
    
    const config = stripeProvider.config as any
    console.log('\n🔑 Configuración encontrada:')
    console.log(`   Public Key: ${config.publicKey?.substring(0, 20)}...`)
    console.log(`   Secret Key: ${config.secretKey?.substring(0, 20)}...`)
    
    // Verificar si las llaves parecen válidas
    const isTestMode = config.publicKey?.startsWith('pk_test_') && config.secretKey?.startsWith('sk_test_')
    const isLiveMode = config.publicKey?.startsWith('pk_live_') && config.secretKey?.startsWith('sk_live_')
    
    if (isTestMode) {
      console.log('\n✅ Llaves en modo TEST')
    } else if (isLiveMode) {
      console.log('\n⚠️  Llaves en modo LIVE (producción)')
    } else {
      console.log('\n❌ Las llaves no parecen válidas')
      return
    }
    
    // Intentar usar las llaves para verificar que funcionan
    console.log('\n🧪 Probando conexión con Stripe...')
    try {
      const stripe = new Stripe(config.secretKey, {
        apiVersion: '2024-11-20.acacia'
      })
      
      // Intentar obtener el balance (operación simple que no afecta nada)
      const balance = await stripe.balance.retrieve()
      console.log('✅ Conexión exitosa con Stripe')
      console.log(`   Moneda por defecto: ${balance.default_currency}`)
      console.log(`   Livemode: ${balance.livemode}`)
      
    } catch (stripeError: any) {
      console.log('❌ Error conectando con Stripe:', stripeError.message)
      console.log('\n💡 Posibles causas:')
      console.log('   1. Las llaves API no son válidas')
      console.log('   2. Las llaves fueron revocadas')
      console.log('   3. No hay conexión a Internet')
      console.log('   4. La cuenta de Stripe está suspendida')
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error:', error)
    await prisma.$disconnect()
  }
}

verifyStripeConfig().catch(console.error)