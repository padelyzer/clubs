'use client'

import React from 'react'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { Trophy, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react'

export default function TournamentPreviewPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F9FAFB',
      padding: '32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#111827',
        marginBottom: '8px'
      }}>
        UI Preview - Tonos Verde Oscuro
      </h1>
      <p style={{
        fontSize: '14px',
        color: '#6B7280',
        marginBottom: '32px'
      }}>
        Esta es la UI profesional con tonos oscuros de verde del backup
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Left Column */}
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Tournament Details Card */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>
                <Trophy size={20} />
                Información del Torneo
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{
                  padding: '12px',
                  background: '#F9FAFB',
                  borderRadius: '8px'
                }}>
                  <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                    Torneo Activo Demo - Sistema completo de gestión de torneos
                  </p>
                </div>

                {/* Key metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px'
                }}>
                  <div style={{
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                      Tipo
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                      Eliminación
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                      Inscripción
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#059669' }}>
                      $500.00
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                      Premios
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#DC2626' }}>
                      $3,000.00
                    </div>
                  </div>
                </div>

                {/* Progress Metrics */}
                <div style={{
                  padding: '16px',
                  background: '#F9FAFB',
                  borderRadius: '8px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                      Inscripciones Confirmadas
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#10B981' }}>
                      16 / 16
                    </div>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      background: '#E5E7EB',
                      borderRadius: '2px',
                      marginTop: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: '#10B981'
                      }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                      Partidos Completados
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#3B82F6' }}>
                      14 / 15
                    </div>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      background: '#E5E7EB',
                      borderRadius: '2px',
                      marginTop: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '93%',
                        height: '100%',
                        background: '#3B82F6'
                      }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                      Check-ins Realizados
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#8B5CF6' }}>
                      16 / 16
                    </div>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      background: '#E5E7EB',
                      borderRadius: '2px',
                      marginTop: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: '#8B5CF6'
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Dates Card - WITH DARK GREEN THEME */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>
                <Calendar size={20} />
                Calendario
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                <div style={{
                  padding: '10px',
                  background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                  borderRadius: '8px',
                  borderLeft: '3px solid #10B981',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#059669', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Inicio
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#065F46' }}>
                    6 oct
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669' }}>
                    dom
                  </div>
                </div>

                <div style={{
                  padding: '10px',
                  background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                  borderRadius: '8px',
                  borderLeft: '3px solid #EF4444',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#DC2626', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Fin
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>
                    8 oct
                  </div>
                  <div style={{ fontSize: '11px', color: '#DC2626' }}>
                    mar
                  </div>
                </div>

                <div style={{
                  padding: '10px',
                  background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                  borderRadius: '8px',
                  borderLeft: '3px solid #F59E0B',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#D97706', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Cierre Inscr.
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>
                    5 oct
                  </div>
                  <div style={{ fontSize: '11px', color: '#D97706' }}>
                    sáb
                  </div>
                </div>
              </div>
            </CardModernContent>
          </CardModern>
        </div>

        {/* Right Column - Stats Sidebar */}
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Participation Card - WITH DARK GREEN */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>
                <Users size={20} />
                Participación
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: '#10B981',
                  lineHeight: 1
                }}>
                  16
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  marginTop: '8px'
                }}>
                  de 16 equipos
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#E5E7EB',
                  borderRadius: '4px',
                  marginTop: '16px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Financial Summary - WITH DARK GREEN */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>
                <DollarSign size={20} />
                Resumen Financiero
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>Ingresos Confirmados:</span>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#10B981' }}>
                    $8,000.00
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>Pagos Pendientes:</span>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#F59E0B' }}>
                    $0.00
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>Pagos Completados:</span>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#065F46' }}>
                    16
                  </span>
                </div>
                <div style={{
                  marginTop: '8px',
                  paddingTop: '16px',
                  borderTop: '1px solid #E5E7EB'
                }}>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                    Balance Total
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>
                    $8,000.00
                  </div>
                </div>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Quick Actions - WITH DARK GREEN BUTTON */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>
                <TrendingUp size={20} />
                Acciones Rápidas
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'grid', gap: '12px' }}>
                <button
                  style={{
                    padding: '12px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Ver Resultados
                </button>

                <button
                  style={{
                    padding: '12px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Generar Bracket
                </button>
              </div>
            </CardModernContent>
          </CardModern>
        </div>
      </div>

      {/* Color Palette Reference */}
      <CardModern>
        <CardModernHeader>
          <CardModernTitle>
            Paleta de Colores Verde Oscuro
          </CardModernTitle>
        </CardModernHeader>
        <CardModernContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100%',
                height: '80px',
                background: '#10B981',
                borderRadius: '8px',
                marginBottom: '8px'
              }} />
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>#10B981</div>
              <div style={{ fontSize: '10px', color: '#6B7280' }}>Verde Principal</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100%',
                height: '80px',
                background: '#059669',
                borderRadius: '8px',
                marginBottom: '8px'
              }} />
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>#059669</div>
              <div style={{ fontSize: '10px', color: '#6B7280' }}>Verde Medio</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100%',
                height: '80px',
                background: '#065F46',
                borderRadius: '8px',
                marginBottom: '8px'
              }} />
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>#065F46</div>
              <div style={{ fontSize: '10px', color: '#6B7280' }}>Verde Oscuro</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100%',
                height: '80px',
                background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                borderRadius: '8px',
                marginBottom: '8px',
                border: '1px solid #E5E7EB'
              }} />
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>Gradiente</div>
              <div style={{ fontSize: '10px', color: '#6B7280' }}>Fondo Claro</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100%',
                height: '80px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                borderRadius: '8px',
                marginBottom: '8px'
              }} />
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>Gradiente</div>
              <div style={{ fontSize: '10px', color: '#6B7280' }}>Botones</div>
            </div>
          </div>
        </CardModernContent>
      </CardModern>
    </div>
  )
}
