# Análisis del Módulo de Clases - Padelyzer

## 📋 Estado Actual

### Estructura del Módulo

1. **Frontend**
   - `/app/c/[clubSlug]/dashboard/classes/page.tsx` - Componente principal
   - Vistas: Calendario, Lista, Reportes
   - Gestión de instructores y estudiantes

2. **Backend API**
   - `/app/api/classes/` - CRUD de clases
   - Endpoints para inscripciones, asistencia, pagos
   - Soporte para clases recurrentes

3. **Base de Datos (Prisma)**
   - Modelo `Class` con soporte para diferentes tipos
   - Modelo `ClassEnrollment` para inscripciones
   - Relaciones con `Court`, `Club`, `Instructor`

### 🎯 Valores Hardcoded Identificados

1. **Valores por Defecto en el Formulario**
   ```typescript
   // page.tsx línea 138-162
   type: 'GROUP',
   level: 'BEGINNER', 
   duration: 60,
   maxStudents: 8,
   price: 0,
   paymentMethod: 'online'
   ```

2. **Configuración de Recurrencia**
   ```typescript
   recurrencePattern: {
     frequency: 'WEEKLY',
     interval: 1,
     occurrences: 12,
     endDate: null
   }
   ```

3. **Tipos de Clase (Frontend)**
   ```typescript
   const classTypes = {
     INDIVIDUAL: 'Individual',
     GROUP: 'Grupal',
     CLINIC: 'Clínica',
     INTENSIVE: 'Intensivo'
   }
   ```
   ⚠️ **Nota**: No coinciden exactamente con el schema Prisma que tiene: `GROUP`, `PRIVATE`, `SEMI_PRIVATE`

4. **Estados de Clase**
   ```typescript
   const classStatuses = {
     SCHEDULED: { label: 'Programada', color: '#3b82f6' },
     IN_PROGRESS: { label: 'En Progreso', color: '#eab308' },
     COMPLETED: { label: 'Completada', color: '#16a34a' },
     CANCELLED: { label: 'Cancelada', color: '#ef4444' }
   }
   ```

### 🔄 Fallbacks y Manejo de Errores

1. **Manejo de Errores Básico**
   - Uso de `alert()` para mostrar errores (no ideal para UX)
   - `console.error()` para logging
   - Sin componentes de error dedicados

2. **Fallbacks en Fetch**
   ```typescript
   } catch (error) {
     console.error('Error fetching classes:', error)
     setClasses([]) // Fallback a array vacío
   }
   ```

3. **Validaciones**
   - Validación básica de campos requeridos en el backend
   - Verificación de disponibilidad de cancha
   - Sin validación de lado cliente robusta

### ⚠️ Problemas Identificados

1. **Inconsistencias de Tipos**
   - Frontend define tipos de clase diferentes al schema Prisma
   - Mezcla de inglés/español en constantes

2. **UX de Errores**
   - Uso de `alert()` nativo del navegador
   - Falta sistema de notificaciones consistente

3. **Configuración Hardcoded**
   - Precios, duración, máximo de estudiantes sin configuración dinámica
   - Sin forma de personalizar valores por club

4. **Falta de Internacionalización**
   - Textos en español hardcoded
   - Sin soporte para múltiples idiomas

### ✅ Aspectos Positivos

1. **Funcionalidad Completa**
   - CRUD completo de clases
   - Sistema de inscripciones
   - Control de asistencia
   - Reportes básicos

2. **Soporte de Recurrencia**
   - Permite crear clases recurrentes
   - Manejo de conflictos de horario

3. **Integración con Pagos**
   - Soporte para pagos online/presencial
   - Tracking de estado de pago

### 🔧 Recomendaciones

1. **Configuración Dinámica**
   - Mover valores por defecto a configuración del club
   - Permitir personalizar tipos de clase, duración, precios

2. **Mejorar Manejo de Errores**
   - Implementar sistema de notificaciones toast
   - Agregar boundaries de error de React
   - Mejorar mensajes de error

3. **Sincronizar Tipos**
   - Alinear tipos frontend/backend
   - Usar tipos generados de Prisma

4. **Internacionalización**
   - Extraer todos los textos a archivos de traducción
   - Implementar sistema i18n

5. **Validación Robusta**
   - Agregar validación de formularios (zod/yup)
   - Validación en tiempo real
   - Mejor feedback visual