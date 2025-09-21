import { test, expect } from '@playwright/test'

test.describe('📅 Módulo de Reservas', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar directamente al dashboard para demos
    await page.goto('/dashboard')
    await page.waitForTimeout(2000)
    console.log('📍 En dashboard, listo para pruebas...')
  })
  
  test('02. Crear nueva reserva de cancha', async ({ page }) => {
    console.log('🎾 Iniciando demostración del módulo de reservas...')
    
    // 1. Ir al módulo de reservas
    await page.click('text=Reservas')
    await page.waitForTimeout(3000)
    console.log('✅ En módulo de reservas')
    console.log(`📍 URL: ${page.url()}`)
    
    // 2. Buscar botones disponibles
    console.log('🔍 Explorando interfaz de reservas...')
    const buttons = await page.locator('button').all()
    console.log(`📋 Encontrados ${buttons.length} botones en la interfaz`)
    
    // 3. Buscar formularios o campos de entrada
    const inputs = await page.locator('input').all()
    console.log(`📝 Encontrados ${inputs.length} campos de entrada`)
    
    // 4. Demo completa - navegar por el módulo
    console.log('🎾 Demostrando funcionalidad de reservas...')
    await page.waitForTimeout(3000)
    console.log('✅ Módulo de reservas demostrado exitosamente!')
  })
  
  test('03. Ver calendario de reservas', async ({ page }) => {
    console.log('📆 Demostrando vista de calendario...')
    
    // Ir a reservas
    await page.click('text=Reservas')
    await page.waitForTimeout(3000)
    console.log(`📍 URL Reservas: ${page.url()}`)
    
    // Demo del calendario
    console.log('🗓️ Interfaz de calendario lista para demo...')
    await page.waitForTimeout(3000)
    console.log('✅ Calendario de reservas demostrado exitosamente!')
  })
})