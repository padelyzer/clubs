# Plan de Migración: Unificación de Design System
**Fecha**: 14 de Octubre, 2025
**Objetivo**: Migrar Clases y Torneos a AppleModal para consistencia total con Bookings

---

## 📋 FASE 1: AUDITORÍA DE FUNCIONALIDADES

### 🎓 MÓDULO CLASES - Inventario Completo

#### **Ruta Actual**: `/dashboard/classes`

#### **Modales Existentes** (5 totales):

##### 1. **EnrollmentModal** - Inscripción de Estudiantes
**Archivo**: `app/(auth)/dashboard/classes/components/EnrollmentModal.tsx`
**Estado Actual**: ModernModal ✅
**Funcionalidades**:
- [ ] Seleccionar jugador existente (dropdown con lista de players)
- [ ] Crear nuevo estudiante (nombre, email, teléfono)
- [ ] Ver información de la clase (fecha, horario, instructor, precio)
- [ ] Mostrar disponibilidad de lugares
- [ ] Validar clase llena (bloquear inscripción si no hay lugares)
- [ ] Opciones de pago:
  - [ ] Pago en línea (envía link por WhatsApp)
  - [ ] Pago en sitio (efectivo/tarjeta)
- [ ] Pago dividido:
  - [ ] Checkbox para dividir pago
  - [ ] Selector de número de pagos (2-4)
  - [ ] Calcular monto por pago
- [ ] Notas adicionales (textarea)
- [ ] Validaciones: nombre y teléfono requeridos
- [ ] Loading states durante inscripción
- [ ] Integración con useEnrollment hook

**APIs usadas**:
- `POST /api/classes/[id]/enroll`

**Hooks personalizados**:
- `useEnrollment(classItem, onSuccess)`

**Edge Cases**:
- ✋ Clase llena
- ✋ Jugador duplicado
- ✋ Error al enviar WhatsApp
- ✋ Fallos de red

---

##### 2. **PaymentModal** - Registro de Pagos
**Archivo**: `app/(auth)/dashboard/classes/components/PaymentModal.tsx`
**Estado Actual**: ModernModal ✅
**Funcionalidades**:
- [ ] Mostrar información del estudiante
- [ ] Mostrar clase y adeudo total
- [ ] Input de monto a pagar (con botones quick: 100%, 50%)
- [ ] Validar monto > 0
- [ ] Confirmar si monto > adeudo
- [ ] Selector de método de pago:
  - [ ] Efectivo (cash)
  - [ ] Transferencia (transfer) - requiere referencia
  - [ ] Terminal (terminal)
  - [ ] En línea (online) - requiere referencia
- [ ] Campo de referencia/folio (condicional)
- [ ] Checkbox "Enviar recibo por WhatsApp"
- [ ] Resumen visual:
  - [ ] Adeudo actual
  - [ ] Pago a registrar
  - [ ] Saldo restante (verde si completo, naranja si pendiente)
- [ ] Loading states durante registro

**APIs usadas**:
- `POST /api/classes/pending-payments`

**Props recibidos**:
- `bookingId`: string
- `studentName`: string
- `dueAmount`: number (en centavos)
- `className`: string
- `onClose`: función
- `onSuccess`: función

**Edge Cases**:
- ✋ Monto 0
- ✋ Monto mayor al adeudo
- ✋ Referencia faltante cuando es requerida
- ✋ Error al enviar WhatsApp

---

##### 3. **AttendanceModal** - Control de Asistencia Masivo
**Archivo**: `app/(auth)/dashboard/classes/components/AttendanceModal.tsx`
**Estado Actual**: ModernModal ✅
**Funcionalidades**:
- [ ] Cargar lista de estudiantes inscritos desde API
- [ ] Mostrar estadísticas en tiempo real:
  - [ ] Total inscritos
  - [ ] Check-in realizados
  - [ ] Pagos completos
  - [ ] Pendientes
- [ ] Acciones rápidas:
  - [ ] Marcar todos Presentes
  - [ ] Marcar todos Tarde
