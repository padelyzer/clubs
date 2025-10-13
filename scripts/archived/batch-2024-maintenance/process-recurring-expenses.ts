#!/usr/bin/env node

/**
 * Script para procesar gastos recurrentes
 * Puede ser ejecutado manualmente o mediante un cron job
 * 
 * Uso:
 * npx tsx scripts/process-recurring-expenses.ts
 * 
 * Para automatizar (cron job diario a las 6 AM):
 * 0 6 * * * cd /path/to/project && npx tsx scripts/process-recurring-expenses.ts
 */

async function processRecurringExpenses() {
  try {
    console.log('🔄 Procesando gastos recurrentes...')
    console.log('Fecha:', new Date().toISOString())
    
    // Llamar al endpoint de procesamiento
    const response = await fetch('http://localhost:3002/api/finance/recurring-expenses/process', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Procesamiento completado exitosamente')
      console.log(`📊 Gastos procesados: ${data.results.processed}`)
      
      if (data.results.created.length > 0) {
        console.log('\n📝 Gastos creados:')
        data.results.created.forEach(expense => {
          console.log(`  - ${expense.description}: $${(expense.amount / 100).toFixed(2)} MXN`)
          if (expense.nextDue) {
            console.log(`    Próximo vencimiento: ${new Date(expense.nextDue).toLocaleDateString()}`)
          }
        })
      }
      
      if (data.results.errors.length > 0) {
        console.log('\n⚠️ Errores encontrados:')
        data.results.errors.forEach(error => {
          console.log(`  - ${error.description}: ${error.error}`)
        })
      }
    } else {
      console.error('❌ Error en el procesamiento:', data.error)
    }
    
  } catch (error) {
    console.error('❌ Error al procesar gastos recurrentes:', error)
    process.exit(1)
  }
}

// Ejecutar el script
processRecurringExpenses()
  .then(() => {
    console.log('\n✨ Script finalizado')
    process.exit(0)
  })
  .catch(error => {
    console.error('Error fatal:', error)
    process.exit(1)
  })