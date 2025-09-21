# STORY-003: Super Admin Panel - Gestión de Clubes

## 🎯 Objetivo
Crear panel de Super Admin para gestionar clubes, aprobar/rechazar nuevas solicitudes, y tener visibilidad total de la plataforma Padelyzer.

## 📋 Contexto para Claude Code
Solo el equipo Padelyzer (SUPER_ADMIN) puede aprobar nuevos clubes y gestionar la plataforma. Esto nos da control total del marketplace y calidad de clubes.

## ✅ Criterios de Aceptación
- [ ] Dashboard `/super-admin` protegido para SUPER_ADMIN únicamente
- [ ] Lista de clubes con status: PENDING, APPROVED, SUSPENDED, REJECTED
- [ ] Aprobar/Rechazar clubes pendientes con un click
- [ ] Ver detalles completos de cada club
- [ ] Búsqueda y filtros de clubes
- [ ] Métricas básicas de la plataforma

## 📝 Instrucciones para Claude Code

### PASO 1: Layout del Super Admin
```tsx
// app/(web)/super-admin/layout.tsx
import { requireSuperAdmin } from '@/lib/auth/auth'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSuperAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🎾 Padelyzer Admin
              </h1>
              <p className="text-gray-600">Panel de administración</p>
            </div>
            <nav className="flex space-x-4">
              <a 
                href="/super-admin" 
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </a>
              <a 
                href="/super-admin/clubs" 
                className="text-gray-600 hover:text-gray-900"
              >
                Clubes
              </a>
              <a 
                href="/super-admin/users" 
                className="text-gray-600 hover:text-gray-900"
              >
                Usuarios
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
```

### PASO 2: Dashboard Principal
```tsx
// app/(web)/super-admin/page.tsx
import { prisma } from '@/lib/config/prisma'
import { requireSuperAdmin } from '@/lib/auth/auth'

export default async function SuperAdminDashboard() {
  await requireSuperAdmin()

  // Get platform metrics
  const [
    totalClubs,
    pendingClubs, 
    approvedClubs,
    totalUsers,
    totalBookings
  ] = await Promise.all([
    prisma.club.count(),
    prisma.club.count({ where: { status: 'PENDING' } }),
    prisma.club.count({ where: { status: 'APPROVED' } }),
    prisma.user.count(),
    prisma.booking.count()
  ])

  const recentClubs = await prisma.club.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      city: true,
      status: true,
      createdAt: true,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-gray-600">Resumen de la plataforma Padelyzer</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <MetricCard
          title="Total Clubes"
          value={totalClubs}
          icon="🏟️"
          color="blue"
        />
        <MetricCard
          title="Pendientes"
          value={pendingClubs}
          icon="⏳"
          color="yellow"
          href="/super-admin/clubs?status=pending"
        />
        <MetricCard
          title="Aprobados"
          value={approvedClubs}
          icon="✅"
          color="green"
        />
        <MetricCard
          title="Usuarios"
          value={totalUsers}
          icon="👥"
          color="purple"
        />
        <MetricCard
          title="Reservas"
          value={totalBookings}
          icon="📅"
          color="indigo"
        />
      </div>

      {/* Recent Clubs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Clubes Recientes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentClubs.map(club => (
              <div key={club.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{club.name}</h4>
                  <p className="text-sm text-gray-600">{club.city}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={club.status} />
                  <span className="text-sm text-gray-500">
                    {new Date(club.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  icon, 
  color, 
  href 
}: { 
  title: string
  value: number
  icon: string
  color: string
  href?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  }

  const card = (
    <div className={`p-6 rounded-lg ${colorClasses[color]} ${href ? 'cursor-pointer hover:opacity-80' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )

  if (href) {
    return <a href={href}>{card}</a>
  }

  return card
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    REJECTED: 'bg-gray-100 text-gray-800',
  }

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[status]}`}>
      {status}
    </span>
  )
}
```

