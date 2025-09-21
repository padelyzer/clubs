import Link from 'next/link'

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Club Registrado Exitosamente!
            </h1>
            <p className="text-gray-600 mb-6">
              Tu club ha sido registrado y está en proceso de revisión. 
              Recibirás un email de confirmación en menos de 24 horas.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">
                ¿Qué sigue?
              </h3>
              <ul className="text-sm text-green-800 text-left space-y-1">
                <li>1. Revisamos tu información (24h)</li>
                <li>2. Te enviamos email de aprobación</li>
                <li>3. Configuras canchas y horarios</li>
                <li>4. ¡Empiezas a recibir reservas!</li>
              </ul>
            </div>

            <div className="space-y-4">
              <Link
                href="/login"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 inline-block"
              >
                Iniciar Sesión
              </Link>
              
              <Link
                href="/"
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 inline-block"
              >
                Volver al Inicio
              </Link>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              <p>¿Preguntas? Escríbenos a:</p>
              <a 
                href="mailto:support@padelyzer.app"
                className="text-green-600 hover:text-green-500"
              >
                support@padelyzer.app
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* What they get for free */}
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-lg shadow p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          🎁 ¿Qué incluye tu plan GRATUITO?
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Reservas Core:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Reservas ilimitadas forever</li>
              <li>• Dashboard completo</li>
              <li>• Check-in de clientes</li>
              <li>• WhatsApp automático</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Diferenciadores:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Widget para tu website</li>
              <li>• Pagos divididos (4 jugadores)</li>
              <li>• App con todos los clubes</li>
              <li>• Soporte 24/7 en español</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ¿Quieres torneos y finanzas avanzadas?{' '}
            <a 
              href="https://pro.padelyzer.com"
              target="_blank"
              className="text-purple-600 hover:text-purple-500"
            >
              Ver Padelyzer Pro ($2,000/mes)
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}