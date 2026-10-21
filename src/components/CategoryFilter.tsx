'use client';

import React from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  counts: Record<string, number>;
}

const BASE_CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'Вся техника', icon: '⚡' },
  { id: 'road_moto', label: 'Дорожные', icon: '🏍️' },
  { id: 'enduro_pit', label: 'Эндуро / Питбайки', icon: '🏁' },
  { id: 'marine', label: 'Водная техника', icon: '🚤' },
  { id: 'car', label: 'Автомобили', icon: '🚗' },
  { id: 'power_equipment', label: 'Садовая и спецтехника', icon: '🚜' },
];

export function CategoryFilter({ selectedCategory, onSelectCategory, counts }: CategoryFilterProps) {
  const archivedCount = counts['archived'] ?? 0;

  const categories = [...BASE_CATEGORIES];
  if (archivedCount > 0 || selectedCategory === 'archived') {
    categories.push({ id: 'archived', label: 'Архив', icon: '📦' });
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
      {categories.map((cat) => {
        const count = counts[cat.id] ?? 0;
        const isActive = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              isActive
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold shadow-sm'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900'
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                isActive ? 'bg-zinc-300 text-zinc-950 font-semibold' : 'bg-zinc-800 text-zinc-500'
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
