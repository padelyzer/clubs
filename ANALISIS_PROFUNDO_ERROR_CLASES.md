# Análisis Profundo: Error al Crear Clase

**Fecha:** 2025-10-14
**Endpoint:** `POST /api/classes`
**Status:** 500 Internal Server Error

---

## 🔍 ANÁLISIS DEL ENDPOINT

### Flujo de Ejecución (líneas 120-475)

#### 1. **Autenticación** (líneas 122-129)
```typescript
const session = await requireAuthAPI()
if (!session) {
  return 401 "No autorizado"
}
```
✅ **PASA** - Usuario está autenticado

---

#### 2. **Validaciones Iniciales** (líneas 133-146)
```typescript
// Campos requeridos
if (!body.instructorId || !body.name || !body.date || !body.startTime || !body.endTime) {
  return 400 "Faltan campos requeridos"
}

// Cancha requerida
if (!body.courtId) {
  return 400 "La cancha es requerida para crear una clase"
}
```

**Payload recibido:**
```json
{
  "instructorId": "cmg9l3j5c0001pn13emfs9xsz", ✅
  "name": "Clase1", ✅
  "courtId": "court_90e75af6-4ef5-49bf-adb3-a6f2a78e2e8d_1758657359963_64oe5n8m0", ✅
  "date": "2025-10-14", ✅
  "startTime": "14:34", ✅
  "endTime": "16:04", ✅
  ...
}
```
✅ **PASA** - Todos los campos requeridos presentes

---

#### 3. **Verificación de Instructor** (líneas 152-165)
```typescript
const instructor = await prisma.instructor.findFirst({
  where: {
    id: body.instructorId,
    clubId: clubId,
    active: true
  }
})

if (!instructor) {
  return 404 "Instructor no encontrado"
}
```
✅ **PROBABLEMENTE PASA** - El instructor existe (si fallara aquí, retornaría 404, no 500)

---

#### 4. **Verificación de Cancha** (líneas 168-200)
```typescript
const court = await prisma.court.findFirst({
  where: {
    id: body.courtId,
    clubId: clubId,
    active: true
  }
})

if (!court) {
  return 404 "Cancha no encontrada o no está activa"
}
```
✅ **PROBABLEMENTE PASA** - La cancha existe (si fallara aquí, retornaría 404, no 500)

---

#### 5. **Obtención de Club Settings** (líneas 202-254)
```typescript
const clubSettings = await prisma.clubSettings.findFirst({
  where: { clubId }
})

// Calcular precio
let priceInCents = Math.round(body.price * 100) // 3000 * 100 = 300000

// Calcular duración
const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
// (16 * 60 + 4) - (14 * 60 + 34) = 964 - 874 = 90 minutos

// Calcular courtCost
const courtCost = Math.round((courtCostPerHour * duration) / 60)

// Calcular instructorCost
// Depende del instructor.paymentType
```
✅ **PASA** - Cálculos matemáticos correctos

---

#### 6. **Preparación de baseClassData** (líneas 323-345)

```typescript
const baseClassData = {
  id: 'class_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11), ✅
  clubId, ✅
  instructorId: body.instructorId, ✅
  instructorName: instructor.name, ✅
  name: body.name, ✅
  description: body.description || null, ✅
  type: body.type || 'GROUP', ✅
  level: body.level || 'BEGINNER', ✅
  startTime: body.startTime, ✅
  endTime: body.endTime, ✅
  duration, ✅
  courtId: body.courtId || null, ✅
  maxStudents: body.maxStudents || clubSettings?.defaultMaxStudents || 8, ✅
  enrolledCount: 0, ✅
  price: priceInCents, ✅
  courtCost, ✅ ⚠️ POTENCIAL PROBLEMA
  instructorCost, ✅ ⚠️ POTENCIAL PROBLEMA
  currency: 'MXN', ✅
  status: 'SCHEDULED', ✅
  notes: body.notes || null, ✅
  updatedAt: new Date() ✅
}
```

