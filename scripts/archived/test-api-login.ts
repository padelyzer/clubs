async function testApiLogin() {
  const loginData = {
    email: 'demo@padelyzer.com',
    password: 'Demo2024!'
  }

  console.log('Probando login via API...')
  console.log('URL: http://localhost:3000/api/auth/login')
  console.log('Datos:', loginData)

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })

    const data = await response.json()

    console.log('\nRespuesta:')
    console.log('Status:', response.status)
    console.log('Success:', data.success)

    if (data.success) {
      console.log('✅ Login exitoso!')
      console.log('User:', data.user)
      console.log('Redirect URL:', data.redirectUrl)
    } else {
      console.log('❌ Login falló:', data.error)
    }

    return data
  } catch (error) {
    console.error('Error en la petición:', error)
  }
}

testApiLogin()