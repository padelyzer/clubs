# STORY-002: Sistema de Autenticación Multi-Tenant

## 🎯 Objetivo
Implementar sistema de autenticación con NextAuth.js que soporte múltiples roles y clubs, diferenciando entre usuarios del club (admin/recepción) y jugadores.

## 📋 Contexto para Claude Code
Padelyzer es multi-tenant: un jugador puede reservar en CUALQUIER club, pero staff del club solo ve SU club. Necesitamos auth con email/password inicialmente.

## ✅ Criterios de Aceptación
- [ ] NextAuth configurado con credenciales
- [ ] Login page para staff del club (`/login`)
- [ ] Login/registro para jugadores (`/player/auth`)
- [ ] Middleware protegiendo rutas `/dashboard/*`
- [ ] Roles funcionando (OWNER, ADMIN, RECEPTIONIST, PLAYER)
- [ ] Session incluye clubId para staff
- [ ] Seed con usuarios de prueba

## 📝 Instrucciones para Claude Code

### PASO 1: Configurar NextAuth
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  clubSlug: z.string().optional(), // Para staff login
})

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'club-staff',
      name: 'Club Staff Login',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        clubSlug: { label: "Club", type: "text" }
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password, clubSlug } = parsed.data

        // Find user
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            clubs: {
              include: { club: true }
            }
          }
        })

        if (!user || !await bcrypt.compare(password, user.password)) {
          return null
        }

        // Check for Super Admin first
        const superAdmin = user.clubs.find(uc => uc.role === 'SUPER_ADMIN')
        if (superAdmin) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'SUPER_ADMIN',
          }
        }

        // If clubSlug provided, verify user belongs to that club
        if (clubSlug) {
          const userClub = user.clubs.find(uc => 
            uc.club.slug === clubSlug && 
            ['OWNER', 'ADMIN', 'RECEPTIONIST'].includes(uc.role)
          )
          
          if (!userClub) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: userClub.role,
            clubId: userClub.clubId,
            clubSlug: userClub.club.slug,
          }
        }

        // Player login (no club specified)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'PLAYER',
        }
      }
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.clubId = user.clubId
        token.clubSlug = user.clubSlug
      }
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.clubId = token.clubId as string
        session.user.clubSlug = token.clubSlug as string
      }
      return session
    }
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})

export { handler as GET, handler as POST }
```

### PASO 2: Types para NextAuth
```typescript
// types/next-auth.d.ts
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      clubId?: string
      clubSlug?: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
    clubId?: string
    clubSlug?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    clubId?: string
    clubSlug?: string
  }
}
```

### PASO 3: Middleware de protección
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Super Admin routes
    if (path.startsWith('/super-admin')) {
      if (!token || token.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Dashboard routes require staff role
    if (path.startsWith('/dashboard')) {
      if (!token || !['OWNER', 'ADMIN', 'RECEPTIONIST'].includes(token.role as string)) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      // Ensure staff only accesses their club
      if (!token.clubId) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Player routes
    if (path.startsWith('/player/profile')) {
      if (!token) {
        return NextResponse.redirect(new URL('/player/auth', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/super-admin/:path*',
    '/dashboard/:path*',
    '/player/profile/:path*',
  ]
}
```

### PASO 4: Login Page para Staff
```tsx
// app/(web)/(public)/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clubSlug = searchParams.get('club')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    clubSlug: clubSlug || '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('club-staff', {
      email: formData.email,
      password: formData.password,
      clubSlug: formData.clubSlug,
      redirect: false,
    })

    if (result?.error) {
      setError('Credenciales inválidas o no perteneces a este club')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Padelyzer Staff</h2>
          <p className="mt-2 text-center text-gray-600">
            Acceso para administradores y recepción
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="clubSlug" className="block text-sm font-medium">
              Club ID
            </label>
            <input
              id="clubSlug"
              type="text"
              required
              value={formData.clubSlug}
              onChange={(e) => setFormData({...formData, clubSlug: e.target.value})}
              className="mt-1 block w-full border rounded-md px-3 py-2"
              placeholder="padel-puebla-centro"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="mt-1 block w-full border rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="mt-1 block w-full border rounded-md px-3 py-2"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

### PASO 5: Auth helper functions
```typescript
// lib/auth/auth.ts
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

