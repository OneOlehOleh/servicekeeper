'use client';

import React, { useState } from 'react';
import { Vehicle } from '@/types/garage';
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
} from 'lucide-react';

interface Props {
  vehicle: Vehicle;
  onOpenSpecs: (v: Vehicle) => void;
  onLogService: (v: Vehicle) => void;
  onOpenHistory: (v: Vehicle) => void;
}

export function VehicleCardGaragePro({
  vehicle,
  onOpenSpecs,
  onLogService,
  onOpenHistory,
}: Props) {
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

  return (
    <div
      className={`rounded-2xl border-2 transition-all flex flex-col relative overflow-hidden ${
        overallStatus === 'overdue'
          ? 'bg-[#121316] border-rose-500 shadow-xl shadow-rose-950/30'
          : overallStatus === 'due_soon'
          ? 'bg-[#121316] border-amber-500 shadow-xl shadow-amber-950/30'
          : 'bg-[#121316] border-slate-700/80 hover:border-slate-600'
      }`}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
              {vehicle.category === 'road_moto'
                ? '🏍️'
                : vehicle.category === 'enduro_pit'
                ? '🏁'
                : vehicle.category === 'marine'
                ? '🚤'
                : vehicle.category === 'car'
                ? '🚗'
                : '🚜'}
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white uppercase font-mono">
                {vehicle.name}
              </h3>
              <div className="text-[11px] text-slate-400 font-medium">
                {vehicle.year ? `${vehicle.year} г.` : 'Техника'} • {vehicle.rules.length} регламентов
              </div>
            </div>
          </div>

          {overallStatus === 'overdue' ? (
            <div className="px-2.5 py-1 rounded-md bg-rose-500 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{overdueCount} ТО СРОЧНО</span>
            </div>
          ) : overallStatus === 'due_soon' ? (
            <div className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Clock className="w-3.5 h-3.5" />
              <span>СКОРО ТО</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
              ГОТОВ К БОЮ
            </div>
          )}
        </div>

        {/* Counter Display (LCD / Industrial Display) */}
        <div className="mt-4 p-3 rounded-xl bg-black/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
              {vehicle.primaryMetric === 'hours' ? 'НАРАБОТКА ДВС' : 'ОДОМЕТР ТС'}
            </div>
            {!isEditingReading ? (
              <div className="flex items-baseline gap-2 mt-0.5 font-mono">
                <span className="text-3xl font-black tracking-tighter text-amber-400">
                  {vehicle.primaryMetric === 'hours'
                    ? (vehicle.currentHours ?? 0).toFixed(1)
                    : (vehicle.currentKm ?? 0).toLocaleString('ru-RU')}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase">
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
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
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
              className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-mono shadow-md"
            >
              {vehicle.primaryMetric === 'hours' ? '+1 М/Ч' : '+500 КМ'}
            </button>
          </div>
        </div>

        {/* Maintenance Items List */}
        <div className="mt-3.5 space-y-1.5">
          {sortedRules.slice(0, 3).map((item) => (
            <div
              key={item.rule.id}
              className={`p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 border font-mono ${
                item.status === 'overdue'
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                  : item.status === 'due_soon'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="truncate font-semibold">{item.rule.name}</div>
              <div
                className={`text-[10px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                  item.status === 'overdue'
                    ? 'bg-rose-500 text-slate-950'
                    : item.status === 'due_soon'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400'
                }`}
              >
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tactile Action Footer */}
      <div className="mt-auto p-3 bg-black/40 border-t border-slate-800 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onOpenSpecs(vehicle)}
          className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 text-center flex items-center justify-center gap-1 font-mono uppercase"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          <span>Шпаргалка</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenHistory(vehicle)}
          className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 text-center flex items-center justify-center gap-1 font-mono uppercase"
        >
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>История</span>
        </button>
        <button
          type="button"
          onClick={() => onLogService(vehicle)}
          className="py-2.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center justify-center gap-1 font-mono uppercase"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ ТО</span>
        </button>
      </div>
    </div>
  );
}
