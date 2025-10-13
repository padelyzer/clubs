'use client'

import React from 'react'
import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import { NotificationSystem } from '@/components/notifications/NotificationSystem'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationsDemoPage() {
  const { notifications, removeNotification, success, error, warning, info, clearAll } = useNotifications()

  const mockNotifications = [
    {
      type: 'success' as const,
      title: 'Reserva confirmada',
      message: 'La reserva de Juan Pérez para el 21 de agosto ha sido confirmada exitosamente.',
      action: {
        label: 'Ver detalles',
        onClick: () => console.log('Ver detalles clicked')
      }
    },
    {
      type: 'error' as const,
      title: 'Error en el pago',
      message: 'No se pudo procesar el pago de María González. Verifica la tarjeta.',
      action: {
        label: 'Reintentar',
        onClick: () => console.log('Reintentar clicked')
      }
    },
    {
      type: 'warning' as const,
      title: 'Cancha requiere mantenimiento',
      message: 'La Cancha 2 está programada para mantenimiento mañana a las 8:00 AM.'
    },
    {
      type: 'info' as const,
      title: 'Nueva funcionalidad',
      message: 'Ya está disponible el sistema de reservas grupales con división de pagos.',
      action: {
        label: 'Explorar',
        onClick: () => console.log('Explorar clicked')
      }
    }
  ]

  return (
    <DashboardWithNotifications>
      <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 700, 
            color: '#182A01', 
            marginBottom: '8px' 
          }}>
            Sistema de Notificaciones
          </h1>
          
          <p style={{ 
            color: '#516640', 
            fontSize: '16px', 
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Demo del sistema de notificaciones elegantes integradas. Prueba los diferentes tipos y estilos.
          </p>

          {/* Controls */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            border: '1px solid rgba(164, 223, 78, 0.1)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: '#182A01', 
              marginBottom: '16px' 
            }}>
              Tipos de Notificación
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <button
                onClick={() => success({
                  title: 'Operación exitosa',
                  message: 'La acción se completó correctamente.',
                  action: {
                    label: 'Ver detalles',
                    onClick: () => console.log('Success action')
                  }
                })}
                style={{
                  background: '#34C759',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 590,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                ✅ Éxito
              </button>

              <button
                onClick={() => error({
                  title: 'Error crítico',
                  message: 'Hubo un problema que requiere atención inmediata.',
                  action: {
                    label: 'Solucionar',
                    onClick: () => console.log('Error action')
                  }
                })}
                style={{
                  background: '#FF3B30',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 590,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                ❌ Error
              </button>

              <button
                onClick={() => warning({
                  title: 'Advertencia importante',
                  message: 'Hay algo que requiere tu atención.',
                  duration: 8000
                })}
                style={{
                  background: '#FF9F0A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 590,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                ⚠️ Advertencia
              </button>

              <button
                onClick={() => info({
                  title: 'Información útil',
                  message: 'Te compartimos información relevante sobre el sistema.',
                  duration: 10000
                })}
                style={{
                  background: '#007AFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 590,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                ℹ️ Info
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  mockNotifications.forEach((notif, index) => {
                    setTimeout(() => {
                      addNotification(notif.type, {
                        title: notif.title,
                        message: notif.message,
                        action: notif.action,
                        duration: 0 // Persistent for demo
                      })
                    }, index * 300)
                  })
                }}
                style={{
                  background: 'rgba(164, 223, 78, 0.1)',
                  color: '#182A01',
                  border: '1px solid rgba(164, 223, 78, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                🎭 Mostrar todas
              </button>

              <button
                onClick={clearAll}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#7F1D1D',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                🗑️ Limpiar todas
              </button>

              <button
                onClick={() => info({
                  title: 'Notificación persistente',
                  message: 'Esta notificación no desaparece automáticamente.',
                  duration: 0,
                  action: {
                    label: 'Entendido',
                    onClick: () => console.log('Persistent action')
                  }
                })}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#1E3A8A',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                📌 Persistente
              </button>
            </div>
          </div>

          {/* Features */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(164, 223, 78, 0.1)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: '#182A01', 
              marginBottom: '16px' 
            }}>
              Características del Sistema
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#182A01', marginBottom: '8px' }}>
                  🎨 Diseño Elegante
                </h4>
                <p style={{ fontSize: '13px', color: '#516640', lineHeight: '1.4' }}>
                  Estilo Apple con blur effects, animaciones suaves y colores coherentes con tu brand.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#182A01', marginBottom: '8px' }}>
                  ⚡ Animaciones Fluidas
                </h4>
                <p style={{ fontSize: '13px', color: '#516640', lineHeight: '1.4' }}>
                  Entrada y salida con cubic-bezier, sin interrupciones en la experiencia.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#182A01', marginBottom: '8px' }}>
                  🎯 Acciones Integradas
                </h4>
                <p style={{ fontSize: '13px', color: '#516640', lineHeight: '1.4' }}>
                  Botones de acción opcionales para interactuar directamente desde la notificación.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#182A01', marginBottom: '8px' }}>
                  ⏰ Control de Tiempo
                </h4>
                <p style={{ fontSize: '13px', color: '#516640', lineHeight: '1.4' }}>
                  Auto-dismiss configurable o notificaciones persistentes según la importancia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications} 
        onDismiss={removeNotification}
        position="top-right"
      />
    </DashboardWithNotifications>
  )

  // Helper function for the demo
  function addNotification(
    type: 'success' | 'error' | 'info' | 'warning',
    options: {
      title: string
      message?: string
      duration?: number
      action?: { label: string; onClick: () => void }
    }
  ) {
    const methods = { success, error, warning, info }
    methods[type](options)
  }
}