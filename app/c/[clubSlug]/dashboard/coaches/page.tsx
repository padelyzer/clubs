'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useNotify } from '@/contexts/NotificationContext'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { 
  Users, Plus, Edit, Trash2, Phone, Mail, DollarSign, 
  Award, CheckCircle, XCircle, Loader2, X, UserCheck
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'

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
        </CardModernHeader>
        
        <CardModernContent>
          <div className="grid gap-4">
            {instructors.map((instructor) => (
              <div 
                key={instructor.id}
                className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{instructor.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        instructor.active 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {instructor.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {instructor.phone}
                      </div>
                      {instructor.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {instructor.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          {paymentTypes[instructor.paymentType]}
                          {instructor.paymentType === 'HOURLY' && ` - ${formatCurrency(instructor.hourlyRate)}/hr`}
                          {instructor.paymentType === 'FIXED' && ` - ${formatCurrency(instructor.fixedSalary)}/mes`}
                          {instructor.paymentType === 'COMMISSION' && ` - ${instructor.commissionPercent}%`}
                          {instructor.paymentType === 'MIXED' && ` - ${formatCurrency(instructor.fixedSalary)}/mes + ${instructor.commissionPercent}%`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        {instructor.totalClasses || 0} clases impartidas
                      </div>
                    </div>
                    
                    {instructor.bio && (
                      <p className="mt-2 text-sm text-gray-600">{instructor.bio}</p>
                    )}
                    
                    {instructor.specialties.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {instructor.specialties.map((specialty, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <ButtonModern
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(instructor)}
                    >
                      {instructor.active ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </ButtonModern>
                    <ButtonModern
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(instructor)}
                    >
                      <Edit className="h-4 w-4" />
                    </ButtonModern>
                    {instructor.totalClasses === 0 && (
                      <ButtonModern
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(instructor.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </ButtonModern>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {instructors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay instructores registrados
              </div>
            )}
          </div>
        </CardModernContent>
      </CardModern>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingInstructor ? 'Editar Instructor' : 'Nuevo Instructor'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingInstructor(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de pago
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.paymentType}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as any })}
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
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Biografía
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Especialidades
                </label>
                <div className="flex gap-2">
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
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(index)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4">
                <ButtonModern
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  {editingInstructor ? 'Actualizar' : 'Crear'} Instructor
                </ButtonModern>
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