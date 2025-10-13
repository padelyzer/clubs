import { redirect } from 'next/navigation'

interface SettingsPageProps {
  params: Promise<{ clubSlug: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { clubSlug } = await params
  
  // Redirigir a la página principal de configuración del dashboard
  redirect(`/c/${clubSlug}/dashboard/settings`)
}