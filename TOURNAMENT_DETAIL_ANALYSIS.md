# Análisis Completo: tournaments/[id]/page.tsx
**Fecha**: 15 de Octubre, 2025
**Archivo**: 4,198 líneas
**Objetivo**: Refactorizar de 4,198 → ~150 líneas

---

## 📊 RESUMEN EJECUTIVO

### Estadísticas del Archivo
```
Total de líneas: 4,198
- Imports & Types: ~100 líneas
- useState declarations: ~100 líneas (20+ estados)
- useEffect & handlers: ~200 líneas
- Inline components: ~200 líneas
- Early returns (loading/error): ~100 líneas
- Main content: ~3,500 líneas

Complejidad:
- 20+ useState
- 6 vistas principales (overview, registrations, schedule, kanban, capture, tv)
- 2 modales (Add Team, Edit Team)
- 1 sidebar complejo con categorías expandibles
- 1 sistema de polling (30s)
```

### Componentes Identificados para Extracción
```
Total: 25 componentes
- 10 componentes de UI (simple, sin estado)
- 8 componentes con estado local
- 5 vistas principales
- 2 hooks personalizados
```

---

## 🗺️ MAPA DETALLADO DEL ARCHIVO

### SECCIÓN 1: Setup (líneas 1-492)
**Total**: ~492 líneas

#### 1.1 Imports (líneas 1-50)
```typescript
'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
// 30+ imports de lucide-react icons
import { CardModern, CardModernHeader, ... } from '@/components/design-system/CardModern'
import { Modal } from '@/components/ui/modal'
import { colors } from '@/lib/design-system/colors'
```

**Extracción**: NO (mantener en archivo principal)

---

#### 1.2 Type Definitions (líneas 50-100)
```typescript
type TournamentData = {
  tournament: any
  categories: any[]
  matches: {
    upcoming: any[]
    inProgress: any[]
    completed: any[]
  }
  stats: {
    totalTeams: number
    totalMatches: number
    completedMatches: number
    pendingMatches: number
    inProgressMatches: number
    todayMatches: number
  }
}
```

**Extracción**: SÍ → `types/tournament.ts` (nueva carpeta types/)

---

#### 1.3 State Declarations (líneas 100-200)
**Total**: ~100 líneas con 25+ useState

**Estados de Vista:**
```typescript
const [activeView, setActiveView] = useState<'overview' | 'registrations' | 'schedule' | 'kanban' | 'capture' | 'tv'>('overview')
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
const [categoriesExpanded, setCategoriesExpanded] = useState(true)
const [masculineExpanded, setMasculineExpanded] = useState(true)
const [feminineExpanded, setFeminineExpanded] = useState(true)
const [mixedExpanded, setMixedExpanded] = useState(true)
const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
```

**Estados de Datos:**
```typescript
const [loading, setLoading] = useState(true)
const [tournamentData, setTournamentData] = useState<TournamentData | null>(null)
const [error, setError] = useState<string | null>(null)
const [registrations, setRegistrations] = useState<any[]>([])
const [loadingRegistrations, setLoadingRegistrations] = useState(false)
const [searchTerm, setSearchTerm] = useState('')
```

**Estados de Modales:**
```typescript
const [showAddTeamModal, setShowAddTeamModal] = useState(false)
const [showEditTeamModal, setShowEditTeamModal] = useState(false)
const [selectedTeam, setSelectedTeam] = useState<any>(null)
const [savingTeam, setSavingTeam] = useState(false)
```

**Estado de Formulario:**
```typescript
const [teamForm, setTeamForm] = useState({
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
```

**Estados de Filtros:**
```typescript
// Schedule view
const [selectedDate, setSelectedDate] = useState<Date>(new Date())
const [scheduleFilter, setScheduleFilter] = useState<'all' | 'pending' | 'completed' | 'in_progress'>('all')
const [scheduleCategoryFilter, setScheduleCategoryFilter] = useState<string>('all')

// Kanban view
const [kanbanSelectedDate, setKanbanSelectedDate] = useState<Date>(new Date())
const [kanbanCategoryFilter, setKanbanCategoryFilter] = useState<string>('all')
const [kanbanStatusFilter, setKanbanStatusFilter] = useState<string>('all')

// Capture view
const [captureCategoryFilter, setCaptureCategoryFilter] = useState<string>('all')
const [captureStatusFilter, setCaptureStatusFilter] = useState<'pending' | 'all' | 'completed'>('pending')
const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())

// Overview
const [categoryGenderFilter, setCategoryGenderFilter] = useState<'all' | 'M' | 'F' | 'X'>('all')

// Organization
const [isOrganizing, setIsOrganizing] = useState(false)
const [organizationResult, setOrganizationResult] = useState<{ success: boolean; message: string } | null>(null)
```

