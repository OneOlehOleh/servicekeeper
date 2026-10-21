'use client';

import React from 'react';
import { Vehicle } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import { History, X, Calendar, Wrench, DollarSign, Check, FileText } from 'lucide-react';

interface ServiceHistoryModalProps {
  vehicle?: Vehicle | null;
  onClose: () => void;
}

export function ServiceHistoryModal({ vehicle, onClose }: ServiceHistoryModalProps) {
  const { serviceLogs } = useGarage();

  const filteredLogs = vehicle
    ? serviceLogs.filter((l) => l.vehicleId === vehicle.id)
    : serviceLogs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <History className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Журнал обслуживания
                {vehicle && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                    {vehicle.name}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Записей в истории: {filteredLogs.length}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Logs */}
        <div className="p-5 overflow-y-auto space-y-3.5">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">История обслуживания пуста</p>
              <p className="text-xs text-slate-600 mt-1">
                Нажмите «+ Внести ТО» на карточке техники, чтобы добавить первую запись.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5"
              >
                {/* Log Header: Date, Vehicle, Reading, Type */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{log.vehicleName}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-normal">
                        {log.type === 'diy' ? 'Гараж (сам)' : 'Мастерская'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(log.date).toLocaleDateString('ru-RU')}</span>
                      <span>•</span>
                      <span className="font-mono text-amber-400 font-semibold">
                        {log.hours !== undefined ? `${log.hours} м/ч` : `${log.km?.toLocaleString('ru-RU')} км`}
                      </span>
                    </div>
                  </div>

                  {log.cost !== undefined && log.cost > 0 && (
                    <div className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded-lg">
                      {log.cost.toLocaleString('ru-RU')} ₽
                    </div>
                  )}
                </div>

                {/* Serviced items */}
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Выполненные работы:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {log.servicedTitles.map((title, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-700/80 text-slate-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        {title}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Parts used */}
                {log.partsUsed && (
                  <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-semibold">Материалы/запчасти: </span>
                    {log.partsUsed}
                  </div>
                )}

                {/* Notes */}
                {log.notes && (
                  <div className="text-xs text-slate-400 italic">
                    «{log.notes}»
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
