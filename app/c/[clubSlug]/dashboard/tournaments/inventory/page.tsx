'use client'

import React, { useState } from 'react'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import {
  Code, Database, FileCode, Folder, Package, Play,
  CheckCircle, Clock, Archive, Server, Layers,
  ChevronDown, ChevronRight, ExternalLink
} from 'lucide-react'

export default function TournamentInventoryPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    frontend: true,
    apis: false,
    components: false,
    services: false,
    scripts: false,
    backups: false,
    database: false,
    features: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
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
          📋 Inventario Completo - Módulo de Torneos
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          marginBottom: '16px'
        }}>
          Catálogo completo de todos los recursos, APIs, componentes y datos del sistema de torneos
        </p>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { label: 'APIs', value: '48', color: '#10B981', icon: Server },
          { label: 'Componentes', value: '10', color: '#3B82F6', icon: Package },
          { label: 'Scripts', value: '20+', color: '#F59E0B', icon: Play },
          { label: 'Backups', value: '27+', color: '#8B5CF6', icon: Archive },
          { label: 'Modelos DB', value: '5', color: '#EF4444', icon: Database }
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <Icon size={24} style={{ color: stat.color, margin: '0 auto 8px' }} />
              <div style={{
                fontSize: '28px',
                fontWeight: 700,
                color: stat.color,
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* FRONTEND PAGES */}
      <InventorySection
        title="📱 Frontend Pages (App Router)"
        icon={Layers}
        expanded={expandedSections.frontend}
        onToggle={() => toggleSection('frontend')}
      >
        <div style={{ display: 'grid', gap: '12px' }}>
          <FileItem name="page.tsx" status="active" path="/dashboard/tournaments">
            Lista de torneos (V2 - CardModern)
          </FileItem>
          <FileItem name="[id]/page.tsx" status="active" path="/dashboard/tournaments/tournament_active_1759786489416">
            Detalle de torneo (V2 - Tabla completa)
          </FileItem>
          <FileItem name="layout.tsx" status="active">
            Layout wrapper
          </FileItem>
          <FileItem name="preview/page.tsx" status="preview" path="/dashboard/tournaments/preview">
            Preview UI verde oscuro
          </FileItem>
          <FileItem name="ui-gallery/page.tsx" status="preview" path="/dashboard/tournaments/ui-gallery">
            Galería de UIs
          </FileItem>
        </div>
      </InventorySection>

      {/* API ROUTES */}
      <InventorySection
        title="🔧 API Routes (48 endpoints)"
        icon={Server}
        expanded={expandedSections.apis}
        onToggle={() => toggleSection('apis')}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <APIGroup title="Core APIs">
            <APIItem>GET/POST /api/tournaments - Lista y creación</APIItem>
            <APIItem>GET/PUT/DELETE /api/tournaments/[id] - CRUD torneo</APIItem>
            <APIItem>GET/POST /api/tournaments/[id]/registrations - Inscripciones</APIItem>
            <APIItem>GET /api/tournaments/[id]/conflicts - Gestión de conflictos</APIItem>
            <APIItem>GET /api/tournaments/[id]/qr - Códigos QR</APIItem>
          </APIGroup>

          <APIGroup title="APIs Avanzadas">
            <APIItem>POST /api/tournaments/[id]/advance-round - Avanzar ronda</APIItem>
            <APIItem>POST /api/tournaments/[id]/auto-schedule - Auto-programación</APIItem>
            <APIItem>GET /api/tournaments/[id]/current-match - Partido actual</APIItem>
            <APIItem>POST /api/tournaments/[id]/notifications - Notificaciones</APIItem>
            <APIItem>POST /api/tournaments/[id]/resolve-conflict - Resolver conflictos</APIItem>
            <APIItem>PUT /api/tournaments/[id]/matches/[matchId]/schedule - Programar</APIItem>
          </APIGroup>

          <APIGroup title="APIs de Cancha">
            <APIItem>GET /api/tournaments/courts/[qrCode]/current-match - Partido en cancha</APIItem>
            <APIItem>POST /api/tournaments/courts/[qrCode]/submit-result - Subir resultado</APIItem>
            <APIItem>POST /api/tournaments/courts/qr - Gestión de QR</APIItem>
          </APIGroup>

          <APIGroup title="APIs de Desarrollo">
            <APIItem>GET /api/tournaments/debug - Debug info</APIItem>
            <APIItem>GET /api/tournaments/dev - Dev mode</APIItem>
            <APIItem>POST /api/tournaments/setup-package - Setup inicial</APIItem>
          </APIGroup>

          <APIGroup title="APIs Públicas">
            <APIItem>GET /api/public/tournaments/[id] - Vista pública</APIItem>
          </APIGroup>
        </div>
      </InventorySection>

      {/* COMPONENTS */}
      <InventorySection
        title="📦 Componentes (10 archivos)"
        icon={Package}
        expanded={expandedSections.components}
        onToggle={() => toggleSection('components')}
      >
        <div style={{ display: 'grid', gap: '12px' }}>
          <FileItem name="TournamentManagement.tsx" status="active">
            Gestión completa de torneo
          </FileItem>
          <FileItem name="TournamentCreationWizard.tsx" status="active">
            Wizard de creación multi-step
          </FileItem>
          <FileItem name="TournamentDetails.tsx" status="active">
            Vista de detalles
          </FileItem>
          <FileItem name="TournamentEditor.tsx" status="active">
            Editor de configuración
          </FileItem>
          <FileItem name="TournamentNavigation.tsx" status="active">
            Sistema de navegación
          </FileItem>
          <FileItem name="tournament-qr.tsx" status="active">
            Sistema de códigos QR
          </FileItem>
          <FileItem name="TournamentBracketModal.tsx" status="active">
            Modal de bracket
          </FileItem>
        </div>
      </InventorySection>

      {/* SERVICES */}
      <InventorySection
        title="🗄️ Servicios (1 archivo)"
        icon={Code}
        expanded={expandedSections.services}
        onToggle={() => toggleSection('services')}
      >
        <FileItem name="tournament-notification-service.ts" status="active">
          Sistema completo de notificaciones para torneos (email, SMS, push)
        </FileItem>
      </InventorySection>

      {/* SCRIPTS */}
      <InventorySection
        title="📝 Scripts (20+ utilidades)"
        icon={Play}
        expanded={expandedSections.scripts}
        onToggle={() => toggleSection('scripts')}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
              Scripts Activos:
            </h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              <FileItem name="seed-tournament-complete.ts" status="active">
                Seed completo con 16 equipos y bracket
              </FileItem>
              <FileItem name="seed-tournament-test.ts" status="active">
                Test básico de creación
              </FileItem>
              <FileItem name="enable-tournaments-module.ts" status="active">
                Habilitar módulo en club
              </FileItem>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
              Scripts Archivados (batch-2024-maintenance):
            </h4>
            <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.8 }}>
              • add-group-stage-tournament.ts<br />
              • clean-empty-tournaments.ts<br />
              • delete-tournament-matches.ts<br />
              • get-tournament-urls.ts<br />
              • rename-tournaments.ts<br />
              • reprogram-tournament.ts<br />
              • setup-tournament-demo.ts<br />
              • update-tournament-fees.ts<br />
              • validate-tournament.ts
            </div>
          </div>
        </div>
      </InventorySection>

      {/* BACKUPS */}
      <InventorySection
        title="💾 Backups (27+ archivos)"
        icon={Archive}
        expanded={expandedSections.backups}
        onToggle={() => toggleSection('backups')}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              V2 Backup (tournament-v2/):
            </h4>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
              27 archivos tsx incluyendo: BracketVisualization, MatchQRCode, PlayerRankings, QRCheckIn, TournamentCreationWizard, TournamentEditor
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              V3 Backup (tournament-v3-broken/):
            </h4>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
              Versión más avanzada con dev mode, today view, match capture (requiere reparación)
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              Archivos sueltos:
            </h4>
            <FileItem name="TournamentManagement.backup.tsx" status="backup">
              134KB - Versión completa con UI verde oscuro profesional
            </FileItem>
          </div>
        </div>
      </InventorySection>

      {/* DATABASE */}
      <InventorySection
        title="📊 Base de Datos (Prisma Schema)"
        icon={Database}
        expanded={expandedSections.database}
        onToggle={() => toggleSection('database')}
      >
        <div style={{ display: 'grid', gap: '12px' }}>
          <DBModel name="Tournament">Torneo principal con configuración, fechas, premios</DBModel>
          <DBModel name="TournamentMatch">Partidos individuales con scores, estado, cancha</DBModel>
          <DBModel name="TournamentRegistration">Inscripciones de equipos con pago y check-in</DBModel>
          <DBModel name="TournamentRound">Rondas del torneo (octavos, cuartos, etc.)</DBModel>
          <DBModel name="TournamentRoundCourt">Asignación de canchas por ronda</DBModel>
          <DBModel name="TournamentMatchResult">Resultados detallados y conflictos</DBModel>
        </div>
      </InventorySection>

      {/* FEATURES */}
      <InventorySection
        title="🎯 Funcionalidades Implementadas"
        icon={CheckCircle}
        expanded={expandedSections.features}
        onToggle={() => toggleSection('features')}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#10B981',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={16} />
              ✅ Funcionando (10 features):
            </h4>
            <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.8 }}>
              1. Lista de torneos - Grid con cards<br />
              2. Detalle de torneo - Tabla de partidos completa<br />
              3. API completa - 48 endpoints<br />
              4. Sistema de inscripciones<br />
              5. Gestión de conflictos<br />
              6. Códigos QR para canchas y check-in<br />
              7. Auto-programación de partidos<br />
              8. Sistema de notificaciones<br />
              9. Avance de rondas<br />
              10. Exportar CSV
            </div>
          </div>

          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#F59E0B',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Clock size={16} />
              🔄 En Backups (requieren adaptación):
            </h4>
            <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.8 }}>
              1. Wizard de creación multi-step<br />
              2. Visualización de bracket<br />
              3. Rankings de jugadores<br />
              4. Check-in masivo con QR<br />
              5. Captura de resultados por cancha<br />
              6. Vista "hoy" de partidos
            </div>
          </div>
        </div>
      </InventorySection>

      {/* Data in DB */}
      <CardModern variant="glass" padding="lg" style={{ marginTop: '24px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Database size={18} />
          🚀 Datos de Prueba Actual en DB
        </h3>
        <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.8 }}>
          1. <strong>Torneo Demo v3</strong> (ACTIVE)<br />
          2. <strong>Copa Primavera 2025</strong> (UPCOMING)<br />
          3. <strong>Torneo Invierno 2024</strong> (COMPLETED)<br />
          4. <strong>Torneo Activo Demo</strong> (ACTIVE) - 16 equipos, 15 partidos con datos completos
        </div>
      </CardModern>
    </div>
  )
}

