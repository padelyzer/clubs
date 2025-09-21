'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2, MapPin, Clock, Globe, DollarSign,
  Settings, CheckCircle, ArrowRight, ArrowLeft,
  Phone, Calendar, CreditCard, Bell, Activity,
  Store, Users, Zap, Shield, Star, TrendingUp,
  ChevronRight, Info, AlertCircle, Check,
  HelpCircle, Sparkles, Banknote, Smartphone,
  Building, Hash, Mail, MapPinned, Home, Plus,
  Trash2, Edit3, GripVertical, Eye, EyeOff
} from 'lucide-react'

export default function ClubSetupWizardSplitScreen({ params }: { params: Promise<{ clubSlug: string }> }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [clubData, setClubData] = useState<any>(null)
  const { clubSlug } = use(params)

  const [setupData, setSetupData] = useState({
    // Información básica del club
    address: '',
    city: '',
    state: '',
    country: 'México',
    postalCode: '',

    // Configuración operativa
    slotDuration: 90,
    bufferTime: 15,
    advanceBookingDays: 30,
    allowSameDayBooking: true,

    // Configuración de precios
    basePrice: 500,
    weekendPrice: 600,
    peakHourPrice: 700,
    offPeakPrice: 400,
    enablePeakPricing: false,
    enableOffPeakPricing: false,

    // Configuración financiera
    taxIncluded: true,
    taxRate: 16.0,
    cancellationFee: 0,
    noShowFee: 0,

    // Métodos de pago
    acceptCash: true,
    transferEnabled: false,
    terminalEnabled: false,
    accountHolder: '',
    accountNumber: '',
    bankName: '',
    clabe: '',
    terminalId: '',

    // Configuración de zona horaria
    timezone: 'America/Mexico_City',
    currency: 'MXN',

    // Horarios de operación
    operatingHours: {
      monday: { isOpen: true, open: '07:00', close: '22:00' },
      tuesday: { isOpen: true, open: '07:00', close: '22:00' },
      wednesday: { isOpen: true, open: '07:00', close: '22:00' },
      thursday: { isOpen: true, open: '07:00', close: '22:00' },
      friday: { isOpen: true, open: '07:00', close: '23:00' },
      saturday: { isOpen: true, open: '08:00', close: '23:00' },
      sunday: { isOpen: true, open: '08:00', close: '21:00' },
    },

    // Configuración de canchas
    courts: [
      { id: 1, name: 'Cancha 1', type: 'PADEL', indoor: true, active: true, order: 1 },
      { id: 2, name: 'Cancha 2', type: 'PADEL', indoor: true, active: true, order: 2 }
    ]
  })

  const handleInputChange = (field: string, value: any) => {
    setSetupData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOperatingHoursChange = (day: string, field: string, value: any) => {
    setSetupData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }))
  }

  // Courts management functions
  const addCourt = () => {
    const newCourt = {
      id: Date.now(),
      name: `Cancha ${setupData.courts.length + 1}`,
      type: 'PADEL',
      indoor: true,
      active: true,
      order: setupData.courts.length + 1
    }
    setSetupData(prev => ({
      ...prev,
      courts: [...prev.courts, newCourt]
    }))
  }

  const deleteCourt = (id: number) => {
    setSetupData(prev => ({
      ...prev,
      courts: prev.courts.filter(court => court.id !== id)
    }))
  }

  const updateCourt = (id: number, field: string, value: any) => {
    setSetupData(prev => ({
      ...prev,
      courts: prev.courts.map(court =>
        court.id === id ? { ...court, [field]: value } : court
      )
    }))
  }

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/club/complete-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupData)
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/c/${clubSlug}/dashboard`)
      } else {
        alert('Error al completar la configuración. Por favor, inténtalo de nuevo.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al completar la configuración. Por favor, inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Get step instructions
  const getStepInstructions = () => {
    const instructions = {
      1: {
        title: "Información del Club",
        subtitle: "Configura la ubicación de tu club",
        description: "Esta información ayudará a tus clientes a encontrarte y se mostrará en confirmaciones de reserva.",
        icon: <Building2 className="w-8 h-8 text-white" />,
        tips: [
          "Asegúrate de que la dirección sea precisa para facilitar la llegada",
          "El código postal es importante para cálculos de distancia",
          "Esta información aparecerá en las facturas y comprobantes"
        ]
      },
      2: {
        title: "Configuración de Reservas",
        subtitle: "Define las reglas de reserva",
        description: "Establece cómo funcionarán las reservas en tu club: duración, anticipación y políticas.",
        icon: <Calendar className="w-8 h-8 text-white" />,
        tips: [
          "La duración típica para pádel es de 90 minutos",
          "El tiempo de buffer evita reservas consecutivas sin descanso",
          "Permite reservas el mismo día para mayor flexibilidad"
        ]
      },
      3: {
        title: "Configuración de Precios",
        subtitle: "Establece tu estructura de precios",
        description: "Define los precios base y opcionales como horas pico, fines de semana y tarifas especiales.",
        icon: <DollarSign className="w-8 h-8 text-white" />,
        tips: [
          "El precio base es para horarios normales entre semana",
          "Las horas pico suelen ser de 19:00 a 22:00",
          "Los fines de semana pueden tener tarifas diferentes"
        ]
      },
      4: {
        title: "Configuración de Canchas",
        subtitle: "Gestiona tus espacios de juego",
        description: "Configura las canchas disponibles en tu club: nombres, tipos y características.",
        icon: <MapPin className="w-8 h-8 text-white" />,
        tips: [
          "Puedes agregar, editar o eliminar canchas según necesites",
          "El orden determina cómo aparecen en las reservas",
          "Diferencia entre canchas interiores y exteriores para mejor organización"
        ]
      },
      5: {
        title: "Horarios de Operación",
        subtitle: "Define cuándo está abierto tu club",
        description: "Establece los horarios de funcionamiento para cada día de la semana.",
        icon: <Clock className="w-8 h-8 text-white" />,
        tips: [
          "Los horarios pueden variar por día de la semana",
          "Considera horarios extendidos para fines de semana",
          "Los usuarios solo podrán reservar dentro de estos horarios"
        ]
      },
      6: {
        title: "Métodos de Pago",
        subtitle: "Configura cómo recibir pagos",
        description: "Establece los métodos de pago que aceptarás: efectivo, transferencias o terminal.",
        icon: <CreditCard className="w-8 h-8 text-white" />,
        tips: [
          "El efectivo es útil para pagos en sitio",
          "Las transferencias requieren datos bancarios válidos",
          "Los terminales necesitan configuración adicional"
        ]
      }
    }

    const current = instructions[currentStep as keyof typeof instructions]

    return (
      <div className="space-y-6">
        <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              {current.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{current.title}</h2>
              <p className="text-emerald-100">{current.subtitle}</p>
            </div>
          </div>
          <p className="text-white/90 text-lg leading-relaxed">{current.description}</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Consejos útiles:</h3>
          {current.tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-sm font-medium">{index + 1}</span>
              </div>
              <p className="text-white/80 flex-1">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Get step configuration content
  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Información del Club</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección completa
                </label>
                <input
                  type="text"
                  value={setupData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                  placeholder="Calle, número, colonia..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={setupData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                  placeholder="Ciudad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <input
                  type="text"
                  value={setupData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                  placeholder="Estado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <select
                  value={setupData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                >
                  <option value="México">México</option>
                  <option value="Estados Unidos">Estados Unidos</option>
                  <option value="Canadá">Canadá</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  value={setupData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                  placeholder="00000"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Configuración de Reservas</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración por sesión (minutos)
                </label>
                <select
                  value={setupData.slotDuration}
                  onChange={(e) => handleInputChange('slotDuration', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                >
                  <option value={60}>60 minutos</option>
                  <option value={90}>90 minutos</option>
                  <option value={120}>120 minutos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de buffer (minutos)
                </label>
                <select
                  value={setupData.bufferTime}
                  onChange={(e) => handleInputChange('bufferTime', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                >
                  <option value={0}>Sin buffer</option>
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de anticipación para reservar
                </label>
                <select
                  value={setupData.advanceBookingDays}
                  onChange={(e) => handleInputChange('advanceBookingDays', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                >
                  <option value={7}>7 días</option>
                  <option value={15}>15 días</option>
                  <option value={30}>30 días</option>
                  <option value={60}>60 días</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div>
                  <p className="font-medium text-gray-900">Permitir reservas el mismo día</p>
                  <p className="text-sm text-gray-500">Los usuarios pueden reservar hoy</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('allowSameDayBooking', !setupData.allowSameDayBooking)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors border-2"
                  style={{
                    backgroundColor: setupData.allowSameDayBooking ? '#059669' : '#e5e7eb',
                    borderColor: setupData.allowSameDayBooking ? '#059669' : '#6b7280'
                  }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm"
                    style={{
                      backgroundColor: '#ffffff',
                      transform: setupData.allowSameDayBooking ? 'translateX(24px)' : 'translateX(4px)'
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Configuración de Precios</h3>

            <div className="space-y-6">
              {/* Precio base */}
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-100">
                <h4 className="font-semibold text-gray-900 mb-3">Precio base de renta de cancha</h4>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium z-10">$</span>
                  <input
                    type="number"
                    min="0"
                    value={setupData.basePrice}
                    onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                    className="w-full pl-14 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    placeholder="500"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">Precio estándar para horarios normales entre semana</p>
              </div>

              {/* Precio de fin de semana */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio fin de semana
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium z-10">$</span>
                    <input
                      type="number"
                      min="0"
                      value={setupData.weekendPrice}
                      onChange={(e) => handleInputChange('weekendPrice', parseFloat(e.target.value) || 0)}
                      className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                      placeholder="600"
                    />
                  </div>
                </div>
              </div>

              {/* Opciones avanzadas */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Opciones avanzadas (opcional)</h4>

                {/* Hora pico */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Habilitar precio hora pico</p>
                    <p className="text-sm text-gray-500">Precio especial para horarios de alta demanda (19:00-22:00)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('enablePeakPricing', !setupData.enablePeakPricing)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors border-2"
                    style={{
                      backgroundColor: setupData.enablePeakPricing ? '#059669' : '#e5e7eb',
                      borderColor: setupData.enablePeakPricing ? '#059669' : '#6b7280'
                    }}
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm"
                      style={{
                        backgroundColor: '#ffffff',
                        transform: setupData.enablePeakPricing ? 'translateX(24px)' : 'translateX(4px)'
                      }}
                    />
                  </button>
                </div>

                {setupData.enablePeakPricing && (
                  <div className="ml-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio hora pico
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium z-10">$</span>
                      <input
                        type="number"
                        min="0"
                        value={setupData.peakHourPrice}
                        onChange={(e) => handleInputChange('peakHourPrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-14 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                        placeholder="700"
                      />
                    </div>
                  </div>
                )}

                {/* Hora valle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Habilitar precio hora valle</p>
                    <p className="text-sm text-gray-500">Precio especial para horarios de baja demanda (07:00-15:00)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('enableOffPeakPricing', !setupData.enableOffPeakPricing)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors border-2"
                    style={{
                      backgroundColor: setupData.enableOffPeakPricing ? '#059669' : '#e5e7eb',
                      borderColor: setupData.enableOffPeakPricing ? '#059669' : '#6b7280'
                    }}
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm"
                      style={{
                        backgroundColor: '#ffffff',
                        transform: setupData.enableOffPeakPricing ? 'translateX(24px)' : 'translateX(4px)'
                      }}
                    />
                  </button>
                </div>

                {setupData.enableOffPeakPricing && (
                  <div className="ml-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio hora valle
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium z-10">$</span>
                      <input
                        type="number"
                        min="0"
                        value={setupData.offPeakPrice}
                        onChange={(e) => handleInputChange('offPeakPrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-14 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                        placeholder="400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Configuración de Canchas</h3>
              <button
                type="button"
                onClick={addCourt}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar Cancha
              </button>
            </div>

            <div className="space-y-4">
              {setupData.courts.map((court, index) => (
                <div key={court.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium text-gray-900">Cancha {index + 1}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCourt(court.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={court.name}
                        onChange={(e) => updateCourt(court.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        placeholder="Nombre de la cancha"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        value={court.type}
                        onChange={(e) => updateCourt(court.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      >
                        <option value="PADEL">Pádel</option>
                        <option value="TENNIS">Tenis</option>
                        <option value="SQUASH">Squash</option>
                        <option value="BADMINTON">Bádminton</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={court.indoor}
                          onChange={(e) => updateCourt(court.id, 'indoor', e.target.checked)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Interior</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={court.active}
                          onChange={(e) => updateCourt(court.id, 'active', e.target.checked)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Activa</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {setupData.courts.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay canchas configuradas</p>
                <p className="text-sm text-gray-400">Agrega al menos una cancha para continuar</p>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Horarios de Operación</h3>

            <div className="space-y-4">
              {Object.entries(setupData.operatingHours).map(([day, hours]) => {
                const dayNames = {
                  monday: 'Lunes',
                  tuesday: 'Martes',
                  wednesday: 'Miércoles',
                  thursday: 'Jueves',
                  friday: 'Viernes',
                  saturday: 'Sábado',
                  sunday: 'Domingo'
                }

                return (
                  <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 min-w-[100px]">
                      <input
                        type="checkbox"
                        checked={hours.isOpen}
                        onChange={(e) => handleOperatingHoursChange(day, 'isOpen', e.target.checked)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-gray-900">
                        {dayNames[day as keyof typeof dayNames]}
                      </span>
                    </div>

                    {hours.isOpen ? (
                      <div className="flex items-center gap-4 flex-1">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Apertura</label>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                        </div>
                        <span className="text-gray-400">a</span>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Cierre</label>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic flex-1">Cerrado</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Métodos de Pago</h3>

            <div className="space-y-6">
              {/* Efectivo */}
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Banknote className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Aceptar efectivo</p>
                    <p className="text-sm text-gray-500">Permitir pagos en efectivo en sitio</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('acceptCash', !setupData.acceptCash)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors border-2"
                  style={{
                    backgroundColor: setupData.acceptCash ? '#059669' : '#e5e7eb',
                    borderColor: setupData.acceptCash ? '#059669' : '#6b7280'
                  }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm"
                    style={{
                      backgroundColor: '#ffffff',
                      transform: setupData.acceptCash ? 'translateX(24px)' : 'translateX(4px)'
                    }}
                  />
                </button>
              </div>

              {/* Transferencias */}
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Transferencias bancarias</p>
                      <p className="text-sm text-gray-500">Configurar cuenta para recibir transferencias</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('transferEnabled', !setupData.transferEnabled)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors border-2"
                    style={{
                      backgroundColor: setupData.transferEnabled ? '#059669' : '#e5e7eb',
                      borderColor: setupData.transferEnabled ? '#059669' : '#6b7280'
                    }}
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm"
                      style={{
                        backgroundColor: '#ffffff',
                        transform: setupData.transferEnabled ? 'translateX(24px)' : 'translateX(4px)'
                      }}
                    />
                  </button>
                </div>

                {setupData.transferEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titular de la cuenta
                      </label>
                      <input
                        type="text"
                        value={setupData.accountHolder}
                        onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        placeholder="Nombre del titular"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de cuenta
                      </label>
                      <input
                        type="text"
                        value={setupData.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        placeholder="1234567890"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Banco
                      </label>
                      <input
                        type="text"
                        value={setupData.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        placeholder="Nombre del banco"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CLABE (opcional)
                      </label>
                      <input
                        type="text"
                        value={setupData.clabe}
                        onChange={(e) => handleInputChange('clabe', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        placeholder="123456789012345678"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Terminal */}
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Terminal de pago</p>
                      <p className="text-sm text-gray-500">Configurar terminal para tarjetas</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('terminalEnabled', !setupData.terminalEnabled)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors border-2"
                    style={{
                      backgroundColor: setupData.terminalEnabled ? '#059669' : '#e5e7eb',
                      borderColor: setupData.terminalEnabled ? '#059669' : '#6b7280'
                    }}
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm"
                      style={{
                        backgroundColor: '#ffffff',
                        transform: setupData.terminalEnabled ? 'translateX(24px)' : 'translateX(4px)'
                      }}
                    />
                  </button>
                </div>

                {setupData.terminalEnabled && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID del terminal
                    </label>
                    <input
                      type="text"
                      value={setupData.terminalId}
                      onChange={(e) => handleInputChange('terminalId', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="ID o número del terminal"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Instructions */}
      <div className="w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-8 flex flex-col">
        {/* Header */}
        <div className="mb-8">
          {/* Logo */}
          <div className="mb-6">
            <img
              src="/padelyzer-logo-blanco.png"
              alt="Padelyzer"
              className="h-8 w-auto"
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Configuración del Club</h1>
              <p className="text-emerald-100">Paso {currentStep} de 6</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${step < currentStep
                    ? 'bg-white text-emerald-600'
                    : step === currentStep
                    ? 'bg-white/20 text-white ring-2 ring-white/30 backdrop-blur-sm'
                    : 'bg-white/10 text-white/60'
                  }
                `}>
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 6 && (
                  <div className={`w-12 h-0.5 ml-2 ${
                    step < currentStep ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Content */}
        <div className="flex-1">
          {getStepInstructions()}
        </div>

        {/* Bottom Note */}
        <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-white/80 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-white/90 font-medium mb-1">Recuerda</p>
              <p className="text-sm text-white/70">
                Toda esta configuración puede ser modificada después en la sección de ajustes del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Configuration */}
      <div className="w-1/2 bg-white">
        <div className="h-full flex flex-col">
          {/* Configuration Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {getStepContent()}
          </div>

          {/* Navigation */}
          <div className="p-8 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg border border-emerald-600"
                  style={{ backgroundColor: '#059669', color: '#ffffff' }}
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || setupData.courts.length === 0}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all shadow-lg ${
                    loading || setupData.courts.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600'
                  }`}
                  style={loading || setupData.courts.length === 0 ? {} : { backgroundColor: '#059669', color: '#ffffff' }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Completando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Completar Configuración
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}