- [ ] Por cada estudiante:
  - [ ] Ver nombre y teléfono
  - [ ] Ver si ya tiene check-in (deshabilitado si ya registró)
  - [ ] Botones de asistencia:
    - [ ] Presente (verde)
    - [ ] Tarde (amarillo)
    - [ ] Ausente (rojo)
  - [ ] Si necesita pago y está presente/tarde:
    - [ ] Mostrar monto sugerido
    - [ ] Selector de método de pago (Efectivo, Tarjeta, Transferencia, Online, Gratis)
- [ ] Contador de estudiantes seleccionados en footer
- [ ] Botón "Procesar Check-in" con contador
- [ ] Loading durante fetch y submit
- [ ] Notificaciones de éxito con resumen:
  - [ ] Total procesados
  - [ ] Ingresos generados

**APIs usadas**:
- `GET /api/classes/[id]/quick-checkin` - Cargar lista
- `POST /api/classes/[id]/quick-checkin` - Enviar asistencias

**Estado local complejo**:
- `students`: Array de objetos Student
- `attendance`: Map<classBookingId, StudentAttendance>
- `stats`: objeto con contadores

**Edge Cases**:
- ✋ Lista vacía (sin estudiantes)
- ✋ Estudiante ya con check-in
- ✋ Error al cargar lista
- ✋ Error al procesar check-in masivo
- ✋ Pago sin método seleccionado

---

##### 4. **ClassDetailsModal** - Ver Detalles de Clase
**Archivo**: `app/(auth)/dashboard/classes/components/ClassDetailsModal.tsx`
**Estado Actual**: ModalPortal (legacy) ⚠️
**Funcionalidades**:
- [ ] Información general de la clase:
  - [ ] Nombre, descripción
  - [ ] Fecha y horario
  - [ ] Cancha
  - [ ] Instructor
  - [ ] Nivel (principiante, intermedio, avanzado)
  - [ ] Precio
- [ ] Estadísticas:
  - [ ] Inscritos vs capacidad máxima
  - [ ] Check-ins realizados
  - [ ] Pagos completados
- [ ] Lista de estudiantes inscritos:
  - [ ] Nombre, email, teléfono
  - [ ] Estado de pago (badge: completo, pendiente, sin pago)
  - [ ] Check-in status
  - [ ] Botón "Cobrar" si tiene adeudo
- [ ] Loading durante fetch de estudiantes
- [ ] Estado vacío si no hay estudiantes

**APIs usadas**:
- `GET /api/classes/[id]/bookings` - Lista de estudiantes

**Edge Cases**:
- ✋ Error al cargar estudiantes
- ✋ Lista vacía
- ✋ Datos incompletos de estudiante

---

##### 5. **ClassFormModal** - Crear/Editar Clase
**Archivo**: `app/(auth)/dashboard/classes/components/ClassFormModal.tsx`
**Estado Actual**: ModalPortal (legacy) ⚠️
**Funcionalidades**:
- [ ] Información básica:
  - [ ] Nombre (requerido)
  - [ ] Descripción
  - [ ] Tipo (dropdown: PADEL, TENNIS, etc.)
  - [ ] Nivel (dropdown con CLASS_LEVELS)
  - [ ] Instructor (dropdown de lista) - requerido
- [ ] Horario:
  - [ ] Fecha (date picker) - requerido
  - [ ] Hora inicio (time picker) - requerido
  - [ ] Duración en minutos (number, step 30) - requerido
  - [ ] Hora fin (calculado automáticamente, disabled)
  - [ ] Cancha (dropdown de lista) - requerido
- [ ] Verificación de disponibilidad:
  - [ ] Loading indicator "Verificando disponibilidad..."
  - [ ] Success: "Horario disponible" (verde)
  - [ ] Warning: Mensaje de conflictos (amarillo)
  - [ ] Mostrar número de conflictos encontrados
  - [ ] Deshabilitar submit si hay conflictos (solo en crear)
