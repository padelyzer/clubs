# Estrategia de Refactorización Compatible
**Fecha**: 14 de Octubre, 2025
**Objetivo**: Refactorizar sin romper NADA del código existente

---

## 🎯 PRINCIPIOS DE REFACTORIZACIÓN SEGURA

### **Regla de Oro**: NUNCA cambiar comportamiento, solo estructura

1. ✅ **Extraer, NO Reescribir**
   - Copiar código existente → Nuevo componente
   - NO cambiar lógica
   - NO "mejorar" en el mismo commit

2. ✅ **Interfaces Estables**
   - Mantener las mismas props
   - Mantener los mismos tipos
   - NO cambiar signatures de funciones

3. ✅ **Commits Atómicos**
   - 1 extracción = 1 commit
   - Mensaje claro: "Extract [ComponentName] from [ParentFile]"
   - Fácil de revertir si algo falla

4. ✅ **Testing Continuo**
   - Verificar build después de cada extracción
   - Testing manual de funcionalidad
   - Si no compila → revert inmediato

5. ✅ **Backwards Compatibility**
   - El archivo original sigue funcionando igual
   - Las importaciones externas no cambian
   - Los props externos no cambian

---

## 📋 METODOLOGÍA: EXTRACT-TEST-COMMIT

### **Paso 1: EXTRACT (Extraer)**
```tsx
// ANTES: Todo en un archivo
export function BigComponent() {
  return (
    <div>
      {/* Section A - 100 líneas */}
      {/* Section B - 150 líneas */}
      {/* Section C - 200 líneas */}
    </div>
  )
}
```

```tsx
// DESPUÉS: Extraído (SIN CAMBIOS DE LÓGICA)
import { SectionA } from './components/SectionA'
import { SectionB } from './components/SectionB'
import { SectionC } from './components/SectionC'

export function BigComponent() {
  return (
    <div>
      <SectionA />
      <SectionB />
      <SectionC />
    </div>
  )
}

// components/SectionA.tsx (CÓDIGO EXACTO copiado, 0 cambios)
export function SectionA() {
  // MISMO código que estaba antes
}
```

### **Paso 2: TEST (Verificar)**
```bash
# 1. Build test
npm run build

# 2. TypeScript check
npx tsc --noEmit

# 3. Manual testing
# - Abrir página
# - Verificar que funciona igual
# - Verificar que no hay errores en consola
```

### **Paso 3: COMMIT (Guardar)**
```bash
git add .
git commit -m "Extract: SectionA component from BigComponent (no logic changes)"
```

**Si algo falla**:
```bash
git reset --hard HEAD  # Revertir cambios
```

---

## 🔧 PATRÓN DE EXTRACCIÓN

### **Identificar Secciones**
1. Leer el archivo grande
2. Identificar bloques lógicos (por comentarios, divs, funcionalidad)
3. Marcar dependencias (state, props, funciones que usa)
4. Determinar orden de extracción (de menos a más dependencias)

### **Extraer Componente**
```tsx
// 1. Copiar código exacto
// 2. Identificar dependencias
// 3. Pasar como props
// 4. NO cambiar lógica interna

// EJEMPLO:
// Antes (dentro de BigComponent):
const [count, setCount] = useState(0)
return (
  <div>
    <h2>Count: {count}</h2>
    <button onClick={() => setCount(count + 1)}>+</button>
  </div>
)

// Después:
// BigComponent.tsx
const [count, setCount] = useState(0)
return <CounterSection count={count} onIncrement={() => setCount(count + 1)} />

// components/CounterSection.tsx (NUEVA - código copiado exacto)
type CounterSectionProps = {
  count: number
  onIncrement: () => void
}
export function CounterSection({ count, onIncrement }: CounterSectionProps) {
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={onIncrement}>+</button>
    </div>
  )
}
```

### **Gestión de Dependencias**
```tsx
// Estado compartido → Props
// Funciones compartidas → Callbacks
// Context → Mantener useContext en componente extraído
// Hooks externos → Mantener en componente extraído

// EJEMPLO con múltiples dependencias:
// Antes:
function BigComponent() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const notify = useNotify()

  const handleSave = async () => {
    setLoading(true)
    // ... lógica
    notify.success('Saved!')
  }

  return (
    <div>
      {loading && <Spinner />}
      <DataList data={data} />
      <button onClick={handleSave}>Save</button>
    </div>
  )
}

// Después (extracción de DataSection):
function BigComponent() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const notify = useNotify()

  const handleSave = async () => {
    setLoading(true)
    // ... lógica
    notify.success('Saved!')
  }

  return (
    <DataSection
      data={data}
      loading={loading}
      onSave={handleSave}
    />
  )
}

// components/DataSection.tsx (NUEVO)
type DataSectionProps = {
  data: any[]
  loading: boolean
  onSave: () => void
}
export function DataSection({ data, loading, onSave }: DataSectionProps) {
  return (
    <div>
      {loading && <Spinner />}
      <DataList data={data} />
      <button onClick={onSave}>Save</button>
    </div>
  )
}
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

### **Patrón de Organización**
```
BigComponent.tsx (archivo original - ahora pequeño)
└── components/
    ├── SectionA.tsx
    ├── SectionB.tsx
    ├── SectionC/
    │   ├── index.tsx
    │   ├── SubComponentX.tsx
    │   └── SubComponentY.tsx
    └── shared/
        └── ReusableComponent.tsx
