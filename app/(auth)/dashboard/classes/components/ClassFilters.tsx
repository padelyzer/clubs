import React from 'react'
import { Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { CLASS_LEVELS } from '../constants'
import type { Instructor } from '../types'

type ClassFiltersProps = {
  selectedDate: Date
  selectedLevel: string
  selectedInstructor: string
  instructors: Instructor[]
  onDateChange: (date: Date) => void
  onLevelChange: (level: string) => void
  onInstructorChange: (instructorId: string) => void
}

export function ClassFilters({
  selectedDate,
  selectedLevel,
  selectedInstructor,
  instructors,
  onDateChange,
  onLevelChange,
  onInstructorChange
}: ClassFiltersProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const previousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }

  const nextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold">Filtros</h3>
      </div>

      {/* Date Navigation */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          Fecha
        </label>
        <div className="flex items-center gap-2">
          <ButtonModern
            variant="secondary"
            size="sm"
            onClick={previousDay}
          >
            <ChevronLeft className="w-4 h-4" />
          </ButtonModern>

          <div className="flex-1 text-center">
            <p className="text-sm font-medium text-gray-900">
              {formatDate(selectedDate)}
            </p>
          </div>

          <ButtonModern
            variant="secondary"
            size="sm"
            onClick={nextDay}
          >
            <ChevronRight className="w-4 h-4" />
          </ButtonModern>
        </div>

        <div className="mt-2">
          <ButtonModern
            variant="secondary"
            size="sm"
            onClick={goToToday}
            fullWidth
          >
            Hoy
          </ButtonModern>
        </div>
      </div>

      {/* Level Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nivel
        </label>
        <select
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los niveles</option>
          {Object.entries(CLASS_LEVELS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>
      </div>

      {/* Instructor Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructor
        </label>
        <select
          value={selectedInstructor}
          onChange={(e) => onInstructorChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los instructores</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
