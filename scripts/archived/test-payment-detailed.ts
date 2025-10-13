async function testPaymentDetailed() {
  const bookingId = '9b799d4a-b6b4-499b-a879-f1f686091425'
  
  console.log('🔍 Probando flujo completo de pago...')
  
  // 1. Primero probar el endpoint de config
  console.log('\n1️⃣ Probando endpoint de configuración de Stripe...')
  try {
    const configResponse = await fetch(`https://www.padelyzer.app/api/public/stripe/config?bookingId=${bookingId}`)
    const configData = await configResponse.json()
    console.log('Config response:', configData)
  } catch (error) {
    console.error('Error fetching config:', error)
  }
  
  // 2. Probar el endpoint de create-intent
  console.log('\n2️⃣ Probando endpoint de create-intent...')
  try {
    const paymentResponse = await fetch('https://www.padelyzer.app/api/public/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId: bookingId
      })
    })
    
    console.log('Status:', paymentResponse.status)
    console.log('Status Text:', paymentResponse.statusText)
    
    const responseText = await paymentResponse.text()
    console.log('Response:', responseText)
    
    try {
      const data = JSON.parse(responseText)
      console.log('Parsed data:', data)
    } catch (e) {
      console.log('Could not parse as JSON')
    }
    
  } catch (error) {
    console.error('Error creating intent:', error)
  }
  
  // 3. Probar directamente la página de pago
  console.log('\n3️⃣ URL de pago:')
  console.log(`https://www.padelyzer.app/pay/${bookingId}`)
}

testPaymentDetailed().catch(console.error)