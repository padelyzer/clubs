import bcrypt from 'bcryptjs'

async function testSupabaseLogin() {
  console.log('🔐 Probando login con Supabase...\n')
  
  const email = 'owner@clubdemo.padelyzer.com'
  const password = 'demo123'
  
  try {
    // Test login endpoint
    const response = await fetch('https://bmad-padelyzer-jlaq6nptk-ja-bmads-projects.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    })
    
    const data = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('\n✅ Login exitoso!')
      console.log('Redirect URL:', data.redirectUrl)
    } else {
      console.log('\n❌ Login falló')
      console.log('Error:', data.error)
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error)
  }
}

testSupabaseLogin()