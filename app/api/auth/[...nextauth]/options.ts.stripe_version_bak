/**
 * NextAuth Options (Legacy)
 *
 * Este archivo se mantiene para compatibilidad con componentes legacy
 * que aún referencian NextAuth. El sistema ahora usa Lucia Auth.
 *
 * @deprecated Migrar a Lucia Auth (lib/auth/lucia.ts)
 */

/**
 * Configuración de NextAuth
 * @deprecated Este objeto es legacy. Usa lucia auth configuration en su lugar.
 */
export const authOptions = {
  // Stub configuration for backward compatibility
  providers: [] as any[],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session }: any) {
      // Legacy: actual session handling is done by Lucia
      return session
    },
    async jwt({ token }: any) {
      // Legacy: actual JWT handling is done by Lucia
      return token
    },
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions
