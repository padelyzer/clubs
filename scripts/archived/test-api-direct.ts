// Direct API test to see what's being returned
async function testAPIDirect() {
  console.log('🔍 Probando API directamente...')
  
  try {
    // Call the API exactly like the frontend does
    const response = await fetch('https://www.padelyzer.app/api/bookings?date=2025-09-23', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will fail due to auth, but let's see what happens
      }
    })
    
    console.log('Response status:', response.status)
    
    if (response.status === 401) {
      console.log('❌ Error de autenticación (esperado)')
      console.log('La API requiere autenticación para devolver datos')
      return
    }
    
    const data = await response.json()
    console.log('Response body:', JSON.stringify(data, null, 2))
    
  } catch (error) {
    console.error('❌ Error calling API:', error)
  }
}

testAPIDirect().catch(console.error)