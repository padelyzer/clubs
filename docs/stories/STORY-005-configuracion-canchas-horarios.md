# STORY-005: Configuración de Canchas y Horarios

## 🎯 Objetivo
Crear dashboard para que club owners (recién aprobados) configuren sus canchas, horarios de operación, y precios. Esto completa el setup inicial antes de recibir reservas.

## 📋 Contexto para Claude Code
Después de que Super Admin aprueba un club, el owner puede login y debe completar la configuración de su club. Este es el primer paso del onboarding en el dashboard.

## ✅ Criterios de Aceptación
- [ ] Dashboard inicial `/dashboard` para club owners
- [ ] Setup wizard o página de configuración inicial
- [ ] CRUD de canchas (nombre, tipo, orden)
- [ ] Configuración horarios por día de semana
- [ ] Configuración matriz de precios (día/hora)
- [ ] Vista previa del widget embebible
- [ ] Estado "configuración completa" para empezar a recibir reservas

## 📝 Instrucciones para Claude Code

### PASO 1: Layout del Dashboard Club
```tsx
// app/(web)/(auth)/layout.tsx
import { requireStaffAuth } from '@/lib/auth/auth'
import { prisma } from '@/lib/config/prisma'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardHeader } from './dashboard-header'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireStaffAuth()

  // Get club info
  const club = await prisma.club.findUnique({
    where: { id: session.user.clubId },
    include: {
      courts: { orderBy: { order: 'asc' } },
      _count: {
        select: {
          bookings: true,
          users: true,
        }
      }
    }
  })

  if (!club) {
    redirect('/login')
  }

  // Check if club needs initial setup
  const needsSetup = !club.active || club.courts.length === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader club={club} user={session.user} />
      
      <div className="flex">
        <DashboardSidebar club={club} needsSetup={needsSetup} />
        
        <main className="flex-1 p-6">
          {needsSetup && !window.location.pathname.includes('/setup') ? (
            <SetupRequired clubSlug={club.slug} />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  )
}

function SetupRequired({ clubSlug }: { clubSlug: string }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-center">
        <span className="text-2xl mr-3">⚠️</span>
        <div>
          <h3 className="font-semibold text-yellow-800">
            Configuración Requerida
          </h3>
          <p className="text-yellow-700 mt-1">
            Necesitas completar la configuración de tu club antes de recibir reservas.
          </p>
          <a 
            href="/dashboard/setup"
            className="inline-block mt-3 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Completar Configuración
          </a>
        </div>
      </div>
    </div>
  )
}
```

### PASO 2: Sidebar de Navegación
```tsx
// app/(web)/(auth)/dashboard-sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DashboardSidebar({ 
  club, 
  needsSetup 
}: { 
  club: any
  needsSetup: boolean 
}) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Reservas', href: '/dashboard/bookings', icon: '📅', disabled: needsSetup },
    { name: 'Canchas', href: '/dashboard/courts', icon: '🏟️' },
    { name: 'Horarios', href: '/dashboard/schedule', icon: '🕐' },
    { name: 'Precios', href: '/dashboard/pricing', icon: '💰' },
    { name: 'Widget', href: '/dashboard/widget', icon: '🔧', disabled: needsSetup },
    { name: 'Clientes', href: '/dashboard/customers', icon: '👥', disabled: needsSetup },
  ]

  return (
    <div className="w-64 bg-white shadow-sm">
      <div className="p-6">
        <div className="flex items-center">
          <span className="text-2xl mr-2">🎾</span>
          <div>
            <h2 className="font-semibold text-gray-900">{club.name}</h2>
            <p className="text-sm text-gray-500">{club.city}</p>
          </div>
        </div>
        
        {!club.active && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Estado:</strong> Configuración en progreso
            </p>
          </div>
        )}
      </div>

      <nav className="px-6 pb-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const isDisabled = item.disabled && needsSetup

            return (
              <li key={item.name}>
                {isDisabled ? (
                  <div className="flex items-center px-3 py-2 text-gray-400 cursor-not-allowed">
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                    <span className="ml-auto text-xs">🔒</span>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
```

