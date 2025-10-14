import React, { useState, useEffect } from 'react'
import {
  DollarSign, Clock, CheckCircle, AlertCircle, ChevronDown,
  ChevronUp, Calendar, Users, Bell, Loader
} from 'lucide-react'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { useNotify } from '@/contexts/NotificationContext'
import { formatCurrency } from '@/lib/design-system/localization'
import { PaymentModal } from './PaymentModal'

type PendingPayment = {
  id: string
  studentName: string
  studentPhone: string
  studentEmail: string | null
  enrollmentDate: Date
  dueAmount: number
  paidAmount: number
  paymentStatus: string
  paymentMethod: string | null
  attended: boolean
}

type ClassWithPayments = {
  class: {
    id: string
    name: string
    date: Date
    startTime: string
    price: number
    instructor?: { name: string }
    court?: { name: string }
  }
  bookings: PendingPayment[]
  totalDue: number
  totalPaid: number
}

type Summary = {
  totalClasses: number
  totalStudents: number
  totalDue: number
  totalPaid: number
  totalPending: number
}

export function PendingPaymentsView() {
  const notify = useNotify()
  const [loading, setLoading] = useState(true)
  const [paymentsByClass, setPaymentsByClass] = useState<ClassWithPayments[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set())
  const [selectedPayment, setSelectedPayment] = useState<{
    bookingId: string
    studentName: string
    dueAmount: number
    className: string
  } | null>(null)
  const [sendingReminders, setSendingReminders] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPendingPayments()
  }, [])

  const fetchPendingPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/classes/pending-payments?status=pending')
      const data = await response.json()

      if (data.success) {
        setPaymentsByClass(data.paymentsByClass || [])
        setSummary(data.summary)
      } else {
        notify.error({
          title: 'Error',
          message: 'No se pudieron cargar los pagos pendientes',
          duration: 4000
        })
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error)
      notify.error({
        title: 'Error',
        message: 'Error al cargar pagos pendientes',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleClass = (classId: string) => {
    const newExpanded = new Set(expandedClasses)
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId)
    } else {
      newExpanded.add(classId)
    }
    setExpandedClasses(newExpanded)
  }

  const handlePayment = (booking: PendingPayment, classData: ClassWithPayments) => {
    setSelectedPayment({
      bookingId: booking.id,
      studentName: booking.studentName,
      dueAmount: booking.dueAmount,
      className: classData.class.name
    })
  }

  const handleSendReminder = async (bookingId: string, studentName: string) => {
    try {
      setSendingReminders(prev => new Set(prev).add(bookingId))

      const response = await fetch('/api/classes/pending-payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingIds: [bookingId]
        })
      })

      const data = await response.json()

      if (data.success) {
        notify.success({
          title: 'Recordatorio enviado',
          message: `Se envió recordatorio de pago a ${studentName}`,
          duration: 4000
        })
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'No se pudo enviar el recordatorio',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error sending reminder:', error)
      notify.error({
        title: 'Error',
        message: 'Error al enviar recordatorio',
        duration: 5000
      })
    } finally {
      setSendingReminders(prev => {
        const newSet = new Set(prev)
        newSet.delete(bookingId)
        return newSet
      })
    }
  }

  const handleSendBulkReminders = async (classId: string, bookings: PendingPayment[]) => {
    const bookingIds = bookings.map(b => b.id)

    if (!confirm(`¿Enviar recordatorio de pago a ${bookings.length} estudiantes?`)) {
      return
    }

    try {
      const response = await fetch('/api/classes/pending-payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingIds })
      })

      const data = await response.json()

      if (data.success) {
        notify.success({
          title: 'Recordatorios enviados',
          message: data.message,
          duration: 5000
        })
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'No se pudieron enviar los recordatorios',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error sending bulk reminders:', error)
      notify.error({
        title: 'Error',
        message: 'Error al enviar recordatorios',
        duration: 5000
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando pagos pendientes...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-700">Pendiente de Cobro</p>
            </div>
            <p className="text-2xl font-bold text-yellow-900">
              {formatCurrency(summary.totalPending / 100)}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              {summary.totalStudents} estudiantes
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-700">Total Pagado</p>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(summary.totalPaid / 100)}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-blue-700">Total Esperado</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency((summary.totalDue + summary.totalPaid) / 100)}
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-medium text-purple-700">Clases Afectadas</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">{summary.totalClasses}</p>
          </div>
        </div>
      )}

      {/* Classes List */}
      {paymentsByClass.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Todos los pagos están al día!
          </h3>
          <p className="text-gray-600">
            No hay pagos pendientes en este momento
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentsByClass.map((classData) => {
            const isExpanded = expandedClasses.has(classData.class.id)

            return (
              <div
                key={classData.class.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Class Header */}
                <div
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleClass(classData.class.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {classData.class.name}
                        </h3>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                          {classData.bookings.length} pendientes
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(classData.class.date).toLocaleDateString('es-MX', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })} - {classData.class.startTime}
                        </div>
                        {classData.class.instructor && (
                          <div className="flex items-center gap-1">
                            👤 {classData.class.instructor.name}
                          </div>
                        )}
                        {classData.class.court && (
                          <div className="flex items-center gap-1">
                            📍 {classData.class.court.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Pendiente</p>
                        <p className="text-lg font-bold text-yellow-600">
                          {formatCurrency(classData.totalDue / 100)}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Students List (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">
                          Estudiantes con pagos pendientes
                        </h4>
                        <ButtonModern
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSendBulkReminders(classData.class.id, classData.bookings)}
                        >
                          <Bell className="w-4 h-4 mr-1" />
                          Recordar a todos
                        </ButtonModern>
                      </div>
                      <div className="space-y-2">
                        {classData.bookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="bg-white border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-gray-900">
                                    {booking.studentName}
                                  </h5>
                                  {booking.attended && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                      ✓ Asistió
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 space-y-0.5">
                                  <p>📱 {booking.studentPhone}</p>
                                  {booking.studentEmail && <p>✉️ {booking.studentEmail}</p>}
                                  {booking.paidAmount > 0 && (
                                    <p className="text-green-600 font-medium">
                                      Pagado: {formatCurrency(booking.paidAmount / 100)} de{' '}
                                      {formatCurrency(classData.class.price / 100)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Adeuda</p>
                                  <p className="text-lg font-bold text-yellow-600">
                                    {formatCurrency(booking.dueAmount / 100)}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <ButtonModern
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleSendReminder(booking.id, booking.studentName)}
                                    loading={sendingReminders.has(booking.id)}
                                    disabled={sendingReminders.has(booking.id)}
                                  >
                                    <Bell className="w-4 h-4" />
                                  </ButtonModern>
                                  <ButtonModern
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handlePayment(booking, classData)}
                                  >
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    Cobrar
                                  </ButtonModern>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Payment Modal */}
      {selectedPayment && (
        <PaymentModal
          bookingId={selectedPayment.bookingId}
          studentName={selectedPayment.studentName}
          dueAmount={selectedPayment.dueAmount}
          className={selectedPayment.className}
          onClose={() => setSelectedPayment(null)}
          onSuccess={() => {
            fetchPendingPayments()
            setSelectedPayment(null)
          }}
        />
      )}
    </div>
  )
}
