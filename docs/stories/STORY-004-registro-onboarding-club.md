# STORY-004: Registro y Onboarding de Club

## 🎯 Objetivo
Crear flujo completo para que dueños de clubes de padel puedan registrarse en Padelyzer, proporcionando información necesaria y quedando en estado PENDING hasta aprobación del Super Admin.

## 📋 Contexto para Claude Code
Dueños de clubes llegan a padelyzer.com, ven landing page, y pueden registrar su club. Esto crea usuario OWNER + club en estado PENDING. Super Admin después aprueba/rechaza.

## ✅ Criterios de Aceptación
- [ ] Landing page `/` con call-to-action "Registrar mi club"
- [ ] Formulario de registro `/registro-club` con validación completa
- [ ] Crear usuario OWNER + club en estado PENDING
- [ ] Email de confirmación "Solicitud recibida" 
- [ ] Página de confirmación con próximos pasos
- [ ] Validación de slug único y datos obligatorios

## 📝 Instrucciones para Claude Code

### PASO 1: Landing Page Principal
```tsx
// app/(web)/(public)/page.tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              🎾 <span className="text-green-600">Padelyzer</span>
              <span className="text-2xl text-gray-500 font-normal">.app</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              La solución accesible para clubes de padel en México.
              <br />
              <strong>Reservas gratis forever.</strong> Sin costos prohibitivos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/registro-club"
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
              >
                🏟️ Registrar mi Club
              </Link>
              <Link
                href="/demo"
                className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors"
              >
                👁️ Ver Demo
              </Link>
            </div>

            <p className="text-gray-500 text-sm">
              ¿Eres jugador? 
              <Link href="/player/auth" className="text-green-600 hover:underline ml-1">
                Encuentra clubes aquí
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Padelyzer?
            </h2>
            <p className="text-xl text-gray-600">
              La diferencia que necesitas vs Playtomic y Excel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="💰"
              title="100% Gratis Forever"
              description="Módulo de reservas completamente gratis. Alternativa accesible a soluciones enterprise."
              highlight="vs Pro: $5,999/mes"
            />
            <FeatureCard
              icon="🇲🇽"
              title="Hecho para México"
              description="Precios en pesos, soporte en español, integración con WhatsApp. Para el mercado mexicano."
              highlight="vs Competencia extranjera"
            />
            <FeatureCard
              icon="👥"
              title="Pagos Divididos"
              description="Única plataforma que maneja pagos divididos entre 4 jugadores nativamente."
              highlight="Exclusivo de Padelyzer"
            />
            <FeatureCard
              icon="📊"
              title="Analytics Inteligente"
              description="Métricas que importan: ingresos por hora, ocupación, clientes frecuentes."
              highlight="Más que Excel"
            />
            <FeatureCard
              icon="🔧"
              title="Widget para tu Web"
              description="Sistema de reservas que puedes embeber en tu sitio web. Una línea de código."
              highlight="Plug & play"
            />
            <FeatureCard
              icon="📱"
              title="App Multi-Club"
              description="Tus clientes ven tu club en LA app del padel mexicano. Mayor exposición."
              highlight="Network effects"
            />
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="py-24 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Elige la solución perfecta para tu club
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Padelyzer.app */}
            <div className="bg-white text-gray-900 rounded-lg p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Padelyzer.app
                </h3>
                <p className="text-gray-600 mb-6">Para clubes pequeños y medianos</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-600">/mes módulo reservas</span>
                </div>

                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Sistema de reservas completo
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Pagos divididos nativos
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Widget para tu website
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    App mobile para jugadores
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Soporte básico
                  </li>
                </ul>

                <Link
                  href="/registro-club"
                  className="block bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Empezar Gratis
                </Link>
              </div>
            </div>

            {/* Padelyzer Pro */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-8 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">
                  Padelyzer Pro
                </h3>
                <p className="text-purple-100 mb-6">Para clubes premium y múltiples locaciones</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">$5,999</span>
                  <span className="text-purple-100">/mes desde</span>
                </div>

                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Todo de Padelyzer.app +
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    IA para precios dinámicos
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Control de acceso QR
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Marketing automatizado
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Garantía +30% ingresos
                  </li>
                </ul>

                <a
                  href="https://pro.padelyzer.com"
                  target="_blank"
                  className="block bg-white text-purple-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Ver Padelyzer Pro
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Comienza con la versión gratuita
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Más de 30 clubes en Puebla ya digitalizaron sus reservas.
            <br />
            Puedes upgradear a Pro cuando tu club crezca.
          </p>
          <Link
            href="/registro-club"
            className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Empezar Gratis Ahora
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">🎾 Padelyzer</h3>
            <p className="text-gray-400 mb-6">
              La plataforma inteligente del padel mexicano
            </p>
            <div className="flex justify-center space-x-6">
              <a href="mailto:hola@padelyzer.com" className="text-gray-400 hover:text-white">
                Contacto
              </a>
              <a href="/terminos" className="text-gray-400 hover:text-white">
                Términos
              </a>
              <a href="/privacidad" className="text-gray-400 hover:text-white">
                Privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  highlight 
}: { 
  icon: string
  title: string
  description: string
  highlight: string
}) {
  return (
    <div className="text-center p-6 rounded-lg border-2 border-gray-100 hover:border-green-200 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
        {highlight}
      </div>
    </div>
  )
}
```

