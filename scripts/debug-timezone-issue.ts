import { getNowInTimezone, isTimeInPast } from '../lib/utils/timezone'

function debugTimezoneIssue() {
  console.log('🔍 Depurando problema de zona horaria...\n')
  
  const timezone = 'America/Mexico_City'
  
  // 1. Hora actual del servidor
  const serverNow = new Date()
  console.log('Hora del servidor (UTC):', serverNow.toISOString())
  console.log('Hora del servidor (local):', serverNow.toString())
  
  // 2. Hora actual en México
  const nowInMexico = getNowInTimezone(timezone)
  console.log('Hora en México (getNowInTimezone):', nowInMexico.toString())
  
  // 3. Hora real en México usando toLocaleString
  const realMexicoTime = new Date().toLocaleString('en-US', { timeZone: timezone })
  console.log('Hora real en México:', realMexicoTime)
  
  // 4. Test de slots
  console.log('\n📋 Prueba de slots:')
  const today = new Date()
  const testSlots = ['14:00', '14:30', '15:00', '20:30', '21:00', '21:30']
  
  testSlots.forEach(slot => {
    const isPast = isTimeInPast(slot, today, timezone, 15)
    console.log(`   ${slot} - ${isPast ? '❌ PASADO' : '✅ DISPONIBLE'}`)
  })
  
  // 5. Diagnóstico detallado
  console.log('\n🔧 Diagnóstico de isTimeInPast:')
  const testSlot = '14:30'
  const [hour, minute] = testSlot.split(':').map(Number)
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()
  
  console.log(`   Fecha de hoy: ${year}-${month}-${day}`)
  console.log(`   Slot a probar: ${testSlot}`)
  
  // Recrear la lógica de isTimeInPast
  const slotDate = new Date(year, month - 1, day, hour, minute, 0, 0)
  console.log(`   Fecha del slot: ${slotDate.toString()}`)
  
  const now = new Date()
  const nowWithBuffer = new Date(now)
  nowWithBuffer.setMinutes(nowWithBuffer.getMinutes() + 15)
  
  console.log(`   Hora actual + 15 min: ${nowWithBuffer.toString()}`)
  console.log(`   ¿Slot < Now+Buffer? ${slotDate < nowWithBuffer}`)
}

debugTimezoneIssue()