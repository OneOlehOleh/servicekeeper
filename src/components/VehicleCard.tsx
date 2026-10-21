'use client';

import React from 'react';
import { Vehicle } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import { VehicleCardGaragePro } from '@/components/concepts/VehicleCardGaragePro';
import { VehicleCardSwissMinimal } from '@/components/concepts/VehicleCardSwissMinimal';
import { VehicleCardCockpit } from '@/components/concepts/VehicleCardCockpit';

interface VehicleCardProps {
  vehicle: Vehicle;
  onOpenSpecs: (v: Vehicle) => void;
  onLogService: (v: Vehicle) => void;
  onOpenHistory: (v: Vehicle) => void;
}

export function VehicleCard({
  vehicle,
  onOpenSpecs,
  onLogService,
  onOpenHistory,
}: VehicleCardProps) {
  const { designConcept } = useGarage();

  switch (designConcept) {
    case 'swiss_minimal':
      return (
        <VehicleCardSwissMinimal
          vehicle={vehicle}
          onOpenSpecs={onOpenSpecs}
          onLogService={onLogService}
          onOpenHistory={onOpenHistory}
        />
      );
    case 'cockpit':
      return (
        <VehicleCardCockpit
          vehicle={vehicle}
          onOpenSpecs={onOpenSpecs}
          onLogService={onLogService}
          onOpenHistory={onOpenHistory}
        />
      );
    case 'garage_pro':
    default:
      return (
        <VehicleCardGaragePro
          vehicle={vehicle}
          onOpenSpecs={onOpenSpecs}
          onLogService={onLogService}
          onOpenHistory={onOpenHistory}
        />
      );
  }
}
