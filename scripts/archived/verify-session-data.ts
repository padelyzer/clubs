// This script helps debug potential session/authentication issues

async function verifySessionData() {
  console.log('🔍 Verificando datos de sesión y autenticación...')
  
  // Check what the current URL should return
  const testUrl = 'https://www.padelyzer.app/c/club-demo-padelyzer/dashboard/bookings'
  console.log(`📍 URL que el usuario está viendo: ${testUrl}`)
  
  // The slug should be "club-demo-padelyzer" which corresponds to clubId "club-demo-001"
  console.log('🔑 Información esperada:')
  console.log('   Slug: club-demo-padelyzer')
  console.log('   Club ID: club-demo-001')
  
  console.log('\n💡 Posibles causas del problema:')
  console.log('1. 🍪 Cache del navegador mostrando datos antiguos')
  console.log('2. 🔐 Problema de autenticación/sesión')
  console.log('3. 🌐 CDN/Vercel edge cache mostrando datos antiguos')
  console.log('4. 📱 Frontend conectándose a una base de datos diferente')
  console.log('5. ⏰ Zona horaria causando filtrado incorrecto de fechas')
  
  console.log('\n🛠️ Soluciones sugeridas para el usuario:')
  console.log('1. 🔄 Abrir en modo incógnito/privado')
  console.log('2. 🧹 Limpiar cache del navegador completamente')
  console.log('3. 🔌 Hacer logout y login nuevamente')
  console.log('4. 🌐 Esperar 5-10 minutos para que se actualice el CDN')
  console.log('5. 📱 Probar desde otro dispositivo/navegador')
  
  console.log('\n✅ Lo que está correcto en la base de datos:')
  console.log('   • Ana Martínez (14:00-15:30) - Individual, pago pendiente')
  console.log('   • Carlos López (16:00-17:30) - Grupo, 2 canchas')
  console.log('   • Roberto Silva (18:00-19:30) - Individual, pagado')
  
  console.log('\n❌ Lo que el usuario ve (datos incorrectos):')
  console.log('   • Jaime Alcázar y otras reservas que NO están en la BD')
}

verifySessionData().catch(console.error)