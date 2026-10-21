'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import { calculateRuleStatus } from '@/lib/calculations';
import { CheckCircle2, X, Plus } from 'lucide-react';

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
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-zinc-100">Внести обслуживание</h3>
            <p className="text-[11px] text-zinc-500">Сброс счетчиков и сохранение записи в журнал</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Select Machine */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
              Техника
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-medium focus:outline-none focus:border-zinc-700"
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
              <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                {vehicle.primaryMetric === 'hours' ? 'Моточасы (м/ч)' : 'Пробег (км)'}
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
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-zinc-700"
                />
                {vehicle.primaryMetric === 'hours' ? (
                  <button
                    type="button"
                    onClick={() => setCurrentHours((prev) => Math.round((prev + 1) * 10) / 10)}
                    className="px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-xs text-zinc-300 font-medium"
                    title="+1 час"
                  >
                    +1
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentKm((prev) => prev + 500)}
                    className="px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-xs text-zinc-300 font-medium"
                    title="+500 км"
                  >
                    +500
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                Дата ТО
              </label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Checklist of Tasks Done */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] uppercase tracking-wider font-medium text-zinc-400">
                Выполненные регламентные работы
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">
                {selectedRuleIds.length + customItemsList.length} выбрано
              </span>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {vehicle.rules.map((rule) => {
                const status = calculateRuleStatus(rule, vehicle);
                const isSelected = selectedRuleIds.includes(rule.id);

                return (
                  <label
                    key={rule.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRule(rule.id)}
                      className="mt-0.5 rounded border-zinc-700 text-zinc-100 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer accent-zinc-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">{rule.name}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        <span
                          className={
                            status.status === 'overdue'
                              ? 'text-rose-400'
                              : status.status === 'due_soon'
                              ? 'text-amber-400'
                              : 'text-zinc-500'
                          }
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
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                >
                  <span className="font-medium">✓ {item}</span>
                  <button
                    type="button"
                    onClick={() => setCustomItemsList((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-zinc-500 hover:text-rose-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add extra custom item */}
            <div className="mt-2 flex gap-1.5">
              <input
                type="text"
                placeholder="Другая работа (напр. замена тросика газа)..."
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomItem();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
              />
              <button
                type="button"
                onClick={addCustomItem}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Добавить
              </button>
            </div>
          </div>

          {/* Parts Used with 1-Tap Autofill */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] uppercase tracking-wider font-medium text-zinc-400">
                Запчасти и материалы
              </label>
              <button
                type="button"
                onClick={autofillFromSpecs}
                className="text-[11px] text-zinc-300 hover:text-white font-medium underline underline-offset-2"
              >
                Вставить из шпаргалки
              </button>
            </div>
            <textarea
              rows={2}
              value={partsUsed}
              onChange={(e) => setPartsUsed(e.target.value)}
              placeholder="напр. Motul 7100 15W-50 2.9л, фильтр HF160..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 resize-none font-mono"
            />
          </div>

          {/* Type of service and Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                Исполнитель
              </label>
              <div className="grid grid-cols-2 gap-1 p-0.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setServiceType('diy')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${
                    serviceType === 'diy'
                      ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Сам
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('service')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${
                    serviceType === 'service'
                      ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Сервис
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                Затраты (₽)
              </label>
              <input
                type="number"
                placeholder="напр. 3500"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
              Заметки
            </label>
            <input
              type="text"
              placeholder="напр. Колодок осталось 50%, стружки на магните нет..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Primary Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-zinc-950" />
              <span>Записать ТО и сбросить счетчики</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
