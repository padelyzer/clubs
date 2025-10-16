# 🚀 Checklist de Deployment a Producción - Sistema de Torneos V2

**Fecha**: 2025-10-16
**Versión**: V2.0 - Sistema completo de torneos
**Deployment Target**: Vercel + Supabase PostgreSQL

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. ✅ CODE & GIT

- [ ] **Commitear todos los cambios**
  ```bash
  git add app/c/[clubSlug]/dashboard/tournaments/
  git add app/api/tournaments/
  git add lib/tournaments/
  git add components/tournaments/
  git add SECURITY_AUDIT_TORNEOS.md
  git commit -m "feat: Sistema completo de torneos V2 con seguridad multi-tenant"
  ```

- [ ] **Archivos modificados a incluir**:
  ```
  ✓ app/api/tournaments/[id]/route.ts (validación clubId)
  ✓ app/api/tournaments/[id]/auto-schedule/route.ts (validación clubId)
  ✓ app/api/tournaments/[id]/advance-round/route.ts (validación clubId)
  ✓ app/api/tournaments/[id]/registrations/route.ts (validación clubId)
  ✓ app/api/tournaments/[id]/registrations/[registrationId]/check-in/route.ts (auth + clubId)
  ✓ app/api/tournaments/[id]/resolve-conflict/route.ts (validación clubId)
  ✓ app/c/[clubSlug]/dashboard/tournaments/ (todos los archivos V2)
  ```

- [ ] **Nuevos archivos a incluir**:
  ```
  ✓ app/api/tournaments/[id]/generate-brackets/
  ✓ app/api/tournaments/[id]/finalize/
  ✓ app/c/[clubSlug]/dashboard/tournaments/[id]/brackets/
  ✓ app/c/[clubSlug]/dashboard/tournaments/[id]/schedule/
  ✓ lib/services/bracket-generator.ts
  ```

- [ ] **Verificar que NO se suban archivos sensibles**:
  ```bash
  # Revisar que .gitignore incluye:
  .env*
  !.env.example
  *.log
  node_modules/
  ```

---

### 2. 🗄️ BASE DE DATOS

#### **A. Migraciones Pendientes**

⚠️ **CRÍTICO**: Hay 2 migraciones pendientes:
```
- 20250107_add_player_id_to_booking
- 20251014_fix_class_fields
```

- [ ] **Aplicar migraciones en DB de producción**:
  ```bash
  # Cambiar DATABASE_URL a Supabase en .env.local
  DATABASE_URL="postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

  # Aplicar migraciones
  npm run prisma:migrate:prod

  # O directamente:
  npx prisma migrate deploy
  ```

- [ ] **Verificar estado de migraciones**:
  ```bash
  npx prisma migrate status
  # Debe decir: "Database schema is up to date!"
  ```

#### **B. Verificar Schema de Producción**

- [ ] **Verificar que existen todas las tablas de torneos**:
  ```sql
  -- Conectarse a Supabase y verificar:
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name LIKE '%tournament%';

  -- Debe devolver:
  -- Tournament
  -- TournamentRegistration
  -- TournamentMatch
  -- TournamentRound
  -- TournamentMatchResult
  ```

- [ ] **Verificar índices críticos**:
  ```sql
  -- Verificar índices en Tournament
  \d Tournament

  -- Debe tener índices en:
  -- clubId (para queries multi-tenant)
  -- status (para filtros)
  -- startDate (para ordenamiento)
  ```

#### **C. Datos de Seed (Opcional)**

- [ ] **Decidir si seedear datos de prueba en producción**:
  ```bash
  # Para crear datos de demo (NO recomendado en producción real)
  DATABASE_URL="postgresql://..." npx tsx scripts/seed-production-ready.ts

  # Solo para staging/testing
  ```

---

### 3. 🔐 VARIABLES DE ENTORNO

#### **A. Variables de Vercel**

- [ ] **Configurar en Vercel Dashboard** → Settings → Environment Variables:

**PRODUCCIÓN**:
```bash
# Database
DATABASE_URL="postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# NextAuth
NEXTAUTH_URL="https://padelyzer.vercel.app"  # O tu dominio
NEXTAUTH_SECRET="[GENERAR NUEVO SECRET SEGURO]"

# Stripe (keys de PRODUCCIÓN)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (si aplica)
SMTP_HOST="smtp.sendgrid.net"
SMTP_USER="apikey"
SMTP_PASSWORD="[tu-api-key]"

# Twilio (si aplica)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="[production-token]"
TWILIO_WHATSAPP_NUMBER="+1..."

# Analytics (opcional)
NEXT_PUBLIC_GA_ID="G-..."
```

