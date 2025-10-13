/**
 * Script de prueba para crear un jugador en el Club Basic5
 */

async function testCreatePlayer() {
  console.log('🎾 Probando creación de jugador en Club Basic5...\n')
  
  const playerData = {
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '5551234567',
    birthDate: '1990-01-15',
    level: 'Tercera Fuerza',
    gender: 'male',
    notes: 'Jugador de prueba para Club Basic5'
  }
  
  try {
    // Simular que somos el usuario basic5@padelyzer.com
    // En producción esto vendría de la sesión
    const response = await fetch('http://localhost:3002/api/players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Cookie con session del usuario basic5 (necesitarías obtener esta cookie del navegador)
        'Cookie': 'session=fqr7wmoo3xjzc3yo6dxktnsxmjtor4uq6qp5353h' // Usar la sesión actual del log
      },
      body: JSON.stringify(playerData)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Jugador creado exitosamente:')
      console.log(JSON.stringify(result, null, 2))
    } else {
      console.error('❌ Error al crear jugador:')
      console.error(JSON.stringify(result, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error)
  }
}

// Ejecutar prueba
testCreatePlayer()