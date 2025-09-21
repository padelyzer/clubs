import { requireSuperAdmin } from '@/lib/auth/actions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSuperAdmin()
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Simple Sidebar */}
      <aside style={{ 
        width: '250px', 
        background: '#1a1a1a', 
        color: 'white', 
        padding: '20px' 
      }}>
        <h2>Admin Panel</h2>
        <nav style={{ marginTop: '30px' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <a href="/admin/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
                Dashboard
              </a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="/admin/test" style={{ color: 'white', textDecoration: 'none' }}>
                Test Page
              </a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="/admin/clubs" style={{ color: 'white', textDecoration: 'none' }}>
                Clubs
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main style={{ flex: 1, padding: '20px', background: '#f5f5f5' }}>
        {children}
      </main>
    </div>
  )
}