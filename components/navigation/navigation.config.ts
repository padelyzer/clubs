// Navigation configuration for the entire app

export const clubNavigation = {
  main: [
    { label: 'Resumen', href: '/dashboard', icon: '📊' },
    { label: 'Reservas', href: '/dashboard/bookings', icon: '📅' },
    { label: 'Canchas', href: '/dashboard/courts', icon: '🎾' },
    { label: 'Precios', href: '/dashboard/pricing', icon: '💰' },
    { label: 'Horarios', href: '/dashboard/schedule', icon: '⏰' },
    { label: 'Recepción', href: '/dashboard/reception', icon: '📱' },
  ],
  settings: [
    { label: 'Pagos', href: '/dashboard/payments', icon: '💳' },
    { label: 'Notificaciones', href: '/dashboard/notifications', icon: '🔔' },
    { label: 'Widget', href: '/dashboard/widget', icon: '🔗' },
    { label: 'Configuración', href: '/dashboard/settings', icon: '⚙️' },
  ]
}

export const adminNavigation = {
  main: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Clubes', href: '/admin/clubs', icon: '🏢' },
    { label: 'Usuarios', href: '/admin/users', icon: '👥' },
    { label: 'Reservas', href: '/admin/bookings', icon: '📚' },
    { label: 'Finanzas', href: '/admin/finance', icon: '💵' },
  ],
  tools: [
    { label: 'Comunicaciones', href: '/admin/communications', icon: '📨' },
    { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
    { label: 'Logs', href: '/admin/logs', icon: '📝' },
    { label: 'Soporte', href: '/admin/support', icon: '🛠️' },
    { label: 'Configuración', href: '/admin/settings', icon: '⚙️' },
  ]
}

export const publicNavigation = {
  main: [
    { label: 'Características', href: '/#features' },
    { label: 'Precios', href: '/#pricing' },
    { label: 'Demo', href: '/demo' },
    { label: 'Blog', href: '/blog' },
  ],
  footer: {
    product: [
      { label: 'Características', href: '/#features' },
      { label: 'Precios', href: '/#pricing' },
      { label: 'Demo', href: '/demo' },
      { label: 'Widget', href: '/widget' },
    ],
    company: [
      { label: 'Nosotros', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contacto', href: '/contact' },
      { label: 'Soporte', href: '/support' },
    ],
    legal: [
      { label: 'Términos', href: '/terms' },
      { label: 'Privacidad', href: '/privacy' },
      { label: 'Cookies', href: '/cookies' },
    ]
  }
}