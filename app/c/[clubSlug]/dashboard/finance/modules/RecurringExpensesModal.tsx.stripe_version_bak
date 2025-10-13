'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, Repeat, Trash2, Plus, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface RecurringExpense {
  id: string
  category: string
  description: string
  amount: number
  vendor?: string
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  dayOfMonth?: number
  dayOfWeek?: number
  nextDue: string
  isActive: boolean
  lastGenerated?: string
}

interface RecurringExpensesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RecurringExpensesModal({ isOpen, onClose }: RecurringExpensesModalProps) {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRecurring, setNewRecurring] = useState({
    category: 'UTILITIES',
    description: '',
    amount: '',
    vendor: '',
    frequency: 'MONTHLY',
    dayOfMonth: '1',
    startDate: format(new Date(), 'yyyy-MM-dd')
  })

  useEffect(() => {
    if (isOpen) {
      fetchRecurringExpenses()
    }
  }, [isOpen])

  const fetchRecurringExpenses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/finance/recurring-expenses')
      if (response.ok) {
        const data = await response.json()
        setRecurringExpenses(data.recurringExpenses || [])
      }
    } catch (error) {
      console.error('Error fetching recurring expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRecurring = async () => {
    try {
      // Validate required fields
      if (!newRecurring.description || !newRecurring.amount) {
        alert('Por favor completa todos los campos requeridos')
        return
      }

      const amountInCents = Math.round(parseFloat(newRecurring.amount) * 100)
      
      if (isNaN(amountInCents) || amountInCents <= 0) {
        alert('Por favor ingresa un monto válido')
        return
      }

      const requestData = {
        category: newRecurring.category,
        description: newRecurring.description,
        amount: amountInCents,
        vendor: newRecurring.vendor || undefined,
        frequency: newRecurring.frequency,
        dayOfMonth: newRecurring.frequency === 'MONTHLY' ? parseInt(newRecurring.dayOfMonth) : undefined,
        startDate: newRecurring.startDate
      }

      console.log('Creating recurring expense with data:', requestData)

      const response = await fetch('/api/finance/recurring-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()
      console.log('Response from server:', data)

      if (response.ok && data.success) {
        console.log('Recurring expense created successfully')
        await fetchRecurringExpenses()
        setShowCreateForm(false)
        setNewRecurring({
          category: 'UTILITIES',
          description: '',
          amount: '',
          vendor: '',
          frequency: 'MONTHLY',
          dayOfMonth: '1',
          startDate: format(new Date(), 'yyyy-MM-dd')
        })
        alert('Gasto recurrente creado exitosamente')
      } else {
        console.error('Error response:', data)
        if (data.details) {
          console.error('Validation errors:', data.details)
        }
        alert(data.error || 'Error al crear el gasto recurrente')
      }
    } catch (error) {
      console.error('Error creating recurring expense:', error)
      alert('Error al conectar con el servidor')
    }
  }

  const handleDeleteRecurring = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar este gasto recurrente?')) return
    
    try {
      const response = await fetch(`/api/finance/recurring-expenses?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchRecurringExpenses()
      }
    } catch (error) {
      console.error('Error deleting recurring expense:', error)
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels: {[key: string]: string} = {
      'WEEKLY': 'Semanal',
      'BIWEEKLY': 'Quincenal',
      'MONTHLY': 'Mensual',
      'QUARTERLY': 'Trimestral',
      'YEARLY': 'Anual'
    }
    return labels[frequency] || frequency
  }

  const getCategoryLabel = (category: string) => {
    const labels: {[key: string]: string} = {
      'RENT': 'Renta',
      'UTILITIES': 'Servicios',
      'MAINTENANCE': 'Mantenimiento',
      'EQUIPMENT': 'Equipamiento',
      'SALARY': 'Nómina',
      'MARKETING': 'Marketing',
      'OTHER': 'Otros'
    }
    return labels[category] || category
  }

  if (!isOpen) return null

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
        width: '900px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(164, 223, 78, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              color: '#182A01'
            }}>
              Gastos Recurrentes
            </h2>
            <p style={{
              margin: '4px 0 0',
              fontSize: '14px',
              color: '#516640'
            }}>
              Administra los gastos que se repiten periódicamente
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X style={{ width: '20px', height: '20px', color: '#516640' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {/* Add Button */}
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #A4DF4E, #94D034)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '24px',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus style={{ width: '18px', height: '18px' }} />
              Agregar Gasto Recurrente
            </button>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(148, 208, 52, 0.05))',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid rgba(164, 223, 78, 0.2)'
            }}>
              <h3 style={{
                margin: '0 0 20px',
                fontSize: '16px',
                fontWeight: 600,
                color: '#182A01'
              }}>
                Nuevo Gasto Recurrente
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#516640'
                  }}>
                    Categoría
                  </label>
                  <select
                    value={newRecurring.category}
                    onChange={(e) => setNewRecurring({ ...newRecurring, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  >
                    <option value="RENT">Renta</option>
                    <option value="UTILITIES">Servicios</option>
                    <option value="MAINTENANCE">Mantenimiento</option>
                    <option value="EQUIPMENT">Equipamiento</option>
                    <option value="SALARY">Nómina</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="OTHER">Otros</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#516640'
                  }}>
                    Frecuencia
                  </label>
                  <select
                    value={newRecurring.frequency}
                    onChange={(e) => setNewRecurring({ ...newRecurring, frequency: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  >
                    <option value="WEEKLY">Semanal</option>
                    <option value="BIWEEKLY">Quincenal</option>
                    <option value="MONTHLY">Mensual</option>
                    <option value="QUARTERLY">Trimestral</option>
                    <option value="YEARLY">Anual</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#516640'
                  }}>
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={newRecurring.description}
                    onChange={(e) => setNewRecurring({ ...newRecurring, description: e.target.value })}
                    placeholder="Ej: Renta del local"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#516640'
                  }}>
                    Monto
                  </label>
                  <input
                    type="number"
                    value={newRecurring.amount}
                    onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#516640'
                  }}>
                    Proveedor (opcional)
                  </label>
                  <input
                    type="text"
                    value={newRecurring.vendor}
                    onChange={(e) => setNewRecurring({ ...newRecurring, vendor: e.target.value })}
                    placeholder="Nombre del proveedor"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#516640'
                  }}>
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    value={newRecurring.startDate}
                    onChange={(e) => setNewRecurring({ ...newRecurring, startDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {newRecurring.frequency === 'MONTHLY' && (
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#516640'
                    }}>
                      Día del mes
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={newRecurring.dayOfMonth}
                      onChange={(e) => setNewRecurring({ ...newRecurring, dayOfMonth: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid rgba(164, 223, 78, 0.2)',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewRecurring({
                      category: 'UTILITIES',
                      description: '',
                      amount: '',
                      vendor: '',
                      frequency: 'MONTHLY',
                      dayOfMonth: '1',
                      startDate: format(new Date(), 'yyyy-MM-dd')
                    })
                  }}
                  style={{
                    padding: '10px 20px',
                    background: 'white',
                    color: '#516640',
                    border: '1px solid rgba(164, 223, 78, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateRecurring}
                  disabled={!newRecurring.description || !newRecurring.amount}
                  style={{
                    padding: '10px 20px',
                    background: !newRecurring.description || !newRecurring.amount 
                      ? '#E5E7EB' 
                      : 'linear-gradient(135deg, #A4DF4E, #94D034)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: !newRecurring.description || !newRecurring.amount ? 'not-allowed' : 'pointer'
                  }}
                >
                  Crear Gasto Recurrente
                </button>
              </div>
            </div>
          )}

          {/* Recurring Expenses List */}
          {loading ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#94A3B8'
            }}>
              Cargando gastos recurrentes...
            </div>
          ) : recurringExpenses.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(148, 208, 52, 0.05))',
              borderRadius: '12px',
              border: '1px dashed rgba(164, 223, 78, 0.3)'
            }}>
              <AlertCircle style={{
                width: '48px',
                height: '48px',
                color: '#A4DF4E',
                margin: '0 auto 16px'
              }} />
              <p style={{
                fontSize: '16px',
                color: '#516640',
                margin: '0 0 8px'
              }}>
                No hay gastos recurrentes configurados
              </p>
              <p style={{
                fontSize: '14px',
                color: '#94A3B8',
                margin: 0
              }}>
                Agrega tu primer gasto recurrente para automatizar tus finanzas
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recurringExpenses.map((expense) => (
                <div
                  key={expense.id}
                  style={{
                    background: 'white',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.4)'
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.2)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(148, 208, 52, 0.1))',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#516640'
                      }}>
                        {getCategoryLabel(expense.category)}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#3B82F6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Repeat style={{ width: '12px', height: '12px' }} />
                        {getFrequencyLabel(expense.frequency)}
                      </span>
                    </div>
                    <h4 style={{
                      margin: '0 0 4px',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#182A01'
                    }}>
                      {expense.description}
                    </h4>
                    {expense.vendor && (
                      <p style={{
                        margin: '0 0 8px',
                        fontSize: '13px',
                        color: '#94A3B8'
                      }}>
                        Proveedor: {expense.vendor}
                      </p>
                    )}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '13px',
                      color: '#516640'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar style={{ width: '14px', height: '14px' }} />
                        Próximo: {format(new Date(expense.nextDue), 'dd MMM yyyy', { locale: es })}
                      </span>
                      {expense.lastGenerated && (
                        <span style={{ color: '#94A3B8' }}>
                          Último: {format(new Date(expense.lastGenerated), 'dd MMM', { locale: es })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#182A01'
                    }}>
                      {formatCurrency(expense.amount / 100)}
                    </span>
                    <button
                      onClick={() => handleDeleteRecurring(expense.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        color: '#EF4444',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}