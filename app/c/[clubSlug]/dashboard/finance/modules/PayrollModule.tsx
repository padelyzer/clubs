'use client'

import React, { useState, useEffect } from 'react'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { 
  Users, UserCheck, Clock, DollarSign,
  Calendar, Plus, Edit, Eye, Check,
  AlertCircle, FileText, TrendingUp, Award, ChevronLeft
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface Employee {
  id: string
  name: string
  role: string
  baseSalary: number
  type: 'fixed' | 'instructor'
}

interface PayrollRecord {
  id: string
  employeeName: string
  employeeRole: string
  period: string
  baseSalary: number
  bonuses: number
  deductions: number
  netAmount: number
  status: 'pending' | 'paid' | 'cancelled'
  paidAt?: string
  notes?: string
}

interface InstructorPayroll {
  id: string
  instructorName: string
  period: string
  totalClasses: number
  totalHours: number
  totalStudents: number
  ratePerClass: number
  grossAmount: number
  netAmount: number
  status: 'pending' | 'paid'
}

type PayrollTab = 'employees' | 'instructors' | 'history'

interface PayrollModuleProps {
  activeTab?: string
}

export default function PayrollModule({ activeTab: initialTab }: PayrollModuleProps) {
  const getTabFromProp = (tab?: string) => {
    if (tab === 'payroll-employees') return 'employees'
    if (tab === 'payroll-instructors') return 'instructors'
    if (tab === 'payroll-history') return 'history'
    return 'employees'
  }
  
  const [activeTab, setActiveTab] = useState<PayrollTab>(
    getTabFromProp(initialTab)
  )
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [instructorPayrolls, setInstructorPayrolls] = useState<InstructorPayroll[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(format(new Date(), 'yyyy-MM'))
  const [showPayrollModal, setShowPayrollModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  
  // Summary data
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalInstructors: 0,
    pendingPayments: 0,
    monthlyPayroll: 0,
    ytdPayroll: 0
  })

  // Sample employee data
  const [fixedEmployees] = useState<Employee[]>([
    { id: '1', name: 'Juan Pérez', role: 'Gerente', baseSalary: 3500000, type: 'fixed' },
    { id: '2', name: 'María García', role: 'Recepcionista', baseSalary: 1800000, type: 'fixed' },
    { id: '3', name: 'Carlos López', role: 'Mantenimiento', baseSalary: 1500000, type: 'fixed' },
    { id: '4', name: 'Ana Martínez', role: 'Limpieza', baseSalary: 1200000, type: 'fixed' }
  ])

  const [instructors] = useState<Employee[]>([
    { id: '5', name: 'Roberto Silva', role: 'Instructor Padel', baseSalary: 25000, type: 'instructor' },
    { id: '6', name: 'Laura Rodríguez', role: 'Instructor Tenis', baseSalary: 30000, type: 'instructor' },
    { id: '7', name: 'Diego Fernández', role: 'Instructor Fitness', baseSalary: 20000, type: 'instructor' }
  ])

  // New payroll form
  const [newPayroll, setNewPayroll] = useState({
    employeeName: '',
    employeeRole: '',
    baseSalary: '',
    bonuses: '',
    deductions: '',
    notes: ''
  })

  useEffect(() => {
    loadPayrollData()
  }, [selectedPeriod])

  const loadPayrollData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/finance/payroll?period=${selectedPeriod}`)
      const data = await response.json()

      if (data.success) {
        setPayrollRecords(data.payroll)
        setSummary(prev => ({
          ...prev,
          totalEmployees: fixedEmployees.length,
          totalInstructors: instructors.length,
          pendingPayments: data.payroll.filter((p: PayrollRecord) => p.status === 'pending').length,
          monthlyPayroll: data.summary.totalNetAmount
        }))
      }
    } catch (error) {
      console.error('Error loading payroll data:', error)
      toast.error('Error al cargar datos de nómina')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayroll = async () => {
    try {
      // Process payroll for all fixed employees
      const payrollPromises = fixedEmployees.map(employee => 
        fetch('/api/finance/payroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeName: employee.name,
            employeeRole: employee.role,
            period: selectedPeriod,
            baseSalary: employee.baseSalary,
            bonuses: 0,
            deductions: 0,
            notes: 'Nómina mensual'
          })
        })
      )

      await Promise.all(payrollPromises)
      toast.success('Nómina procesada exitosamente')
      loadPayrollData()
    } catch (error) {
      console.error('Error processing payroll:', error)
      toast.error('Error al procesar nómina')
    }
  }

  const handlePayPayroll = async (payrollId: string) => {
    try {
      const response = await fetch('/api/finance/payroll', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: payrollId,
          status: 'paid',
          paidAt: new Date().toISOString()
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Pago registrado exitosamente')
        loadPayrollData()
      } else {
        toast.error(data.error || 'Error al registrar pago')
      }
    } catch (error) {
      console.error('Error paying payroll:', error)
      toast.error('Error al registrar pago')
    }
  }

  const calculateInstructorPayroll = (instructor: Employee) => {
    // Mock calculation - in real app would fetch from class data
    const classesThisMonth = Math.floor(Math.random() * 20) + 10
    const studentsPerClass = Math.floor(Math.random() * 8) + 4
    const totalAmount = instructor.baseSalary * classesThisMonth
    
    return {
      classes: classesThisMonth,
      students: classesThisMonth * studentsPerClass,
      hours: classesThisMonth * 2,
      amount: totalAmount
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'paid': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'paid': return 'Pagado'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Empleados</p>
                <p className="text-2xl font-bold">{summary.totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Instructores</p>
                <p className="text-2xl font-bold">{summary.totalInstructors}</p>
              </div>
              <Award className="w-8 h-8 text-purple-200" />
            </div>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nómina Mensual</p>
                <p className="text-xl font-bold">
                  {formatCurrency(summary.monthlyPayroll / 100)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </CardModernContent>
        </CardModern>

        <CardModern className="border-yellow-200 bg-yellow-50">
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Por Pagar</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {summary.pendingPayments}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Acumulado Año</p>
                <p className="text-lg font-bold">
                  {formatCurrency(summary.ytdPayroll / 100)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-200" />
            </div>
          </CardModernContent>
        </CardModern>
      </div>

      {/* Period Selector and Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Periodo:</label>
          <InputModern
            type="month"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-48"
          />
        </div>
        <ButtonModern onClick={handleProcessPayroll}>
          <Clock className="w-4 h-4 mr-2" />
          Procesar Nómina Mensual
        </ButtonModern>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <ButtonModern
          variant={activeTab === 'employees' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('employees')}
          className="flex-1"
        >
          Empleados Fijos
        </ButtonModern>
        <ButtonModern
          variant={activeTab === 'instructors' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('instructors')}
          className="flex-1"
        >
          Instructores
        </ButtonModern>
        <ButtonModern
          variant={activeTab === 'history' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('history')}
          className="flex-1"
        >
          Historial de Pagos
        </ButtonModern>
      </div>

      {/* Tab Content */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee List */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>Empleados Fijos</CardModernTitle>
              <ButtonModern size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </ButtonModern>
            </CardModernHeader>
            <CardModernContent>
              <div className="space-y-3">
                {fixedEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(employee.baseSalary / 100)}</p>
                      <p className="text-xs text-gray-500">Salario base</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="font-medium">Total Nómina Fija</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(fixedEmployees.reduce((sum, emp) => sum + emp.baseSalary, 0) / 100)}
                  </span>
                </div>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Current Period Payroll */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>Nómina {format(new Date(selectedPeriod), 'MMMM yyyy', { locale: es })}</CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div className="space-y-3">
                {payrollRecords
                  .filter(p => p.employeeRole !== 'Instructor')
                  .map((payroll) => (
                  <div key={payroll.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{payroll.employeeName}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">Base: {formatCurrency(payroll.baseSalary / 100)}</span>
                        {payroll.bonuses > 0 && (
                          <span className="text-xs text-green-600">+Bonos: {formatCurrency(payroll.bonuses / 100)}</span>
                        )}
                        {payroll.deductions > 0 && (
                          <span className="text-xs text-red-600">-Deducción: {formatCurrency(payroll.deductions / 100)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(payroll.netAmount / 100)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payroll.status)}`}>
                          {getStatusText(payroll.status)}
                        </span>
                      </div>
                      {payroll.status === 'pending' && (
                        <ButtonModern
                          size="sm"
                          onClick={() => handlePayPayroll(payroll.id)}
                        >
                          Pagar
                        </ButtonModern>
                      )}
                    </div>
                  </div>
                ))}
                
                {payrollRecords.filter(p => p.employeeRole !== 'Instructor').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay nómina procesada para este periodo</p>
                    <ButtonModern
                      className="mt-4"
                      onClick={handleProcessPayroll}
                    >
                      Procesar Nómina
                    </ButtonModern>
                  </div>
                )}
              </div>
            </CardModernContent>
          </CardModern>
        </div>
      )}

      {activeTab === 'instructors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instructor List */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>Instructores</CardModernTitle>
              <ButtonModern size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </ButtonModern>
            </CardModernHeader>
            <CardModernContent>
              <div className="space-y-3">
                {instructors.map((instructor) => {
                  const payrollData = calculateInstructorPayroll(instructor)
                  return (
                    <div key={instructor.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <Award className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{instructor.name}</p>
                            <p className="text-xs text-gray-500">{instructor.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatCurrency(instructor.baseSalary / 100)}/clase
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-white rounded">
                          <p className="text-gray-500">Clases</p>
                          <p className="font-semibold">{payrollData.classes}</p>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <p className="text-gray-500">Alumnos</p>
                          <p className="font-semibold">{payrollData.students}</p>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <p className="text-gray-500">Total</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(payrollData.amount / 100)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardModernContent>
          </CardModern>

          {/* Instructor Payroll Details */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>Detalle de Pagos - {format(new Date(selectedPeriod), 'MMMM yyyy', { locale: es })}</CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div className="space-y-3">
                {instructors.map((instructor) => {
                  const payrollData = calculateInstructorPayroll(instructor)
                  return (
                    <div key={instructor.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{instructor.name}</h4>
                          <p className="text-sm text-gray-500">Periodo: {selectedPeriod}</p>
                        </div>
                        <ButtonModern size="sm">
                          Generar Recibo
                        </ButtonModern>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Clases impartidas:</span>
                          <span className="font-medium">{payrollData.classes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tarifa por clase:</span>
                          <span className="font-medium">{formatCurrency(instructor.baseSalary / 100)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total alumnos:</span>
                          <span className="font-medium">{payrollData.students}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-medium">Total a pagar:</span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(payrollData.amount / 100)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <ButtonModern className="flex-1" size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Clases
                        </ButtonModern>
                        <ButtonModern className="flex-1" size="sm">
                          <Check className="w-4 h-4 mr-1" />
                          Pagar
                        </ButtonModern>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardModernContent>
          </CardModern>
        </div>
      )}

      {activeTab === 'history' && (
        <CardModern>
          <CardModernHeader>
            <CardModernTitle>Historial de Pagos</CardModernTitle>
            <div className="flex gap-2">
              <select className="px-3 py-2 border rounded-lg text-sm">
                <option>Todos los empleados</option>
                {[...fixedEmployees, ...instructors].map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
              <ButtonModern variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Exportar
              </ButtonModern>
            </div>
          </CardModernHeader>
          <CardModernContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Periodo</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Empleado</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Puesto</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-700">Salario Base</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-700">Bonos</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-700">Deducciones</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-700">Neto</th>
                    <th className="text-center p-4 text-sm font-medium text-gray-700">Estado</th>
                    <th className="text-center p-4 text-sm font-medium text-gray-700">Fecha Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRecords.map((payroll) => (
                    <tr key={payroll.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <p className="text-sm font-medium">
                          {format(new Date(payroll.period + '-01'), 'MMM yyyy', { locale: es })}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{payroll.employeeName}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-600">{payroll.employeeRole}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-sm">{formatCurrency(payroll.baseSalary / 100)}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-sm text-green-600">
                          {payroll.bonuses > 0 ? `+${formatCurrency(payroll.bonuses / 100)}` : '-'}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-sm text-red-600">
                          {payroll.deductions > 0 ? `-${formatCurrency(payroll.deductions / 100)}` : '-'}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-sm font-semibold">{formatCurrency(payroll.netAmount / 100)}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payroll.status)}`}>
                          {getStatusText(payroll.status)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <p className="text-sm">
                          {payroll.paidAt ? format(new Date(payroll.paidAt), 'dd/MM/yyyy') : '-'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardModernContent>
        </CardModern>
      )}
    </div>
  )
}