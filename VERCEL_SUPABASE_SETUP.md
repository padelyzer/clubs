# 🚀 Guía de Configuración: Vercel + Supabase

## Paso 1: Configurar Supabase (15-20 minutos)

### 1.1 Crear cuenta y proyecto
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Click en "New Project"
3. Configura:
   - **Project name**: bmad-padelyzer (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña fuerte (guárdala!)
   - **Region**: Selecciona la más cercana (para México: South America - São Paulo)
   - **Pricing Plan**: Free tier para empezar

### 1.2 Obtener credenciales de conexión
Una vez creado el proyecto, ve a:
1. **Settings** → **Database**
2. Copia el **Connection string** (URI)
3. Debería verse así:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 1.3 Configurar connection pooling
En la misma página de Database:
1. Busca "Connection Pooling"
2. Activa "Session mode"
3. Copia el **Connection pooling string** para usar con Prisma:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

### 1.4 Configurar variables locales para migración
Crea un archivo `.env.production` (NO lo subas a git):
```env
# Supabase Database URLs
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Para Supabase Auth (opcional, pero recomendado)
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

## Paso 2: Ejecutar Migraciones (5-10 minutos)

### 2.1 Preparar Prisma
```bash
# Instalar dependencias si no están
npm install @prisma/client prisma

# Generar cliente de Prisma
npx prisma generate
```

### 2.2 Ejecutar migraciones en Supabase
```bash
# Usa el DIRECT_URL (sin pooling) para migraciones
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
npx prisma migrate deploy

# Si es la primera vez, puedes usar:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
npx prisma db push
```

### 2.3 (Opcional) Seed inicial
Si tienes datos iniciales que cargar:
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
npx prisma db seed
```

## Paso 3: Preparar para Vercel (5 minutos)

### 3.1 Verificar package.json
Asegúrate de que tienes estos scripts:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

### 3.2 Crear vercel.json (opcional, para configuración avanzada)
```json
{
  "buildCommand": "prisma generate && next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3.3 Verificar que .env.production NO esté en git
```bash
# Asegúrate de que está en .gitignore
echo ".env.production" >> .gitignore
echo ".env.production.local" >> .gitignore
git add .gitignore
git commit -m "Add production env files to gitignore"
```

## Paso 4: Desplegar en Vercel (10-15 minutos)

### 4.1 Instalar Vercel CLI
```bash
npm i -g vercel
```

### 4.2 Login en Vercel
```bash
vercel login
```

### 4.3 Desplegar (primera vez)
```bash
# En la raíz del proyecto
vercel

# Te preguntará:
# - Set up and deploy? → Y
# - Which scope? → Tu cuenta personal o equipo
# - Link to existing project? → N (primera vez)
# - Project name? → bmad-padelyzer (o el que prefieras)
# - Directory? → ./
# - Override settings? → N
```

### 4.4 Configurar variables de entorno en Vercel
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Añade TODAS estas variables:

```env
# Base de datos (CRÍTICO)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Autenticación (CRÍTICO)
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=[genera con: openssl rand -base64 32]

# Supabase (opcional pero recomendado)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

# App
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
NEXT_PUBLIC_APP_NAME=Padelyzer
NODE_ENV=production

# Stripe (cuando tengas las llaves de producción)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# WhatsApp (cuando lo configures)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=...

# Rate Limiting (cuando configures Upstash Redis)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### 4.5 Redesplegar con variables
```bash
# Después de configurar las variables
vercel --prod
```

## Paso 5: Verificación (5 minutos)

### 5.1 Verificar despliegue
1. Abre la URL que te dio Vercel (ej: bmad-padelyzer.vercel.app)
2. Verifica que la página carga
3. Intenta hacer login

### 5.2 Verificar base de datos
En Supabase:
1. Ve a **Table Editor**
2. Verifica que las tablas se crearon correctamente
3. Revisa en **SQL Editor** si necesitas hacer queries

### 5.3 Monitorear logs
En Vercel:
1. Ve a **Functions** → **Logs**
2. Revisa si hay errores

## 🚨 Troubleshooting Común

### Error: "Can't reach database server"
- Verifica que usas el connection pooling string (puerto 6543) en DATABASE_URL
- Asegúrate de que la contraseña no tiene caracteres especiales sin escapar

### Error: "Prisma schema not found"
```bash
# Asegúrate de que el postinstall script está en package.json
"postinstall": "prisma generate"
```

### Error: "NEXTAUTH_SECRET not set"
- Genera uno nuevo: `openssl rand -base64 32`
- Añádelo en las variables de Vercel

### Error de migraciones
```bash
# Si las migraciones fallan, puedes resetear (⚠️ BORRA TODOS LOS DATOS)
DATABASE_URL=[DIRECT_URL] npx prisma migrate reset
```

## 📝 Checklist Final

- [ ] Supabase proyecto creado
- [ ] Migraciones ejecutadas exitosamente
- [ ] Variables de entorno configuradas en Vercel
- [ ] Sitio accesible en producción
- [ ] Login funcionando
- [ ] Base de datos conectada y funcionando

## 🎉 ¡Listo!

Tu aplicación debería estar corriendo en:
- **App**: https://[tu-proyecto].vercel.app
- **Base de datos**: Dashboard en supabase.com
- **Logs y monitoreo**: Dashboard en vercel.com

## Próximos pasos:
1. Configurar dominio personalizado
2. Configurar Stripe en producción
3. Activar WhatsApp Business API
4. Configurar backups automáticos en Supabase
5. Configurar monitoreo con Sentry