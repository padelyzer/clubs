'use client';

import React from 'react';
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout';

interface ModernLayoutProps {
  children: React.ReactNode;
  club: any;
  user: any;
  needsSetup?: boolean;
}

export function ModernLayout({ children, club, user, needsSetup }: ModernLayoutProps) {
  return (
    <CleanDashboardLayout
      clubName={club?.name || 'Club Pádel'}
      userName={user?.name || user?.email || 'Usuario'}
      userRole={user?.role === 'CLUB_OWNER' ? 'Propietario' : 'Administrador'}
    >
      {children}
    </CleanDashboardLayout>
  );
}