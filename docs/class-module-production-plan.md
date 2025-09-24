# Plan de Producción - Módulo de Clases

## 🎯 Objetivo
Hacer el módulo de clases 100% funcional y listo para producción en el menor tiempo posible.

## 📊 Estado Actual
- ✅ Estructura base completa (modelos, API, UI)
- ⚠️ Inconsistencias de tipos frontend/backend
- ⚠️ Valores hardcoded sin configuración
- ⚠️ Manejo de errores básico
- ✅ Funcionalidades core implementadas

## 🚀 Plan de Acción (Ordenado por Prioridad)

### Fase 1: Correcciones Críticas (1-2 días)
**Objetivo**: Resolver problemas que impiden el uso en producción

#### 1.1 Sincronizar Tipos de Clase
```typescript
// Actualizar frontend para usar tipos del schema
enum ClassType {
  GROUP = 'Grupal',
  PRIVATE = 'Individual',
  SEMI_PRIVATE = 'Semi-privado'
}
```

#### 1.2 Verificar Modelo de Instructor
```typescript
// Crear modelo si no existe
model ClassInstructor {
  id          String
  clubId      String
  name        String
  email       String?
  phone       String
  active      Boolean
}
```

#### 1.3 Fix API de Instructores
- Crear endpoint `/api/instructors` si no existe
- Conectar con el modelo correcto

### Fase 2: Funcionalidad Mínima Viable (2-3 días)
**Objetivo**: Asegurar flujo completo funcional

#### 2.1 Configuración de Precios por Club
```typescript
// Agregar a ClubSettings
classPricing: {
  groupPrice: number
  privatePrice: number
  semiPrivatePrice: number
  defaultDuration: number
  defaultMaxStudents: number
}
```

#### 2.2 Mejorar Sistema de Notificaciones
- Reemplazar `alert()` con componente Toast
- Usar el contexto NotificationContext existente
- Mensajes de éxito/error consistentes

#### 2.3 Validación de Formularios
```typescript
// Implementar validación con zod
const classSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  instructorId: z.string().min(1, "Selecciona un instructor"),
  courtId: z.string().min(1, "Selecciona una cancha"),
  date: z.string().min(1, "Selecciona una fecha"),
  // etc...
})
```

#### 2.4 Gestión de Instructores Básica
- UI simple para crear/editar instructores
- Lista de instructores activos/inactivos
- Asignación a clases

### Fase 3: Mejoras de UX (3-5 días)
**Objetivo**: Hacer el módulo fácil de usar

#### 3.1 Vista Calendario Mejorada
- Mostrar clases en calendario visual
- Drag & drop para reprogramar
- Vista por instructor/cancha

#### 3.2 Inscripción Simplificada
- Modal mejorado para inscribir estudiantes
- Búsqueda rápida de jugadores existentes
- Inscripción con código QR

#### 3.3 Control de Asistencia
- Check-in rápido con lista
- Estadísticas de asistencia
- Notificaciones automáticas

### Fase 4: Reportes y Analytics (2-3 días)
**Objetivo**: Proveer insights del negocio

#### 4.1 Reportes Básicos
- Ingresos por clase/instructor
- Asistencia promedio
- Clases más populares
- Exportar a Excel/PDF

#### 4.2 Dashboard de Clases
- Métricas en tiempo real
- Ocupación por horario
- Tendencias mensuales

## 📝 Implementación Inmediata

### Paso 1: Crear Modelo de Instructor (SI NO EXISTE)
```prisma
model Instructor {
  id            String   @id @default(cuid())
  clubId        String
  name          String
  email         String?
  phone         String
  bio           String?
  specialties   String[]
  hourlyRate    Int      @default(0)
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  Club          Club     @relation(fields: [clubId], references: [id])
  Classes       Class[]
  
  @@index([clubId])
}
```

### Paso 2: API de Instructores
```typescript
// /app/api/instructors/route.ts
export async function GET(request: NextRequest) {
  const session = await requireAuthAPI()
  const instructors = await prisma.instructor.findMany({
    where: { clubId: session.clubId }
  })
  return NextResponse.json({ success: true, instructors })
}

export async function POST(request: NextRequest) {
  const session = await requireAuthAPI()
  const data = await request.json()
  
  const instructor = await prisma.instructor.create({
    data: {
      ...data,
      clubId: session.clubId
    }
  })
  
  return NextResponse.json({ success: true, instructor })
}
```

### Paso 3: Configuración de Club para Clases
```typescript
// Agregar a la configuración del club
const defaultClassSettings = {
  groupPrice: 500,
  privatePrice: 1000,
  semiPrivatePrice: 750,
  defaultDuration: 60,
  defaultMaxStudents: 8,
  allowOnlineBooking: true,
  requirePaymentUpfront: false
}
```

### Paso 4: Componente de Notificaciones
```typescript
// Usar el notify existente
const notify = useNotify()

// Reemplazar alert() con:
notify.error({
  title: 'Error',
  message: 'No se pudo crear la clase'
})

notify.success({
  title: 'Éxito',
  message: 'Clase creada correctamente'
})
```

## ⏱️ Timeline Estimado

- **Semana 1**: Fase 1 + Fase 2 (MVP funcional)
- **Semana 2**: Fase 3 (Mejoras UX)
- **Semana 3**: Fase 4 (Reportes) + Testing

## 🎯 Criterios de Éxito

1. **Funcional**
   - ✅ Crear/editar/eliminar clases
   - ✅ Gestionar instructores
   - ✅ Inscribir estudiantes
   - ✅ Control de asistencia
   - ✅ Gestión de pagos

2. **Usable**
   - ✅ Sin errores críticos
   - ✅ Feedback claro al usuario
   - ✅ Flujo intuitivo
   - ✅ Responsive

3. **Configurable**
   - ✅ Precios por tipo de clase
   - ✅ Horarios personalizables
   - ✅ Notificaciones opcionales

## 🚦 Próximos Pasos

1. **HOY**: Verificar si existe modelo Instructor
2. **HOY**: Crear API básica de instructores
3. **MAÑANA**: Sincronizar tipos frontend/backend
4. **ESTA SEMANA**: Implementar configuración de precios

¿Comenzamos con la implementación?