# Guía de Refactorización - Módulo de Clases

## 📋 Resumen Ejecutivo

He completado la **validación exhaustiva del módulo de clases** y he iniciado la refactorización del componente monolítico de frontend (3,521 líneas).

### ✅ Lo que he creado:

```
app/(auth)/dashboard/classes/
├── types.ts                     ✅ CREADO
├── constants.ts                 ✅ CREADO
├── hooks/
│   └── useClassesData.ts       ✅ CREADO
└── components/
    ├── ClassFilters.tsx        ✅ CREADO
    └── ClassCard.tsx           ✅ CREADO
```

### ⏳ Lo que falta crear:

```
app/(auth)/dashboard/classes/
├── page.tsx                     ⚠️ Refactorizar (actualmente 3,521 líneas)
├── hooks/
│   ├── useClassForm.ts         ⏳ Por crear
│   └── useEnrollment.ts        ⏳ Por crear
└── components/
    ├── ClassList.tsx           ⏳ Por crear
    ├── ClassFormModal.tsx      ⏳ Por crear
    ├── EnrollmentModal.tsx     ⏳ Por crear
    ├── AttendanceModal.tsx     ⏳ Por crear
    └── ReportsView.tsx         ⏳ Por crear
```

---

## 🎯 Próximos Pasos (Orden Recomendado)

### 1. Leer Secciones del Archivo Original

Para continuar con la refactorización, necesitas leer el archivo original en secciones:

```bash
# Ver estructura de funciones/componentes
grep -n "^  const \|^  function \|^  return" app/\(auth\)/dashboard/classes/page.tsx | head -100

# Leer sección de handlers (líneas 346-700 aproximadamente)
# Leer sección de JSX (líneas 1000-3000 aproximadamente)
# Leer sección final (líneas 3000-3521)
```

### 2. Crear Hook de Formulario

**Archivo:** `hooks/useClassForm.ts`

**Contenido esperado:**
```typescript
export function useClassForm(
  classPricing: any,
  courts: any[],
  onSuccess: () => void
) {
  const [classForm, setClassForm] = useState(DEFAULT_CLASS_FORM)
  const [availabilityCheck, setAvailabilityCheck] = useState<AvailabilityCheck>({...})

  const calculateEndTime = (startTime: string, duration: number) => { ... }
  const checkAvailability = async () => { ... }
  const handleCreateClass = async () => { ... }
  const handleUpdateClass = async () => { ... }

  return {
    classForm,
    setClassForm,
    availabilityCheck,
    calculateEndTime,
    checkAvailability,
    handleCreateClass,
    handleUpdateClass
  }
}
```

**Dónde encontrar la lógica:**
- `calculateEndTime`: línea 282-292 del original
- `checkAvailability`: línea 294-333 del original
- `handleCreateClass`: línea 346-450 del original
- `handleUpdateClass`: línea 471-550 del original

### 3. Crear Hook de Inscripción

**Archivo:** `hooks/useEnrollment.ts`

**Contenido esperado:**
```typescript
export function useEnrollment(
  selectedClass: Class | null,
  onSuccess: () => void
) {
  const [enrollmentForm, setEnrollmentForm] = useState(DEFAULT_ENROLLMENT_FORM)
  const [loading, setLoading] = useState(false)

  const handleEnroll = async () => { ... }
  const resetForm = () => { ... }

  return {
    enrollmentForm,
    setEnrollmentForm,
    loading,
    handleEnroll,
    resetForm
  }
}
```

**Dónde encontrar la lógica:**
Buscar por "handleEnroll" en el archivo original.

### 4. Crear Componente ClassList

**Archivo:** `components/ClassList.tsx`

**Propósito:** Renderizar lista/grid de tarjetas de clases.

```typescript
export function ClassList({
  classes,
  loading,
  onClassClick,
  onEdit,
  onDelete,
  onEnroll,
  onAttendance
}: ClassListProps) {
  if (loading) return <LoadingState />
  if (classes.length === 0) return <EmptyState />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes.map(classItem => (
        <ClassCard
          key={classItem.id}
          classItem={classItem}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onClassClick}
          onEnroll={onEnroll}
          onAttendance={onAttendance}
        />
      ))}
    </div>
  )
}
```

