import { useState } from 'react'
import { useNotify } from '@/contexts/NotificationContext'
import { DEFAULT_ENROLLMENT_FORM } from '../constants'
import type { EnrollmentForm, Class } from '../types'

export function useEnrollment(
  selectedClass: Class | null,
  onSuccess: () => void
) {
  const notify = useNotify()
  const [enrollmentForm, setEnrollmentForm] = useState<EnrollmentForm>(DEFAULT_ENROLLMENT_FORM)
  const [loading, setLoading] = useState(false)

  const handleEnroll = async () => {
    if (!selectedClass) return

    // Validation
    if (!enrollmentForm.studentName || !enrollmentForm.studentPhone) {
      notify.error({
        title: 'Error',
        message: 'El nombre y teléfono del estudiante son requeridos',
        duration: 4000
      })
      return
    }

    // Validate phone format (basic)
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(enrollmentForm.studentPhone.replace(/\D/g, ''))) {
      notify.error({
        title: 'Error',
        message: 'El teléfono debe tener 10 dígitos',
        duration: 4000
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`/api/classes/${selectedClass.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: enrollmentForm.studentName,
          studentEmail: enrollmentForm.studentEmail,
          studentPhone: enrollmentForm.studentPhone,
          paymentMethod: enrollmentForm.paymentMethod,
          splitPayment: enrollmentForm.splitPayment,
          splitCount: enrollmentForm.splitCount
        })
      })

      const data = await response.json()

      if (data.success) {
        notify.success({
          title: 'Inscripción exitosa',
          message: data.message || 'El estudiante ha sido inscrito exitosamente',
          duration: 4000
        })

        // Show payment info if applicable
        if (data.payment?.paymentLink) {
          notify.info({
            title: 'Link de pago enviado',
            message: 'Se ha enviado el link de pago por WhatsApp',
            duration: 6000
          })
        } else if (data.payment?.splitPayments) {
          notify.info({
            title: 'Links de pago enviados',
            message: `Se enviaron ${data.payment.splitCount} links de pago por WhatsApp`,
            duration: 6000
          })
        }

        resetForm()
        onSuccess()
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'Error al inscribir estudiante',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error enrolling student:', error)
      notify.error({
        title: 'Error',
        message: 'Error al inscribir estudiante',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEnrollmentForm(DEFAULT_ENROLLMENT_FORM)
  }

  const handlePlayerSelect = (playerId: string, playerData: any) => {
    setEnrollmentForm(prev => ({
      ...prev,
      playerId,
      studentName: playerData.name,
      studentEmail: playerData.email || '',
      studentPhone: playerData.phone
    }))
  }

  return {
    enrollmentForm,
    setEnrollmentForm,
    loading,
    handleEnroll,
    handlePlayerSelect,
    resetForm
  }
}