- [ ] **Generar nuevo NEXTAUTH_SECRET**:
  ```bash
  openssl rand -base64 32
  ```

#### **B. Variables en .env.example**

- [ ] **Actualizar .env.example** con todas las variables necesarias (sin valores sensibles)

---

### 4. 🏗️ BUILD & TEST LOCAL

- [ ] **Limpiar node_modules y reinstalar**:
  ```bash
  rm -rf node_modules
  rm -rf .next
  npm install
  ```

- [ ] **Generar Prisma Client**:
  ```bash
  npx prisma generate
  ```

- [ ] **Build local para verificar errores**:
  ```bash
  npm run build
  ```

  **Verificar salida**:
  ```
  ✓ Compiled successfully
  ✓ Linting and checking validity of types
  ✓ Collecting page data
  ✓ Generating static pages
  ```

- [ ] **Verificar que NO hay errores TypeScript**:
  ```bash
  npx tsc --noEmit
  ```

- [ ] **Verificar bundle size** (debe ser < 2MB por ruta):
  ```bash
  # Revisar output del build:
  Route                                          Size     First Load JS
  ├ ○ /c/[clubSlug]/dashboard/tournaments        XX kB    XXX kB
  ```

---

### 5. 🔍 TESTING PRE-DEPLOYMENT

- [ ] **Testing de seguridad**:
  ```bash
  # Intentar acceder a torneo de otro club
  # curl con token de club A intentando acceder a torneo de club B
  # Debe devolver 404 o 403
  ```

- [ ] **Testing de endpoints críticos**:
  ```bash
  # GET /api/tournaments
  # POST /api/tournaments
  # GET /api/tournaments/[id]
  # POST /api/tournaments/[id]/auto-schedule
  # POST /api/tournaments/[id]/advance-round
  # Todos deben devolver 401 sin autenticación
  ```

- [ ] **Verificar módulo SaaS**:
  - Verificar que `requireTournamentsModule()` funciona
  - Probar con club sin acceso (debe dar 402)

---

### 6. 📦 DEPLOYMENT A VERCEL

#### **Opción A: Deploy desde Git (Recomendado)**

- [ ] **Push a rama principal**:
  ```bash
  git push origin feature/refactor-and-unify-design-system

  # O si vas directo a main:
  git checkout main
  git merge feature/refactor-and-unify-design-system
  git push origin main
  ```

- [ ] **Vercel auto-deploy** (si está configurado):
  - Vercel detectará el push
  - Iniciará build automáticamente
  - Monitorear en dashboard

#### **Opción B: Deploy Manual**

- [ ] **Deploy con Vercel CLI**:
  ```bash
  npm install -g vercel
  vercel login
  vercel --prod
  ```

#### **Durante el Deploy**

- [ ] **Monitorear logs en Vercel**:
  - Build logs
  - Function logs
  - Edge logs

- [ ] **Verificar que build completa sin errores**:
  ```
  ✓ Building
  ✓ Generating static pages
  ✓ Finalizing page optimization
  ✓ Deployment completed
  ```

---

### 7. ✅ POST-DEPLOYMENT VERIFICATION

#### **A. Verificación Funcional**

- [ ] **Acceder a producción**:
  ```
  https://padelyzer.vercel.app/c/club-demo-padelyzer/dashboard/tournaments
  ```

- [ ] **Verificar autenticación**:
  - Login funciona
  - Redirección a dashboard correcta
  - Session persiste

- [ ] **Verificar rutas del sistema de torneos**:
  ```
  ✓ /c/[clubSlug]/dashboard/tournaments (lista)
  ✓ /c/[clubSlug]/dashboard/tournaments/create (wizard)
  ✓ /c/[clubSlug]/dashboard/tournaments/[id] (detalle)
  ```

- [ ] **Probar flujo crítico**:
  1. ✓ Crear torneo
  2. ✓ Agregar inscripciones
  3. ✓ Generar brackets
  4. ✓ Programar partidos
  5. ✓ Check-in con QR
  6. ✓ Registrar resultados
  7. ✓ Verificar avance de ronda

#### **B. Verificación de Seguridad**

- [ ] **Multi-tenant funcionando**:
  - Usuario de Club A no ve torneos de Club B
  - Intentar URL directa a torneo de otro club → 404

- [ ] **Roles funcionando**:
  - SUPER_ADMIN puede ver todos
  - CLUB_STAFF solo ve de su club
  - USER tiene acceso limitado

- [ ] **Módulo SaaS**:
  - Club con módulo deshabilitado → 402
  - Club con módulo activo → acceso completo

#### **C. Verificación de Performance**

