'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useNotify } from '@/contexts/NotificationContext'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { 
  Users, Plus, Edit, Trash2, Phone, Mail, DollarSign, 
  Award, CheckCircle, XCircle, Loader2, X, UserCheck, ToggleLeft, ToggleRight, Edit3
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'
import InstructorCard from './InstructorCard'

type Instructor = {
  id: string
  name: string
  email?: string
  phone: string
  bio?: string
  specialties: string[]
  paymentType: 'HOURLY' | 'FIXED' | 'COMMISSION' | 'MIXED'
  hourlyRate: number
  fixedSalary: number
  commissionPercent: number
  active: boolean
  totalClasses?: number
  upcomingClasses?: number
}

const paymentTypes = {
  HOURLY: 'Por hora',
  FIXED: 'Salario fijo',
  COMMISSION: 'Comisión',
  MIXED: 'Fijo + Comisión'
}

function InstructorsContent() {
  const params = useParams()
  const clubSlug = params.clubSlug as string
  const notify = useNotify()
  const [loading, setLoading] = useState(false)
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    specialties: [] as string[],
    paymentType: 'HOURLY' as 'HOURLY' | 'FIXED' | 'COMMISSION' | 'MIXED',
    hourlyRate: 0,
    fixedSalary: 0,
    commissionPercent: 0
  })
  const [newSpecialty, setNewSpecialty] = useState('')

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/instructors')
      const data = await response.json()
      
      if (data.success) {
        setInstructors(data.instructors)
      } else {
        notify.error({
          title: 'Error',
          message: 'No se pudieron cargar los instructores'
        })
      }
    } catch (error) {
      console.error('Error fetching instructors:', error)
      notify.error({
        title: 'Error',
        message: 'Error al cargar instructores'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingInstructor ? '/api/instructors' : '/api/instructors'
      const method = editingInstructor ? 'PUT' : 'POST'
      
      const body = editingInstructor 
        ? { id: editingInstructor.id, ...formData }
        : formData
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const data = await response.json()
      
      if (data.success) {
        notify.success({
          title: 'Éxito',
          message: editingInstructor 
            ? 'Instructor actualizado correctamente'
            : 'Instructor creado correctamente'
        })
        setShowForm(false)
        setEditingInstructor(null)
        resetForm()
        fetchInstructors()
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'No se pudo guardar el instructor'
        })
      }
    } catch (error) {
      console.error('Error saving instructor:', error)
      notify.error({
        title: 'Error',
        message: 'Error al guardar instructor'
      })
    }
  }

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor)
    setFormData({
      name: instructor.name,
      email: instructor.email || '',
      phone: instructor.phone,
      bio: instructor.bio || '',
      specialties: instructor.specialties || [],
      paymentType: instructor.paymentType,
      hourlyRate: instructor.hourlyRate,
      fixedSalary: instructor.fixedSalary,
      commissionPercent: instructor.commissionPercent
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este instructor?')) return
    
    try {
      const response = await fetch(`/api/instructors?id=${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        notify.success({
          title: 'Éxito',
          message: 'Instructor eliminado correctamente'
        })
        fetchInstructors()
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'No se pudo eliminar el instructor'
        })
      }
    } catch (error) {
      console.error('Error deleting instructor:', error)
      notify.error({
        title: 'Error',
        message: 'Error al eliminar instructor'
      })
    }
  }

  const handleToggleActive = async (instructor: Instructor) => {
    try {
      const response = await fetch('/api/instructors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: instructor.id,
          active: !instructor.active
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        notify.success({
          title: 'Éxito',
          message: instructor.active 
            ? 'Instructor desactivado'
            : 'Instructor activado'
        })
        fetchInstructors()
      } else {
        notify.error({
          title: 'Error',
          message: 'No se pudo actualizar el estado'
        })
      }
    } catch (error) {
      console.error('Error toggling instructor:', error)
      notify.error({
        title: 'Error',
        message: 'Error al actualizar estado'
      })
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()]
      })
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (index: number) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((_, i) => i !== index)
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      bio: '',
      specialties: [],
      paymentType: 'HOURLY',
      hourlyRate: 0,
      fixedSalary: 0,
      commissionPercent: 0
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Floating gradient button when needed */}
      {instructors.length === 0 && !loading && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => {
              setEditingInstructor(null)
              resetForm()
              setShowForm(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
              border: 'none',
              borderRadius: '12px',
              color: '#182A01',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(164, 223, 78, 0.4)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(164, 223, 78, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(164, 223, 78, 0.4)'
            }}
          >
            <Plus size={20} />
            Nuevo Instructor
          </button>
        </div>
      )}
      
      <CardModern>
        <CardModernHeader>
          <CardModernTitle>
            <Users className="h-5 w-5" />
            Gestión de Instructores
          </CardModernTitle>
          {instructors.length > 0 && (
            <ButtonModern
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingInstructor(null)
                resetForm()
                setShowForm(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Agregar Instructor
            </ButtonModern>
          )}
        </CardModernHeader>
        
        <CardModernContent>
          <div style={{ display: 'grid', gap: '20px' }}>
            {instructors.map((instructor) => (
              <InstructorCard
                key={instructor.id}
                instructor={instructor}
                paymentTypes={paymentTypes}
                formatCurrency={formatCurrency}
                handleToggleActive={handleToggleActive}
                handleEdit={handleEdit}
                handleDelete={(id) => handleDelete(id)}
              />
            ))}
            
            {instructors.length === 0 && (
              <div style={{
                padding: '60px 40px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px'
              }}>
                {/* Icon */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.1))',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}>
                  <Users size={40} style={{ color: '#A4DF4E' }} />
                </div>

                {/* Welcome Message */}
                <div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#182A01',
                    marginBottom: '12px',
                    letterSpacing: '-0.02em'
                  }}>
                    Bienvenido al módulo de Instructores
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#516640',
                    maxWidth: '500px',
                    lineHeight: '1.6',
                    margin: '0 auto'
                  }}>
                    Aquí podrás gestionar a todos los instructores de tu club, configurar sus tarifas y especialidades.
                  </p>
                </div>

                {/* Quick Guide */}
                <div style={{
                  background: 'rgba(164, 223, 78, 0.05)',
                  borderRadius: '16px',
                  padding: '24px',
                  maxWidth: '600px',
                  width: '100%',
                  textAlign: 'left'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#182A01',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    ¿Cómo empezar?
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                        color: '#182A01',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        1
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#182A01', marginBottom: '4px' }}>
                          Agrega tu primer instructor
                        </div>
                        <div style={{ fontSize: '13px', color: '#516640' }}>
                          Haz clic en el botón "Agregar Instructor" para registrar los datos básicos
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                        color: '#182A01',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        2
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#182A01', marginBottom: '4px' }}>
                          Configura el método de pago
                        </div>
                        <div style={{ fontSize: '13px', color: '#516640' }}>
                          Define si el instructor cobra por hora, salario fijo, comisión o mixto
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                        color: '#182A01',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        3
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#182A01', marginBottom: '4px' }}>
                          Asigna clases
                        </div>
                        <div style={{ fontSize: '13px', color: '#516640' }}>
                          Una vez creado, podrás asignar al instructor a las clases desde el módulo de Clases
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '20px',
                  maxWidth: '600px',
                  width: '100%',
                  marginTop: '12px'
                }}>
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid rgba(164, 223, 78, 0.2)'
                  }}>
                    <DollarSign size={24} style={{ color: '#A4DF4E', marginBottom: '8px' }} />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#182A01' }}>
                      Control de pagos
                    </div>
                    <div style={{ fontSize: '12px', color: '#516640', marginTop: '4px' }}>
                      Gestiona tarifas y comisiones
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid rgba(164, 223, 78, 0.2)'
                  }}>
                    <Award size={24} style={{ color: '#A4DF4E', marginBottom: '8px' }} />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#182A01' }}>
                      Especialidades
                    </div>
                    <div style={{ fontSize: '12px', color: '#516640', marginTop: '4px' }}>
                      Define áreas de expertise
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid rgba(164, 223, 78, 0.2)'
                  }}>
                    <UserCheck size={24} style={{ color: '#A4DF4E', marginBottom: '8px' }} />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#182A01' }}>
                      Gestión fácil
                    </div>
                    <div style={{ fontSize: '12px', color: '#516640', marginTop: '4px' }}>
                      Activa o desactiva según necesites
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <ButtonModern
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setEditingInstructor(null)
                    resetForm()
                    setShowForm(true)
                  }}
                  style={{ marginTop: '12px' }}
                >
                  <Plus size={18} />
                  Agregar mi primer instructor
                </ButtonModern>
              </div>
            )}
          </div>
        </CardModernContent>
      </CardModern>

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(164, 223, 78, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#182A01',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                {editingInstructor ? 'Editar Instructor' : 'Nuevo Instructor'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingInstructor(null)
                }}
                style={{
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  borderRadius: '12px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'
                }}
              >
                <X size={20} style={{ color: '#516640' }} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <InputModern
                  label="Nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                
                <InputModern
                  label="Teléfono"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                
                <InputModern
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#516640',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Tipo de pago
                  </label>
                  <select
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(164, 223, 78, 0.3)',
                      background: 'white',
                      fontSize: '14px',
                      color: '#182A01',
                      fontWeight: 500,
                      outline: 'none',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    value={formData.paymentType}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as any })}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#A4DF4E'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(164, 223, 78, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.3)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {Object.entries(paymentTypes).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                
                {(formData.paymentType === 'HOURLY' || formData.paymentType === 'MIXED') && (
                  <InputModern
                    label="Tarifa por hora"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="50"
                  />
                )}
                
                {(formData.paymentType === 'FIXED' || formData.paymentType === 'MIXED') && (
                  <InputModern
                    label="Salario fijo mensual"
                    type="number"
                    value={formData.fixedSalary}
                    onChange={(e) => setFormData({ ...formData, fixedSalary: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="100"
                  />
                )}
                
                {(formData.paymentType === 'COMMISSION' || formData.paymentType === 'MIXED') && (
                  <InputModern
                    label="Porcentaje de comisión"
                    type="number"
                    value={formData.commissionPercent}
                    onChange={(e) => setFormData({ ...formData, commissionPercent: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    step="5"
                  />
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#516640',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Biografía
                </label>
                <textarea
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(164, 223, 78, 0.3)',
                    background: 'white',
                    fontSize: '14px',
                    color: '#182A01',
                    fontWeight: 400,
                    outline: 'none',
                    transition: 'all 0.2s',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#A4DF4E'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(164, 223, 78, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.3)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#516640',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Especialidades
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <InputModern
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="Agregar especialidad"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSpecialty()
                      }
                    }}
                  />
                  <ButtonModern
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addSpecialty}
                  >
                    <Plus className="h-4 w-4" />
                  </ButtonModern>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {formData.specialties.map((specialty, index) => (
                    <span key={index} style={{
                      padding: '6px 12px',
                      background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#182A01',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(index)}
                        style={{
                          background: 'rgba(0, 0, 0, 0.1)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '16px',
                          height: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <X size={10} style={{ color: '#182A01' }} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#182A01',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget;
                    btn.style.transform = 'translateY(-1px)';
                    btn.style.boxShadow = '0 4px 12px rgba(164, 223, 78, 0.3)';
                    // Crear overlay sutil
                    const overlay = btn.querySelector('.hover-overlay') as HTMLElement;
                    if (overlay) {
                      overlay.style.opacity = '0.1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget;
                    btn.style.transform = 'translateY(0)';
                    btn.style.boxShadow = 'none';
                    const overlay = btn.querySelector('.hover-overlay') as HTMLElement;
                    if (overlay) {
                      overlay.style.opacity = '0';
                    }
                  }}
                >
                  <div 
                    className="hover-overlay"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.1)',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      pointerEvents: 'none'
                    }}
                  />
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {editingInstructor ? 'Actualizar' : 'Crear'} Instructor
                  </span>
                </button>
                <ButtonModern
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false)
                    setEditingInstructor(null)
                  }}
                >
                  Cancelar
                </ButtonModern>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function InstructorsPage() {
  return <InstructorsContent />
}