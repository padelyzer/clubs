import { redirect } from 'next/navigation'

interface CourtsPageProps {
  params: Promise<{ clubSlug: string }>
}

export default async function CourtsPage({ params }: CourtsPageProps) {
  const { clubSlug } = await params
  
  // Redirigir a la página principal de canchas del dashboard
  redirect(`/c/${clubSlug}/dashboard/courts`)
}