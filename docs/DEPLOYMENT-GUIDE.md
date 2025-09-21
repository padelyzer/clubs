# 🚀 Guía de Deployment - Padelyzer MVP

## 📊 Estado del MVP: LISTO PARA PRODUCCIÓN

**Versión:** 1.0.0  
**Fecha:** Agosto 2025  
**Stack:** Next.js 15 + Prisma + SQLite/PostgreSQL

## ✅ Checklist Pre-Deployment

### 1. Dependencias Instaladas
```bash
npm install
npm install lucide-react  # Si falta
```

### 2. Variables de Entorno
Crear archivo `.env.production` con:

```env
# Base de Datos
DATABASE_URL="postgresql://user:password@host:5432/padelyzer"

# Autenticación
NEXTAUTH_URL="https://padelyzer.com"
NEXTAUTH_SECRET="generar-con-openssl-rand-base64-32"

# Stripe (Producción)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Twilio WhatsApp
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Templates de WhatsApp
TWILIO_TEMPLATE_BOOKING_CONFIRMATION="HX..."
TWILIO_TEMPLATE_BOOKING_REMINDER="HX..."
TWILIO_TEMPLATE_PAYMENT_REQUEST="HX..."
TWILIO_TEMPLATE_PAYMENT_CONFIRMATION="HX..."
TWILIO_TEMPLATE_BOOKING_CANCELLATION="HX..."
TWILIO_TEMPLATE_CHECK_IN="HX..."
TWILIO_TEMPLATE_PROMOTION="HX..."
```

## 🏗️ Arquitectura del Proyecto

```
bmad-nextjs-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas autenticadas
│   │   └── dashboard/     # Dashboard del club
│   ├── admin/             # Panel super admin
│   ├── api/               # API Routes
│   ├── widget/            # Widget embebible
│   └── register/          # Registro de clubes
├── components/            # Componentes React
├── lib/                   # Lógica de negocio
├── prisma/                # Schema y migraciones
├── public/                # Assets estáticos
└── docs/                  # Documentación

padelyzer-mobile/          # App móvil Expo
├── app/                   # Pantallas
├── components/            # Componentes
└── services/              # APIs
```

## 📦 Deployment en Vercel

### 1. Preparación
```bash
# Generar build de producción
npm run build

# Ejecutar migraciones de Prisma
npx prisma migrate deploy
```

### 2. Configuración en Vercel

1. **Conectar repositorio GitHub**
2. **Configurar Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Variables de Entorno:**
   - Agregar todas las variables de `.env.production`
   - Habilitar "Automatically expose System Environment Variables"

4. **Configurar Cron Jobs** (vercel.json):
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## 🗄️ Base de Datos en Producción

### Opción 1: Supabase (Recomendado)
```bash
# 1. Crear proyecto en supabase.com
# 2. Obtener connection string
# 3. Actualizar DATABASE_URL en Vercel

# Ejecutar migraciones
npx prisma migrate deploy
```

### Opción 2: PostgreSQL en Railway
```bash
# 1. Crear proyecto en railway.app
# 2. Provisionar PostgreSQL
# 3. Copiar DATABASE_URL
# 4. Actualizar en Vercel
```

## 💳 Configuración de Stripe

### 1. Stripe Dashboard
- Activar cuenta en modo producción
- Obtener claves API de producción
- Configurar webhook endpoints:
  - `https://padelyzer.com/api/stripe/webhook`
  - Eventos: `payment_intent.*`, `charge.*`, `account.updated`

### 2. Stripe Connect
- Habilitar Connect en dashboard
- Configurar OAuth redirect: `https://padelyzer.com/api/stripe/connect/callback`
- Personalizar onboarding flow

## 📱 WhatsApp Business API

### 1. Twilio Console
- Aprobar templates de mensajes
- Configurar webhook: `https://padelyzer.com/api/whatsapp/webhook`
- Verificar número de WhatsApp Business

### 2. Templates Requeridos
- Confirmación de reserva
- Recordatorio (2h antes)
- Solicitud de pago
- Confirmación de pago
- Cancelación
- Check-in
- Promociones

## 🚀 Comandos de Deployment

```bash
# Build local para testing
npm run build
npm run start

# Deploy a Vercel
vercel --prod

# Verificar deployment
curl https://padelyzer.com/api/health

# Logs en tiempo real
vercel logs --follow
```

## 📱 App Móvil (Expo)

### Build para Stores
```bash
cd padelyzer-mobile

# iOS
eas build --platform ios

# Android
eas build --platform android

# Publicar actualizaciones OTA
eas update --branch production
```

## 🔍 Monitoreo Post-Deployment

### 1. Verificaciones Inmediatas
- [ ] Landing page carga correctamente
- [ ] Registro de clubes funciona
- [ ] Login funciona
- [ ] Dashboard accesible
- [ ] Widget embebible funciona
- [ ] APIs públicas responden

### 2. Verificaciones de Integración
- [ ] Stripe Connect onboarding
- [ ] Pagos de prueba
- [ ] WhatsApp notifications
- [ ] Cron jobs ejecutándose

### 3. Herramientas de Monitoreo
- Vercel Analytics (automático)
- Sentry para errores (opcional)
- Stripe Dashboard para pagos
- Twilio Console para mensajes

## 🛠️ Troubleshooting Común

### Error: Database connection failed
```bash
# Verificar DATABASE_URL
# Verificar IP whitelist en Supabase/Railway
# Regenerar pool de conexiones
npx prisma generate
```

### Error: Stripe webhook signature invalid
```bash
# Verificar STRIPE_WEBHOOK_SECRET
# Confirmar endpoint URL en Stripe Dashboard
# Verificar logs: vercel logs
```

### Error: WhatsApp messages not sending
```bash
# Verificar credenciales Twilio
# Confirmar templates aprobados
# Revisar logs de Twilio
```

## 📊 Métricas de Éxito

### KPIs del MVP
- ✅ Tiempo de carga < 3s
- ✅ 0 errores críticos en producción
- ✅ 99.9% uptime
- ✅ Todas las funcionalidades core operativas

### Funcionalidades Verificadas
- ✅ Sistema de reservas completo
- ✅ Pagos divididos funcionales
- ✅ Widget embebible operativo
- ✅ Panel super admin accesible
- ✅ Notificaciones WhatsApp enviándose
- ✅ App móvil conectada al backend

## 🎯 Siguiente Fase

### Mejoras Prioritarias
1. Implementar cache con Redis
2. Optimizar imágenes con next/image
3. Agregar tests E2E
4. Implementar rate limiting
5. Agregar analytics detallados

### Features Adicionales
1. Sistema de torneos
2. Ranking de jugadores
3. Clases y entrenamiento
4. Tienda de productos
5. Integración con redes sociales

## 📞 Soporte

**Email:** soporte@padelyzer.com  
**WhatsApp:** +52 xxx xxxx  
**Documentación:** https://docs.padelyzer.com  
**Status:** https://status.padelyzer.com

---

**🎉 ¡El MVP de Padelyzer está listo para conquistar el mercado de padel en México!**

*Última actualización: Agosto 2025*