'use client'

import React, { useState, useEffect } from 'react'
import { CardModern } from '@/components/design-system/CardModern'
import { 
  Plus, Search, Filter, Download, Users,
  UserCheck, Clock, DollarSign, Award,
  Eye, Edit, ChevronLeft, ChevronRight, FileText,
  TrendingUp, AlertCircle, Calendar, CheckCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { FinanceLoader } from '@/components/finance/FinanceLoader'

interface Employee {
  id: string
  name: string
  role: string
  type: 'fixed' | 'instructor'
  baseSalary: number
  status: 'active' | 'inactive'
  startDate: string
  department?: string
  classes?: number
  students?: number
}

interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  employeeRole?: string
  period: string
  baseSalary: number
  bonuses: number
  deductions: number
  netAmount: number
  status: 'paid' | 'pending' | 'approved'
  paymentDate?: string
}

export default function PayrollModuleProfessional() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'employees' | 'instructors' | 'history'>('employees')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    fetchPayrollData()
  }, [selectedPeriod])

  const fetchPayrollData = async () => {
    try {
      setLoading(true)

      if (initialLoad) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      const period = format(selectedPeriod, 'yyyy-MM')
      const response = await fetch(`/api/finance/payroll?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        
        // Map payroll records to employees and payment history
        const mappedEmployees: Employee[] = data.records?.map((r: any) => ({
          id: r.id,
          name: r.employeeName,
          role: r.employeeRole || 'Empleado',
          type: r.employeeRole?.includes('Instructor') ? 'instructor' : 'fixed',
          baseSalary: r.baseSalary || 0,
          status: 'active',
          startDate: r.createdAt || new Date().toISOString(),
          department: r.department || 'General'
        })) || []
        
        const mappedRecords: PayrollRecord[] = data.records?.map((r: any) => ({
          id: r.id,
          employeeId: r.id,
          employeeName: r.employeeName,
          period: r.period,
          baseSalary: r.baseSalary || 0,
          bonuses: r.bonuses || 0,
          deductions: r.deductions || 0,
          netAmount: r.netAmount || 0,
          status: r.status || 'pending',
          paymentDate: r.paidAt
        })) || []
        
        setEmployees(mappedEmployees)
        setPayrollRecords(mappedRecords)
      }
    } catch (error) {
      console.error('Error fetching payroll:', error)
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const period = format(selectedPeriod, 'yyyy-MM')
      const response = await fetch(`/api/finance/export?type=payroll&format=csv&period=${period}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `nomina-${period}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting payroll data:', error)
    } finally {
      setExporting(false)
    }
  }

  const fixedEmployees = employees.filter(e => e.type === 'fixed')
  const instructors = employees.filter(e => e.type === 'instructor')
  
  const totalPayroll = fixedEmployees.reduce((sum, e) => sum + e.baseSalary, 0) + 
                       instructors.reduce((sum, e) => sum + (e.baseSalary * (e.classes || 0)), 0)
  const totalEmployees = employees.length
  const activeEmployees = employees.filter(e => e.status === 'active').length
  const pendingPayments = payrollRecords.filter(r => r.status === 'pending').length

  if (loading) {
    return (
      <FinanceLoader
        title="Nómina"
        subtitle="Gestión de pagos y salarios del personal"
        selectedPeriod={selectedPeriod}
        skeletonType="table"
      />
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#182A01',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em'
        }}>
          Nómina
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#516640',
          fontWeight: 400,
          margin: 0
        }}>
          Gestión de personal y pagos de nómina
        </p>
      </div>

      {/* Métricas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#516640', fontWeight: 600 }}>Mensual</span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Nómina Total</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(totalPayroll)}
            </p>
          </div>
        </CardModern>

        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(164, 223, 78, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users style={{ width: '20px', height: '20px', color: '#A4DF4E' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#A4DF4E', fontWeight: 600 }}>
                {totalEmployees}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Total Empleados</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {activeEmployees} Activos
            </p>
          </div>
        </CardModern>

        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(147, 51, 234, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award style={{ width: '20px', height: '20px', color: '#9333EA' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#516640', fontWeight: 600 }}>
                {instructors.length}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Instructores</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {instructors.reduce((sum, i) => sum + (i.classes || 0), 0)} Clases
            </p>
          </div>
        </CardModern>

        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(251, 191, 36, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertCircle style={{ width: '20px', height: '20px', color: '#FBBF24' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#FBBF24', fontWeight: 600 }}>
                {pendingPayments}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Pagos Pendientes</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(payrollRecords.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.netAmount, 0))}
            </p>
          </div>
        </CardModern>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => setActiveTab('employees')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'employees' ? '#182A01' : '#516640',
            fontSize: '14px',
            fontWeight: activeTab === 'employees' ? 600 : 500,
            cursor: 'pointer',
            borderBottom: activeTab === 'employees' ? '2px solid #A4DF4E' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Empleados Fijos
        </button>
        <button
          onClick={() => setActiveTab('instructors')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'instructors' ? '#182A01' : '#516640',
            fontSize: '14px',
            fontWeight: activeTab === 'instructors' ? 600 : 500,
            cursor: 'pointer',
            borderBottom: activeTab === 'instructors' ? '2px solid #A4DF4E' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Instructores
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'history' ? '#182A01' : '#516640',
            fontSize: '14px',
            fontWeight: activeTab === 'history' ? 600 : 500,
            cursor: 'pointer',
            borderBottom: activeTab === 'history' ? '2px solid #A4DF4E' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Historial de Pagos
        </button>
      </div>

      {/* Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '24px'
      }}>
        {/* Main Content */}
        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#182A01'
              }}>
                {activeTab === 'employees' && 'Empleados Fijos'}
                {activeTab === 'instructors' && 'Instructores y Entrenadores'}
                {activeTab === 'history' && 'Historial de Pagos'}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    color: '#516640',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Filter style={{ width: '14px', height: '14px' }} />
                  Filtrar
                </button>
                <button
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #66E7AA 0%, #A4DF4E 100%)',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus style={{ width: '14px', height: '14px' }} />
                  {activeTab === 'history' ? 'Procesar Nómina' : 'Nuevo Empleado'}
                </button>
              </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#516640'
              }} />
              <input
                type="text"
                placeholder={
                  activeTab === 'employees' ? 'Buscar empleado por nombre o rol...' :
                  activeTab === 'instructors' ? 'Buscar instructor...' :
                  'Buscar en historial...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '10px',
                  border: '1px solid rgba(164, 223, 78, 0.2)',
                  background: 'white',
                  fontSize: '14px',
                  color: '#182A01',
                  outline: 'none'
                }}
              />
            </div>

            {/* Content based on tab */}
            {activeTab === 'employees' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {fixedEmployees.map((employee, index) => (
                  <div
                    key={employee.id}
                    style={{
                      padding: '16px 0',
                      borderBottom: index < fixedEmployees.length - 1 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.02)'
                      e.currentTarget.style.paddingLeft = '20px'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.paddingLeft = '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <UserCheck style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
                        </div>
                        <div>
                          <p style={{ 
                            fontSize: '14px', 
                            fontWeight: 600, 
                            color: '#182A01',
                            marginBottom: '4px'
                          }}>
                            {employee.name}
                          </p>
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#516640' 
                          }}>
                            {employee.role} • {employee.department} • Desde {format(new Date(employee.startDate), 'MMM yyyy', { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#182A01'
                          }}>
                            {formatCurrency(employee.baseSalary)}
                          </p>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: 'rgba(164, 223, 78, 0.1)',
                            color: '#A4DF4E'
                          }}>
                            Activo
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                              e.currentTarget.style.transform = 'scale(1.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                          >
                            <Eye style={{ width: '16px', height: '16px', color: '#516640' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'instructors' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {instructors.map((instructor, index) => (
                  <div
                    key={instructor.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(164, 223, 78, 0.15)',
                      background: 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.15)'
                      e.currentTarget.style.transform = 'translateX(0)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(147, 51, 234, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Award style={{ width: '20px', height: '20px', color: '#9333EA' }} />
                        </div>
                        <div>
                          <p style={{ 
                            fontSize: '14px', 
                            fontWeight: 600, 
                            color: '#182A01',
                            marginBottom: '4px'
                          }}>
                            {instructor.name}
                          </p>
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#516640' 
                          }}>
                            {instructor.role} • {instructor.classes} clases • {instructor.students} alumnos
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#9333EA'
                        }}>
                          {formatCurrency((instructor.baseSalary * (instructor.classes || 0)))}
                        </p>
                        <p style={{ fontSize: '11px', color: '#516640' }}>
                          ${instructor.baseSalary}/clase
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {payrollRecords.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '48px 24px',
                    color: '#516640' 
                  }}>
                    <Clock style={{ width: '48px', height: '48px', color: '#A4DF4E', marginBottom: '16px' }} />
                    <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
                      No hay historial de pagos
                    </p>
                    <p style={{ fontSize: '14px' }}>
                      Los registros de nómina aparecerán aquí una vez que proceses los pagos.
                    </p>
                  </div>
                ) : (
                  payrollRecords.map((record, index) => (
                    <div
                      key={record.id}
                      style={{
                        padding: '16px 0',
                        borderBottom: index < payrollRecords.length - 1 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(164, 223, 78, 0.02)'
                        e.currentTarget.style.paddingLeft = '20px'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.paddingLeft = '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: record.status === 'pending' 
                              ? 'rgba(251, 191, 36, 0.1)' 
                              : record.status === 'paid'
                                ? 'rgba(164, 223, 78, 0.1)'
                                : 'rgba(156, 163, 175, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <CheckCircle style={{ 
                              width: '20px', 
                              height: '20px', 
                              color: record.status === 'pending' 
                                ? '#FBBF24' 
                                : record.status === 'paid'
                                  ? '#A4DF4E'
                                  : '#6B7280'
                            }} />
                          </div>
                          <div>
                            <p style={{ 
                              fontSize: '14px', 
                              fontWeight: 600, 
                              color: '#182A01',
                              marginBottom: '4px'
                            }}>
                              {record.employeeName} - {record.period}
                            </p>
                            <p style={{ 
                              fontSize: '12px', 
                              color: '#516640' 
                            }}>
                              {record.paymentDate 
                                ? `Pagado el ${format(new Date(record.paymentDate), 'dd MMM yyyy', { locale: es })}` 
                                : 'Pago pendiente'
                              }
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#182A01'
                            }}>
                              {formatCurrency(record.netAmount)}
                            </p>
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: record.status === 'pending' 
                                ? 'rgba(251, 191, 36, 0.1)' 
                                : record.status === 'paid'
                                  ? 'rgba(164, 223, 78, 0.1)'
                                  : 'rgba(156, 163, 175, 0.1)',
                              color: record.status === 'pending' 
                                ? '#FBBF24' 
                                : record.status === 'paid'
                                  ? '#A4DF4E'
                                  : '#6B7280'
                            }}>
                              {record.status === 'pending' ? 'Pendiente' : 
                               record.status === 'paid' ? 'Pagado' : 
                               'Cancelado'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent'
                              }}
                            >
                              <FileText style={{ width: '16px', height: '16px', color: '#516640' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </CardModern>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Period Selector */}
          <CardModern variant="glass">
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#182A01'
                }}>
                  {format(selectedPeriod, 'MMMM yyyy', { locale: es })}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedPeriod)
                      newDate.setMonth(newDate.getMonth() - 1)
                      setSelectedPeriod(newDate)
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ChevronLeft style={{ width: '16px', height: '16px', color: '#516640' }} />
                  </button>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedPeriod)
                      newDate.setMonth(newDate.getMonth() + 1)
                      setSelectedPeriod(newDate)
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ChevronRight style={{ width: '16px', height: '16px', color: '#516640' }} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#516640' }}>Empleados ({fixedEmployees.length})</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#3B82F6' }}>
                    {formatCurrency(payrollRecords.filter(r => !r.employeeRole?.includes('Instructor')).reduce((sum, r) => sum + r.netAmount, 0))}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#516640' }}>Instructores ({instructors.length})</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#9333EA' }}>
                    {formatCurrency(payrollRecords.filter(r => r.employeeRole?.includes('Instructor')).reduce((sum, r) => sum + r.netAmount, 0))}
                  </span>
                </div>
                <div style={{
                  borderTop: '1px solid rgba(164, 223, 78, 0.1)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>Total</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#182A01' }}>
                    {formatCurrency(payrollRecords.reduce((sum, r) => sum + r.netAmount, 0))}
                  </span>
                </div>
              </div>
            </div>
          </CardModern>

          {/* Quick Actions */}
          <CardModern variant="glass">
            <div style={{ padding: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#182A01',
                marginBottom: '16px'
              }}>
                Acciones Rápidas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  Procesar Nómina
                </button>
                <button
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <FileText style={{ width: '16px', height: '16px' }} />
                  Generar Recibos
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: exporting ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    opacity: exporting ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!exporting) e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  {exporting ? 'Exportando...' : 'Exportar'}
                </button>
              </div>
            </div>
          </CardModern>

          {/* Resumen de Departamentos */}
          <CardModern variant="glass">
            <div style={{ padding: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#182A01',
                marginBottom: '16px'
              }}>
                Por Departamento
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(() => {
                  interface DepartmentStats {
                    name: string
                    employees: number
                    amount: number
                    color: string
                  }

                  const departments = payrollRecords.reduce((acc, record) => {
                    const dept = record.employeeRole?.includes('Instructor') ? 'Instructores' : 'Empleados'
                    if (!acc[dept]) {
                      acc[dept] = {
                        name: dept,
                        employees: 0,
                        amount: 0,
                        color: dept === 'Instructores' ? '#9333EA' : '#3B82F6'
                      }
                    }
                    acc[dept].employees += 1
                    acc[dept].amount += record.netAmount
                    return acc
                  }, {} as Record<string, DepartmentStats>)

                  const totalAmount = Object.values(departments).reduce((sum, dept) => sum + dept.amount, 0)

                  return Object.values(departments).map((dept, index) => (
                    <div key={index}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontSize: '13px', color: '#182A01', fontWeight: 600 }}>{dept.name}</span>
                          <span style={{ fontSize: '11px', color: '#516640', marginLeft: '8px' }}>
                            ({dept.employees} empleados)
                          </span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#182A01' }}>
                          {formatCurrency(dept.amount)}
                        </span>
                      </div>
                      <div style={{
                        height: '6px',
                        background: 'rgba(164, 223, 78, 0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: totalAmount > 0 ? `${(dept.amount / totalAmount) * 100}%` : '0%',
                          height: '100%',
                          background: dept.color,
                          borderRadius: '3px',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  ))
                })()}
                {payrollRecords.length === 0 && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '20px',
                    color: '#516640',
                    fontSize: '14px' 
                  }}>
                    No hay datos de nómina para mostrar
                  </div>
                )}
              </div>
            </div>
          </CardModern>
        </div>
      </div>
    </div>
  )
}