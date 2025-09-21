const fetch = require('node-fetch');

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3002/api/finance/transactions?type=INCOME&period=month&limit=3', {
      headers: {
        'Cookie': 'auth-session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI1ODNiMzEyZi01OGJjLTQ3YzctOTQwYS00ZjBjYjIzN2QwMGQiLCJ1c2VySWQiOiJ1c2VyLWFkbWluLWJhc2ljNS0wMDEiLCJjbHViSWQiOiJjbHViLWJhc2ljNS0wMDEiLCJyb2xlIjoiQ0xVQl9BRE1JTiIsImlhdCI6MTc1NzkyNDM4NCwiZXhwIjoxNzU4NTI5MTg0fQ.ZLKOkPVRhxlq7yg-7sLJzCzLcUIWJBVQS2uI7BK1VfU'
      }
    });

    const data = await response.json();

    console.log('API Response - First transaction:');
    if (data.transactions && data.transactions[0]) {
      const t = data.transactions[0];
      console.log('- ID:', t.id);
      console.log('- Description:', t.description);
      console.log('- Has Booking?:', !!t.Booking);
      if (t.Booking) {
        console.log('  - Booking.playerName:', t.Booking.playerName);
        console.log('  - Booking.Court:', t.Booking.Court);
      }
    }

    console.log('\n=== All 3 transactions ===');
    data.transactions?.forEach((t, i) => {
      console.log(`\n${i+1}. ${t.description}`);
      console.log(`   PlayerName from Booking: ${t.Booking?.playerName || 'NO BOOKING'}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();