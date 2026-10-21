'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import { calculateRuleStatus } from '@/lib/calculations';
import { CheckCircle2, Wrench, X, Sparkles, Plus, Calendar, DollarSign } from 'lucide-react';

interface LogServiceModalProps {
  initialVehicleId?: string;
  onClose: () => void;
}

export function LogServiceModal({ initialVehicleId, onClose }: LogServiceModalProps) {
  const { vehicles, logService } = useGarage();
  
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialVehicleId || (vehicles[0]?.id ?? '')
  );

  const vehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const [serviceDate, setServiceDate] = useState<string>(todayStr);

  const [currentHours, setCurrentHours] = useState<number>(vehicle?.currentHours ?? 0);
  const [currentKm, setCurrentKm] = useState<number>(vehicle?.currentKm ?? 0);

  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [customItem, setCustomItem] = useState<string>('');
  const [customItemsList, setCustomItemsList] = useState<string[]>([]);

  const [serviceType, setServiceType] = useState<'diy' | 'service'>('diy');
  const [partsUsed, setPartsUsed] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Sync state when vehicle changes
  useEffect(() => {
    if (vehicle) {
      setCurrentHours(vehicle.currentHours ?? 0);
      setCurrentKm(vehicle.currentKm ?? 0);
      // Auto-select rules that are overdue or due_soon
      const overdueOrDueSoon = vehicle.rules
        .filter((r) => {
          const res = calculateRuleStatus(r, vehicle);
          return res.status === 'overdue' || res.status === 'due_soon';
        })
        .map((r) => r.id);
      setSelectedRuleIds(overdueOrDueSoon);
    }
  }, [vehicle?.id]);

  if (!vehicle) return null;

  const toggleRule = (ruleId: string) => {
    setSelectedRuleIds((prev) =>
      prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
    );
  };

  const addCustomItem = () => {
    if (customItem.trim()) {
      setCustomItemsList((prev) => [...prev, customItem.trim()]);
      setCustomItem('');
    }
  };

  const autofillFromSpecs = () => {
    const parts: string[] = [];
    if (vehicle.specs.engineOil) {
      parts.push(`Масло: ${vehicle.specs.engineOil} (${vehicle.specs.engineOilCapacity || ''})`);
    }
    if (vehicle.specs.gearOil && vehicle.category === 'marine') {
      parts.push(`Редуктор: ${vehicle.specs.gearOil}`);
    }
    if (vehicle.specs.oilFilter) {
      parts.push(`Фильтр масл.: ${vehicle.specs.oilFilter}`);
    }
    if (vehicle.specs.airFilter) {
      parts.push(`Фильтр возд.: ${vehicle.specs.airFilter}`);
    }
    if (vehicle.specs.sparkPlugs) {
      parts.push(`Свечи: ${vehicle.specs.sparkPlugs}`);
    }
    setPartsUsed(parts.join('; '));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const servicedTitles: string[] = [];
    vehicle.rules.forEach((r) => {
      if (selectedRuleIds.includes(r.id)) {
        servicedTitles.push(r.name);
      }
    });
    servicedTitles.push(...customItemsList);

    if (servicedTitles.length === 0) {
      alert('Пожалуйста, выберите хотя бы одну выполненную работу.');
      return;
    }

    logService({
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      date: serviceDate,
      hours: vehicle.primaryMetric === 'hours' ? currentHours : undefined,
      km: vehicle.primaryMetric === 'km' ? currentKm : undefined,
      servicedRuleIds: selectedRuleIds,
      servicedTitles,
      type: serviceType,
      cost: cost ? parseFloat(cost) : undefined,
      partsUsed: partsUsed.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Внести проведенное ТО</h3>
              <p className="text-xs text-slate-400">Сброс счетчиков и сохранение записи в журнал</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Select Machine */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Техника из гаража
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium text-sm focus:outline-none focus:border-amber-500"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.primaryMetric === 'hours' ? `${v.currentHours ?? 0} м/ч` : `${(v.currentKm ?? 0).toLocaleString('ru-RU')} км`})
                </option>
              ))}
            </select>
          </div>

          {/* Current Reading & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {vehicle.primaryMetric === 'hours' ? 'Текущие моточасы (м/ч)' : 'Текущий пробег (км)'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step={vehicle.primaryMetric === 'hours' ? '0.1' : '1'}
                  value={vehicle.primaryMetric === 'hours' ? currentHours : currentKm}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (vehicle.primaryMetric === 'hours') setCurrentHours(val);
                    else setCurrentKm(val);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
                />
                {vehicle.primaryMetric === 'hours' ? (
                  <button
                    type="button"
                    onClick={() => setCurrentHours((prev) => Math.round((prev + 1) * 10) / 10)}
                    className="px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs text-amber-400 font-bold"
                    title="+1 час"
                  >
                    +1
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentKm((prev) => prev + 500)}
                    className="px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs text-amber-400 font-bold"
                    title="+500 км"
                  >
                    +500
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Дата обслуживания
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Checklist of Tasks Done */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Выполненные регламентные работы (сброс счетчика)
              </label>
              <span className="text-[11px] text-slate-400">
                Выбрано: {selectedRuleIds.length + customItemsList.length}
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {vehicle.rules.map((rule) => {
                const status = calculateRuleStatus(rule, vehicle);
                const isSelected = selectedRuleIds.includes(rule.id);

                return (
                  <label
                    key={rule.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRule(rule.id)}
                      className="mt-0.5 rounded border-slate-600 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold">{rule.name}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                        <span
                          className={`font-medium ${
                            status.status === 'overdue'
                              ? 'text-rose-400'
                              : status.status === 'due_soon'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {status.description}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}

              {/* Extra Custom Items */}
              {customItemsList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white"
                >
                  <span className="font-medium">✓ {item}</span>
                  <button
                    type="button"
                    onClick={() => setCustomItemsList((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add extra custom item */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Другая работа (напр. замена тросика газа, ремонт пера)..."
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomItem();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={addCustomItem}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Добавить
              </button>
            </div>
          </div>

          {/* Parts Used with 1-Tap Autofill */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Запчасти, масла и расходники
              </label>
              <button
                type="button"
                onClick={autofillFromSpecs}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Вставить из шпаргалки
              </button>
            </div>
            <textarea
              rows={2}
              value={partsUsed}
              onChange={(e) => setPartsUsed(e.target.value)}
              placeholder="напр. Motul 7100 15W-50 2.9л, фильтр HF160, шайба М24..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Type of service and Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Где делалось
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800 border border-slate-700 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setServiceType('diy')}
                  className={`py-1.5 rounded-lg font-semibold transition-all ${
                    serviceType === 'diy'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Гараж (сам)
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('service')}
                  className={`py-1.5 rounded-lg font-semibold transition-all ${
                    serviceType === 'service'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Сервис
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Затраты (₽ / руб.)
              </label>
              <input
                type="number"
                placeholder="напр. 3500"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Заметки по осмотру техники
            </label>
            <input
              type="text"
              placeholder="напр. Затянул динамометром, колодок осталось 50%, стружки на магните нет..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Big Greasy-Hands Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
              Записать ТО и сбросить счетчики
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
