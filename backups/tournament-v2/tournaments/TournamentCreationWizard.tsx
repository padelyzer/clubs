'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { InputModern } from '@/components/design-system/InputModern'
import { 
  ArrowLeft, ArrowRight, Trophy, Calendar, Users, DollarSign,
  Check, Settings, Target, Crown, Flame, Zap, Shield, Star, CircleDot
} from 'lucide-react'

type WizardStep = 'type' | 'config' | 'players' | 'summary'

interface TournamentData {
  type: string
  name: string
  description: string
  startDate: string
  endDate: string
  registrationEnd: string
  maxPlayers: number
  registrationFee: number
  currency: string
}

const tournamentTypes = [
  {
    id: 'ELIMINATION',
    name: 'Eliminación',
    description: 'Formato clásico donde los equipos son eliminados al perder',
    icon: Target,
    recommended: true
  },
  {
    id: 'ROUND_ROBIN',
    name: 'Round Robin',
    description: 'Todos los equipos juegan contra todos',
    icon: Crown
  },
  {
    id: 'SWISS',
    name: 'Sistema Suizo',
    description: 'Equipos juegan múltiples rondas sin eliminación',
    icon: Settings
  }
]

export function TournamentCreationWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>('type')
  const [isCreating, setIsCreating] = useState(false)
  const [tournamentData, setTournamentData] = useState<TournamentData>({
    type: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationEnd: '',
    maxPlayers: 16,
    registrationFee: 0,
    currency: 'MXN'
  })

  const steps: { id: WizardStep; title: string; icon: any }[] = [
    { id: 'type', title: 'Tipo de Torneo', icon: Trophy },
    { id: 'config', title: 'Configuración', icon: Settings },
    { id: 'players', title: 'Jugadores', icon: Users },
    { id: 'summary', title: 'Resumen', icon: Check }
  ]

  const updateData = (field: keyof TournamentData, value: any) => {
    setTournamentData({ ...tournamentData, [field]: value })
  }

  const nextStep = () => {
    const stepOrder: WizardStep[] = ['type', 'config', 'players', 'summary']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const stepOrder: WizardStep[] = ['type', 'config', 'players', 'summary']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'type':
        return tournamentData.type !== ''
      case 'config':
        return tournamentData.name && tournamentData.startDate && tournamentData.endDate
      case 'players':
        return tournamentData.maxPlayers > 0
      default:
        return true
    }
  }

  const createTournament = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tournamentData)
      })

      const data = await response.json()
      
      if (data.success) {
        router.push(`/dashboard/tournaments/${data.tournament.id}`)
      } else {
        console.error('Error creating tournament:', data.error)
        alert('Error al crear torneo: ' + data.error)
      }
    } catch (err) {
      console.error('Error creating tournament:', err)
      alert('Error al crear torneo')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          <button
            onClick={() => router.push('/dashboard/tournaments')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 700, 
            color: '#182A01',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            Crear Nuevo Torneo
          </h1>
        </div>
      </div>

      {/* Steps Indicator */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '32px'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = step.id === currentStep
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index
            
            return (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isActive 
                      ? 'linear-gradient(135deg, #66E7AA, #A4DF4E)'
                      : isCompleted
                      ? '#10B981'
                      : '#E5E7EB',
                    color: isActive || isCompleted ? '#182A01' : '#6B7280',
                    transition: 'all 0.2s ease'
                  }}>
                    <Icon size={20} />
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: isActive ? '#10B981' : isCompleted ? '#10B981' : '#6B7280'
                  }}>
                    {step.title}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div style={{
                    width: '32px',
                    height: '2px',
                    background: isCompleted ? '#10B981' : '#E5E7EB',
                    marginTop: '-20px'
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {currentStep === 'type' && (
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>
                <Trophy size={24} />
                Selecciona el Tipo de Torneo
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                {tournamentTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = tournamentData.type === type.id
                  
                  return (
                    <div
                      key={type.id}
                      onClick={() => updateData('type', type.id)}
                      style={{
                        padding: '24px',
                        border: isSelected ? '2px solid #10B981' : '2px solid #E5E7EB',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: isSelected ? '#f0fdf4' : 'white',
                        position: 'relative'
                      }}
                    >
                      {type.recommended && (
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '16px',
                          background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                          color: '#182A01',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '4px 12px',
                          borderRadius: '12px'
                        }}>
                          Recomendado
                        </div>
                      )}
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          padding: '12px',
                          borderRadius: '8px',
                          background: isSelected ? '#10B981' : '#F3F4F6',
                          color: isSelected ? 'white' : '#6B7280'
                        }}>
                          <Icon size={24} />
                        </div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: 600,
                          color: '#182A01',
                          margin: 0
                        }}>
                          {type.name}
                        </h3>
                      </div>
                      
                      <p style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        margin: 0,
                        lineHeight: 1.5
                      }}>
                        {type.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardModernContent>
          </CardModern>
        )}

        {currentStep === 'config' && (
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>
                <Settings size={24} />
                Configuración del Torneo
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Nombre del Torneo *
                  </label>
                  <InputModern
                    type="text"
                    value={tournamentData.name}
                    onChange={(e) => updateData('name', e.target.value)}
                    placeholder="Ej: Torneo Verano 2024"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Descripción
                  </label>
                  <textarea
                    value={tournamentData.description}
                    onChange={(e) => updateData('description', e.target.value)}
                    placeholder="Describe el torneo, premios, reglas especiales, etc."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Fecha de Inicio *
                    </label>
                    <InputModern
                      type="date"
                      value={tournamentData.startDate}
                      onChange={(e) => updateData('startDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Fecha de Fin *
                    </label>
                    <InputModern
                      type="date"
                      value={tournamentData.endDate}
                      onChange={(e) => updateData('endDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Cierre de Inscripciones
                    </label>
                    <InputModern
                      type="date"
                      value={tournamentData.registrationEnd}
                      onChange={(e) => updateData('registrationEnd', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardModernContent>
          </CardModern>
        )}

        {currentStep === 'players' && (
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>
                <Users size={24} />
                Configuración de Jugadores
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px'
                }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Máximo de Equipos
                    </label>
                    <InputModern
                      type="number"
                      value={tournamentData.maxPlayers}
                      onChange={(e) => updateData('maxPlayers', parseInt(e.target.value))}
                      min="2"
                      max="128"
                    />
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                      Recomendamos potencias de 2 (8, 16, 32, 64) para torneos de eliminación
                    </p>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Cuota de Inscripción (centavos)
                    </label>
                    <InputModern
                      type="number"
                      value={tournamentData.registrationFee}
                      onChange={(e) => updateData('registrationFee', parseInt(e.target.value))}
                      min="0"
                    />
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                      ${(tournamentData.registrationFee / 100).toFixed(2)} MXN por equipo
                    </p>
                  </div>
                </div>
              </div>
            </CardModernContent>
          </CardModern>
        )}

        {currentStep === 'summary' && (
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>
                <Check size={24} />
                Resumen del Torneo
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{
                  padding: '20px',
                  background: '#f0fdf4',
                  borderRadius: '12px',
                  border: '1px solid #dcfce7'
                }}>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: 600, 
                    color: '#182A01',
                    margin: '0 0 16px 0'
                  }}>
                    {tournamentData.name}
                  </h3>
                  
                  {tournamentData.description && (
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6B7280', 
                      margin: '0 0 16px 0',
                      lineHeight: 1.5
                    }}>
                      {tournamentData.description}
                    </p>
                  )}

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>Tipo: </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                        {tournamentTypes.find(t => t.id === tournamentData.type)?.name}
                      </span>
                    </div>
                    
                    <div>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>Equipos: </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                        {tournamentData.maxPlayers}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>Inicio: </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                        {tournamentData.startDate ? new Date(tournamentData.startDate).toLocaleDateString() : '-'}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>Inscripción: </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                        ${(tournamentData.registrationFee / 100).toFixed(2)} MXN
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: '#fef3c7',
                  borderRadius: '12px',
                  border: '1px solid #fde68a'
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#92400e', 
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    ⚠️ Una vez creado, podrás editar algunos detalles pero no el tipo de torneo. 
                    Asegúrate de que la información sea correcta.
                  </p>
                </div>
              </div>
            </CardModernContent>
          </CardModern>
        )}
      </div>

      {/* Navigation */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '32px',
        maxWidth: '800px',
        margin: '32px auto 0'
      }}>
        <button
          onClick={prevStep}
          disabled={currentStep === 'type'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: currentStep === 'type' ? '#F3F4F6' : 'transparent',
            border: currentStep === 'type' ? 'none' : '2px solid #E5E7EB',
            borderRadius: '12px',
            color: currentStep === 'type' ? '#9CA3AF' : '#374151',
            fontSize: '14px',
            fontWeight: 600,
            cursor: currentStep === 'type' ? 'not-allowed' : 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          Anterior
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          {currentStep !== 'summary' ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: canProceed() 
                  ? 'linear-gradient(135deg, #66E7AA 0%, #A4DF4E 100%)'
                  : '#F3F4F6',
                color: canProceed() ? '#182A01' : '#9CA3AF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                boxShadow: canProceed() ? '0 2px 8px rgba(102, 231, 170, 0.15)' : 'none'
              }}
            >
              Siguiente
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={createTournament}
              disabled={isCreating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: isCreating 
                  ? '#9CA3AF'
                  : 'linear-gradient(135deg, #66E7AA 0%, #A4DF4E 100%)',
                color: '#182A01',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isCreating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(102, 231, 170, 0.15)'
              }}
            >
              <Trophy size={16} />
              {isCreating ? 'Creando...' : 'Crear Torneo'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}