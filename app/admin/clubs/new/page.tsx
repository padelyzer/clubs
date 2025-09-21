import { requireSuperAdmin } from '@/lib/auth/actions'
import NewClubForm from './new-club-form'

export default async function NewClubPage() {
  await requireSuperAdmin()

  return (
    <div className="min-h-screen py-8 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Club</h1>
          <p className="mt-2 text-sm text-gray-600">
            Completa la información para registrar un nuevo club en el sistema
          </p>
        </div>

        <NewClubForm />
      </div>
    </div>
  )
}