**Comparación con Schema de Prisma:**

| Campo | En baseClassData | Schema Require | Status |
|-------|------------------|----------------|--------|
| id | ✅ | ✅ (String @id) | OK |
| clubId | ✅ | ✅ (String) | OK |
| courtId | ✅ | String? (opcional) | OK |
| name | ✅ | ✅ (String) | OK |
| description | ✅ | String? (opcional) | OK |
| instructorId | ✅ | String? (opcional) | OK |
| instructorName | ✅ | ✅ (String) | OK |
| level | ✅ | @default(ALL_LEVELS) | OK |
| type | ✅ | @default(GROUP) | OK |
| maxStudents | ✅ | @default(8) | OK |
| enrolledCount | ✅ | @default(0) | OK |
| price | ✅ | ✅ (Int) | OK |
| **courtCost** | **✅** | **@default(0)** | **⚠️ ¿EXISTE EN DB?** |
| **instructorCost** | **✅** | **@default(0)** | **⚠️ ¿EXISTE EN DB?** |
| currency | ✅ | @default("MXN") | OK |
| startTime | ✅ | ✅ (String) | OK |
| endTime | ✅ | ✅ (String) | OK |
| duration | ✅ | ✅ (Int) | OK |
| status | ✅ | @default(SCHEDULED) | OK |
| notes | ✅ | String? (opcional) | OK |
| updatedAt | ✅ | ✅ (DateTime) | OK |
| createdAt | - | @default(now()) | Auto |
| date | - | ✅ (DateTime) | Se agrega después |
| recurring | - | @default(false) | Se agrega después |

---

#### 7. **Creación de Clase NO Recurrente** (líneas 405-441)

```typescript
// Como isRecurring = false (o recurring = false)
// Entra en el bloque ELSE (línea 405)

// Parse date
const [year, month, day] = body.date.split('-').map(Number)
const classDate = new Date(year, month - 1, day)
// new Date(2025, 9, 14) // Octubre 14, 2025

// Check availability
const isAvailable = await checkAvailability(classDate, body.courtId)

if (!isAvailable) {
  return 409 "El horario no está disponible"
}

// Create single class
const classItem = await prisma.class.create({
  data: {
    ...baseClassData,
    date: classDate,
    recurring: false
  },
  include: {
    Instructor: true,
    Court: true,
    _count: {
      select: {
        ClassBooking: true
      }
    }
  }
})
```

**Aquí es donde probablemente falla** ⬆️

---

## 🚨 HIPÓTESIS DEL ERROR

### **HIPÓTESIS PRINCIPAL: Campos courtCost e instructorCost NO existen en DB de producción**

#### Evidencia:

1. **Script SQL ejecutado pero no confirmado**
   - Usuario ejecutó `fix-class-fields.sql`
   - Solo reportó: `| total_classes | 0 |`
   - **NO confirmó** ver la tabla de verificación con courtCost e instructorCost

2. **Error sin detalles**
   - Response solo muestra: `{"success": false, "error": "Error al crear clase"}`
   - Falta el campo `details` que agregué en commit `fac7164`
   - Esto sugiere que **el deploy aún no completó** con mis cambios
   - O que el error ocurre ANTES de llegar al catch block

3. **Error típico de Prisma con columnas faltantes**
   ```
   The column `Class.courtCost` does not exist in the current database.
   ```
   Este es el MISMO error que obtuvimos antes con el endpoint de diagnóstico

#### Flujo del Error:

```typescript
// Línea 423
const classItem = await prisma.class.create({
  data: {
    ...baseClassData,  // Incluye courtCost e instructorCost
    date: classDate,
    recurring: false
  }
})

// Prisma genera SQL:
INSERT INTO "Class" (
  id, clubId, instructorId, instructorName, name, ...,
  courtCost,      // ❌ Columna NO existe en DB
  instructorCost, // ❌ Columna NO existe en DB
  ...
) VALUES (...)

// PostgreSQL retorna:
ERROR: column "courtCost" of relation "Class" does not exist

// Prisma lanza excepción
// Entra al catch block (línea 463)

catch (error) {
  console.error('Error creating class:', error)
  return NextResponse.json(
    {
      success: false,
      error: 'Error al crear clase',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    },
    { status: 500 }
  )
}
```

