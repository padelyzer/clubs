import { ClubRegistrationForm } from './club-registration-form'
import Link from 'next/link'

export default function ClubRegistrationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-4xl">P</span>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Padelyzer</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Registra tu Club
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Gratis forever. Setup en 15 minutos. Empieza a recibir reservas hoy.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className="flex items-center text-green-600">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 border-2 border-green-600 rounded-full">
                  <span className="text-sm font-semibold">1</span>
                </div>
                <span className="ml-2 text-sm font-medium">Información del Club</span>
              </div>
              <div className="flex-1 ml-4 h-1 bg-gray-200 rounded">
                <div className="h-1 bg-green-600 rounded" style={{ width: '33%' }}></div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 ml-10">
              Siguiente: Configurar canchas y horarios
            </div>
          </div>

          <ClubRegistrationForm />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Iniciar sesión
            </Link>
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-gray-600 hover:text-gray-900"
          >
            ← Volver al inicio
          </Link>
        </div>

        {/* Trust Signals */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">🔒 ¿Por qué confiar en Padelyzer?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <ul className="space-y-1">
                <li>• 30+ clubes ya lo usan en Puebla</li>
                <li>• Datos seguros con encriptación</li>
                <li>• Soporte 24/7 en español</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-1">
                <li>• Gratis para siempre (reservas)</li>
                <li>• Setup en 15 minutos</li>
                <li>• Cancelable cuando quieras</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}