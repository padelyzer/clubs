import { redirect } from 'next/navigation'
import { validateRequest } from '@/lib/auth/lucia'

export default async function DashboardPage() {
  // Simple session check without complex logic
  const { user } = await validateRequest()
  
  if (!user) {
    redirect('/login')
  }

  // Super Admin redirect
  if (user.role === 'SUPER_ADMIN') {
    redirect('/admin/dashboard')
  }

  // User with club redirect
  if (user.clubId) {
    // Get club info to build the redirect URL
    const { prisma } = await import('@/lib/config/prisma')
    const club = await prisma.club.findUnique({
      where: { id: user.clubId },
      select: { slug: true }
    })
    
    if (club?.slug) {
      redirect(`/c/${club.slug}/dashboard`)
    }
  }

  // Default redirect
  redirect('/select-club')
}