### PASO 3: Header del Dashboard
```tsx
// app/(web)/(auth)/dashboard-header.tsx
import { signOut } from 'next-auth/react'

export function DashboardHeader({ club, user }: { club: any, user: any }) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Panel de Control
            </h1>
            <p className="text-sm text-gray-600">
              Gestiona tu club de padel
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Upgrade CTA */}
            <a
              href="https://pro.padelyzer.com"
              target="_blank"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              ⬆️ Upgrade a Pro
            </a>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="text-gray-400 hover:text-gray-600"
                title="Cerrar sesión"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
```

### PASO 4: Setup Wizard Principal
```tsx
// app/(web)/(auth)/dashboard/setup/page.tsx
import { requireStaffAuth } from '@/lib/auth/auth'
import { prisma } from '@/lib/config/prisma'
import { SetupWizard } from './setup-wizard'

export default async function SetupPage() {
  const session = await requireStaffAuth()

  const club = await prisma.club.findUnique({
    where: { id: session.user.clubId },
    include: {
      courts: { orderBy: { order: 'asc' } },
      schedules: { orderBy: { dayOfWeek: 'asc' } },
      pricing: true,
    }
  })

  const setupStatus = {
    courts: club.courts.length > 0,
    schedules: club.schedules.length > 0,
    pricing: club.pricing.length > 0,
  }

  const isComplete = Object.values(setupStatus).every(Boolean)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Configuración Inicial
        </h1>
        <p className="text-gray-600 mt-2">
          Completa estos pasos para empezar a recibir reservas
        </p>
      </div>

      <SetupWizard 
        club={club} 
        setupStatus={setupStatus}
        isComplete={isComplete}
      />
    </div>
  )
}
```

### PASO 5: Wizard de Configuración
```tsx
// app/(web)/(auth)/dashboard/setup/setup-wizard.tsx
'use client'

import { useState } from 'react'
import { CourtsSetup } from './steps/courts-setup'
import { ScheduleSetup } from './steps/schedule-setup'
import { PricingSetup } from './steps/pricing-setup'
import { CompleteSetup } from './steps/complete-setup'

export function SetupWizard({ club, setupStatus, isComplete }) {
  const [activeStep, setActiveStep] = useState(
    !setupStatus.courts ? 0 :
    !setupStatus.schedules ? 1 :
    !setupStatus.pricing ? 2 : 3
  )

  const steps = [
    {
      id: 0,
      title: 'Canchas',
      description: 'Configura tus canchas',
      completed: setupStatus.courts,
      component: CourtsSetup
    },
    {
      id: 1,
      title: 'Horarios',
      description: 'Define horarios de operación',
      completed: setupStatus.schedules,
      component: ScheduleSetup
    },
    {
      id: 2,
      title: 'Precios',
      description: 'Establece precios por hora',
      completed: setupStatus.pricing,
      component: PricingSetup
    },
    {
      id: 3,
      title: 'Completar',
      description: 'Activar tu club',
      completed: isComplete,
      component: CompleteSetup
    }
  ]

  const currentStep = steps[activeStep]
  const Component = currentStep.component

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Progress Steps */}
      <div className="border-b">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setActiveStep(index)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm ${
                    step.completed
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : index === activeStep
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}
                >
                  {step.completed ? '✓' : index + 1}
                </button>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    index === activeStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="mx-6 w-8 h-0.5 bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        <Component 
          club={club}
          onNext={() => setActiveStep(Math.min(activeStep + 1, steps.length - 1))}
          onPrevious={() => setActiveStep(Math.max(activeStep - 1, 0))}
          isLast={activeStep === steps.length - 1}
        />
      </div>
    </div>
  )
}
```

