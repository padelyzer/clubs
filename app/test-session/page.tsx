import { validateRequest } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function TestSessionPage() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  const { user, session } = await validateRequest()
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test de Sesión (Server Side)</h1>
      
      <div className="space-y-6">
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Cookies en el servidor</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(allCookies.map(c => ({
              name: c.name,
              value: c.value.substring(0, 20) + '...',
              httpOnly: c.httpOnly,
              secure: c.secure,
              sameSite: c.sameSite,
              path: c.path
            })), null, 2)}
          </pre>
        </section>
        
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Estado de autenticación</h2>
          <p>Autenticado: {session ? '✅ SI' : '❌ NO'}</p>
          {user && (
            <div className="mt-2">
              <p>Usuario: {user.email}</p>
              <p>Rol: {user.role}</p>
              <p>ID: {user.id}</p>
            </div>
          )}
          {session && (
            <div className="mt-2">
              <p>Session ID: {session.id}</p>
              <p>User ID: {session.userId}</p>
              <p>Expires: {new Date(session.expiresAt).toLocaleString()}</p>
            </div>
          )}
        </section>
        
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Enlaces de prueba</h2>
          <div className="space-y-2">
            <a href="/login" className="text-blue-500 hover:underline block">→ Ir a Login</a>
            <a href="/dashboard" className="text-blue-500 hover:underline block">→ Ir a Dashboard</a>
            <a href="/debug-cookies" className="text-blue-500 hover:underline block">→ Debug de Cookies (Client Side)</a>
            <a href="/api/auth/session" className="text-blue-500 hover:underline block">→ API Session</a>
          </div>
        </section>
      </div>
    </div>
  )
}