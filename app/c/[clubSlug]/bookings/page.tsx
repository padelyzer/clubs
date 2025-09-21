import { redirect } from 'next/navigation'

interface BookingsPageProps {
  params: Promise<{ clubSlug: string }>
}

export default async function BookingsPage({ params }: BookingsPageProps) {
  const { clubSlug } = await params
  
  // Redirigir a la página principal de reservas del dashboard
  redirect(`/c/${clubSlug}/dashboard/bookings`)
}