import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import UsersManagement from './components/users-management'

export default async function AdminUsersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  await requireSuperAdmin()

  const role = (searchParams.role as string) || 'all'
  const status = (searchParams.status as string) || 'all'
  const search = (searchParams.search as string) || ''
  const club = (searchParams.club as string) || 'all'
  const page = parseInt((searchParams.page as string) || '1')
  const limit = 20

  // Construir filtros
  const where: any = {}
  
  if (role !== 'all') {
    where.role = role.toUpperCase()
  }
  
  if (status === 'active') {
    where.active = true
  } else if (status === 'inactive') {
    where.active = false
  }
  
  if (club !== 'all') {
    where.clubId = club
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  }

  // Obtener usuarios con paginación
  const [users, totalUsers, clubs, stats] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        Club: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        _count: {
          select: {
            Account: true,
            Session: true
          }
        }
      }
    }),
    prisma.user.count({ where }),
    prisma.club.findMany({
      select: {
        id: true,
        name: true,
        status: true
      },
      orderBy: { name: 'asc' }
    }),
    Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.user.count({ where: { active: false } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'CLUB_OWNER' } }),
      prisma.user.count({ where: { role: 'SUPER_ADMIN' } })
    ])
  ])

  const [total, active, inactive, userCount, club_owners, super_admins] = stats

  const userStats = {
    total,
    active,
    inactive,
    roles: {
      user: userCount,
      club_owner: club_owners,
      super_admin: super_admins
    }
  }

  const totalPages = Math.ceil(totalUsers / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
      </div>

      <UsersManagement 
        users={users.map(user => ({
          ...user,
          name: user.name || 'Sin nombre',
          club: user.Club ? {
            id: user.Club.id,
            name: user.Club.name,
            status: user.Club.status
          } : undefined,
          sessionsCount: user._count.Session
        }))}
        clubs={clubs}
        stats={userStats}
        currentPage={page}
        totalPages={totalPages}
        currentRole={role}
        currentStatus={status}
        currentClub={club}
        currentSearch={search}
      />
    </div>
  )
}