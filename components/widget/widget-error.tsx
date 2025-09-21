interface WidgetErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function WidgetError({ 
  title = "Error al cargar",
  message = "No se pudo cargar la información. Intenta de nuevo.",
  onRetry 
}: WidgetErrorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="text-red-500 text-4xl mb-4">!</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}

export function WidgetNotFound({ clubName }: { clubName?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <div className="text-gray-400 text-6xl mb-4">?</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {clubName ? `${clubName} no disponible` : 'Club no encontrado'}
      </h3>
      <p className="text-gray-600 mb-4">
        Este club no está disponible para reservas en línea en este momento.
      </p>
      <div className="text-sm text-gray-500">
        Si crees que esto es un error, contacta al club directamente.
      </div>
    </div>
  )
}