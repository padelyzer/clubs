'use client'

import Link from 'next/link'
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  Mail, 
  Settings, 
  BarChart3, 
  HeadphonesIcon 
} from 'lucide-react'

const quickActions = [
  {
    name: 'Aprobar Clubes',
    href: '/admin/clubs?status=pending',
    icon: Building2,
    description: 'Revisar clubes pendientes',
    color: 'blue'
  },
  {
    name: 'Gestionar Usuarios',
    href: '/admin/users',
    icon: Users,
    description: 'Administrar usuarios',
    color: 'green'
  },
  {
    name: 'Monitor Reservas',
    href: '/admin/bookings',
    icon: Calendar,
    description: 'Ver todas las reservas',
    color: 'purple'
  },
  {
    name: 'Finanzas',
    href: '/admin/finance',
    icon: DollarSign,
    description: 'Ingresos y comisiones',
    color: 'orange'
  },
  {
    name: 'Comunicación',
    href: '/admin/communications',
    icon: Mail,
    description: 'Enviar notificaciones',
    color: 'red'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Reportes detallados',
    color: 'indigo'
  },
  {
    name: 'Soporte',
    href: '/admin/support',
    icon: HeadphonesIcon,
    description: 'Herramientas de soporte',
    color: 'pink'
  },
  {
    name: 'Configuración',
    href: '/admin/settings',
    icon: Settings,
    description: 'Ajustes del sistema',
    color: 'gray'
  }
]

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-6">Acciones Rápidas</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          
          return (
            <Link
              key={action.name}
              href={action.href}
              className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${action.color}-50 rounded-lg group-hover:bg-${action.color}-100 transition-colors`}>
                  <Icon className={`w-4 h-4 text-${action.color}-600`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                    {action.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {action.description}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}