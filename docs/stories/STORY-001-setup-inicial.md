# STORY-001: Setup Inicial del Proyecto Padelyzer

## 🎯 Objetivo
Configurar el proyecto base con Next.js 15, Prisma, y Expo con todas las dependencias necesarias para el MVP de PadelMX.

## 📋 Contexto para Claude Code
Estamos creando Padelyzer, una plataforma multi-tenant inteligente para gestión y análisis de clubes de padel en México. Architecture: Server Actions para web, API REST para mobile Expo.

## ✅ Criterios de Aceptación
- [ ] Proyecto Next.js 15 con App Router configurado
- [ ] Prisma con PostgreSQL configurado
- [ ] Estructura de carpetas según arquitectura BMAD
- [ ] Variables de entorno configuradas
- [ ] Proyecto Expo inicializado en carpeta `/mobile`
- [ ] README con instrucciones de setup

## 📝 Instrucciones para Claude Code

### PASO 1: Crear estructura base
```bash
# Claude, ejecuta estos comandos EN ESTE ORDEN:
cd /Users/ja/v4/bmad-nextjs-app

# 1. Limpiar proyecto actual si tiene archivos de ejemplo
rm -rf app/page.tsx app/layout.tsx app/globals.css

# 2. Instalar dependencias exactas
npm install next@15.0.3 react@19.0.0 react-dom@19.0.0 @prisma/client@6.0.1 next-auth@beta stripe@17.4.0 @upstash/redis@1.34.3 @upstash/ratelimit@2.0.5 zod@3.24.1 bcryptjs@2.4.3 @types/bcryptjs@2.4.6 twilio@5.3.7

npm install -D prisma@6.0.1 @types/node@22.10.2 @types/react@19.0.1 @types/react-dom@19.0.1
```

### PASO 2: Crear estructura de carpetas
```bash
# Claude, crea esta estructura EXACTA:
mkdir -p app/{(web)/{(auth)/{dashboard,clubs,courts,bookings},{(public)/{login,register,widget}},api/v1/{auth,clubs,courts,bookings,health},actions}
mkdir -p lib/{services,repositories,validations,utils,config}
mkdir -p components/{ui,features,layouts}
mkdir -p prisma
mkdir -p mobile
mkdir -p tests/{unit,integration,e2e}
```

### PASO 3: Configurar Prisma
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Multi-tenant models
model Club {
  id          String   @id @default(cuid())
  slug        String   @unique // URL-friendly: "padel-puebla-centro"
  name        String
  email       String
  phone       String
  address     String
  city        String   @default("Puebla")
  logo        String?  // URL to logo
  
  // Settings
  timezone    String   @default("America/Mexico_City")
  currency    String   @default("MXN")
  
  // Stripe
  stripeAccountId String? // Stripe Connect ID
  
  // Status
  status      ClubStatus @default(PENDING)
  active      Boolean  @default(false)
  trial       Boolean  @default(true)
  trialEndsAt DateTime @default(dbgenerated("NOW() + INTERVAL '30 days'"))
  
  // Approval
  approvedAt  DateTime?
  approvedBy  String?  // Super admin user ID
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  courts      Court[]
  users       UserClub[]
  bookings    Booking[]
  schedules   Schedule[]
  pricing     Pricing[]
}

model Court {
  id          String   @id @default(cuid())
  clubId      String
  name        String   // "Cancha 1", "Cancha Central"
  type        String   @default("PADEL") // PADEL, TENIS
  indoor      Boolean  @default(false)
  active      Boolean  @default(true)
  order       Int      @default(0) // Display order
  
  club        Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  bookings    Booking[]
  
  @@index([clubId])
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  phone       String?
  name        String
  password    String   // Hashed with bcrypt
  avatar      String?
  
  // Player stats
  level       String?  // Beginner, Intermediate, Advanced
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  clubs       UserClub[]
  bookings    Booking[]
  payments    Payment[]
}

model UserClub {
  id          String   @id @default(cuid())
  userId      String
  clubId      String
  role        Role     @default(PLAYER)
  
  user        User     @relation(fields: [userId], references: [id])
  club        Club     @relation(fields: [clubId], references: [id])
  
  @@unique([userId, clubId])
  @@index([clubId])
}

enum Role {
  SUPER_ADMIN  // Padelyzer team
  OWNER        // Club owner
  ADMIN        // Club admin
  RECEPTIONIST // Club receptionist
  INSTRUCTOR   // Club instructor
  PLAYER       // Player
}

enum ClubStatus {
  PENDING     // Waiting approval
  APPROVED    // Active and operational
  SUSPENDED   // Temporarily disabled
  REJECTED    // Not approved
}

