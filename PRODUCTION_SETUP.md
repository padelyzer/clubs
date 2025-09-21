# 🚀 Production Setup Guide - Padelyzer

## 📋 Pre-requisitos

### 1. **PostgreSQL Database**

**Opción A: Neon (Recomendado - Gratis)**
```bash
# 1. Ve a https://neon.tech
# 2. Crea cuenta y proyecto "padelyzer-prod"
# 3. Copia el connection string
```

**Opción B: Supabase**
```bash
# 1. Ve a https://supabase.com
# 2. Crea proyecto nuevo
# 3. En Settings > Database, copia connection string
```

### 2. **Upstash Redis (Rate Limiting)**
```bash
# 1. Ve a https://console.upstash.com
# 2. Crea database Redis (gratis hasta 10k req/día)
# 3. Copia UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN
```

### 3. **Sentry (Error Tracking)**
```bash
# 1. Ve a https://sentry.io
# 2. Crea proyecto Next.js
# 3. Copia DSN
```

### 4. **Axiom (Logging)**
```bash
# 1. Ve a https://axiom.co
# 2. Crea cuenta (gratis hasta 500MB/mes)
# 3. Copia token y dataset info
```

## 🔧 Setup Steps

### 1. **Environment Variables**
```bash
# Copia el template
cp .env.local.postgres .env.local

# Edita con tus credenciales reales
nano .env.local
```

### 2. **Database Migration**
```bash
# Migra desde SQLite a PostgreSQL
npm run setup:production
```

### 3. **Verificar Setup**
```bash
# Genera cliente Prisma
npm run db:generate

# Ejecuta migraciones
npm run db:migrate

# Reinicia servidor
npm run dev
```

## ✅ Production Checklist

### **Seguridad**
- [ ] PostgreSQL con RLS habilitado
- [ ] Autenticación real con Lucia (no mocks)
- [ ] Rate limiting activo
- [ ] Security headers en middleware
- [ ] Secrets en variables de entorno

### **Monitoring**
- [ ] Sentry configurado para errors
- [ ] Axiom configurado para logs
- [ ] Upstash dashboard para rate limits

### **Performance**
- [ ] Redis cache habilitado
- [ ] Database connection pooling
- [ ] Rate limiting por endpoint

### **Business Logic**
- [ ] Multi-tenancy con RLS
- [ ] Pagos divididos funcionando
- [ ] WhatsApp notifications
- [ ] Backup strategy

## 🔍 Testing Production

### **API Endpoints**
```bash
# Test auth
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test rate limiting (debería fallar después de 5 intentos)
for i in {1..10}; do
  curl -X POST http://localhost:3002/api/auth/login
done
```

### **Database Isolation**
```sql
-- Test RLS
SET app.current_club_id = 'club1';
SELECT * FROM "Booking"; -- Solo debería ver bookings de club1

SET app.current_club_id = 'club2';
SELECT * FROM "Booking"; -- Solo debería ver bookings de club2
```

## 🚨 Troubleshooting

### **Common Issues**

1. **"Lucia adapter error"**
   ```bash
   npm install @lucia-auth/adapter-prisma@latest --legacy-peer-deps
   ```

2. **"Rate limiting not working"**
   - Verifica UPSTASH_* variables
   - Check Upstash console for requests

3. **"RLS policies not working"**
   ```bash
   npm run db:setup-rls
   ```

4. **"Hydration errors"**
   - Verifica NEXT_PUBLIC_APP_URL
   - Reinicia servidor: `npm run dev`

## 📊 Monitoring & Alerts

### **Dashboards**
- **Upstash**: Rate limiting metrics
- **Sentry**: Error tracking
- **Axiom**: Custom logs dashboard
- **Neon**: Database performance

### **Key Metrics**
- Rate limit hit rate < 1%
- Database query time < 100ms
- Error rate < 0.1%
- Memory usage < 512MB

## 🎯 Next Steps

1. **CI/CD Pipeline**
2. **E2E Tests con Playwright**
3. **Load Testing**
4. **Backup Automation**
5. **Feature Flags**

---

## 💰 **Monthly Costs (Estimated)**

```
Startup Scale (< 100 clubes):
- Neon: $0 (hasta 3GB)
- Upstash: $0 (hasta 10k req/día)
- Sentry: $0 (hasta 5k eventos)
- Axiom: $0 (hasta 500MB)
- Vercel: $0 (hobby)
Total: $0/mes

Growth Scale (100+ clubes):
- Neon Pro: $19/mes
- Upstash Pro: $10/mes
- Sentry Team: $26/mes
- Axiom Pro: $15/mes
- Vercel Pro: $20/mes
Total: ~$90/mes
```

**¿Listo para producción?** ✅