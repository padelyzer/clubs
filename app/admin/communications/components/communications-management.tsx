'use client'

import { useState } from 'react'
import { 
  Mail, 
  MessageSquare, 
  Users, 
  Building2, 
  Send, 
  FileText,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit
} from 'lucide-react'

interface Club {
  id: string
  name: string
  city: string
  state: string
  email: string
  _count: {
    users: number
  }
}

interface Template {
  id: string
  name: string
  description: string
  variables: string[]
}

interface Stats {
  audiences: {
    totalUsers: number
    clubOwners: number
    clubStaff: number
    regularUsers: number
    totalClubs: number
  }
  notifications: {
    total: number
    sent: number
    failed: number
    successRate: number
  }
}

interface CommunicationsManagementProps {
  clubs: Club[]
  templates: Template[]
  stats: Stats
}

export default function CommunicationsManagement({
  clubs,
  templates,
  stats
}: CommunicationsManagementProps) {
  const [activeTab, setActiveTab] = useState('compose')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedAudience, setSelectedAudience] = useState('all_users')
  const [selectedClubs, setSelectedClubs] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')

  const tabs = [
    { id: 'compose', name: 'Redactar', icon: Edit },
    { id: 'templates', name: 'Templates', icon: FileText },
    { id: 'audience', name: 'Audiencia', icon: Target },
    { id: 'history', name: 'Historial', icon: Clock },
    { id: 'stats', name: 'Estadísticas', icon: BarChart3 }
  ]

  const audienceOptions = [
    { id: 'all_users', name: 'Todos los Usuarios', count: stats.audiences.totalUsers },
    { id: 'club_owners', name: 'Propietarios de Clubes', count: stats.audiences.clubOwners },
    { id: 'club_staff', name: 'Staff de Clubes', count: stats.audiences.clubStaff },
    { id: 'regular_users', name: 'Usuarios Regulares', count: stats.audiences.regularUsers },
    { id: 'specific_clubs', name: 'Clubes Específicos', count: 0 }
  ]

  const handleSendMessage = async () => {
    if (!message || !subject) {
      alert('Por favor completa el asunto y mensaje')
      return
    }

    try {
      const response = await fetch('/api/admin/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message,
          audience: selectedAudience,
          clubs: selectedClubs,
          template: selectedTemplate
        })
      })

      if (response.ok) {
        alert('Mensaje enviado exitosamente')
        setMessage('')
        setSubject('')
        setSelectedTemplate('')
      } else {
        alert('Error al enviar mensaje')
      }
    } catch (error) {
      alert('Error al enviar mensaje')
    }
  }

  const getEstimatedReach = () => {
    switch (selectedAudience) {
      case 'all_users':
        return stats.audiences.totalUsers
      case 'club_owners':
        return stats.audiences.clubOwners
      case 'club_staff':
        return stats.audiences.clubStaff
      case 'regular_users':
        return stats.audiences.regularUsers
      case 'specific_clubs':
        return selectedClubs.reduce((total, clubId) => {
          const club = clubs.find(c => c.id === clubId)
          return total + (club?._count.users || 0)
        }, 0)
      default:
        return 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Usuarios</span>
          </div>
          <span className="text-2xl font-bold">{stats.audiences.totalUsers.toLocaleString()}</span>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Clubes Activos</span>
          </div>
          <span className="text-2xl font-bold">{stats.audiences.totalClubs}</span>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Mensajes Enviados</span>
          </div>
          <span className="text-2xl font-bold">{stats.notifications.sent}</span>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Tasa de Éxito</span>
          </div>
          <span className="text-2xl font-bold">{stats.notifications.successRate.toFixed(1)}%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'compose' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asunto del Mensaje
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Escribe el asunto del mensaje..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={8}
                      placeholder="Escribe tu mensaje aquí..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template (Opcional)
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar template...</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audiencia
                    </label>
                    <div className="space-y-2">
                      {audienceOptions.map((option) => (
                        <label key={option.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="audience"
                            value={option.id}
                            checked={selectedAudience === option.id}
                            onChange={(e) => setSelectedAudience(e.target.value)}
                            className="text-blue-600"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{option.name}</div>
                            <div className="text-sm text-gray-500">
                              {option.count > 0 ? `${option.count} usuarios` : 'Seleccionar clubes'}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {selectedAudience === 'specific_clubs' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar Clubes
                      </label>
                      <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                        {clubs.map((club) => (
                          <label key={club.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedClubs.includes(club.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedClubs([...selectedClubs, club.id])
                                } else {
                                  setSelectedClubs(selectedClubs.filter(id => id !== club.id))
                                }
                              }}
                              className="text-blue-600"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{club.name}</div>
                              <div className="text-xs text-gray-500">
                                {club.city}, {club.state} • {club._count.users} usuarios
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Alcance Estimado</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {getEstimatedReach().toLocaleString()} usuarios
                    </div>
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={!message || !subject || getEstimatedReach() === 0}
                    className="w-full btn btn-primary flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Mensaje
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Templates Disponibles</h3>
                <button className="btn btn-primary">
                  Crear Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <div className="flex gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map((variable) => (
                        <span key={variable} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {`{${variable}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audience' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Segmentación de Audiencia</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {audienceOptions.slice(0, 4).map((option) => (
                  <div key={option.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {option.count.toLocaleString()}
                    </div>
                    <div className="font-medium">{option.name}</div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-medium mb-4">Distribución por Club</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Club</th>
                        <th className="text-left py-3 px-4 font-medium">Ubicación</th>
                        <th className="text-center py-3 px-4 font-medium">Usuarios</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {clubs.map((club) => (
                        <tr key={club.id}>
                          <td className="py-3 px-4 font-medium">{club.name}</td>
                          <td className="py-3 px-4">{club.city}, {club.state}</td>
                          <td className="py-3 px-4 text-center">{club._count.users}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{club.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Historial de Comunicaciones</h3>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Historial de comunicaciones próximamente...</p>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Estadísticas de Comunicación</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Enviados</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.notifications.sent}
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Fallidos</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.notifications.failed}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Tasa de Éxito</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.notifications.successRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}