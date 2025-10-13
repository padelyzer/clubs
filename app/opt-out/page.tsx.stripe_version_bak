import { Suspense } from 'react'
import { OptOutForm } from './opt-out-form'

export default function OptOutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Cancelar Notificaciones
            </h1>
            <p className="text-gray-600">
              Gestiona tus preferencias de notificaciones por WhatsApp
            </p>
          </div>

          <Suspense fallback={<div>Cargando...</div>}>
            <OptOutForm />
          </Suspense>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            ¿Tienes preguntas? Contáctanos en{' '}
            <a href="mailto:soporte@padelyzer.com" className="text-blue-600 hover:underline">
              soporte@padelyzer.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}