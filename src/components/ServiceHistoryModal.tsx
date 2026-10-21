'use client';

import React from 'react';
import { Vehicle } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import { History, X, Check } from 'lucide-react';

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
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center gap-2">
              Журнал обслуживания
              {vehicle && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-normal">
                  {vehicle.name}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-zinc-500">
              Записей в истории: {filteredLogs.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Logs */}
        <div className="p-5 overflow-y-auto space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-zinc-600">
              <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium text-zinc-400">История обслуживания пуста</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                Нажмите «Внести ТО» на карточке техники, чтобы добавить запись.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 space-y-2.5"
              >
                {/* Log Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                      <span>{log.vehicleName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-normal">
                        {log.type === 'diy' ? 'Сам' : 'Сервис'}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5 font-mono">
                      <span>{new Date(log.date).toLocaleDateString('ru-RU')}</span>
                      <span>•</span>
                      <span className="text-zinc-300">
                        {log.hours !== undefined ? `${log.hours} м/ч` : `${log.km?.toLocaleString('ru-RU')} км`}
                      </span>
                    </div>
                  </div>

                  {log.cost !== undefined && log.cost > 0 && (
                    <div className="text-xs font-medium text-zinc-300 font-mono">
                      {log.cost.toLocaleString('ru-RU')} ₽
                    </div>
                  )}
                </div>

                {/* Serviced items */}
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {log.servicedTitles.map((title, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded-md border border-zinc-800 flex items-center gap-1"
                      >
                        <Check className="w-2.5 h-2.5 text-zinc-400" />
                        {title}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Parts used */}
                {log.partsUsed && (
                  <div className="text-[11px] text-zinc-400 bg-zinc-950 p-2 rounded-lg border border-zinc-900 font-mono">
                    <span className="text-zinc-500">Материалы: </span>
                    {log.partsUsed}
                  </div>
                )}

                {/* Notes */}
                {log.notes && (
                  <div className="text-[11px] text-zinc-500 italic">
                    «{log.notes}»
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-medium text-xs transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
