import { requireSuperAdmin } from '@/lib/auth/actions'
import AdminSidebar from './components/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSuperAdmin()
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <AdminSidebar />
      <main style={{ flex: 1, marginLeft: '280px' }}>
        {children}
      </main>
    </div>
  )
}