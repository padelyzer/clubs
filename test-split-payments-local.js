const fetch = require('node-fetch');

async function testSplitPaymentsEndpoint() {
  try {
    const bookingId = '9f43ba36-adea-429e-ba29-5b5a21085bb5'; // ID from our debug script
    
    console.log(`🧪 Testing split payments endpoint for booking: ${bookingId}`);
    
    const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}/split-payments`, {
      method: 'GET',
      headers: {
        'Cookie': 'auth-token=your-jwt-token-here', // We'll need a valid token
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('\n📡 Response Status:', response.status);
    console.log('📄 Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.status) {
      const { status } = data;
      console.log('\n✅ API Response Success:');
      console.log(`   Booking ID: ${status.booking.id}`);
      console.log(`   Player: ${status.booking.playerName}`);
      console.log(`   Total Payments: ${status.totalPayments}`);
      console.log(`   Split Payments Found: ${status.splitPayments.length}`);
      
      if (status.splitPayments.length > 0) {
        console.log('\n💰 Split Payments:');
        status.splitPayments.forEach((sp, index) => {
          console.log(`   ${index + 1}. ${sp.playerName}: $${(sp.amount / 100).toFixed(2)} MXN (${sp.status})`);
        });
      } else {
        console.log('\n⚠️  No split payments found in API response!');
      }
    } else {
      console.log('\n❌ API Error:', data.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('🚨 Test Error:', error.message);
  }
}

testSplitPaymentsEndpoint();