'use client'

import { useState, useEffect } from 'react'

// Datos de prueba directos
const TEST_DATA = [
  {
    id: '1',
    employeeName: 'Carlos Rodríguez',
    employeeRole: 'Instructor de Pádel',
    baseSalary: 1500000,
    bonuses: 300000,
    deductions: 150000,
    netAmount: 1650000,
    period: '2025-09',
    status: 'paid'
  },
  {
    id: '2',
    employeeName: 'María González',
    employeeRole: 'Recepcionista',
    baseSalary: 1200000,
    bonuses: 100000,
    deductions: 100000,
    netAmount: 1200000,
    period: '2025-09',
    status: 'paid'
  },
  {
    id: '3',
    employeeName: 'Ana Martínez',
    employeeRole: 'Gerente',
    baseSalary: 2500000,
    bonuses: 500000,
    deductions: 300000,
    netAmount: 2700000,
    period: '2025-09',
    status: 'pending'
  },
  {
    id: '4',
    employeeName: 'Pedro Sánchez',
    employeeRole: 'Mantenimiento',
    baseSalary: 900000,
    bonuses: 50000,
    deductions: 80000,
    netAmount: 870000,
    period: '2025-09',
    status: 'paid'
  },
  {
    id: '5',
    employeeName: 'Laura Jiménez',
    employeeRole: 'Coordinadora',
    baseSalary: 1800000,
    bonuses: 200000,
    deductions: 160000,
    netAmount: 1840000,
    period: '2025-09',
    status: 'paid'
  }
]

