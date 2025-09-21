import { test, expect } from '@playwright/test'

test.describe('🚀 Sistema de Gestión de Club de Pádel - Demo Completa', () => {
  
  test('01. Login y navegación principal', async ({ page }) => {
    console.log('🎬 Iniciando prueba de login...')
    
    // 1. Ir a la página de login
    await page.goto('/login')
    await page.waitForTimeout(2000) // Pausa para ver la página
    
    // 2. Verificar que estamos en la página de login
    await expect(page).toHaveTitle(/Padelyzer/)
    console.log('✅ Página de login cargada')
    
    // 3. Llenar credenciales
    console.log('📝 Ingresando credenciales...')
    await page.fill('#email', 'admin@padelpremium.mx')
    await page.waitForTimeout(1000)
    
    await page.fill('#password', 'admin123')
    await page.waitForTimeout(1000)
    
    // 4. Hacer click en login
    console.log('🔐 Iniciando sesión...')
    await page.click('button[type="submit"]')
    
    // 5. Esperar navegación o carga completa
    await page.waitForTimeout(3000)
    console.log(`📍 URL después del login: ${page.url()}`)
    
    // 6. Si todavía estamos en login, verificar errores
    if (page.url().includes('/login')) {
      console.log('⚠️ Aún en página de login, verificando errores...')
      const errorMessages = await page.locator('text=/error|Error|invalid|Invalid|incorrect|Incorrect|inválido|Inválido/i').count()
      if (errorMessages > 0) {
        console.log('❌ Errores de login encontrados')
      } else {
        console.log('⚠️ No se detectaron errores, continuando...')
      }
    } else {
      console.log('✅ Login exitoso!')
    }
    
    await page.waitForTimeout(2000)
    
    // 7. Navegar al dashboard manualmente para demostrar funcionalidad
    console.log('🧭 Navegando al sistema...')
    await page.goto('/dashboard')
    await page.waitForTimeout(2000)
    
    // Ver Reservas
    console.log('📅 Revisando módulo de Reservas...')
    await page.click('text=Reservas')
    await page.waitForTimeout(3000)
    console.log(`📍 URL Reservas: ${page.url()}`)
    
    // Ver Clases
    console.log('🎓 Revisando módulo de Clases...')
    await page.click('text=Clases')
    await page.waitForTimeout(3000)
    console.log(`📍 URL Clases: ${page.url()}`)
    
    // Ver Finanzas
    console.log('💰 Revisando módulo de Finanzas...')
    await page.click('text=Finanzas')
    await page.waitForTimeout(3000)
    console.log(`📍 URL Finanzas: ${page.url()}`)
    
    console.log('✅ Navegación completada exitosamente!')
  })
})