- [ ] Capacidad y precio:
  - [ ] Estudiantes máximos (1-20) - requerido
  - [ ] Precio en MXN (step 50) - requerido
- [ ] Recurrencia (solo crear, no editar):
  - [ ] Checkbox "Clase Recurrente"
  - [ ] Si recurrente:
    - [ ] Frecuencia (WEEKLY, MONTHLY)
    - [ ] Intervalo (número)
    - [ ] Ocurrencias (número de clases a crear)
    - [ ] Preview: "Se crearán X clases semanales/mensuales"
- [ ] Notas adicionales
- [ ] Botón submit deshabilitado si:
  - [ ] Loading
  - [ ] Hay conflictos de disponibilidad (solo crear)
- [ ] Diferentes labels: "Crear Clase" vs "Actualizar Clase"

**APIs usadas**:
- `POST /api/classes` - Crear
- `PUT /api/classes?id=[id]` - Actualizar
- Integración con `/api/bookings/availability/check` para verificar

**Hooks personalizados**:
- `useClassForm(classPricing, courts, classToEdit, onSuccess)`

**Props**:
- `classToEdit`: Class | null (null = crear, objeto = editar)
- `courts`: array
- `instructors`: array
- `classPricing`: objeto de precios
- `onClose`, `onSuccess`

**Edge Cases**:
- ✋ Conflictos de horario
- ✋ Cancha/instructor no disponible
- ✋ Error al crear recurrencia
- ✋ Validaciones de campos

---

#### **Componentes Auxiliares**:

##### **ClassCard** - Tarjeta de Clase Individual
**Funcionalidades**:
- [ ] Mostrar información de clase
- [ ] Badge de nivel con colores
- [ ] Badge de estado
- [ ] Indicador de ocupación con barra de progreso
- [ ] Acciones rápidas: Ver, Editar, Eliminar

##### **ClassList** - Lista de Clases
**Funcionalidades**:
- [ ] Grid responsivo de ClassCards
- [ ] Loading states
- [ ] Empty state
- [ ] Paginación/infinite scroll (si aplica)

##### **ClassFilters** - Filtros de Búsqueda
**Funcionalidades**:
- [ ] Selector de fecha (date picker)
- [ ] Filtro por nivel
- [ ] Filtro por instructor
- [ ] Reset filters

##### **PendingPaymentsView** - Vista de Pagos Pendientes
**Funcionalidades**:
- [ ] Lista de estudiantes con adeudos
- [ ] Mostrar monto pendiente por estudiante
- [ ] Botón "Cobrar" que abre PaymentModal
- [ ] Estadísticas totales

---

#### **Hooks Personalizados**:

##### **useClassForm**
**Responsabilidades**:
- Manejo de form state
- Cálculo automático de hora fin
- Verificación de disponibilidad (debounced)
- Submit handlers (crear/actualizar)
- Reset form

##### **useClassesData**
**Responsabilidades**:
- Fetch de clases con filtros
- Fetch de instructors
- Fetch de courts
- Fetch de players
- Fetch de class pricing
- Loading states
- Error handling

##### **useEnrollment**
**Responsabilidades**:
- Form state de inscripción
- Handle player select (autofill)
- Submit enrollment
- Validaciones

---

### 🏆 MÓDULO TORNEOS - Inventario Completo

#### **Ruta Actual**: `/c/[clubSlug]/dashboard/tournaments` ⚠️ (LEGACY)
#### **Ruta Objetivo**: `/dashboard/tournaments` ✅

#### **Archivos Principales** (22 totales):

1. `page.tsx` - Lista de torneos (usa CardModern)
2. `[id]/page.tsx` - Detalles de torneo individual
3. `create/page.tsx` - Wizard de creación
4. `TournamentCreationWizard.tsx` - Wizard multi-step
5. `TournamentDetails.tsx` - Vista de detalles
6. `TournamentEditor.tsx` - Edición de torneo
7. `TournamentManagement.tsx` - Gestión general
8. `BracketVisualization.tsx` - Visualización de bracket
9. `MatchQRCode.tsx` - QR para partidos
10. `PlayerRankings.tsx` - Rankings
11. `QRCheckIn.tsx` - Check-in con QR
12. `tournament-qr.tsx` - Generador de QR

