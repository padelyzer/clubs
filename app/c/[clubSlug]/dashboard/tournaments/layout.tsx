/**
 * Tournaments Layout
 *
 * Este layout simplemente pasa los children sin agregar estructura adicional.
 * - La página de lista usa el CleanDashboardLayout principal
 * - Las páginas de detalle de torneos tienen su propia sidebar integrada
 */

export default function TournamentsV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}