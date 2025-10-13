'use client'

import { useState, useEffect } from 'react'
import { CardModern, CardModernContent } from '@/components/design-system/CardModern'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { InputModern } from '@/components/design-system/InputModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { DollarSign, Percent, Clock, Save, AlertCircle } from 'lucide-react'

interface ClassPricing {
  id?: string
  individualPrice: number
  groupPrice: number
  clinicPrice: number
  instructorPaymentType: 'HOURLY' | 'PERCENTAGE' | 'FIXED'
  instructorHourlyRate: number
  instructorPercentage: number
  instructorFixedRate: number
  enableBulkDiscount: boolean
  bulkDiscountThreshold: number
  bulkDiscountPercentage: number
}

export default function ClassPricingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pricing, setPricing] = useState<ClassPricing>({
    individualPrice: 500,
    groupPrice: 300,
    clinicPrice: 200,
    instructorPaymentType: 'HOURLY',
    instructorHourlyRate: 200,
    instructorPercentage: 50,
    instructorFixedRate: 300,
    enableBulkDiscount: false,
    bulkDiscountThreshold: 10,
    bulkDiscountPercentage: 10
  })

  useEffect(() => {
    fetchPricing()
  }, [])

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/settings/class-pricing')
      const data = await response.json()
      
      if (data.success && data.pricing) {
        setPricing({
          ...data.pricing,
          individualPrice: data.pricing.individualPrice / 100,
          groupPrice: data.pricing.groupPrice / 100,
          clinicPrice: data.pricing.clinicPrice / 100,
          instructorHourlyRate: data.pricing.instructorHourlyRate / 100,
          instructorFixedRate: data.pricing.instructorFixedRate / 100
        })
      }
    } catch (error) {
      console.error('Error fetching pricing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/class-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pricing,
          individualPrice: Math.round(pricing.individualPrice * 100),
          groupPrice: Math.round(pricing.groupPrice * 100),
          clinicPrice: Math.round(pricing.clinicPrice * 100),
          instructorHourlyRate: Math.round(pricing.instructorHourlyRate * 100),
          instructorFixedRate: Math.round(pricing.instructorFixedRate * 100)
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Configuración guardada exitosamente')
      } else {
        alert(data.error || 'Error al guardar configuración')
      }
    } catch (error) {
      console.error('Error saving pricing:', error)
      alert('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  if (loading) {
    return (
      <CleanDashboardLayout>
        <div style={{ textAlign: 'center', padding: '40px', color: '#516640' }}>
          Cargando configuración...
        </div>
      </CleanDashboardLayout>
    )
  }

  return (
    <CleanDashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#182A01',
            marginBottom: '8px',
            letterSpacing: '-0.02em'
          }}>
            Configuración de Precios de Clases
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#516640'
          }}>
            Configure los precios predeterminados para cada tipo de clase y los pagos a instructores
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          {/* Class Prices */}
          <CardModern variant="glass">
            <CardModernContent>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(164, 223, 78, 0.1)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DollarSign size={20} color="#182A01" />
                </div>
                <div>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#182A01',
                    margin: 0
                  }}>
                    Precios de Clases
                  </h2>
                  <p style={{
                    fontSize: '12px',
                    color: '#516640',
                    margin: '2px 0 0 0'
                  }}>
                    Precios predeterminados por tipo
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    color: '#182A01' 
                  }}>
                    Clase Individual
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#516640',
                      fontSize: '14px'
                    }}>
                      $
                    </span>
                    <input
                      type="number"
                      value={pricing.individualPrice}
                      onChange={(e) => setPricing({ ...pricing, individualPrice: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '10px 16px 10px 28px',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)',
                        background: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    color: '#182A01' 
                  }}>
                    Clase Grupal
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#516640',
                      fontSize: '14px'
                    }}>
                      $
                    </span>
                    <input
                      type="number"
                      value={pricing.groupPrice}
                      onChange={(e) => setPricing({ ...pricing, groupPrice: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '10px 16px 10px 28px',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)',
                        background: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    color: '#182A01' 
                  }}>
                    Clínica
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#516640',
                      fontSize: '14px'
                    }}>
                      $
                    </span>
                    <input
                      type="number"
                      value={pricing.clinicPrice}
                      onChange={(e) => setPricing({ ...pricing, clinicPrice: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '10px 16px 10px 28px',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)',
                        background: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Instructor Payment */}
          <CardModern variant="glass">
            <CardModernContent>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(164, 223, 78, 0.1)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FFD93D, #FFB344)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={20} color="#182A01" />
                </div>
                <div>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#182A01',
                    margin: 0
                  }}>
                    Pago a Instructores
                  </h2>
                  <p style={{
                    fontSize: '12px',
                    color: '#516640',
                    margin: '2px 0 0 0'
                  }}>
                    Configuración de pagos
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    color: '#182A01' 
                  }}>
                    Tipo de Pago
                  </label>
                  <select
                    value={pricing.instructorPaymentType}
                    onChange={(e) => setPricing({ 
                      ...pricing, 
                      instructorPaymentType: e.target.value as 'HOURLY' | 'PERCENTAGE' | 'FIXED' 
                    })}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      background: 'white',
                      fontSize: '14px'
                    }}
                  >
                    <option value="HOURLY">Por Hora</option>
                    <option value="PERCENTAGE">Porcentaje</option>
                    <option value="FIXED">Monto Fijo</option>
                  </select>
                </div>

                {pricing.instructorPaymentType === 'HOURLY' && (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: 500, 
                      color: '#182A01' 
                    }}>
                      Tarifa por Hora
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#516640',
                        fontSize: '14px'
                      }}>
                        $
                      </span>
                      <input
                        type="number"
                        value={pricing.instructorHourlyRate}
                        onChange={(e) => setPricing({ 
                          ...pricing, 
                          instructorHourlyRate: parseFloat(e.target.value) || 0 
                        })}
                        style={{
                          width: '100%',
                          padding: '10px 16px 10px 28px',
                          borderRadius: '8px',
                          border: '1px solid rgba(164, 223, 78, 0.2)',
                          background: 'white',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                )}

                {pricing.instructorPaymentType === 'PERCENTAGE' && (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: 500, 
                      color: '#182A01' 
                    }}>
                      Porcentaje de la Clase
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={pricing.instructorPercentage}
                        onChange={(e) => setPricing({ 
                          ...pricing, 
                          instructorPercentage: parseInt(e.target.value) || 0 
                        })}
                        min="0"
                        max="100"
                        style={{
                          width: '100%',
                          padding: '10px 40px 10px 16px',
                          borderRadius: '8px',
                          border: '1px solid rgba(164, 223, 78, 0.2)',
                          background: 'white',
                          fontSize: '14px'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#516640',
                        fontSize: '14px'
                      }}>
                        %
                      </span>
                    </div>
                  </div>
                )}

                {pricing.instructorPaymentType === 'FIXED' && (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: 500, 
                      color: '#182A01' 
                    }}>
                      Monto Fijo por Clase
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#516640',
                        fontSize: '14px'
                      }}>
                        $
                      </span>
                      <input
                        type="number"
                        value={pricing.instructorFixedRate}
                        onChange={(e) => setPricing({ 
                          ...pricing, 
                          instructorFixedRate: parseFloat(e.target.value) || 0 
                        })}
                        style={{
                          width: '100%',
                          padding: '10px 16px 10px 28px',
                          borderRadius: '8px',
                          border: '1px solid rgba(164, 223, 78, 0.2)',
                          background: 'white',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 217, 61, 0.05)',
                  border: '1px solid rgba(255, 179, 68, 0.2)',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} style={{ color: '#FFB344', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '12px', color: '#516640' }}>
                    {pricing.instructorPaymentType === 'HOURLY' && 
                      'El pago se calculará basado en la duración de la clase.'}
                    {pricing.instructorPaymentType === 'PERCENTAGE' && 
                      'El instructor recibirá el porcentaje del total recaudado.'}
                    {pricing.instructorPaymentType === 'FIXED' && 
                      'El instructor recibirá el mismo monto sin importar el tipo de clase.'}
                  </div>
                </div>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Bulk Discount */}
          <CardModern variant="glass">
            <CardModernContent>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(164, 223, 78, 0.1)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #9333ea, #c084fc)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Percent size={20} color="white" />
                </div>
                <div>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#182A01',
                    margin: 0
                  }}>
                    Descuentos por Volumen
                  </h2>
                  <p style={{
                    fontSize: '12px',
                    color: '#516640',
                    margin: '2px 0 0 0'
                  }}>
                    Descuentos para paquetes de clases
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={pricing.enableBulkDiscount}
                    onChange={(e) => setPricing({ ...pricing, enableBulkDiscount: e.target.checked })}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <label style={{ fontSize: '14px', color: '#182A01' }}>
                    Habilitar descuentos por volumen
                  </label>
                </div>

                {pricing.enableBulkDiscount && (
                  <>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontSize: '14px', 
                        fontWeight: 500, 
                        color: '#182A01' 
                      }}>
                        Número de Clases Mínimo
                      </label>
                      <input
                        type="number"
                        value={pricing.bulkDiscountThreshold}
                        onChange={(e) => setPricing({ 
                          ...pricing, 
                          bulkDiscountThreshold: parseInt(e.target.value) || 0 
                        })}
                        min="1"
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: '1px solid rgba(164, 223, 78, 0.2)',
                          background: 'white',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontSize: '14px', 
                        fontWeight: 500, 
                        color: '#182A01' 
                      }}>
                        Porcentaje de Descuento
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          value={pricing.bulkDiscountPercentage}
                          onChange={(e) => setPricing({ 
                            ...pricing, 
                            bulkDiscountPercentage: parseInt(e.target.value) || 0 
                          })}
                          min="0"
                          max="100"
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(164, 223, 78, 0.2)',
                            background: 'white',
                            fontSize: '14px'
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#516640',
                          fontSize: '14px'
                        }}>
                          %
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardModernContent>
          </CardModern>
        </div>

        {/* Save Button */}
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 32px',
              background: saving 
                ? 'rgba(164, 223, 78, 0.5)' 
                : 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
              border: 'none',
              borderRadius: '12px',
              color: '#182A01',
              fontSize: '14px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(164, 223, 78, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(164, 223, 78, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(164, 223, 78, 0.3)'
            }}
          >
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </CleanDashboardLayout>
  )
}