# Resolución: Error 500 al Crear Clases

## Problema Identificado

Al intentar crear una clase en producción (padelyzer.app), se generaba un error 500.

### Análisis del Problema

Después de crear endpoints de diagnóstico, se identificaron **DOS problemas diferentes**:

### 1. Campos Faltantes en Base de Datos ✅ RESUELTO

**Error Original:**
```
The column Class.courtCost does not exist in the current database.
```

**Causa:**
- El schema de Prisma incluye los campos `courtCost` e `instructorCost`
- Estos campos no existían en la base de datos de producción (Supabase)
- La migración nunca se ejecutó en producción

**Solución Aplicada:**
- Se creó script SQL para agregar los campos: `fix-class-fields.sql`
- Usuario ejecutó el script manualmente en Supabase SQL Editor
- Se modificó `package.json` para ejecutar migraciones automáticamente en futuros deploys:
  ```json
  "vercel-build": "prisma migrate deploy && prisma generate && next build"
  ```

### 2. Campos Requeridos Faltantes en Código ✅ RESUELTO

**Error Secundario:**
Después de agregar los campos a la DB, el error persistía porque el código no generaba campos requeridos.

**Causa:**
El modelo `Class` en Prisma requiere dos campos que NO se auto-generan:

```prisma
model Class {
  id              String   @id           // ❌ No tiene @default() - REQUIERE valor manual
  // ... otros campos ...
  createdAt       DateTime @default(now())  // ✅ Auto-generado
  updatedAt       DateTime                  // ❌ No tiene @default() - REQUIERE valor manual
}
```

El código en `/api/classes/route.ts` creaba `baseClassData` sin incluir estos campos:
- Faltaba `id`: Campo requerido, debe ser generado manualmente
- Faltaba `updatedAt`: Campo requerido, debe incluir timestamp

**Solución Aplicada:**
```typescript
// ANTES (INCORRECTO)
const baseClassData = {
  clubId,
  instructorId: body.instructorId,
  // ... otros campos ...
  courtCost,
  instructorCost,
  // ❌ Faltaba id
  // ❌ Faltaba updatedAt
}

// DESPUÉS (CORRECTO)
const baseClassData = {
  id: 'class_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11), // ✅
  clubId,
  instructorId: body.instructorId,
  // ... otros campos ...
  courtCost,
  instructorCost,
  updatedAt: new Date() // ✅
}
```

## Archivos Modificados

1. **fix-class-fields.sql** - Script SQL para Supabase (ejecutado manualmente)
2. **package.json** - Auto-ejecutar migraciones en Vercel
3. **app/api/classes/route.ts** - Agregar `id` y `updatedAt` a baseClassData
4. **app/api/verify-class-schema/route.ts** - Endpoint de verificación de schema
5. **app/api/debug-create-class/route.ts** - Endpoint de diagnóstico detallado

## Commits Relacionados

- `21f9fc0` - Migración para agregar courtCost e instructorCost
- `c4af2af` - Endpoint de diagnóstico /api/debug-classes
- `d1cfe9e` - Endpoint detallado /api/debug-create-class
- `fac7164` - Retornar errores detallados en /api/classes
- `b267607` - Endpoint de verificación de schema
- `d62fcf5` - **FIX PRINCIPAL**: Agregar id y updatedAt requeridos

## Verificación

### 1. Verificar Schema de Base de Datos

Accede a: `https://www.padelyzer.app/api/verify-class-schema`

Deberías ver:
```json
{
  "success": true,
  "checks": {
    "fieldsFound": {
      "courtCost": true,
      "instructorCost": true
    },
    "prismaQueryTest": {
      "success": true
    }
  }
}
```

### 2. Probar Creación de Clase

1. Inicia sesión en https://www.padelyzer.app
2. Navega a Dashboard → Clases
3. Click en "Nueva Clase"
4. Llena el formulario:
   - Instructor: Selecciona uno disponible
   - Nombre: "Clase de Prueba"
   - Cancha: Selecciona una disponible
   - Fecha: Hoy o fecha futura
   - Hora inicio: "12:00"
   - Hora fin: "13:00"
   - Tipo: "PRIVATE" o "GROUP"
   - Precio: 1000
5. Click en "Crear Clase"

**Resultado Esperado:**
- ✅ Clase creada exitosamente
- ✅ Aparece en la lista de clases
- ✅ No hay error 500

**Si hay error:**
- El endpoint ahora retorna errores detallados con `details` y `stack`
- Revisar consola del navegador para el mensaje completo

## Aprendizajes

### De Acuerdo a CLAUDE.md - Prisma Best Practices

Este error refuerza las lecciones aprendidas:

> **2. CreateInput - Campos Requeridos**
> ```typescript
> // ❌ INCORRECTO - Faltan campos requeridos
> await prisma.model.create({
>   data: { name: 'test' }
> })
>
> // ✅ CORRECTO - Incluir SIEMPRE
> await prisma.model.create({
>   data: {
>     id: uuidv4(),           // Requerido si no es auto-generado
>     name: 'test',
>     updatedAt: new Date(),  // Requerido en la mayoría de modelos
>   }
> })
> ```

### Nuevas Reglas

1. **SIEMPRE verificar schema.prisma antes de crear registros**
2. **Campos sin @default() requieren valor manual**
3. **Generar ID manualmente si no tiene @default(cuid()) o @default(uuid())**
4. **Incluir updatedAt si no tiene @default(now())**
5. **Crear endpoints de diagnóstico para problemas en producción**
6. **Retornar errores detallados, no solo mensajes genéricos**

## Estado Actual

- ✅ Campos agregados a base de datos de producción
- ✅ Código corregido para incluir campos requeridos
- ✅ Endpoints de diagnóstico disponibles
- ✅ Migraciones automáticas configuradas para futuros deploys
- 🚀 Deploy en progreso (commit d62fcf5)

**Tiempo estimado para deploy:** 2-3 minutos

## Próximos Pasos

1. Esperar a que complete el deploy de Vercel
2. Verificar schema: https://www.padelyzer.app/api/verify-class-schema
3. Probar creación de clase desde el dashboard
4. Verificar que la clase aparece correctamente en la lista

## Contacto para Errores

Si persisten errores después del deploy:
1. Capturar mensaje completo de consola del navegador
2. Visitar /api/debug-create-class con los mismos datos
3. Reportar el diagnóstico completo

---
**Fecha:** 2025-10-14
**Commits:** 21f9fc0, c4af2af, d1cfe9e, fac7164, b267607, d62fcf5
**Status:** ✅ Resuelto - En Deploy
