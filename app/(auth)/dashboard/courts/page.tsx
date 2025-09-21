'use client'

import React, { useState } from 'react'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { CardModern, CardModernHeader, CardModernTitle, CardModernDescription, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { 
  Grid3x3, Plus, Edit, MapPin, Home, 
  Hash, Check, X, Calendar, Users, Activity,
  TrendingUp, Clock, Zap
} from 'lucide-react'
import { formatCurrency, formatNumber, t } from '@/lib/design-system/localization'

// Mock data para diseño
const mockClub = {
  id: "club-1",
  name: "Club Pádel México",
  courts: [
    {
      id: "court-1",
      name: "Cancha Central",
      description: "Cancha principal con iluminación LED",
      surface: "artificial_grass",
      isIndoor: false,
      hasLighting: true,
      isActive: true,
      order: 1,
      hourlyRate: 250,
      utilizationRate: 87,
      todayBookings: 8,
      monthlyRevenue: 12500
    },
    {
      id: "court-2", 
      name: "Cancha Norte",
      description: "Cancha cubierta ideal para clima",
      surface: "artificial_grass",
      isIndoor: true,
      hasLighting: true,
      isActive: true,
      order: 2,
      hourlyRate: 300,
      utilizationRate: 92,
      todayBookings: 10,
      monthlyRevenue: 18000
    },
    {
      id: "court-3",
      name: "Cancha Sur",
      description: "En mantenimiento esta semana",
      surface: "artificial_grass", 
      isIndoor: false,
      hasLighting: false,
      isActive: false,
      order: 3,
      hourlyRate: 200,
      utilizationRate: 0,
      todayBookings: 0,
      monthlyRevenue: 5200
    }
  ]
}

export default function CourtsPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingCourt, setEditingCourt] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCreateCourt = async (formData: any) => {
    setLoading(true)
    // Simular creación
    setTimeout(() => {
      setLoading(false)
      setIsCreating(false)
      alert('¡Cancha creada exitosamente!')
    }, 1000)
  }

  const handleUpdateCourt = async (courtId: string, formData: any) => {
    setLoading(true)
    // Simular actualización
    setTimeout(() => {
      setLoading(false)
      setEditingCourt(null)
      alert('¡Cancha actualizada exitosamente!')
    }, 1000)
  }

  const handleDeleteCourt = async (courtId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cancha?')) return
    
    setLoading(true)
    // Simular eliminación
    setTimeout(() => {
      setLoading(false)
      alert('¡Cancha eliminada exitosamente!')
    }, 1000)
  }

  const activeCourts = mockClub.courts.filter(court => court.isActive)
  const totalRevenue = mockClub.courts.reduce((sum, court) => sum + court.monthlyRevenue, 0)
  const avgUtilization = mockClub.courts.reduce((sum, court) => sum + court.utilizationRate, 0) / mockClub.courts.length

  return (
    <CleanDashboardLayout
      clubName={mockClub.name}
      userName="Administrador del Club"
      userRole="Administrador"
    >
      <div style={{ 
        padding: '32px'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#182A01',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em'
          }}>
            Gestión de Canchas
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#516640',
            fontWeight: 400,
            margin: 0
          }}>
            Administra las canchas de pádel de tu club
          </p>
        </div>

        {/* Stats Overview - 4 columns, smaller widgets */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* 1. Total de Canchas */}
          <CardModern variant="glass" interactive>
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', color: '#516640', margin: 0 }}>
                  Total de Canchas
                </p>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Grid3x3 size={16} color="#182A01" />
                </div>
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01', margin: '0 0 4px 0' }}>
                {formatNumber(mockClub.courts.length)}
              </p>
              <p style={{ fontSize: '11px', color: '#516640', margin: 0 }}>
                {formatNumber(activeCourts.length)} activas
              </p>
            </div>
          </CardModern>

          {/* 2. Utilización Promedio */}
          <CardModern variant="glass" interactive>
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', color: '#516640', margin: 0 }}>
                  Utilización Promedio
                </p>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Activity size={16} color="#182A01" />
                </div>
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01', margin: '0 0 4px 0' }}>
                {Math.round(avgUtilization)}%
              </p>
              <p style={{ fontSize: '11px', color: '#516640', margin: 0 }}>
                Últimos 30 días
              </p>
            </div>
          </CardModern>

          {/* 3. Reservas Mes */}
          <CardModern variant="glass" interactive>
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', color: '#516640', margin: 0 }}>
                  Reservas Mes
                </p>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={16} color="#182A01" />
                </div>
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01', margin: '0 0 4px 0' }}>
                {mockClub.courts.reduce((sum, court) => sum + court.todayBookings, 0) * 30}
              </p>
              <p style={{ fontSize: '11px', color: '#516640', margin: 0 }}>
                Total del mes
              </p>
            </div>
          </CardModern>

          {/* 4. Ingresos Mes */}
          <CardModern variant="glass" interactive>
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', color: '#516640', margin: 0 }}>
                  Ingresos Mes
                </p>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUp size={16} color="#182A01" />
                </div>
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01', margin: '0 0 4px 0' }}>
                {formatCurrency(totalRevenue)}
              </p>
              <p style={{ fontSize: '11px', color: '#516640', margin: 0 }}>
                ↑ 12% vs anterior
              </p>
            </div>
          </CardModern>
        </div>

        {/* Courts List - 2 columns layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          {mockClub.courts.map((court) => (
            <CardModern key={court.id} variant="glass" interactive>
              {editingCourt?.id === court.id ? (
                <div>
                  <CardModernHeader>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Edit size={20} color="#182A01" />
                        </div>
                        <div>
                          <CardModernTitle>Editando: {court.name}</CardModernTitle>
                          <CardModernDescription>Modifica los detalles de la cancha</CardModernDescription>
                        </div>
                      </div>
                      <ButtonModern
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCourt(null)}
                        icon={<X size={16} />}
                      />
                    </div>
                  </CardModernHeader>
                  <CardModernContent>
                    <CourtForm
                      court={court}
                      onSubmit={(formData) => handleUpdateCourt(court.id, formData)}
                      loading={loading}
                      submitText="Guardar Cambios"
                      onCancel={() => setEditingCourt(null)}
                    />
                  </CardModernContent>
                </div>
              ) : (
                <div>
                  {/* Court Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        background: court.isActive 
                          ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)' 
                          : 'rgba(164, 223, 78, 0.2)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <MapPin size={24} color={court.isActive ? "#182A01" : "#516640"} />
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '24px',
                          fontWeight: 700,
                          color: '#182A01',
                          marginBottom: '4px'
                        }}>
{court.name}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#516640'
                        }}>
                          {court.description || 'Sin descripción'}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      background: court.isActive 
                        ? 'rgba(22, 163, 74, 0.1)' 
                        : 'rgba(156, 163, 175, 0.1)',
                      color: court.isActive ? '#16a34a' : '#6b7280',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {court.isActive ? 'Activa' : 'Inactiva'}
                    </div>
                  </div>

                  {/* Court Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(102, 231, 170, 0.05)',
                      border: '1px solid rgba(102, 231, 170, 0.1)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '11px', color: '#516640', marginBottom: '4px', fontWeight: 500 }}>
                        Utilización
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#182A01' }}>
                        {court.utilizationRate}%
                      </div>
                    </div>
                    <div style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(164, 223, 78, 0.05)',
                      border: '1px solid rgba(164, 223, 78, 0.1)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '11px', color: '#516640', marginBottom: '4px', fontWeight: 500 }}>
                        Ingresos del Mes
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#182A01' }}>
                        {formatCurrency(court.monthlyRevenue)}
                      </div>
                    </div>
                  </div>

                  {/* Court Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#516640'
                    }}>
                      <Hash size={16} />
                      Orden: {court.order}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#516640'
                    }}>
                      <Home size={16} />
                      {court.isIndoor ? 'Interior' : 'Exterior'}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#516640'
                    }}>
                      <Zap size={16} />
                      {court.hasLighting ? 'Iluminada' : 'Sin luz'}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <button
                      onClick={() => setEditingCourt(court)}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#182A01',
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
                        e.currentTarget.style.transform = 'scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(164, 223, 78, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <Edit size={16} />
                      Editar Cancha
                    </button>
                    <button
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        background: 'transparent',
                        border: '2px solid rgba(164, 223, 78, 0.3)',
                        borderRadius: '12px',
                        color: '#516640',
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
                        e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.5)'
                        e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.3)'
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <Calendar size={16} />
                      Ver Horarios
                    </button>
                  </div>
                </div>
              )}
            </CardModern>
          ))}
          
          {/* Add New Court Button - As a court card */}
          {!isCreating && mockClub.courts.length > 0 && (
            <CardModern
              variant="glass"
              interactive
              onClick={() => setIsCreating(true)}
              style={{
                cursor: 'pointer',
                border: '2px dashed rgba(164, 223, 78, 0.3)',
                background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(102, 231, 170, 0.03))',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(164, 223, 78, 0.1)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Plus size={28} color="#A4DF4E" />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#182A01',
                  marginBottom: '8px'
                }}>
                  Agregar Nueva Cancha
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#516640',
                  maxWidth: '250px',
                  margin: '0 auto'
                }}>
                  Configura una nueva cancha para tu club
                </p>
              </div>
            </CardModern>
          )}
        </div>

        {/* Empty State */}
        {mockClub.courts.length === 0 && !isCreating && (
          <CardModern variant="glass">
            <div style={{
              padding: '80px 40px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(164, 223, 78, 0.1)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <MapPin size={40} color="#A4DF4E" />
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#182A01',
                marginBottom: '12px'
              }}>
                ¡Configura tu primera cancha!
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#516640',
                marginBottom: '32px',
                maxWidth: '400px',
                margin: '0 auto 32px'
              }}>
                Necesitas al menos una cancha configurada para empezar a recibir reservas en tu club.
              </p>
              <ButtonModern
                variant="primary"
                size="lg"
                onClick={() => setIsCreating(true)}
                icon={<Plus size={20} />}
              >
                Crear Primera Cancha
              </ButtonModern>
            </div>
          </CardModern>
        )}

        {/* Create Court Form */}
        {isCreating && (
          <CardModern variant="glow">
            <CardModernHeader>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MapPin size={20} color="#182A01" />
                  </div>
                  <div>
                    <CardModernTitle>Nueva Cancha</CardModernTitle>
                    <CardModernDescription>Configura los detalles de la nueva cancha</CardModernDescription>
                  </div>
                </div>
                <ButtonModern
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  icon={<X size={16} />}
                />
              </div>
            </CardModernHeader>
            <CardModernContent>
              <CourtForm
                onSubmit={handleCreateCourt}
                loading={loading}
                submitText="Crear Cancha"
                onCancel={() => setIsCreating(false)}
              />
            </CardModernContent>
          </CardModern>
        )}

      </div>
    </CleanDashboardLayout>
  )
}

