import AdminClubsClientPage from './page-client'

export default function AdminClubsPage() {
  return <AdminClubsClientPage />

  const status = (searchParams.status as string) || 'all'
  const search = (searchParams.search as string) || ''
  const page = parseInt((searchParams.page as string) || '1')
  const limit = 20

  // Construir filtros
  const where: any = {}
  
  if (status !== 'all') {
    where.status = status.toUpperCase()
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } }
    ]
  }

  // Obtener clubes con paginación
  const [clubs, totalClubs, statusCounts] = await Promise.all([
    prisma.club.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            User: true,
            Court: true,
            Booking: true
          }
        }
      }
    }),
    prisma.club.count({ where }),
    Promise.all([
      prisma.club.count(),
      prisma.club.count({ where: { status: 'PENDING' } }),
      prisma.club.count({ where: { status: 'APPROVED' } }),
      prisma.club.count({ where: { status: 'REJECTED' } }),
      prisma.club.count({ where: { status: 'SUSPENDED' } })
    ])
  ])

  const [total, pending, approved, rejected, suspended] = statusCounts

  const stats = {
    total,
    pending,
    approved,
    rejected,
    suspended
  }

  const totalPages = Math.ceil(totalClubs / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Clubes</h1>
      </div>

      <ClubsManagement 
        clubs={clubs}
        stats={stats}
        currentPage={page}
        totalPages={totalPages}
        currentStatus={status}
        currentSearch={search}
      />
    </div>
  )
}