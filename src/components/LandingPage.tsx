'use client';

import React, { useState } from 'react';
import { useGarage, DesignConcept } from '@/context/GarageContext';
import { AuthModal } from '@/components/AuthModal';
import {
  Wrench,
  Clock,
  Gauge,
  Droplet,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Smartphone,
  Sliders,
  Check,
  Activity,
} from 'lucide-react';

export function LandingPage() {
  const { loginAsGuest, designConcept, setDesignConcept } = useGarage();
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);

  const CONCEPTS_INFO: {
    id: DesignConcept;
    title: string;
    tagline: string;
    description: string;
    icon: string;
    badge: string;
    sampleColors: string[];
  }[] = [
    {
      id: 'garage_pro',
      title: '1. Garage Pro (Индустриальный)',
      tagline: 'Snap-on / Milwaukee / Workshop Tool',
      description: 'Матовый темно-угольный фон, яркий янтарный контраст, моноширинный LCD-шрифт, тактильные рельефные кнопки.',
      icon: '🛠️',
      badge: 'Янтарный контраст',
      sampleColors: ['bg-amber-500', 'bg-slate-800', 'bg-rose-500'],
    },
    {
      id: 'swiss_minimal',
      title: '2. Swiss Minimalist (Швейцарский)',
      tagline: 'Linear / Apple Health / Clean Luxury',
      description: 'Сдержанный монохром, тонкие линии, тихие аккуратные индикаторы без визуального мусора и спокойная эстетика.',
      icon: '📐',
      badge: 'Чистый минимализм',
      sampleColors: ['bg-zinc-200', 'bg-zinc-800', 'bg-emerald-500'],
    },
    {
      id: 'cockpit',
      title: '3. Marine & Cockpit (Телеметрия)',
      tagline: 'Garmin Marine / Motec / Катерный кокпит',
      description: 'Круговые SVG-шкалы выработки моточасов, неоновый бирюзовый цвет, приборная панель катера или гоночного трека.',
      icon: '⏱️',
      badge: 'Круговые шкалы',
      sampleColors: ['bg-cyan-400', 'bg-blue-600', 'bg-rose-500'],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Wrench className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              МотоЖурнал
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PWA
              </span>
            </span>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setAuthModalMode('login')}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Войти
            </button>
            <button
              type="button"
              onClick={() => setAuthModalMode('register')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              Создать аккаунт
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[18rem] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Для владельцев мотоциклов, катеров, эндуро и техники</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] max-w-4xl mx-auto">
          Забудьте о масляных блокнотах и забытых регламентах
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Единый цифровой журнал гаража.{' '}
          <span className="text-slate-200 font-medium">Моточасы</span> для лодочных моторов и эндуро.{' '}
          <span className="text-slate-200 font-medium">Пробег</span> для дорожных мотоциклов и авто.{' '}
          Шпаргалка масел и фильтров без лишней писанины.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={loginAsGuest}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Открыть демо-гараж</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAuthModalMode('register')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
          >
            Регистрация за 10 сек
          </button>
        </div>

        {/* Sub-note */}
        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            100% Офлайн PWA
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Без лишних полей и паролей
          </span>
        </div>
      </section>

      {/* 3 Visual Concepts Selector Section (Choose By Picture) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-14 w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>3 визуальных концепта на выбор</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Кликните на стиль, чтобы примерить его на карточках ниже
          </h2>
        </div>

        {/* 3 Interactive Concept Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CONCEPTS_INFO.map((c) => {
            const isSelected = designConcept === c.id;

            return (
              <div
                key={c.id}
                onClick={() => setDesignConcept(c.id)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{c.icon}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isSelected ? '✓ ВЫБРАН' : c.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug">{c.title}</h3>
                  <div className="text-xs text-amber-400 font-medium mt-0.5">{c.tagline}</div>
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{c.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {c.sampleColors.map((col, idx) => (
                      <span key={idx} className={`w-3.5 h-3.5 rounded-full ${col} border border-slate-700`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-300">
                    {isSelected ? 'Активный стиль' : 'Применить →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Preview of the Fleet using Selected Concept */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 w-full">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Предпросмотр карточек в выбранном стиле:</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold">
                  {designConcept === 'garage_pro'
                    ? '1. Garage Pro'
                    : designConcept === 'swiss_minimal'
                    ? '2. Swiss Minimalist'
                    : '3. Marine & Cockpit'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Карточки реагируют на выбранный вами концепт выше
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 self-start sm:self-auto">
              🔴 2 единицы требуют ТО
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Parsun 40 Marine */}
            {designConcept === 'garage_pro' && (
              <div className="p-4 rounded-2xl bg-[#121316] border-2 border-rose-500 relative font-mono shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xl">🚤</span>
                    <h4 className="text-sm font-black text-white mt-1 uppercase">Berkut (Parsun 40)</h4>
                    <div className="text-[10px] text-slate-400">ПЛМ 4-ТАКТНЫЙ</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500 text-slate-950 font-black text-[10px]">
                    СРОЧНО ТО
                  </span>
                </div>
                <div className="mt-3 p-2 rounded bg-black/60 border border-slate-800 flex justify-between items-baseline">
                  <span className="text-[10px] text-slate-500">НАРАБОТКА</span>
                  <span className="text-xl font-black text-amber-400">94.0 М/Ч</span>
                </div>
                <div className="mt-3 text-xs space-y-1">
                  <div className="flex justify-between text-rose-300 font-bold">
                    <span>Шприцевание</span>
                    <span>-44 м/ч</span>
                  </div>
                  <div className="flex justify-between text-amber-300">
                    <span>Масло картер+редуктор</span>
                    <span>осталось 6 м/ч</span>
                  </div>
                </div>
              </div>
            )}

            {designConcept === 'swiss_minimal' && (
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100">Berkut (Parsun 40)</h4>
                    <div className="text-xs text-zinc-500">Лодочный мотор 4Т</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
                    <span className="text-zinc-400 text-[11px]">требуется ТО</span>
                  </div>
                </div>
                <div className="py-2 border-y border-zinc-900 flex justify-between items-baseline">
                  <span className="text-[10px] text-zinc-500 uppercase">Моточасы</span>
                  <span className="text-xl font-semibold text-zinc-100">94.0 <span className="text-xs text-zinc-500">м/ч</span></span>
                </div>
                <div className="text-xs space-y-1 text-zinc-400">
                  <div className="flex justify-between text-rose-400">
                    <span>Шприцевание тавотниц</span>
                    <span>-44 м/ч</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Замена масла в редукторе</span>
                    <span>через 6 м/ч</span>
                  </div>
                </div>
              </div>
            )}

            {designConcept === 'cockpit' && (
              <div className="p-4 rounded-2xl bg-[#080d1a] border border-cyan-800/60 font-mono space-y-3 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">ПЛМ / БОРТ</span>
                    <h4 className="text-sm font-black text-white mt-1">Berkut Parsun 40</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 border border-rose-500 text-rose-300">
                    ТРЕБУЕТ ТО
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-[9px] text-slate-400">МОТОЧАСЫ</div>
                    <div className="text-xl font-black text-white">94.0 <span className="text-xs text-cyan-400">М/Ч</span></div>
                  </div>
                  {/* Circular Dial Mini */}
                  <div className="w-10 h-10 rounded-full border-4 border-rose-500/80 border-t-transparent flex items-center justify-center text-[10px] font-black text-white">
                    94%
                  </div>
                </div>
                <div className="text-[11px] text-rose-300 flex justify-between">
                  <span>Шприцевание</span>
                  <span>-44 м/ч</span>
                </div>
              </div>
            )}

            {/* Card 2: BRZ 250 Enduro */}
            {designConcept === 'garage_pro' && (
              <div className="p-4 rounded-2xl bg-[#121316] border-2 border-amber-500 relative font-mono shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xl">🏁</span>
                    <h4 className="text-sm font-black text-white mt-1 uppercase">BRZ 250 Enduro</h4>
                    <div className="text-[10px] text-slate-400">ЭНДУРО 250CC</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">
                    СКОРО ТО
                  </span>
                </div>
                <div className="mt-3 p-2 rounded bg-black/60 border border-slate-800 flex justify-between items-baseline">
                  <span className="text-[10px] text-slate-500">НАРАБОТКА</span>
                  <span className="text-xl font-black text-amber-400">32.5 М/Ч</span>
                </div>
                <div className="mt-3 text-xs space-y-1">
                  <div className="flex justify-between text-rose-300 font-bold">
                    <span>Замена масла ДВС</span>
                    <span>-0.5 м/ч</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Промывка фильтра</span>
                    <span>через 0.5 м/ч</span>
                  </div>
                </div>
              </div>
            )}

            {designConcept === 'swiss_minimal' && (
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100">BRZ 250 Enduro</h4>
                    <div className="text-xs text-zinc-500">Эндуро мотоцикл</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
                    <span className="text-zinc-400 text-[11px]">скоро ТО</span>
                  </div>
                </div>
                <div className="py-2 border-y border-zinc-900 flex justify-between items-baseline">
                  <span className="text-[10px] text-zinc-500 uppercase">Моточасы</span>
                  <span className="text-xl font-semibold text-zinc-100">32.5 <span className="text-xs text-zinc-500">м/ч</span></span>
                </div>
                <div className="text-xs space-y-1 text-zinc-400">
                  <div className="flex justify-between text-amber-400">
                    <span>Замена масла ДВС</span>
                    <span>-0.5 м/ч</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Промывка возд. фильтра</span>
                    <span>через 0.5 м/ч</span>
                  </div>
                </div>
              </div>
            )}

            {designConcept === 'cockpit' && (
              <div className="p-4 rounded-2xl bg-[#080d1a] border border-cyan-800/60 font-mono space-y-3 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">МОТО / ТРЕК</span>
                    <h4 className="text-sm font-black text-white mt-1">BRZ 250 Enduro</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-500 text-amber-300">
                    СКОРО ТО
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-[9px] text-slate-400">МОТОЧАСЫ</div>
                    <div className="text-xl font-black text-white">32.5 <span className="text-xs text-cyan-400">М/Ч</span></div>
                  </div>
                  <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent flex items-center justify-center text-[10px] font-black text-white">
                    88%
                  </div>
                </div>
                <div className="text-[11px] text-amber-300 flex justify-between">
                  <span>Замена масла</span>
                  <span>-0.5 м/ч</span>
                </div>
              </div>
            )}

            {/* Card 3: BMW F800GS */}
            {designConcept === 'garage_pro' && (
              <div className="p-4 rounded-2xl bg-[#121316] border-2 border-slate-700 relative font-mono shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xl">🏍️</span>
                    <h4 className="text-sm font-black text-white mt-1 uppercase">BMW F800GS</h4>
                    <div className="text-[10px] text-slate-400">ТУРЭНДУРО 800CC</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                    В НОРМЕ
                  </span>
                </div>
                <div className="mt-3 p-2 rounded bg-black/60 border border-slate-800 flex justify-between items-baseline">
                  <span className="text-[10px] text-slate-500">ОДОМЕТР</span>
                  <span className="text-xl font-black text-amber-400">42 300 КМ</span>
                </div>
                <div className="mt-3 text-xs space-y-1">
                  <div className="flex justify-between text-amber-300">
                    <span>Замена масла ДВС</span>
                    <span>через 700 км</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Тормозная жидкость</span>
                    <span>в норме</span>
                  </div>
                </div>
              </div>
            )}

            {designConcept === 'swiss_minimal' && (
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100">BMW F800GS</h4>
                    <div className="text-xs text-zinc-500">Дорожный мотоцикл</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                    <span className="text-zinc-400 text-[11px]">в норме</span>
                  </div>
                </div>
                <div className="py-2 border-y border-zinc-900 flex justify-between items-baseline">
                  <span className="text-[10px] text-zinc-500 uppercase">Пробег</span>
                  <span className="text-xl font-semibold text-zinc-100">42 300 <span className="text-xs text-zinc-500">км</span></span>
                </div>
                <div className="text-xs space-y-1 text-zinc-400">
                  <div className="flex justify-between text-amber-400">
                    <span>Замена масла и фильтра</span>
                    <span>через 700 км</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Тормозная жидкость</span>
                    <span>в норме</span>
                  </div>
                </div>
              </div>
            )}

            {designConcept === 'cockpit' && (
              <div className="p-4 rounded-2xl bg-[#080d1a] border border-cyan-800/60 font-mono space-y-3 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">ТРАНСПОРТ</span>
                    <h4 className="text-sm font-black text-white mt-1">BMW F800GS</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-300">
                    НОРМА
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-[9px] text-slate-400">ПРОБЕГ</div>
                    <div className="text-xl font-black text-white">42 300 <span className="text-xs text-cyan-400">КМ</span></div>
                  </div>
                  <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent flex items-center justify-center text-[10px] font-black text-white">
                    42%
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Замена масла</span>
                  <span>через 700 км</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3 Value Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Создано теми, кто сам крутит гайки
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Решение трех главных проблем гаражного и водномоторного учета
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Гибридный учет (м/ч + км)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Обычные авто-приложения знают только пробег в км. МотоЖурнал нативно отслеживает наработку по моточасам, километрам и сезонным интервалам консервации.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Droplet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Шпаргалка ТО в 1 клик</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Больше не нужно гуглить: вязкость масла, объем картера, маркировка фильтра, зазор свечей и момент затяжки сливной пробки всегда перед глазами.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Режим «Грязные руки»</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Крупные кнопки, автоподстановка используемых масел одной кнопкой, сброс таймеров и офлайн-сохранение без лишней писанины прямо на подъемнике или причале.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Bar */}
      <section className="mt-auto border-t border-slate-800 bg-slate-900/40 py-10 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-white">Готовы навести порядок в гараже?</h3>
          <p className="text-xs text-slate-400">
            Начните прямо сейчас без утомительной регистрации — ваши данные всегда сохраняются у вас.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={loginAsGuest}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              Перейти в гараж
            </button>
            <button
              type="button"
              onClick={() => setAuthModalMode('login')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all"
            >
              Войти в профиль
            </button>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
        />
      )}
    </div>
  );
}
