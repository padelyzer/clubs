import { Metadata } from 'next'
import PackagesManagement from './components/packages-management'

export const metadata: Metadata = {
  title: 'Gestión de Paquetes SaaS',
  description: 'Administrar paquetes y módulos del sistema SaaS',
}

export default function PackagesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Paquetes SaaS</h1>
        <p className="text-gray-600 mt-2">
          Administra los paquetes de módulos y asignaciones a clubes
        </p>
      </div>
      
      <PackagesManagement />
    </div>
  )
}