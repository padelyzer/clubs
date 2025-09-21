'use client'

import { useState } from 'react'
import './demo-styles.css'

type ThemeStyle = 'minimal' | 'gradient' | 'glassmorphism' | 'neubrutalism' | 'enterprise'

export default function UXDemoPage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeStyle>('minimal')
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')

  const themes = {
    minimal: {
      name: 'Minimal Linear',
      description: 'Estilo Linear/Vercel - Minimalista y profesional'
    },
    gradient: {
      name: 'Gradient Modern',
      description: 'Estilo Stripe - Gradientes sutiles y sombras'
    },
    glassmorphism: {
      name: 'Glass UI',
      description: 'Transparencias y blur como Apple'
    },
    neubrutalism: {
      name: 'Neubrutalism',
      description: 'Bordes duros, colores vibrantes, sombras sólidas'
    },
    enterprise: {
      name: 'Enterprise Classic',
      description: 'Formal, corporativo, confiable'
    }
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'bookings', label: 'Reservas', icon: '📅' },
    { id: 'courts', label: 'Canchas', icon: '🎾' },
    { id: 'pricing', label: 'Precios', icon: '💰' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' }
  ]

  return (
    <div className={`ux-demo theme-${currentTheme}`}>
      {/* Theme Switcher Bar */}
      <div className="theme-switcher">
        <div className="theme-switcher-inner">
          <span className="theme-label">Probar estilos:</span>
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => setCurrentTheme(key as ThemeStyle)}
              className={`theme-btn ${currentTheme === key ? 'active' : ''}`}
              title={theme.description}
            >
              {theme.name}
            </button>
          ))}
        </div>
        <div className="theme-info">
          {themes[currentTheme].description}
        </div>
      </div>

      {/* Main Layout */}
      <div className="demo-layout">
        {/* Header */}
        <header className="demo-header">
          <div className="header-left">
            <button 
              className="menu-toggle"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              ☰
            </button>
            <div className="logo">Padelyzer</div>
          </div>
          
          <nav className="header-nav">
            <a href="#" className="nav-link">Inicio</a>
            <a href="#" className="nav-link">Reportes</a>
            <a href="#" className="nav-link">Ayuda</a>
          </nav>
          
          <div className="header-right">
            <button className="icon-btn">🔔</button>
            <div className="user-menu">
              <img className="avatar" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' fill='%23e5e7eb'/%3E%3C/svg%3E" alt="User" />
              <span>Juan Pérez</span>
            </div>
          </div>
        </header>

        <div className="demo-body">
          {/* Sidebar */}
          {showSidebar && (
            <aside className="demo-sidebar">
              <nav className="sidebar-nav">
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-label">{item.label}</span>
                  </button>
                ))}
              </nav>
              
              <div className="sidebar-footer">
                <button className="sidebar-item">
                  <span className="sidebar-icon">🚪</span>
                  <span className="sidebar-label">Cerrar Sesión</span>
                </button>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="demo-main">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Resumen de actividad del club</p>
              </div>
              <div className="page-actions">
                <button className="btn btn-secondary">Exportar</button>
                <button className="btn btn-primary">Nueva Reserva</button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">Reservas Hoy</span>
                  <span className="stat-icon">📅</span>
                </div>
                <div className="stat-value">24</div>
                <div className="stat-change positive">+12% vs ayer</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">Ingresos</span>
                  <span className="stat-icon">💰</span>
                </div>
                <div className="stat-value">$12,450</div>
                <div className="stat-change positive">+8% vs semana</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">Ocupación</span>
                  <span className="stat-icon">📊</span>
                </div>
                <div className="stat-value">78%</div>
                <div className="stat-change negative">-5% vs mes</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">Usuarios Activos</span>
                  <span className="stat-icon">👥</span>
                </div>
                <div className="stat-value">156</div>
                <div className="stat-change positive">+23 nuevos</div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="content-grid">
              {/* Table Section */}
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">Próximas Reservas</h2>
                  <button className="btn-text">Ver todas →</button>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Cancha</th>
                        <th>Cliente</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>10:00</td>
                        <td>Cancha 1</td>
                        <td>María García</td>
                        <td><span className="badge badge-success">Confirmado</span></td>
                        <td>
                          <button className="btn-icon">✓</button>
                          <button className="btn-icon">✕</button>
                        </td>
                      </tr>
                      <tr>
                        <td>11:00</td>
                        <td>Cancha 2</td>
                        <td>Carlos López</td>
                        <td><span className="badge badge-warning">Pendiente</span></td>
                        <td>
                          <button className="btn-icon">✓</button>
                          <button className="btn-icon">✕</button>
                        </td>
                      </tr>
                      <tr>
                        <td>12:00</td>
                        <td>Cancha 1</td>
                        <td>Ana Martínez</td>
                        <td><span className="badge badge-success">Confirmado</span></td>
                        <td>
                          <button className="btn-icon">✓</button>
                          <button className="btn-icon">✕</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chart Section */}
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">Ocupación Semanal</h2>
                  <select className="select-sm">
                    <option>Esta semana</option>
                    <option>Última semana</option>
                    <option>Último mes</option>
                  </select>
                </div>
                <div className="chart-placeholder">
                  <div className="chart-bars">
                    <div className="chart-bar" style={{height: '60%'}}>L</div>
                    <div className="chart-bar" style={{height: '80%'}}>M</div>
                    <div className="chart-bar" style={{height: '70%'}}>M</div>
                    <div className="chart-bar" style={{height: '90%'}}>J</div>
                    <div className="chart-bar" style={{height: '85%'}}>V</div>
                    <div className="chart-bar" style={{height: '95%'}}>S</div>
                    <div className="chart-bar" style={{height: '75%'}}>D</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3 className="section-title">Acciones Rápidas</h3>
              <div className="action-grid">
                <button className="action-card">
                  <span className="action-icon">➕</span>
                  <span className="action-label">Nueva Reserva</span>
                </button>
                <button className="action-card">
                  <span className="action-icon">📊</span>
                  <span className="action-label">Ver Reportes</span>
                </button>
                <button className="action-card">
                  <span className="action-icon">👥</span>
                  <span className="action-label">Gestionar Usuarios</span>
                </button>
                <button className="action-card">
                  <span className="action-icon">⚙️</span>
                  <span className="action-label">Configuración</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Component Examples */}
      <div className="component-showcase">
        <h2>Componentes UI</h2>
        
        <div className="component-section">
          <h3>Botones</h3>
          <div className="component-row">
            <button className="btn btn-primary">Primario</button>
            <button className="btn btn-secondary">Secundario</button>
            <button className="btn btn-ghost">Ghost</button>
            <button className="btn btn-danger">Peligro</button>
            <button className="btn btn-success">Éxito</button>
          </div>
        </div>

        <div className="component-section">
          <h3>Inputs</h3>
          <div className="component-row">
            <input type="text" className="input" placeholder="Input normal" />
            <select className="select">
              <option>Seleccionar opción</option>
              <option>Opción 1</option>
              <option>Opción 2</option>
            </select>
            <textarea className="textarea" placeholder="Textarea"></textarea>
          </div>
        </div>

        <div className="component-section">
          <h3>Badges</h3>
          <div className="component-row">
            <span className="badge badge-primary">Primario</span>
            <span className="badge badge-success">Éxito</span>
            <span className="badge badge-warning">Advertencia</span>
            <span className="badge badge-danger">Peligro</span>
            <span className="badge badge-info">Info</span>
          </div>
        </div>

        <div className="component-section">
          <h3>Alertas</h3>
          <div className="alert alert-info">
            ℹ️ Esta es una alerta informativa
          </div>
          <div className="alert alert-success">
            ✅ Operación completada exitosamente
          </div>
          <div className="alert alert-warning">
            ⚠️ Advertencia: Revisa esta información
          </div>
          <div className="alert alert-danger">
            ❌ Error: Algo salió mal
          </div>
        </div>
      </div>
    </div>
  )
}