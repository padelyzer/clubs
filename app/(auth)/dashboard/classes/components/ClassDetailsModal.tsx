import React, { useState, useEffect } from 'react'
import {
  X, BookOpen, Clock, MapPin, Users, DollarSign, User,
  Calendar, Tag, UserPlus, CheckCircle, Edit, Trash2
} from 'lucide-react'
import { ModalPortal } from '@/components/ModalPortal'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { useNotify } from '@/contexts/NotificationContext'
import { formatCurrency } from '@/lib/design-system/localization'
import { CLASS_LEVELS, CLASS_STATUSES } from '../constants'
import type { Class, Player } from '../types'

type ClassDetailsModalProps = {
  classItem: Class
  players: Player[]
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onEnroll: () => void
  onAttendance: () => void
  onRefresh: () => void
}

type EnrolledStudent = {
  id: string
  playerName: string
  playerEmail: string | null
  playerPhone: string
  paymentStatus: string
  paidAmount: number
  checkedIn: boolean
  checkedInAt: Date | null
}

export function ClassDetailsModal({
  classItem,
  players,
  onClose,
  onEdit,
  onDelete,
  onEnroll,
  onAttendance,
  onRefresh
}: ClassDetailsModalProps) {
  const notify = useNotify()
  const [activeTab, setActiveTab] = useState<'info' | 'students' | 'payments'>('info')
  const [students, setStudents] = useState<EnrolledStudent[]>([])
  const [loading, setLoading] = useState(false)

  const levelConfig = CLASS_LEVELS[classItem.level as keyof typeof CLASS_LEVELS]
  const statusConfig = CLASS_STATUSES[classItem.status as keyof typeof CLASS_STATUSES]

  const availableSpots = classItem.availableSpots ??
    (classItem.maxStudents - (classItem.currentStudents || classItem.enrolledStudents || 0))
  const isFull = availableSpots <= 0

  useEffect(() => {
    if (activeTab === 'students' || activeTab === 'payments') {
      fetchStudents()
    }
  }, [activeTab])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/classes/${classItem.id}/bookings`)
      const data = await response.json()

      if (data.success) {
        setStudents(data.bookings || [])
      } else {
        notify.error({
          title: 'Error',
          message: 'No se pudo cargar la lista de estudiantes',
          duration: 4000
        })
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      notify.error({
        title: 'Error',
        message: 'Error al cargar estudiantes',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEnrollment = async (bookingId: string, studentName: string) => {
    if (!confirm(`¿Cancelar inscripción de ${studentName}?`)) return

    try {
      const response = await fetch(`/api/classes/${classItem.id}/bookings/${bookingId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        notify.success({
          title: 'Inscripción cancelada',
          message: `${studentName} ha sido desinscrito`,
          duration: 4000
        })
        fetchStudents()
        onRefresh()
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'No se pudo cancelar la inscripción',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error canceling enrollment:', error)
      notify.error({
        title: 'Error',
        message: 'Error al cancelar inscripción',
        duration: 5000
      })
    }
  }

  const totalPaid = students.reduce((sum, s) => sum + (s.paidAmount || 0), 0)
  const totalExpected = students.length * classItem.price
  const totalPending = totalExpected - totalPaid

  const paidStudents = students.filter(s => s.paymentStatus === 'completed').length
  const checkedInStudents = students.filter(s => s.checkedIn).length

  return (
    <ModalPortal>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{classItem.name}</h2>
              <p className="text-sm text-gray-600">
                {new Date(classItem.date).toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Información
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'students'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Estudiantes ({students.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'payments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Pagos
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tab: Información */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div
                  className="px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2"
                  style={{
                    backgroundColor: `${statusConfig?.color}20`,
                    color: statusConfig?.color
                  }}
                >
                  {statusConfig?.label}
                </div>
                <div className={`text-sm font-medium ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                  {availableSpots} espacios disponibles
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Instructor */}
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                    <User className="w-4 h-4" />
                    Instructor
                  </label>
                  <p className="text-gray-900">
                    {(classItem.Instructor || classItem.instructor)?.name || classItem.instructorName || 'Sin asignar'}
                  </p>
                </div>

                {/* Cancha */}
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4" />
                    Cancha
                  </label>
                  <p className="text-gray-900">
                    {(classItem.Court || classItem.court)?.name || 'Sin asignar'}
                  </p>
                </div>

                {/* Horario */}
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4" />
                    Horario
                  </label>
                  <p className="text-gray-900">
                    {classItem.startTime} - {classItem.endTime} ({classItem.duration} min)
                  </p>
                </div>

                {/* Tipo */}
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                    <Tag className="w-4 h-4" />
                    Tipo
                  </label>
                  <p className="text-gray-900">
                    {classItem.type === 'GROUP' ? 'Grupal' :
                     classItem.type === 'PRIVATE' ? 'Privada' : 'Semi-privada'}
                  </p>
                </div>

                {/* Nivel */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Nivel
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: levelConfig?.color }}
                    />
                    <span className="text-gray-900">{levelConfig?.label}</span>
                  </div>
                </div>

                {/* Precio */}
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4" />
                    Precio
                  </label>
                  <p className="text-gray-900 text-lg font-semibold">
                    {formatCurrency(classItem.price / 100)}
                  </p>
                </div>

                {/* Capacidad */}
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4" />
                    Capacidad
                  </label>
                  <p className="text-gray-900">
                    {students.length} / {classItem.maxStudents} estudiantes
                  </p>
                </div>

                {/* Asistencia */}
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    Asistencia
                  </label>
                  <p className="text-gray-900">
                    {checkedInStudents} / {students.length} presentes
                  </p>
                </div>
              </div>

              {/* Description */}
              {classItem.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Descripción
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {classItem.description}
                  </p>
                </div>
              )}

              {/* Notes */}
              {classItem.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Notas
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {classItem.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Estudiantes */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-600 mt-2">Cargando estudiantes...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay estudiantes inscritos
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Inscribe el primer estudiante para comenzar
                  </p>
                  <ButtonModern
                    variant="primary"
                    onClick={() => {
                      onClose()
                      onEnroll()
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Inscribir Estudiante
                  </ButtonModern>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{student.playerName}</h4>
                            {student.checkedIn && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                ✓ Presente
                              </span>
                            )}
                            {student.paymentStatus === 'completed' && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                💵 Pagado
                              </span>
                            )}
                            {student.paymentStatus === 'pending' && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                ⏳ Pendiente
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📱 {student.playerPhone}</p>
                            {student.playerEmail && <p>✉️ {student.playerEmail}</p>}
                            {student.paidAmount > 0 && (
                              <p className="text-green-600 font-medium">
                                Pagado: {formatCurrency(student.paidAmount / 100)}
                              </p>
                            )}
                          </div>
                        </div>
                        <ButtonModern
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCancelEnrollment(student.id, student.playerName)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </ButtonModern>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Pagos */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 font-medium mb-1">Total Recibido</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(totalPaid / 100)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {paidStudents} de {students.length} pagaron
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-700 font-medium mb-1">Pendiente</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {formatCurrency(totalPending / 100)}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {students.length - paidStudents} estudiantes
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 font-medium mb-1">Total Esperado</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(totalExpected / 100)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {students.length} x {formatCurrency(classItem.price / 100)}
                  </p>
                </div>
              </div>

              {/* Payment List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Estado de Pagos por Estudiante
                </h3>
                {students.length === 0 ? (
                  <p className="text-center text-gray-600 py-4">
                    No hay estudiantes inscritos
                  </p>
                ) : (
                  <div className="space-y-2">
                    {students.map((student) => {
                      const pending = classItem.price - (student.paidAmount || 0)
                      return (
                        <div
                          key={student.id}
                          className="border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{student.playerName}</p>
                            <p className="text-sm text-gray-600">
                              Pagado: {formatCurrency((student.paidAmount || 0) / 100)} de{' '}
                              {formatCurrency(classItem.price / 100)}
                            </p>
                          </div>
                          <div className="text-right">
                            {student.paymentStatus === 'completed' ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                ✓ Pagado
                              </span>
                            ) : (
                              <div>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                                  Debe: {formatCurrency(pending / 100)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="grid grid-cols-2 gap-3">
            <ButtonModern
              variant="primary"
              onClick={() => {
                onClose()
                onEnroll()
              }}
              disabled={isFull || classItem.status !== 'SCHEDULED'}
              fullWidth
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Inscribir Estudiante
            </ButtonModern>

            <ButtonModern
              variant="primary"
              onClick={() => {
                onClose()
                onAttendance()
              }}
              disabled={classItem.status === 'CANCELLED' || classItem.status === 'COMPLETED'}
              fullWidth
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Control de Asistencia
            </ButtonModern>

            {classItem.status === 'SCHEDULED' && (
              <>
                <ButtonModern
                  variant="secondary"
                  onClick={() => {
                    onClose()
                    onEdit()
                  }}
                  fullWidth
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Clase
                </ButtonModern>

                <ButtonModern
                  variant="secondary"
                  onClick={() => {
                    onClose()
                    onDelete()
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  fullWidth
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancelar Clase
                </ButtonModern>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
    </ModalPortal>
}
