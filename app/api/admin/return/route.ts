import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Recuperar la sesión de admin guardada
    const adminSessionBackup = cookieStore.get('admin_session_backup')
    
    if (adminSessionBackup) {
      // Restaurar la sesión de admin
      cookieStore.set('session', adminSessionBackup.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 días
      })
      
      // Eliminar el backup
      cookieStore.delete('admin_session_backup')
      
      console.log('[SUPER ADMIN] Regresando al panel de administración')
      
      // Redirigir al panel de admin
      return NextResponse.redirect(new URL('/admin/clubs', request.url))
    } else {
      // Si no hay backup, redirigir al login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } catch (error) {
    console.error('Error al regresar al panel de admin:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}