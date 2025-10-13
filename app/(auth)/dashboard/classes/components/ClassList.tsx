import React from 'react'
import { Loader2, BookOpen } from 'lucide-react'
import { ClassCard } from './ClassCard'
import type { Class } from '../types'

type ClassListProps = {
  classes: Class[]
  loading: boolean
  onClassClick: (classItem: Class) => void
  onEdit: (classItem: Class) => void
  onDelete: (classItem: Class) => void
  onEnroll: (classItem: Class) => void
  onAttendance: (classItem: Class) => void
}

export function ClassList({
  classes,
  loading,
  onClassClick,
  onEdit,
  onDelete,
  onEnroll,
  onAttendance
}: ClassListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando clases...</span>
      </div>
    )
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay clases programadas
        </h3>
        <p className="text-gray-600">
          Crea tu primera clase para comenzar
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes.map(classItem => (
        <ClassCard
          key={classItem.id}
          classItem={classItem}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onClassClick}
          onEnroll={onEnroll}
          onAttendance={onAttendance}
        />
      ))}
    </div>
  )
}
