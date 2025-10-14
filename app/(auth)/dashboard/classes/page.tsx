'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNotify } from '@/contexts/NotificationContext'
import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { Plus, BookOpen } from 'lucide-react'

// Hooks
import { useClassesData } from './hooks/useClassesData'

// Components
import { ClassFilters } from './components/ClassFilters'
import { ClassList } from './components/ClassList'
import { ClassFormModal } from './components/ClassFormModal'
import { EnrollmentModal } from './components/EnrollmentModal'
import { AttendanceModal } from './components/AttendanceModal'
import { ClassDetailsModal } from './components/ClassDetailsModal'

// Types
import type { Class } from './types'

function ClassesContent() {
  const router = useRouter()
  const notify = useNotify()

  // Filters State
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedInstructor, setSelectedInstructor] = useState('all')

  // Modal States
  const [isCreatingClass, setIsCreatingClass] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [showEnrollment, setShowEnrollment] = useState(false)
  const [showAttendance, setShowAttendance] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Data Hook
  const {
    loading,
    classes,
    instructors,
    courts,
    players,
    classPricing,
    fetchClasses
  } = useClassesData(selectedDate, selectedLevel, selectedInstructor)

  // Handlers
  const handleCreateClass = () => {
    setIsCreatingClass(true)
  }

  const handleEditClass = (classItem: Class) => {
    setEditingClass(classItem)
  }

  const handleDeleteClass = async (classItem: Class) => {
    if (!confirm('¿Estás seguro de eliminar esta clase?')) return

    try {
      const response = await fetch(`/api/classes?id=${classItem.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        notify.success({
          title: 'Clase eliminada',
          message: 'La clase se eliminó exitosamente',
          duration: 4000
        })
        fetchClasses()
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'Error al eliminar clase',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error deleting class:', error)
      notify.error({
        title: 'Error',
        message: 'Error al eliminar clase',
        duration: 5000
      })
    }
  }

  const handleViewDetails = (classItem: Class) => {
    setSelectedClass(classItem)
    setShowDetails(true)
  }

  const handleEnroll = (classItem: Class) => {
    setSelectedClass(classItem)
    setShowEnrollment(true)
  }

  const handleAttendance = (classItem: Class) => {
    setSelectedClass(classItem)
    setShowAttendance(true)
  }

  const handleModalClose = () => {
    setIsCreatingClass(false)
    setEditingClass(null)
    setShowEnrollment(false)
    setShowAttendance(false)
    setShowDetails(false)
    setSelectedClass(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <CardModern>
        <CardModernHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <CardModernTitle>Gestión de Clases</CardModernTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Administra tus clases y estudiantes
                </p>
              </div>
            </div>
            <ButtonModern
              variant="primary"
              onClick={handleCreateClass}
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Clase
            </ButtonModern>
          </div>
        </CardModernHeader>
      </CardModern>

      {/* Filters */}
      <ClassFilters
        selectedDate={selectedDate}
        selectedLevel={selectedLevel}
        selectedInstructor={selectedInstructor}
        instructors={instructors}
        onDateChange={setSelectedDate}
        onLevelChange={setSelectedLevel}
        onInstructorChange={setSelectedInstructor}
      />

      {/* Classes List */}
      <CardModern>
        <CardModernContent>
          <ClassList
            classes={classes}
            loading={loading}
            onClassClick={handleViewDetails}
            onEdit={handleEditClass}
            onDelete={handleDeleteClass}
            onEnroll={handleEnroll}
            onAttendance={handleAttendance}
          />
        </CardModernContent>
      </CardModern>

      {/* Modals */}
      {isCreatingClass && (
        <ClassFormModal
          courts={courts}
          instructors={instructors}
          classPricing={classPricing}
          onClose={handleModalClose}
          onSuccess={fetchClasses}
        />
      )}

      {editingClass && (
        <ClassFormModal
          classToEdit={editingClass}
          courts={courts}
          instructors={instructors}
          classPricing={classPricing}
          onClose={handleModalClose}
          onSuccess={fetchClasses}
        />
      )}

      {showEnrollment && selectedClass && (
        <EnrollmentModal
          classItem={selectedClass}
          players={players}
          onClose={handleModalClose}
          onSuccess={fetchClasses}
        />
      )}

      {showAttendance && selectedClass && (
        <AttendanceModal
          classItem={selectedClass}
          onClose={handleModalClose}
          onSuccess={fetchClasses}
        />
      )}

      {showDetails && selectedClass && (
        <ClassDetailsModal
          classItem={selectedClass}
          players={players}
          onClose={handleModalClose}
          onEdit={() => handleEditClass(selectedClass)}
          onDelete={() => handleDeleteClass(selectedClass)}
          onEnroll={() => handleEnroll(selectedClass)}
          onAttendance={() => handleAttendance(selectedClass)}
          onRefresh={fetchClasses}
        />
      )}
    </div>
  )
}

export default function ClassesPage() {
  return (
    <DashboardWithNotifications>
      <ClassesContent />
    </DashboardWithNotifications>
  )
}
