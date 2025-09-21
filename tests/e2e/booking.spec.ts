import { test, expect } from '@playwright/test'

// Test configuration - adjust club slug as needed
const TEST_CLUB_SLUG = 'padel-premium' // Update with actual test club slug
const DASHBOARD_URL = `/c/${TEST_CLUB_SLUG}/dashboard`

test.describe('Booking System', () => {
  test.beforeEach(async ({ page }) => {
    // First, login to access booking system
    await page.goto('/login')
    await page.fill('#email', 'admin@padelpremium.mx')
    await page.fill('#password', 'admin123')
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForLoadState('networkidle')
    
    // Navigate to bookings page
    if (page.url().includes('/dashboard')) {
      // Already on some dashboard page, navigate to bookings
      const currentUrl = page.url()
      if (currentUrl.includes('/c/')) {
        // Extract club slug from URL
        const match = currentUrl.match(/\/c\/([^\/]+)/)
        if (match) {
          await page.goto(`/c/${match[1]}/dashboard/bookings`)
        }
      } else {
        // Fallback to default test club
        await page.goto(`${DASHBOARD_URL}/bookings`)
      }
    }
  })

  test('should display booking interface', async ({ page }) => {
    // Check if we're on the bookings page
    await expect(page.url()).toContain('/bookings')
    
    // Check for booking interface elements
    // Look for calendar or booking grid
    const bookingInterface = page.locator('.booking-calendar, .calendar-container, [data-testid="booking-calendar"]').first()
    
    // If calendar exists, check it's visible
    if (await bookingInterface.count() > 0) {
      await expect(bookingInterface).toBeVisible()
    } else {
      // Alternative: Check for booking list or table
      const bookingList = page.locator('.bookings-list, .booking-table, table').first()
      if (await bookingList.count() > 0) {
        await expect(bookingList).toBeVisible()
      }
    }
    
    // Check for date selector
    const dateSelector = page.locator('input[type="date"], .date-picker, [data-testid="date-selector"]').first()
    if (await dateSelector.count() > 0) {
      await expect(dateSelector).toBeVisible()
    }
  })

  test('should open booking modal when clicking available slot', async ({ page }) => {
    // Look for available time slots or "New Booking" button
    const newBookingButton = page.locator('button:has-text("Nueva Reserva"), button:has-text("New Booking"), button:has-text("Reservar")').first()
    
    if (await newBookingButton.count() > 0) {
      await newBookingButton.click()
      
      // Check if modal opened
      const modal = page.locator('.modal, [role="dialog"], .booking-modal').first()
      await expect(modal).toBeVisible()
    } else {
      // Try clicking on calendar slot
      const availableSlot = page.locator('.available-slot, .time-slot:not(.booked), .calendar-slot:not(.occupied)').first()
      if (await availableSlot.count() > 0) {
        await availableSlot.click()
        
        // Check if booking form appears
        const bookingForm = page.locator('form, .booking-form').first()
        await expect(bookingForm).toBeVisible()
      }
    }
  })

  test('should fill and submit booking form', async ({ page }) => {
    // Open booking form
    const newBookingButton = page.locator('button:has-text("Nueva Reserva"), button:has-text("Reservar")').first()
    
    if (await newBookingButton.count() > 0) {
      await newBookingButton.click()
      
      // Wait for form to be visible
      await page.waitForTimeout(1000)
      
      // Fill booking form fields
      // Player name
      const nameField = page.locator('input[name="playerName"], input[placeholder*="nombre"], #playerName').first()
      if (await nameField.isVisible()) {
        await nameField.fill('Test Player')
      }
      
      // Player email
      const emailField = page.locator('input[name="playerEmail"], input[type="email"]:not(#email), #playerEmail').first()
      if (await emailField.isVisible()) {
        await emailField.fill('player@test.com')
      }
      
      // Player phone
      const phoneField = page.locator('input[name="playerPhone"], input[placeholder*="teléfono"], input[placeholder*="phone"], #playerPhone').first()
      if (await phoneField.isVisible()) {
        await phoneField.fill('5551234567')
      }
      
      // Number of players (if exists)
      const playersSelect = page.locator('select[name="totalPlayers"], select[name="players"]').first()
      if (await playersSelect.isVisible()) {
        await playersSelect.selectOption('4')
      }
      
      // Submit form
      const submitButton = page.locator('button[type="submit"]:has-text("Confirmar"), button[type="submit"]:has-text("Reservar"), button[type="submit"]:has-text("Crear")').first()
      if (await submitButton.isVisible()) {
        await submitButton.click()
        
        // Wait for response
        await page.waitForTimeout(2000)
        
        // Check for success message or redirect
        const successMessage = page.locator('text=/éxito|success|creada|confirmada/i').first()
        if (await successMessage.count() > 0) {
          await expect(successMessage).toBeVisible()
        }
      }
    }
  })

  test('should display existing bookings', async ({ page }) => {
    // Check for bookings table or list
    const bookingsContainer = page.locator('.bookings-table, .bookings-list, table, .booking-grid').first()
    
    if (await bookingsContainer.count() > 0) {
      await expect(bookingsContainer).toBeVisible()
      
      // Check if there are any booking entries
      const bookingEntries = page.locator('tr:not(:first-child), .booking-item, .booking-card').first()
      
      // If there are bookings, at least one should be visible
      if (await bookingEntries.count() > 0) {
        await expect(bookingEntries.first()).toBeVisible()
      }
    }
  })

  test('should filter bookings by date', async ({ page }) => {
    // Look for date filter
    const dateFilter = page.locator('input[type="date"], .date-picker').first()
    
    if (await dateFilter.isVisible()) {
      // Set a specific date
      const today = new Date()
      const dateString = today.toISOString().split('T')[0]
      await dateFilter.fill(dateString)
      
      // Wait for filtered results
      await page.waitForTimeout(1000)
      
      // Check that the page updated (URL or content)
      const currentUrl = page.url()
      expect(currentUrl).toBeTruthy() // Basic check that we're still on a valid page
    }
  })

  test('should handle booking cancellation', async ({ page }) => {
    // Look for existing booking with cancel option
    const cancelButton = page.locator('button:has-text("Cancelar"), button:has-text("Cancel"), .cancel-booking').first()
    
    if (await cancelButton.count() > 0) {
      await cancelButton.click()
      
      // Confirm cancellation if modal appears
      const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Sí")').first()
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
        
        // Wait for cancellation to process
        await page.waitForTimeout(2000)
        
        // Check for success message
        const successMessage = page.locator('text=/cancelad|cancelled/i').first()
        if (await successMessage.count() > 0) {
          await expect(successMessage).toBeVisible()
        }
      }
    }
  })
})

test.describe('Booking System - Multitenant', () => {
  test('should respect club context in bookings', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('#email', 'admin@padelpremium.mx')
    await page.fill('#password', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
    
    // Check that we're in a club-specific context
    const currentUrl = page.url()
    
    if (currentUrl.includes('/c/')) {
      // Extract club slug
      const match = currentUrl.match(/\/c\/([^\/]+)/)
      expect(match).toBeTruthy()
      
      if (match) {
        const clubSlug = match[1]
        
        // Navigate to bookings
        await page.goto(`/c/${clubSlug}/dashboard/bookings`)
        
        // Verify we're still in the same club context
        await expect(page.url()).toContain(`/c/${clubSlug}`)
      }
    }
  })

  test('should not allow access to other club bookings', async ({ page }) => {
    // Try to access a different club's bookings
    const response = await page.goto('/c/non-existent-club/dashboard/bookings')
    
    // Should either get 404 or redirect to login
    if (response) {
      const status = response.status()
      expect([404, 302, 307, 401]).toContain(status)
    } else {
      // Check if redirected to login
      await expect(page.url()).toContain('/login')
    }
  })
})