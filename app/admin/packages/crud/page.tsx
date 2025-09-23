import { requireSuperAdmin } from '@/lib/auth/actions'
import PackagesCRUD from './components/packages-crud'

export const dynamic = 'force-dynamic'

export default async function PackagesCRUDPage() {
  const session = await requireSuperAdmin()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Paquetes SaaS</h1>
        <p className="text-gray-600 mt-2">Administra los paquetes de suscripción y sus módulos</p>
      </div>
      
      <PackagesCRUD />
    </div>
  )
}