'use client';

import React from 'react';
import { useGarage, DesignConcept } from '@/context/GarageContext';
import { Wrench, Compass, Sliders, Check } from 'lucide-react';

export function ConceptSwitcher() {
  const { designConcept, setDesignConcept } = useGarage();

  const CONCEPTS: {
    id: DesignConcept;
    title: string;
    subtitle: string;
    badge: string;
    icon: string;
    color: string;
  }[] = [
    {
      id: 'garage_pro',
      title: '1. Garage Pro',
      subtitle: 'Индустриальный инструмент (Snap-on / Milwaukee)',
      badge: 'Янтарный контраст',
      icon: '🛠️',
      color: 'from-amber-500 to-amber-600',
    },
    {
      id: 'swiss_minimal',
      title: '2. Swiss Minimalist',
      subtitle: 'Швейцарский минимализм (Linear / Apple)',
      badge: 'Чистая типографика',
      icon: '📐',
      color: 'from-slate-200 to-slate-400',
    },
    {
      id: 'cockpit',
      title: '3. Marine & Cockpit',
      subtitle: 'Телеметрия и круговые шкалы (Garmin / Motec)',
      badge: 'Круговые датчики',
      icon: '⏱️',
      color: 'from-cyan-400 to-blue-500',
    },
  ];

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div>
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Выберите визуальный концепт интерфейса</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Переключайте в реальном времени, чтобы оценить разную подачу данных, карточек и шкал
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {CONCEPTS.map((c) => {
          const isActive = designConcept === c.id;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setDesignConcept(c.id)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-800 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">{c.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{c.badge}</div>
                  </div>
                </div>
                {isActive && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-2 font-medium leading-tight">
                {c.subtitle}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
