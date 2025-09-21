# 🛡️ Plan de Implementación de Seguridad - BMAD Next.js App

## 📅 Cronograma: 3 días

---

## 📆 DÍA 1: Limpieza y Configuración Base ✅ COMPLETADO

### 🔥 Prioridad CRÍTICA (Mañana - 4 horas)

#### 1. Eliminar Logs de Información Sensible ✅
```bash
# Buscar y eliminar todos los console.log con passwords
grep -r "console.log.*password" --include="*.ts" --include="*.tsx" --include="*.js"
```

**Archivos limpiados:**
- [x] `prisma/seed.ts`
- [x] `prisma/seed-demo.ts`
- [x] `prisma/seed-enhanced.ts`
- [x] `test-auth.js`
- [x] Eliminados 12 logs sensibles de 4 archivos

#### 2. Generar NEXTAUTH_SECRET Seguro ✅
```bash
# Secret generado y actualizado en .env.production.example
NEXTAUTH_SECRET=TmNWzVYjq2+k9CK7C5POoi6ZQgbT1x0RvpvA8fzd5eM=
```

#### 3. Crear archivo de variables de producción ✅
```bash
# Archivo .env.production.example actualizado con configuración segura
cp .env.production.example .env.production.local
```

**Variables críticas a configurar:**
```env
# Autenticación
NEXTAUTH_SECRET=<generated_secret>
NEXTAUTH_URL=https://tu-dominio.com

# Base de datos
DATABASE_URL=postgresql://...produccion...

# Stripe (Producción)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# WhatsApp Business API
WHATSAPP_API_KEY=...
WHATSAPP_PHONE_NUMBER=...
```

### ⚡ Prioridad ALTA (Tarde - 4 horas)

#### 4. Implementar Rate Limiting ✅

**Instalación:** ✅ Ya instalado
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Implementación completada:**
- [x] Consolidado rate limiting en `/lib/rate-limit.ts`
- [x] Configurado diferentes límites para:
  - API general: 100 req/min
  - Autenticación: 5 intentos/15 min
  - Creación de bookings: 20/hora
  - Admin: 200 req/min
  - Exports: 10/hora
  - Webhooks: 1000/min
- [x] Aplicado rate limiting en:
  - `/api/bookings/route.ts` (POST)
  - `/api/auth/login/route.ts`
  - `/api/stripe/payments/create-intent-simple/route.ts`
  - Middleware general para todas las rutas API
- [x] Integrado con el middleware existente

**Aplicar en middleware.ts:**
```typescript
// Rutas críticas a proteger
const rateLimitedPaths = [
  '/api/auth',
  '/api/bookings',
  '/api/payments',
  '/api/stripe'
]
```

---

## 📆 DÍA 2: Validación y Headers de Seguridad

### 🔒 Validación con Zod (Mañana - 4 horas)

#### 1. Instalar Zod
```bash
npm install zod
```

#### 2. Crear schemas de validación (`/lib/validations/`)

**booking.schema.ts:**
```typescript
import { z } from 'zod'

export const createBookingSchema = z.object({
  playerPhone: z.string()
    .regex(/^\d{10}$/, "El teléfono debe tener 10 dígitos"),
  playerName: z.string()
    .min(2, "Nombre muy corto")
    .max(100, "Nombre muy largo"),
  playerEmail: z.string().email().optional(),
  date: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().min(30).max(240),
  courtId: z.string().uuid(),
  price: z.number().min(0).max(10000)
})

export const paymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['cash', 'card', 'transfer', 'stripe']),
  bookingId: z.string()
})
```

#### 3. Aplicar validación en APIs críticas

**Ejemplo en `/api/bookings/route.ts`:**
```typescript
import { createBookingSchema } from '@/lib/validations/booking.schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos
    const validatedData = createBookingSchema.parse(body)

    // Continuar con lógica...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    // ...
  }
}
```

**APIs prioritarias para validación:**
- [ ] `/api/bookings/*`
- [ ] `/api/payments/*`
- [ ] `/api/auth/*`
- [ ] `/api/stripe/*`
- [ ] `/api/players/*`

### 🛡️ Security Headers (Tarde - 4 horas)

#### 1. Configurar headers en `next.config.ts`:
```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.stripe.com;
      frame-src 'self' https://js.stripe.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## 📆 DÍA 3: Monitoreo y Testing

### 📊 Monitoreo con Sentry (Mañana - 3 horas)

#### 1. Instalar Sentry
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

#### 2. Configurar (`sentry.client.config.ts`):
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  // Filtrar información sensible
  beforeSend(event, hint) {
    // Eliminar passwords, tokens, etc.
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    return event
  }
})
```

### 🧪 Testing de Seguridad (Tarde - 5 horas)

