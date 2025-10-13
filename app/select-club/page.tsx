import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import Link from 'next/link'
import { Building2, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SelectClubPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  let clubs: Array<{
    id: string
    name: string
    slug: string
    description: string | null
    _count: {
      Court: number
      User: number
    }
  }> = []

  // Super Admin ve todos los clubs
  if (session.role === 'SUPER_ADMIN') {
    clubs = await prisma.club.findMany({
      where: {
        status: 'APPROVED',
        active: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            Court: true,
            User: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
  } else {
    // Usuario normal - solo su club
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            _count: {
              select: {
                Court: true,
                User: true
              }
            }
          }
        }
      }
    })

    if (user?.club) {
      // Si solo tiene un club, redirigir directamente
      redirect(`/c/${user.club.slug}/dashboard`)
    }
  }

  if (clubs.length === 0) {
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
          <h2 style={{ marginBottom: '16px' }}>No tienes acceso a ningún club</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Contacta con el administrador para obtener acceso
          </p>
          <Link href="/login" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none'
          }}>
            Volver al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px'
          }}>
            Selecciona un Club
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            {session.role === 'SUPER_ADMIN' 
              ? `Tienes acceso a ${clubs.length} clubs`
              : 'Elige el club al que deseas acceder'
            }
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {clubs.map(club => (
            <Link
              key={club.id}
              href={`/c/${club.slug}/dashboard`}
              style={{
                display: 'block',
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Building2 size={24} color="white" />
                </div>
                <ArrowRight size={20} style={{ color: '#667eea' }} />
              </div>

              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#333'
              }}>
                {club.name}
              </h3>

              {club.description && (
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '16px',
                  lineHeight: '1.5'
                }}>
                  {club.description}
                </p>
              )}

              <div style={{
                display: 'flex',
                gap: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e5e5'
              }}>
                <div>
                  <span style={{
                    fontSize: '12px',
                    color: '#999',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    Canchas
                  </span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    {club._count.Court}
                  </span>
                </div>
                <div>
                  <span style={{
                    fontSize: '12px',
                    color: '#999',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    Usuarios
                  </span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    {club._count.User}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {session.role === 'SUPER_ADMIN' && (
          <div style={{
            marginTop: '48px',
            textAlign: 'center'
          }}>
            <Link
              href="/admin/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                border: '2px solid rgba(255,255,255,0.3)',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
              }}
            >
              ← Volver al Panel de Administración
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}