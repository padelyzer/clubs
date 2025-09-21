import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60000, // 60 segundos por test
  globalTimeout: 600000, // 10 minutos total
  
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    // Timeouts más largos para manejar la lentitud del servidor
    actionTimeout: 20000, // 20 segundos para acciones
    navigationTimeout: 60000, // 60 segundos para navegación
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Modo headless para tests rápidos
        headless: true,
        viewport: { width: 1440, height: 900 },
        launchOptions: {
          args: ['--disable-dev-shm-usage']
        },
        // No grabar video para mejor rendimiento
        video: 'off'
      },
    },
    {
      name: 'chrome-visible',
      use: { 
        ...devices['Desktop Chrome'],
        // IMPORTANTE: Ejecutar en modo visible
        headless: false,
        viewport: { width: 1440, height: 900 },
        launchOptions: {
          // Reducir el slowMo para mejor rendimiento
          slowMo: 100,
          args: ['--start-maximized']
        },
        // Grabar video siempre
        video: {
          mode: 'on',
          size: { width: 1440, height: 900 }
        }
      },
    },
  ],

  // Usar el servidor existente
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
})