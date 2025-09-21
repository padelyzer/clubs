# 📋 Checklist para Producción - BMAD Next.js App

## 🚨 CRÍTICO - Antes de publicar

### 1. **Infraestructura** 🏗️
- [ ] **Base de datos de producción**
  - [ ] Configurar Supabase o PostgreSQL en producción
  - [ ] Ejecutar migraciones: `npx prisma migrate deploy`
  - [ ] Verificar conexión desde app

- [ ] **Hosting**
  - [ ] Configurar cuenta en Vercel/Railway/Render
  - [ ] Conectar repositorio GitHub
  - [ ] Configurar variables de entorno

- [ ] **Dominio y SSL**
  - [ ] Comprar/configurar dominio
  - [ ] Configurar DNS
  - [ ] Verificar certificado SSL activo

### 2. **Configuración de Servicios** 🔧
- [ ] **Stripe Producción**
  - [ ] Cambiar a llaves live (pk_live_, sk_live_)
  - [ ] Configurar webhook en producción
  - [ ] Probar flujo de pago completo

- [ ] **WhatsApp Business API**
  - [ ] Configurar número de producción
  - [ ] Actualizar tokens de API
  - [ ] Verificar plantillas de mensajes

- [ ] **Redis/Upstash (Rate Limiting)**
  - [ ] Crear instancia de producción
  - [ ] Configurar UPSTASH_REDIS_REST_URL
  - [ ] Configurar UPSTASH_REDIS_REST_TOKEN

### 3. **Seguridad** 🔐
- [ ] **Variables de entorno**
  ```bash
  # Verificar que estén configuradas:
  NEXTAUTH_SECRET (generado con openssl rand -base64 32)
  NEXTAUTH_URL (https://tu-dominio.com)
  DATABASE_URL (conexión segura SSL)
  ```

- [ ] **Completar Día 2 del plan de seguridad**
  - [ ] Implementar validación Zod en todos los endpoints
  - [ ] Configurar headers de seguridad (HSTS, CSP, etc.)

- [ ] **Completar Día 3 del plan de seguridad**
  - [ ] Configurar Sentry para monitoreo de errores
  - [ ] Ejecutar pruebas de seguridad

### 4. **Base de Datos** 💾
- [ ] **Backups**
  - [ ] Configurar backups automáticos diarios
  - [ ] Probar proceso de restauración
  - [ ] Documentar procedimiento

- [ ] **Migración de datos**
  - [ ] Exportar datos de desarrollo si es necesario
  - [ ] Crear usuarios administrativos de producción
  - [ ] Cargar catálogos iniciales

### 5. **Testing** 🧪
- [ ] **Pruebas funcionales**
  - [ ] Login/Logout
  - [ ] Crear reserva
  - [ ] Proceso de pago
  - [ ] Check-in
  - [ ] Cancelación

- [ ] **Pruebas de carga**
  - [ ] Simular 100 usuarios concurrentes
  - [ ] Verificar rate limiting funcionando
  - [ ] Monitorear performance

### 6. **Monitoreo** 📊
- [ ] **Configurar herramientas**
  - [ ] Sentry para errores
  - [ ] Analytics (Google Analytics/Plausible)
  - [ ] Uptime monitoring (UptimeRobot/Pingdom)
  - [ ] Logs centralizados

## 📝 Pasos para Desplegar

### Opción A: Vercel (Recomendado)
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Desplegar
vercel --prod

# 4. Configurar variables de entorno en dashboard.vercel.com
```

### Opción B: Railway
```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Inicializar proyecto
railway init

# 4. Desplegar
railway up
```

### Opción C: Docker + VPS
```bash
# 1. Construir imagen
docker build -t bmad-app .

# 2. Subir a registry
docker push tu-registry/bmad-app

# 3. En el servidor
docker pull tu-registry/bmad-app
docker run -d -p 3000:3000 --env-file .env.production bmad-app
```

## 🔍 Verificación Post-Deploy

1. **Funcionalidad básica**
   - [ ] Página principal carga
   - [ ] Login funciona
   - [ ] Dashboard accesible

2. **Seguridad**
   - [ ] HTTPS activo
   - [ ] Headers de seguridad presentes
   - [ ] Rate limiting activo

3. **Performance**
   - [ ] Tiempo de carga < 3 segundos
   - [ ] Sin errores en consola
   - [ ] Imágenes optimizadas

4. **SEO**
   - [ ] Meta tags configurados
   - [ ] Sitemap generado
   - [ ] Robots.txt configurado

## ⚠️ Rollback Plan

Si algo sale mal:
```bash
# Vercel
vercel rollback

# Railway
railway down
railway up --detach [previous-deployment-id]

# Docker
docker stop bmad-app
docker run -d -p 3000:3000 --env-file .env.production bmad-app:previous-version
```

## 📞 Contactos de Emergencia

- **Desarrollador principal**: [Tu contacto]
- **DevOps**: [Contacto DevOps]
- **Soporte Stripe**: dashboard.stripe.com/support
- **Soporte Vercel**: vercel.com/support

## 🎯 Estimación de Tiempo

- **Configuración inicial**: 2-4 horas
- **Migración de datos**: 1-2 horas
- **Pruebas**: 2-3 horas
- **Deploy y verificación**: 1-2 horas

**TOTAL**: 6-11 horas para producción completa

---

⚡ **IMPORTANTE**: No saltar ningún paso de seguridad. Es mejor demorar un día más que tener una brecha de seguridad en producción.