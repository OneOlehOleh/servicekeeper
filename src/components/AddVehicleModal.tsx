'use client';

import React, { useState } from 'react';
import { VehicleCategory, MetricType, MaintenanceRule } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import { PlusCircle, X, Check, HelpCircle } from 'lucide-react';

interface AddVehicleModalProps {
  onClose: () => void;
}

export function AddVehicleModal({ onClose }: AddVehicleModalProps) {
  const { addVehicle } = useGarage();

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

  // Handle category change to auto-set sensible metric defaults
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

    // Generate standard starter rules based on category
    let defaultRules: MaintenanceRule[] = [];
    if (primaryMetric === 'hours') {
      defaultRules = [
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
        defaultRules.push({
          id: 'rule-gear-' + Date.now(),
          name: 'Замена масла в редукторе',
          intervalHours: 100,
          intervalMonths: 12,
          lastPerformedDate: today,
          lastPerformedHours: readingNum,
        });
      }
    } else {
      defaultRules = [
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
      rules: defaultRules,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Добавить технику в гараж</h3>
              <p className="text-xs text-slate-400">Категория, учет и стартовые спецификации</p>
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
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Категория техники
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'road_moto', label: 'Дорожный мото', icon: '🏍️' },
                { id: 'enduro_pit', label: 'Эндуро / Питбайк', icon: '🏁' },
                { id: 'marine', label: 'Водная техника', icon: '🚤' },
                { id: 'car', label: 'Автомобиль', icon: '🚗' },
                { id: 'power_equipment', label: 'Садовая / силовая', icon: '🚜' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCategoryChange(item.id as VehicleCategory)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    category === item.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name & Year */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Название / Модель *
              </label>
              <input
                type="text"
                required
                placeholder="напр. KTM 300 EXC, Sea-Doo Spark..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Год выпуска</label>
              <input
                type="number"
                placeholder="2023"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Metric selection & Initial reading */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Основная единица учета
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800 border border-slate-700 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setPrimaryMetric('hours')}
                  className={`py-1.5 rounded-lg font-semibold transition-all ${
                    primaryMetric === 'hours'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Моточасы (м/ч)
                </button>
                <button
                  type="button"
                  onClick={() => setPrimaryMetric('km')}
                  className={`py-1.5 rounded-lg font-semibold transition-all ${
                    primaryMetric === 'km'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Пробег (км)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Текущие показания ({primaryMetric === 'hours' ? 'м/ч' : 'км'})
              </label>
              <input
                type="number"
                step={primaryMetric === 'hours' ? '0.1' : '1'}
                value={initialReading}
                onChange={(e) => setInitialReading(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Quick Specs */}
          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Шпаргалка ТО (необязательно, можно заполнить позже)
            </h4>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Моторное масло</label>
                <input
                  type="text"
                  placeholder="напр. 10W-40 4T"
                  value={engineOil}
                  onChange={(e) => setEngineOil(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Объем масла</label>
                <input
                  type="text"
                  placeholder="напр. 1.2 л"
                  value={engineOilCapacity}
                  onChange={(e) => setEngineOilCapacity(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Масляный фильтр</label>
                <input
                  type="text"
                  placeholder="напр. HF141"
                  value={oilFilter}
                  onChange={(e) => setOilFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Свечи зажигания</label>
                <input
                  type="text"
                  placeholder="напр. NGK CR8E"
                  value={sparkPlugs}
                  onChange={(e) => setSparkPlugs(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 text-slate-950" />
              Добавить в гараж
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
