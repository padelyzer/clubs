'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFallbackAuthContext } from '@/components/providers/fallback-auth-provider'
import { LoginCookieWarning } from '@/components/LoginCookieWarning'

export function LoginFormFallback() {
  const { login } = useFallbackAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await login(email, password)
    
    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión')
      setIsLoading(false)
    }
    // Si es exitoso, el hook se encarga de la redirección
  }

  return (
    <>
      <LoginCookieWarning />
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
        <p className="text-sm text-yellow-800">
          <strong>Modo alternativo activado:</strong> Usando autenticación sin cookies debido a restricciones del navegador.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isLoading}
          className="w-full px-4 py-3.5 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="nombre@ejemplo.com"
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={isLoading}
            className="w-full px-4 py-3.5 pr-12 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Remember & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            disabled={isLoading}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
          />
          <label htmlFor="remember-me" className="ml-2.5 text-sm text-gray-600 cursor-pointer select-none">
            Mantenerme conectado
          </label>
        </div>

        <a href="#" className="text-sm text-green-600 hover:text-green-500 font-medium transition-colors">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full font-bold py-4 px-6 rounded-2xl hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-gray-400/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg !bg-black !text-white hover:!bg-gray-800"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Iniciando sesión...</span>
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </div>

      {/* Register Link */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link
            href="/register/club"
            className="font-semibold text-green-600 hover:text-green-500 transition-colors"
          >
            Registra tu club gratis
          </Link>
        </p>
      </div>
    </form>
    </>
  )
}