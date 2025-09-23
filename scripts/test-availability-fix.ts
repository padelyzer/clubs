import { isTimeInPast, getNowInTimezone } from '../lib/utils/timezone'

function testAvailabilityFix() {
  console.log('🧪 Probando corrección de disponibilidad...\n')
  
  const timezone = 'America/Mexico_City'
  const now = getNowInTimezone(timezone)
  const today = new Date()
  
  console.log('Hora actual en México:', now.toLocaleString('es-MX', { timeZone: timezone }))
  console.log('Hora:', now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0'))
  
  // Generar slots desde las 14:00 hasta las 22:00
  const slots = []
  for (let hour = 14; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 22 && minute > 0) continue // No 22:30
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeStr)
    }
  }
  
  console.log('\n📋 Estado de slots con buffer 0:')
  slots.forEach(slot => {
    const isPast = isTimeInPast(slot, today, timezone, 0)
    console.log(`   ${slot} - ${isPast ? '❌ PASADO' : '✅ DISPONIBLE'}`)
  })
  
  console.log('\n📋 Estado de slots con buffer 15:')
  slots.forEach(slot => {
    const isPast = isTimeInPast(slot, today, timezone, 15)
    console.log(`   ${slot} - ${isPast ? '❌ PASADO' : '✅ DISPONIBLE'}`)
  })
}

testAvailabilityFix()