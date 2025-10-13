import { useState, useEffect, useCallback } from 'react'
import type { Class, Instructor, Player } from '../types'

export function useClassesData(
  selectedDate: Date,
  selectedLevel: string,
  selectedInstructor: string
) {
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [courts, setCourts] = useState<any[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [classPricing, setClassPricing] = useState<any>(null)

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('date', selectedDate.toISOString().split('T')[0])

      if (selectedLevel !== 'all') {
        params.append('level', selectedLevel)
      }

      if (selectedInstructor !== 'all') {
        params.append('instructorId', selectedInstructor)
      }

      const response = await fetch(`/api/classes?${params}`)
      const data = await response.json()

      if (data.success) {
        setClasses(data.classes || [])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      setClasses([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate, selectedLevel, selectedInstructor])

  const fetchInstructors = useCallback(async () => {
    try {
      const response = await fetch('/api/instructors?active=true')
      const data = await response.json()
      if (data.success) {
        setInstructors(data.instructors || [])
      }
    } catch (error) {
      console.error('Error fetching instructors:', error)
      setInstructors([])
    }
  }, [])

  const fetchCourts = useCallback(async () => {
    try {
      const response = await fetch('/api/settings/courts')
      const data = await response.json()
      if (data.success) {
        setCourts(data.courts.filter((c: any) => c.active))
      }
    } catch (error) {
      console.error('Error fetching courts:', error)
    }
  }, [])

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch('/api/players')
      const data = await response.json()
      if (data.success) {
        setPlayers(data.players || [])
      }
    } catch (error) {
      console.error('Error fetching players:', error)
      setPlayers([])
    }
  }, [])

  const fetchClassPricing = useCallback(async () => {
    try {
      const response = await fetch('/api/settings/class-pricing')
      const data = await response.json()
      if (data.success && data.pricing) {
        setClassPricing(data.pricing)
      }
    } catch (error) {
      console.error('Error fetching class pricing:', error)
    }
  }, [])

  const fetchClassBookings = useCallback(async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/bookings`)
      const data = await response.json()

      if (data.success) {
        const classData = classes.find(c => c.id === classId)
        if (classData) {
          return {
            ...classData,
            bookings: data.bookings
          }
        }
      }
    } catch (error) {
      console.error('Error fetching class bookings:', error)
    }
    return null
  }, [classes])

  useEffect(() => {
    fetchInstructors()
    fetchCourts()
    fetchPlayers()
    fetchClassPricing()
  }, [fetchInstructors, fetchCourts, fetchPlayers, fetchClassPricing])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  return {
    loading,
    classes,
    instructors,
    courts,
    players,
    classPricing,
    fetchClasses,
    fetchClassBookings,
    setClasses
  }
}
