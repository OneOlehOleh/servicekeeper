'use client';

import React from 'react';
import { VehicleCategory } from '@/types/garage';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  counts: Record<string, number>;
}

const CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'Вся техника', icon: '⚡' },
  { id: 'road_moto', label: 'Дорожные', icon: '🏍️' },
  { id: 'enduro_pit', label: 'Эндуро / Питбайки', icon: '🏁' },
  { id: 'marine', label: 'Водная техника', icon: '🚤' },
  { id: 'car', label: 'Автомобили', icon: '🚗' },
  { id: 'power_equipment', label: 'Садовая и силовая', icon: '🚜' },
];

export function CategoryFilter({ selectedCategory, onSelectCategory, counts }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar py-1">
      {CATEGORIES.map((cat) => {
        const count = counts[cat.id] ?? 0;
        const isActive = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all border ${
              isActive
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-semibold shadow-sm shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span
              className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
