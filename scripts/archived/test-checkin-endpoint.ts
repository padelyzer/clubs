import { NextRequest } from 'next/server'

async function testCheckinEndpoint() {
  console.log('🧪 Testing check-in endpoint with non-existent booking...')
  
  const bookingId = '50563039-1de9-416d-9fe8-696c0af1b6a2'
  const url = `https://www.padelyzer.app/api/bookings/${bookingId}/checkin`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will fail due to auth, but we want to see the auth error vs not found error
      },
      body: JSON.stringify({
        paymentMethod: 'cash',
        timestamp: new Date().toISOString()
      })
    })
    
    const result = await response.json()
    
    console.log('Response status:', response.status)
    console.log('Response body:', JSON.stringify(result, null, 2))
    
    if (response.status === 401) {
      console.log('✅ Got auth error as expected (endpoint is working)')
    } else if (response.status === 404) {
      console.log('✅ Got not found error (booking doesn\'t exist)')
    } else {
      console.log('⚠️  Unexpected response status')
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error)
  }
}

testCheckinEndpoint().catch(console.error)