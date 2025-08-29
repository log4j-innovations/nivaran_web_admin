'use client';

import React from 'react';
import { useAuth } from '@/lib/authContext';
import { RoleGuard } from '@/components/RoleGuard';
import MapView from '@/components/maps/MapView';

export default function MapViewPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={['super_admin', 'city_engineer', 'field_supervisor']}>
      <div className="h-screen">
        <MapView />
      </div>
    </RoleGuard>
  );
}
