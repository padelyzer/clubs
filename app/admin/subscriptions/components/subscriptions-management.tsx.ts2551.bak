'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  Users, 
  DollarSign, 
  TrendingDown,
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  Eye,
  Crown,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Ban,
  MoreHorizontal,
  PauseCircle,
  Target
} from 'lucide-react'
import PlanModal from './plan-modal'

interface SubscriptionPlan {
  id: string
  name: string
  displayName: string
  description: string | null
  price: number
  currency: string
  interval: string
  features: any
  maxClubs: number | null
  maxUsers: number | null
  maxCourts: number | null
  maxBookings: number | null
  commissionRate: number
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  clubSubscriptions: Array<{
    id: string
    status: string
    club: {
      id: string
      name: string
      city: string
      state: string
      status: string
    }
  }>
  _count: {
    clubSubscriptions: number
  }
}

interface ClubSubscription {
  id: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelledAt: Date | null
  trialEndsAt: Date | null
  createdAt: Date
  club: {
    id: string
    name: string
    city: string
    state: string
    status: string
    email: string
    createdAt: Date
  }
  plan: {
    id: string
    name: string
    displayName: string
    price: number
    currency: string
  }
}

interface SubscriptionStats {
  totalSubscriptions: number
  activeSubscriptions: number
  trialingSubscriptions: number
  cancelledSubscriptions: number
  pastDueSubscriptions: number
  totalMRR: number
  churnRate: number
}

interface SubscriptionsManagementProps {
  plans: SubscriptionPlan[]
  stats: SubscriptionStats
  clubSubscriptions: ClubSubscription[]
}

