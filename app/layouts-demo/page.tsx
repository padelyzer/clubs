'use client'

import React, { useState } from 'react'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { CardModern, CardModernHeader, CardModernTitle, CardModernDescription, CardModernContent } from '@/components/design-system/CardModern'
import { ModernPublicLayout } from '@/components/layouts/ModernPublicLayout'
import { ModernDashboardLayout } from '@/components/layouts/ModernDashboardLayout'
import { ModernSuperAdminLayout } from '@/components/layouts/ModernSuperAdminLayout'
import { 
  Layout, Users, Shield, Globe, Settings, Trophy,
  ArrowRight, Check, Zap, Star
} from 'lucide-react'
import { t, formatCurrency, formatNumber } from '@/lib/design-system/localization'

export default function LayoutsDemo() {
  const [activeLayout, setActiveLayout] = useState<'public' | 'dashboard' | 'admin'>('public')

  const layoutOptions = [
    {
      id: 'public' as const,
      name: 'Layout Público',
      description: 'Páginas de inicio, marketing, autenticación',
      icon: <Globe size={20} />,
      color: '#66E7AA',
      features: [
        'Páginas de marketing y landing',
        'Flujos de autenticación de usuarios',
        'Páginas de información pública',
        'Diseño responsivo para móviles',
        'Estructura optimizada para SEO'
      ]
    },
    {
      id: 'dashboard' as const,
      name: 'Panel del Club',
      description: 'Administración y gestión del club',
      icon: <Users size={20} />,
      color: '#A4DF4E',
      features: [
        'Panel de gestión del club',
        'Administración de jugadores y canchas',
        'Organización de torneos',
        'Analíticas y reportes',
        'Notificaciones en tiempo real'
      ]
    },
    {
      id: 'admin' as const,
      name: 'Super Administrador',
      description: 'Administración del sistema completo',
      icon: <Shield size={20} />,
      color: '#182A01',
      features: [
        'Supervisión global del sistema',
        'Gestión de múltiples clubes',
        'Centro de seguridad',
        'Monitoreo del sistema',
        'Analíticas avanzadas'
      ]
    }
  ]

  const sampleContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      maxWidth: '1000px',
    }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '60px 0',
        background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))',
        borderRadius: '24px',
        border: '1px solid rgba(164, 223, 78, 0.2)',
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #182A01 0%, #A4DF4E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '16px',
          letterSpacing: '-0.03em',
        }}>
          {activeLayout === 'public' ? 'Bienvenido a Padelyzer' : 
           activeLayout === 'dashboard' ? 'Panel de Gestión del Club' :
           'Centro de Administración del Sistema'}
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#516640',
          fontWeight: 300,
          maxWidth: '600px',
          margin: '0 auto 32px',
        }}>
          {activeLayout === 'public' ? 'La plataforma definitiva para gestión de clubes de pádel y torneos en México.' :
           activeLayout === 'dashboard' ? 'Administra tu club, jugadores y torneos de manera eficiente.' :
           'Monitorea y gestiona todas las operaciones del sistema en múltiples clubes.'}
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <ButtonModern variant="primary" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
            {activeLayout === 'public' ? 'Comenzar' : 
             activeLayout === 'dashboard' ? 'Ver Analíticas' : 
             'Resumen del Sistema'}
          </ButtonModern>
          <ButtonModern variant="secondary" size="lg">
            {activeLayout === 'public' ? 'Saber Más' : 
             activeLayout === 'dashboard' ? 'Gestionar Canchas' : 
             'Centro de Seguridad'}
          </ButtonModern>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
      }}>
        <CardModern variant="glow" interactive>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#516640', marginBottom: '8px' }}>
                {activeLayout === 'public' ? 'Clubes Activos' : 
                 activeLayout === 'dashboard' ? 'Jugadores Activos' : 
                 'Total de Clubes'}
              </p>
              <p style={{ fontSize: '32px', fontWeight: 700, color: '#182A01' }}>
                {activeLayout === 'public' ? formatNumber(247) : 
                 activeLayout === 'dashboard' ? formatNumber(2847) : 
                 formatNumber(12847)}
              </p>
              <p style={{ fontSize: '13px', color: '#A4DF4E', marginTop: '8px' }}>
                ↑ {activeLayout === 'public' ? '24%' : activeLayout === 'dashboard' ? '12%' : '18%'} crecimiento
              </p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={24} color="#182A01" />
            </div>
          </div>
        </CardModern>

        <CardModern variant="glass" interactive>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#516640', marginBottom: '8px' }}>
                {activeLayout === 'public' ? 'Estados en México' : 
                 activeLayout === 'dashboard' ? 'Torneos' : 
                 'Disponibilidad del Sistema'}
              </p>
              <p style={{ fontSize: '32px', fontWeight: 700, color: '#182A01' }}>
                {activeLayout === 'public' ? '15' : 
                 activeLayout === 'dashboard' ? '8' : 
                 '99.9%'}
              </p>
              <p style={{ fontSize: '13px', color: '#66E7AA', marginTop: '8px' }}>
                {activeLayout === 'public' ? 'Presencia nacional' : 
                 activeLayout === 'dashboard' ? 'Este mes' : 
                 'Últimos 30 días'}
              </p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(164, 223, 78, 0.1)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Trophy size={24} color="#A4DF4E" />
            </div>
          </div>
        </CardModern>

        <CardModern variant="gradient" interactive>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#516640', marginBottom: '8px' }}>
                {activeLayout === 'public' ? 'Satisfacción' : 
                 activeLayout === 'dashboard' ? 'Utilización' : 
                 'Rendimiento'}
              </p>
              <p style={{ fontSize: '32px', fontWeight: 700, color: '#182A01' }}>
                {activeLayout === 'public' ? '4.9★' : 
                 activeLayout === 'dashboard' ? '87%' : 
                 '98.7%'}
              </p>
              <p style={{ fontSize: '13px', color: '#516640', marginTop: '8px' }}>
                {activeLayout === 'public' ? 'Calificación de clientes' : 
                 activeLayout === 'dashboard' ? 'Uso de canchas' : 
                 'Rendimiento del sistema'}
              </p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Star size={24} color="#182A01" />
            </div>
          </div>
        </CardModern>
      </div>

      {/* Feature Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
      }}>
        {Array.from({ length: 3 }, (_, i) => (
          <CardModern key={i} variant="glass" interactive>
            <CardModernHeader>
              <CardModernTitle>
                {activeLayout === 'public' 
                  ? ['Programación Inteligente', 'Gestión de Torneos', 'Panel de Analíticas'][i]
                  : activeLayout === 'dashboard'
                  ? ['Gestión de Canchas', 'Registro de Jugadores', 'Seguimiento de Ingresos'][i]
                  : ['Centro de Seguridad', 'Monitoreo del Sistema', 'Analíticas Globales'][i]
                }
              </CardModernTitle>
              <CardModernDescription>
                {activeLayout === 'public' 
                  ? ['Programación inteligente de canchas', 'Herramientas completas para torneos', 'Insights en tiempo real'][i]
                  : activeLayout === 'dashboard'
                  ? ['Administra todas las reservas de canchas', 'Gestiona membresías de jugadores', 'Rastrea ingresos del club'][i]
                  : ['Características avanzadas de seguridad', 'Salud del sistema en tiempo real', 'Analíticas multiplataforma'][i]
                }
              </CardModernDescription>
            </CardModernHeader>
            <CardModernContent>
              <p style={{ fontSize: '14px', color: '#516640', lineHeight: '1.6', marginBottom: '20px' }}>
                Potencia tu club de pádel con tecnología de vanguardia diseñada específicamente 
                para el mercado mexicano. Optimiza operaciones y mejora la experiencia de tus jugadores.
              </p>
              <ButtonModern variant="secondary" size="sm" icon={<ArrowRight size={16} />} iconPosition="right">
                Saber Más
              </ButtonModern>
            </CardModernContent>
          </CardModern>
        ))}
      </div>
    </div>
  )

  const renderLayout = () => {
    switch (activeLayout) {
      case 'public':
        return (
          <ModernPublicLayout>
            {sampleContent}
          </ModernPublicLayout>
        )
      case 'dashboard':
        return (
          <ModernDashboardLayout 
            clubName="Club Pádel México"
            userName="Administrador del Club"
            userRole="Administrador"
          >
            {sampleContent}
          </ModernDashboardLayout>
        )
      case 'admin':
        return (
          <ModernSuperAdminLayout 
            userName="Super Administrador"
            userRole="Administrador del Sistema"
          >
            {sampleContent}
          </ModernSuperAdminLayout>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Layout Selector */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        background: 'white',
        borderRadius: '16px',
        padding: '8px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(164, 223, 78, 0.1)',
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
        }}>
          {layoutOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveLayout(option.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: activeLayout === option.id 
                  ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.15), rgba(102, 231, 170, 0.1))'
                  : 'transparent',
                border: activeLayout === option.id 
                  ? '1px solid rgba(164, 223, 78, 0.3)'
                  : '1px solid transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: activeLayout === option.id ? 600 : 500,
                color: activeLayout === option.id ? '#182A01' : '#516640',
                minWidth: '120px',
              }}
              onMouseEnter={(e) => {
                if (activeLayout !== option.id) {
                  e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeLayout !== option.id) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                }
              }}
            >
              <div style={{ color: option.color }}>
                {option.icon}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{option.name}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Layout Info */}
        <div style={{
          padding: '16px',
          background: 'rgba(164, 223, 78, 0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(164, 223, 78, 0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: layoutOptions.find(opt => opt.id === activeLayout)?.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Layout size={16} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                {layoutOptions.find(opt => opt.id === activeLayout)?.name}
              </div>
              <div style={{ fontSize: '12px', color: '#516640' }}>
                {layoutOptions.find(opt => opt.id === activeLayout)?.description}
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#182A01', marginBottom: '8px' }}>
              Características Principales:
            </div>
            {layoutOptions.find(opt => opt.id === activeLayout)?.features.map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#516640',
                marginBottom: '4px',
              }}>
                <Check size={12} color="#A4DF4E" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Content */}
      {renderLayout()}
    </div>
  )
}