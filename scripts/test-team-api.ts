// Test the team API endpoint
async function testTeamAPI() {
  try {
    // Primero necesitamos hacer login
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin1758064682301@wizard.com',
        password: 'Admin123!'
      })
    })

    const loginData = await loginResponse.json()
    console.log('Login response:', loginData)

    // Obtener las cookies del login
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('Cookies:', cookies)

    // Ahora hacer la petición al endpoint de team
    const teamResponse = await fetch('http://localhost:3002/api/club/team', {
      method: 'GET',
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })

    const teamData = await teamResponse.json()
    console.log('Team API response:', JSON.stringify(teamData, null, 2))

  } catch (error) {
    console.error('Error testing API:', error)
  }
}

testTeamAPI()