**Extracción**: SÍ → Dividir en hooks personalizados

---

#### 1.4 Data Fetching (líneas 200-350)
**Total**: ~150 líneas

```typescript
// Polling con 30s interval
useEffect(() => {
  fetchTournamentData()
  const interval = setInterval(fetchTournamentData, 30000)
  return () => clearInterval(interval)
}, [tournamentId])

const fetchTournamentData = async () => {
  try {
    setLoading(true)
    const response = await fetch(`/api/tournaments-v2/${tournamentId}`)
    const data = await response.json()
    setTournamentData(data)
    setError(null)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error desconocido')
  } finally {
    setLoading(false)
  }
}

const fetchRegistrations = async () => {
  setLoadingRegistrations(true)
  try {
    const response = await fetch(`/api/tournaments/${tournamentId}/registrations`)
    const data = await response.json()
    setRegistrations(data.registrations || [])
  } catch (err) {
    console.error('Error fetching registrations:', err)
    setRegistrations([])
  } finally {
    setLoadingRegistrations(false)
  }
}
```

**Extracción**: SÍ → `hooks/useTournamentData.ts`

---

#### 1.5 Team Handlers (líneas 350-450)
**Total**: ~100 líneas

```typescript
const handleSaveTeam = async () => {
  // Validación + POST request
  // ~40 líneas
}

const handleEditTeam = (team: any) => {
  setSelectedTeam(team)
  setTeamForm({
    teamName: team.teamName,
    player1Name: team.player1Name,
    // ... resto de campos
  })
  setShowEditTeamModal(true)
}

const handleUpdateTeam = async () => {
  // Validación + PUT request
  // ~40 líneas
}
```

**Extracción**: SÍ → `hooks/useTournamentActions.ts`

---

#### 1.6 Inline Components (líneas 300-350)
**Total**: ~50 líneas

```typescript
const StatCard = ({ icon, label, value, trend, color }: any) => (
  <CardModern variant="gradient" padding="md" interactive>
    {/* ~40 líneas de JSX */}
  </CardModern>
)
```

**Extracción**: SÍ → `components/StatCard.tsx`

---

#### 1.7 Loading State (líneas 420-470)
**Total**: ~50 líneas

```typescript
if (loading) {
  return (
    <div style={{ display: 'flex', height: '100vh', ... }}>
      <CardModern variant="glass" padding="lg">
        <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Cargando torneo...</p>
      </CardModern>
    </div>
  )
}
```

**Extracción**: SÍ → `components/LoadingState.tsx`

---

#### 1.8 Error State (líneas 470-492)
**Total**: ~22 líneas

```typescript
if (error || !tournamentData) {
  return (
    <div style={{ display: 'flex', height: '100vh', ... }}>
      <CardModern variant="glass" padding="lg">
        <AlertCircle size={48} />
        <p>{error || 'Error al cargar el torneo'}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </CardModern>
    </div>
  )
}
```

**Extracción**: SÍ → `components/ErrorState.tsx`

---

### SECCIÓN 2: Sidebar (líneas 500-1743)
**Total**: ~1,243 líneas

#### 2.1 Sidebar Structure
```
<aside> (líneas 500-1743)
  ├── Logo Section (30 líneas)
  ├── Tournament Header (200 líneas)
  │   └── Toggle Button integrado
  ├── Scrollable Content (1000 líneas)
  │   ├── Navigation Section (500 líneas)
  │   │   ├── Vista General
  │   │   ├── Inscritos
  │   │   ├── Programación
  │   │   ├── Vista Kanban (PRO badge)
  │   │   ├── Captura Masiva
  │   │   └── Modo TV
  │   └── Categorías Section (450 líneas)
  │       ├── Masculino (expandible)
  │       ├── Femenino (expandible)
  │       └── Mixto (expandible)
  └── Footer (70 líneas)
      └── Configuración
```

#### 2.2 Dependencies
```typescript
// Estado usado:
- sidebarCollapsed
- categoriesExpanded
- masculineExpanded
- feminineExpanded
- mixedExpanded
- selectedCategory
- activeView
- tournamentData.categories
- tournamentData.tournament.name
- tournamentData.tournament.startDate
- tournamentData.tournament.endDate

// Funciones:
- setSidebarCollapsed
- setCategoriesExpanded
- setMasculineExpanded
- setFeminineExpanded
- setMixedExpanded
- setSelectedCategory
- setActiveView
- fetchRegistrations (cuando se clickea "Inscritos")
```