```

### **Convención de Nombres**
- **PascalCase** para componentes: `UserListSection.tsx`
- **Sufijos descriptivos**: `Section`, `Panel`, `Card`, `Row`, `Item`
- **NO generic names**: ❌ `Component1.tsx`, ✅ `TournamentHeader.tsx`
- **Ubicación lógica**: Mismo nivel del componente padre

---

## 🚀 PLAN DE EJECUCIÓN: tournaments/[id]/page.tsx

### **Archivo Crítico**: 4,198 líneas → Target: ~150 líneas

#### **FASE 1: Análisis** (30 min)
- [ ] Leer archivo completo
- [ ] Identificar secciones principales
- [ ] Mapear dependencias (state, props, hooks)
- [ ] Determinar orden de extracción

#### **FASE 2: Extracciones Simples** (1 hora)
Componentes SIN dependencias de estado (solo props)

1. **TournamentHeader** (estimado: 80 líneas)
   - Props: tournament info
   - Sin estado interno
   - Render only
   - **Commit**: "Extract: TournamentHeader from tournament detail page"

2. **TournamentStats** (estimado: 60 líneas)
   - Props: stats object
   - Sin estado interno
   - **Commit**: "Extract: TournamentStats from tournament detail page"

3. **TournamentBreadcrumb** (estimado: 40 líneas)
   - Props: tournament name, slug
   - **Commit**: "Extract: TournamentBreadcrumb from tournament detail page"

**Testing checkpoint**: Build + manual test

#### **FASE 3: Extracciones Medias** (1.5 horas)
Componentes con POCO estado (1-2 useState)

4. **PlayerListSection** (estimado: 200 líneas)
   - Props: players array, handlers
   - Estado: filter, sort
   - **Sub-extracciones**:
     - `PlayerCard.tsx` (60 líneas)
     - `PlayerFilters.tsx` (50 líneas)
   - **Commit**: "Extract: PlayerListSection from tournament detail page"

5. **MatchScheduleSection** (estimado: 180 líneas)
   - Props: matches array, handlers
   - Estado: selectedDate
   - **Sub-extracciones**:
     - `MatchCard.tsx` (70 líneas)
     - `DateSelector.tsx` (40 líneas)
   - **Commit**: "Extract: MatchScheduleSection from tournament detail page"

**Testing checkpoint**: Build + manual test de players y matches

#### **FASE 4: Extracciones Complejas** (2 horas)
Componentes con ESTADO COMPLEJO (3+ useState, lógica de negocio)

6. **BracketSection** (estimado: 300 líneas)
   - Props: tournament, matches, handlers
   - Estado: selectedRound, expandedMatches
   - **Sub-extracciones**:
     - `BracketVisualization.tsx` (usar existente)
     - `BracketControls.tsx` (80 líneas)
   - **Hooks extraídos**:
     - `useBracketState.ts` (100 líneas de lógica)
   - **Commit**: "Extract: BracketSection from tournament detail page"

7. **MatchManagementSection** (estimado: 250 líneas)
   - Props: matches, tournament, handlers
   - Estado: editingMatch, showResultModal
   - **Sub-extracciones**:
     - `MatchResultModal.tsx` (150 líneas)
     - `ConflictResolutionPanel.tsx` (100 líneas)
   - **Commit**: "Extract: MatchManagementSection from tournament detail page"

**Testing checkpoint**: Build + manual test de bracket y match management

#### **FASE 5: Hooks y Lógica** (1 hora)
Extraer lógica de negocio a custom hooks

8. **useTournamentData** (estimado: 150 líneas)
   - Fetch de datos
   - Refresh logic
   - Error handling
   - **Commit**: "Extract: useTournamentData hook from tournament detail page"

9. **useTournamentActions** (estimado: 120 líneas)
   - Update tournament
   - Add/remove players
   - Update matches
   - **Commit**: "Extract: useTournamentActions hook from tournament detail page"

**Testing checkpoint**: Build + full manual test

#### **FASE 6: Archivo Principal** (30 min)
Limpiar y estructurar

10. **page.tsx final** (target: 150 líneas)
```tsx
'use client'

import { useTournamentData } from './hooks/useTournamentData'
import { useTournamentActions } from './hooks/useTournamentActions'
import { TournamentHeader } from './components/TournamentHeader'
import { TournamentStats } from './components/TournamentStats'
import { PlayerListSection } from './components/PlayerListSection'
import { BracketSection } from './components/BracketSection'
import { MatchScheduleSection } from './components/MatchScheduleSection'
import { MatchManagementSection } from './components/MatchManagementSection'

