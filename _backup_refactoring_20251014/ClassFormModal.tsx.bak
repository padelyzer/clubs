import React from 'react'
import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { ModalPortal } from '@/components/ModalPortal'
import { useClassForm } from '../hooks/useClassForm'
import { CLASS_TYPES, CLASS_LEVELS, RECURRENCE_FREQUENCIES } from '../constants'
import type { Class, Instructor } from '../types'

type ClassFormModalProps = {
  classToEdit?: Class | null
  courts: any[]
  instructors: Instructor[]
  classPricing: any
  onClose: () => void
  onSuccess: () => void
}

export function ClassFormModal({
  classToEdit = null,
  courts,
  instructors,
  classPricing,
  onClose,
  onSuccess
}: ClassFormModalProps) {
  const {
    classForm,
    setClassForm,
    loading,
    availabilityCheck,
    handleCreateClass,
    handleUpdateClass,
    resetForm
  } = useClassForm(classPricing, courts, classToEdit, () => {
    onSuccess()
    onClose()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (classToEdit) {
      await handleUpdateClass()
    } else {
      await handleCreateClass()
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {classToEdit ? 'Editar Clase' : 'Nueva Clase'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Clase *
              </label>
              <InputModern
                type="text"
                value={classForm.name}
                onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Clase de Pádel Principiantes"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={classForm.description}
                onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la clase..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={classForm.type}
                  onChange={(e) => setClassForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {Object.entries(CLASS_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel *
                </label>
                <select
                  value={classForm.level}
                  onChange={(e) => setClassForm(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {Object.entries(CLASS_LEVELS).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructor *
              </label>
              <select
                value={classForm.instructorId}
                onChange={(e) => setClassForm(prev => ({ ...prev, instructorId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar instructor</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Horario</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <InputModern
                  type="date"
                  value={classForm.date}
                  onChange={(e) => setClassForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Inicio *
                </label>
                <InputModern
                  type="time"
                  value={classForm.startTime}
                  onChange={(e) => setClassForm(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (min) *
                </label>
                <InputModern
                  type="number"
                  value={classForm.duration}
                  onChange={(e) => setClassForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="30"
                  step="30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Fin (calculado automáticamente)
              </label>
              <InputModern
                type="time"
                value={classForm.endTime}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cancha *
              </label>
              <select
                value={classForm.courtId}
                onChange={(e) => setClassForm(prev => ({ ...prev, courtId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar cancha</option>
                {courts.map(court => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Check */}
            {availabilityCheck.loading && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando disponibilidad...
              </div>
            )}

            {!availabilityCheck.loading && availabilityCheck.available === true && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Horario disponible
              </div>
            )}

            {!availabilityCheck.loading && availabilityCheck.available === false && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-yellow-800 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  {availabilityCheck.message}
                </div>
                {availabilityCheck.conflicts.length > 0 && (
                  <div className="text-xs text-yellow-700 ml-6">
                    Conflictos encontrados: {availabilityCheck.conflicts.length}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Capacity & Pricing */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Capacidad y Precio</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estudiantes Máximos *
                </label>
                <InputModern
                  type="number"
                  value={classForm.maxStudents}
                  onChange={(e) => setClassForm(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                  min="1"
                  max="20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (MXN) *
                </label>
                <InputModern
                  type="number"
                  value={classForm.price}
                  onChange={(e) => setClassForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  min="0"
                  step="50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Recurrence (only for new classes) */}
          {!classToEdit && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={classForm.isRecurring}
                  onChange={(e) => setClassForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Clase Recurrente
                </label>
              </div>

              {classForm.isRecurring && (
                <div className="ml-6 space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frecuencia
                      </label>
                      <select
                        value={classForm.recurrencePattern.frequency}
                        onChange={(e) => setClassForm(prev => ({
                          ...prev,
                          recurrencePattern: { ...prev.recurrencePattern, frequency: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(RECURRENCE_FREQUENCIES).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Intervalo
                      </label>
                      <InputModern
                        type="number"
                        value={classForm.recurrencePattern.interval}
                        onChange={(e) => setClassForm(prev => ({
                          ...prev,
                          recurrencePattern: { ...prev.recurrencePattern, interval: parseInt(e.target.value) }
                        }))}
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ocurrencias
                      </label>
                      <InputModern
                        type="number"
                        value={classForm.recurrencePattern.occurrences}
                        onChange={(e) => setClassForm(prev => ({
                          ...prev,
                          recurrencePattern: { ...prev.recurrencePattern, occurrences: parseInt(e.target.value) }
                        }))}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Se crearán {classForm.recurrencePattern.occurrences} clases {classForm.recurrencePattern.frequency === 'WEEKLY' ? 'semanales' : 'mensuales'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={classForm.notes}
                onChange={(e) => setClassForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas adicionales..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
            <ButtonModern
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </ButtonModern>
            <ButtonModern
              type="submit"
              variant="primary"
              disabled={loading || (availabilityCheck.available === false && !classToEdit)}
              loading={loading}
            >
              {classToEdit ? 'Actualizar Clase' : 'Crear Clase'}
            </ButtonModern>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  )
}
