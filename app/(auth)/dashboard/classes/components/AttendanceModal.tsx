import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, DollarSign, Loader2 } from 'lucide-react'
import { ModernModal } from '@/components/design-system/ModernModal'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { useNotify } from '@/contexts/NotificationContext'
import { formatCurrency } from '@/lib/design-system/localization'
import type { Class } from '../types'

type Student = {
  classBookingId: string
  studentName: string
  studentPhone: string
  studentEmail: string | null
  currentStatus: {
    checkedIn: boolean
    paymentStatus: string
    paidAmount: number
    dueAmount: number
  }
  needsPayment: boolean
  suggestedPaymentAmount: number
}

type StudentAttendance = {
  classBookingId: string
  studentName: string
  attendanceStatus: 'PRESENT' | 'LATE' | 'ABSENT'
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER' | 'ONLINE' | 'FREE'
  paymentAmount?: number
  notes?: string
}

type AttendanceModalProps = {
  classItem: Class
  onClose: () => void
  onSuccess: () => void
}

export function AttendanceModal({
  classItem,
  onClose,
  onSuccess
}: AttendanceModalProps) {
  const notify = useNotify()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Map<string, StudentAttendance>>(new Map())
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    checkedIn: 0,
    paid: 0,
    pending: 0
  })

  useEffect(() => {
    fetchAttendanceList()
  }, [])

  const fetchAttendanceList = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/classes/${classItem.id}/quick-checkin`)
      const data = await response.json()

      if (data.success) {
        setStudents(data.students || [])
        setStats(data.stats || {})
      } else {
        notify.error({
          title: 'Error',
          message: 'No se pudo cargar la lista de estudiantes',
          duration: 4000
        })
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
      notify.error({
        title: 'Error',
        message: 'Error al cargar la lista',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (
    classBookingId: string,
    studentName: string,
    attendanceStatus: 'PRESENT' | 'LATE' | 'ABSENT'
  ) => {
    setAttendance(prev => {
      const updated = new Map(prev)
      updated.set(classBookingId, {
        classBookingId,
        studentName,
        attendanceStatus
      })
      return updated
    })
  }

  const handlePaymentChange = (
    classBookingId: string,
    paymentMethod: string,
    paymentAmount: number
  ) => {
    setAttendance(prev => {
      const updated = new Map(prev)
      const existing = updated.get(classBookingId)
      if (existing) {
        updated.set(classBookingId, {
          ...existing,
          paymentMethod: paymentMethod as any,
          paymentAmount
        })
      }
      return updated
    })
  }

  const handleQuickCheckIn = async () => {
    const attendanceArray = Array.from(attendance.values())

    if (attendanceArray.length === 0) {
      notify.warning({
        title: 'Aviso',
        message: 'Selecciona al menos un estudiante para registrar asistencia',
        duration: 4000
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`/api/classes/${classItem.id}/quick-checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: attendanceArray
        })
      })

      const data = await response.json()

      if (data.success) {
        notify.success({
          title: 'Check-in completado',
          message: `Se procesaron ${data.summary.totalProcessed} estudiantes`,
          duration: 5000
        })

        if (data.summary.totalRevenue > 0) {
          notify.info({
            title: 'Pagos procesados',
            message: `Ingresos: ${formatCurrency(data.summary.totalRevenue / 100)}`,
            duration: 5000
          })
        }

        onSuccess()
        onClose()
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'Error al procesar check-in',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error in quick check-in:', error)
      notify.error({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al procesar check-in',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (status: 'PRESENT' | 'LATE' | 'ABSENT') => {
    const newAttendance = new Map<string, StudentAttendance>()
    students.forEach(student => {
      if (!student.currentStatus.checkedIn) {
        newAttendance.set(student.classBookingId, {
          classBookingId: student.classBookingId,
          studentName: student.studentName,
          attendanceStatus: status,
          ...(student.needsPayment && status !== 'ABSENT' && {
            paymentMethod: 'CASH',
            paymentAmount: student.suggestedPaymentAmount
          })
        })
      }
    })
    setAttendance(newAttendance)
  }

  const footerContent = (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-600">
        {attendance.size > 0 && (
          <span>
            {attendance.size} estudiante{attendance.size !== 1 ? 's' : ''} seleccionado{attendance.size !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="flex gap-3">
        <ButtonModern
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </ButtonModern>
        <ButtonModern
          variant="primary"
          onClick={handleQuickCheckIn}
          disabled={loading || attendance.size === 0}
          loading={loading}
        >
          Procesar Check-in ({attendance.size})
        </ButtonModern>
      </div>
    </div>
  )

  return (
    <ModernModal
      isOpen={true}
      onClose={onClose}
      title="Asistencia y Check-in"
      subtitle={classItem.name}
      size="xlarge"
      footer={footerContent}
    >
        {/* Stats */}
        <div style={{
          background: 'rgba(164, 223, 78, 0.04)',
          border: '1px solid rgba(164, 223, 78, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600">Total Inscritos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEnrolled}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Check-in</p>
              <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Pagos Completos</p>
              <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-b border-gray-200 px-6 py-3 bg-blue-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Acciones rápidas:</span>
            <ButtonModern
              size="sm"
              variant="secondary"
              onClick={() => handleSelectAll('PRESENT')}
            >
              Marcar todos Presentes
            </ButtonModern>
            <ButtonModern
              size="sm"
              variant="secondary"
              onClick={() => handleSelectAll('LATE')}
            >
              Marcar todos Tarde
            </ButtonModern>
          </div>
        </div>

        {/* Student List */}
        <div className="p-6">
          {loading && students.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando estudiantes...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay estudiantes inscritos en esta clase</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map(student => {
                const currentAttendance = attendance.get(student.classBookingId)
                const isCheckedIn = student.currentStatus.checkedIn
                const isPaid = student.currentStatus.paymentStatus === 'completed'

                return (
                  <div
                    key={student.classBookingId}
                    className={`border rounded-lg p-4 ${
                      isCheckedIn ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Student Info */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{student.studentName}</h4>
                        <p className="text-sm text-gray-600">{student.studentPhone}</p>
                        {student.currentStatus.checkedIn && (
                          <div className="mt-1 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">Ya registró asistencia</span>
                          </div>
                        )}
                      </div>

                      {/* Attendance Status */}
                      {!isCheckedIn && (
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-700">
                            Asistencia
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(student.classBookingId, student.studentName, 'PRESENT')}
                              className={`px-3 py-1 text-xs rounded-lg border ${
                                currentAttendance?.attendanceStatus === 'PRESENT'
                                  ? 'bg-green-600 text-white border-green-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              Presente
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(student.classBookingId, student.studentName, 'LATE')}
                              className={`px-3 py-1 text-xs rounded-lg border ${
                                currentAttendance?.attendanceStatus === 'LATE'
                                  ? 'bg-yellow-600 text-white border-yellow-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <Clock className="w-4 h-4 inline mr-1" />
                              Tarde
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(student.classBookingId, student.studentName, 'ABSENT')}
                              className={`px-3 py-1 text-xs rounded-lg border ${
                                currentAttendance?.attendanceStatus === 'ABSENT'
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <XCircle className="w-4 h-4 inline mr-1" />
                              Ausente
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Payment */}
                      {student.needsPayment && !isPaid && currentAttendance && currentAttendance.attendanceStatus !== 'ABSENT' && (
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-700">
                            <DollarSign className="w-3 h-3 inline mr-1" />
                            Pago: {formatCurrency(student.suggestedPaymentAmount / 100)}
                          </label>
                          <select
                            value={currentAttendance.paymentMethod || ''}
                            onChange={(e) => handlePaymentChange(
                              student.classBookingId,
                              e.target.value,
                              student.suggestedPaymentAmount
                            )}
                            className="text-xs px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Sin pago</option>
                            <option value="CASH">Efectivo</option>
                            <option value="CARD">Tarjeta</option>
                            <option value="TRANSFER">Transferencia</option>
                            <option value="ONLINE">Online</option>
                            <option value="FREE">Gratis</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
    </ModernModal>
  )
}
