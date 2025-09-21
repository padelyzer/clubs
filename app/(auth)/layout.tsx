import SetupGuard from '@/components/SetupGuard'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Wrap children with SetupGuard to check for initial setup
  return (
    <SetupGuard>
      {children}
    </SetupGuard>
  )
}