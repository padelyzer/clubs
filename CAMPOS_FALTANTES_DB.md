# Campos Faltantes en Base de Datos - Producción

**Fecha:** 2025-10-14
**Problema:** El schema de Prisma tiene campos que NO existen en la base de datos de producción

---

## 🔍 Campos Faltantes Identificados

### 1. Tabla `Class` ✅ CORREGIDO

| Campo | Tipo | Default | Status |
|-------|------|---------|--------|
| `courtCost` | INTEGER | 0 | ✅ Agregado manualmente |
| `instructorCost` | INTEGER | 0 | ✅ Agregado manualmente |

**Script ejecutado:** `fix-class-fields.sql`

---

### 2. Tabla `ClassBooking` ❌ PENDIENTE

| Campo | Tipo | Default | Status |
|-------|------|---------|--------|
| `checkedIn` | BOOLEAN | false | ❌ FALTA |
| `checkedInAt` | TIMESTAMP | NULL | ❌ FALTA |

**Error producido:**
```
The column `ClassBooking.checkedIn` does not exist in the current database.
```

**Script para corregir:** `fix-classbooking-fields.sql`

---

## 📋 INSTRUCCIONES PARA CORREGIR

### Paso 1: Verificar TODOS los schemas (2 min)

**Ejecuta en Supabase SQL Editor:**

```sql
-- Contenido del archivo: verify-all-schemas.sql
```

Este script verificará campos en:
- Class
- ClassBooking
- Instructor
- Court
- Player

**→ Comparte el resultado completo** (deberían aparecer múltiples tablas)

---

### Paso 2: Agregar campos faltantes a ClassBooking (1 min)

**Ejecuta en Supabase SQL Editor:**

```sql
-- Contenido del archivo: fix-classbooking-fields.sql
```

**Resultado esperado:**
```
NOTICE: Campo checkedIn agregado exitosamente
NOTICE: Campo checkedInAt agregado exitosamente

| column_name  | data_type | column_default | is_nullable |
|--------------|-----------|----------------|-------------|
| checkedIn    | boolean   | false          | NO          |
| checkedInAt  | timestamp | NULL           | YES         |
```

---

### Paso 3: Verificar que los campos se agregaron

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ClassBooking'
AND column_name IN ('checkedIn', 'checkedInAt')
ORDER BY column_name;
```

Debe mostrar 2 filas.

---

## 🎯 Archivos de Scripts SQL Creados

1. **`verify-all-schemas.sql`**
   - Verifica campos en todas las tablas críticas
   - Ejecutar PRIMERO para diagnóstico completo

2. **`fix-classbooking-fields.sql`**
   - Agrega `checkedIn` y `checkedInAt` a tabla ClassBooking
   - Ejecutar DESPUÉS de verificar

3. **`fix-class-fields.sql`** (Ya ejecutado)
   - Agregó `courtCost` e `instructorCost` a tabla Class
   - ✅ Completado

---

## 🚨 Por Qué Sucedió Esto

### Causa Raíz

Las migraciones de Prisma **nunca se ejecutaron en producción**.

**Evidencia:**
1. Schema de Prisma tiene los campos
2. Base de datos de producción NO los tiene
3. Desarrollo local probablemente funciona (DB local tiene las migraciones)

### Por Qué No Se Ejecutaron

El script `vercel-build` originalmente era:
```json
"vercel-build": "prisma generate && next build"
```

NO incluía `prisma migrate deploy`, así que las migraciones nunca se aplicaron.

**Intenté agregar migraciones al build:**
```json
"vercel-build": "prisma migrate deploy && prisma generate && next build"
```

Pero esto **bloqueó el build** porque Vercel no tiene acceso a la DB durante build time.

### Solución Correcta

**Migraciones deben ejecutarse manualmente** en Supabase SQL Editor, o mediante un script post-deploy separado.

---

## 📊 Historial de Correcciones

| Fecha | Tabla | Campo | Acción | Status |
|-------|-------|-------|--------|--------|
| 2025-10-14 | Class | courtCost | Script SQL manual | ✅ |
| 2025-10-14 | Class | instructorCost | Script SQL manual | ✅ |
| 2025-10-14 | ClassBooking | checkedIn | **PENDIENTE** | ❌ |
| 2025-10-14 | ClassBooking | checkedInAt | **PENDIENTE** | ❌ |

---

## 🔄 Próximos Pasos

1. ✅ **Verificar schemas completos** → `verify-all-schemas.sql`
2. ⏳ **Agregar campos ClassBooking** → `fix-classbooking-fields.sql`
3. ⏳ **Corregir otros campos** si `verify-all-schemas.sql` encuentra más
4. ⏳ **Probar módulo de clases** completo

---

## 💡 Prevención Futura

### Opción 1: Migraciones Manuales (Actual)

- Ejecutar scripts SQL manualmente en Supabase
- Documentar en este archivo
- ✅ Pros: Control total, no bloquea builds
- ❌ Contras: Manual, puede olvidarse

### Opción 2: Post-Deploy Script

Crear script que ejecute migraciones DESPUÉS del deploy:

```json
// package.json
"postdeploy": "npx tsx scripts/run-migrations-prod.ts"
```

Requiere configurar webhook en Vercel.

### Opción 3: CI/CD Pipeline

- GitHub Actions que ejecute migraciones
- Antes del deploy a Vercel
- Requiere configuración adicional

**Recomendación:** Por ahora seguir con Opción 1 (manual) hasta que el sistema esté estable.