// Helper Components
function InventorySection({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children
}: {
  title: string
  icon: any
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <CardModern variant="glass" padding="none" style={{ marginBottom: '16px', overflow: 'hidden' }}>
      <div
        onClick={onToggle}
        style={{
          padding: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: expanded ? '#F9FAFB' : 'transparent',
          borderBottom: expanded ? '1px solid #E5E7EB' : 'none',
          transition: 'all 0.2s'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Icon size={20} style={{ color: '#10B981' }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>
            {title}
          </h3>
        </div>
        {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </div>
      {expanded && (
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      )}
    </CardModern>
  )
}

function FileItem({
  name,
  status,
  path,
  children
}: {
  name: string
  status: 'active' | 'preview' | 'backup'
  path?: string
  children: React.ReactNode
}) {
  const statusColors = {
    active: { bg: '#10B981', text: 'Activo' },
    preview: { bg: '#3B82F6', text: 'Preview' },
    backup: { bg: '#F59E0B', text: 'Backup' }
  }
  const { bg, text } = statusColors[status]

  return (
    <div style={{
      padding: '12px',
      background: '#F9FAFB',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '4px'
        }}>
          <FileCode size={16} style={{ color: '#6B7280', flexShrink: 0 }} />
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#111827',
            fontFamily: 'monospace'
          }}>
            {name}
          </span>
          <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            background: bg,
            color: 'white',
            fontSize: '10px',
            fontWeight: 600
          }}>
            {text}
          </span>
        </div>
        <p style={{
          fontSize: '12px',
          color: '#6B7280',
          margin: 0,
          paddingLeft: '28px'
        }}>
          {children}
        </p>
      </div>
      {path && (
        <a
          href={`http://localhost:3000${path}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            background: '#10B981',
            color: 'white',
            fontSize: '12px',
            fontWeight: 500,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0
          }}
        >
          Ver
          <ExternalLink size={12} />
        </a>
      )}
    </div>
  )
}

function APIGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div>
      <h4 style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#111827',
        marginBottom: '8px'
      }}>
        {title}
      </h4>
      <div style={{
        display: 'grid',
        gap: '6px',
        paddingLeft: '16px'
      }}>
        {children}
      </div>
    </div>
  )
}

function APIItem({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '13px',
      color: '#6B7280',
      fontFamily: 'monospace',
      padding: '4px 0'
    }}>
      • {children}
    </div>
  )
}

function DBModel({ name, children }: { name: string, children: React.ReactNode }) {
  return (
    <div style={{
      padding: '12px',
      background: '#F9FAFB',
      borderRadius: '8px'
    }}>
      <div style={{
        fontSize: '13px',
        fontWeight: 600,
        color: '#111827',
        fontFamily: 'monospace',
        marginBottom: '4px'
      }}>
        model {name}
      </div>
      <div style={{
        fontSize: '12px',
        color: '#6B7280'
      }}>
        {children}
      </div>
    </div>
  )
}
