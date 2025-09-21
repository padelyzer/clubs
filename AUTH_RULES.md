# Reglas de Autenticación - Sistema Lucia Auth

## 🔐 REGLA PRINCIPAL
**TODO el sistema de autenticación DEBE usar Lucia Auth exclusivamente. NO híbridos, NO mocks, NO JWT.**

## ✅ Archivos del Sistema de Autenticación

### Archivos Principales (NO MODIFICAR sin autorización)
- `/lib/auth/lucia.ts` - Configuración principal de Lucia
- `/lib/auth/session.ts` - Gestión de sesiones unificada
- `/lib/auth/actions.ts` - Server Actions para login/logout
- `/lib/auth/auth-actions.ts` - Acciones adicionales de Lucia

### Middleware
- `/middleware.ts` - Protección de rutas con cookie `padelyzer-session`

## 🚫 PROHIBIDO

1. **NO usar JWT, jose, o jsonwebtoken**
   - Eliminar cualquier importación de `jose`
   - Eliminar cualquier uso de `SignJWT` o `jwtVerify`
   - No usar `JWT_SECRET` o `NEXTAUTH_SECRET`

2. **NO crear mocks de autenticación**
   - No crear archivos como `actions-mock.ts` o `dev-auth.ts`
   - No usar autenticación falsa en desarrollo
   - Siempre usar usuarios reales con Lucia

3. **NO mezclar sistemas**
   - No tener código condicional que use JWT o Lucia
   - No tener fallbacks a otros sistemas
   - Una sola fuente de verdad: Lucia Auth

## ✅ OBLIGATORIO

### Para autenticación en Server Components:
```typescript
import { getSession } from '@/lib/auth/session'

const session = await getSession()
if (!session) {
  // Usuario no autenticado
}
```

### Para autenticación en Server Actions:
```typescript
import { requireAuth } from '@/lib/auth/actions'

const session = await requireAuth() // Redirige si no autenticado
```

### Para login:
```typescript
import { loginAction } from '@/lib/auth/actions'

// En formulario con action={loginAction}
```

### Para logout:
```typescript
import { logoutAction } from '@/lib/auth/actions'

// En botón con action={logoutAction}
```

## 📋 Estructura de Sesión

```typescript
interface SessionData {
  userId: string
  email: string
  name: string | null
  role: 'USER' | 'CLUB_OWNER' | 'CLUB_STAFF' | 'SUPER_ADMIN'
  clubId: string | null
  active: boolean
}
```

## 🔄 Flujo de Autenticación

1. **Login**: 
   - Usuario envía credenciales
   - Se valida con Argon2 o bcrypt
   - Se crea sesión con Lucia (`lucia.createSession`)
   - Se establece cookie `padelyzer-session`
   - Se redirige según rol

2. **Validación**:
   - Middleware verifica cookie en rutas protegidas
   - `validateRequest()` valida sesión con Lucia
   - Retorna usuario y sesión o null

3. **Logout**:
   - Se invalida sesión (`lucia.invalidateSession`)
   - Se elimina cookie
   - Se redirige a `/login`

## 🛠️ Configuración

- **Cookie**: `padelyzer-session`
- **Duración**: 30 días
- **Algoritmo hash**: Argon2 (nuevo) / bcrypt (legacy)
- **Base de datos**: Prisma con tablas `User` y `Session`

## 🚨 Checklist de Validación

Antes de cada commit, verificar:
- [ ] No hay importaciones de `jose` o `jsonwebtoken`
- [ ] No hay archivos mock de autenticación
- [ ] Todos los endpoints usan `getSession()` o `requireAuth()`
- [ ] No hay código JWT legacy
- [ ] El middleware usa la cookie correcta
- [ ] Las rutas protegidas redirigen a `/login`

## 📝 Migración de Código Legacy

Si encuentras código usando JWT:
1. Reemplazar importación por `@/lib/auth/session` o `@/lib/auth/actions`
2. Cambiar `getSession()` JWT por `getSession()` de Lucia
3. Eliminar cualquier verificación de token
4. Probar que la autenticación funciona

## ✅ Migración Completada

Todos los archivos han sido migrados a Lucia Auth:
- ✅ `/app/api/user/switch-club/route.ts` - Migrado a Lucia
- ✅ `/app/api/admin/support/impersonate/route.ts` - Deshabilitado (requiere reimplementación)
- ✅ `/app/api/admin/clubs/[id]/access/route.ts` - Migrado a Lucia
- ✅ `/lib/payments/payment-links.ts` - Usa PAYMENT_TOKEN_SECRET en lugar de JWT_SECRET

### Archivos Eliminados
- ❌ `/lib/auth/actions-mock.ts` - Eliminado
- ❌ `/lib/auth/dev-auth.ts` - Eliminado
- ❌ `/lib/auth/jwt-config.ts` - Eliminado

### Variables de Entorno
- **NO USAR**: `JWT_SECRET`, `NEXTAUTH_SECRET`
- **USAR**: `PAYMENT_TOKEN_SECRET` para tokens de pago
- **USAR**: `ENCRYPTION_KEY` para encriptación general

---

**Última actualización**: 2025-09-09
**Estado**: ✅ Sistema 100% Lucia Auth - Sin híbridos, sin mocks, sin JWT