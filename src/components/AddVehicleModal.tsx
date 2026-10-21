'use client';

import React, { useState } from 'react';
import { VehicleCategory, MetricType, MaintenanceRule } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import { POPULAR_PRESETS, VehiclePreset } from '@/data/vehiclePresets';
import { X, Check, Sparkles } from 'lucide-react';

interface AddVehicleModalProps {
  onClose: () => void;
}

export function AddVehicleModal({ onClose }: AddVehicleModalProps) {
  const { addVehicle } = useGarage();

  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState<VehicleCategory>('enduro_pit');
  const [primaryMetric, setPrimaryMetric] = useState<MetricType>('hours');
  const [initialReading, setInitialReading] = useState('0');

  // Specs
  const [engineOil, setEngineOil] = useState('');
  const [engineOilCapacity, setEngineOilCapacity] = useState('');
  const [gearOil, setGearOil] = useState('');
  const [oilFilter, setOilFilter] = useState('');
  const [airFilter, setAirFilter] = useState('');
  const [sparkPlugs, setSparkPlugs] = useState('');
  const [drainPlugTorque, setDrainPlugTorque] = useState('');
  const [pressures, setPressures] = useState('');
  const [notes, setNotes] = useState('');

  // Handle preset selection
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (!presetId) return;

    const preset = POPULAR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setName(preset.name.split(' (')[0]);
    setCategory(preset.category);
    setPrimaryMetric(preset.primaryMetric);

    // Autofill specs
    setEngineOil(preset.specs.engineOil || '');
    setEngineOilCapacity(preset.specs.engineOilCapacity || '');
    setGearOil(preset.specs.gearOil || '');
    setOilFilter(preset.specs.oilFilter || '');
    setAirFilter(preset.specs.airFilter || '');
    setSparkPlugs(preset.specs.sparkPlugs || '');
    setDrainPlugTorque(preset.specs.drainPlugTorque || '');
    setPressures(preset.specs.pressures || '');
    setNotes(preset.specs.notes || '');
  };

  const handleCategoryChange = (cat: VehicleCategory) => {
    setCategory(cat);
    if (cat === 'road_moto' || cat === 'car') {
      setPrimaryMetric('km');
    } else {
      setPrimaryMetric('hours');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Введите название техники');
      return;
    }

    const readingNum = parseFloat(initialReading) || 0;
    const today = new Date().toISOString().split('T')[0];

    // Generate rules: use preset rules if selected, or standard defaults
    let finalRules: MaintenanceRule[] = [];
    const preset = POPULAR_PRESETS.find((p) => p.id === selectedPresetId);

    if (preset && preset.rules.length > 0) {
      finalRules = preset.rules.map((r, i) => ({
        id: `rule-${i}-${Date.now()}`,
        name: r.name,
        intervalHours: r.intervalHours,
        intervalKm: r.intervalKm,
        intervalMonths: r.intervalMonths,
        lastPerformedDate: today,
        lastPerformedHours: primaryMetric === 'hours' ? readingNum : undefined,
        lastPerformedKm: primaryMetric === 'km' ? readingNum : undefined,
      }));
    } else if (primaryMetric === 'hours') {
      finalRules = [
        {
          id: 'rule-oil-' + Date.now(),
          name: 'Замена моторного масла',
          intervalHours: category === 'enduro_pit' ? 15 : category === 'marine' ? 100 : 25,
          lastPerformedDate: today,
          lastPerformedHours: readingNum,
        },
        {
          id: 'rule-air-' + Date.now(),
          name: 'Обслуживание воздушного фильтра',
          intervalHours: category === 'enduro_pit' ? 5 : 25,
          lastPerformedDate: today,
          lastPerformedHours: readingNum,
        },
      ];
      if (category === 'marine') {
        finalRules.push({
          id: 'rule-gear-' + Date.now(),
          name: 'Замена масла в редукторе',
          intervalHours: 100,
          intervalMonths: 12,
          lastPerformedDate: today,
          lastPerformedHours: readingNum,
        });
      }
    } else {
      finalRules = [
        {
          id: 'rule-oil-' + Date.now(),
          name: 'Замена моторного масла и фильтра',
          intervalKm: category === 'road_moto' ? 10000 : 8000,
          lastPerformedDate: today,
          lastPerformedKm: readingNum,
        },
        {
          id: 'rule-air-' + Date.now(),
          name: 'Замена воздушного фильтра',
          intervalKm: 10000,
          lastPerformedDate: today,
          lastPerformedKm: readingNum,
        },
      ];
    }

    addVehicle({
      name: name.trim(),
      year: year ? parseInt(year) : undefined,
      category,
      primaryMetric,
      currentHours: primaryMetric === 'hours' ? readingNum : undefined,
      currentKm: primaryMetric === 'km' ? readingNum : undefined,
      lastUpdatedDate: today,
      specs: {
        engineOil: engineOil.trim() || undefined,
        engineOilCapacity: engineOilCapacity.trim() || undefined,
        gearOil: gearOil.trim() || undefined,
        oilFilter: oilFilter.trim() || undefined,
        airFilter: airFilter.trim() || undefined,
        sparkPlugs: sparkPlugs.trim() || undefined,
        drainPlugTorque: drainPlugTorque.trim() || undefined,
        pressures: pressures.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      rules: finalRules,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-zinc-100">Добавить технику в гараж</h3>
            <p className="text-[11px] text-zinc-500">Выберите готовый шаблон или заполните вручную</p>
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
          {/* Preset Selector */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-wider font-medium text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>Автозаполнение из каталога шаблонов</span>
              </label>
              {selectedPresetId && (
                <span className="text-[10px] text-emerald-400 font-medium">✓ Параметры загружены</span>
              )}
            </div>
            <select
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
            >
              <option value="">-- Выбрать готовую модель техники --</option>
              <optgroup label="🏍️ Дорожные мотоциклы">
                <option value="bmw-f800gs">BMW F800GS / F800R (Rotax 798cc)</option>
                <option value="bmw-r1200gs">BMW R1200GS / R1250GS (Boxer)</option>
              </optgroup>
              <optgroup label="🚤 Водная техника (Катера и ПЛМ)">
                <option value="parsun-40-fets">Parsun 40 FETS / F50 (4Т)</option>
                <option value="yamaha-25-2t">Yamaha 25 / 30 FHMS (2Т)</option>
                <option value="yamaha-9-9-15">Yamaha / Hidea 9.9 - 15 (2Т)</option>
              </optgroup>
              <optgroup label="🏁 Эндуро и питбайки">
                <option value="zongshen-172fmm">BRZ 250 / Avantis (172FMM 250cc)</option>
                <option value="pitbike-yx150">Apollo / Kayo (Питбайк YX140/150)</option>
                <option value="ktm-300-exc">KTM 250 / 300 EXC TPI (2Т)</option>
              </optgroup>
              <optgroup label="🚗 Автомобили">
                <option value="car-general-synth">Легковой автомобиль (Синтетика 5W-30)</option>
              </optgroup>
              <optgroup label="🚜 Садовая и силовая техника">
                <option value="garden-generator-gx">Генератор / Мотоблок (Honda GX200 / 170F)</option>
              </optgroup>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
              Категория техники
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'road_moto', label: 'Дорожный мото', icon: '🏍️' },
                { id: 'enduro_pit', label: 'Эндуро / Питбайк', icon: '🏁' },
                { id: 'marine', label: 'Водная техника', icon: '🚤' },
                { id: 'car', label: 'Автомобиль', icon: '🚗' },
                { id: 'power_equipment', label: 'Садовая техника', icon: '🚜' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCategoryChange(item.id as VehicleCategory)}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                    category === item.id
                      ? 'bg-zinc-100 border-zinc-100 text-zinc-950 font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name & Year */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                Модель / Название *
              </label>
              <input
                type="text"
                required
                placeholder="напр. Berkut S-DX, BMW F800GS..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                Год выпуска
              </label>
              <input
                type="number"
                placeholder="2023"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Metric selection & Initial reading */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                Основная единица учета
              </label>
              <div className="grid grid-cols-2 gap-1 p-0.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setPrimaryMetric('hours')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${
                    primaryMetric === 'hours'
                      ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Моточасы (м/ч)
                </button>
                <button
                  type="button"
                  onClick={() => setPrimaryMetric('km')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${
                    primaryMetric === 'km'
                      ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Пробег (км)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                Текущие показания ({primaryMetric === 'hours' ? 'м/ч' : 'км'})
              </label>
              <input
                type="number"
                step={primaryMetric === 'hours' ? '0.1' : '1'}
                value={initialReading}
                onChange={(e) => setInitialReading(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Quick Specs (Pre-filled from preset) */}
          <div className="border-t border-zinc-900 pt-3">
            <h4 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Шпаргалка ТО (спецификации)
            </h4>

            <div className="grid grid-cols-2 gap-3 mb-2.5">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Моторное масло</label>
                <input
                  type="text"
                  placeholder="напр. 10W-40 4T"
                  value={engineOil}
                  onChange={(e) => setEngineOil(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Объем масла</label>
                <input
                  type="text"
                  placeholder="напр. 2.0 л"
                  value={engineOilCapacity}
                  onChange={(e) => setEngineOilCapacity(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2.5">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Масляный фильтр</label>
                <input
                  type="text"
                  placeholder="HF160"
                  value={oilFilter}
                  onChange={(e) => setOilFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Свечи зажигания</label>
                <input
                  type="text"
                  placeholder="NGK DCPR8E"
                  value={sparkPlugs}
                  onChange={(e) => setSparkPlugs(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            {/* Marine / Gear oil */}
            {(category === 'marine' || gearOil) && (
              <div className="mb-2.5">
                <label className="block text-xs text-zinc-500 mb-1">Масло редуктора / дейдвуда</label>
                <input
                  type="text"
                  placeholder="SAE 90 Hypoid Marine Gear Lube, 430 мл"
                  value={gearOil}
                  onChange={(e) => setGearOil(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-2.5">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Момент затяжки пробки</label>
                <input
                  type="text"
                  placeholder="40 Нм"
                  value={drainPlugTorque}
                  onChange={(e) => setDrainPlugTorque(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Давление (шины/баллоны)</label>
                <input
                  type="text"
                  placeholder="2.2 / 2.5 бар"
                  value={pressures}
                  onChange={(e) => setPressures(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 text-zinc-950" />
              Добавить в гараж
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