### 5. Crear Modals

#### **ClassFormModal.tsx**
Modal para crear/editar clases. Incluye:
- Form con todos los campos
- Validación de disponibilidad en tiempo real
- Soporte para clases recurrentes
- Sugerencias de horarios alternativos

#### **EnrollmentModal.tsx**
Modal para inscribir estudiantes. Incluye:
- Búsqueda de jugadores existentes
- Form con datos del estudiante
- Selección de método de pago (online/onsite)
- Opción de split payment

#### **AttendanceModal.tsx**
Modal para check-in y asistencia. Incluye:
- Lista de estudiantes inscritos
- Check-in rápido con pago en un solo paso
- Selección de método de pago
- Estadísticas de asistencia

### 6. Refactorizar page.tsx Principal

Una vez tengas todos los componentes y hooks, refactoriza page.tsx:

```typescript
'use client'

import { useState } from 'react'
import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import { useNotify } from '@/contexts/NotificationContext'
import { useClassesData } from './hooks/useClassesData'
import { useClassForm } from './hooks/useClassForm'
import { ClassFilters } from './components/ClassFilters'
import { ClassList } from './components/ClassList'
import { ClassFormModal } from './components/ClassFormModal'
import { EnrollmentModal } from './components/EnrollmentModal'
import { AttendanceModal } from './components/AttendanceModal'
import type { Class } from './types'

function ClassesContent() {
  const notify = useNotify()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedInstructor, setSelectedInstructor] = useState('all')
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'reports'>('list')

  // Estados de modals
  const [isCreatingClass, setIsCreatingClass] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [showEnrollment, setShowEnrollment] = useState(false)
  const [showAttendance, setShowAttendance] = useState(false)

  // Hook de datos
  const {
    loading,
    classes,
    instructors,
    courts,
    players,
    classPricing,
    fetchClasses
  } = useClassesData(selectedDate, selectedLevel, selectedInstructor)

  // Handlers
  const handleCreateClass = () => setIsCreatingClass(true)
  const handleEditClass = (classItem: Class) => setEditingClass(classItem)
  const handleDeleteClass = async (classItem: Class) => { ... }
  const handleEnroll = (classItem: Class) => {
    setSelectedClass(classItem)
    setShowEnrollment(true)
  }
  const handleAttendance = (classItem: Class) => {
    setSelectedClass(classItem)
    setShowAttendance(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Clases</h1>
        <ButtonModern onClick={handleCreateClass}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Clase
        </ButtonModern>
      </div>

      {/* Filters */}
      <ClassFilters
        selectedDate={selectedDate}
        selectedLevel={selectedLevel}
        selectedInstructor={selectedInstructor}
        instructors={instructors}
        onDateChange={setSelectedDate}
        onLevelChange={setSelectedLevel}
        onInstructorChange={setSelectedInstructor}
      />

      {/* Class List */}
      <ClassList
        classes={classes}
        loading={loading}
        onClassClick={setSelectedClass}
        onEdit={handleEditClass}
        onDelete={handleDeleteClass}
        onEnroll={handleEnroll}
        onAttendance={handleAttendance}
      />

      {/* Modals */}
      {isCreatingClass && (
        <ClassFormModal
          courts={courts}
          instructors={instructors}
          classPricing={classPricing}
          onClose={() => setIsCreatingClass(false)}
          onSuccess={fetchClasses}
        />
      )}

      {editingClass && (
        <ClassFormModal
          classToEdit={editingClass}
          courts={courts}
          instructors={instructors}
          classPricing={classPricing}
          onClose={() => setEditingClass(null)}
          onSuccess={fetchClasses}
        />
      )}

      {showEnrollment && selectedClass && (
        <EnrollmentModal
          classItem={selectedClass}
          players={players}
          onClose={() => setShowEnrollment(false)}
          onSuccess={fetchClasses}
        />
      )}

      {showAttendance && selectedClass && (
        <AttendanceModal
          classItem={selectedClass}
          onClose={() => setShowAttendance(false)}
          onSuccess={fetchClasses}
        />
      )}
    </div>
  )
}

export default function ClassesPage() {
  return (
    <DashboardWithNotifications>
      <ClassesContent />
    </DashboardWithNotifications>
  )
}
```

