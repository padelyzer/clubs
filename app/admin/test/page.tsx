import { requireSuperAdmin } from '@/lib/auth/actions'

export const dynamic = 'force-dynamic'

export default async function TestPage() {
  const session = await requireSuperAdmin()
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Dashboard</h1>
      <p>Si puedes ver esto, el sistema funciona correctamente.</p>
      <p>Usuario: {session?.user?.email}</p>
      <p>Rol: {session?.user?.role}</p>
      
      <div style={{ marginTop: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Estado del Sistema</h2>
        <ul>
          <li>✅ Autenticación funcionando</li>
          <li>✅ Sesión activa</li>
          <li>✅ Permisos de Super Admin confirmados</li>
        </ul>
      </div>
    </div>
  )
}