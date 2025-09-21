import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface RegistrationModalProps {
  show: boolean
  onClose: () => void
  onSave: (registration: any) => void
  registration?: any
  tournamentId: string
}

export default function RegistrationModal({
  show,
  onClose,
  onSave,
  registration,
  tournamentId
}: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    player1Name: '',
    player1Email: '',
    player1Phone: '',
    player1Level: 'Intermedio',
    player2Name: '',
    player2Email: '',
    player2Phone: '',
    player2Level: 'Intermedio',
    teamName: '',
    teamLevel: 'Intermedio',
    modality: 'masculine',
    category: '3F',
    paymentMethod: 'ONSITE_CASH'
  })

  const skillLevels = [
    'Principiante',
    'Intermedio',
    'Avanzado',
    'Profesional'
  ]

  const modalities = [
    { value: 'masculine', label: 'Masculino', description: 'Torneo para equipos masculinos' },
    { value: 'feminine', label: 'Femenino', description: 'Torneo para equipos femeninos' },
    { value: 'mixed', label: 'Mixto', description: 'Torneo para equipos mixtos' }
  ]

  const categoryByModality = {
    'masculine': [
      { value: '1F', label: 'Primera Fuerza', description: 'Nivel avanzado - Jugadores experimentados' },
      { value: '2F', label: 'Segunda Fuerza', description: 'Nivel intermedio-alto' },
      { value: '3F', label: 'Tercera Fuerza', description: 'Nivel intermedio' },
      { value: '4F', label: 'Cuarta Fuerza', description: 'Nivel intermedio-bajo' },
      { value: '5F', label: 'Quinta Fuerza', description: 'Nivel principiante-alto' },
      { value: '6F', label: 'Sexta Fuerza', description: 'Nivel principiante' },
      { value: 'OPEN', label: 'Open', description: 'Abierto a todos los niveles' }
    ],
    'feminine': [
      { value: '1F', label: 'Primera Fuerza', description: 'Nivel avanzado - Jugadoras experimentadas' },
      { value: '2F', label: 'Segunda Fuerza', description: 'Nivel intermedio-alto' },
      { value: '3F', label: 'Tercera Fuerza', description: 'Nivel intermedio' },
      { value: '4F', label: 'Cuarta Fuerza', description: 'Nivel intermedio-bajo' },
      { value: '5F', label: 'Quinta Fuerza', description: 'Nivel principiante-alto' },
      { value: '6F', label: 'Sexta Fuerza', description: 'Nivel principiante' },
      { value: 'OPEN', label: 'Open', description: 'Abierto a todos los niveles' }
    ],
    'mixed': [
      { value: 'A', label: 'Categoría A', description: 'Nivel élite - Equipos de alto rendimiento' },
      { value: 'B', label: 'Categoría B', description: 'Nivel avanzado' },
      { value: 'C', label: 'Categoría C', description: 'Nivel intermedio' },
      { value: 'D', label: 'Categoría D', description: 'Nivel principiante' }
    ]
  }

  const getCategoriesForModality = (modality: string) => {
    return categoryByModality[modality as keyof typeof categoryByModality] || []
  }

  useEffect(() => {
    if (registration) {
      setFormData({
        player1Name: registration.player1Name || '',
        player1Email: registration.player1Email || '',
        player1Phone: registration.player1Phone || '',
        player1Level: registration.player1Level || 'Intermedio',
        player2Name: registration.player2Name || '',
        player2Email: registration.player2Email || '',
        player2Phone: registration.player2Phone || '',
        player2Level: registration.player2Level || 'Intermedio',
        teamName: registration.teamName || '',
        teamLevel: registration.teamLevel || 'Intermedio',
        modality: registration.modality || 'masculine',
        category: registration.category || '3F',
        paymentMethod: registration.paymentMethod || 'ONSITE_CASH'
      })
    }
  }, [registration])

  // Update category when modality changes
  useEffect(() => {
    const categories = getCategoriesForModality(formData.modality)
    if (categories.length > 0 && !categories.find(c => c.value === formData.category)) {
      setFormData(prev => ({ ...prev, category: categories[0].value }))
    }
  }, [formData.modality])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player1: {
            name: formData.player1Name,
            email: formData.player1Email,
            phone: formData.player1Phone,
            level: formData.player1Level
          },
          player2: {
            name: formData.player2Name,
            email: formData.player2Email,
            phone: formData.player2Phone,
            level: formData.player2Level
          },
          teamName: formData.teamName,
          teamLevel: formData.teamLevel,
          modality: formData.modality,
          category: formData.category,
          paymentMethod: formData.paymentMethod
        })
      })

      const data = await response.json()
      
      if (data.success) {
        onSave(data.registration)
        onClose()
      } else {
        alert(data.error || 'Error al guardar inscripción')
      }
    } catch (error) {
      console.error('Error saving registration:', error)
      alert('Error al guardar inscripción')
    }
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600 }}>
            {registration ? 'Editar Inscripción' : 'Nueva Inscripción'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Competition Category */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px',
            marginBottom: '24px',
            padding: '20px',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FEF9C3 100%)',
            borderRadius: '12px',
            border: '2px solid #FCD34D'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#92400E' }}>
                Modalidad *
              </label>
              <select
                value={formData.modality}
                onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #FCD34D',
                  background: 'white',
                  fontSize: '15px',
                  fontWeight: 500
                }}
                required
              >
                {modalities.map(mod => (
                  <option key={mod.value} value={mod.value} title={mod.description}>
                    {mod.label} - {mod.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#92400E' }}>
                Categoría Competitiva *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #FCD34D',
                  background: 'white',
                  fontSize: '15px',
                  fontWeight: 500
                }}
                required
              >
                {getCategoriesForModality(formData.modality).map(cat => (
                  <option key={cat.value} value={cat.value} title={cat.description}>
                    {cat.label} - {cat.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Name */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Nombre del Equipo (Opcional)
            </label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}
              placeholder="Ej: Los Campeones"
            />
          </div>

          {/* Team Level */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Nivel del Equipo
            </label>
            <select
              value={formData.teamLevel}
              onChange={(e) => setFormData({ ...formData, teamLevel: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}
              required
            >
              {skillLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Player 1 */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                Jugador 1
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.player1Name}
                  onChange={(e) => setFormData({ ...formData, player1Name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.player1Email}
                  onChange={(e) => setFormData({ ...formData, player1Email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.player1Phone}
                  onChange={(e) => setFormData({ ...formData, player1Phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Nivel de Juego
                </label>
                <select
                  value={formData.player1Level}
                  onChange={(e) => setFormData({ ...formData, player1Level: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  {skillLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Player 2 */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                Jugador 2
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.player2Name}
                  onChange={(e) => setFormData({ ...formData, player2Name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.player2Email}
                  onChange={(e) => setFormData({ ...formData, player2Email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.player2Phone}
                  onChange={(e) => setFormData({ ...formData, player2Phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Nivel de Juego
                </label>
                <select
                  value={formData.player2Level}
                  onChange={(e) => setFormData({ ...formData, player2Level: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  {skillLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Método de Pago
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}
              required
            >
              <option value="ONSITE_CASH">Efectivo en Club</option>
              <option value="ONSITE_TERMINAL">Terminal en Club</option>
              <option value="TRANSFER">Transferencia</option>
              <option value="STRIPE">Pago en Línea</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '32px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                background: 'white',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#10B981',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {registration ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}