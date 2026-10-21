'use client';

import React, { useState } from 'react';
import { Vehicle, QuickSpecs } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import { Wrench, X, Edit3, Check, Droplet, Sparkles, Gauge, Compass } from 'lucide-react';

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
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Шпаргалка ТО
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                  {vehicle.name}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Спецификации, масла, фильтры и моменты</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Редактировать параметры"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Сохранить
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!isEditing ? (
            <div className="grid grid-cols-1 gap-3">
              {/* Engine Oil */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                  <Droplet className="w-4 h-4" />
                  <span>МОТОРНОЕ МАСЛО ДВС</span>
                </div>
                <div className="text-sm font-bold text-slate-100">
                  {vehicle.specs.engineOil || 'Не указано'}
                </div>
                {vehicle.specs.engineOilCapacity && (
                  <div className="text-xs text-slate-400 mt-1">
                    Объем картера:{' '}
                    <span className="text-slate-200 font-medium">
                      {vehicle.specs.engineOilCapacity}
                    </span>
                  </div>
                )}
              </div>

              {/* Gear / Marine Oil (if any) */}
              {(vehicle.specs.gearOil || vehicle.category === 'marine') && (
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
                    <Droplet className="w-4 h-4" />
                    <span>МАСЛО РЕДУКТОРА / НОГИ (ТРАНСМИССИЯ)</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100">
                    {vehicle.specs.gearOil || 'Не указано'}
                  </div>
                </div>
              )}

              {/* Fuel Mix (for 2T) */}
              {vehicle.specs.fuelMix && (
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>ТОПЛИВНАЯ СМЕСЬ (2-ТАКТНЫЙ)</span>
                  </div>
                  <div className="text-sm font-bold text-cyan-200">{vehicle.specs.fuelMix}</div>
                </div>
              )}

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs font-semibold text-slate-400 mb-1">МАСЛЯНЫЙ ФИЛЬТР</div>
                  <div className="text-sm font-bold text-slate-100">
                    {vehicle.specs.oilFilter || 'Сетка / без фильтра'}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs font-semibold text-slate-400 mb-1">ВОЗДУШНЫЙ ФИЛЬТР</div>
                  <div className="text-sm font-bold text-slate-100">
                    {vehicle.specs.airFilter || 'Не указано'}
                  </div>
                </div>
              </div>

              {/* Spark Plugs & Torque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>СВЕЧИ ЗАЖИГАНИЯ</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100">
                    {vehicle.specs.sparkPlugs || 'Не указано'}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    <span>МОМЕНТ ЗАТЯЖКИ ПРОБКИ</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100">
                    {vehicle.specs.drainPlugTorque || 'По мануалу'}
                  </div>
                </div>
              </div>

              {/* Pressures */}
              {vehicle.specs.pressures && (
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                    <span>ДАВЛЕНИЕ (ШИНЫ / БАЛЛОНЫ)</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100">{vehicle.specs.pressures}</div>
                </div>
              )}

              {/* Notes */}
              {vehicle.specs.notes && (
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 mb-1">ЗАМЕТКИ И НЮАНСЫ</div>
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {vehicle.specs.notes}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Editing Form */
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Моторное масло (вязкость, стандарт)</label>
                <input
                  type="text"
                  value={formSpecs.engineOil || ''}
                  onChange={(e) => setFormSpecs({ ...formSpecs, engineOil: e.target.value })}
                  placeholder="напр. 15W-50 API SL"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Объем моторного масла</label>
                <input
                  type="text"
                  value={formSpecs.engineOilCapacity || ''}
                  onChange={(e) => setFormSpecs({ ...formSpecs, engineOilCapacity: e.target.value })}
                  placeholder="напр. 2.9 л с фильтром"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Масло редуктора / ноги (для ПЛМ или кардана)</label>
                <input
                  type="text"
                  value={formSpecs.gearOil || ''}
                  onChange={(e) => setFormSpecs({ ...formSpecs, gearOil: e.target.value })}
                  placeholder="напр. SAE 90 Marine GL-5, 430 мл"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Масляный фильтр</label>
                  <input
                    type="text"
                    value={formSpecs.oilFilter || ''}
                    onChange={(e) => setFormSpecs({ ...formSpecs, oilFilter: e.target.value })}
                    placeholder="HF160"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Воздушный фильтр</label>
                  <input
                    type="text"
                    value={formSpecs.airFilter || ''}
                    onChange={(e) => setFormSpecs({ ...formSpecs, airFilter: e.target.value })}
                    placeholder="Mann C 15 143"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Свечи зажигания (марка, зазор)</label>
                  <input
                    type="text"
                    value={formSpecs.sparkPlugs || ''}
                    onChange={(e) => setFormSpecs({ ...formSpecs, sparkPlugs: e.target.value })}
                    placeholder="NGK DCPR8E (0.8 мм)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Момент затяжки сливного болта</label>
                  <input
                    type="text"
                    value={formSpecs.drainPlugTorque || ''}
                    onChange={(e) => setFormSpecs({ ...formSpecs, drainPlugTorque: e.target.value })}
                    placeholder="40 Нм"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Давление в шинах / баллонах</label>
                <input
                  type="text"
                  value={formSpecs.pressures || ''}
                  onChange={(e) => setFormSpecs({ ...formSpecs, pressures: e.target.value })}
                  placeholder="Перед 2.2 / Зад 2.5 бар"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Заметки гаража</label>
                <textarea
                  rows={3}
                  value={formSpecs.notes || ''}
                  onChange={(e) => setFormSpecs({ ...formSpecs, notes: e.target.value })}
                  placeholder="Особенности, размер шайб, смазка цепи..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
          >
            Закрыть шпаргалку
          </button>
        </div>
      </div>
    </div>
  );
}