#### 1. Crear tests de seguridad (`/tests/security/`)

**rate-limit.test.ts:**
```typescript
import { describe, it, expect } from 'vitest'

describe('Rate Limiting', () => {
  it('should block after 10 requests in 10 seconds', async () => {
    const promises = Array(15).fill(null).map(() =>
      fetch('/api/bookings')
    )

    const responses = await Promise.all(promises)
    const tooManyRequests = responses.filter(r => r.status === 429)

    expect(tooManyRequests.length).toBeGreaterThan(0)
  })
})
```

**validation.test.ts:**
```typescript
describe('Input Validation', () => {
  it('should reject invalid phone numbers', async () => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        playerPhone: '123', // Invalid
        // ...
      })
    })

    expect(response.status).toBe(400)
  })

  it('should prevent SQL injection', async () => {
    const response = await fetch('/api/players/search?phone=1234567890; DROP TABLE players;')
    expect(response.status).not.toBe(500)
  })
})
```

#### 2. Checklist de pruebas manuales

**Autenticación:**
- [ ] Intentar acceder a APIs sin token
- [ ] Verificar expiración de sesión
- [ ] Probar con tokens manipulados

**Rate Limiting:**
- [ ] Hacer múltiples requests rápidos
- [ ] Verificar headers de rate limit
- [ ] Confirmar reset después del tiempo

**Validación:**
- [ ] Enviar datos malformados a cada API
- [ ] Intentar inyección SQL
- [ ] Probar XSS en campos de texto

**Multi-tenant:**
- [ ] Verificar aislamiento entre clubs
- [ ] Intentar acceder a datos de otro club
- [ ] Validar permisos por rol

---

## 📝 Scripts de Apoyo

### 1. Script de auditoría (`/scripts/security-audit.ts`):
```typescript
import { prisma } from '@/lib/config/prisma'
import * as fs from 'fs'
import * as path from 'path'

async function securityAudit() {
  console.log('🔍 Iniciando auditoría de seguridad...\n')

  // 1. Buscar logs peligrosos
  console.log('1. Buscando console.logs sensibles...')
  const dangerous = ['password', 'token', 'secret', 'key']
  // ... implementar búsqueda

  // 2. Verificar configuración de producción
  console.log('2. Verificando variables de entorno...')
  const required = ['NEXTAUTH_SECRET', 'DATABASE_URL', 'STRIPE_SECRET_KEY']
  // ... verificar existencia

  // 3. Verificar permisos de archivos
  console.log('3. Verificando permisos de archivos...')
  // ... verificar .env no está en git

  // Generar reporte
  const report = {
    timestamp: new Date(),
    issues: [],
    recommendations: []
  }

  fs.writeFileSync('security-audit.json', JSON.stringify(report, null, 2))
  console.log('\n✅ Auditoría completada: security-audit.json')
}

securityAudit()
```

### 2. Script de limpieza (`/scripts/clean-sensitive.ts`):
```typescript
#!/usr/bin/env node
import * as fs from 'fs'
import * as path from 'path'

const patternsToRemove = [
  /console\.log\(.*password.*\)/gi,
  /console\.log\(.*secret.*\)/gi,
  /console\.log\(.*token.*\)/gi,
]

function cleanFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  patternsToRemove.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, '// [REMOVED: Sensitive log]')
      modified = true
    }
  })

  if (modified) {
    fs.writeFileSync(filePath, content)
    console.log(`✓ Limpiado: ${filePath}`)
  }
}

// Ejecutar limpieza
const files = glob.sync('**/*.{ts,tsx,js}', { ignore: 'node_modules/**' })
files.forEach(cleanFile)
```

---

## ✅ Checklist Final Pre-Producción

### Configuración
- [ ] NEXTAUTH_SECRET generado y configurado
- [ ] Variables de producción configuradas
- [ ] SSL/TLS configurado
- [ ] Dominio y DNS configurados

### Seguridad
- [ ] Rate limiting implementado
- [ ] Validación Zod en todas las APIs
- [ ] Security headers configurados
- [ ] Logs sensibles eliminados
- [ ] Sentry configurado

### Testing
- [ ] Tests de seguridad pasando
- [ ] Auditoría manual completada
- [ ] Penetration testing básico
- [ ] Revisión de código

### Documentación
- [ ] README actualizado
- [ ] API documentation
- [ ] Runbook de emergencias
- [ ] Contactos de seguridad

---

## 🚀 Comando de Deploy Seguro

```bash
# Verificar antes de deploy
npm run security:audit
npm run test:security
npm run build

# Deploy solo si todo pasa
npm run deploy:production
```

---

*Plan creado: ${new Date().toISOString()}*
*Tiempo estimado total: 3 días (24 horas de trabajo)*