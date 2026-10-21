'use client';

import React, { useState } from 'react';
import { useGarage } from '@/context/GarageContext';
import { AuthModal } from '@/components/AuthModal';
import {
  Wrench,
  Clock,
  Droplet,
  Smartphone,
  ArrowRight,
  Check,
  Layers,
  ChevronRight,
} from 'lucide-react';

export function LandingPage() {
  const { loginAsGuest } = useGarage();
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-zinc-800 selection:text-zinc-100 font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              МотоЖурнал
            </span>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setAuthModalMode('login')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Войти
            </button>
            <button
              type="button"
              onClick={() => setAuthModalMode('register')}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition-all active:scale-95"
            >
              Создать аккаунт
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        {/* Subtle Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Для мотоциклов, катеров, эндуро и авто</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-100 leading-[1.18] max-w-3xl mx-auto">
          Сервисный журнал для тех, у кого больше одной машины
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Забудьте о масляных блокнотах и забытых регламентах.{' '}
          <span className="text-zinc-200">Моточасы</span> для лодочных моторов и эндуро.{' '}
          <span className="text-zinc-200">Километры</span> для дорожных мотоциклов и авто.{' '}
          Шпаргалка масел и фильтров всегда под рукой.
        </p>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
          <button
            type="button"
            onClick={loginAsGuest}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs sm:text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Открыть демо-гараж</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setAuthModalMode('register')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-medium text-xs sm:text-sm transition-all"
          >
            Регистрация за 10 сек
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-zinc-500">
          <span>• 100% Офлайн (PWA)</span>
          <span>• Без паролей и лишних полей</span>
          <span>• Данные сохраняются у вас</span>
        </div>
      </section>

      {/* Live Fleet Preview Cards (Swiss Minimalist Style) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 w-full">
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-850 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Парк техники (Предпросмотр)
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
              <span className="text-zinc-400 text-[11px]">2 единицы требуют ТО</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Berkut Parsun 40 */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">Berkut S-DX (Parsun 40)</h4>
                  <div className="text-xs text-zinc-500">Лодочный мотор 4Т</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
                  <span className="text-zinc-400 text-[11px]">требуется</span>
                </div>
              </div>
              <div className="py-2 border-y border-zinc-900 flex justify-between items-baseline">
                <span className="text-[10px] text-zinc-500 uppercase">Моточасы</span>
                <span className="text-xl font-semibold text-zinc-100 font-mono">
                  94.0 <span className="text-xs text-zinc-500">м/ч</span>
                </span>
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

            {/* Card 2: BRZ 250 Enduro */}
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
                <span className="text-xl font-semibold text-zinc-100 font-mono">
                  32.5 <span className="text-xs text-zinc-500">м/ч</span>
                </span>
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

            {/* Card 3: BMW F800GS */}
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
                <span className="text-xl font-semibold text-zinc-100 font-mono">
                  42 300 <span className="text-xs text-zinc-500">км</span>
                </span>
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
          </div>
        </div>
      </section>

      {/* 3 Value Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-2.5">
            <div className="text-xs font-semibold text-zinc-200">Гибридный учет (м/ч + км)</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Моточасы для лодок и эндуро. Километры для дорожных мотоциклов и авто. Календарные месяцы для сезонной консервации.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-2.5">
            <div className="text-xs font-semibold text-zinc-200">Шпаргалка ТО в 1 тап</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Вязкость масла, объем картера, маркировка фильтра, зазор свечей и момент затяжки сливной пробки всегда перед глазами.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-2.5">
            <div className="text-xs font-semibold text-zinc-200">Режим «Грязные руки»</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Крупные кнопки, автоподстановка используемых масел одной кнопкой, сброс таймеров и офлайн-сохранение прямо в гараже.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 py-8 px-4 text-center text-xs text-zinc-600">
        <div>МотоЖурнал — сервис ведения регламентов техники</div>
      </footer>

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
