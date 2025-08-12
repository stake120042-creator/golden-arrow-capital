'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
