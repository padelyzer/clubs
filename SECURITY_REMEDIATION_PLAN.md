# 🚨 Plan de Remediación de Seguridad - Padelyzer

## Resumen Ejecutivo
- **48 problemas críticos** detectados → **6 son reales**
- **360 archivos** modificados por limpieza → **5 archivos dañados**
- **Tiempo estimado**: 2-3 horas para remediar todo

## 🔴 PRIORIDAD 1: CRÍTICO (Hacer AHORA)

### 1. **Cambiar Credenciales de Supabase**
**Tiempo**: 15 minutos

```bash
# PASO 1: Cambiar en Supabase Dashboard
1. Ir a https://supabase.com/dashboard
2. Proyecto: espmqzfvgzuzpbpsgmpw
3. Settings → Database → Reset database password
4. Generar nueva contraseña fuerte

# PASO 2: Actualizar en Vercel
1. https://vercel.com/dashboard → pdzr4
2. Settings → Environment Variables
3. Actualizar DATABASE_URL y DIRECT_URL
4. Redeploy para aplicar cambios
```

### 2. **Limpiar Historial de Git**
**Tiempo**: 30 minutos

```bash
# Opción A: Si no hay mucho historial importante
git clone --depth 1 https://github.com/tu-repo/padelyzer.git padelyzer-clean
cd padelyzer-clean
# Esto crea un nuevo repo sin historial

# Opción B: Limpiar historial específico (más complejo)
pip install git-filter-repo
git filter-repo --path .env.production --invert-paths
git filter-repo --path .env.production.local --invert-paths
```

### 3. **Reparar Archivos Dañados**
**Tiempo**: 20 minutos

```bash
# Primero, revertir archivos críticos dañados
git checkout HEAD -- lib/config/env-validation.ts
git checkout HEAD -- lib/rate-limit.ts
git checkout HEAD -- app/api/auth/login/route.ts
git checkout HEAD -- app/api/bookings/route.ts
git checkout HEAD -- app/api/health/route.ts

# Luego, eliminar console.log manualmente de estos archivos
```

## 🟡 PRIORIDAD 2: ALTO (Hacer HOY)

### 4. **Eliminar Passwords Hardcodeados**
**Tiempo**: 30 minutos

Archivos a modificar:
- `create-test-user-production.ts`
- `create-test-user.ts`
- `scripts/add-password-test-user.ts`
- `scripts/reset-admin-password.ts`
- `scripts/setup-test-simple.ts`

**Solución**:
```typescript
// En lugar de:
const password = 'test123'

// Usar:
const password = process.env.TEST_USER_PASSWORD || 
  crypto.randomBytes(16).toString('hex')
console.log(`Generated password: ${password}`)
```

### 5. **Re-habilitar TypeScript y ESLint**
**Tiempo**: 5 minutos

```javascript
// next.config.js
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Cambiar a false
  },
  typescript: {
    ignoreBuildErrors: false,  // Cambiar a false
  },
  // ... resto de config
}
```

### 6. **Generar Nuevos Secrets**
**Tiempo**: 10 minutos

```bash
# Generar NEXTAUTH_SECRET
openssl rand -base64 32

# Generar HEALTH_CHECK_API_KEY  
openssl rand -hex 32

# Generar CRON_SECRET
openssl rand -hex 32
```

Actualizar en Vercel Dashboard.

## 🟢 PRIORIDAD 3: MEDIO (Esta SEMANA)

### 7. **Reemplazar Patrones Peligrosos**
**Tiempo**: 30 minutos

#### Para `dangerouslySetInnerHTML`:
```typescript
// En app/widget/layout.tsx
// Buscar alternativa segura o sanitizar con DOMPurify
import DOMPurify from 'isomorphic-dompurify';
const cleanHTML = DOMPurify.sanitize(htmlContent);
```

#### Para `document.write`:
```typescript
// En components/tournaments/tournament-qr.tsx
// Reemplazar con:
const printWindow = window.open('', '_blank');
printWindow.document.body.innerHTML = content;
```

### 8. **Configurar Monitoreo**
**Tiempo**: 45 minutos

1. **Configurar Sentry**:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

2. **Configurar GitHub Secret Scanning**:
- Repo Settings → Security → Secret scanning → Enable

3. **Configurar Dependabot**:
- Repo Settings → Security → Dependabot → Enable

## 📊 Checklist de Validación Post-Remediación

- [ ] Credenciales de Supabase cambiadas
- [ ] Vercel variables actualizadas  
- [ ] App sigue funcionando en producción
- [ ] Archivos dañados reparados
- [ ] Passwords hardcodeados eliminados
- [ ] TypeScript/ESLint habilitados
- [ ] Nuevos secrets generados
- [ ] Build pasa sin errores
- [ ] Tests pasan
- [ ] Auditoría de seguridad pasa

## 🚀 Comandos de Verificación

```bash
# 1. Verificar que no hay credenciales expuestas
git grep -i "password\|secret\|token" -- ':!*.md' ':!package*.json'

# 2. Verificar build
npm run build

# 3. Verificar tipos
npm run type-check

# 4. Ejecutar auditoría
npm run security:audit

# 5. Verificar la app en producción
curl https://pdzr4.vercel.app/api/health
```

## 🔒 Mejores Prácticas a Futuro

1. **Nunca commitear .env files**
2. **Usar GitHub Secrets para CI/CD**
3. **Rotar credenciales cada 90 días**
4. **Ejecutar auditoría antes de cada deploy**
5. **Revisar PRs buscando credenciales**
6. **Usar pre-commit hooks**:

```bash
# .git/hooks/pre-commit
#!/bin/sh
npm run security:audit
npm run type-check
```

## 📞 Soporte

Si encuentras problemas durante la remediación:
1. Revisa los logs en Vercel Dashboard
2. Verifica la conexión a base de datos
3. Revisa los cambios con `git diff`

---

**Última actualización**: $(date)
**Próxima auditoría programada**: En 30 días