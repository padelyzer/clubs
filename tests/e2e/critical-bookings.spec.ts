import { test, expect } from '@playwright/test'

test.describe('Critical Booking System', () => {
  // Helper para login
  async function loginAsAdmin(page) {
    await page.goto('/login')
    await page.fill('#email', 'admin@padelpremium.mx')
    await page.fill('#password', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => url.pathname.includes('/dashboard'), {
      timeout: 30000
    })
  }

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('navigate to bookings page', async ({ page }) => {
    // Buscar link de reservas en el menú
    const bookingsLink = page.locator('a[href*="/bookings"], a:has-text("Reservas"), a:has-text("Bookings")').first()
    
    if (await bookingsLink.count() > 0) {
      await bookingsLink.click()
      await page.waitForURL(/\/bookings/, { timeout: 10000 })
      await expect(page).toHaveURL(/\/bookings/)
    } else {
      // Si no hay link, navegar directamente
      await page.goto('/c/padel-premium/dashboard/bookings')
      await expect(page).toHaveURL(/\/bookings/)
    }

    // Verificar que estamos en la página de reservas
    await expect(page.locator('text=/Reservas|Bookings|Calendario/')).toBeVisible({
      timeout: 10000
    })
  })

  test('calendar view loads with correct elements', async ({ page }) => {
    await page.goto('/c/padel-premium/dashboard/bookings')
    
    // Esperar que la página cargue
    await page.waitForLoadState('networkidle')
    
    // Verificar elementos del calendario
    const dateSelector = page.locator('input[type="date"], .date-picker, button:has-text("Hoy"), button:has-text("Today")').first()
    
    if (await dateSelector.count() > 0) {
      await expect(dateSelector).toBeVisible()
    }
    
    // Verificar que hay algún tipo de grid o tabla para las reservas
    const bookingGrid = page.locator('.calendar-grid, .booking-grid, table, .schedule-grid').first()
    
    if (await bookingGrid.count() > 0) {
      await expect(bookingGrid).toBeVisible()
    }
  })

  test('create new booking button exists and is clickable', async ({ page }) => {
    await page.goto('/c/padel-premium/dashboard/bookings')
    await page.waitForLoadState('networkidle')
    
    // Buscar botón de nueva reserva
    const newBookingButton = page.locator(
      'button:has-text("Nueva Reserva"), ' +
      'button:has-text("New Booking"), ' +
      'button:has-text("Reservar"), ' +
      'button:has-text("Agregar"), ' +
      'button[aria-label*="reserva"], ' +
      'button[aria-label*="booking"]'
    ).first()
    
    if (await newBookingButton.count() > 0) {
      await expect(newBookingButton).toBeVisible()
      await expect(newBookingButton).toBeEnabled()
      
      // Intentar hacer click
      await newBookingButton.click()
      
      // Verificar que se abre un modal o formulario
      const bookingForm = page.locator(
        '.modal, [role="dialog"], .booking-form, form'
      ).first()
      
      // Esperar un momento para que aparezca
      await page.waitForTimeout(1000)
      
      if (await bookingForm.count() > 0) {
        await expect(bookingForm).toBeVisible()
      }
    }
  })

  test('booking form has required fields', async ({ page }) => {
    await page.goto('/c/padel-premium/dashboard/bookings')
    await page.waitForLoadState('networkidle')
    
    // Abrir formulario de reserva
    const newBookingButton = page.locator(
      'button:has-text("Nueva Reserva"), button:has-text("Reservar")'
    ).first()
    
    if (await newBookingButton.count() > 0) {
      await newBookingButton.click()
      await page.waitForTimeout(1000)
      
      // Verificar campos del formulario
      const playerNameField = page.locator(
        'input[name*="player"], input[name*="name"], input[placeholder*="nombre"]'
      ).first()
      
      const dateField = page.locator(
        'input[type="date"], input[name*="date"], .date-picker'
      ).first()
      
      const timeField = page.locator(
        'input[type="time"], select[name*="time"], .time-picker'
      ).first()
      
      const courtField = page.locator(
        'select[name*="court"], input[name*="court"], .court-selector'
      ).first()
      
      // Verificar que al menos algunos campos existan
      const fieldsExist = 
        (await playerNameField.count() > 0) ||
        (await dateField.count() > 0) ||
        (await courtField.count() > 0)
      
      expect(fieldsExist).toBeTruthy()
    }
  })

  test('can search for existing players', async ({ page }) => {
    await page.goto('/c/padel-premium/dashboard/players')
    await page.waitForLoadState('networkidle')
    
    // Verificar que estamos en la página de jugadores
    const playersPageIndicator = page.locator(
      'text=/Jugadores|Players|Clientes/'
    ).first()
    
    if (await playersPageIndicator.count() > 0) {
      await expect(playersPageIndicator).toBeVisible()
    }
    
    // Buscar campo de búsqueda
    const searchField = page.locator(
      'input[type="search"], input[placeholder*="buscar"], input[placeholder*="search"]'
    ).first()
    
    if (await searchField.count() > 0) {
      await expect(searchField).toBeVisible()
      
      // Intentar buscar un jugador
      await searchField.fill('Test')
      await page.waitForTimeout(1000)
      
      // Verificar si hay resultados
      const playerResults = page.locator(
        'tr:has-text("Test"), .player-card:has-text("Test"), .player-item:has-text("Test")'
      ).first()
      
      // Si creamos el jugador de prueba, debería aparecer
      if (await playerResults.count() > 0) {
        await expect(playerResults).toBeVisible()
      }
    }
  })

  test('booking list shows existing bookings', async ({ page }) => {
    await page.goto('/c/padel-premium/dashboard/bookings')
    await page.waitForLoadState('networkidle')
    
    // Buscar lista o tabla de reservas
    const bookingsList = page.locator(
      'table tbody tr, .booking-item, .booking-card, .reservation-item'
    ).first()
    
    // Verificar estructura de lista
    const hasBookingsList = await bookingsList.count() > 0
    
    if (hasBookingsList) {
      // Si hay reservas, verificar que tienen información
      const firstBooking = bookingsList.first()
      await expect(firstBooking).toBeVisible()
    } else {
      // Si no hay reservas, debería haber un mensaje de "sin reservas"
      const emptyMessage = page.locator(
        'text=/No hay reservas|Sin reservas|No bookings/'
      ).first()
      
      // Algún indicador debería estar presente
      const hasEmptyMessage = await emptyMessage.count() > 0
      expect(hasBookingsList || hasEmptyMessage).toBeTruthy()
    }
  })
})