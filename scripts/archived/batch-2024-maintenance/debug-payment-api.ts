// Debug script para probar el endpoint de payment settings

async function debugPaymentAPI() {
  console.log('🔍 Probando endpoint /api/settings/payments...\n')
  
  const testData = {
    paymentProviders: {
      stripe: {
        enabled: false,
        publicKey: 'pk_test_debug',
        secretKey: 'sk_test_debug'
      }
    }
  }
  
  try {
    // First login to get session
    console.log('1️⃣ Haciendo login...')
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'owner@clubdemo.padelyzer.com',
        password: 'demo123'
      })
    })
    
    const loginData = await loginResponse.json()
    if (!loginResponse.ok) {
      console.error('❌ Login falló:', loginData)
      return
    }
    
    console.log('✅ Login exitoso')
    console.log('   Session ID:', loginData.sessionData?.sessionId)
    
    // Get cookies from login response
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('   Cookies:', cookies ? 'Recibidas' : 'No recibidas')
    
    // Test GET endpoint
    console.log('\n2️⃣ Probando GET /api/settings/payments...')
    const getResponse = await fetch('http://localhost:3000/api/settings/payments', {
      method: 'GET',
      headers: {
        'Cookie': cookies || '',
        'x-session-id': loginData.sessionData?.sessionId || ''
      }
    })
    
    const getData = await getResponse.json()
    console.log('   Status:', getResponse.status)
    console.log('   Response:', JSON.stringify(getData, null, 2))
    
    // Test POST endpoint
    console.log('\n3️⃣ Probando POST /api/settings/payments...')
    const postResponse = await fetch('http://localhost:3000/api/settings/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || '',
        'x-session-id': loginData.sessionData?.sessionId || ''
      },
      body: JSON.stringify(testData)
    })
    
    const postData = await postResponse.json()
    console.log('   Status:', postResponse.status)
    console.log('   Response:', JSON.stringify(postData, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugPaymentAPI()