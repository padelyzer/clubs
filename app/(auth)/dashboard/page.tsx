import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export default async function DashboardRedirect() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Super Admin va directo al panel de administración
  if (session.role === 'SUPER_ADMIN') {
    redirect('/admin/dashboard')
  }

  // Obtener el club del usuario para redirigir con el slug correcto
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      Club: {
        select: {
          slug: true,
          active: true,
          status: true,
          initialSetupCompleted: true
        }
      }
    }
  })

  if (!user?.Club) {
    // Si el usuario no tiene club, mostrar página de error o selección
    redirect('/select-club')
  }

  // Verificar si el club ha completado la configuración inicial
  if (!user.Club.initialSetupCompleted) {
    redirect(`/c/${user.Club.slug}/setup`)
  }

  if (!user.Club.active || user.Club.status !== 'APPROVED') {
    // Si el club no está activo, mostrar mensaje de error
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ marginBottom: '16px' }}>Club no disponible</h2>
          <p style={{ color: '#666' }}>
            El club al que perteneces no está activo actualmente. 
            Por favor, contacta con el administrador.
          </p>
        </div>
      </div>
    )
  }

  // Redirigir al dashboard del club con la nueva estructura
  redirect(`/c/${user.Club.slug}/dashboard`)
}