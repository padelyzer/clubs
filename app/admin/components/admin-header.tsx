'use client'

import Image from 'next/image'
import { Bell, LogOut, Settings, User } from './icons'
import { logout } from '@/lib/auth/logout-helper' // NEW - API Route

interface AdminHeaderProps {
  session: {
    name?: string
    email?: string
  }
}

export default function AdminHeader({ session }: AdminHeaderProps) {
  return (
    <header className="nav border-b bg-white">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image 
              src="/Padelyzer-Logo-Negro.png" 
              alt="Padelyzer Admin" 
              width={140} 
              height={35}
              className="h-8 w-auto"
              priority
            />
            <span className="badge badge-primary">Super Admin</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="btn btn-ghost btn-sm p-2">
              <Bell className="w-5 h-5" />
            </button>
            
            {/* User Menu */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
                <User className="w-4 h-4" />
                <span className="hidden md:inline">{session.name}</span>
              </label>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <a href="/admin/settings">
                    <Settings className="w-4 h-4" />
                    Configuración
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => logout()}
                    className="w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}