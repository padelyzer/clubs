'use client'

import { useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Trophy, Calendar, Users, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

export default function RegistrationSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isOnsitePayment = searchParams.get('onsite') === 'true'
  const registrationId = searchParams.get('registration_id')

  useEffect(() => {
    // You could fetch registration details here if needed
    // fetchRegistrationDetails(registrationId)
  }, [registrationId])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="border-green-200 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-800">
              ¡Inscripción Exitosa!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              {isOnsitePayment 
                ? 'Tu inscripción ha sido registrada. Por favor realiza el pago en el club.'
                : 'Tu pago ha sido procesado correctamente y tu inscripción está confirmada.'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Registration Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-600" />
                Detalles de tu Inscripción
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>Pareja registrada correctamente</span>
                </div>
                
                {registrationId && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <span className="text-sm">ID de Registro:</span>
                    <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                      {registrationId}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Próximos Pasos</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                {isOnsitePayment ? (
                  <>
                    <li>• Dirígete al club para completar el pago</li>
                    <li>• Presenta tu ID de registro al personal</li>
                    <li>• Tu inscripción será confirmada una vez realizado el pago</li>
                  </>
                ) : (
                  <>
                    <li>• Recibirás un email de confirmación con todos los detalles</li>
                    <li>• El calendario de partidos se publicará próximamente</li>
                    <li>• Te notificaremos cuando se publiquen los brackets</li>
                  </>
                )}
              </ul>
            </div>

            {/* Important Dates */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-yellow-600" />
                Fechas Importantes
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Publicación de brackets: 2 días antes del torneo</p>
                <p>• Reunión informativa: 30 minutos antes del inicio</p>
                <p>• Inicio del torneo: Según calendario publicado</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="text-center text-sm text-gray-600">
              <p>¿Tienes preguntas? Contáctanos:</p>
              <p className="font-medium mt-1">info@padelclub.com | +52 555 123 4567</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/tournament/${params.slug}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Ver Detalles del Torneo
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Guarda esta página o toma una captura de pantalla para tus registros.</p>
          {isOnsitePayment && (
            <p className="mt-2 font-medium text-orange-600">
              Recuerda: Tu inscripción no estará completa hasta realizar el pago.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}