### PASO 3: Gestión de Clubes
```tsx
// app/(web)/super-admin/clubs/page.tsx
import { prisma } from '@/lib/config/prisma'
import { requireSuperAdmin } from '@/lib/auth/auth'
import { ClubActions } from './club-actions'

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string }
}) {
  await requireSuperAdmin()

  const { status, search } = searchParams

  // Build filter conditions
  const where = {
    ...(status && status !== 'all' && { status: status.toUpperCase() }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    }),
  }

  const clubs = await prisma.club.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          courts: true,
          bookings: true,
          users: true,
        }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestión de Clubes</h2>
          <p className="text-gray-600">Administrar todos los clubes de la plataforma</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, email o ciudad..."
              defaultValue={search}
              name="search"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <select 
            name="status" 
            defaultValue={status || 'all'}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="suspended">Suspendidos</option>
            <option value="rejected">Rechazados</option>
          </select>
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Clubs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Club
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Canchas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Reservas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Creado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clubs.map(club => (
              <tr key={club.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{club.name}</div>
                    <div className="text-sm text-gray-500">{club.email}</div>
                    <div className="text-sm text-gray-500">{club.city}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={club.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {club._count.courts}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {club._count.bookings}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(club.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <ClubActions club={club} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clubs.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No se encontraron clubes
          </div>
        )}
      </div>
    </div>
  )
}
```

### PASO 4: Acciones de Club (Server Actions)
```tsx
// app/(web)/super-admin/clubs/club-actions.tsx
'use client'

import { useState } from 'react'
import { approveClub, rejectClub, suspendClub } from './actions'

export function ClubActions({ club }: { club: any }) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleAction(action: string) {
    setLoading(action)
    
    try {
      switch (action) {
        case 'approve':
          await approveClub(club.id)
          break
        case 'reject':
          await rejectClub(club.id)
          break
        case 'suspend':
          await suspendClub(club.id)
          break
      }
      
      // Refresh the page
      window.location.reload()
    } catch (error) {
      alert('Error al realizar la acción')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex space-x-2">
      {club.status === 'PENDING' && (
        <>
          <button
            onClick={() => handleAction('approve')}
            disabled={loading === 'approve'}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading === 'approve' ? '...' : '✅ Aprobar'}
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={loading === 'reject'}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading === 'reject' ? '...' : '❌ Rechazar'}
          </button>
        </>
      )}
      
      {club.status === 'APPROVED' && (
        <button
          onClick={() => handleAction('suspend')}
          disabled={loading === 'suspend'}
          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {loading === 'suspend' ? '...' : '⏸️ Suspender'}
        </button>
      )}
      
      <a
        href={`/super-admin/clubs/${club.id}`}
        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        👁️ Ver
      </a>
    </div>
  )
}
```

```typescript
// app/(web)/super-admin/clubs/actions.ts
'use server'

import { prisma } from '@/lib/config/prisma'
import { requireSuperAdmin } from '@/lib/auth/auth'
import { revalidatePath } from 'next/cache'

export async function approveClub(clubId: string) {
  const session = await requireSuperAdmin()
  
  await prisma.club.update({
    where: { id: clubId },
    data: {
      status: 'APPROVED',
      active: true,
      approvedAt: new Date(),
      approvedBy: session.user.id,
    }
  })
  
  revalidatePath('/super-admin/clubs')
}

export async function rejectClub(clubId: string) {
  const session = await requireSuperAdmin()
  
  await prisma.club.update({
    where: { id: clubId },
    data: {
      status: 'REJECTED',
      active: false,
    }
  })
  
  revalidatePath('/super-admin/clubs')
}

export async function suspendClub(clubId: string) {
  const session = await requireSuperAdmin()
  
  await prisma.club.update({
    where: { id: clubId },
    data: {
      status: 'SUSPENDED',
      active: false,
    }
  })
  
  revalidatePath('/super-admin/clubs')
}
```

### PASO 5: Actualizar estructura de carpetas
```bash
# Claude, crea esta estructura:
mkdir -p app/\(web\)/super-admin/{clubs,users}
```

## 🔍 Verificación
```bash
# Claude, verificar que el Super Admin funciona:
npm run dev

# Luego probar:
# 1. Login con admin@padelyzer.com / password123
# 2. Ir a http://localhost:3000/super-admin
# 3. Aprobar/rechazar clubes
# 4. Verificar que solo SUPER_ADMIN puede acceder
```

## ⚠️ NO HACER
- NO crear CRUD completo de clubes aún
- NO agregar upload de imágenes 
- NO implementar emails de notificación
- NO agregar analytics complejos

## Definition of Done
- [ ] Panel `/super-admin` funcionando
- [ ] Lista de clubes con filtros
- [ ] Aprobar/Rechazar clubes con 1 click
- [ ] Métricas básicas en dashboard
- [ ] Solo SUPER_ADMIN puede acceder
- [ ] Status de clubes se actualiza correctamente