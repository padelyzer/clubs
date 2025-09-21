# 🚀 Guía de Deployment - Padelyzer

## 📋 Tabla de Contenidos
- [Desarrollo Local (Docker)](#desarrollo-local-docker)
- [Producción (Vercel + Supabase)](#producción-vercel--supabase)
- [Comandos Útiles](#comandos-útiles)
- [Troubleshooting](#troubleshooting)

---

## 🐳 Desarrollo Local (Docker)

### Requisitos Previos
- Docker Desktop instalado
- Node.js 18+ instalado
- Git

### Configuración Inicial

1. **Clonar el repositorio**
```bash
git clone [tu-repo]
cd bmad-nextjs-app
```

2. **Instalar dependencias**
```bash
npm install --legacy-peer-deps
```

3. **Copiar variables de entorno**
```bash
cp .env.development .env
```

4. **Iniciar Docker y la aplicación**
```bash
npm run dev:docker
```

Esto ejecutará:
- PostgreSQL en puerto 5432
- PgAdmin en http://localhost:5050
- Next.js en http://localhost:3002

### Primera vez - Configurar base de datos

```bash
# Crear esquema y tablas
npm run db:push

# Cargar datos de prueba
npm run db:seed
```

### Credenciales de Desarrollo

**Base de Datos:**
- Usuario: `padelyzer`
- Password: `padelyzer_dev_2024`
- Database: `padelyzer_db`

**PgAdmin:**
- URL: http://localhost:5050
- Email: `admin@padelyzer.com`
- Password: `admin123`

**Usuarios de Prueba:**
- Owner: `owner@clubpadelpuebla.com` / `owner123`
- Admin: `admin@padelyzer.com` / `admin123`
- Staff: `staff@clubpadelpuebla.com` / `staff123`

---

## 🌐 Producción (Vercel + Supabase)

### Paso 1: Configurar Supabase

1. **Crear cuenta en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto

2. **Obtener credenciales**
   - Ve a Settings → Database
   - Copia el "Connection string" (modo Session)
   - Copia el "Direct connection string"

3. **Configurar Prisma en Supabase**
```sql
-- Ejecutar en SQL Editor de Supabase
CREATE SCHEMA IF NOT EXISTS public;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
```

### Paso 2: Configurar Vercel

1. **Conectar GitHub**
```bash
# En tu repositorio local
git remote add origin https://github.com/[tu-usuario]/padelyzer.git
git push -u origin main
```

2. **Importar en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio
   - Configura las variables de entorno:

```env
# En Vercel Dashboard → Settings → Environment Variables

DATABASE_URL="[Connection string de Supabase con pgbouncer]"
DIRECT_URL="[Direct connection string de Supabase]"
NEXTAUTH_SECRET="[Generar con: openssl rand -base64 32]"
NEXTAUTH_URL="https://tu-dominio.vercel.app"
```

3. **Configurar Build Command**
   - Build Command: `npm run vercel-build`
   - Output Directory: `.next`
   - Install Command: `npm install --legacy-peer-deps`

### Paso 3: Deploy

```bash
# Push cambios
git add .
git commit -m "Deploy to production"
git push origin main

# Vercel desplegará automáticamente
```

### Paso 4: Inicializar Base de Datos en Producción

```bash
# Localmente, apuntando a Supabase
export DATABASE_URL="[tu-url-de-supabase]"
npx prisma migrate deploy
npx prisma db seed
```

---

## 🛠️ Comandos Útiles

### Docker
```bash
# Iniciar servicios
npm run docker:up

# Detener servicios
npm run docker:down

# Resetear todo (borra datos)
npm run docker:reset

# Ver logs
docker-compose logs -f postgres
```

### Base de Datos
```bash
# Sincronizar esquema
npm run db:push

# Cargar datos de prueba
npm run db:seed

# Resetear DB (borra todo)
npm run db:reset

# Generar cliente Prisma
npx prisma generate

# Ver datos en Prisma Studio
npx prisma studio
```

### Desarrollo
```bash
# Desarrollo con Docker
npm run dev:docker

# Solo Next.js (requiere DB externa)
npm run dev

# Limpiar caché
rm -rf .next node_modules/.cache
```

---

## 🔧 Troubleshooting

### Error: "permission denied for schema public"
```bash
# Resetear Docker completamente
npm run docker:reset
npm run db:reset
```

### Error: "Cannot connect to database"
```bash
# Verificar que Docker esté corriendo
docker ps

# Verificar conexión
docker exec -it padelyzer_postgres psql -U padelyzer -d padelyzer_db -c "SELECT 1"
```

### Error en Vercel: "prisma command not found"
```bash
# Asegurarse de que package.json tenga:
"vercel-build": "prisma generate && prisma migrate deploy && next build"
```

### Limpiar todo y empezar de cero
```bash
# Detener todo
npm run docker:down

# Limpiar volúmenes de Docker
docker volume prune

# Limpiar node_modules y caché
rm -rf node_modules .next .turbo
npm install --legacy-peer-deps

# Reiniciar
npm run dev:docker
npm run db:reset
```

---

## 📊 Monitoreo

### Desarrollo
- **PgAdmin**: http://localhost:5050
- **Prisma Studio**: `npx prisma studio`

### Producción
- **Supabase Dashboard**: https://app.supabase.com/project/[tu-proyecto]
- **Vercel Dashboard**: https://vercel.com/[tu-usuario]/padelyzer
- **Logs**: Vercel Dashboard → Functions → Logs

---

## 🔐 Seguridad

### Checklist para Producción
- [ ] Cambiar todas las contraseñas por defecto
- [ ] Generar nuevo `NEXTAUTH_SECRET`
- [ ] Configurar CORS correctamente
- [ ] Habilitar SSL en base de datos
- [ ] Configurar rate limiting
- [ ] Backup automático en Supabase
- [ ] Configurar alertas en Vercel

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs`
2. Verifica las variables de entorno
3. Consulta la documentación de [Prisma](https://www.prisma.io/docs)
4. Abre un issue en GitHub

---

**Última actualización:** Diciembre 2024
**Versión:** 1.0.0