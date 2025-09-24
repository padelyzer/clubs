async function testPaymentEndpoint() {
  const bookingId = '9b799d4a-b6b4-499b-a879-f1f686091425'
  const apiUrl = 'https://www.padelyzer.app/api/public/payments/create-intent'
  
  console.log('🧪 Probando endpoint de pago público...')
  console.log(`📍 URL: ${apiUrl}`)
  console.log(`📋 Booking ID: ${bookingId}`)
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId: bookingId
      })
    })
    
    console.log(`\n📡 Response Status: ${response.status}`)
    console.log(`📡 Response Headers:`)
    response.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`)
    })
    
    const data = await response.json()
    console.log('\n📦 Response Body:')
    console.log(JSON.stringify(data, null, 2))
    
    if (!response.ok) {
      console.log('\n❌ Error en la respuesta')
      console.log('Posibles causas:')
      console.log('1. El booking no existe en la base de datos')
      console.log('2. Error de conexión con la base de datos')
      console.log('3. Error de configuración de Stripe')
      console.log('4. Error en el código del endpoint')
    } else {
      console.log('\n✅ Payment intent creado exitosamente')
      console.log(`Client Secret: ${data.clientSecret}`)
      console.log(`Amount: $${data.amount / 100} MXN`)
    }
    
  } catch (error) {
    console.error('❌ Error haciendo la petición:', error)
  }
}

testPaymentEndpoint().catch(console.error)