**Funcionalidades a preservar**:
- [ ] CRUD de torneos
- [ ] Wizard de creación multi-step
- [ ] Gestión de inscripciones
- [ ] Generación de brackets
- [ ] Gestión de partidos
- [ ] Check-in con QR
- [ ] Visualización de rankings
- [ ] Sistema de pagos
- [ ] Notificaciones a participantes
- [ ] Resolución de conflictos de horario

---

## 🎯 FASE 2: ANÁLISIS DE COMPONENTES COMPARTIDOS

### **CardModern** ✅
- Usado en: Bookings, Clases, Torneos
- Estado: Consistente en todos los módulos
- Acción: **NO TOCAR** ✅

### **ButtonModern** ✅
- Usado en: Bookings (como ButtonModern), Clases (como ButtonModern)
- Estado: Consistente
- Acción: **NO TOCAR** ✅

### **Modales**:
- **Bookings**: AppleModal ✅
- **Clases**: ModernModal (nuevo, inconsistente) ❌
- **Torneos**: Sin modales modernos ❌
- **Acción**: **UNIFICAR A AppleModal**

### **Inputs**:
- **Bookings**: AppleInput ✅
- **Clases**: InputModern ⚠️
- **Torneos**: Mix ❌
- **VERIFICADO**: AppleInput y InputModern son DIFERENTES ⚠️
  - **AppleInput**: Props específicas (value, onChange, type, etc.)
  - **InputModern**: Extiende HTMLInputAttributes (más flexible)
  - **DECISIÓN**: Mantener InputModern en Clases, NO migrar a AppleInput
  - **Razón**: InputModern es más compatible con forms existentes

---

## 📝 FASE 3: PLAN DE MIGRACIÓN PASO A PASO

### **ETAPA 1: Preparación y Verificación** (30 min)

#### 1.1 Verificar compatibilidad AppleModal vs ModernModal
- [x] Comparar props de AppleModal vs ModernModal ✅
- [x] Identificar diferencias críticas ✅
- [x] Verificar si AppleModal soporta: ✅
  - [x] Diferentes tamaños (small, medium, large, fullscreen) ✅
    - **NOTA**: ModernModal usa 'xlarge', usar 'large' o 'fullscreen' en AppleModal
  - [x] Footer personalizado (footer: React.ReactNode) ✅
  - [x] Subtitle ✅
  - [x] Loading states dentro del modal ✅

**RESULTADO**: AppleModal es COMPATIBLE con todas las necesidades actuales ✅

#### 1.2 Crear branch de migración
```bash
git checkout -b feature/unify-design-system
```

#### 1.3 Backup de archivos actuales
- [ ] Crear carpeta `_backup_design_migration/`
- [ ] Copiar todos los modales actuales

---

### **ETAPA 2: Migración de Clases a AppleModal** (2 horas)

#### 2.1 EnrollmentModal (30 min)
**Checklist de migración**:
- [ ] Importar AppleModal, AppleButton (NO tocar inputs)
- [ ] Reemplazar ModernModal con AppleModal
- [ ] Verificar props: `isOpen`, `onClose`, `title`, `subtitle`, `size='medium'`
- [ ] Reemplazar ButtonModern → AppleButton
- [ ] **MANTENER InputModern** (NO migrar a AppleInput)
- [ ] Ajustar estilos inline si es necesario
- [ ] Testing manual:
  - [ ] Abrir modal
  - [ ] Seleccionar jugador existente
  - [ ] Crear nuevo estudiante
  - [ ] Pago en línea vs pago en sitio
  - [ ] Pago dividido (2, 3, 4 pagos)
  - [ ] Validar clase llena
  - [ ] Submit exitoso
  - [ ] Submit con error
  - [ ] Cerrar modal (X, ESC, click fuera)

