'use client'

import React from 'react'
import { Phone, Mail, DollarSign, Award, Edit, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import styles from './InstructorCard.module.css'

interface InstructorCardProps {
  instructor: any
  paymentTypes: Record<string, string>
  formatCurrency: (amount: number) => string
  handleToggleActive: (instructor: any) => void
  handleEdit: (instructor: any) => void
  handleDelete: (instructor: any) => void
}

export default function InstructorCard({
  instructor,
  paymentTypes,
  formatCurrency,
  handleToggleActive,
  handleEdit,
  handleDelete
}: InstructorCardProps) {
  return (
    <div className={styles.instructorCard}>
      <div className={styles.cardContent}>
        <div className={styles.mainContent}>
          {/* Header */}
          <div className={styles.header}>
            <h3 className={styles.instructorName}>
              {instructor.name}
            </h3>
            <span className={`${styles.statusBadge} ${instructor.active ? styles.activeStatus : styles.inactiveStatus}`}>
              {instructor.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          
          {/* Contact & Payment Info */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <Phone size={16} className={styles.infoIcon} />
              <span className={styles.infoText}>{instructor.phone}</span>
            </div>
            
            {instructor.email && (
              <div className={styles.infoItem}>
                <Mail size={16} className={styles.infoIcon} />
                <span className={styles.infoText}>{instructor.email}</span>
              </div>
            )}
            
            <div className={styles.infoItem}>
              <DollarSign size={16} className={styles.infoIcon} />
              <span className={styles.infoText}>
                {paymentTypes[instructor.paymentType]}
                {instructor.paymentType === 'HOURLY' && ` - ${formatCurrency(instructor.hourlyRate / 100)}/hr`}
                {instructor.paymentType === 'FIXED' && ` - ${formatCurrency(instructor.fixedSalary / 100)}/mes`}
                {instructor.paymentType === 'COMMISSION' && ` - ${instructor.commissionPercent}%`}
                {instructor.paymentType === 'MIXED' && ` - ${formatCurrency(instructor.fixedSalary / 100)}/mes + ${instructor.commissionPercent}%`}
              </span>
            </div>
            
            <div className={styles.infoItem}>
              <Award size={16} className={styles.infoIcon} />
              <span className={styles.infoText}>
                {instructor.totalClasses || 0} clases impartidas
              </span>
            </div>
          </div>
          
          {/* Bio */}
          {instructor.bio && (
            <p className={styles.bio}>
              {instructor.bio}
            </p>
          )}
          
          {/* Specialties */}
          {instructor.specialties.length > 0 && (
            <div className={styles.specialtiesContainer}>
              {instructor.specialties.map((specialty: string, index: number) => (
                <span key={index} className={styles.specialtyBadge}>
                  {specialty}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={() => handleToggleActive(instructor)}
            className={styles.actionButton}
            title={instructor.active ? 'Desactivar' : 'Activar'}
          >
            {instructor.active ? <XCircle size={18} style={{ color: '#ef4444' }} /> : <CheckCircle size={18} style={{ color: '#16a34a' }} />}
          </button>
          <button
            onClick={() => handleEdit(instructor)}
            className={styles.actionButton}
            title="Editar"
          >
            <Edit size={18} style={{ color: '#516640' }} />
          </button>
          {instructor.totalClasses === 0 && (
            <button
              onClick={() => handleDelete(instructor.id)}
              className={`${styles.actionButton} ${styles.deleteButton}`}
              title="Eliminar"
            >
              <Trash2 size={18} style={{ color: '#ef4444' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}