**Extracción**: SÍ → `components/TournamentSidebar.tsx`

**Props necesarias**:
```typescript
interface TournamentSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  tournamentData: TournamentData
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  onFetchRegistrations: () => void
}
```

---

### SECCIÓN 3: Main Content Header (líneas 1745-1803)
**Total**: ~58 líneas

```typescript
<div style={{ marginBottom: '32px', display: 'flex', ... }}>
  <div>
    <h1>{tournamentData.tournament.name}</h1>
    <p>{tournamentData.tournament.club.name} • Gestiona todas las operaciones del torneo</p>
  </div>
  <button onClick={() => window.location.href = '/dashboard'}>
    ← Volver a Club
  </button>
</div>
```

**Extracción**: SÍ → `components/TournamentHeader.tsx`

**Props**:
```typescript
interface TournamentHeaderProps {
  name: string
  clubName: string
  onBack: () => void
}
```

---

### SECCIÓN 4: Vista Overview (líneas 1805-2447)
**Total**: ~642 líneas

#### 4.1 Estado del Torneo Card (líneas 1809-2108)
**Total**: ~299 líneas

**Sub-secciones**:
- Header con status badge (~70 líneas)
- Progress bar (~80 líneas)
- 4 métricas (Equipos, Partidos Hoy, En Juego, Pendientes) (~150 líneas)

**Dependencies**:
```typescript
// Data:
- tournamentData.tournament.status
- tournamentData.stats.totalMatches
- tournamentData.stats.completedMatches
- tournamentData.stats.totalTeams
- tournamentData.stats.todayMatches
- tournamentData.stats.inProgressMatches
- tournamentData.stats.pendingMatches
```

**Extracción**: SÍ → `components/overview/TournamentStatusCard.tsx`

---

#### 4.2 Categories Grid (líneas 2113-2445)
**Total**: ~332 líneas

**Features**:
- Filtros de género (all, M, F, X)
- Grid de categorías con cards
- Progress bars por categoría
- Click para seleccionar categoría

**Dependencies**:
```typescript
// State:
- categoryGenderFilter
- setCategoryGenderFilter
- setSelectedCategory

// Data:
- tournamentData.categories
- tournamentData.matches.upcoming
```

**Extracción**: SÍ → `components/overview/CategoriesGrid.tsx`

**Sub-extracciones**:
- `CategoryCard.tsx` (~100 líneas cada card)
- `GenderFilter.tsx` (~40 líneas)

---

### SECCIÓN 5: Vista Kanban (líneas 2450-2459)
**Total**: ~10 líneas

```typescript
{activeView === 'kanban' && (
  <div style={{ marginTop: '24px' }}>
    <div style={{ padding: '20px', background: 'white', ... }}>
      <h2>Kanban View</h2>
      <p>This view is temporarily disabled while fixing syntax errors.</p>
    </div>
  </div>
)}
```

**Status**: DISABLED - NO EXTRAER ahora

---

### SECCIÓN 6: Vista Schedule (líneas 2461-2470)
**Total**: ~10 líneas

```typescript
{activeView === 'schedule' && (
  <div style={{ marginTop: '24px' }}>
    <div style={{ padding: '20px', background: 'white', ... }}>
      <h2>Schedule View</h2>
      <p>This view is temporarily disabled while fixing syntax errors.</p>
    </div>
  </div>
)}
```

**Status**: DISABLED - NO EXTRAER ahora

---

### SECCIÓN 7: Vista Capture (líneas 2473-2809)
**Total**: ~336 líneas

#### 7.1 Structure
```
<CardModern>
  ├── Header con acciones (60 líneas)
  │   ├── Título y descripción
  │   ├── Botón "Seleccionar todos"
  │   └── Botón "Guardar seleccionados"
  ├── Filtros (60 líneas)
  │   ├── Select categoría
  │   ├── Select estado
  │   └── Counter de seleccionados
  └── Lista de partidos (216 líneas)
      └── Match cards con inputs para sets
```

#### 7.2 Dependencies
```typescript
// State:
- captureCategoryFilter
- captureStatusFilter
- selectedMatches
- setCaptureCategoryFilter
- setCaptureStatusFilter
- setSelectedMatches

// Data:
- tournamentData.categories
- tournamentData.matches.upcoming
- tournamentData.matches.inProgress
```

**Extracción**: SÍ → `components/capture/CaptureView.tsx`

**Sub-extracciones**:
- `CaptureFilters.tsx` (~60 líneas)
- `CaptureMatchCard.tsx` (~80 líneas por card)

---

### SECCIÓN 8: Vista Registrations (líneas 2812-3960)
**Total**: ~1,148 líneas

