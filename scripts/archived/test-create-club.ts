// Script para probar la creación de un club
async function testCreateClub() {
  const testClub = {
    name: 'Club de Prueba',
    slug: 'club-prueba',
    email: 'prueba@club.com',
    phone: '+52 555 123 4567',
    description: 'Club de prueba para validación',
    website: 'https://clubprueba.com',
    adminEmail: 'admin@clubprueba.com',
    adminName: 'Administrador Prueba'
  }

  console.log('🧪 Probando creación de club...')
  console.log('📝 Datos del club:', testClub)

  try {
    const response = await fetch('http://localhost:3002/api/admin/clubs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Aquí necesitarías incluir los headers de autenticación
      },
      body: JSON.stringify(testClub)
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Error en la respuesta:', error)
      return
    }

    const result = await response.json()
    console.log('✅ Club creado exitosamente!')
    console.log('📊 Resultado:', result)
    
    if (result.adminCredentials) {
      console.log('\n🔐 Credenciales del administrador:')
      console.log('📧 Email:', result.adminCredentials.email)
      console.log('🔑 Contraseña:', result.adminCredentials.password)
    }
  } catch (error) {
    console.error('❌ Error al crear club:', error)
  }
}

// Ejecutar test
testCreateClub()