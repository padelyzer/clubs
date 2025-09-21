import { test, expect } from '@playwright/test'

test.describe('💰 Módulo Financiero', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar directamente al dashboard para demos
    await page.goto('/dashboard')
    await page.waitForTimeout(2000)
    console.log('📍 En dashboard, listo para demo financiero...')
  })
  
  test('04. Revisar dashboard financiero', async ({ page }) => {
    console.log('💼 Accediendo al módulo financiero...')
    
    // 1. Navegar directamente a finanzas
    await page.goto('/dashboard/finance')
    await page.waitForTimeout(4000)
    console.log('✅ En módulo de finanzas')
    console.log(`📍 URL: ${page.url()}`)
    
    // 2. Explorar interfaz financiera
    console.log('📊 Explorando dashboard financiero...')
    const cards = await page.locator('[class*="card"], [class*="Card"]').count()
    console.log(`💳 Encontradas ${cards} tarjetas de métricas`)
    
    const charts = await page.locator('canvas, svg').count()
    console.log(`📈 Encontrados ${charts} gráficos o elementos visuales`)
    
    const buttons = await page.locator('button').count()
    console.log(`🔘 Encontrados ${buttons} botones interactivos`)
    
    await page.waitForTimeout(3000)
    console.log('✅ Dashboard financiero explorado exitosamente')
    
    // 3. Navegar a Ingresos
    console.log('💚 Revisando módulo de Ingresos...')
    await page.click('text=Ingresos')
    await page.waitForTimeout(2500)
    
    // Verificar tabla de transacciones
    const transactions = page.locator('tr').filter({ hasText: /MXN|€|\$/ })
    const transactionCount = await transactions.count()
    console.log(`📝 Se encontraron ${transactionCount} transacciones de ingresos`)
    await page.waitForTimeout(1500)
    
    // 4. Navegar a Gastos
    console.log('🔴 Revisando módulo de Gastos...')
    await page.click('text=Gastos')
    await page.waitForTimeout(2500)
    
    // 5. Navegar a Reportes
    console.log('📈 Revisando Reportes Financieros...')
    await page.click('text=Reportes')
    await page.waitForTimeout(2500)
    
    // Ver Estado de Resultados
    console.log('📋 Generando Estado de Resultados...')
    const reportButton = page.locator('button').filter({ hasText: /Estado|Resultados|Generar/i }).first()
    if (await reportButton.isVisible()) {
      await reportButton.click()
      await page.waitForTimeout(3000)
    }
    
    console.log('✅ Revisión financiera completada!')
  })
  
  test('05. Exportar datos financieros', async ({ page }) => {
    console.log('📥 Probando exportación de datos...')
    
    // Ir a finanzas
    await page.click('text=Finanzas')
    await page.waitForTimeout(2000)
    
    // Ir a Ingresos
    await page.click('text=Ingresos')
    await page.waitForTimeout(2000)
    
    // Buscar botón de exportar
    console.log('💾 Buscando opción de exportar...')
    const exportButton = page.locator('button').filter({ hasText: /Exportar|Export|CSV|Download/i }).first()
    
    if (await exportButton.isVisible()) {
      console.log('📊 Exportando datos a CSV...')
      
      // Configurar descarga
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null)
      
      await exportButton.click()
      await page.waitForTimeout(2000)
      
      const download = await downloadPromise
      if (download) {
        console.log(`✅ Archivo descargado: ${await download.suggestedFilename()}`)
      } else {
        console.log('⚠️ No se pudo completar la descarga')
      }
    } else {
      console.log('⚠️ Botón de exportar no encontrado')
    }
    
    await page.waitForTimeout(2000)
  })
  
  test('06. Ver análisis y gráficos', async ({ page }) => {
    console.log('📊 Revisando análisis y visualizaciones...')
    
    // Ir a finanzas
    await page.click('text=Finanzas')
    await page.waitForTimeout(2000)
    
    // Buscar gráficos
    console.log('📈 Buscando gráficos de tendencias...')
    const charts = page.locator('canvas, svg').filter({ hasNotText: /icon|logo/i })
    const chartCount = await charts.count()
    
    if (chartCount > 0) {
      console.log(`✅ Se encontraron ${chartCount} visualizaciones de datos`)
      await page.waitForTimeout(2000)
    } else {
      console.log('ℹ️ No se encontraron gráficos en esta vista')
    }
    
    // Cambiar período
    console.log('📅 Cambiando período de análisis...')
    const monthSelector = page.locator('select, button').filter({ hasText: /mes|month|período/i }).first()
    if (await monthSelector.isVisible()) {
      await monthSelector.click()
      await page.waitForTimeout(1500)
    }
    
    console.log('✅ Análisis financiero completado!')
    await page.waitForTimeout(2000)
  })
})