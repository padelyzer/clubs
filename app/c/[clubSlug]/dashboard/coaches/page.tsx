'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { AppleModal } from '@/components/design-system/AppleModal'
import { AppleButton } from '@/components/design-system/AppleButton'
import { AppleInput } from '@/components/design-system/AppleInput'
import { SettingsCard } from '@/components/design-system/SettingsCard'
import { 
  User, Plus, Edit, Trash2, X, Phone, Mail, 
  DollarSign, BookOpen, TrendingUp, Search,
  GraduationCap, Award, Star, Calendar, ArrowLeft,
  Clock, Check
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'

type Instructor = {
  id: string
  name: string
  email?: string
  phone: string
  bio?: string
  specialties: string[]
  hourlyRate: number
  paymentType: 'HOURLY' | 'MONTHLY'
  monthlyRate: number
  active: boolean
  totalClasses?: number
  upcomingClasses?: number
}

export default function CoachesPage() {
  const router = useRouter()
  const params = useParams()
  const clubSlug = params.clubSlug as string
  const [loading, setLoading] = useState(false)
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreatingInstructor, setIsCreatingInstructor] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null)
  const [specialtyMessage, setSpecialtyMessage] = useState('')
  
  // Instructor form
  const [instructorForm, setInstructorForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    specialties: [] as string[],
    hourlyRate: 0,
    paymentType: 'HOURLY' as 'HOURLY' | 'MONTHLY',
    monthlyRate: 0,
    availability: {
      monday: { available: false, startTime: '09:00', endTime: '18:00' },
      tuesday: { available: false, startTime: '09:00', endTime: '18:00' },
      wednesday: { available: false, startTime: '09:00', endTime: '18:00' },
      thursday: { available: false, startTime: '09:00', endTime: '18:00' },
      friday: { available: false, startTime: '09:00', endTime: '18:00' },
      saturday: { available: false, startTime: '09:00', endTime: '14:00' },
      sunday: { available: false, startTime: '09:00', endTime: '14:00' }
    }
  })

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/instructors')
      const data = await response.json()
      if (data.success) {
        setInstructors(data.instructors || [])
      }
    } catch (error) {
      console.error('Error fetching instructors:', error)
      setInstructors([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInstructor = async () => {
    try {
      const response = await fetch('/api/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instructorForm)
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchInstructors()
        setIsCreatingInstructor(false)
        resetInstructorForm()
      } else {
        alert(data.error || 'Error al crear instructor')
      }
    } catch (error) {
      console.error('Error creating instructor:', error)
    }
  }

  const handleUpdateInstructor = async () => {
    if (!editingInstructor) return
    
    try {
      const response = await fetch('/api/instructors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingInstructor.id,
          ...instructorForm
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchInstructors()
        setEditingInstructor(null)
        resetInstructorForm()
      } else {
        alert(data.error || 'Error al actualizar instructor')
      }
    } catch (error) {
      console.error('Error updating instructor:', error)
    }
  }

  const handleDeleteInstructor = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este instructor?')) return
    
    try {
      const response = await fetch(`/api/instructors?id=${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchInstructors()
      } else {
        alert(data.error || 'Error al eliminar instructor')
      }
    } catch (error) {
      console.error('Error deleting instructor:', error)
    }
  }

  const resetInstructorForm = () => {
    setInstructorForm({
      name: '',
      email: '',
      phone: '',
      bio: '',
      specialties: [],
      hourlyRate: 0,
      paymentType: 'HOURLY',
      monthlyRate: 0,
      availability: {
        monday: { available: false, startTime: '09:00', endTime: '18:00' },
        tuesday: { available: false, startTime: '09:00', endTime: '18:00' },
        wednesday: { available: false, startTime: '09:00', endTime: '18:00' },
        thursday: { available: false, startTime: '09:00', endTime: '18:00' },
        friday: { available: false, startTime: '09:00', endTime: '18:00' },
        saturday: { available: false, startTime: '09:00', endTime: '14:00' },
        sunday: { available: false, startTime: '09:00', endTime: '14:00' }
      }
    })
    setSpecialtyMessage('')
  }

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.phone.includes(searchTerm)
  )

  return (
    <CleanDashboardLayout
      clubName="Club Pádel México"
      userName="Administrador del Club"
      userRole="Administrador"
    >
      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#182A01',
                margin: '0 0 8px 0',
                letterSpacing: '-0.02em'
              }}>
                Coaches
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#516640',
                fontWeight: 400,
                margin: 0
              }}>
                Gestiona los instructores y coaches del club
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <ButtonModern 
                variant="secondary"
                icon={<ArrowLeft size={18} />}
                onClick={() => router.push(`/c/${clubSlug}/dashboard/classes`)}
              >
                Volver a Clases
              </ButtonModern>
              <button
                onClick={() => {
                  resetInstructorForm()
                  setIsCreatingInstructor(true)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#182A01',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(164, 223, 78, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(164, 223, 78, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(164, 223, 78, 0.3)'
                }}
              >
                <Plus size={18} />
                Nuevo Coach
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <CardModern variant="glass">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <GraduationCap size={20} color="#182A01" />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
                {instructors.length}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Total de coaches
              </div>
            </div>
          </CardModern>

          <CardModern variant="glass">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={20} color="#182A01" />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
                {instructors.filter(i => i.active).length}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Coaches activos
              </div>
            </div>
          </CardModern>

          <CardModern variant="glass">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BookOpen size={20} color="#182A01" />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
                {instructors.reduce((sum, i) => sum + (i.totalClasses || 0), 0)}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Clases impartidas
              </div>
            </div>
          </CardModern>

          <CardModern variant="glass">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DollarSign size={20} color="#182A01" />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
                {formatCurrency(
                  instructors.filter(i => i.paymentType === 'HOURLY')
                    .reduce((sum, i) => sum + i.hourlyRate, 0) / 
                  instructors.filter(i => i.paymentType === 'HOURLY').length || 0
                )}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Tarifa promedio/hora
              </div>
            </div>
          </CardModern>
        </div>

        {/* Search Bar */}
        <CardModern variant="glass" style={{ marginBottom: '24px' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#516640'
              }} />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '8px',
                  border: '1px solid rgba(164, 223, 78, 0.2)',
                  background: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </CardModern>

        {/* Instructors Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <div>Cargando...</div>
          </div>
        ) : filteredInstructors.length === 0 ? (
          <CardModern variant="glass">
            <CardModernContent>
              <div style={{ padding: '60px', textAlign: 'center', color: '#516640' }}>
                <GraduationCap size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                  {searchTerm ? 'No se encontraron coaches' : 'No hay coaches registrados'}
                </p>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea un nuevo coach para comenzar'}
                </p>
              </div>
            </CardModernContent>
          </CardModern>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredInstructors.map(instructor => (
              <CardModern key={instructor.id} variant="glass" interactive>
                <CardModernContent>
                  <div style={{ padding: '20px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <User size={24} color="#182A01" />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#182A01', margin: '0 0 4px 0' }}>
                            {instructor.name}
                          </h3>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 500,
                            background: instructor.active ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: instructor.active ? '#16a34a' : '#ef4444'
                          }}>
                            {instructor.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => {
                            setInstructorForm({
                              name: instructor.name,
                              email: instructor.email || '',
                              phone: instructor.phone,
                              bio: instructor.bio || '',
                              specialties: instructor.specialties || [],
                              hourlyRate: instructor.hourlyRate,
                              paymentType: instructor.paymentType || 'HOURLY',
                              monthlyRate: instructor.monthlyRate || 0,
                              availability: {
                                monday: { available: false, startTime: '09:00', endTime: '18:00' },
                                tuesday: { available: false, startTime: '09:00', endTime: '18:00' },
                                wednesday: { available: false, startTime: '09:00', endTime: '18:00' },
                                thursday: { available: false, startTime: '09:00', endTime: '18:00' },
                                friday: { available: false, startTime: '09:00', endTime: '18:00' },
                                saturday: { available: false, startTime: '09:00', endTime: '14:00' },
                                sunday: { available: false, startTime: '09:00', endTime: '14:00' }
                              }
                            })
                            setEditingInstructor(instructor)
                          }}
                          style={{
                            padding: '6px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#516640'
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteInstructor(instructor.id)}
                          style={{
                            padding: '6px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={14} color="#516640" />
                        <span style={{ fontSize: '13px', color: '#516640' }}>
                          {instructor.phone}
                        </span>
                      </div>
                      {instructor.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={14} color="#516640" />
                          <span style={{ fontSize: '13px', color: '#516640' }}>
                            {instructor.email}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Specialties */}
                    {instructor.specialties && instructor.specialties.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '11px', color: '#516640', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
                          Especialidades
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {instructor.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              style={{
                                padding: '4px 10px',
                                background: 'rgba(164, 223, 78, 0.1)',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: '#516640'
                              }}
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    {instructor.bio && (
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '13px', color: '#516640', lineHeight: '1.5' }}>
                          {instructor.bio}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr 1fr', 
                      gap: '12px',
                      padding: '12px',
                      background: 'rgba(164, 223, 78, 0.05)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 600, color: '#182A01' }}>
                          {instructor.totalClasses || 0}
                        </div>
                        <div style={{ fontSize: '11px', color: '#516640' }}>
                          Clases totales
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 600, color: '#182A01' }}>
                          {instructor.upcomingClasses || 0}
                        </div>
                        <div style={{ fontSize: '11px', color: '#516640' }}>
                          Próximas
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 600, color: '#182A01' }}>
                          {instructor.paymentType === 'HOURLY' 
                            ? formatCurrency(instructor.hourlyRate)
                            : formatCurrency(instructor.monthlyRate)
                          }
                        </div>
                        <div style={{ fontSize: '11px', color: '#516640' }}>
                          {instructor.paymentType === 'HOURLY' ? 'Por hora' : 'Por mes'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardModernContent>
              </CardModern>
            ))}
          </div>
        )}

        {/* Create/Edit Instructor Modal */}
        <AppleModal
          isOpen={isCreatingInstructor || editingInstructor !== null}
          onClose={() => {
            setIsCreatingInstructor(false)
            setEditingInstructor(null)
            resetInstructorForm()
          }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={16} color="#182A01" />
              </div>
              {isCreatingInstructor ? 'Nuevo Coach' : 'Editar Coach'}
            </div>
          }
          size="large"
        >
          {/* Enhanced Progress Indicator */}
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.08), rgba(102, 231, 170, 0.05))',
            borderRadius: '16px',
            marginBottom: '24px',
            border: '1px solid rgba(164, 223, 78, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <GraduationCap size={20} color="#A4DF4E" />
              <span style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#182A01'
              }}>
                Información del Coach
              </span>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#516640',
              margin: 0,
              lineHeight: 1.5
            }}>
              {isCreatingInstructor 
                ? 'Configura los datos básicos y el tipo de pago para el nuevo coach.'
                : 'Modifica la información y configuración de pago del coach.'}
            </p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault()
            isCreatingInstructor ? handleCreateInstructor() : handleUpdateInstructor()
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Información Básica */}
              <SettingsCard
                title="Información Básica"
                description="Datos de contacto del instructor"
                icon={<User size={20} />}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <AppleInput
                    label="Nombre completo"
                    value={instructorForm.name}
                    onChange={(e) => setInstructorForm({ ...instructorForm, name: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                    icon={<User size={16} />}
                  />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <AppleInput
                      label="Email"
                      type="email"
                      value={instructorForm.email}
                      onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })}
                      placeholder="instructor@email.com"
                      icon={<Mail size={16} />}
                    />
                    
                    <AppleInput
                      label="Teléfono"
                      value={instructorForm.phone}
                      onChange={(e) => setInstructorForm({ ...instructorForm, phone: e.target.value })}
                      placeholder="55 1234 5678"
                      required
                      icon={<Phone size={16} />}
                    />
                  </div>
                </div>
              </SettingsCard>
                  
              {/* Configuración de Pago */}
              <SettingsCard
                title="Configuración de Pago"
                description="Define cómo se calculará la remuneración del instructor"
                icon={<DollarSign size={20} />}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Payment Type Selector */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#182A01',
                      marginBottom: '8px'
                    }}>
                      Tipo de Pago
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {[
                        { value: 'HOURLY', label: 'Por Hora', desc: 'Se paga por cada clase impartida' },
                        { value: 'MONTHLY', label: 'Mensual', desc: 'Salario fijo mensual' }
                      ].map((option) => (
                        <div
                          key={option.value}
                          onClick={() => setInstructorForm({ ...instructorForm, paymentType: option.value as 'HOURLY' | 'MONTHLY' })}
                          style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: '12px',
                            border: `2px solid ${instructorForm.paymentType === option.value ? '#A4DF4E' : 'rgba(164, 223, 78, 0.2)'}`,
                            background: instructorForm.paymentType === option.value 
                              ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))' 
                              : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '4px'
                          }}>
                            <span style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#182A01'
                            }}>
                              {option.label}
                            </span>
                            {instructorForm.paymentType === option.value && (
                              <Check size={16} color="#A4DF4E" />
                            )}
                          </div>
                          <span style={{
                            fontSize: '12px',
                            color: '#516640'
                          }}>
                            {option.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Amount Input */}
                  {instructorForm.paymentType === 'HOURLY' ? (
                    <AppleInput
                      label="Tarifa por hora (MXN)"
                      type="number"
                      min="0"
                      value={instructorForm.hourlyRate}
                      onChange={(e) => setInstructorForm({ ...instructorForm, hourlyRate: Number(e.target.value) })}
                      placeholder="500"
                      icon={<Clock size={16} />}
                    />
                  ) : (
                    <AppleInput
                      label="Salario mensual (MXN)"
                      type="number"
                      min="0"
                      value={instructorForm.monthlyRate}
                      onChange={(e) => setInstructorForm({ ...instructorForm, monthlyRate: Number(e.target.value) })}
                      placeholder="15000"
                      icon={<Calendar size={16} />}
                    />
                  )}
                </div>
              </SettingsCard>
                  
              {/* Información Adicional */}
              <SettingsCard
                title="Información Adicional"
                description="Especialidades y biografía del instructor"
                icon={<Award size={20} />}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#182A01',
                      marginBottom: '8px'
                    }}>
                      Especialidades
                    </label>
                    <input
                      type="text"
                      placeholder="Presiona Enter para agregar (ej: Técnica, Táctica...)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const newSpecialty = e.currentTarget.value.trim()
                          
                          // Clear any previous message
                          setSpecialtyMessage('')
                          
                          // Prevent duplicates
                          if (!instructorForm.specialties.includes(newSpecialty)) {
                            setInstructorForm({
                              ...instructorForm,
                              specialties: [...instructorForm.specialties, newSpecialty]
                            })
                            setSpecialtyMessage(`✓ "${newSpecialty}" agregada exitosamente`)
                            
                            // Clear success message after 2 seconds
                            setTimeout(() => setSpecialtyMessage(''), 2000)
                          } else {
                            setSpecialtyMessage(`⚠ "${newSpecialty}" ya está en la lista`)
                            
                            // Clear error message after 3 seconds
                            setTimeout(() => setSpecialtyMessage(''), 3000)
                          }
                          
                          e.currentTarget.value = ''
                          e.preventDefault()
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid rgba(164, 223, 78, 0.2)',
                        background: 'white',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                    />
                    
                    {/* Specialty feedback message */}
                    {specialtyMessage && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 500,
                        background: specialtyMessage.startsWith('✓') 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(251, 191, 36, 0.1)',
                        color: specialtyMessage.startsWith('✓') 
                          ? '#16a34a' 
                          : '#f59e0b',
                        border: specialtyMessage.startsWith('✓')
                          ? '1px solid rgba(34, 197, 94, 0.2)'
                          : '1px solid rgba(251, 191, 36, 0.2)'
                      }}>
                        {specialtyMessage}
                      </div>
                    )}
                    
                    {instructorForm.specialties.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                        {instructorForm.specialties.map((spec, index) => (
                          <span
                            key={index}
                            style={{
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))',
                              borderRadius: '20px',
                              fontSize: '12px',
                              color: '#516640',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              border: '1px solid rgba(164, 223, 78, 0.2)'
                            }}
                          >
                            {spec}
                            <button
                              onClick={() => {
                                setInstructorForm({
                                  ...instructorForm,
                                  specialties: instructorForm.specialties.filter((_, i) => i !== index)
                                })
                                setSpecialtyMessage(`✓ "${spec}" eliminada`)
                                setTimeout(() => setSpecialtyMessage(''), 2000)
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                                e.currentTarget.style.color = '#ef4444'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = '#6b7280'
                              }}
                              title="Eliminar especialidad"
                            >
                              <X size={12} color="#6b7280" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Help message when no specialties */}
                    {instructorForm.specialties.length === 0 && !specialtyMessage && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(164, 223, 78, 0.05)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#516640',
                        border: '1px solid rgba(164, 223, 78, 0.1)',
                        fontStyle: 'italic'
                      }}>
                        💡 Escribe especialidades como "Técnica", "Táctica", "Principiantes", "Avanzados", etc. y presiona Enter para agregarlas.
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#182A01',
                      marginBottom: '8px'
                    }}>
                      Biografía
                    </label>
                    <textarea
                      value={instructorForm.bio}
                      onChange={(e) => setInstructorForm({ ...instructorForm, bio: e.target.value })}
                      placeholder="Experiencia, logros y metodología de enseñanza..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid rgba(164, 223, 78, 0.2)',
                        background: 'white',
                        fontSize: '14px',
                        minHeight: '100px',
                        resize: 'vertical',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>
              </SettingsCard>
                  
                  {/* Disponibilidad */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '12px', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#182A01',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(164, 223, 78, 0.1)'
                    }}>
                      Disponibilidad Semanal
                    </label>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { key: 'monday', label: 'Lunes' },
                        { key: 'tuesday', label: 'Martes' },
                        { key: 'wednesday', label: 'Miércoles' },
                        { key: 'thursday', label: 'Jueves' },
                        { key: 'friday', label: 'Viernes' },
                        { key: 'saturday', label: 'Sábado' },
                        { key: 'sunday', label: 'Domingo' }
                      ].map(day => (
                        <div key={day.key} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          padding: '8px 12px',
                          background: instructorForm.availability[day.key as keyof typeof instructorForm.availability].available ? 'rgba(164, 223, 78, 0.05)' : 'transparent',
                          borderRadius: '8px',
                          border: '1px solid rgba(164, 223, 78, 0.1)'
                        }}>
                          <input
                            type="checkbox"
                            checked={instructorForm.availability[day.key as keyof typeof instructorForm.availability].available}
                            onChange={(e) => setInstructorForm({
                              ...instructorForm,
                              availability: {
                                ...instructorForm.availability,
                                [day.key]: {
                                  ...instructorForm.availability[day.key as keyof typeof instructorForm.availability],
                                  available: e.target.checked
                                }
                              }
                            })}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span style={{ width: '100px', fontSize: '14px', color: '#182A01' }}>
                            {day.label}
                          </span>
                          {instructorForm.availability[day.key as keyof typeof instructorForm.availability].available && (
                            <>
                              <input
                                type="time"
                                value={instructorForm.availability[day.key as keyof typeof instructorForm.availability].startTime}
                                onChange={(e) => setInstructorForm({
                                  ...instructorForm,
                                  availability: {
                                    ...instructorForm.availability,
                                    [day.key]: {
                                      ...instructorForm.availability[day.key as keyof typeof instructorForm.availability],
                                      startTime: e.target.value
                                    }
                                  }
                                })}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(164, 223, 78, 0.2)',
                                  fontSize: '13px'
                                }}
                              />
                              <span style={{ fontSize: '13px', color: '#516640' }}>a</span>
                              <input
                                type="time"
                                value={instructorForm.availability[day.key as keyof typeof instructorForm.availability].endTime}
                                onChange={(e) => setInstructorForm({
                                  ...instructorForm,
                                  availability: {
                                    ...instructorForm.availability,
                                    [day.key]: {
                                      ...instructorForm.availability[day.key as keyof typeof instructorForm.availability],
                                      endTime: e.target.value
                                    }
                                  }
                                })}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(164, 223, 78, 0.2)',
                                  fontSize: '13px'
                                }}
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <AppleButton
                  variant="secondary"
                  size="large"
                  onClick={() => {
                    setIsCreatingInstructor(false)
                    setEditingInstructor(null)
                    resetInstructorForm()
                  }}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </AppleButton>
                <AppleButton
                  variant="primary"
                  size="large"
                  type="submit"
                  style={{ flex: 1 }}
                >
                  {isCreatingInstructor ? 'Crear Coach' : 'Guardar Cambios'}
                </AppleButton>
              </div>
            </div>
          </form>
        </AppleModal>
      </div>
    </CleanDashboardLayout>
  )
}