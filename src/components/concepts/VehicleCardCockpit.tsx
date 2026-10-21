'use client';

import React, { useState } from 'react';
import { Vehicle } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import { getVehicleUrgency } from '@/lib/calculations';
import { Wrench, Plus, History, Check, Edit2, Gauge, Activity } from 'lucide-react';

interface Props {
  vehicle: Vehicle;
  onOpenSpecs: (v: Vehicle) => void;
  onLogService: (v: Vehicle) => void;
  onOpenHistory: (v: Vehicle) => void;
}

export function VehicleCardCockpit({
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

  // Compute circular gauge percentage based on closest rule
  let gaugePercent = 50;
  if (rulesStatus.length > 0) {
    const firstRule = rulesStatus[0];
    if (firstRule.status === 'overdue') {
      gaugePercent = 100;
    } else if (firstRule.rule.intervalHours && vehicle.currentHours !== undefined) {
      const elapsed = vehicle.currentHours - (firstRule.rule.lastPerformedHours ?? 0);
      gaugePercent = Math.min(100, Math.max(0, Math.round((elapsed / firstRule.rule.intervalHours) * 100)));
    } else if (firstRule.rule.intervalKm && vehicle.currentKm !== undefined) {
      const elapsed = vehicle.currentKm - (firstRule.rule.lastPerformedKm ?? 0);
      gaugePercent = Math.min(100, Math.max(0, Math.round((elapsed / firstRule.rule.intervalKm) * 100)));
    }
  }

  // SVG Gauge calculations (radius = 36, circumference = 2 * PI * 36 = ~226)
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (gaugePercent / 100) * (circumference * 0.75); // 270 degree arc

  const handleSaveReading = () => {
    const num = parseFloat(readingVal) || 0;
    if (vehicle.primaryMetric === 'hours') {
      updateVehicleReading(vehicle.id, num, undefined);
    } else {
      updateVehicleReading(vehicle.id, undefined, num);
    }
    setIsEditingReading(false);
  };

  const getGaugeColor = () => {
    if (overallStatus === 'overdue') return '#ef4444'; // red
    if (overallStatus === 'due_soon') return '#f59e0b'; // amber
    return '#06b6d4'; // electric cyan
  };

  return (
    <div className="rounded-2xl border border-cyan-900/40 bg-gradient-to-b from-[#080d1a] to-[#04060d] hover:border-cyan-500/40 transition-all flex flex-col p-5 space-y-4 shadow-xl relative overflow-hidden">
      {/* Background telemetry glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Top Cockpit Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 uppercase">
              {vehicle.category === 'marine'
                ? 'ПЛМ / БОРТ'
                : vehicle.category === 'enduro_pit'
                ? 'МОТО / ТРЕК'
                : 'ТРАНСПОРТ'}
            </span>
            <span className="text-[11px] font-mono text-slate-500">{vehicle.year || '2023'}</span>
          </div>
          <h3 className="text-base font-extrabold tracking-tight text-white mt-1.5 font-mono">
            {vehicle.name}
          </h3>
        </div>

        {/* Telemetry Status Pill */}
        <div
          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
            overallStatus === 'overdue'
              ? 'bg-rose-950/60 border-rose-500/60 text-rose-300'
              : overallStatus === 'due_soon'
              ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
              : 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
          }`}
        >
          <Activity className="w-3 h-3 animate-pulse" />
          <span>{overallStatus === 'overdue' ? 'ТРЕБУЕТ ТО' : overallStatus === 'due_soon' ? 'СКОРО ТО' : 'НОРМА'}</span>
        </div>
      </div>

      {/* Circular Radial Gauge + Digital Readout */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 relative z-10">
        {/* Digital numbers */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" />
            <span>ТЕКУЩАЯ НАРАБОТКА</span>
          </div>
          {!isEditingReading ? (
            <div className="flex items-baseline gap-1.5 mt-1 font-mono">
              <span className="text-3xl font-black text-white tracking-tight">
                {vehicle.primaryMetric === 'hours'
                  ? (vehicle.currentHours ?? 0).toFixed(1)
                  : (vehicle.currentKm ?? 0).toLocaleString('ru-RU')}
              </span>
              <span className="text-xs font-bold text-cyan-400 uppercase">
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
                className="w-20 px-2 py-0.5 rounded bg-slate-950 border border-cyan-500 text-white font-mono text-xs focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveReading}
                className="p-1 rounded bg-cyan-500 text-slate-950"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
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
              className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-[10px] font-mono text-cyan-300 hover:bg-cyan-900 transition-colors"
            >
              {vehicle.primaryMetric === 'hours' ? '+1 М/Ч' : '+500 КМ'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditingReading(true)}
              className="text-slate-400 hover:text-white text-[11px] p-0.5"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Circular Dial SVG Gauge */}
        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#1e293b"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * 0.25}
            />
            {/* Active progress arc */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={getGaugeColor()}
              strokeWidth="6"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
            <span className="text-xs font-black text-white">{gaugePercent}%</span>
            <span className="text-[8px] text-slate-400 uppercase">РЕСУРС</span>
          </div>
        </div>
      </div>

      {/* Telemetry rules list */}
      <div className="space-y-1.5 font-mono text-xs relative z-10 flex-1">
        {rulesStatus.slice(0, 3).map((item) => (
          <div
            key={item.rule.id}
            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2"
          >
            <span className="text-slate-300 truncate text-[11px]">{item.rule.name}</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                item.status === 'overdue'
                  ? 'bg-rose-500/20 text-rose-300'
                  : item.status === 'due_soon'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-cyan-400'
              }`}
            >
              {item.description}
            </span>
          </div>
        ))}
      </div>

      {/* Cockpit Actions Footer */}
      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 relative z-10">
        <button
          type="button"
          onClick={() => onOpenSpecs(vehicle)}
          className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono font-bold transition-all text-center"
        >
          Шпаргалка
        </button>
        <button
          type="button"
          onClick={() => onOpenHistory(vehicle)}
          className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold transition-all text-center"
        >
          История
        </button>
        <button
          type="button"
          onClick={() => onLogService(vehicle)}
          className="py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-mono font-black shadow-lg shadow-cyan-500/20 transition-all text-center"
        >
          Внести ТО
        </button>
      </div>
    </div>
  );
}
