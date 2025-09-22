// import { LoginFormServerAction } from './login-form-server-action' // OLD - Server Action (30+ segundos)
import { LoginFormAPI } from './login-form-api' // NEW - API Route (< 1 segundo)
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        {/* Metaverse Grid with 3D perspective */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0" 
            style={{
              background: `
                linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              transform: 'perspective(1000px) rotateX(60deg) scale(2)',
              transformOrigin: 'center center',
              opacity: 0.6
            }}
          />
          {/* Additional grid layer for depth */}
          <div 
            className="absolute inset-0" 
            style={{
              background: `
                linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px',
              transform: 'perspective(1000px) rotateX(60deg) scale(2)',
              transformOrigin: 'center center',
              opacity: 0.4
            }}
          />
          {/* Animated scanning line effect */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              animation: 'scan 8s linear infinite',
              transform: 'translateY(-100%)'
            }}
          />
        </div>
        
        {/* Decorative circles with glow */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main content - Centered */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Glassmorphism Card with lighter background */}
          <div className="bg-white/85 backdrop-blur-md rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/50">
            {/* Logo */}
            <div className="mb-8">
              <div className="flex justify-center mb-6">
                <Image 
                  src="/Padelyzer-Logo-Negro.png" 
                  alt="Padelyzer" 
                  width={200} 
                  height={60}
                  priority
                />
              </div>
              <p className="text-gray-600 text-sm text-center">
                Por favor ingresa tu cuenta para continuar
              </p>
            </div>

            {/* Login Form - Using API Route for better performance */}
            <LoginFormAPI />
          </div>

          {/* Footer link */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-all inline-flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}