**PERO** si el deploy no completó, el código en producción AÚN es:

```typescript
catch (error) {
  console.error('Error creating class:', error)
  return NextResponse.json(
    { success: false, error: 'Error al crear clase' },  // ❌ Sin details
    { status: 500 }
  )
}
```

---

## 🔧 DIAGNÓSTICO REQUERIDO

### **Necesitamos confirmar 2 cosas:**

### 1️⃣ **¿Los campos existen en la base de datos?**

Ejecuta esta query en Supabase SQL Editor:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Class'
AND column_name IN ('courtCost', 'instructorCost', 'price', 'id')
ORDER BY column_name;
```

**Resultado ESPERADO:**
```
| column_name    | data_type | column_default |
|----------------|-----------|----------------|
| courtCost      | integer   | 0              |
| id             | text      | NULL           |
| instructorCost | integer   | 0              |
| price          | integer   | NULL           |
```

**Si NO aparecen courtCost e instructorCost** = CONFIRMADO que ese es el problema

---

### 2️⃣ **¿El deploy completó con los cambios?**

Revisa el log de despliegue en Vercel:
- https://vercel.com/[tu-proyecto]/deployments
- Busca el deploy del commit `445df9f` o `fac7164`
- Verifica que esté en estado **"Ready"** (no Building)

**O prueba manualmente:**

Intenta acceder a:
```
https://www.padelyzer.app/api/debug-create-class
```

Si retorna "This page could not be found" = Deploy NO completó
Si retorna método POST requerido = Deploy completó

---

## 📊 POSIBLES ESCENARIOS

### **Escenario A: Campos NO existen en DB** (Más probable)

**Síntoma:**
- Error 500 sin details
- Script SQL ejecutado pero no verificado
- Error idéntico al que tuvimos antes

**Solución:**
1. Verificar query de esquema en Supabase
2. Si campos no existen, re-ejecutar script SQL:
   ```sql
   ALTER TABLE "Class" ADD COLUMN "courtCost" INTEGER NOT NULL DEFAULT 0;
   ALTER TABLE "Class" ADD COLUMN "instructorCost" INTEGER NOT NULL DEFAULT 0;
   ```
3. Probar crear clase de nuevo

---

### **Escenario B: Deploy no completó**

**Síntoma:**
- Error sin campo `details`
- Endpoints de debug no existen (404)

**Solución:**
1. Esperar 3-5 minutos más
2. Verificar status en Vercel dashboard
3. Si falla, trigger manual redeploy
4. Probar de nuevo

---

### **Escenario C: Otro error en el código**

**Síntoma:**
- Campos existen en DB
- Deploy completó
- Aún hay error 500 con details

**Solución:**
1. Leer el campo `details` del error
2. Identificar error específico
3. Corregir según el mensaje

---

## 🎯 ACCIÓN INMEDIATA REQUERIDA

**Por favor ejecuta AHORA:**

```sql
-- En Supabase SQL Editor
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Class'
AND column_name IN ('courtCost', 'instructorCost')
ORDER BY column_name;
```

**Comparte el resultado completo** (debe mostrar 2 filas si existen, 0 filas si no existen)

---

## 📝 RESUMEN EJECUTIVO

**Endpoint:** POST /api/classes
**Error:** 500 Internal Server Error
**Causa Probable:** Columnas `courtCost` e `instructorCost` NO existen en base de datos
**Evidencia:** Script SQL ejecutado pero no verificado, error sin detalles
**Siguiente Paso:** Verificar existencia de columnas en Supabase

---

**Estado:** BLOQUEADO - Esperando verificación de esquema de base de datos
