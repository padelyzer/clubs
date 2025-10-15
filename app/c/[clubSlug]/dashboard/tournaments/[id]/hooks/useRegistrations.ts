/**
 * useRegistrations Hook
 * Extracted from page.tsx (lines 203-343)
 * Handles team registrations CRUD operations
 */

import { useState } from 'react'
import type { Registration, TeamFormData } from '../types/tournament'

export function useRegistrations(tournamentId: string) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Registration | null>(null)
  const [teamForm, setTeamForm] = useState<TeamFormData>({
    teamName: '',
    player1Name: '',
    player1Email: '',
    player1Phone: '',
    player2Name: '',
    player2Email: '',
    player2Phone: '',
    category: '',
    modality: 'M',
    paymentStatus: 'pending'
  })
  const [saving, setSaving] = useState(false)

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/registrations`)
      if (!response.ok) {
        throw new Error('Error al cargar inscripciones')
      }
      const data = await response.json()
      setRegistrations(data.registrations || [])
    } catch (err) {
      console.error('Error fetching registrations:', err)
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTeam = async () => {
    setSaving(true)
    try {
      // TODO: Implementar llamada a API
      const newTeam = {
        id: Date.now().toString(),
        teamName: teamForm.teamName,
        player1Name: teamForm.player1Name,
        player1Email: teamForm.player1Email,
        player1Phone: teamForm.player1Phone,
        player2Name: teamForm.player2Name,
        player2Email: teamForm.player2Email,
        player2Phone: teamForm.player2Phone,
        category: teamForm.category,
        modality: teamForm.modality as 'M' | 'F' | 'X',
        paymentStatus: teamForm.paymentStatus as 'pending' | 'completed',
        confirmed: teamForm.paymentStatus === 'completed',
        checkedIn: false
      }

      // Agregar temporalmente al estado
      setRegistrations(prev => [...prev, newTeam])

      // Cerrar modal y limpiar formulario
      setShowAddModal(false)
      setTeamForm({
        teamName: '',
        player1Name: '',
        player1Email: '',
        player1Phone: '',
        player2Name: '',
        player2Email: '',
        player2Phone: '',
        category: '',
        modality: 'M',
        paymentStatus: 'pending'
      })
    } catch (error) {
      console.error('Error saving team:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditTeam = (team: Registration) => {
    setSelectedTeam(team)
    setTeamForm({
      teamName: team.teamName || '',
      player1Name: team.player1Name || '',
      player1Email: team.player1Email || '',
      player1Phone: team.player1Phone || '',
      player2Name: team.player2Name || '',
      player2Email: team.player2Email || '',
      player2Phone: team.player2Phone || '',
      category: team.category || '',
      modality: team.modality || 'M',
      paymentStatus: team.paymentStatus || 'pending'
    })
    setShowEditModal(true)
  }

  const handleUpdateTeam = async () => {
    setSaving(true)
    try {
      // TODO: Implementar llamada a API
      const updatedTeam = {
        ...selectedTeam!,
        ...teamForm,
        modality: teamForm.modality as 'M' | 'F' | 'X',
        paymentStatus: teamForm.paymentStatus as 'pending' | 'completed',
        confirmed: teamForm.paymentStatus === 'completed'
      }

      // Actualizar temporalmente en el estado
      setRegistrations(prev =>
        prev.map(t => t.id === selectedTeam!.id ? updatedTeam : t)
      )

      // Cerrar modal y limpiar
      setShowEditModal(false)
      setSelectedTeam(null)
      setTeamForm({
        teamName: '',
        player1Name: '',
        player1Email: '',
        player1Phone: '',
        player2Name: '',
        player2Email: '',
        player2Phone: '',
        category: '',
        modality: 'M',
        paymentStatus: 'pending'
      })
    } catch (error) {
      console.error('Error updating team:', error)
    } finally {
      setSaving(false)
    }
  }

  return {
    registrations,
    loading,
    searchTerm,
    setSearchTerm,
    showAddModal,
    setShowAddModal,
    showEditModal,
    setShowEditModal,
    teamForm,
    setTeamForm,
    saving,
    fetchRegistrations,
    handleSaveTeam,
    handleEditTeam,
    handleUpdateTeam
  }
}