export default function TestPayrollPage() {
  const [mounted, setMounted] = useState(false)
  const [apiData, setApiData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showApi, setShowApi] = useState(false)

  useEffect(() => {
    console.log('🔴🔴🔴 TEST PAYROLL PAGE MOUNTED 🔴🔴🔴')
    setMounted(true)

    // Log para debug
    console.log('Window location:', window.location.href)
    console.log('Test data loaded:', TEST_DATA.length, 'records')

    return () => {
      console.log('🔴🔴🔴 TEST PAYROLL PAGE UNMOUNTING 🔴🔴🔴')
    }
  }, [])

  const fetchApiData = async () => {
    console.log('📡 Fetching API data...')
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/finance/payroll?period=2025-09')
      console.log('API Response status:', response.status)

      const data = await response.json()
      console.log('API Data:', data)

      if (data.success && data.payroll) {
        setApiData(data.payroll)
        console.log('✅ API data loaded:', data.payroll.length, 'records')
      } else {
        setError('No se pudieron cargar los datos de la API')
        console.error('❌ API error:', data.error)
      }
    } catch (err) {
      console.error('❌ Fetch error:', err)
      setError('Error al conectar con la API')
    } finally {
      setLoading(false)
    }
  }

  const dataToShow = showApi ? apiData : TEST_DATA
  const totalNomina = dataToShow.reduce((sum, r) => sum + r.netAmount, 0)

  if (!mounted) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>Cargando...</h1>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Banner Principal */}
      <div style={{
        background: '#FFD700',
        color: '#000',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>
          🚨 PÁGINA DE PRUEBA DE NÓMINA 🚨
        </h1>
        <p style={{ fontSize: '20px' }}>
          Esta es una página independiente para verificar que los datos se muestran correctamente
        </p>
        <p style={{ fontSize: '16px', marginTop: '10px', fontFamily: 'monospace' }}>
          URL: /test-payroll (sin autenticación)
        </p>
      </div>

      {/* Controles */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ marginBottom: '15px' }}>Controles de Datos</h2>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setShowApi(false)}
            style={{
              padding: '10px 20px',
              background: !showApi ? '#4CAF50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            📦 Datos Mock ({TEST_DATA.length} registros)
          </button>

          <button
            onClick={() => {
              setShowApi(true)
              if (apiData.length === 0) fetchApiData()
            }}
            style={{
              padding: '10px 20px',
              background: showApi ? '#2196F3' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🌐 Datos API ({apiData.length} registros)
          </button>

          {showApi && (
            <button
              onClick={fetchApiData}
              style={{
                padding: '10px 20px',
                background: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🔄 Recargar API
            </button>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: '#ffebee',
            color: '#c62828',
            borderRadius: '5px'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Resumen */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ marginBottom: '15px', color: '#333' }}>
          📊 Resumen de Nómina - Septiembre 2025
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{
            padding: '15px',
            background: '#e3f2fd',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>👥</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Total Empleados</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
              {dataToShow.length}
            </div>
          </div>

          <div style={{
            padding: '15px',
            background: '#e8f5e9',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>💰</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Total Nómina</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
              ${(totalNomina / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{
            padding: '15px',
            background: '#fff3e0',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>📅</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Periodo</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
              Sep 2025
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Datos */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>
          📋 Detalle de Empleados {showApi ? '(API)' : '(Mock)'}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '24px' }}>⏳</div>
            <p>Cargando datos...</p>
          </div>
        ) : dataToShow.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
            <p style={{ fontSize: '18px', color: '#666' }}>
              No hay datos de nómina disponibles
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #ddd',
                    color: '#333',
                    fontWeight: '600'
                  }}>
                    Empleado
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #ddd',
                    color: '#333',
                    fontWeight: '600'
                  }}>
                    Rol
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'right',
                    borderBottom: '2px solid #ddd',
                    color: '#333',
                    fontWeight: '600'
                  }}>
                    Salario Base
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'right',
                    borderBottom: '2px solid #ddd',
                    color: '#333',
                    fontWeight: '600'
                  }}>
                    Bonos
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'right',
                    borderBottom: '2px solid #ddd',
                    color: '#333',
                    fontWeight: '600'
                  }}>
                    Deducciones
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'right',
                    borderBottom: '2px solid #ddd',
                    color: '#333',
                    fontWeight: '600'
                  }}>
                    Neto a Pagar
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    borderBottom: '2px solid #ddd',
                    color: '#333',
                    fontWeight: '600'
                  }}>
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {dataToShow.map((record, index) => (
                  <tr key={record.id || index} style={{
                    borderBottom: '1px solid #eee',
                    background: index % 2 === 0 ? 'white' : '#fafafa'
                  }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>
                      {record.employeeName}
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>
                      {record.employeeRole}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      ${(record.baseSalary / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#4CAF50' }}>
                      +${(record.bonuses / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#f44336' }}>
                      -${(record.deductions / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#1976d2'
                    }}>
                      ${(record.netAmount / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: record.status === 'paid' ? '#e8f5e9' : '#fff3e0',
                        color: record.status === 'paid' ? '#2e7d32' : '#f57c00'
                      }}>
                        {record.status === 'paid' ? '✅ Pagado' : '⏳ Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#e3f2fd' }}>
                  <td colSpan={2} style={{
                    padding: '15px',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    TOTAL
                  </td>
                  <td style={{
                    padding: '15px',
                    textAlign: 'right',
                    fontWeight: 'bold'
                  }}>
                    ${(dataToShow.reduce((sum, r) => sum + r.baseSalary, 0) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{
                    padding: '15px',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: '#4CAF50'
                  }}>
                    ${(dataToShow.reduce((sum, r) => sum + r.bonuses, 0) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{
                    padding: '15px',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: '#f44336'
                  }}>
                    ${(dataToShow.reduce((sum, r) => sum + r.deductions, 0) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{
                    padding: '15px',
                    textAlign: 'right',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1976d2'
                  }}>
                    ${(totalNomina / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Info de Debug */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '10px',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        <h3 style={{ marginBottom: '10px' }}>🔍 Información de Debug</h3>
        <p>✅ Página montada: {mounted ? 'Sí' : 'No'}</p>
        <p>📊 Registros mostrados: {dataToShow.length}</p>
        <p>💾 Fuente de datos: {showApi ? 'API' : 'Mock (Hardcoded)'}</p>
        <p>🌐 URL actual: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
        <p>⏰ Timestamp: {new Date().toLocaleString('es-MX')}</p>
        <p style={{ marginTop: '10px', color: '#666' }}>
          💡 Tip: Abre la consola (F12) para ver los logs de debug
        </p>
      </div>
    </div>
  )
}