export default function SubscriptionsManagement({
  plans,
  stats,
  clubSubscriptions
}: SubscriptionsManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)

  const formatPrice = (price: number, currency: string) => {
    const formattedPrice = (price / 100).toLocaleString('es-MX', {
      style: 'currency',
      currency: currency
    })
    return formattedPrice
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'PAST_DUE':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'PAUSED':
        return <PauseCircle className="w-4 h-4 text-orange-600" />
      case 'TRIALING':
        return <Clock className="w-4 h-4 text-blue-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
    switch (status) {
      case 'ACTIVE':
        return `${baseClasses} bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300`
      case 'CANCELLED':
        return `${baseClasses} bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300`
      case 'PAST_DUE':
        return `${baseClasses} bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300`
      case 'PAUSED':
        return `${baseClasses} bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300`
      case 'TRIALING':
        return `${baseClasses} bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300`
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300`
    }
  }

  const handleCreatePlan = () => {
    setEditingPlan(null)
    setIsModalOpen(true)
  }

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setIsModalOpen(true)
  }

  const handleTogglePlan = async (planId: string, currentStatus: boolean) => {
    setProcessingPlan(planId)
    try {
      const response = await fetch(`/api/admin/subscription-plans/${planId}/toggle`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Error al cambiar estado del plan')
      }

      // Refresh the page to update the data
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cambiar estado del plan')
    } finally {
      setProcessingPlan(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { 
            label: 'Total', 
            value: stats.totalSubscriptions, 
            icon: <CreditCard className="w-5 h-5" />,
            bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-300 shadow-lg shadow-blue-100'
          },
          { 
            label: 'Activas', 
            value: stats.activeSubscriptions, 
            icon: <CheckCircle className="w-5 h-5" />,
            bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100', 
            iconColor: 'text-emerald-600',
            borderColor: 'border-emerald-300 shadow-lg shadow-emerald-100'
          },
          { 
            label: 'Trial', 
            value: stats.trialingSubscriptions, 
            icon: <Clock className="w-5 h-5" />,
            bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
            iconColor: 'text-amber-600',
            borderColor: 'border-amber-300 shadow-lg shadow-amber-100'
          },
          { 
            label: 'Vencidas', 
            value: stats.pastDueSubscriptions, 
            icon: <AlertTriangle className="w-5 h-5" />,
            bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
            iconColor: 'text-red-600',
            borderColor: 'border-red-300 shadow-lg shadow-red-100'
          },
          { 
            label: 'MRR', 
            value: formatPrice(stats.totalMRR, 'MXN'), 
            icon: <DollarSign className="w-5 h-5" />,
            bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
            iconColor: 'text-green-600',
            borderColor: 'border-green-300 shadow-lg shadow-green-100'
          },
          { 
            label: 'Churn', 
            value: `${stats.churnRate}%`, 
            icon: <TrendingDown className="w-5 h-5" />,
            bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
            iconColor: 'text-purple-600',
            borderColor: 'border-purple-300 shadow-lg shadow-purple-100'
          }
        ].map((stat, index) => (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
              stat.borderColor
            } ${stat.bgColor}`}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-white/80 ${stat.iconColor}`}>
                  {stat.icon}
                </div>
                <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              </div>
              <div className="text-sm font-medium text-gray-600">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Plans */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Planes de Suscripción</h2>
          <button
            onClick={handleCreatePlan}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-emerald-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Plan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
              {/* Most popular badge for specific plans */}
              {plan.name === 'profesional' && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Popular
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{plan.displayName}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePlan(plan.id, plan.isActive)}
                    disabled={processingPlan === plan.id}
                    className={`p-1 rounded-lg transition-all duration-200 ${
                      plan.isActive 
                        ? 'text-emerald-600 hover:bg-emerald-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {plan.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(plan.price, plan.currency)}
                  <span className="text-sm font-normal text-gray-500">/{plan.interval === 'month' ? 'mes' : 'año'}</span>
                </div>
                {plan.description && (
                  <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Clubs máximos:</span>
                  <span className="font-medium">{plan.maxClubs || 'Ilimitados'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usuarios por club:</span>
                  <span className="font-medium">{plan.maxUsers || 'Ilimitados'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Canchas por club:</span>
                  <span className="font-medium">{plan.maxCourts || 'Ilimitadas'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Reservas mensuales:</span>
                  <span className="font-medium">{plan.maxBookings || 'Ilimitadas'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Comisión:</span>
                  <span className="font-medium">{plan.commissionRate / 100}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <div className="text-sm text-gray-500">Suscripciones activas</div>
                  <div className="text-lg font-bold text-gray-900">{plan._count.clubSubscriptions}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  plan.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Club Subscriptions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Suscripciones de Clubs</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wider">Club</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wider">Plan</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wider">Estado</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wider">Período</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wider">Precio</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clubSubscriptions.slice(0, 10).map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:shadow-md transition-all duration-200">
                        <Building2 className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-base">{subscription.club.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{subscription.club.email}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{subscription.club.city}, {subscription.club.state}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-5 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{subscription.plan.displayName}</div>
                      <div className="text-sm text-gray-600">{formatPrice(subscription.plan.price, subscription.plan.currency)}/mes</div>
                    </div>
                  </td>
                  
                  <td className="py-5 px-6 text-center">
                    <span className={getStatusBadge(subscription.status)}>
                      {getStatusIcon(subscription.status)}
                      {subscription.status}
                    </span>
                  </td>
                  
                  <td className="py-5 px-6 text-center">
                    <div className="text-sm">
                      <div className="font-medium text-gray-700">
                        {new Date(subscription.currentPeriodStart).toLocaleDateString('es-MX')}
                      </div>
                      <div className="text-gray-500">
                        hasta {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-MX')}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-5 px-6 text-center">
                    <span className="font-bold text-gray-900">
                      {formatPrice(subscription.plan.price, subscription.plan.currency)}
                    </span>
                  </td>
                  
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group relative">
                        <Eye className="w-4 h-4" />
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Ver detalles</span>
                      </button>
                      <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer">
                          <MoreHorizontal className="w-4 h-4" />
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-white border border-gray-100 rounded-xl w-52">
                          <li>
                            <button className="flex items-center gap-3 px-4 py-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">Renovar</span>
                            </button>
                          </li>
                          <li>
                            <button className="flex items-center gap-3 px-4 py-2 text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200">
                              <PauseCircle className="w-4 h-4" />
                              <span className="font-medium">Pausar</span>
                            </button>
                          </li>
                          <li>
                            <button className="flex items-center gap-3 px-4 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200">
                              <XCircle className="w-4 h-4" />
                              <span className="font-medium">Cancelar</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clubSubscriptions.length > 10 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Ver todas las suscripciones ({clubSubscriptions.length})
            </button>
          </div>
        )}
      </div>

      {/* Plan Modal */}
      {isModalOpen && (
        <PlanModal
          plan={editingPlan}
          onClose={() => {
            setIsModalOpen(false)
            setEditingPlan(null)
          }}
          onSave={() => {
            setIsModalOpen(false)
            setEditingPlan(null)
            // Refresh the page to update the data
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}