// Form Component
function CourtForm({ 
  court, 
  onSubmit, 
  loading, 
  submitText,
  onCancel 
}: {
  court?: any
  onSubmit: (formData: any) => void
  loading: boolean
  submitText: string
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: court?.name || '',
    description: court?.description || '',
    order: court?.order || 1,
    hourlyRate: court?.hourlyRate || 250,
    isIndoor: court?.isIndoor || false,
    hasLighting: court?.hasLighting || true,
    isActive: court?.isActive !== false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px'
      }}>
        <InputModern
          label="Nombre de la Cancha"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="ej. Cancha Central"
          required
        />
        
        <InputModern
          label="Orden de Visualización"
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
          min="1"
          required
        />

        <InputModern
          label="Tarifa por Hora (MXN)"
          type="number"
          value={formData.hourlyRate}
          onChange={(e) => setFormData({...formData, hourlyRate: parseInt(e.target.value)})}
          min="0"
          step="50"
          required
        />
      </div>

      <InputModern
        label="Descripción"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        placeholder="Descripción opcional de la cancha..."
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
      }}>
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(164, 223, 78, 0.2)',
          background: 'rgba(164, 223, 78, 0.05)'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.isIndoor}
              onChange={(e) => setFormData({...formData, isIndoor: e.target.checked})}
              style={{ 
                width: '18px', 
                height: '18px',
                accentColor: '#A4DF4E'
              }}
            />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                Cancha Cubierta
              </div>
              <div style={{ fontSize: '12px', color: '#516640' }}>
                Ideal para clima adverso
              </div>
            </div>
          </label>
        </div>

        <div style={{
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(164, 223, 78, 0.2)',
          background: 'rgba(164, 223, 78, 0.05)'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.hasLighting}
              onChange={(e) => setFormData({...formData, hasLighting: e.target.checked})}
              style={{ 
                width: '18px', 
                height: '18px',
                accentColor: '#A4DF4E'
              }}
            />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                Iluminación
              </div>
              <div style={{ fontSize: '12px', color: '#516640' }}>
                Juegos nocturnos
              </div>
            </div>
          </label>
        </div>

        <div style={{
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(164, 223, 78, 0.2)',
          background: 'rgba(164, 223, 78, 0.05)'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              style={{ 
                width: '18px', 
                height: '18px',
                accentColor: '#A4DF4E'
              }}
            />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                Cancha Activa
              </div>
              <div style={{ fontSize: '12px', color: '#516640' }}>
                Disponible para reservas
              </div>
            </div>
          </label>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        paddingTop: '24px',
        borderTop: '1px solid rgba(164, 223, 78, 0.1)'
      }}>
        <ButtonModern
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={<Check size={18} />}
          style={{ flex: 1 }}
        >
          {submitText}
        </ButtonModern>
        <ButtonModern
          type="button"
          variant="secondary"
          size="lg"
          onClick={onCancel}
          disabled={loading}
          icon={<X size={18} />}
          style={{ flex: 1 }}
        >
          Cancelar
        </ButtonModern>
      </div>
    </form>
  )
}