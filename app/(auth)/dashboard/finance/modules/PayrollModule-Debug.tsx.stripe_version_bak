'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Log inmediato al cargar el módulo
console.log('🔴 [PAYROLL DEBUG] Module file loaded!')

export default function PayrollModuleDebug() {
  console.log('🔴 [PAYROLL DEBUG] Component rendering!')
  const [loading, setLoading] = useState(false)
  const [payrollData, setPayrollData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod] = useState(new Date())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const period = format(selectedPeriod, 'yyyy-MM')
      console.log('🔍 [DEBUG] Fetching for period:', period)
      
      const response = await fetch(`/api/finance/payroll?period=${period}`)
      console.log('🔍 [DEBUG] Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      console.log('🔍 [DEBUG] Data received:', data)
      
      if (data.success && data.payroll) {
        setPayrollData(data.payroll)
      } else {
        setError('No data received')
      }
    } catch (err: any) {
      console.error('🔍 [DEBUG] Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
      <h2>Debug Payroll Module</h2>
      <p>Period: {format(selectedPeriod, 'MMMM yyyy', { locale: es })}</p>
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <div style={{ marginTop: '20px' }}>
        <h3>Raw Data ({payrollData.length} records):</h3>
        {payrollData.length > 0 ? (
          <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
            {payrollData.map((record, i) => (
              <div key={i} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                <strong>{i + 1}. {record.employeeName}</strong>
                <div>Role: {record.employeeRole}</div>
                <div>Period: {record.period}</div>
                <div>Base Salary: ${record.baseSalary / 100}</div>
                <div>Net Amount: ${record.netAmount / 100}</div>
                <div>Status: {record.status}</div>
              </div>
            ))}
          </div>
        ) : (
          <p>No data to display</p>
        )}
      </div>
      
      <button 
        onClick={fetchData}
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          background: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Refresh Data
      </button>
    </div>
  )
}