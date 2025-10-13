// import SetupGuard from '@/components/SetupGuard'

// Force dynamic rendering for all auth pages
export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporarily disabled SetupGuard to fix session issues
  // TODO: Fix SetupGuard to handle auth errors properly
  return (
    <>
      {children}
    </>
  )
}