---

## 🛠️ Herramientas para Ayudarte

### Leer Secciones Específicas del Archivo Original

```bash
# Ver líneas 1-100
sed -n '1,100p' app/\(auth\)/dashboard/classes/page.tsx

# Ver líneas 346-450 (handleCreateClass)
sed -n '346,450p' app/\(auth\)/dashboard/classes/page.tsx

# Buscar una función específica
grep -A 50 "const handleEnroll" app/\(auth\)/dashboard/classes/page.tsx
```

### Buscar Patrones

```bash
# Encontrar todos los handlers
grep -n "const handle" app/\(auth\)/dashboard/classes/page.tsx

# Encontrar todos los useEffect
grep -n "useEffect" app/\(auth\)/dashboard/classes/page.tsx

# Encontrar todos los fetch
grep -n "fetch(" app/\(auth\)/dashboard/classes/page.tsx
```

---

## 📚 Recursos Creados

### 1. **MODULO_CLASES_VALIDACION_COMPLETA.md**
Reporte exhaustivo con:
- ✅ Análisis completo del schema Prisma
- ✅ Análisis de todos los API routes
- ✅ Identificación de issues y limitaciones
- ✅ Plan de testing
- ✅ Checklist de validación
- ✅ Recomendaciones para producción

### 2. Archivos Base Creados
- ✅ `types.ts` - Todas las interfaces TypeScript
- ✅ `constants.ts` - Configuración y constantes
- ✅ `hooks/useClassesData.ts` - Hook para fetch de datos
- ✅ `components/ClassFilters.tsx` - Componente de filtros
- ✅ `components/ClassCard.tsx` - Tarjeta de clase

---

## ⚠️ Consideraciones Importantes

### 1. Mantén las Convenciones del Proyecto

**Relaciones en PascalCase:**
```typescript
// ✅ CORRECTO
classItem.Instructor?.name
classItem.Court?.name
classItem.ClassBooking

// ❌ INCORRECTO
classItem.instructor?.name
classItem.court?.name
```

### 2. Campos Requeridos en CreateInput

```typescript
// ✅ CORRECTO
await prisma.class.create({
  data: {
    id: uuidv4(),          // Requerido
    updatedAt: new Date(), // Requerido
    // ...otros campos
  }
})
```

### 3. Error Handling

```typescript
// ✅ CORRECTO
catch (error) {
  console.error('Error:', error)
  notify({
    type: 'error',
    message: error instanceof Error ? error.message : 'Error desconocido'
  })
}
```

---

## 🎯 Conclusión

### Estado Actual: 40% Completado

**✅ Completado:**
- Validación exhaustiva del módulo
- Estructura base de refactorización
- Types, constants y hook principal
- Componentes ClassFilters y ClassCard

**⏳ Pendiente:**
- 2 hooks adicionales (useClassForm, useEnrollment)
- 5 componentes adicionales (modals y vistas)
- Refactorización de page.tsx principal
- Testing

### Tiempo Estimado Restante: 4-6 horas

**Próximo paso inmediato:**
Crear `useClassForm.ts` usando la lógica existente en el archivo original (líneas 282-550 aproximadamente).

---

## 🆘 Si Necesitas Ayuda

1. **Para leer secciones del archivo original:**
   - Usa `sed` o `head`/`tail` para ver rangos específicos
   - Usa `grep` para buscar funciones específicas

2. **Para crear componentes:**
   - Sigue el patrón de ClassCard.tsx
   - Mantén props tipadas
   - Usa los types de `types.ts`

3. **Para debugging:**
   - Verifica imports
   - Verifica que todos los componentes estén exportados
   - Revisa la consola del navegador

**¿Preguntas?** Avísame y te ayudo con el siguiente paso.
