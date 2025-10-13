async function testClientSecretFormat() {
  try {
    console.log('🧪 Probando formato de client_secret...\n')
    
    // Simular lo que hace el endpoint
    const paymentIntentId = 'pi_1755700810533_e3eyxlghl'
    const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('📋 Payment Intent ID:', paymentIntentId)
    console.log('🔑 Client Secret:', clientSecret)
    
    // Verificar el formato
    const parts = clientSecret.split('_secret_')
    const isValidFormat = parts.length === 2 && parts[0] === paymentIntentId && parts[1].length > 0
    
    console.log('\n✅ Validación del formato:')
    console.log(`   Partes: ${parts.length} (debe ser 2)`)
    console.log(`   Payment Intent coincide: ${parts[0] === paymentIntentId}`)
    console.log(`   Secret parte existe: ${parts[1] && parts[1].length > 0}`)
    console.log(`   Formato válido: ${isValidFormat ? '✅' : '❌'}`)
    
    if (isValidFormat) {
      console.log('\n🎯 El client_secret tiene el formato correcto para Stripe')
      console.log(`   Patrón: {payment_intent_id}_secret_{random_secret}`)
    } else {
      console.log('\n❌ El client_secret NO tiene el formato correcto')
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }
}

testClientSecretFormat()