import React from 'react'
import { User, Mail, Phone, DollarSign, Users } from 'lucide-react'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { ModernModal } from '@/components/design-system/ModernModal'
import { formatCurrency } from '@/lib/design-system/localization'
import { useEnrollment } from '../hooks/useEnrollment'
import type { Class, Player } from '../types'

type EnrollmentModalProps = {
  classItem: Class
  players: Player[]
  onClose: () => void
  onSuccess: () => void
}

export function EnrollmentModal({
  classItem,
  players,
  onClose,
  onSuccess
}: EnrollmentModalProps) {
  const {
    enrollmentForm,
    setEnrollmentForm,
    loading,
    handleEnroll,
    handlePlayerSelect
  } = useEnrollment(classItem, () => {
    onSuccess()
    onClose()
  })

  const availableSpots = classItem.availableSpots ??
    (classItem.maxStudents - (classItem.currentStudents || classItem.enrolledStudents || 0))

  const isFull = availableSpots <= 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleEnroll()
  }

  const handlePlayerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const playerId = e.target.value
    if (playerId) {
      const player = players.find(p => p.id === playerId)
      if (player) {
        handlePlayerSelect(playerId, player)
      }
    } else {
      setEnrollmentForm(prev => ({
        ...prev,
        playerId: '',
        studentName: '',
        studentEmail: '',
        studentPhone: ''
      }))
    }
  }

  return (
    <ModernModal
      isOpen={true}
      onClose={onClose}
      title="Inscribir Estudiante"
      subtitle={classItem.name}
      size="medium"
    >
          {/* Class Info */}
          <div style={{
            background: 'rgba(164, 223, 78, 0.08)',
            border: '1px solid rgba(164, 223, 78, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '28px'
          }}>
            <h3 style={{
              fontWeight: 600,
              fontSize: '16px',
              color: '#1C1C1E',
              marginBottom: '12px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'
            }}>{classItem.name}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <strong>Fecha:</strong> {new Date(classItem.date).toLocaleDateString('es-MX')}
              </div>
              <div>
                <strong>Horario:</strong> {classItem.startTime} - {classItem.endTime}
              </div>
              <div>
                <strong>Instructor:</strong> {classItem.instructor?.name || 'Sin asignar'}
              </div>
              <div>
                <strong>Precio:</strong> {formatCurrency(classItem.price / 100)}
              </div>
              <div className="col-span-2">
                <strong>Disponibilidad:</strong>{' '}
                <span className={isFull ? 'text-red-600' : 'text-green-600'}>
                  {availableSpots} lugares disponibles
                </span>
              </div>
            </div>
          </div>

          {isFull ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 font-medium">
                Esta clase está llena. No se pueden inscribir más estudiantes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Player Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="w-4 h-4 inline mr-2" />
                  Seleccionar Jugador Existente (Opcional)
                </label>
                <select
                  value={enrollmentForm.playerId}
                  onChange={handlePlayerSelectChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nuevo estudiante...</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} - {player.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Info */}
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900">Información del Estudiante</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-2" />
                    Nombre Completo *
                  </label>
                  <InputModern
                    type="text"
                    value={enrollmentForm.studentName}
                    onChange={(e) => setEnrollmentForm(prev => ({ ...prev, studentName: e.target.value }))}
                    placeholder="Nombre del estudiante"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Correo Electrónico
                  </label>
                  <InputModern
                    type="email"
                    value={enrollmentForm.studentEmail}
                    onChange={(e) => setEnrollmentForm(prev => ({ ...prev, studentEmail: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Teléfono *
                  </label>
                  <InputModern
                    type="tel"
                    value={enrollmentForm.studentPhone}
                    onChange={(e) => setEnrollmentForm(prev => ({ ...prev, studentPhone: e.target.value }))}
                    placeholder="5512345678"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El link de pago se enviará por WhatsApp a este número
                  </p>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  <DollarSign className="w-5 h-5 inline mr-2" />
                  Opciones de Pago
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="online"
                        checked={enrollmentForm.paymentMethod === 'online'}
                        onChange={(e) => setEnrollmentForm(prev => ({ ...prev, paymentMethod: e.target.value as 'online' | 'onsite' }))}
                        style={{ accentColor: '#A4DF4E' }}
                      />
                      <span className="text-sm text-gray-700">
                        Pago en línea (se enviará link por WhatsApp)
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="onsite"
                        checked={enrollmentForm.paymentMethod === 'onsite'}
                        onChange={(e) => setEnrollmentForm(prev => ({ ...prev, paymentMethod: e.target.value as 'online' | 'onsite' }))}
                        style={{ accentColor: '#A4DF4E' }}
                      />
                      <span className="text-sm text-gray-700">
                        Pago en sitio (efectivo/tarjeta en el club)
                      </span>
                    </label>
                  </div>
                </div>

                {enrollmentForm.paymentMethod === 'online' && (
                  <div style={{
                    background: 'rgba(164, 223, 78, 0.04)',
                    border: '1px solid rgba(164, 223, 78, 0.1)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <label className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={enrollmentForm.splitPayment}
                        onChange={(e) => setEnrollmentForm(prev => ({ ...prev, splitPayment: e.target.checked }))}
                        style={{ accentColor: '#A4DF4E' }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Dividir pago en varias partes
                      </span>
                    </label>

                    {enrollmentForm.splitPayment && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de pagos
                        </label>
                        <InputModern
                          type="number"
                          value={enrollmentForm.splitCount}
                          onChange={(e) => setEnrollmentForm(prev => ({ ...prev, splitCount: parseInt(e.target.value) }))}
                          min="2"
                          max="4"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Cada pago: {formatCurrency((classItem.price / 100) / enrollmentForm.splitCount)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Adicionales
                </label>
                <textarea
                  value={enrollmentForm.notes}
                  onChange={(e) => setEnrollmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Información adicional..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
                <ButtonModern
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </ButtonModern>
                <ButtonModern
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  loading={loading}
                >
                  Inscribir Estudiante
                </ButtonModern>
              </div>
            </form>
          )}
    </ModernModal>
  )
}
