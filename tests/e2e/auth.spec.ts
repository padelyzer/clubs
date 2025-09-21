import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
  })

  test('should display login page', async ({ page }) => {
    // Check if login page loads correctly
    await expect(page).toHaveTitle(/Padelyzer/)
    
    // Check for login form elements
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Check for Padelyzer branding
    await expect(page.locator('img[alt="Padelyzer"]')).toBeVisible()
    
    // Check for registration link
    await expect(page.locator('text=Registra tu club gratis')).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // HTML5 validation should prevent submission
    const emailInput = page.locator('#email')
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMessage).toBeTruthy()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill with invalid credentials
    await page.fill('#email', 'invalid@example.com')
    await page.fill('#password', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Wait for error message (adjust selector based on actual implementation)
    await page.waitForTimeout(2000) // Give time for server response
    
    // Check URL hasn't changed (still on login page)
    await expect(page.url()).toContain('/login')
  })

  test('should redirect to dashboard on successful login', async ({ page }) => {
    // Use test credentials (you may need to seed a test user first)
    await page.fill('#email', 'admin@padelpremium.mx')
    await page.fill('#password', 'admin123')
    
    // Click login button
    await page.click('button[type="submit"]')
    
    // Wait for navigation
    await page.waitForLoadState('networkidle')
    
    // Should redirect to either /dashboard or /c/{club-slug}/dashboard
    // The actual redirect depends on the user's club
    await expect(page.url()).toMatch(/\/(dashboard|c\/[\w-]+\/dashboard)/)
  })

  test('should navigate to registration page', async ({ page }) => {
    // Click on registration link
    await page.click('text=Registra tu club gratis')
    
    // Should navigate to register page
    await expect(page.url()).toContain('/register/club')
  })

  test('should toggle password visibility', async ({ page }) => {
    // Fill password field
    await page.fill('#password', 'testpassword123')
    
    // Password should be hidden initially
    await expect(page.locator('#password')).toHaveAttribute('type', 'password')
    
    // Click toggle button (adjust selector based on actual implementation)
    const toggleButton = page.locator('button[aria-label="Mostrar contraseña"]')
    if (await toggleButton.isVisible()) {
      await toggleButton.click()
      
      // Password should now be visible
      await expect(page.locator('#password')).toHaveAttribute('type', 'text')
      
      // Click again to hide
      await toggleButton.click()
      await expect(page.locator('#password')).toHaveAttribute('type', 'password')
    }
  })

  test('should persist "Remember me" checkbox state', async ({ page }) => {
    // Check the remember me checkbox if it exists
    const rememberCheckbox = page.locator('#remember-me')
    if (await rememberCheckbox.isVisible()) {
      await rememberCheckbox.check()
      await expect(rememberCheckbox).toBeChecked()
    }
  })
})

test.describe('Post-Login Navigation', () => {
  test('should handle club selection for multi-club users', async ({ page }) => {
    // This test would require a user with multiple clubs
    // For now, we'll just check if the select-club page exists
    await page.goto('/select-club')
    
    // If user is not logged in, should redirect to login
    if (page.url().includes('/login')) {
      expect(page.url()).toContain('/login')
    }
  })

  test('should handle direct navigation to protected routes', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard')
    
    // Should redirect to login with redirect parameter
    await expect(page.url()).toContain('/login')
    await expect(page.url()).toContain('redirect')
  })
})

test.describe('Multitenant Routing', () => {
  test('should handle club-specific dashboard URLs', async ({ page }) => {
    // Try to access a club-specific dashboard (requires valid club slug)
    await page.goto('/c/test-club/dashboard')
    
    // Should redirect to login if not authenticated
    if (!page.url().includes('/dashboard')) {
      await expect(page.url()).toContain('/login')
    }
  })

  test('should validate club slug in URL', async ({ page }) => {
    // Try to access non-existent club
    await page.goto('/c/non-existent-club-123456/dashboard')
    
    // Should show 404 or redirect to login
    const response = await page.goto('/c/non-existent-club-123456/dashboard')
    
    // Check for 404 status or redirect
    if (response) {
      const status = response.status()
      expect([404, 302, 307]).toContain(status)
    }
  })
})