#### 2.2 PaymentModal (20 min)
**Checklist de migración**:
- [ ] Migrar a AppleModal
- [ ] Migrar botones a AppleButton
- [ ] Testing manual:
  - [ ] Mostrar adeudo correcto
  - [ ] Botones quick (100%, 50%)
  - [ ] Validar monto 0
  - [ ] Validar monto > adeudo
  - [ ] Todos los métodos de pago
  - [ ] Campo de referencia condicional
  - [ ] Checkbox WhatsApp
  - [ ] Resumen visual correcto
  - [ ] Submit exitoso

#### 2.3 AttendanceModal (40 min) ⚠️ **COMPLEJO**
**Checklist de migración**:
- [ ] Migrar a AppleModal con footer personalizado
- [ ] Verificar que el footer de AppleModal acepta React.ReactNode
- [ ] Migrar botones en quick actions
- [ ] Testing manual:
  - [ ] Cargar lista de estudiantes
  - [ ] Estadísticas correctas
  - [ ] Marcar todos Presentes
  - [ ] Marcar todos Tarde
  - [ ] Selección individual (Presente, Tarde, Ausente)
  - [ ] Pago condicional si presente/tarde
  - [ ] Contador en footer
  - [ ] Submit masivo
  - [ ] Notificación de éxito con resumen

#### 2.4 ClassDetailsModal (20 min)
**Checklist de migración**:
- [ ] Migrar de ModalPortal → AppleModal
- [ ] Migrar botones
- [ ] Testing manual:
  - [ ] Ver información de clase
  - [ ] Ver estadísticas
  - [ ] Lista de estudiantes
  - [ ] Botón "Cobrar" abre PaymentModal
  - [ ] Estados vacíos

#### 2.5 ClassFormModal (30 min) ⚠️ **COMPLEJO**
**Checklist de migración**:
- [ ] Migrar de ModalPortal → AppleModal
- [ ] Migrar botones a AppleButton
- [ ] **MANTENER InputModern** (NO migrar inputs)
- [ ] Verificar form validation
- [ ] Testing manual:
  - [ ] Crear clase simple
  - [ ] Crear clase recurrente (3 ocurrencias)
  - [ ] Verificación de disponibilidad
  - [ ] Conflictos de horario
  - [ ] Editar clase existente
  - [ ] Validaciones de campos requeridos
  - [ ] Cálculo de hora fin automático

---

### **ETAPA 3: Migración de Torneos** (3 horas)

#### 3.1 Crear nueva estructura `/dashboard/tournaments`
- [ ] Crear carpeta `app/(auth)/dashboard/tournaments/`
- [ ] Copiar archivos de `app/c/[clubSlug]/dashboard/tournaments/`
- [ ] Actualizar imports y rutas

#### 3.2 Identificar y migrar modales en Torneos
**Pendiente**: Necesito listar qué modales hay en torneos

#### 3.3 Testing completo de torneos
- [ ] CRUD de torneos
- [ ] Wizard de creación
- [ ] Gestión de bracket
- [ ] Check-in
- [ ] QR codes
- [ ] Rankings

---

### **ETAPA 4: Limpieza y Deprecación** (30 min)

#### 4.1 Eliminar código obsoleto
- [ ] Eliminar ModernModal.tsx
- [ ] Eliminar ModalPortal.tsx (si ya no se usa)
- [ ] Deprecar ruta `/c/[clubSlug]/dashboard/tournaments`
- [ ] Crear redirect automático

#### 4.2 Actualizar documentación
- [ ] Actualizar README con nuevo design system
- [ ] Documentar uso de AppleModal
- [ ] Ejemplos de uso

---

### **ETAPA 5: Testing Integral** (1 hora)

#### 5.1 Testing de regresión en Bookings
- [ ] Verificar que bookings sigue funcionando
- [ ] Nueva reserva
- [ ] Check-in
- [ ] Pago
- [ ] Editar/cancelar