- [ ] **Tiempos de carga**:
  ```
  ✓ Lista de torneos: < 2s
  ✓ Detalle de torneo: < 3s
  ✓ Generación de brackets: < 5s
  ✓ Auto-schedule: < 10s
  ```

- [ ] **Lighthouse Score** (opcional):
  ```bash
  # Ideal:
  Performance: > 80
  Accessibility: > 90
  Best Practices: > 90
  SEO: > 90
  ```

#### **D. Verificación de Base de Datos**

- [ ] **Conectividad**:
  ```sql
  -- Verificar que Prisma se conecta correctamente
  SELECT COUNT(*) FROM "Tournament";
  ```

- [ ] **Queries optimizadas**:
  - Verificar que queries usan índices
  - No hay N+1 queries
  - Logs de Prisma limpios

---

### 8. 🔄 ROLLBACK PLAN

**Si algo sale mal**:

- [ ] **Rollback en Vercel**:
  ```
  Vercel Dashboard → Deployments → [deployment anterior] → "Rollback to this deployment"
  ```

- [ ] **Rollback de migraciones** (si es necesario):
  ```bash
  # Revertir última migración
  npx prisma migrate resolve --rolled-back [migration-name]

  # Aplicar migración de rollback manualmente
  ```

- [ ] **Notificar a usuarios** (si es necesario):
  - Email a club owners
  - Banner en dashboard

---

### 9. 📊 MONITORING POST-DEPLOYMENT

#### **Primeras 24 horas**

- [ ] **Monitorear Vercel Analytics**:
  - Requests per second
  - Error rate
  - Response times

- [ ] **Monitorear Supabase**:
  - Connection pool usage
  - Query performance
  - Database size

- [ ] **Revisar Logs**:
  ```bash
  vercel logs --prod
  ```

- [ ] **Revisar Errores**:
  - Sentry (si está configurado)
  - Vercel error tracking
  - Database logs

#### **Métricas a vigilar**

- [ ] **Error rate** < 1%
- [ ] **Response time p95** < 2s
- [ ] **Database connections** < 80% del pool
- [ ] **Memory usage** < 70%

---

### 10. 📝 DOCUMENTACIÓN POST-DEPLOYMENT

- [ ] **Actualizar README**:
  - Nueva versión
  - Features agregados
  - Breaking changes (si hay)

- [ ] **Actualizar CHANGELOG**:
  ```markdown
  ## [2.0.0] - 2025-10-16
  ### Added
  - Sistema completo de torneos V2
  - Wizard de creación en 4 pasos
  - Auto-programación de partidos
  - Check-in con QR codes
  - Generación automática de brackets
  - 5 formatos de torneo
  - Sistema multi-tenant con seguridad reforzada

  ### Security
  - Corrección de 7 vulnerabilidades críticas
  - Validación de clubId en todos los endpoints
  - Control de roles mejorado
  ```

- [ ] **Notificar a stakeholders**:
  - Email a club owners
  - Anuncio en dashboard
  - Tutorial/demo si es necesario

---

## 🎯 CHECKLIST RÁPIDO (TL;DR)

```bash
# 1. Commit
git add .
git commit -m "feat: Sistema de torneos V2"
git push

# 2. Migraciones
DATABASE_URL="..." npx prisma migrate deploy

# 3. Variables en Vercel
# Configurar en dashboard

# 4. Build local
npm run build

# 5. Deploy
vercel --prod

# 6. Verificar
curl https://tu-dominio.com/api/tournaments
```

---

## ⚠️ WARNINGS & CONSIDERATIONS

### CRÍTICO
- ⚠️ **Backup de DB antes de migraciones**
- ⚠️ **Verificar que NEXTAUTH_SECRET es nuevo y seguro**
- ⚠️ **NO usar keys de Stripe test en producción**
- ⚠️ **Migrar en horario de bajo tráfico**

### IMPORTANTE
- ℹ️ Comunicar downtime si es necesario
- ℹ️ Tener plan de rollback listo
- ℹ️ Monitorear primeras 24h activamente
- ℹ️ Tener soporte disponible

### NICE TO HAVE
- 💡 Feature flag para torneos V2
- 💡 A/B testing entre V1 y V2
- 💡 Analytics de uso
- 💡 User feedback collection

---

## 📞 CONTACTOS DE EMERGENCIA

- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io
- **Team Lead**: [tu-email]

---

## ✅ DEPLOYMENT COMPLETADO

**Fecha**: _________________
**Deployed by**: _________________
**Deployment ID**: _________________
**Status**: _________________

**Issues encontrados**:
- [ ] Ninguno
- [ ] Minor issues (listar)
- [ ] Major issues (rollback ejecutado)

**Notas adicionales**:
_________________________________
_________________________________
_________________________________