#### 8.1 Header Verde (líneas 2815-3017)
**Total**: ~202 líneas

**Features**:
- Background gradient verde oscuro
- Search bar con ícono
- 4 estadísticas (Total, Confirmados, Pago Pendiente, Check-in)
- Botones: Refresh y Add Team

**Dependencies**:
```typescript
// State:
- searchTerm
- setSearchTerm
- loadingRegistrations
- fetchRegistrations
- setShowAddTeamModal

// Data:
- registrations.length
- registrations.filter(r => r.confirmed).length
- registrations.filter(r => r.paymentStatus === 'pending').length
- registrations.filter(r => r.checkedIn).length
```

**Extracción**: SÍ → `components/registrations/RegistrationsHeader.tsx`

---

#### 8.2 Team Cards Grid (líneas 3019-3384)
**Total**: ~365 líneas

**Features**:
- Filtrado por searchTerm
- Loading state
- Empty state
- Grid de tarjetas de equipos
- 3 botones por equipo: Ver, Editar, Eliminar

**Dependencies**:
```typescript
// State:
- registrations
- loadingRegistrations
- searchTerm
- handleEditTeam

// Functions:
- handleEditTeam(reg)
- console.log('Eliminar equipo:', reg.id)
```

**Extracción**: SÍ → `components/registrations/TeamsList.tsx`

**Sub-extracciones**:
- `TeamCard.tsx` (~80 líneas)
- `EmptyTeamsState.tsx` (~40 líneas)
- `LoadingTeamsState.tsx` (~30 líneas)

---

#### 8.3 Add Team Modal (líneas 3386-3671)
**Total**: ~285 líneas

**Features**:
- Modal con formulario
- 8 campos: teamName, player1Name, player1Email, player1Phone, player2Name, player2Email, player2Phone, category, paymentStatus
- Footer con botones Cancelar y Guardar

**Dependencies**:
```typescript
// State:
- showAddTeamModal
- setShowAddTeamModal
- teamForm
- setTeamForm
- savingTeam
- handleSaveTeam
```

**Extracción**: SÍ → `components/registrations/AddTeamModal.tsx`

**Sub-extracciones**:
- `TeamForm.tsx` (~200 líneas) - reusable para Add y Edit

---

#### 8.4 Edit Team Modal (líneas 3673-3958)
**Total**: ~285 líneas

**Features**:
- Exactamente igual que AddTeamModal pero con handleUpdateTeam

**Dependencies**:
```typescript
// State:
- showEditTeamModal
- setShowEditTeamModal
- teamForm
- setTeamForm
- savingTeam
- handleUpdateTeam
```

**Extracción**: SÍ → Usar mismo `TeamForm.tsx` con prop `mode: 'add' | 'edit'`

---

### SECCIÓN 9: Vista TV (líneas 3963-4195)
**Total**: ~232 líneas

#### 9.1 Structure
```
<CardModern variant="glow">
  ├── Header (50 líneas)
  │   ├── Título y descripción
  │   └── Botón "Pantalla completa"
  ├── Partidos EN JUEGO (120 líneas)
  │   └── Grid de partidos con scores en tiempo real
  └── Próximos Partidos (62 líneas)
      └── Grid de próximos 6 partidos
```

#### 9.2 Dependencies
```typescript
// Data:
- tournamentData.matches.inProgress
- tournamentData.matches.upcoming

// Functions:
- document.documentElement.requestFullscreen()
```

**Extracción**: SÍ → `components/tv/TVView.tsx`

**Sub-extracciones**:
- `LiveMatchCard.tsx` (~60 líneas)
- `UpcomingMatchCard.tsx` (~30 líneas)

---

## 🎯 PLAN DE EXTRACCIÓN DETALLADO

### FASE 1: Preparación (30 minutos)
**Objetivo**: Crear estructura de carpetas y tipos

#### Paso 1.1: Crear estructura de carpetas
```bash
mkdir -p app/c/[clubSlug]/dashboard/tournaments/[id]/components
mkdir -p app/c/[clubSlug]/dashboard/tournaments/[id]/components/overview
mkdir -p app/c/[clubSlug]/dashboard/tournaments/[id]/components/capture
mkdir -p app/c/[clubSlug]/dashboard/tournaments/[id]/components/registrations
mkdir -p app/c/[clubSlug]/dashboard/tournaments/[id]/components/tv
mkdir -p app/c/[clubSlug]/dashboard/tournaments/[id]/hooks
mkdir -p app/c/[clubSlug]/dashboard/tournaments/[id]/types
```

