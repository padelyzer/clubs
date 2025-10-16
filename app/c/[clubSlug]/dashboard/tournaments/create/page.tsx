'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { colors } from '@/lib/design-system/colors'
import {
  Trophy,
  Calendar,
  Users,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  Save,
  X,
  CheckCircle2,
  Settings,
  Sparkles,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

// Category definitions
const CATEGORIES = {
  masculine: [
    { value: 'M_OPEN', label: 'Open' },
    { value: 'M_1F', label: '1ra Fuerza' },
    { value: 'M_2F', label: '2da Fuerza' },
    { value: 'M_3F', label: '3ra Fuerza' },
    { value: 'M_4F', label: '4ta Fuerza' },
    { value: 'M_5F', label: '5ta Fuerza' },
    { value: 'M_6F', label: '6ta Fuerza' },
  ],
  feminine: [
    { value: 'F_OPEN', label: 'Open' },
    { value: 'F_1F', label: '1ra Fuerza' },
    { value: 'F_2F', label: '2da Fuerza' },
    { value: 'F_3F', label: '3ra Fuerza' },
    { value: 'F_4F', label: '4ta Fuerza' },
    { value: 'F_5F', label: '5ta Fuerza' },
    { value: 'F_6F', label: '6ta Fuerza' },
  ],
  mixed: [
    { value: 'MX_A', label: 'Categoría A' },
    { value: 'MX_B', label: 'Categoría B' },
    { value: 'MX_C', label: 'Categoría C' },
    { value: 'MX_D', label: 'Categoría D' },
  ]
}

// Presets
const PRESETS = {
  flash: {
    name: 'Flash',
    description: '16 parejas - Torneo rápido',
    maxPlayers: 32, // 16 parejas
    registrationFee: 0,
    prizePool: 0,
    matchDuration: 60,
    sets: 3,
    games: 6,
    tiebreak: true
  },
  sencillo: {
    name: 'Sencillo',
    description: '32 parejas - Formato estándar',
    maxPlayers: 64, // 32 parejas
    registrationFee: 0,
    prizePool: 0,
    matchDuration: 90,
    sets: 3,
    games: 6,
    tiebreak: true
  },
  profesional: {
    name: 'Profesional',
    description: '64 parejas - Gran torneo',
    maxPlayers: 128, // 64 parejas
    registrationFee: 0,
    prizePool: 0,
    matchDuration: 90,
    sets: 3,
    games: 6,
    tiebreak: true
  }
}

export default function CreateTournamentWizard() {
  const router = useRouter()
  const params = useParams()
  const clubSlug = params.clubSlug as string

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'SINGLE_ELIMINATION',
    categories: [] as string[],
    registrationStart: '',
    registrationEnd: '',
    startDate: '',
    endDate: '',
    maxPlayers: 32, // 16 parejas por defecto
    registrationFee: 0,
    prizePool: 0,
    matchDuration: 90,
    sets: 3,
    games: 6,
    tiebreak: true,
    rules: '',
    notes: ''
  })

  const steps = [
    { number: 1, title: 'Información Básica', icon: Trophy },
    { number: 2, title: 'Fechas y Logística', icon: Calendar },
    { number: 3, title: 'Configuración Avanzada', icon: Settings },
    { number: 4, title: 'Revisión', icon: CheckCircle2 }
  ]

  // Apply preset
  const applyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey as keyof typeof PRESETS]
    setSelectedPreset(presetKey)
    setFormData({
      ...formData,
      maxPlayers: preset.maxPlayers,
      registrationFee: preset.registrationFee,
      prizePool: preset.prizePool,
      matchDuration: preset.matchDuration,
      sets: preset.sets,
      games: preset.games,
      tiebreak: preset.tiebreak
    })
    toast.success(`Preset "${preset.name}" aplicado`)
  }

  // Toggle category
  const toggleCategory = (categoryValue: string) => {
    if (formData.categories.includes(categoryValue)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(c => c !== categoryValue)
      })
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, categoryValue]
      })
    }
  }

  // Validation for each step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0 && formData.categories.length > 0
      case 2:
        return formData.registrationStart !== '' &&
               formData.registrationEnd !== '' &&
               formData.startDate !== ''
      case 3:
        return true // Advanced settings are optional
      case 4:
        return true // Review step
      default:
        return false
    }
  }

  const canProceed = validateStep(currentStep)

  const handleNext = () => {
    if (canProceed && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      // Convert datetime-local to ISO format
      const formatDateTime = (dateStr: string) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toISOString()
      }

      const requestData = {
        ...formData,
        registrationStart: formatDateTime(formData.registrationStart),
        registrationEnd: formatDateTime(formData.registrationEnd),
        startDate: formatDateTime(formData.startDate),
        endDate: formData.endDate ? formatDateTime(formData.endDate) : undefined
      }

      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Torneo creado exitosamente! 🏆')
        // The API returns an array of tournaments (one per category)
        if (data.tournaments && data.tournaments.length > 0) {
          router.push(`/c/${clubSlug}/dashboard/tournaments/${data.tournaments[0].id}`)
        } else {
          router.push(`/c/${clubSlug}/dashboard/tournaments`)
        }
      } else {
        toast.error(data.error || 'Error al crear el torneo')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear el torneo')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: `1px solid ${colors.border.subtle}`,
    fontSize: '14px',
    transition: 'all 0.2s',
    background: 'white',
    fontFamily: 'inherit'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: colors.text.primary
  }

  const helperTextStyle = {
    fontSize: '12px',
    color: colors.text.tertiary,
    marginTop: '6px'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background.secondary,
      padding: '32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={() => router.push(`/c/${clubSlug}/dashboard/tournaments`)}
          style={{
            padding: '10px',
            borderRadius: '10px',
            border: 'none',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.neutral[100]
            e.currentTarget.style.transform = 'translateX(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.transform = 'translateX(0)'
          }}
        >
          <ArrowLeft size={20} color={colors.text.primary} />
        </button>

        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: colors.text.primary,
            letterSpacing: '-0.03em',
            marginBottom: '4px'
          }}>
            Crear Nuevo Torneo
          </h1>
          <p style={{
            fontSize: '14px',
            color: colors.text.secondary
          }}>
            Paso {currentStep} de 4 - {steps[currentStep - 1].title}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{
        marginBottom: '40px',
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number
            const isLast = index === steps.length - 1

            return (
              <React.Fragment key={step.number}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: isCompleted
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : isActive
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : colors.neutral[100],
                    border: isActive ? '3px solid #10B98120' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    transition: 'all 0.3s'
                  }}>
                    <Icon
                      size={20}
                      color={isCompleted || isActive ? 'white' : colors.text.tertiary}
                    />
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? colors.text.primary : colors.text.tertiary,
                    textAlign: 'center',
                    maxWidth: '120px'
                  }}>
                    {step.title}
                  </span>
                </div>

                {!isLast && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    background: isCompleted
                      ? 'linear-gradient(90deg, #10B981, #059669)'
                      : colors.neutral[200],
                    marginBottom: '40px',
                    transition: 'all 0.3s'
                  }} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <CardModern variant="glass" padding="xl">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Trophy size={24} color={colors.primary[600]} />
                Información Básica del Torneo
              </h2>
              <p style={{
                fontSize: '14px',
                color: colors.text.secondary
              }}>
                Comienza con lo esencial: nombre, categorías y tipo de torneo
              </p>
            </div>

            {/* Preset Quick Select */}
            <div style={{ marginBottom: '32px' }}>
              <label style={labelStyle}>
                <Sparkles size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Configuración Rápida (Opcional)
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPreset(key)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: selectedPreset === key
                        ? '2px solid #10B981'
                        : `1px solid ${colors.border.subtle}`,
                      background: selectedPreset === key
                        ? '#10B98110'
                        : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedPreset !== key) {
                        e.currentTarget.style.borderColor = colors.primary[300]
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPreset !== key) {
                        e.currentTarget.style.borderColor = colors.border.subtle
                      }
                    }}
                  >
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.text.primary,
                      marginBottom: '4px'
                    }}>
                      {preset.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: colors.text.tertiary
                    }}>
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={labelStyle}>Nombre del Torneo *</label>
                  <input
                    type="text"
                    required
                    style={inputStyle}
                    placeholder="Ej: Torneo de Verano 2024"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <p style={helperTextStyle}>
                    Un nombre descriptivo y memorable para tu torneo
                  </p>
                </div>

                <div>
                  <label style={labelStyle}>Descripción</label>
                  <textarea
                    style={{...inputStyle, minHeight: '100px', resize: 'vertical'}}
                    placeholder="Describe brevemente el torneo, nivel esperado, premios, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Categorías *
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: colors.text.tertiary
                    }}>
                      (Selecciona una o más)
                    </span>
                  </label>

                  {/* Categories Table */}
                  <div style={{
                    marginTop: '12px',
                    borderRadius: '12px',
                    border: `1px solid ${colors.border.default}`,
                    overflow: 'hidden',
                    background: 'white'
                  }}>
                    {/* Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      background: colors.neutral[50],
                      borderBottom: `1px solid ${colors.border.default}`
                    }}>
                      <div style={{
                        padding: '12px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: colors.text.primary,
                        textAlign: 'center',
                        borderRight: `1px solid ${colors.border.default}`
                      }}>
                        👨 Masculino
                      </div>
                      <div style={{
                        padding: '12px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: colors.text.primary,
                        textAlign: 'center',
                        borderRight: `1px solid ${colors.border.default}`
                      }}>
                        👩 Femenino
                      </div>
                      <div style={{
                        padding: '12px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: colors.text.primary,
                        textAlign: 'center'
                      }}>
                        👫 Mixto
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)'
                    }}>
                      {/* Masculine Column */}
                      <div style={{
                        borderRight: `1px solid ${colors.border.default}`,
                        padding: '8px'
                      }}>
                        {CATEGORIES.masculine.map((category) => {
                          const isSelected = formData.categories.includes(category.value)
                          return (
                            <div
                              key={category.value}
                              onClick={() => toggleCategory(category.value)}
                              style={{
                                padding: '8px 12px',
                                margin: '4px 0',
                                borderRadius: '8px',
                                background: isSelected ? colors.primary[50] : 'transparent',
                                border: `1px solid ${isSelected ? colors.primary[300] : 'transparent'}`,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.background = colors.neutral[50]
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.background = 'transparent'
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  cursor: 'pointer',
                                  accentColor: '#10B981'
                                }}
                              />
                              <span style={{
                                fontSize: '13px',
                                fontWeight: isSelected ? 600 : 400,
                                color: isSelected ? colors.primary[700] : colors.text.primary
                              }}>
                                {category.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Feminine Column */}
                      <div style={{
                        borderRight: `1px solid ${colors.border.default}`,
                        padding: '8px'
                      }}>
                        {CATEGORIES.feminine.map((category) => {
                          const isSelected = formData.categories.includes(category.value)
                          return (
                            <div
                              key={category.value}
                              onClick={() => toggleCategory(category.value)}
                              style={{
                                padding: '8px 12px',
                                margin: '4px 0',
                                borderRadius: '8px',
                                background: isSelected ? colors.primary[50] : 'transparent',
                                border: `1px solid ${isSelected ? colors.primary[300] : 'transparent'}`,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.background = colors.neutral[50]
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.background = 'transparent'
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  cursor: 'pointer',
                                  accentColor: '#10B981'
                                }}
                              />
                              <span style={{
                                fontSize: '13px',
                                fontWeight: isSelected ? 600 : 400,
                                color: isSelected ? colors.primary[700] : colors.text.primary
                              }}>
                                {category.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Mixed Column */}
                      <div style={{
                        padding: '8px'
                      }}>
                        {CATEGORIES.mixed.map((category) => {
                          const isSelected = formData.categories.includes(category.value)
                          return (
                            <div
                              key={category.value}
                              onClick={() => toggleCategory(category.value)}
                              style={{
                                padding: '8px 12px',
                                margin: '4px 0',
                                borderRadius: '8px',
                                background: isSelected ? colors.primary[50] : 'transparent',
                                border: `1px solid ${isSelected ? colors.primary[300] : 'transparent'}`,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.background = colors.neutral[50]
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.background = 'transparent'
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  cursor: 'pointer',
                                  accentColor: '#10B981'
                                }}
                              />
                              <span style={{
                                fontSize: '13px',
                                fontWeight: isSelected ? 600 : 400,
                                color: isSelected ? colors.primary[700] : colors.text.primary
                              }}>
                                {category.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <p style={helperTextStyle}>
                    {formData.categories.length === 0
                      ? 'Selecciona al menos una categoría'
                      : `${formData.categories.length} categoría${formData.categories.length > 1 ? 's' : ''} seleccionada${formData.categories.length > 1 ? 's' : ''}`
                    }
                  </p>
                </div>

                <div>
                  <label style={labelStyle}>Tipo de Torneo *</label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    marginTop: '8px'
                  }}>
                    {/* Single Elimination */}
                    <div
                      onClick={() => setFormData({...formData, type: 'SINGLE_ELIMINATION'})}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: formData.type === 'SINGLE_ELIMINATION'
                          ? '2px solid #10B981'
                          : `1px solid ${colors.border.default}`,
                        background: formData.type === 'SINGLE_ELIMINATION'
                          ? colors.primary[50]
                          : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (formData.type !== 'SINGLE_ELIMINATION') {
                          e.currentTarget.style.borderColor = colors.primary[300]
                          e.currentTarget.style.background = colors.neutral[50]
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.type !== 'SINGLE_ELIMINATION') {
                          e.currentTarget.style.borderColor = colors.border.default
                          e.currentTarget.style.background = 'white'
                        }
                      }}
                    >
                      {formData.type === 'SINGLE_ELIMINATION' && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                        </div>
                      )}
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: colors.text.primary,
                        marginBottom: '6px'
                      }}>
                        Eliminación Simple
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: colors.text.tertiary,
                        lineHeight: 1.5
                      }}>
                        Pierdes 1 partido = Eliminado. Rápido y directo. Ideal para torneos de 1 día.
                      </div>
                    </div>

                    {/* Double Elimination */}
                    <div
                      onClick={() => setFormData({...formData, type: 'DOUBLE_ELIMINATION'})}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: formData.type === 'DOUBLE_ELIMINATION'
                          ? '2px solid #10B981'
                          : `1px solid ${colors.border.default}`,
                        background: formData.type === 'DOUBLE_ELIMINATION'
                          ? colors.primary[50]
                          : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (formData.type !== 'DOUBLE_ELIMINATION') {
                          e.currentTarget.style.borderColor = colors.primary[300]
                          e.currentTarget.style.background = colors.neutral[50]
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.type !== 'DOUBLE_ELIMINATION') {
                          e.currentTarget.style.borderColor = colors.border.default
                          e.currentTarget.style.background = 'white'
                        }
                      }}
                    >
                      {formData.type === 'DOUBLE_ELIMINATION' && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                        </div>
                      )}
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: colors.text.primary,
                        marginBottom: '6px'
                      }}>
                        Eliminación Doble
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: colors.text.tertiary,
                        lineHeight: 1.5
                      }}>
                        Segunda oportunidad. Necesitas perder 2 veces para quedar fuera. Más justo.
                      </div>
                    </div>

                    {/* Round Robin */}
                    <div
                      onClick={() => setFormData({...formData, type: 'ROUND_ROBIN'})}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: formData.type === 'ROUND_ROBIN'
                          ? '2px solid #10B981'
                          : `1px solid ${colors.border.default}`,
                        background: formData.type === 'ROUND_ROBIN'
                          ? colors.primary[50]
                          : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (formData.type !== 'ROUND_ROBIN') {
                          e.currentTarget.style.borderColor = colors.primary[300]
                          e.currentTarget.style.background = colors.neutral[50]
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.type !== 'ROUND_ROBIN') {
                          e.currentTarget.style.borderColor = colors.border.default
                          e.currentTarget.style.background = 'white'
                        }
                      }}
                    >
                      {formData.type === 'ROUND_ROBIN' && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                        </div>
                      )}
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔄</div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: colors.text.primary,
                        marginBottom: '6px'
                      }}>
                        Todos contra Todos
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: colors.text.tertiary,
                        lineHeight: 1.5
                      }}>
                        Cada equipo juega contra todos. Muchos partidos. Ideal para grupos pequeños.
                      </div>
                    </div>

                    {/* Group Stage */}
                    <div
                      onClick={() => setFormData({...formData, type: 'GROUP_STAGE'})}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: formData.type === 'GROUP_STAGE'
                          ? '2px solid #10B981'
                          : `1px solid ${colors.border.default}`,
                        background: formData.type === 'GROUP_STAGE'
                          ? colors.primary[50]
                          : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (formData.type !== 'GROUP_STAGE') {
                          e.currentTarget.style.borderColor = colors.primary[300]
                          e.currentTarget.style.background = colors.neutral[50]
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.type !== 'GROUP_STAGE') {
                          e.currentTarget.style.borderColor = colors.border.default
                          e.currentTarget.style.background = 'white'
                        }
                      }}
                    >
                      {formData.type === 'GROUP_STAGE' && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                        </div>
                      )}
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: colors.text.primary,
                        marginBottom: '6px'
                      }}>
                        Fase de Grupos
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: colors.text.tertiary,
                        lineHeight: 1.5
                      }}>
                        Grupos pequeños + playoffs. Los mejores de cada grupo avanzan. Como el mundial.
                      </div>
                    </div>

                    {/* Swiss */}
                    <div
                      onClick={() => setFormData({...formData, type: 'SWISS'})}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: formData.type === 'SWISS'
                          ? '2px solid #10B981'
                          : `1px solid ${colors.border.default}`,
                        background: formData.type === 'SWISS'
                          ? colors.primary[50]
                          : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                        gridColumn: '1 / -1'
                      }}
                      onMouseEnter={(e) => {
                        if (formData.type !== 'SWISS') {
                          e.currentTarget.style.borderColor = colors.primary[300]
                          e.currentTarget.style.background = colors.neutral[50]
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.type !== 'SWISS') {
                          e.currentTarget.style.borderColor = colors.border.default
                          e.currentTarget.style.background = 'white'
                        }
                      }}
                    >
                      {formData.type === 'SWISS' && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                        </div>
                      )}
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>♟️</div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: colors.text.primary,
                        marginBottom: '6px'
                      }}>
                        Sistema Suizo
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: colors.text.tertiary,
                        lineHeight: 1.5
                      }}>
                        Emparejamiento inteligente por nivel. Juegas varias rondas contra rivales de tu nivel. Muy equilibrado para torneos grandes.
                      </div>
                    </div>
                  </div>
                  <p style={helperTextStyle}>
                    {formData.type === 'SINGLE_ELIMINATION' && '✨ Recomendado para la mayoría de torneos'}
                    {formData.type === 'DOUBLE_ELIMINATION' && '⏱️ Requiere más tiempo y canchas'}
                    {formData.type === 'ROUND_ROBIN' && '⚠️ Solo práctico con menos de 8 equipos'}
                    {formData.type === 'GROUP_STAGE' && '🎯 Perfecto para torneos grandes con múltiples días'}
                    {formData.type === 'SWISS' && '🧮 Sistema avanzado usado en torneos profesionales'}
                  </p>
                </div>
              </div>
            </CardModernContent>
          </CardModern>
        )}

        {/* Step 2: Dates and Logistics */}
        {currentStep === 2 && (
          <CardModern variant="glass" padding="xl">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Calendar size={24} color={colors.primary[600]} />
                Fechas y Logística
              </h2>
              <p style={{
                fontSize: '14px',
                color: colors.text.secondary
              }}>
                Define cuándo será el torneo y los costos de participación
              </p>
            </div>

            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Dates Section */}
                <div style={{
                  padding: '20px',
                  background: colors.primary[50],
                  borderRadius: '12px',
                  border: `1px solid ${colors.primary[100]}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <Info size={16} color={colors.primary[600]} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: colors.primary[700]
                    }}>
                      Periodo de Inscripciones
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={labelStyle}>Inician *</label>
                      <input
                        type="datetime-local"
                        required
                        style={inputStyle}
                        value={formData.registrationStart}
                        onChange={(e) => setFormData({...formData, registrationStart: e.target.value})}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Cierran *</label>
                      <input
                        type="datetime-local"
                        required
                        style={inputStyle}
                        value={formData.registrationEnd}
                        onChange={(e) => setFormData({...formData, registrationEnd: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  background: colors.accent[50],
                  borderRadius: '12px',
                  border: `1px solid ${colors.accent[100]}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <Trophy size={16} color={colors.accent[600]} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: colors.accent[700]
                    }}>
                      Periodo del Torneo
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={labelStyle}>Comienza *</label>
                      <input
                        type="datetime-local"
                        required
                        style={inputStyle}
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Termina (opcional)</label>
                      <input
                        type="datetime-local"
                        style={inputStyle}
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Players and Pricing */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '16px'
                }}>
                  <div>
                    <label style={labelStyle}>Máximo de Parejas *</label>
                    <input
                      type="number"
                      required
                      min="4"
                      max="128"
                      step="2"
                      style={inputStyle}
                      value={formData.maxPlayers}
                      onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
                    />
                    <p style={helperTextStyle}>
                      {formData.maxPlayers / 2} parejas = {formData.maxPlayers} jugadores
                    </p>
                  </div>

                  <div>
                    <label style={labelStyle}>Costo de Inscripción</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: colors.text.tertiary,
                        fontSize: '14px',
                        fontWeight: 600
                      }}>
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        style={{...inputStyle, paddingLeft: '32px'}}
                        value={formData.registrationFee}
                        onChange={(e) => setFormData({...formData, registrationFee: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <p style={helperTextStyle}>
                      MXN por equipo
                    </p>
                  </div>

                  <div>
                    <label style={labelStyle}>Premio Total</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: colors.text.tertiary,
                        fontSize: '14px',
                        fontWeight: 600
                      }}>
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        style={{...inputStyle, paddingLeft: '32px'}}
                        value={formData.prizePool}
                        onChange={(e) => setFormData({...formData, prizePool: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <p style={helperTextStyle}>
                      MXN total en premios
                    </p>
                  </div>
                </div>
              </div>
            </CardModernContent>
          </CardModern>
        )}

        {/* Step 3: Advanced Configuration */}
        {currentStep === 3 && (
          <CardModern variant="glass" padding="xl">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Settings size={24} color={colors.primary[600]} />
                Configuración Avanzada
              </h2>
              <p style={{
                fontSize: '14px',
                color: colors.text.secondary
              }}>
                Ajustes técnicos del torneo y reglas de los partidos
              </p>
            </div>

            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '16px'
                }}>
                  <div>
                    <label style={labelStyle}>Duración del Partido</label>
                    <input
                      type="number"
                      min="30"
                      max="180"
                      step="15"
                      style={inputStyle}
                      value={formData.matchDuration}
                      onChange={(e) => setFormData({...formData, matchDuration: parseInt(e.target.value) || 90})}
                    />
                    <p style={helperTextStyle}>minutos</p>
                  </div>

                  <div>
                    <label style={labelStyle}>Sets por Partido</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      style={inputStyle}
                      value={formData.sets}
                      onChange={(e) => setFormData({...formData, sets: parseInt(e.target.value) || 3})}
                    />
                    <p style={helperTextStyle}>mejor de {formData.sets}</p>
                  </div>

                  <div>
                    <label style={labelStyle}>Juegos por Set</label>
                    <input
                      type="number"
                      min="4"
                      max="9"
                      style={inputStyle}
                      value={formData.games}
                      onChange={(e) => setFormData({...formData, games: parseInt(e.target.value) || 6})}
                    />
                    <p style={helperTextStyle}>juegos</p>
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: colors.neutral[50],
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <input
                    type="checkbox"
                    id="tiebreak"
                    checked={formData.tiebreak}
                    onChange={(e) => setFormData({...formData, tiebreak: e.target.checked})}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#10B981'
                    }}
                  />
                  <label htmlFor="tiebreak" style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: colors.text.primary,
                    cursor: 'pointer',
                    flex: 1
                  }}>
                    Usar Tie-break
                  </label>
                  <span style={{
                    fontSize: '12px',
                    color: colors.text.tertiary
                  }}>
                    Recomendado para torneos competitivos
                  </span>
                </div>

                <div>
                  <label style={labelStyle}>Reglas Adicionales (Opcional)</label>
                  <textarea
                    style={{...inputStyle, minHeight: '100px', resize: 'vertical'}}
                    placeholder="Especifica reglas especiales, restricciones, formato de premios, etc."
                    value={formData.rules}
                    onChange={(e) => setFormData({...formData, rules: e.target.value})}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Notas Internas (Opcional)</label>
                  <textarea
                    style={{...inputStyle, minHeight: '80px', resize: 'vertical'}}
                    placeholder="Notas para el equipo organizador..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
            </CardModernContent>
          </CardModern>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <CardModern variant="glass" padding="xl">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <CheckCircle2 size={24} color={colors.primary[600]} />
                Revisión Final
              </h2>
              <p style={{
                fontSize: '14px',
                color: colors.text.secondary
              }}>
                Verifica que toda la información sea correcta antes de crear el torneo
              </p>
            </div>

            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Basic Info Summary */}
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Trophy size={18} color={colors.primary[600]} />
                    Información Básica
                  </h3>
                  <div style={{
                    padding: '16px',
                    background: colors.neutral[50],
                    borderRadius: '10px',
                    display: 'grid',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.text.tertiary, fontSize: '13px' }}>Nombre:</span>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{formData.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.text.tertiary, fontSize: '13px' }}>Tipo:</span>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>
                        {formData.type === 'SINGLE_ELIMINATION' ? 'Eliminación Simple' :
                         formData.type === 'DOUBLE_ELIMINATION' ? 'Eliminación Doble' :
                         formData.type === 'ROUND_ROBIN' ? 'Todos contra Todos' :
                         formData.type === 'GROUP_STAGE' ? 'Fase de Grupos' : 'Sistema Suizo'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: colors.text.tertiary, fontSize: '13px' }}>Categorías:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end' }}>
                        {formData.categories.map(cat => {
                          // Find category in all groups
                          const allCategories = [
                            ...CATEGORIES.masculine,
                            ...CATEGORIES.feminine,
                            ...CATEGORIES.mixed
                          ]
                          const category = allCategories.find(c => c.value === cat)

                          // Determine prefix based on category value
                          let prefix = ''
                          if (cat.startsWith('M_')) prefix = '👨 '
                          else if (cat.startsWith('F_')) prefix = '👩 '
                          else if (cat.startsWith('MX_')) prefix = '👫 '

                          return (
                            <span key={cat} style={{
                              fontSize: '11px',
                              padding: '4px 8px',
                              background: colors.primary[100],
                              color: colors.primary[700],
                              borderRadius: '6px',
                              fontWeight: 600
                            }}>
                              {prefix}{category?.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates Summary */}
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Calendar size={18} color={colors.primary[600]} />
                    Fechas y Logística
                  </h3>
                  <div style={{
                    padding: '16px',
                    background: colors.neutral[50],
                    borderRadius: '10px',
                    display: 'grid',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.text.tertiary, fontSize: '13px' }}>Inscripciones:</span>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>
                        {new Date(formData.registrationStart).toLocaleDateString('es-MX')} - {new Date(formData.registrationEnd).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.text.tertiary, fontSize: '13px' }}>Torneo:</span>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>
                        {new Date(formData.startDate).toLocaleDateString('es-MX')}
                        {formData.endDate && ` - ${new Date(formData.endDate).toLocaleDateString('es-MX')}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.text.tertiary, fontSize: '13px' }}>Parejas:</span>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{formData.maxPlayers / 2} parejas ({formData.maxPlayers} jugadores)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.text.tertiary, fontSize: '13px' }}>Inscripción:</span>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: colors.primary[600] }}>
                        ${formData.registrationFee} MXN
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.text.tertiary, fontSize: '13px' }}>Premio:</span>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: colors.accent[600] }}>
                        ${formData.prizePool} MXN
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Config Summary */}
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Settings size={18} color={colors.primary[600]} />
                    Configuración de Partidos
                  </h3>
                  <div style={{
                    padding: '16px',
                    background: colors.neutral[50],
                    borderRadius: '10px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.text.tertiary, fontSize: '13px' }}>Duración:</span>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{formData.matchDuration} min</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.text.tertiary, fontSize: '13px' }}>Sets:</span>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>Mejor de {formData.sets}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.text.tertiary, fontSize: '13px' }}>Juegos:</span>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{formData.games} por set</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.text.tertiary, fontSize: '13px' }}>Tie-break:</span>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>
                        {formData.tiebreak ? '✓ Sí' : '✗ No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardModernContent>
          </CardModern>
        )}

        {/* Navigation Buttons */}
        <div style={{
          marginTop: '32px',
          display: 'flex',
          gap: '16px',
          justifyContent: 'space-between'
        }}>
          <button
            type="button"
            onClick={currentStep === 1 ? () => router.push(`/c/${clubSlug}/dashboard/tournaments`) : handleBack}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: `1px solid ${colors.border.default}`,
              background: 'white',
              color: colors.text.primary,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.neutral[50]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white'
            }}
          >
            <ArrowLeft size={18} />
            {currentStep === 1 ? 'Cancelar' : 'Anterior'}
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed}
                style={{
                  padding: '12px 32px',
                  borderRadius: '10px',
                  background: canProceed
                    ? 'linear-gradient(135deg, #10B981, #059669)'
                    : colors.neutral[300],
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: canProceed ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (canProceed) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (canProceed) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }
                }}
              >
                Siguiente
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: '12px 32px',
                  borderRadius: '10px',
                  background: loading
                    ? colors.neutral[300]
                    : 'linear-gradient(135deg, #10B981, #059669)',
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }
                }}
              >
                <Save size={18} />
                {loading ? 'Creando Torneo...' : 'Crear Torneo'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