export async function requireStaffAuth() {
  const session = await getServerSession()
  
  if (!session || !['OWNER', 'ADMIN', 'RECEPTIONIST'].includes(session.user.role)) {
    redirect('/login')
  }
  
  if (!session.user.clubId) {
    redirect('/login')
  }
  
  return session
}

export async function requireSuperAdmin() {
  const session = await getServerSession()
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }
  
  return session
}

export async function requirePlayerAuth() {
  const session = await getServerSession()
  if (!session) {
    redirect('/player/auth')
  }
  return session
}
```

### PASO 6: Seed de usuarios de prueba
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo club
  const club = await prisma.club.create({
    data: {
      slug: 'padel-demo-puebla',
      name: 'Padel Demo Puebla',
      email: 'info@padeldemo.mx',
      phone: '222-123-4567',
      address: 'Av. Juárez 123, Puebla',
      city: 'Puebla',
    }
  })

  // Create users with different roles
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Super Admin (Padelyzer team)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@padelyzer.com',
      name: 'Padelyzer Admin',
      password: hashedPassword,
      clubs: {
        create: {
          clubId: club.id,
          role: 'SUPER_ADMIN'
        }
      }
    }
  })

  // Owner
  const owner = await prisma.user.create({
    data: {
      email: 'owner@padeldemo.mx',
      name: 'Carlos Owner',
      password: hashedPassword,
      clubs: {
        create: {
          clubId: club.id,
          role: 'OWNER'
        }
      }
    }
  })

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@padeldemo.mx',
      name: 'Ana Admin',
      password: hashedPassword,
      clubs: {
        create: {
          clubId: club.id,
          role: 'ADMIN'
        }
      }
    }
  })

  // Receptionist
  const receptionist = await prisma.user.create({
    data: {
      email: 'recepcion@padeldemo.mx',
      name: 'Luis Recepción',
      password: hashedPassword,
      clubs: {
        create: {
          clubId: club.id,
          role: 'RECEPTIONIST'
        }
      }
    }
  })

  // Player (no club association)
  const player = await prisma.user.create({
    data: {
      email: 'player@gmail.com',
      name: 'María Jugadora',
      password: hashedPassword,
      level: 'Intermediate',
    }
  })

  console.log('Seed completed!')
  console.log('Test users:')
  console.log('- admin@padelyzer.com / password123 (SUPER ADMIN)')
  console.log('- owner@padeldemo.mx / password123 (club: padel-demo-puebla)')
  console.log('- admin@padeldemo.mx / password123 (club: padel-demo-puebla)')
  console.log('- recepcion@padeldemo.mx / password123 (club: padel-demo-puebla)')
  console.log('- player@gmail.com / password123 (jugador)')
  console.log('')
  console.log('Super Admin panel: http://localhost:3000/super-admin')
  console.log('Club dashboard: http://localhost:3000/dashboard')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

```json
// package.json - agregar script
{
  "scripts": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

## 🔍 Verificación
```bash
# Claude, ejecuta para verificar:
npx prisma migrate dev --name add-auth
npx prisma generate
npm run seed
npm run dev

# Luego prueba login en http://localhost:3000/login con:
# email: admin@padeldemo.mx
# password: password123
# club: padel-demo-puebla
```

## ⚠️ NO HACER
- NO usar OAuth todavía (Google, Facebook)
- NO implementar registro público aún
- NO agregar MFA o password reset
- NO crear UI elaborado, solo funcional

## Definition of Done
- [ ] NextAuth configurado y funcionando
- [ ] Login diferenciado staff vs jugadores
- [ ] Middleware protegiendo rutas
- [ ] Usuarios de prueba creados
- [ ] Session incluye role y clubId
- [ ] Login redirige a /dashboard correctamente