### PASO 6: Step 1 - Configuración de Canchas
```tsx
// app/(web)/(auth)/dashboard/setup/steps/courts-setup.tsx
'use client'

import { useState } from 'react'
import { updateCourts } from '../actions'

export function CourtsSetup({ club, onNext }) {
  const [courts, setCourts] = useState(
    club.courts.length > 0 ? club.courts : [
      { name: 'Cancha 1', type: 'PADEL', indoor: false }
    ]
  )
  const [loading, setLoading] = useState(false)

  function addCourt() {
    setCourts([...courts, {
      name: `Cancha ${courts.length + 1}`,
      type: 'PADEL',
      indoor: false
    }])
  }

  function removeCourt(index) {
    if (courts.length > 1) {
      setCourts(courts.filter((_, i) => i !== index))
    }
  }

  function updateCourt(index, field, value) {
    const updated = courts.map((court, i) => 
      i === index ? { ...court, [field]: value } : court
    )
    setCourts(updated)
  }

  async function handleSave() {
    setLoading(true)
    try {
      await updateCourts(club.id, courts)
      onNext()
    } catch (error) {
      alert('Error al guardar canchas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Configura tus Canchas
        </h3>
        <p className="text-gray-600 mt-1">
          Define las canchas disponibles en tu club
        </p>
      </div>

      <div className="space-y-4">
        {courts.map((court, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Cancha {index + 1}</h4>
              {courts.length > 1 && (
                <button
                  onClick={() => removeCourt(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  🗑️ Eliminar
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={court.name}
                  onChange={(e) => updateCourt(index, 'name', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ej: Cancha Central"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={court.type}
                  onChange={(e) => updateCourt(index, 'type', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="PADEL">Pádel</option>
                  <option value="TENIS">Tenis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <select
                  value={court.indoor}
                  onChange={(e) => updateCourt(index, 'indoor', e.target.value === 'true')}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="false">Exterior</option>
                  <option value="true">Interior</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={addCourt}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          ➕ Agregar Cancha
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar y Continuar'}
        </button>
      </div>
    </div>
  )
}
```

### PASO 7: Server Actions para Setup
```typescript
// app/(web)/(auth)/dashboard/setup/actions.ts
'use server'

import { prisma } from '@/lib/config/prisma'
import { requireStaffAuth } from '@/lib/auth/auth'
import { revalidatePath } from 'next/cache'

export async function updateCourts(clubId: string, courts: any[]) {
  const session = await requireStaffAuth()
  
  if (session.user.clubId !== clubId) {
    throw new Error('Unauthorized')
  }

  // Delete existing courts
  await prisma.court.deleteMany({
    where: { clubId }
  })

  // Create new courts
  await prisma.court.createMany({
    data: courts.map((court, index) => ({
      clubId,
      name: court.name,
      type: court.type,
      indoor: court.indoor,
      order: index + 1,
      active: true,
    }))
  })

  revalidatePath('/dashboard/setup')
}

export async function updateSchedule(clubId: string, schedules: any[]) {
  const session = await requireStaffAuth()
  
  if (session.user.clubId !== clubId) {
    throw new Error('Unauthorized')
  }

  // Delete existing schedules
  await prisma.schedule.deleteMany({
    where: { clubId }
  })

  // Create new schedules
  await prisma.schedule.createMany({
    data: schedules.map(schedule => ({
      clubId,
      dayOfWeek: schedule.dayOfWeek,
      openTime: schedule.openTime,
      closeTime: schedule.closeTime,
    }))
  })

  revalidatePath('/dashboard/setup')
}

export async function updatePricing(clubId: string, pricing: any[]) {
  const session = await requireStaffAuth()
  
  if (session.user.clubId !== clubId) {
    throw new Error('Unauthorized')
  }

  // Delete existing pricing
  await prisma.pricing.deleteMany({
    where: { clubId }
  })

  // Create new pricing
  await prisma.pricing.createMany({
    data: pricing.map(price => ({
      clubId,
      dayOfWeek: price.dayOfWeek,
      startTime: price.startTime,
      endTime: price.endTime,
      price: price.price,
    }))
  })

  revalidatePath('/dashboard/setup')
}

export async function completeSetup(clubId: string) {
  const session = await requireStaffAuth()
  
  if (session.user.clubId !== clubId) {
    throw new Error('Unauthorized')
  }

  await prisma.club.update({
    where: { id: clubId },
    data: { 
      active: true,
    }
  })

  revalidatePath('/dashboard')
}
```

## 🔍 Verificación
```bash
# Claude, verificar el setup flow:
npm run dev

# Probar como club owner:
# 1. Login con owner@padeldemo.mx
# 2. Debería redirigir a /dashboard/setup
# 3. Completar wizard paso a paso
# 4. Verificar que club queda activo
```

## ⚠️ NO HACER
- NO agregar drag & drop para reordenar canchas
- NO implementar upload de fotos de canchas
- NO crear precios complejos (happy hour, etc.)
- NO agregar configuración de amenidades

## Definition of Done
- [ ] Setup wizard con 4 pasos funcional
- [ ] CRUD básico de canchas
- [ ] Configuración horarios por día
- [ ] Matriz precios simple (día/hora/precio)
- [ ] Club se activa al completar setup
- [ ] Dashboard muestra estado de configuración
- [ ] CTA visible para upgrade a Pro