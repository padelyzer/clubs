'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ExternalLink, Trophy, Calendar, Users, QrCode, Target, FileSpreadsheet } from 'lucide-react'

interface UICard {
  id: string
  title: string
  description: string
  link: string
  status: 'active' | 'backup' | 'preview'
  icon: any
  features: string[]
}

const uiGallery: UICard[] = [
  {
    id: 'list-v2',
    title: 'Lista de Torneos V2',
    description: 'UI actual con CardModern y design system',
    link: '/dashboard/tournaments',
    status: 'active',
    icon: Trophy,
    features: ['Grid de cards', 'Status badges', 'Filtros por estado', 'Design system colors']
  },
  {
    id: 'detail-v2',
    title: 'Detalle de Torneo V2',
    description: 'Página de detalle con tabla de partidos completa',
    link: '/dashboard/tournaments/tournament_active_1759786489416',
    status: 'active',
    icon: FileSpreadsheet,
    features: ['Tabla de partidos', 'Filtros avanzados', 'Estadísticas', 'Export CSV']
  },
  {
    id: 'preview-green',
    title: 'UI Verde Oscuro',
    description: 'Diseño profesional con paleta verde oscuro',
    link: '/dashboard/tournaments/preview',
    status: 'preview',
    icon: Target,
    features: ['Verde #10B981', 'Verde #059669', 'Verde #065F46', 'Gradientes']
  },
  {
    id: 'bracket',
    title: 'Visualización de Bracket',
    description: 'Vista de eliminación con conexiones entre partidos',
    link: '/dashboard/tournaments/ui-gallery/bracket',
    status: 'backup',
    icon: Target,
    features: ['Eliminación visual', 'Rounds conectados', 'Final destacada', 'Interactive']
  },
  {
    id: 'qr-checkin',
    title: 'Check-in con QR',
    description: 'Sistema de check-in rápido con códigos QR',
    link: '/dashboard/tournaments/ui-gallery/qr-checkin',
    status: 'backup',
    icon: QrCode,
    features: ['Scan QR', 'Check-in masivo', 'Estado en tiempo real', 'Mobile friendly']
  },
  {
    id: 'rankings',
    title: 'Rankings de Jugadores',
    description: 'Tabla de posiciones y estadísticas',
    link: '/dashboard/tournaments/ui-gallery/rankings',
    status: 'backup',
    icon: Users,
    features: ['Tabla ordenable', 'Estadísticas', 'Victorias/Derrotas', 'Puntos']
  },
  {
    id: 'creation-wizard',
    title: 'Wizard de Creación',
    description: 'Asistente paso a paso para crear torneos',
    link: '/dashboard/tournaments/ui-gallery/wizard',
    status: 'backup',
    icon: Calendar,
    features: ['Multi-step', 'Validación', 'Preview final', 'Tipos de torneo']
  }
]

export default function UIGalleryPage() {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#10B981', text: 'Activa' }
      case 'preview':
        return { bg: '#3B82F6', text: 'Preview' }
      case 'backup':
        return { bg: '#F59E0B', text: 'Backup' }
      default:
        return { bg: '#6B7280', text: 'Unknown' }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
      padding: '32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#111827',
          letterSpacing: '-0.03em',
          marginBottom: '8px'
        }}>
          🎨 Galería de UIs de Torneos
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          marginBottom: '16px'
        }}>
          Explora todas las interfaces de usuario disponibles en el sistema
        </p>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {['active', 'preview', 'backup'].map(status => {
            const { bg, text } = getStatusColor(status)
            return (
              <div key={status} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: bg
                }} />
                <span style={{
                  fontSize: '14px',
                  color: '#6B7280'
                }}>
                  {text}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* UI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '24px'
      }}>
        {uiGallery.map((ui) => {
          const Icon = ui.icon
          const { bg, text } = getStatusColor(ui.status)

          return (
            <CardModern
              key={ui.id}
              variant="glass"
              padding="lg"
              interactive
              onClick={() => router.push(ui.link)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              {/* Status badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '4px 12px',
                borderRadius: '12px',
                background: bg,
                color: 'white',
                fontSize: '11px',
                fontWeight: 600
              }}>
                {text}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={24} color="white" />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '4px'
                  }}>
                    {ui.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    lineHeight: 1.5
                  }}>
                    {ui.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px'
              }}>
                {ui.features.map((feature, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#F3F4F6',
                      color: '#4B5563',
                      fontSize: '12px',
                      fontWeight: 500
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Link */}
              <div style={{
                paddingTop: '12px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  fontSize: '13px',
                  color: '#059669',
                  fontWeight: 500
                }}>
                  Ver interfaz
                </span>
                <ExternalLink size={16} style={{ color: '#059669' }} />
              </div>
            </CardModern>
          )
        })}
      </div>

      {/* Additional Info */}
      <CardModern variant="glass" padding="lg" style={{ marginTop: '32px' }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Trophy size={20} color="white" />
          </div>
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '8px'
            }}>
              Nota sobre las UIs
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              lineHeight: 1.6
            }}>
              • <strong>Activa:</strong> UI en producción, completamente funcional<br />
              • <strong>Preview:</strong> Vista previa de diseños alternativos<br />
              • <strong>Backup:</strong> Componentes archivados que requieren adaptación
            </p>
          </div>
        </div>
      </CardModern>
    </div>
  )
}
