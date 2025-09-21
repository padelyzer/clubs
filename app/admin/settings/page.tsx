import { requireSuperAdmin } from '@/lib/auth/actions'
import SettingsManagement from './components/settings-management'

export default async function AdminSettingsPage() {
  await requireSuperAdmin()

  // Configuraciones del sistema (en una implementación real, estas vendrían de la base de datos)
  const systemSettings = {
    general: {
      platformName: 'Padelyzer',
      supportEmail: 'soporte@padelyzer.com',
      defaultTimezone: 'America/Mexico_City',
      defaultLanguage: 'es',
      maintenanceMode: false,
      allowClubRegistration: true,
      requireClubApproval: true
    },
    financial: {
      defaultCommissionRate: 2.5, // Porcentaje
      minCommissionRate: 1.0,
      maxCommissionRate: 10.0,
      payoutFrequency: 'weekly', // daily, weekly, monthly
      minPayoutAmount: 100, // MXN
      currency: 'MXN'
    },
    features: {
      enableWhatsAppNotifications: true,
      enableEmailNotifications: true,
      enableSplitPayments: true,
      enableWidgetBookings: true,
      enableMobileApp: false,
      enableAnalytics: true,
      enableAdvancedReporting: true
    },
    limits: {
      maxCourtsPerClub: 20,
      maxUsersPerClub: 100,
      maxBookingsPerDay: 1000,
      maxBookingDaysInAdvance: 30,
      maxCancellationHours: 24
    },
    notifications: {
      bookingConfirmation: true,
      paymentReminders: true,
      cancellationNotices: true,
      promotionalMessages: false,
      systemUpdates: true
    },
    security: {
      requireTwoFactor: false,
      sessionTimeout: 24, // horas
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requirePasswordComplexity: true,
      allowedIpWhitelist: []
    },
    integrations: {
      stripe: {
        enabled: true,
        webhookUrl: '/api/stripe/webhook',
        testMode: false
      },
      whatsapp: {
        enabled: true,
        provider: 'twilio',
        businessNumber: '+521234567890'
      },
      analytics: {
        enabled: true,
        provider: 'internal'
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
      </div>

      <SettingsManagement settings={systemSettings} />
    </div>
  )
}