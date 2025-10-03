import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Torneos V2 | Padelyzer',
  description: 'Gestión avanzada de torneos con nueva interfaz',
}

export default function TournamentsV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {children}
    </div>
  )
}