### PASO 2: Formulario de Registro
```tsx
// app/(web)/(public)/registro-club/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registrarClub } from './actions'

export default function RegistroClubPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setErrors({})

    const result = await registrarClub(formData)

    if (result.errors) {
      setErrors(result.errors)
      setLoading(false)
    } else if (result.success) {
      router.push(`/registro-club/confirmacion?club=${result.clubSlug}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Registra tu Club de Padel
          </h1>
          <p className="text-gray-600 mt-2">
            Únete a Padelyzer y digitaliza tu club en minutos
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-8">
          <form action={handleSubmit} className="space-y-6">
            {/* Información del Club */}
            <div>
              <h3 className="text-lg font-semibold mb-4">📍 Información del Club</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Club *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Ej: Padel Center Puebla"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID del Club (URL) *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      padelyzer.com/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      required
                      placeholder="padel-center-puebla"
                      className="flex-1 border rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  {errors.slug && (
                    <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Solo letras, números y guiones. Este será tu URL único.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="222-123-4567"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email del Club *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="info@padelcenter.mx"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección Completa *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Av. Juárez 123, Col. Centro, Puebla, Pue."
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <select
                  name="city"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Seleccionar ciudad...</option>
                  <option value="Puebla">Puebla</option>
                  <option value="CDMX">Ciudad de México</option>
                  <option value="Guadalajara">Guadalajara</option>
                  <option value="Monterrey">Monterrey</option>
                  <option value="Otra">Otra ciudad</option>
                </select>
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>
            </div>

            {/* Información del Dueño */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">👤 Información del Dueño</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    required
                    placeholder="Juan Pérez"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.ownerName && (
                    <p className="text-red-500 text-sm mt-1">{errors.ownerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Personal *
                  </label>
                  <input
                    type="email"
                    name="ownerEmail"
                    required
                    placeholder="juan@gmail.com"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.ownerEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.ownerEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Mínimo 8 caracteres"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="Repetir contraseña"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">🏟️ Información Adicional</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Canchas *
                  </label>
                  <select
                    name="courtCount"
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="1">1 cancha</option>
                    <option value="2">2 canchas</option>
                    <option value="3">3 canchas</option>
                    <option value="4">4 canchas</option>
                    <option value="5">5 canchas</option>
                    <option value="6">6 canchas</option>
                    <option value="8">8 canchas</option>
                    <option value="10">10 canchas</option>
                    <option value="12">12+ canchas</option>
                  </select>
                  {errors.courtCount && (
                    <p className="text-red-500 text-sm mt-1">{errors.courtCount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Promedio por Hora
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      name="averagePrice"
                      placeholder="450"
                      min="100"
                      max="2000"
                      className="flex-1 border rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Opcional. Nos ayuda a configurar precios sugeridos.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Cómo gestionas las reservas actualmente?
                </label>
                <select
                  name="currentSystem"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="excel">Excel + WhatsApp</option>
                  <option value="papel">Agenda de papel</option>
                  <option value="otro-sistema">Otro sistema digital</option>
                  <option value="nada">No tengo sistema</option>
                </select>
              </div>
            </div>

            {/* Términos */}
            <div className="border-t pt-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  required
                  className="mt-1 mr-3"
                />
                <div className="text-sm">
                  <p className="text-gray-700">
                    Acepto los{' '}
                    <a href="/terminos" className="text-green-600 hover:underline">
                      términos y condiciones
                    </a>{' '}
                    y la{' '}
                    <a href="/privacidad" className="text-green-600 hover:underline">
                      política de privacidad
                    </a>{' '}
                    de Padelyzer.
                  </p>
                  <p className="text-gray-500 mt-2">
                    Al registrarte, tu club quedará en revisión. Te notificaremos por email cuando sea aprobado.
                  </p>
                </div>
              </div>
              {errors.acceptTerms && (
                <p className="text-red-500 text-sm mt-1">{errors.acceptTerms}</p>
              )}
            </div>

            {/* Submit */}
            <div className="border-t pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registrando...' : '🚀 Registrar mi Club'}
              </button>
              
              <p className="text-center text-gray-500 text-sm mt-4">
                ¿Ya tienes cuenta?{' '}
                <a href="/login" className="text-green-600 hover:underline">
                  Inicia sesión aquí
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
```

### PASO 3: Server Action para Registro
```typescript
// app/(web)/(public)/registro-club/actions.ts
'use server'

import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

const RegistroSchema = z.object({
  // Club info
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  slug: z.string()
    .min(3, 'ID debe tener al menos 3 caracteres')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono inválido'),
  address: z.string().min(10, 'Dirección muy corta'),
  city: z.string().min(2, 'Ciudad requerida'),
  
  // Owner info
  ownerName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  ownerEmail: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
  
  // Additional info
  courtCount: z.string().transform(val => parseInt(val)),
  averagePrice: z.string().optional().transform(val => val ? parseInt(val) : null),
  currentSystem: z.string().optional(),
  
  // Terms
  acceptTerms: z.string().refine(val => val === 'on', 'Debes aceptar los términos'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export async function registrarClub(formData: FormData) {
  try {
    // Parse and validate
    const rawData = Object.fromEntries(formData)
    const parsed = RegistroSchema.safeParse(rawData)
    
    if (!parsed.success) {
      return {
        errors: parsed.error.flatten().fieldErrors
      }
    }

    const data = parsed.data

    // Check if slug is unique
    const existingClub = await prisma.club.findUnique({
      where: { slug: data.slug }
    })

    if (existingClub) {
      return {
        errors: {
          slug: ['Este ID ya está en uso. Prueba con otro.']
        }
      }
    }

    // Check if owner email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.ownerEmail }
    })

    if (existingUser) {
      return {
        errors: {
          ownerEmail: ['Este email ya está registrado.']
        }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create club and owner in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create club
      const club = await tx.club.create({
        data: {
          slug: data.slug,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          status: 'PENDING',
          active: false,
        }
      })

      // Create owner user
      const owner = await tx.user.create({
        data: {
          email: data.ownerEmail,
          name: data.ownerName,
          password: hashedPassword,
        }
      })

      // Associate owner with club
      await tx.userClub.create({
        data: {
          userId: owner.id,
          clubId: club.id,
          role: 'OWNER',
        }
      })

      // Create courts based on count
      const courts = Array.from({ length: data.courtCount }, (_, i) => ({
        clubId: club.id,
        name: `Cancha ${i + 1}`,
        type: 'PADEL',
        order: i + 1,
      }))

      await tx.court.createMany({
        data: courts
      })

      return { club, owner }
    })

    // TODO: Send confirmation email

    return {
      success: true,
      clubSlug: data.slug,
    }

  } catch (error) {
    console.error('Registration error:', error)
    return {
      errors: {
        general: ['Error interno. Intenta de nuevo.']
      }
    }
  }
}
```

### PASO 4: Página de Confirmación
```tsx
// app/(web)/(public)/registro-club/confirmacion/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/config/prisma'
import { notFound } from 'next/navigation'

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: { club?: string }
}) {
  if (!searchParams.club) {
    notFound()
  }

  const club = await prisma.club.findUnique({
    where: { slug: searchParams.club },
    select: {
      name: true,
      email: true,
      status: true,
    }
  })

  if (!club) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Solicitud Enviada!
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Gracias por registrar <strong>{club.name}</strong> en Padelyzer
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Próximos pasos:</h3>
            <div className="text-left text-blue-800 space-y-2">
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                <p>Nuestro equipo revisará la información de tu club</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                <p>Te notificaremos por email a <strong>{club.email}</strong> cuando sea aprobado</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                <p>Podrás acceder a tu dashboard y empezar a recibir reservas</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800 text-sm">
              <strong>⏱️ Tiempo de revisión:</strong> Usualmente 24-48 horas en días hábiles
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Volver al inicio
            </Link>
            <Link
              href="/demo"
              className="border border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50"
            >
              Ver demo mientras tanto
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-gray-600 text-sm">
              ¿Preguntas sobre tu solicitud?
              <br />
              Contáctanos: <a href="mailto:hola@padelyzer.com" className="text-green-600 hover:underline">hola@padelyzer.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### PASO 5: Actualizar estructura de routing
```bash
# Claude, crea esta estructura:
mkdir -p app/\(web\)/\(public\)/{registro-club/confirmacion,demo}
```

## 🔍 Verificación
```bash
# Claude, verificar el flujo completo:
npm run dev

# Probar:
# 1. Ir a http://localhost:3000/
# 2. Click "Registrar mi Club"
# 3. Llenar formulario completo
# 4. Verificar que se crea club en estado PENDING
# 5. Verificar página de confirmación
# 6. Login como Super Admin y ver el club pendiente
```

## ⚠️ NO HACER
- NO implementar envío de emails aún
- NO agregar upload de logo/imágenes
- NO crear wizard multi-paso
- NO agregar validación en tiempo real de slug

## Definition of Done
- [ ] Landing page atractiva con call-to-action
- [ ] Formulario de registro completo con validación
- [ ] Club + Owner creados en estado PENDING
- [ ] Página de confirmación informativa
- [ ] Slug único validado
- [ ] Canchas creadas automáticamente
- [ ] Super Admin puede ver clubs pendientes