#### Paso 1.2: Extraer tipos
**Archivo**: `types/tournament.ts`
```typescript
export type ViewType = 'overview' | 'registrations' | 'schedule' | 'kanban' | 'capture' | 'tv'

export type TournamentData = {
  tournament: {
    id: string
    name: string
    startDate: string
    endDate: string
    status: 'active' | 'pending' | 'completed'
    club: {
      name: string
    }
  }
  categories: Category[]
  matches: {
    upcoming: Match[]
    inProgress: Match[]
    completed: Match[]
  }
  stats: TournamentStats
}

export type Category = {
  code: string
  name: string
  modality: 'masculine' | 'feminine' | 'mixed'
  teams: number
  totalMatches: number
  completedMatches: number
  status: 'active' | 'completed'
}

export type Match = {
  id: string
  team1Name: string
  team2Name: string
  team1Score: string | null
  team2Score: string | null
  round: string
  courtNumber: number | null
  status: 'pending' | 'in_progress' | 'completed'
  scheduledAt: string | null
  startTime: string | null
}

export type TournamentStats = {
  totalTeams: number
  totalMatches: number
  completedMatches: number
  pendingMatches: number
  inProgressMatches: number
  todayMatches: number
}

export type Registration = {
  id: string
  teamName: string
  player1Name: string
  player1Email: string
  player1Phone: string
  player2Name: string
  player2Email: string
  player2Phone: string
  category: string
  modality: 'M' | 'F' | 'X'
  paymentStatus: 'pending' | 'completed'
  confirmed: boolean
  checkedIn: boolean
}

export type TeamFormData = {
  teamName: string
  player1Name: string
  player1Email: string
  player1Phone: string
  player2Name: string
  player2Email: string
  player2Phone: string
  category: string
  modality: string
  paymentStatus: string
}
```

**Commit**: "Extract: Tournament types"

---

### FASE 2: Extracciones Simples (1 hora)
**Objetivo**: Componentes SIN estado interno (solo props)

#### Paso 2.1: LoadingState
**Archivo**: `components/LoadingState.tsx`
```typescript
import { Loader2 } from 'lucide-react'
import { CardModern } from '@/components/design-system/CardModern'

export function LoadingState() {
  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <CardModern variant="glass" padding="lg">
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#047857', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', color: '#6b7280' }}>Cargando torneo...</p>
        </div>
      </CardModern>
    </div>
  )
}
```

**Testing**: Verificar que loading state se muestre correctamente
**Commit**: "Extract: LoadingState component"

---

#### Paso 2.2: ErrorState
**Archivo**: `components/ErrorState.tsx`
```typescript
import { AlertCircle } from 'lucide-react'
import { CardModern } from '@/components/design-system/CardModern'

type ErrorStateProps = {
  error: string
  onRetry: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <CardModern variant="glass" padding="lg">
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: 600, marginBottom: '8px' }}>{error}</p>
          <button
            onClick={onRetry}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#047857',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Reintentar
          </button>
        </div>
      </CardModern>
    </div>
  )
}
```

**Testing**: Verificar error state
**Commit**: "Extract: ErrorState component"

---

#### Paso 2.3: TournamentHeader
**Archivo**: `components/TournamentHeader.tsx`
```typescript
type TournamentHeaderProps = {
  name: string
  clubName: string
  onBack: () => void
}

export function TournamentHeader({ name, clubName, onBack }: TournamentHeaderProps) {
  return (
    <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1f2937', letterSpacing: '-0.03em', marginBottom: '8px' }}>
          {name}
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          {clubName} • Gestiona todas las operaciones del torneo
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: '#10b981',
            color: '#1f2937',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          ← Volver a Club
        </button>
      </div>
    </div>
  )
}
```

**Testing**: Verificar header
**Commit**: "Extract: TournamentHeader component"

---

**Testing Checkpoint 1**: Build + manual test
```bash
npm run build
# Verificar que la página carga y funciona igual
```

---

### FASE 3: Hooks (1.5 horas)
**Objetivo**: Extraer lógica de datos y acciones

