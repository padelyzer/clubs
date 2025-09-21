'use client'

export default function TestWireframePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Test de Wireframe de Navegación (Sin Estilos)</h1>
      <p>Esta página muestra la estructura de navegación sin estilos aplicados.</p>
      
      <section style={{ marginTop: '40px' }}>
        <h2>Estructura de Navegación del Sistema</h2>
        
        <div style={{ border: '2px solid #ccc', padding: '20px', marginTop: '20px' }}>
          <h3>🌐 Navegación Pública</h3>
          <nav>
            <ul>
              <li><a href="/">Inicio (Landing)</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/register/club">Registrar Club</a></li>
              <li><a href="/#features">Características</a></li>
              <li><a href="/#pricing">Precios</a></li>
              <li><a href="/demo">Demo</a></li>
              <li><a href="/widget/test-club">Widget Embebible (test)</a></li>
            </ul>
          </nav>
        </div>

        <div style={{ border: '2px solid #0066cc', padding: '20px', marginTop: '20px' }}>
          <h3>🔐 Dashboard Club (Requiere Auth)</h3>
          <nav>
            <h4>Menu Principal</h4>
            <ul>
              <li><a href="/dashboard">📊 Resumen</a></li>
              <li><a href="/dashboard/bookings">📅 Reservas</a></li>
              <li><a href="/dashboard/courts">🎾 Canchas</a></li>
              <li><a href="/dashboard/pricing">💰 Precios</a></li>
              <li><a href="/dashboard/schedule">⏰ Horarios</a></li>
              <li><a href="/dashboard/reception">📱 Recepción</a></li>
            </ul>
            
            <h4>Configuración</h4>
            <ul>
              <li><a href="/dashboard/payments">💳 Pagos</a></li>
              <li><a href="/dashboard/notifications">🔔 Notificaciones</a></li>
              <li><a href="/dashboard/widget">🔗 Widget</a></li>
              <li><a href="/dashboard/settings">⚙️ Ajustes</a></li>
              <li><a href="/dashboard/setup">🚀 Setup Inicial</a></li>
            </ul>
          </nav>
        </div>

        <div style={{ border: '2px solid #9333ea', padding: '20px', marginTop: '20px' }}>
          <h3>👑 Super Admin Panel</h3>
          <nav>
            <h4>Gestión</h4>
            <ul>
              <li><a href="/admin/dashboard">📊 Dashboard Admin</a></li>
              <li><a href="/admin/clubs">🏢 Clubes</a></li>
              <li><a href="/admin/users">👥 Usuarios</a></li>
              <li><a href="/admin/bookings">📚 Reservas Globales</a></li>
              <li><a href="/admin/finance">💵 Finanzas</a></li>
            </ul>
            
            <h4>Herramientas</h4>
            <ul>
              <li><a href="/admin/communications">📨 Comunicaciones</a></li>
              <li><a href="/admin/analytics">📈 Analytics</a></li>
              <li><a href="/admin/logs">📝 Logs</a></li>
              <li><a href="/admin/support">🛠️ Soporte</a></li>
              <li><a href="/admin/settings">⚙️ Configuración Sistema</a></li>
            </ul>
          </nav>
        </div>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>Componentes Base Creados</h2>
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{`
📁 components/
├── navigation/
│   ├── BaseNav.tsx - Navegación base reutilizable
│   ├── Breadcrumbs.tsx - Migas de pan automáticas
│   ├── Sidebar.tsx - Sidebar con colapso
│   ├── MobileNav.tsx - Nav móvil con overlay
│   └── navigation.config.ts - Config centralizada
│
├── layouts/
│   ├── BaseLayout.tsx - Layout principal
│   ├── AuthLayout.tsx - Layout con sidebar
│   └── PublicLayout.tsx - Layout público
│
└── common/
    ├── PageHeader.tsx - Headers de página
    ├── EmptyState.tsx - Estados vacíos
    └── ErrorBoundary.tsx - Manejo de errores
          `}</pre>
        </div>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>Características Implementadas</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>✅ HTML semántico con roles ARIA</li>
          <li>✅ Skip links para accesibilidad</li>
          <li>✅ Breadcrumbs automáticos desde URL</li>
          <li>✅ Navegación responsive móvil/desktop</li>
          <li>✅ Sidebar colapsable</li>
          <li>✅ Layouts por rol (público/club/admin)</li>
          <li>✅ aria-current para página activa</li>
          <li>✅ aria-labels descriptivos</li>
          <li>✅ Manejo de errores con ErrorBoundary</li>
          <li>✅ Estados vacíos configurables</li>
        </ul>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>Próximos Pasos</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>✅ Validar estructura de navegación</li>
          <li>⏳ Aplicar sistema de diseño unificado</li>
          <li>⏳ Implementar tema con Tailwind</li>
          <li>⏳ Añadir animaciones y transiciones</li>
          <li>⏳ Testing de accesibilidad</li>
        </ol>
      </section>

      <section style={{ marginTop: '40px', padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
        <h3>⚠️ Nota sobre Server/Client Components</h3>
        <p>Los componentes con interactividad (onClick, useState, etc.) necesitan 'use client'.</p>
        <p>Los layouts pueden ser Server Components si no tienen estado interno.</p>
      </section>
    </div>
  )
}