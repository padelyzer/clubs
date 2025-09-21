import { test, expect } from '@playwright/test'

test.describe('Basic Smoke Tests', () => {
  test('app should be running', async ({ page }) => {
    // Check if app responds
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(500)
  })

  test('login page should load', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/Padelyzer/)
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('protected routes should redirect to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.url()).toContain('/login')
  })

  test('multitenant routes should handle invalid slugs', async ({ page }) => {
    const response = await page.goto('/c/invalid-club-slug-123/dashboard')
    
    // Should either 404 or redirect to login
    if (page.url().includes('/login')) {
      expect(page.url()).toContain('/login')
    } else if (response) {
      expect(response.status()).toBe(404)
    }
  })

  test('registration link should work', async ({ page }) => {
    await page.goto('/login')
    // Verificar que el link de registro existe y tiene el href correcto
    const registerLink = page.locator('a:has-text("Registra tu club gratis")')
    await expect(registerLink).toBeVisible()
    await expect(registerLink).toHaveAttribute('href', '/register/club')
  })
})