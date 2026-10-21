'use client';

import React, { useState } from 'react';
import { Vehicle } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import { getVehicleUrgency } from '@/lib/calculations';
import { Wrench, History, Check, Edit2, Plus } from 'lucide-react';

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
  const { updateVehicleReading } = useGarage();
  const [isEditingReading, setIsEditingReading] = useState(false);
  const [readingVal, setReadingVal] = useState<string>(
    vehicle.primaryMetric === 'hours'
      ? (vehicle.currentHours ?? 0).toString()
      : (vehicle.currentKm ?? 0).toString()
  );

  const { overallStatus, overdueCount, dueSoonCount, rulesStatus } = getVehicleUrgency(vehicle);

  const sortedRules = [...rulesStatus].sort((a, b) => {
    const score = (s: string) => (s === 'overdue' ? 2 : s === 'due_soon' ? 1 : 0);
    return score(b.status) - score(a.status);
  });

  const handleSaveReading = () => {
    const num = parseFloat(readingVal) || 0;
    if (vehicle.primaryMetric === 'hours') {
      updateVehicleReading(vehicle.id, num, undefined);
    } else {
      updateVehicleReading(vehicle.id, undefined, num);
    }
    setIsEditingReading(false);
  };

  const getCategoryLabel = () => {
    switch (vehicle.category) {
      case 'marine':
        return 'Катер / ПЛМ';
      case 'enduro_pit':
        return 'Эндуро / Питбайк';
      case 'road_moto':
        return 'Мотоцикл';
      case 'car':
        return 'Автомобиль';
      case 'power_equipment':
        return 'Садовая техника';
      default:
        return 'Техника';
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700/80 transition-all duration-150 flex flex-col p-5 space-y-4 shadow-sm hover:shadow-md">
      {/* Header: Name, Category & Quiet Status Dot */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-zinc-100">{vehicle.name}</h3>
            {vehicle.year && (
              <span className="text-[11px] text-zinc-500 font-normal">{vehicle.year}</span>
            )}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {getCategoryLabel()}
          </div>
        </div>

        {/* Quiet status dot indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              overallStatus === 'overdue'
                ? 'bg-rose-500 ring-4 ring-rose-500/20'
                : overallStatus === 'due_soon'
                ? 'bg-amber-400 ring-4 ring-amber-400/20'
                : 'bg-emerald-500 ring-4 ring-emerald-500/20'
            }`}
          />
          <span className="text-zinc-400 text-[11px] font-medium">
            {overallStatus === 'overdue'
              ? `${overdueCount} требуется`
              : overallStatus === 'due_soon'
              ? 'скоро ТО'
              : 'в норме'}
          </span>
        </div>
      </div>

      {/* Reading Counter (Clean, modern typography) */}
      <div className="flex items-baseline justify-between pt-1 pb-2 border-y border-zinc-900">
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
            {vehicle.primaryMetric === 'hours' ? 'Моточасы' : 'Пробег'}
          </div>
          {!isEditingReading ? (
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-semibold tracking-tight text-zinc-100 font-mono">
                {vehicle.primaryMetric === 'hours'
                  ? (vehicle.currentHours ?? 0).toFixed(1)
                  : (vehicle.currentKm ?? 0).toLocaleString('ru-RU')}
              </span>
              <span className="text-xs text-zinc-500 font-normal">
                {vehicle.primaryMetric === 'hours' ? 'м/ч' : 'км'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="number"
                step={vehicle.primaryMetric === 'hours' ? '0.1' : '1'}
                value={readingVal}
                onChange={(e) => setReadingVal(e.target.value)}
                className="w-20 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveReading}
                className="p-1 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!isEditingReading && (
            <button
              type="button"
              onClick={() => setIsEditingReading(true)}
              className="text-zinc-500 hover:text-zinc-300 p-1"
              title="Изменить"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (vehicle.primaryMetric === 'hours') {
                const updated = Math.round(((vehicle.currentHours ?? 0) + 1) * 10) / 10;
                updateVehicleReading(vehicle.id, updated, undefined);
              } else {
                updateVehicleReading(vehicle.id, undefined, (vehicle.currentKm ?? 0) + 500);
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-[11px] font-medium text-zinc-300 transition-colors"
          >
            {vehicle.primaryMetric === 'hours' ? '+1 час' : '+500 км'}
          </button>
        </div>
      </div>

      {/* Clean Linear-style Rules list */}
      <div className="space-y-1.5 flex-1">
        {sortedRules.slice(0, 3).map((item) => (
          <div key={item.rule.id} className="text-xs flex items-center justify-between gap-2 py-0.5">
            <span className="text-zinc-400 truncate">{item.rule.name}</span>
            <span
              className={`text-[11px] font-medium whitespace-nowrap ${
                item.status === 'overdue'
                  ? 'text-rose-400 font-semibold'
                  : item.status === 'due_soon'
                  ? 'text-amber-400'
                  : 'text-zinc-600'
              }`}
            >
              {item.description}
            </span>
          </div>
        ))}
        {sortedRules.length > 3 && (
          <div className="text-[10px] text-zinc-600 text-right pt-0.5">
            + еще {sortedRules.length - 3} регламентов
          </div>
        )}
      </div>

      {/* Subtle Actions Footer */}
      <div className="pt-2 border-t border-zinc-900 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onOpenSpecs(vehicle)}
          className="py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 text-xs font-medium transition-colors text-center"
        >
          Шпаргалка
        </button>
        <button
          type="button"
          onClick={() => onOpenHistory(vehicle)}
          className="py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 text-xs font-medium transition-colors text-center"
        >
          История
        </button>
        <button
          type="button"
          onClick={() => onLogService(vehicle)}
          className="py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors text-center shadow-sm"
        >
          Внести ТО
        </button>
      </div>
    </div>
  );
}
