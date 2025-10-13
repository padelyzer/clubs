import React from 'react'
import {
  Clock, MapPin, Users, DollarSign, User, Edit, Trash2,
  UserPlus, CheckCircle
} from 'lucide-react'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { formatCurrency } from '@/lib/design-system/localization'
import { CLASS_LEVELS, CLASS_STATUSES } from '../constants'
import type { Class } from '../types'

type ClassCardProps = {
  classItem: Class
  onEdit: (classItem: Class) => void
  onDelete: (classItem: Class) => void
  onViewDetails: (classItem: Class) => void
  onEnroll: (classItem: Class) => void
  onAttendance: (classItem: Class) => void
}

export function ClassCard({
  classItem,
  onEdit,
  onDelete,
  onViewDetails,
  onEnroll,
  onAttendance
}: ClassCardProps) {
  const levelConfig = CLASS_LEVELS[classItem.level as keyof typeof CLASS_LEVELS]
  const statusConfig = CLASS_STATUSES[classItem.status as keyof typeof CLASS_STATUSES]

  const availableSpots = classItem.availableSpots ??
    (classItem.maxStudents - (classItem.currentStudents || classItem.enrolledStudents || 0))

  const isFull = availableSpots <= 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {classItem.name}
          </h3>
          {classItem.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {classItem.description}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${statusConfig?.color}20`,
            color: statusConfig?.color
          }}
        >
          {statusConfig?.label}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{classItem.startTime} - {classItem.endTime}</span>
        </div>

        {/* Court */}
        {classItem.court && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{classItem.court.name}</span>
          </div>
        )}

        {/* Instructor */}
        {classItem.instructor && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{classItem.instructor.name}</span>
          </div>
        )}

        {/* Level */}
        <div className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: levelConfig?.color }}
          />
          <span>{levelConfig?.label}</span>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>
            {classItem.currentStudents || classItem.enrolledStudents || 0}/{classItem.maxStudents}
            {isFull && <span className="text-red-600 ml-1">(Llena)</span>}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>{formatCurrency(classItem.price / 100, 'MXN')}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <ButtonModern
          variant="secondary"
          size="sm"
          onClick={() => onViewDetails(classItem)}
          fullWidth
        >
          Ver Detalles
        </ButtonModern>

        {classItem.status === 'SCHEDULED' && !isFull && (
          <ButtonModern
            variant="primary"
            size="sm"
            onClick={() => onEnroll(classItem)}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Inscribir
          </ButtonModern>
        )}

        {(classItem.status === 'SCHEDULED' || classItem.status === 'IN_PROGRESS') && (
          <ButtonModern
            variant="primary"
            size="sm"
            onClick={() => onAttendance(classItem)}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Asistencia
          </ButtonModern>
        )}

        {classItem.status === 'SCHEDULED' && (
          <>
            <ButtonModern
              variant="secondary"
              size="sm"
              onClick={() => onEdit(classItem)}
            >
              <Edit className="w-4 h-4" />
            </ButtonModern>

            <ButtonModern
              variant="danger"
              size="sm"
              onClick={() => onDelete(classItem)}
            >
              <Trash2 className="w-4 h-4" />
            </ButtonModern>
          </>
        )}
      </div>
    </div>
  )
}
