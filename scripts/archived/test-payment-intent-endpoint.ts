async function testPaymentIntentEndpoint() {
  try {
    console.log('🧪 Probando endpoint create-intent-simple...\n')
    
    // Datos del split payment que tiene Payment Intent
    const bookingId = 'cmek2dmer001hr4ww2hxf9aj0'
    const splitPaymentId = 'cmek2fiew0001r4e7umx1amjf'
    
    const response = await fetch('http://localhost:3000/api/stripe/payments/create-intent-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        splitPaymentId,
      }),
    })
    
    const data = await response.json()
    
    console.log(`📊 Respuesta del servidor:`)
    console.log(`   Status: ${response.status}`)
    console.log(`   Success: ${data.success}`)
    
    if (data.success) {
      console.log(`   Payment Intent ID: ${data.paymentIntentId}`)
      console.log(`   Client Secret: ${data.clientSecret}`)
      console.log(`   Monto: $${data.amount / 100} MXN`)
      console.log(`   ✅ El endpoint funciona correctamente`)
    } else {
      console.log(`   ❌ Error: ${data.error}`)
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }
}

testPaymentIntentEndpoint()