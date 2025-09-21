# 🏢 Guía del Sistema Multitenant - Padelyzer

## Resumen Ejecutivo

Este documento describe cómo funciona el sistema multitenant en Padelyzer y cómo garantizamos que cada club tenga sus datos completamente aislados.

## 🎯 Principios Fundamentales

### 1. **Aislamiento Total de Datos**
- Cada club SOLO puede ver y modificar sus propios datos
- No hay forma de que un club acceda a datos de otro club
- Todas las queries incluyen filtro por `clubId`

### 2. **Validación en Múltiples Capas**
- **Capa 1**: Autenticación (usuario debe estar logueado)
- **Capa 2**: Autorización (usuario debe pertenecer a un club)
- **Capa 3**: Validación de datos (todos los datos deben tener el clubId correcto)

### 3. **ClubId Omnipresente**
- Todas las tablas principales tienen campo `clubId`
- Ninguna query se ejecuta sin filtro de `clubId`
- El `clubId` viene siempre de la sesión del usuario, nunca del cliente

## 📊 Estructura de Datos

### Tablas con Aislamiento por Club

```prisma
// Todas estas tablas tienen clubId y están aisladas por club:
- Booking (Reservas)
- Player (Jugadores/Clientes)  
- Court (Canchas)
- Class (Clases)
- Tournament (Torneos)
- Transaction (Transacciones financieras)
- Pricing (Reglas de precios)
- Schedule (Horarios)
```

### Flujo de Datos

```
Usuario → Sesión → ClubId → Filtro en Query → Datos del Club
```

## 🔐 Sistema de Seguridad

### 1. Autenticación y Sesión

```typescript
// En cada request API:
const session = await requireAuth()
// session contiene:
// - userId: ID del usuario
// - clubId: ID del club al que pertenece
// - role: Rol del usuario
```

### 2. Filtrado Automático

```typescript
// SIEMPRE filtrar por clubId en las queries:
const bookings = await prisma.booking.findMany({
  where: {
    clubId: session.clubId, // ← CRÍTICO: Siempre del session
    // ... otros filtros
  }
})
```

### 3. Validación de Recursos

```typescript
// Antes de modificar un recurso, validar que pertenece al club:
import { validateResourceOwnership } from '@/lib/auth/club-validation'

const isValid = await validateResourceOwnership(
  'booking',
  bookingId,
  session.clubId
)

if (!isValid) {
  return NextResponse.json(
    { error: 'Access denied' },
    { status: 403 }
  )
}
```

## 🛠️ Helpers Disponibles

### `club-validation.ts`

```typescript
// 1. Validar acceso a club
validateClubAccess(userClubId, targetClubId)

// 2. Agregar filtro de club a queries
addClubFilter(whereClause, clubId)

// 3. Validar propiedad de recurso
validateResourceOwnership(resourceType, resourceId, clubId)

// 4. Crear queries con scope de club
const clubQuery = createClubScopedQuery(clubId)
const bookings = await clubQuery.bookings.findMany()

// 5. Crear nuevo club con datos iniciales
createClubWithDefaults(clubData)
```

## 📝 Checklist para Nuevos Endpoints

Cuando crees un nuevo endpoint, asegúrate de:

- [ ] Llamar `requireAuth()` al inicio
- [ ] Obtener `clubId` de la sesión, NUNCA del request body
- [ ] Incluir `clubId: session.clubId` en todas las queries
- [ ] Validar ownership antes de UPDATE/DELETE
- [ ] Nunca exponer IDs de otros clubes en las respuestas
- [ ] Loguear intentos de acceso no autorizado

## 🚨 Antipatrones a Evitar

### ❌ NUNCA hagas esto:

```typescript
// MAL: clubId viene del cliente
const { clubId } = req.body
const bookings = await prisma.booking.findMany({
  where: { clubId }
})

// MAL: Query sin filtro de club
const allBookings = await prisma.booking.findMany()

// MAL: Permitir cambiar clubId
await prisma.booking.update({
  where: { id },
  data: { 
    clubId: newClubId // ← NUNCA permitir esto
  }
})
```

### ✅ SIEMPRE haz esto:

```typescript
// BIEN: clubId de la sesión
const session = await requireAuth()
const bookings = await prisma.booking.findMany({
  where: { 
    clubId: session.clubId // ← Siempre de la sesión
  }
})

// BIEN: Validar antes de modificar
const booking = await prisma.booking.findFirst({
  where: {
    id: bookingId,
    clubId: session.clubId
  }
})

if (!booking) {
  return { error: 'Booking not found or access denied' }
}
```

## 🏗️ Creación de Nuevos Clubes

Cuando se registra un nuevo club:

1. **Crear el club** con estado `PENDING`
2. **Crear configuración default** (ClubSettings)
3. **Crear canchas default** (3 canchas estándar)
4. **Crear reglas de precio default**
5. **Asignar el usuario** al nuevo club
6. **Activar el club** después de aprobación

```typescript
// Usar el helper para crear club con defaults:
import { createClubWithDefaults } from '@/lib/auth/club-validation'

const newClub = await createClubWithDefaults({
  name: 'Club Nuevo',
  email: 'info@clubnuevo.com',
  phone: '+52 555 123 4567',
  city: 'Ciudad de México',
  state: 'CDMX'
})
```

## 🔍 Debugging

Para verificar aislamiento de datos:

```sql
-- Ver cuántos clubes hay
SELECT COUNT(DISTINCT "clubId") FROM "Booking";

-- Ver datos por club
SELECT "clubId", COUNT(*) as total 
FROM "Booking" 
GROUP BY "clubId";

-- Verificar que usuario está en el club correcto
SELECT u.email, u."clubId", c.name as club_name
FROM "User" u
JOIN "Club" c ON u."clubId" = c.id
WHERE u.email = 'usuario@ejemplo.com';
```

## 📊 Monitoreo

Loguear todos los intentos de acceso no autorizado:

```typescript
console.error('[SECURITY] Access denied:', {
  userId: session.userId,
  userClubId: session.clubId,
  targetResource: resourceId,
  targetClubId: resource.clubId,
  timestamp: new Date().toISOString()
})
```

## 🚀 Mejores Prácticas

1. **Principio de Menor Privilegio**: Los usuarios solo tienen acceso a lo mínimo necesario
2. **Fail Secure**: En caso de duda, denegar acceso
3. **Logging Exhaustivo**: Registrar todos los intentos de acceso
4. **Validación Doble**: Validar en el backend aunque el frontend ya valide
5. **No Confiar en el Cliente**: El clubId siempre viene del servidor (sesión)

## 📚 Referencias

- `/lib/auth/club-validation.ts` - Funciones de validación
- `/lib/auth/actions.ts` - Sistema de autenticación
- `/prisma/schema.prisma` - Esquema de base de datos

---

**IMPORTANTE**: Este sistema garantiza que cada club opere como una instancia completamente independiente, sin posibilidad de ver o modificar datos de otros clubes.