#### Paso 3.1: useTournamentData
**Archivo**: `hooks/useTournamentData.ts`
```typescript
import { useState, useEffect } from 'react'
import type { TournamentData } from '../types/tournament'

export function useTournamentData(tournamentId: string) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<TournamentData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tournaments-v2/${tournamentId}`)
      if (!response.ok) throw new Error('Error al cargar el torneo')
      const tournamentData = await response.json()
      setData(tournamentData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // 30s polling
    return () => clearInterval(interval)
  }, [tournamentId])

  return { loading, data, error, refresh: fetchData }
}
```

**Commit**: "Extract: useTournamentData hook"

---

#### Paso 3.2: useRegistrations
**Archivo**: `hooks/useRegistrations.ts`
```typescript
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
    // Implementation from original file (lines ~350-390)
  }

  const handleEditTeam = (team: Registration) => {
    setSelectedTeam(team)
    setTeamForm({
      teamName: team.teamName,
      player1Name: team.player1Name,
      player1Email: team.player1Email,
      player1Phone: team.player1Phone,
      player2Name: team.player2Name,
      player2Email: team.player2Email,
      player2Phone: team.player2Phone,
      category: team.category,
      modality: team.modality,
      paymentStatus: team.paymentStatus
    })
    setShowEditModal(true)
  }

  const handleUpdateTeam = async () => {
    // Implementation from original file
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
```

**Commit**: "Extract: useRegistrations hook"

---

**Testing Checkpoint 2**: Build + manual test de data loading

---

### FASE 4: Sidebar (2 horas)
**Objetivo**: Extraer el sidebar completo

#### Paso 4.1: Extraer Navigation Items
**Archivo**: `components/sidebar/NavigationItem.tsx`
```typescript
import { LucideIcon } from 'lucide-react'
import { colors } from '@/lib/design-system/colors'

type NavigationItemProps = {
  icon: LucideIcon
  label: string
  description: string
  active: boolean
  onClick: () => void
  collapsed: boolean
  badge?: string
}

export function NavigationItem({
  icon: Icon,
  label,
  description,
  active,
  onClick,
  collapsed,
  badge
}: NavigationItemProps) {
  // Implementation (~80 líneas del archivo original)
}
```

**Commit**: "Extract: NavigationItem component"

---

#### Paso 4.2: Extraer Category Section
**Archivo**: `components/sidebar/CategorySection.tsx`
```typescript
import type { Category } from '../../types/tournament'

type CategorySectionProps = {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (category: string) => void
  collapsed: boolean
}

export function CategorySection({ categories, selectedCategory, onSelectCategory, collapsed }: CategorySectionProps) {
  // Implementation (~450 líneas)
  // Sub-componentes: MasculineCategories, FeminineCategories, MixedCategories
}
```

**Commit**: "Extract: CategorySection component"

---

#### Paso 4.3: Extraer Sidebar completo
**Archivo**: `components/TournamentSidebar.tsx`
```typescript
import type { TournamentData, ViewType } from '../types/tournament'
import { NavigationItem } from './sidebar/NavigationItem'
import { CategorySection } from './sidebar/CategorySection'

type TournamentSidebarProps = {
  collapsed: boolean
  onToggleCollapse: () => void
  tournamentData: TournamentData
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  onFetchRegistrations: () => void
}

export function TournamentSidebar({
  collapsed,
  onToggleCollapse,
  tournamentData,
  activeView,
  onViewChange,
  selectedCategory,
  onCategoryChange,
  onFetchRegistrations
}: TournamentSidebarProps) {
  // Implementation (~1,243 líneas del original ahora reducido a ~200 líneas)
}
```

**Commit**: "Extract: TournamentSidebar component"

**Testing Checkpoint 3**: Build + manual test de navegación

---

### FASE 5: Views (3 horas)
**Objetivo**: Extraer las 5 vistas principales

#### Paso 5.1: OverviewView
**Archivo**: `components/overview/OverviewView.tsx`

**Sub-componentes**:
1. `TournamentStatusCard.tsx` (~299 líneas → ~150 líneas)
2. `CategoriesGrid.tsx` (~332 líneas → ~180 líneas)
   - `CategoryCard.tsx` (~100 líneas)
   - `GenderFilter.tsx` (~40 líneas)

**Commit**: "Extract: OverviewView components"

---

#### Paso 5.2: CaptureView
**Archivo**: `components/capture/CaptureView.tsx`

**Sub-componentes**:
1. `CaptureFilters.tsx` (~60 líneas)
2. `CaptureMatchCard.tsx` (~80 líneas)

**Commit**: "Extract: CaptureView components"

---

#### Paso 5.3: RegistrationsView
**Archivo**: `components/registrations/RegistrationsView.tsx`

**Sub-componentes**:
1. `RegistrationsHeader.tsx` (~202 líneas)
2. `TeamsList.tsx` (~365 líneas → ~100 líneas)
   - `TeamCard.tsx` (~80 líneas)
   - `EmptyTeamsState.tsx` (~40 líneas)
   - `LoadingTeamsState.tsx` (~30 líneas)
3. `TeamFormModal.tsx` (~250 líneas) - reusable para Add y Edit
   - `TeamForm.tsx` (~200 líneas)

**Commit**: "Extract: RegistrationsView components"

---

#### Paso 5.4: TVView
**Archivo**: `components/tv/TVView.tsx`

**Sub-componentes**:
1. `LiveMatchCard.tsx` (~60 líneas)
2. `UpcomingMatchCard.tsx` (~30 líneas)

**Commit**: "Extract: TVView components"

---

**Testing Checkpoint 4**: Build + manual test de todas las vistas

---

### FASE 6: Archivo Principal (30 minutos)
**Objetivo**: Limpiar y estructurar page.tsx

#### Paso 6.1: Estructura Final de page.tsx
**Target**: ~150 líneas

```typescript
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { ViewType } from './types/tournament'
import { useTournamentData } from './hooks/useTournamentData'
import { useRegistrations } from './hooks/useRegistrations'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'
import { TournamentSidebar } from './components/TournamentSidebar'
import { TournamentHeader } from './components/TournamentHeader'
import { OverviewView } from './components/overview/OverviewView'
import { RegistrationsView } from './components/registrations/RegistrationsView'
import { CaptureView } from './components/capture/CaptureView'
import { TVView } from './components/tv/TVView'

export default function TournamentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tournamentId = params.id as string

  // View state
  const [activeView, setActiveView] = useState<ViewType>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Data hooks
  const { loading, data: tournamentData, error, refresh } = useTournamentData(tournamentId)
  const registrations = useRegistrations(tournamentId)

  // Filters state (for different views)
  const [categoryGenderFilter, setCategoryGenderFilter] = useState<'all' | 'M' | 'F' | 'X'>('all')
  const [captureCategoryFilter, setCaptureCategoryFilter] = useState('all')
  const [captureStatusFilter, setCaptureStatusFilter] = useState<'pending' | 'all' | 'completed'>('pending')
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())

  // Loading & Error states
  if (loading) return <LoadingState />
  if (error || !tournamentData) return <ErrorState error={error || 'Error al cargar el torneo'} onRetry={refresh} />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <TournamentSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        tournamentData={tournamentData}
        activeView={activeView}
        onViewChange={setActiveView}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onFetchRegistrations={registrations.fetchRegistrations}
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        <TournamentHeader
          name={tournamentData.tournament.name}
          clubName={tournamentData.tournament.club.name}
          onBack={() => router.push('/dashboard')}
        />

        {activeView === 'overview' && (
          <OverviewView
            tournamentData={tournamentData}
            categoryGenderFilter={categoryGenderFilter}
            onCategoryGenderFilterChange={setCategoryGenderFilter}
            onCategorySelect={setSelectedCategory}
          />
        )}

        {activeView === 'registrations' && (
          <RegistrationsView
            registrations={registrations.registrations}
            loading={registrations.loading}
            searchTerm={registrations.searchTerm}
            onSearchChange={registrations.setSearchTerm}
            showAddModal={registrations.showAddModal}
            onToggleAddModal={(show) => registrations.setShowAddModal(show)}
            showEditModal={registrations.showEditModal}
            onToggleEditModal={(show) => registrations.setShowEditModal(show)}
            teamForm={registrations.teamForm}
            onTeamFormChange={registrations.setTeamForm}
            saving={registrations.saving}
            onSaveTeam={registrations.handleSaveTeam}
            onEditTeam={registrations.handleEditTeam}
            onUpdateTeam={registrations.handleUpdateTeam}
            onFetchRegistrations={registrations.fetchRegistrations}
          />
        )}

        {activeView === 'capture' && (
          <CaptureView
            tournamentData={tournamentData}
            categoryFilter={captureCategoryFilter}
            statusFilter={captureStatusFilter}
            selectedMatches={selectedMatches}
            onCategoryFilterChange={setCaptureCategoryFilter}
            onStatusFilterChange={setCaptureStatusFilter}
            onSelectedMatchesChange={setSelectedMatches}
          />
        )}

        {activeView === 'tv' && (
          <TVView tournamentData={tournamentData} />
        )}

        {activeView === 'schedule' && (
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
            <h2>Schedule View</h2>
            <p>This view is temporarily disabled.</p>
          </div>
        )}

        {activeView === 'kanban' && (
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
            <h2>Kanban View</h2>
            <p>This view is temporarily disabled.</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Commit**: "Refactor: Clean up tournament detail page structure (4,198 → 150 lines)"

---

## ✅ CHECKPOINTS DE CALIDAD

Después de cada FASE, verificar:

### 1. Build Success
```bash
npm run build
```
- ✅ Sin errores de TypeScript
- ✅ Sin errores de compilación

### 2. Type Safety
```bash
npx tsc --noEmit
```
- ✅ Todos los tipos correctos
- ✅ Props bien tipadas

### 3. Funcionalidad
- ✅ Página carga sin errores
- ✅ Sidebar funciona (collapsed/expanded)
- ✅ Navegación entre vistas funciona
- ✅ Polling de datos funciona (30s)
- ✅ Modales se abren/cierran
- ✅ Formularios se envían
- ✅ Filtros funcionan
- ✅ No hay errores en consola

### 4. Performance
- ✅ No hay re-renders innecesarios
- ✅ Tiempo de carga similar o mejor

---

## 📊 MÉTRICAS DE ÉXITO

### Por Fase:
- **FASE 1**: Types extraídos ✅
- **FASE 2**: 3 componentes simples ✅ (LoadingState, ErrorState, TournamentHeader)
- **FASE 3**: 2 hooks ✅ (useTournamentData, useRegistrations)
- **FASE 4**: Sidebar ✅ (1,243 → ~200 líneas)
- **FASE 5**: 4 vistas ✅ (Overview, Capture, Registrations, TV)
- **FASE 6**: page.tsx limpio ✅ (4,198 → ~150 líneas)

### Resultado Final:
```
Archivo original: 4,198 líneas
Archivo final: ~150 líneas
Reducción: 96.4% ✅

Componentes creados: 25
Hooks creados: 2
Types extraídos: 8

Estructura de carpetas:
app/c/[clubSlug]/dashboard/tournaments/[id]/
├── page.tsx (150 líneas) ✅
├── types/
│   └── tournament.ts (150 líneas)
├── hooks/
│   ├── useTournamentData.ts (80 líneas)
│   └── useRegistrations.ts (150 líneas)
└── components/
    ├── LoadingState.tsx (30 líneas)
    ├── ErrorState.tsx (40 líneas)
    ├── TournamentHeader.tsx (50 líneas)
    ├── TournamentSidebar.tsx (200 líneas)
    ├── sidebar/
    │   ├── NavigationItem.tsx (80 líneas)
    │   └── CategorySection.tsx (150 líneas)
    ├── overview/
    │   ├── OverviewView.tsx (100 líneas)
    │   ├── TournamentStatusCard.tsx (150 líneas)
    │   ├── CategoriesGrid.tsx (180 líneas)
    │   ├── CategoryCard.tsx (100 líneas)
    │   └── GenderFilter.tsx (40 líneas)
    ├── capture/
    │   ├── CaptureView.tsx (120 líneas)
    │   ├── CaptureFilters.tsx (60 líneas)
    │   └── CaptureMatchCard.tsx (80 líneas)
    ├── registrations/
    │   ├── RegistrationsView.tsx (150 líneas)
    │   ├── RegistrationsHeader.tsx (200 líneas)
    │   ├── TeamsList.tsx (100 líneas)
    │   ├── TeamCard.tsx (80 líneas)
    │   ├── TeamFormModal.tsx (120 líneas)
    │   ├── TeamForm.tsx (200 líneas)
    │   ├── EmptyTeamsState.tsx (40 líneas)
    │   └── LoadingTeamsState.tsx (30 líneas)
    └── tv/
        ├── TVView.tsx (100 líneas)
        ├── LiveMatchCard.tsx (60 líneas)
        └── UpcomingMatchCard.tsx (30 líneas)

Total líneas refactorizadas: ~2,750 líneas (bien organizadas)
Líneas eliminadas/consolidadas: ~1,450 líneas (código repetido, inline styles optimizados)
```

---

## 🎯 ORDEN DE EJECUCIÓN

### Día 1: Refactorización Completa (4-5 horas)

**09:00 - 09:30**: FASE 1 - Preparación
**09:30 - 10:30**: FASE 2 - Componentes simples
**10:30 - 12:00**: FASE 3 - Hooks
**12:00 - 14:00**: FASE 4 - Sidebar
**14:00 - 17:00**: FASE 5 - Views
**17:00 - 17:30**: FASE 6 - Limpiar page.tsx
**17:30 - 18:00**: Testing completo y ajustes finales

---

## 🚨 NOTAS IMPORTANTES

1. **NO CAMBIAR LÓGICA**: Solo extraer código, NO modificar comportamiento
2. **COMMITS ATÓMICOS**: Un componente = un commit
3. **TESTING CONTINUO**: Build + manual test después de cada fase
4. **BACKWARDS COMPATIBILITY**: El archivo debe funcionar exactamente igual
5. **VISTAS DISABLED**: Schedule y Kanban views NO extraer todavía (están disabled)

---

**Creado por**: Claude Code
**Versión**: 1.0
**Última actualización**: 15 Oct 2025
