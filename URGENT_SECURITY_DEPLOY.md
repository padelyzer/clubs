# 🚨 DEPLOY URGENTE DE SEGURIDAD

## PROBLEMA CRÍTICO
Las credenciales de Supabase están expuestas en producción desde hace 3 días.

## PASOS INMEDIATOS:

### 1. CAMBIAR CREDENCIALES DE SUPABASE (HACER AHORA)
1. Ir a https://dashboard.supabase.com
2. Seleccionar tu proyecto
3. Settings > API
4. Regenerar:
   - `anon public key`
   - `service_role key` (NUNCA expongas esta)
5. Guardar las nuevas credenciales

### 2. ACTUALIZAR VARIABLES EN VERCEL
1. Ir a https://vercel.com/dashboard
2. Seleccionar el proyecto
3. Settings > Environment Variables
4. Actualizar:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (nueva anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` (nueva service key)
   - Verificar que NO hay variables con credenciales en `.env.production`

### 3. DEPLOY INMEDIATO
```bash
git add .
git commit -m "security: urgent security patch deployment

- Added authentication middleware
- Added security headers
- Added password generation utilities
- Removed exposed credentials
- Added rate limiting

CRITICAL: Supabase credentials must be rotated immediately"

git push origin main
```

### 4. VERIFICAR EN VERCEL
- El deploy debe iniciar automáticamente
- Verificar que no hay errores en el build
- Confirmar que la app funciona con las nuevas credenciales

## MEJORAS DE SEGURIDAD INCLUIDAS:
- ✅ Middleware de autenticación global
- ✅ Headers de seguridad (HSTS, CSP, etc)
- ✅ Validación de variables de entorno
- ✅ Rate limiting básico
- ✅ Generador seguro de contraseñas
- ✅ Logging de seguridad

## PRÓXIMOS PASOS (después del deploy):
1. Re-habilitar TypeScript/ESLint
2. Corregir errores de tipos
3. Configurar Sentry
4. Auditoría completa de seguridad