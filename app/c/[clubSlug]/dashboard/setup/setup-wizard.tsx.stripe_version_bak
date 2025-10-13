'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { completeSetup } from './actions'
import { useRouter, useParams } from 'next/navigation'

export function SetupWizard({ club, setupStatus, isComplete }: { 
  club: any
  setupStatus: any
  isComplete: boolean 
}) {
  const params = useParams()
  const clubSlug = params.clubSlug as string
  const [currentStep, setCurrentStep] = useState(
    !setupStatus.courts ? 0 :
    !setupStatus.schedules ? 1 :
    !setupStatus.pricing ? 2 : 3
  )
  
  console.log('SetupWizard estado:', {
    currentStep,
    setupStatus,
    isComplete,
    club: { name: club?.name, active: club?.active }
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const steps = [
    {
      id: 0,
      title: 'Canchas',
      description: 'Configura tus canchas',
      completed: setupStatus.courts,
      icon: 'Canchas'
    },
    {
      id: 1,
      title: 'Horarios',
      description: 'Define horarios de operación',
      completed: setupStatus.schedules,
      icon: 'Horarios'
    },
    {
      id: 2,
      title: 'Precios',
      description: 'Establece precios por hora',
      completed: setupStatus.pricing,
      icon: 'Precios'
    },
    {
      id: 3,
      title: 'Completar',
      description: 'Activar tu club',
      completed: isComplete,
      icon: 'Activar'
    }
  ]

  async function handleCompleteSetup() {
    console.log('Iniciando completeSetup...')
    setLoading(true)
    try {
      console.log('Ejecutando completeSetup()')
      await completeSetup()
      console.log('completeSetup() exitoso, redirigiendo...')
      router.push(`/c/${clubSlug}/dashboard?setup=complete`)
      router.refresh()
    } catch (error) {
      console.error('Error en completeSetup:', error)
      alert('Error al completar configuración: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <Card className="card-elevated">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`flex items-center justify-center w-16 h-16 rounded-2xl border-2 font-semibold text-lg transition-all duration-300 ${
                    step.completed
                      ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-500 text-white shadow-lg'
                      : index === currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {step.completed ? 'OK' : step.icon}
                </button>
                <div className="ml-4 text-left">
                  <p className={`font-semibold ${
                    index === currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="mx-8 flex-1 h-0.5 bg-gray-300 relative">
                    <div 
                      className={`h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 ${
                        step.completed ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="animate-fade-in-up">
            {currentStep === 0 && (
              <SetupStep
                title="Configura tus Canchas"
                description="Define las canchas disponibles en tu club"
                completed={setupStatus.courts}
                actionText="Configurar Canchas"
                actionHref="/dashboard/courts"
                currentData={`${club.courts.length} canchas configuradas`}
              />
            )}

            {currentStep === 1 && (
              <SetupStep
                title="Define tus Horarios"
                description="Establece los horarios de operación de tu club"
                completed={setupStatus.schedules}
                actionText="Configurar Horarios"
                actionHref="/dashboard/schedule"
                currentData={`${club.schedules.length} días configurados`}
              />
            )}

            {currentStep === 2 && (
              <SetupStep
                title="Establece tus Precios"
                description="Define los precios por hora para cada tipo de cancha"
                completed={setupStatus.pricing}
                actionText="Configurar Precios"
                actionHref="/dashboard/pricing"
                currentData={`${club.pricing.length} reglas de precio`}
              />
            )}

            {currentStep === 3 && (
              <div className="text-center py-12">
                <span className="text-8xl mb-6 block text-green-600 font-bold">LISTO!</span>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  ¡Todo listo para activar tu club!
                </h3>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Has completado toda la configuración. Tu club aparecerá en la app 
                  y podrás empezar a recibir reservas inmediatamente.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
                  <h4 className="font-semibold text-green-900 mb-3">
                    Todo está configurado:
                  </h4>
                  <ul className="text-green-800 space-y-1">
                    <li>• {club.courts.length} canchas listas</li>
                    <li>• {club.schedules.length} días de operación</li>
                    <li>• {club.pricing.length} reglas de precio</li>
                    <li>• Widget embebible disponible</li>
                  </ul>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    console.log('BOTON CLICKEADO!')
                    handleCompleteSetup()
                  }}
                  loading={loading}
                  className="btn-primary btn-xl"
                >
                  Activar Mi Club
                </Button>

                <p className="text-sm text-gray-500 mt-4">
                  Una vez activado, tu club aparecerá en la app de Padelyzer
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
          disabled={currentStep === 0}
          variant="secondary"
        >
          ← Anterior
        </Button>
        
        <Button
          onClick={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
          disabled={currentStep === steps.length - 1}
          variant="primary"
        >
          Siguiente →
        </Button>
      </div>
    </div>
  )
}

function SetupStep({ 
  title, 
  description, 
  completed, 
  actionText, 
  actionHref,
  currentData 
}: {
  title: string
  description: string
  completed: boolean
  actionText: string
  actionHref: string
  currentData: string
}) {
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-xl mx-auto">{description}</p>
      
      {completed ? (
        <div className="space-y-6">
          <div className="inline-flex items-center px-6 py-3 bg-green-50 border border-green-200 rounded-xl">
            <span className="text-green-600 mr-3 font-semibold">OK:</span>
            <span className="text-green-800 font-medium">{currentData}</span>
          </div>
          <div>
            <a href={actionHref} className="btn-secondary">
              Editar Configuración
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="inline-flex items-center px-6 py-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <span className="text-yellow-600 mr-3 font-semibold">Pend:</span>
            <span className="text-yellow-800 font-medium">Configuración pendiente</span>
          </div>
          <div>
            <a href={actionHref} className="btn-primary btn-lg">
              {actionText}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}