import { useState, useEffect } from 'react'
import { useNotify } from '@/contexts/NotificationContext'
import { DEFAULT_CLASS_FORM } from '../constants'
import type { ClassForm, AvailabilityCheck, Class } from '../types'

export function useClassForm(
  classPricing: any,
  courts: any[],
  editingClass: Class | null,
  onSuccess: () => void
) {
  const notify = useNotify()
  const [classForm, setClassForm] = useState<ClassForm>(DEFAULT_CLASS_FORM)
  const [loading, setLoading] = useState(false)
  const [availabilityCheck, setAvailabilityCheck] = useState<AvailabilityCheck>({
    loading: false,
    available: null,
    message: '',
    conflicts: [],
    alternatives: []
  })

  // Populate form when editing
  useEffect(() => {
    if (editingClass) {
      setClassForm({
        instructorId: editingClass.instructorId,
        name: editingClass.name,
        description: editingClass.description || '',
        type: editingClass.type,
        level: editingClass.level,
        date: editingClass.date,
        startTime: editingClass.startTime,
        endTime: editingClass.endTime,
        duration: editingClass.duration,
        courtId: editingClass.courtId || '',
        maxStudents: editingClass.maxStudents,
        price: editingClass.price / 100, // Convert from cents to pesos
        notes: '',
        requirements: '',
        materials: '',
        isRecurring: false,
        recurrencePattern: {
          frequency: 'WEEKLY',
          interval: 1,
          occurrences: 12,
          endDate: null
        }
      })
    }
  }, [editingClass])

  // Auto-update price based on class type
  useEffect(() => {
    if (classPricing && classForm.type && !editingClass) {
      const typeKey = classForm.type.toLowerCase()
      const defaultPrice = classPricing[`${typeKey}ClassPrice`]
      if (defaultPrice) {
        setClassForm(prev => ({
          ...prev,
          price: defaultPrice / 100 // Convert from cents to pesos
        }))
      }
    }
  }, [classForm.type, classPricing, editingClass])

  // Auto-calculate end time based on start time and duration
  useEffect(() => {
    if (classForm.startTime && classForm.duration) {
      const endTime = calculateEndTime(classForm.startTime, classForm.duration)
      if (endTime !== classForm.endTime) {
        setClassForm(prev => ({ ...prev, endTime }))
      }
    }
  }, [classForm.startTime, classForm.duration])

  // Auto-check availability when court/date/time changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (classForm.courtId && classForm.date && classForm.startTime && classForm.endTime) {
        checkAvailability()
      }
    }, 500) // Debounce for 500ms

    return () => clearTimeout(timer)
  }, [classForm.courtId, classForm.date, classForm.startTime, classForm.endTime])

  const calculateEndTime = (startTime: string, duration: number): string => {
    if (!startTime) return ''

    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + duration

    const endHours = Math.floor(totalMinutes / 60) % 24
    const endMinutes = totalMinutes % 60

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  }

  const checkAvailability = async () => {
    if (!classForm.courtId || !classForm.date || !classForm.startTime || !classForm.endTime) {
      return
    }

    setAvailabilityCheck(prev => ({ ...prev, loading: true }))

    try {
      const response = await fetch('/api/bookings/availability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: classForm.courtId,
          date: classForm.date,
          startTime: classForm.startTime,
          endTime: classForm.endTime,
          excludeClassId: editingClass?.id
        })
      })

      const data = await response.json()

      setAvailabilityCheck({
        loading: false,
        available: data.available,
        message: data.message,
        conflicts: data.conflicts || [],
        alternatives: data.alternativeSlots || []
      })
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailabilityCheck({
        loading: false,
        available: null,
        message: 'Error al verificar disponibilidad',
        conflicts: [],
        alternatives: []
      })
    }
  }

  const handleCreateClass = async () => {
    try {
      setLoading(true)

      // Check availability first if not recurring
      if (!classForm.isRecurring && availabilityCheck.available === false) {
        const confirm = window.confirm(
          'El horario seleccionado no está disponible. ¿Deseas continuar de todos modos?'
        )
        if (!confirm) {
          setLoading(false)
          return
        }
      }

      // Prepare data with recurrence if enabled
      const { isRecurring, ...formData } = classForm
      const classData = {
        ...formData,
        price: classForm.price * 100, // Convert to cents
        recurring: isRecurring,
        recurrencePattern: isRecurring ? classForm.recurrencePattern : null
      }

      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      })

      const data = await response.json()

      if (data.success) {
        notify.success({
          title: 'Clase creada',
          message: data.message || 'La clase se creó exitosamente',
          duration: 4000
        })

        if (data.unavailableDates && data.unavailableDates.length > 0) {
          notify.warning({
            title: 'Algunas fechas no disponibles',
            message: `Fechas no disponibles: ${data.unavailableDates.join(', ')}`,
            duration: 6000
          })
        }

        resetForm()
        onSuccess()
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'Error al crear clase',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error creating class:', error)
      notify.error({
        title: 'Error',
        message: 'Error al crear clase',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateClass = async () => {
    if (!editingClass) return

    try {
      setLoading(true)

      const response = await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingClass.id,
          ...classForm,
          price: classForm.price * 100 // Convert to cents
        })
      })

      const data = await response.json()

      if (data.success) {
        notify.success({
          title: 'Clase actualizada',
          message: 'La clase se actualizó exitosamente',
          duration: 4000
        })

        resetForm()
        onSuccess()
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'Error al actualizar clase',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error updating class:', error)
      notify.error({
        title: 'Error',
        message: 'Error al actualizar clase',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setClassForm(DEFAULT_CLASS_FORM)
    setAvailabilityCheck({
      loading: false,
      available: null,
      message: '',
      conflicts: [],
      alternatives: []
    })
  }

  return {
    classForm,
    setClassForm,
    loading,
    availabilityCheck,
    calculateEndTime,
    checkAvailability,
    handleCreateClass,
    handleUpdateClass,
    resetForm
  }
}
