'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, MessageCircle, Eye, Clock, CheckCircle, XCircle, ExternalLink, TrendingUp } from 'lucide-react'
import { AppleButton, AppleIconButton } from '@/components/design-system/AppleButton'
import { AppleInput, AppleSelect } from '@/components/design-system/AppleInput'
import { SettingsCard, SettingsRow } from '@/components/design-system/SettingsCard'
import { EmptyState } from '@/components/design-system/EmptyState'

interface NotificationStats {
  totals: {
    sent: number
    clicked: number
    expired: number
    pending: number
  }
  rates: {
    clickRate: string
    expiredRate: string
    pendingRate: string
  }
  breakdown: Record<string, number>
}

interface Notification {
  id: string
  type: string
  status: string
  recipient: string
  recipientPhone: string
  title: string
  message: string
  whatsappLink: string
  linkClicked: boolean
  clickedAt: string | null
  linkExpiredAt: string | null
  createdAt: string
  isExpired: boolean
  bookingInfo?: {
    id: string
    date: string
    startTime: string
    court?: { name: string }
  }
}

export function WhatsAppDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'notifications' | 'settings'>('overview')
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: '',
    type: '',
    page: 1
  })
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [savingNumber, setSavingNumber] = useState(false)

  useEffect(() => {
    loadStats()
    loadNotifications()
    loadClubSettings()
  }, [filter])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/notifications/whatsapp/stats?days=7')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: filter.page.toString(),
        limit: '20'
      })
      
      if (filter.status) params.append('status', filter.status)
      if (filter.type) params.append('type', filter.type)

      const response = await fetch(`/api/notifications/whatsapp/list?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data.notifications)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadClubSettings = async () => {
    try {
      const response = await fetch('/api/club/settings')
      if (response.ok) {
        const data = await response.json()
        setWhatsappNumber(data.whatsappNumber || '')
      }
    } catch (error) {
      console.error('Error loading club settings:', error)
    }
  }

  const saveWhatsAppNumber = async () => {
    try {
      setSavingNumber(true)
      const response = await fetch('/api/club/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber })
      })

      if (response.ok) {
        alert('Número de WhatsApp guardado exitosamente')
      } else {
        alert('Error guardando el número')
      }
    } catch (error) {
      console.error('Error saving WhatsApp number:', error)
      alert('Error guardando el número')
    } finally {
      setSavingNumber(false)
    }
  }

  const trackLinkClick = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/whatsapp/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      
      // Reload notifications to show updated status
      loadNotifications()
    } catch (error) {
      console.error('Error tracking link click:', error)
    }
  }

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired) {
      return (
        <span style={{
          padding: '2px 8px',
          backgroundColor: '#F2F2F7',
          color: '#8E8E93',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 500
        }}>
          Expirado
        </span>
      )
    }

    const statusStyles = {
      link_generated: { bg: '#E8F5E9', color: '#2E7D32', label: 'Generado' },
      delivered: { bg: '#E3FCE9', color: '#00C853', label: 'Entregado' },
      failed: { bg: '#FFEBE9', color: '#FF3B30', label: 'Fallido' },
      expired: { bg: '#F2F2F7', color: '#8E8E93', label: 'Expirado' },
      pending: { bg: '#FFF8E1', color: '#F57C00', label: 'Pendiente' }
    }

    const style = statusStyles[status] || { bg: '#F2F2F7', color: '#8E8E93', label: status }

    return (
      <span style={{
        padding: '2px 8px',
        backgroundColor: style.bg,
        color: style.color,
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 500
      }}>
        {style.label}
      </span>
    )
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      'BOOKING_CONFIRMATION': 'Confirmación',
      'PAYMENT_REMINDER': 'Recordatorio',
      'BOOKING_CANCELLATION': 'Cancelación',
      'SPLIT_PAYMENT_REQUEST': 'Pago Dividido',
      'SPLIT_PAYMENT_COMPLETED': 'Pago Completado',
      'GENERAL': 'General'
    }
    return labels[type as keyof typeof labels] || type
  }

  if (!stats) {
    return <div style={{ padding: '20px' }}>Cargando dashboard de WhatsApp...</div>
  }

  // Tab Navigation
  const renderTabs = () => (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '1px solid #E5E5E7',
      paddingBottom: '0'
    }}>
      {['overview', 'notifications', 'settings'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab as any)}
          style={{
            padding: '12px 20px',
            background: activeTab === tab ? 'white' : 'transparent',
            border: 'none',
            borderBottom: activeTab === tab ? '2px solid #66E7AA' : 'none',
            color: activeTab === tab ? '#1C1C1E' : '#8E8E93',
            fontSize: '14px',
            fontWeight: activeTab === tab ? 600 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '-1px'
          }}
        >
          {tab === 'overview' && 'Resumen'}
          {tab === 'notifications' && 'Notificaciones'}
          {tab === 'settings' && 'Configuración'}
        </button>
      ))}
    </div>
  )

  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <SettingsCard title="Links Generados" noPadding>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#1C1C1E' }}>
              {stats.totals.sent}
            </div>
            <p style={{ color: '#8E8E93', fontSize: '13px', marginTop: '4px' }}>
              Últimos 7 días
            </p>
          </div>
        </SettingsCard>

        <SettingsCard title="Links Clickeados" noPadding>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#00C853' }}>
              {stats.totals.clicked}
            </div>
            <p style={{ color: '#8E8E93', fontSize: '13px', marginTop: '4px' }}>
              Tasa: {stats.rates.clickRate}
            </p>
          </div>
        </SettingsCard>

        <SettingsCard title="Pendientes" noPadding>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#F57C00' }}>
              {stats.totals.pending}
            </div>
            <p style={{ color: '#8E8E93', fontSize: '13px', marginTop: '4px' }}>
              Sin clickear
            </p>
          </div>
        </SettingsCard>

        <SettingsCard title="Expirados" noPadding>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#8E8E93' }}>
              {stats.totals.expired}
            </div>
            <p style={{ color: '#8E8E93', fontSize: '13px', marginTop: '4px' }}>
              Tasa: {stats.rates.expiredRate}
            </p>
          </div>
        </SettingsCard>
      </div>

      {/* Info Alert */}
      <SettingsCard
        title="Información"
        description="Cómo funciona el sistema de WhatsApp"
      >
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <AlertCircle size={20} color="#3B82F6" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', color: '#1C1C1E', marginBottom: '8px' }}>
              Los links de WhatsApp se generan automáticamente para reservas, pagos y notificaciones.
            </p>
            <p style={{ fontSize: '13px', color: '#8E8E93' }}>
              Los usuarios pueden hacer clic en los links para abrir WhatsApp con un mensaje predefinido 
              y comenzar una conversación directa con tu club.
            </p>
          </div>
        </div>
      </SettingsCard>
    </div>
  )

  const renderNotifications = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Filters */}
      <SettingsCard title="Filtros" description="Filtra las notificaciones por estado y tipo">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <AppleSelect
            label="Estado"
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            options={[
              { value: '', label: 'Todos' },
              { value: 'link_generated', label: 'Generado' },
              { value: 'delivered', label: 'Entregado' },
              { value: 'expired', label: 'Expirado' },
              { value: 'failed', label: 'Fallido' }
            ]}
          />

          <AppleSelect
            label="Tipo"
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value, page: 1 }))}
            options={[
              { value: '', label: 'Todos' },
              { value: 'BOOKING_CONFIRMATION', label: 'Confirmación' },
              { value: 'PAYMENT_REMINDER', label: 'Recordatorio' },
              { value: 'SPLIT_PAYMENT_REQUEST', label: 'Pago Dividido' },
              { value: 'BOOKING_CANCELLATION', label: 'Cancelación' }
            ]}
          />
        </div>
      </SettingsCard>

      {/* Notifications List */}
      <SettingsCard
        title="Notificaciones Recientes"
        description="Historial de links de WhatsApp generados"
        noPadding
      >
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8E8E93' }}>
            Cargando notificaciones...
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={24} />}
            title="No hay notificaciones"
            description="Los links de WhatsApp aparecerán aquí cuando se generen"
            compact
          />
        ) : (
          <div style={{ padding: '8px' }}>
            {notifications.map((notification) => (
              <SettingsRow
                key={notification.id}
                label={
                  <div>
                    <div style={{ fontWeight: 500, color: '#1C1C1E' }}>
                      {getTypeLabel(notification.type)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8E8E93', marginTop: '2px' }}>
                      {notification.recipient} • {notification.recipientPhone}
                    </div>
                  </div>
                }
                value={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getStatusBadge(notification.status, notification.isExpired)}
                    <span style={{ fontSize: '12px', color: '#8E8E93' }}>
                      {new Date(notification.createdAt).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                }
              >
                {notification.whatsappLink && (
                  <AppleIconButton
                    icon={<ExternalLink size={14} />}
                    size="small"
                    variant="secondary"
                    onClick={() => window.open(notification.whatsappLink, '_blank')}
                  />
                )}
                {!notification.linkClicked && !notification.isExpired && (
                  <AppleIconButton
                    icon={<Eye size={14} />}
                    size="small"
                    variant="primary"
                    onClick={() => trackLinkClick(notification.id)}
                  />
                )}
              </SettingsRow>
            ))}
          </div>
        )}
      </SettingsCard>
    </div>
  )

  const renderSettings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SettingsCard
        title="Configuración de WhatsApp"
        description="Configura el número de WhatsApp de tu club para los links de notificaciones"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <AppleInput
            label="Número de WhatsApp del Club"
            placeholder="+52XXXXXXXXXX"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            helper="Formato: +52XXXXXXXXXX (con código de país de México)"
          />

          <AppleButton 
            onClick={saveWhatsAppNumber} 
            loading={savingNumber}
          >
            {savingNumber ? 'Guardando...' : 'Guardar Configuración'}
          </AppleButton>

          <div style={{
            padding: '16px',
            backgroundColor: '#FFF8E1',
            borderRadius: '10px',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertCircle size={20} color="#F57C00" />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '14px', color: '#1C1C1E' }}>Importante:</strong>
                <p style={{ fontSize: '13px', color: '#8E8E93', marginTop: '4px' }}>
                  Los links de WhatsApp dirigen a los usuarios a iniciar una conversación 
                  con el número configurado aquí. Asegúrate de que alguien en tu equipo pueda responder 
                  a estos mensajes durante el horario de atención.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1C1C1E' }}>
          Dashboard de WhatsApp
        </h2>
        <p style={{ color: '#8E8E93', fontSize: '14px' }}>
          Gestiona las notificaciones de WhatsApp de tu club
        </p>
      </div>

      {renderTabs()}

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'notifications' && renderNotifications()}
      {activeTab === 'settings' && renderSettings()}
    </div>
  )
}