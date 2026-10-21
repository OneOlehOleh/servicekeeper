'use client';

import React, { useState } from 'react';
import { Vehicle, QuickSpecs } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import { X, Edit3, Check } from 'lucide-react';

interface QuickSpecsModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export function QuickSpecsModal({ vehicle, onClose }: QuickSpecsModalProps) {
  const { updateQuickSpecs } = useGarage();
  const [isEditing, setIsEditing] = useState(false);
  const [formSpecs, setFormSpecs] = useState<QuickSpecs>(vehicle.specs || {});

  const handleSave = () => {
    updateQuickSpecs(vehicle.id, formSpecs);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center gap-2">
              Шпаргалка ТО
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-normal">
                {vehicle.name}
              </span>
            </h3>
            <p className="text-[11px] text-zinc-500">Спецификации масел, фильтров и моментов затяжки</p>
          </div>

          <div className="flex items-center gap-1.5">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
                title="Редактировать параметры"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-white transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Сохранить
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!isEditing ? (
            <div className="space-y-3">
              {/* Engine Oil */}
              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850">
                <div className="text-[10px] uppercase font-medium text-zinc-500 tracking-wider mb-1">
                  Моторное масло ДВС
                </div>
                <div className="text-sm font-semibold text-zinc-100">
                  {vehicle.specs.engineOil || 'Не указано'}
                </div>
                {vehicle.specs.engineOilCapacity && (
                  <div className="text-xs text-zinc-400 mt-1">
                    Объем картера: <span className="text-zinc-200">{vehicle.specs.engineOilCapacity}</span>
                  </div>
                )}
              </div>

              {/* Gear / Marine Oil */}
              {(vehicle.specs.gearOil || vehicle.category === 'marine') && (
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850">
                  <div className="text-[10px] uppercase font-medium text-zinc-500 tracking-wider mb-1">
                    Масло редуктора / дейдвуда
                  </div>
                  <div className="text-sm font-semibold text-zinc-100">
                    {vehicle.specs.gearOil || 'Не указано'}
                  </div>
                </div>
              )}

              {/* Fuel Mix */}
              {vehicle.specs.fuelMix && (
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850">
                  <div className="text-[10px] uppercase font-medium text-zinc-500 tracking-wider mb-1">
                    Топливная смесь (2Т)
                  </div>
                  <div className="text-sm font-semibold text-zinc-100">{vehicle.specs.fuelMix}</div>
                </div>
              )}

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850">
                  <div className="text-[10px] uppercase font-medium text-zinc-500 tracking-wider mb-1">
                    Масляный фильтр
                  </div>
                  <div className="text-sm font-semibold text-zinc-100 font-mono">
                    {vehicle.specs.oilFilter || 'Сетка / без фильтра'}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850">
                  <div className="text-[10px] uppercase font-medium text-zinc-500 tracking-wider mb-1">
                    Воздушный фильтр
                  </div>
                  <div className="text-sm font-semibold text-zinc-100 font-mono">
                    {vehicle.specs.airFilter || 'Не указано'}
                  </div>
                </div>
              </div>

              {/* Spark Plugs & Torque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850">
                  <div className="text-[10px] uppercase font-medium text-zinc-500 tracking-wider mb-1">
                    Свечи зажигания
                  </div>
                  <div className="text-sm font-semibold text-zinc-100 font-mono">
                    {vehicle.specs.sparkPlugs || 'Не указано'}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850">
                  <div className="text-[10px] uppercase font-medium text-zinc-500 tracking-wider mb-1">
                    Момент затяжки пробки
                  </div>
                  <div className="text-sm font-semibold text-zinc-100 font-mono">
                    {vehicle.specs.drainPlugTorque || 'По мануалу'}
                  </div>
                </div>
              </div>

              {/* Pressures */}
              {vehicle.specs.pressures && (
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850">
                  <div className="text-[10px] uppercase font-medium text-zinc-500 tracking-wider mb-1">
                    Давление (шины / баллоны)
                  </div>
                  <div className="text-sm font-semibold text-zinc-100">{vehicle.specs.pressures}</div>
                </div>
              )}

              {/* Notes */}
              {vehicle.specs.notes && (
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850">
                  <div className="text-[10px] uppercase font-medium text-zinc-500 tracking-wider mb-1">
                    Заметки и нюансы
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {vehicle.specs.notes}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Editing Form */
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Моторное масло (вязкость, стандарт)</label>
                <input
                  type="text"
                  value={formSpecs.engineOil || ''}
                  onChange={(e) => setFormSpecs({ ...formSpecs, engineOil: e.target.value })}
                  placeholder="напр. 15W-50 API SL"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Объем моторного масла</label>
                <input
                  type="text"
                  value={formSpecs.engineOilCapacity || ''}
                  onChange={(e) => setFormSpecs({ ...formSpecs, engineOilCapacity: e.target.value })}
                  placeholder="напр. 2.9 л с фильтром"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Масло редуктора / дейдвуда</label>
                <input
                  type="text"
                  value={formSpecs.gearOil || ''}
                  onChange={(e) => setFormSpecs({ ...formSpecs, gearOil: e.target.value })}
                  placeholder="напр. SAE 90 Marine GL-5, 430 мл"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Масляный фильтр</label>
                  <input
                    type="text"
                    value={formSpecs.oilFilter || ''}
                    onChange={(e) => setFormSpecs({ ...formSpecs, oilFilter: e.target.value })}
                    placeholder="HF160"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Воздушный фильтр</label>
                  <input
                    type="text"
                    value={formSpecs.airFilter || ''}
                    onChange={(e) => setFormSpecs({ ...formSpecs, airFilter: e.target.value })}
                    placeholder="Mann C 15 143"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Свечи зажигания</label>
                  <input
                    type="text"
                    value={formSpecs.sparkPlugs || ''}
                    onChange={(e) => setFormSpecs({ ...formSpecs, sparkPlugs: e.target.value })}
                    placeholder="NGK DCPR8E (0.8 мм)"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Момент затяжки пробки</label>
                  <input
                    type="text"
                    value={formSpecs.drainPlugTorque || ''}
                    onChange={(e) => setFormSpecs({ ...formSpecs, drainPlugTorque: e.target.value })}
                    placeholder="40 Нм"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Давление в шинах / баллонах</label>
                <input
                  type="text"
                  value={formSpecs.pressures || ''}
                  onChange={(e) => setFormSpecs({ ...formSpecs, pressures: e.target.value })}
                  placeholder="Перед 2.2 / Зад 2.5 бар"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Заметки гаража</label>
                <textarea
                  rows={3}
                  value={formSpecs.notes || ''}
                  onChange={(e) => setFormSpecs({ ...formSpecs, notes: e.target.value })}
                  placeholder="Особенности, размер шайб, смазка цепи..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700 resize-none"
                />
              </div>
            </div>
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