#### 5.2 Testing de Clases (funcionalidades completas)
- [ ] Crear clase simple
- [ ] Crear clase recurrente
- [ ] Editar clase
- [ ] Inscribir estudiante
- [ ] Control de asistencia masivo
- [ ] Registrar pago parcial
- [ ] Registrar pago completo
- [ ] Ver detalles de clase

#### 5.3 Testing de Torneos (funcionalidades completas)
- [ ] Crear torneo
- [ ] Inscribir jugadores
- [ ] Generar bracket
- [ ] Gestionar partidos
- [ ] Check-in con QR
- [ ] Ver rankings

---

## 🚨 RIESGOS IDENTIFICADOS

### **Riesgo Alto** 🔴
1. **AttendanceModal con footer personalizado**
   - ¿AppleModal acepta footer como prop?
   - Verificar antes de migrar

2. **Hooks personalizados complejos**
   - useClassForm tiene lógica de negocio crítica
   - No romper disponibilidad checking

3. **Pago dividido en EnrollmentModal**
   - Lógica de calcular split payments
   - Verificar que se preserve

### **Riesgo Medio** 🟡
1. **InputModern vs AppleInput**
   - ¿Son compatibles?
   - Verificar props y estilos

2. **Recurrencia en ClassFormModal**
   - Lógica compleja de crear múltiples clases
   - Testing exhaustivo necesario

3. **Ruta legacy de Torneos**
   - URLs compartidos en producción
   - Necesario redirect 301

### **Riesgo Bajo** 🟢
1. **Estilos inline**
   - Algunos colores hardcodeados
   - Fácil de ajustar

---

## ✅ CRITERIOS DE ÉXITO

La migración será exitosa cuando:

- [ ] ✅ Todos los modales usan AppleModal
- [ ] ✅ Todos los botones usan AppleButton
- [ ] ✅ **Inputs**: Se mantiene InputModern en Clases (decisión documentada)
- [ ] ✅ Torneos en ruta `/dashboard/tournaments`
- [ ] ✅ Cero errores de TypeScript
- [ ] ✅ Cero regresiones funcionales
- [ ] ✅ UI consistente en todos los módulos (modales + botones)
- [ ] ✅ Todas las features funcionan igual o mejor
- [ ] ✅ Testing manual completo (ver checklists)
- [ ] ✅ Build exitoso en Vercel

**NOTA IMPORTANTE**:
- ✅ Los **inputs** NO se migrarán de InputModern → AppleInput
- ✅ Razón: InputModern es más flexible y compatible con forms HTML estándar
- ✅ Esto NO afecta la consistencia visual del design system

---

## 📅 TIMELINE ESTIMADO

| Etapa | Duración | Responsable |
|-------|----------|-------------|
| Preparación | 30 min | Claude |
| Clases → AppleModal | 2 hrs | Claude |
| Torneos → AppleModal | 3 hrs | Claude |
| Limpieza | 30 min | Claude |
| Testing integral | 1 hr | Usuario + Claude |
| **TOTAL** | **7 horas** | |

---

## 🔄 ROLLBACK PLAN

Si algo sale mal:

1. **Commits pequeños**: Cada modal = 1 commit
2. **Branch separado**: `feature/unify-design-system`
3. **Backup folder**: `_backup_design_migration/`
4. **Revert fácil**: `git revert <commit>`

---

## 📞 SIGUIENTES PASOS

1. **USUARIO APRUEBA PLAN** ✅
2. **Claude ejecuta ETAPA 1** (Preparación)
3. **Claude ejecuta ETAPA 2** (Clases)
4. **Usuario testing intermedio** 🧪
5. **Claude ejecuta ETAPA 3** (Torneos)
6. **Usuario testing final** 🧪
7. **Deploy a producción** 🚀

---

**Creado por**: Claude Code
**Versión**: 1.0
**Última actualización**: 14 Oct 2025