model Booking {
  id          String   @id @default(cuid())
  clubId      String
  courtId     String
  userId      String?  // Null for guest bookings
  
  date        DateTime // Booking date
  startTime   String   // "09:00"
  endTime     String   // "10:30"
  duration    Int      // Minutes: 60, 90, 120
  
  // Player info
  playerName  String
  playerEmail String
  playerPhone String
  totalPlayers Int     @default(4)
  
  // Pricing
  price       Decimal  @db.Decimal(10, 2)
  currency    String   @default("MXN")
  
  // Payment
  paymentStatus PaymentStatus @default(PENDING)
  paymentType PaymentType   @default(ONSITE)
  
  // Status
  status      BookingStatus @default(CONFIRMED)
  checkedIn   Boolean  @default(false)
  notes       String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  club        Club     @relation(fields: [clubId], references: [id])
  court       Court    @relation(fields: [courtId], references: [id])
  user        User?    @relation(fields: [userId], references: [id])
  payments    Payment[]
  
  @@index([clubId, date])
  @@index([courtId, date])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}

enum PaymentStatus {
  PENDING
  PARTIAL
  PAID
  REFUNDED
}

enum PaymentType {
  ONLINE
  ONSITE
  TRANSFER
  CASH
}

model Payment {
  id          String   @id @default(cuid())
  bookingId   String
  userId      String?
  
  amount      Decimal  @db.Decimal(10, 2)
  currency    String   @default("MXN")
  
  method      PaymentType
  stripePaymentIntentId String?
  
  status      String   @default("pending")
  paidAt      DateTime?
  
  createdAt   DateTime @default(now())
  
  booking     Booking  @relation(fields: [bookingId], references: [id])
  user        User?    @relation(fields: [userId], references: [id])
  
  @@index([bookingId])
}

// Schedule templates
model Schedule {
  id          String   @id @default(cuid())
  clubId      String
  
  dayOfWeek   Int      // 0=Sunday, 6=Saturday
  openTime    String   // "07:00"
  closeTime   String   // "23:00"
  
  club        Club     @relation(fields: [clubId], references: [id])
  
  @@unique([clubId, dayOfWeek])
}

// Dynamic pricing
model Pricing {
  id          String   @id @default(cuid())
  clubId      String
  
  dayOfWeek   Int      // 0=Sunday, 6=Saturday
  startTime   String   // "07:00"
  endTime     String   // "23:00"
  price       Decimal  @db.Decimal(10, 2)
  
  club        Club     @relation(fields: [clubId], references: [id])
  
  @@index([clubId])
}
```

### PASO 4: Variables de entorno
```env
# .env.local
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/padelyzer?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_WHATSAPP_FROM=""

# Upstash Redis
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Padelyzer"
NEXT_PUBLIC_DOMAIN="padelyzer.app"
NEXT_PUBLIC_PRO_URL="https://pro.padelyzer.com"
```

### PASO 5: Configuración base
```typescript
// lib/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export const env = envSchema.parse(process.env)
```

```typescript
// lib/config/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### PASO 6: Setup Expo
```bash
# Claude, ejecuta:
cd mobile
npx create-expo-app@latest . --template blank-typescript
npm install expo-router @tanstack/react-query zustand nativewind
```

### PASO 7: README principal
```markdown
# 🎾 Padelyzer - Sistema Inteligente de Gestión de Clubes de Padel

## Setup Inicial

### Prerequisites
- Node.js 22+
- PostgreSQL 16+
- npm o pnpm

### Installation
\`\`\`bash
# 1. Install dependencies
npm install

# 2. Setup database
npx prisma migrate dev --name init
npx prisma generate

# 3. Run development
npm run dev

# 4. Mobile app (separate terminal)
cd mobile
npm start
\`\`\`

### Environment Variables
Copy `.env.example` to `.env.local` and fill in your values.

### Project Structure
- `/app` - Next.js App Router
- `/mobile` - Expo React Native app  
- `/lib` - Business logic
- `/prisma` - Database schema
\`\`\`
```

## 🔍 Verificación
```bash
# Claude, verifica que todo esté correcto:
ls -la app/
ls -la lib/
ls -la mobile/
cat prisma/schema.prisma | head -20
cat package.json | grep "next"
```

## ⚠️ NO HACER (Enforcement Rules)
- NO crear archivos de ejemplo o demo
- NO agregar componentes UI todavía
- NO configurar authentication todavía
- NO agregar más dependencias de las listadas
- NO crear archivos .tsx todavía, solo estructura

## Definition of Done
- [ ] Estructura de carpetas creada
- [ ] Prisma schema con modelos multi-tenant
- [ ] Variables de entorno configuradas
- [ ] Proyecto Expo inicializado
- [ ] Sin errores en `npm run dev`
- [ ] Sin errores en `npx prisma generate`