export default function TournamentDetailPage({ params }: Props) {
  const { tournament, loading, error, refresh } = useTournamentData(params.id)
  const actions = useTournamentActions(tournament, refresh)

  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} />
  if (!tournament) return <NotFoundState />

  return (
    <div className="container">
      <TournamentHeader tournament={tournament} />
      <TournamentStats stats={tournament.stats} />

      <Tabs>
        <Tab label="Bracket">
          <BracketSection
            tournament={tournament}
            onMatchUpdate={actions.updateMatch}
          />
        </Tab>
        <Tab label="Jugadores">
          <PlayerListSection
            players={tournament.players}
            onAddPlayer={actions.addPlayer}
            onRemovePlayer={actions.removePlayer}
          />
        </Tab>
        <Tab label="Partidos">
          <MatchScheduleSection
            matches={tournament.matches}
            onReschedule={actions.rescheduleMatch}
          />
        </Tab>
        <Tab label="Gestión">
          <MatchManagementSection
            tournament={tournament}
            onUpdate={actions.updateTournament}
          />
        </Tab>
      </Tabs>
    </div>
  )
}
```
   - **Commit**: "Refactor: Clean up tournament detail page structure"

**Final testing**: Full regression test

---

## ✅ CHECKPOINTS DE CALIDAD

Después de cada extracción, verificar:

### **1. Build Success**
```bash
npm run build
```
- ✅ Sin errores de TypeScript
- ✅ Sin errores de compilación
- ✅ Sin warnings críticos

### **2. Type Safety**
```bash
npx tsc --noEmit
```
- ✅ Todos los tipos correctos
- ✅ Props bien tipadas
- ✅ Sin `any` innecesarios

### **3. Import Paths**
- ✅ Imports relativos correctos
- ✅ No hay imports circulares
- ✅ Barrel exports si aplica

### **4. Funcionalidad**
- ✅ Página carga sin errores
- ✅ Todos los botones funcionan
- ✅ Datos se muestran correctamente
- ✅ Modales se abren/cierran
- ✅ Formularios se envían
- ✅ No hay errores en consola

### **5. Performance**
- ✅ No hay re-renders innecesarios (React DevTools)
- ✅ Tiempo de carga similar o mejor
- ✅ No hay memory leaks

---

## 🚨 SEÑALES DE ALERTA

**DETENER y revertir si**:
- ❌ Build falla
- ❌ Tipos rotos
- ❌ Funcionalidad no funciona igual
- ❌ Errores en consola
- ❌ Performance degrada significativamente

**Acción**:
```bash
git reset --hard HEAD
# Analizar qué salió mal
# Ajustar estrategia
# Intentar de nuevo
```

---

## 📊 MÉTRICAS DE ÉXITO

### **Por Archivo Refactorizado**:
- ✅ Reducción de líneas: >60%
- ✅ Número de componentes: 5-10
- ✅ Líneas por componente: <200
- ✅ Hooks extraídos: 2-4
- ✅ Nivel de anidación: <5
- ✅ Complejidad ciclomática: <10

### **Global**:
- ✅ 13 archivos refactorizados
- ✅ 0 regresiones funcionales
- ✅ 0 errores de TypeScript
- ✅ Build exitoso
- ✅ Todos los tests pasan

---

## 🎯 ORDEN DE EJECUCIÓN GENERAL

### **Día 1: Torneos** (4-5 horas)
1. ✅ `tournaments/[id]/page.tsx` (4,198 → 150 líneas)
2. ✅ `TournamentCreationWizard.tsx` (680 → 150 líneas)

### **Día 2: Clases** (3-4 horas)
3. ✅ `ClassDetailsModal.tsx` (566 → 120 líneas)
4. ✅ `ClassFormModal.tsx` (413 → 120 líneas)
5. ✅ `AttendanceModal.tsx` (408 → 120 líneas)
6. ✅ `PendingPaymentsView.tsx` (426 → 100 líneas)

### **Día 3: Migración AppleModal** (3-4 horas)
7. ✅ Migrar todos los modales a AppleModal
8. ✅ Migrar botones a AppleButton
9. ✅ Testing integral
10. ✅ Deploy a producción

---

## 🔄 ROLLBACK STRATEGY

Cada commit es reversible:

```bash
# Ver últimos commits
git log --oneline -10

# Revertir último commit
git revert HEAD

# Revertir múltiples commits
git revert HEAD~3..HEAD

# Resetear completamente (PELIGROSO)
git reset --hard <commit-hash>
```

---

## 📞 COMUNICACIÓN CON USUARIO

Después de cada archivo refactorizado:
1. ✅ Commit con mensaje claro
2. ✅ Build exitoso
3. ✅ Testing manual completo
4. ✅ Notificar al usuario: "Archivo X refactorizado, listo para testing"
5. ✅ Usuario verifica que todo funciona
6. ✅ Continuar con siguiente archivo

---

## 🎬 COMENZAMOS CON...

**Archivo #1**: `tournaments/[id]/page.tsx`
**Líneas actuales**: 4,198
**Target**: ~150
**Tiempo estimado**: 4-5 horas
**Estrategia**: Extract-Test-Commit en 10 pasos

¿Listo para empezar con FASE 1: Análisis?

---

**Creado por**: Claude Code
**Versión**: 1.0
**Última actualización**: 14 Oct 2025
