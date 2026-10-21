'use client';

import React, { useState } from 'react';
import { Vehicle, RuleStatusInfo } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import { getVehicleUrgency } from '@/lib/calculations';
import {
  Wrench,
  PlusCircle,
  History,
  AlertTriangle,
  Clock,
  CheckCircle,
  Edit2,
  Check,
  ChevronRight,
  Flame,
} from 'lucide-react';

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

  // Sort rules: overdue first, then due_soon, then ok
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

  const getCategoryIcon = () => {
    switch (vehicle.category) {
      case 'road_moto':
        return '🏍️';
      case 'enduro_pit':
        return '🏁';
      case 'marine':
        return '🚤';
      case 'car':
        return '🚗';
      case 'power_equipment':
        return '🚜';
      default:
        return '⚙️';
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
        overallStatus === 'overdue'
          ? 'bg-slate-900 border-rose-500/40 shadow-lg shadow-rose-950/20'
          : overallStatus === 'due_soon'
          ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-950/20'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Card Bar: Name, Category, Status Badge */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{getCategoryIcon()}</span>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{vehicle.name}</h3>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                {vehicle.year && <span>{vehicle.year} г.в.</span>}
                <span>•</span>
                <span className="text-slate-400">
                  Обновлено {vehicle.lastUpdatedDate ? new Date(vehicle.lastUpdatedDate).toLocaleDateString('ru-RU') : 'недавно'}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {overallStatus === 'overdue' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{overdueCount} ТО просрочено</span>
            </div>
          ) : overallStatus === 'due_soon' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Скоро ТО ({dueSoonCount})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>В порядке</span>
            </div>
          )}
        </div>

        {/* Counter Widget (Large readable digits) */}
        <div className="mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {vehicle.primaryMetric === 'hours' ? 'Наработка (моточасы)' : 'Текущий пробег'}
            </div>
            {!isEditingReading ? (
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black tracking-tight text-white font-mono">
                  {vehicle.primaryMetric === 'hours'
                    ? (vehicle.currentHours ?? 0).toFixed(1)
                    : (vehicle.currentKm ?? 0).toLocaleString('ru-RU')}
                </span>
                <span className="text-xs font-bold text-amber-400">
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
                  className="w-24 px-2 py-0.5 rounded bg-slate-900 border border-amber-500 text-white font-mono text-sm focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveReading}
                  className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {!isEditingReading && (
              <button
                type="button"
                onClick={() => {
                  setReadingVal(
                    vehicle.primaryMetric === 'hours'
                      ? (vehicle.currentHours ?? 0).toString()
                      : (vehicle.currentKm ?? 0).toString()
                  );
                  setIsEditingReading(true);
                }}
                className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1"
                title="Изменить показания"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Quick +1 hour or +500 km button for super-fast updates */}
            {vehicle.primaryMetric === 'hours' ? (
              <button
                type="button"
                onClick={() => {
                  const updated = Math.round(((vehicle.currentHours ?? 0) + 1) * 10) / 10;
                  updateVehicleReading(vehicle.id, updated, undefined);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-amber-400 font-bold text-xs transition-colors"
                title="Добавить +1 моточас"
              >
                +1 м/ч
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const updated = (vehicle.currentKm ?? 0) + 500;
                  updateVehicleReading(vehicle.id, undefined, updated);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-amber-400 font-bold text-xs transition-colors"
                title="Добавить +500 км"
              >
                +500 км
              </button>
            )}
          </div>
        </div>

        {/* Maintenance Items List (Key upcoming / overdue) */}
        <div className="mt-3.5 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Регламент ТО</span>
            <span className="text-slate-500 text-[10px]">Всего {vehicle.rules.length}</span>
          </div>

          {sortedRules.slice(0, 3).map((item) => (
            <div
              key={item.rule.id}
              className={`p-2 rounded-xl text-xs flex items-center justify-between gap-2 border ${
                item.status === 'overdue'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : item.status === 'due_soon'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-slate-800/40 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="truncate font-medium">{item.rule.name}</div>
              <div
                className={`text-[11px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded ${
                  item.status === 'overdue'
                    ? 'bg-rose-500/20 text-rose-300'
                    : item.status === 'due_soon'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-slate-400'
                }`}
              >
                {item.description}
              </div>
            </div>
          ))}

          {sortedRules.length > 3 && (
            <div className="text-[11px] text-slate-500 text-center pt-0.5">
              + еще {sortedRules.length - 3} пунктов регламента
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="mt-auto p-3 bg-slate-800/40 border-t border-slate-800/80 grid grid-cols-3 gap-2">
        {/* Specs Cheat Sheet */}
        <button
          type="button"
          onClick={() => onOpenSpecs(vehicle)}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          <span>Шпаргалка</span>
        </button>

        {/* History */}
        <button
          type="button"
          onClick={() => onOpenHistory(vehicle)}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60"
        >
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>История</span>
        </button>

        {/* + Log Service (Prominent CTA) */}
        <button
          type="button"
          onClick={() => onLogService(vehicle)}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Внести ТО</span>
        </button>
      </div>
    </div>
  );
}
