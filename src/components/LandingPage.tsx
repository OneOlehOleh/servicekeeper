'use client';

import React, { useState } from 'react';
import { useGarage } from '@/context/GarageContext';
import { AuthModal } from '@/components/AuthModal';
import {
  Wrench,
  Clock,
  Gauge,
  Droplet,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Flame,
  Sparkles,
  Zap,
  Smartphone,
  BookOpen,
  Sliders,
} from 'lucide-react';

export function LandingPage() {
  const { loginAsGuest } = useGarage();
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);

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
      <section className="relative pt-12 pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
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
          Единый цифровой гараж для вашей техники.{' '}
          <span className="text-slate-200 font-medium">Моточасы</span> для лодочных моторов и эндуро.{' '}
          <span className="text-slate-200 font-medium">Пробег</span> для дорожных мотоциклов и авто.{' '}
          Экспресс-шпаргалка масел и фильтров прямо в вашем смартфоне.
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

      {/* Live Preview Cards Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 w-full">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Интерактивный предпросмотр вашего парка</span>
              </h3>
              <p className="text-xs text-slate-400">
                Попробуйте кликнуть по технике ниже, чтобы увидеть шпаргалку или статус
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 self-start sm:self-auto">
              🔴 2 единицы требуют ТО
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Parsun 40 Marine */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-rose-500/30 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xl">🚤</span>
                  <h4 className="text-sm font-bold text-white mt-1">Berkut S-DX (Parsun 40)</h4>
                  <div className="text-xs text-slate-400">Лодочный мотор 4Т</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Просрочено
                </span>
              </div>
              <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 flex items-baseline justify-between font-mono">
                <span className="text-xs text-slate-400">Моточасы</span>
                <span className="text-lg font-bold text-white">94.0 <span className="text-amber-400 text-xs">м/ч</span></span>
              </div>
              <div className="mt-3 text-xs space-y-1 text-slate-300">
                <div className="flex justify-between text-rose-300 font-semibold">
                  <span>Шприцевание тавотниц</span>
                  <span>-44 м/ч</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>Масло картера + редуктор</span>
                  <span>осталось 6 м/ч</span>
                </div>
              </div>
            </div>

            {/* Card 2: BRZ 250 Enduro */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-amber-500/30 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xl">🏁</span>
                  <h4 className="text-sm font-bold text-white mt-1">BRZ 250 Enduro</h4>
                  <div className="text-xs text-slate-400">Эндуро мотоцикл</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Скоро ТО
                </span>
              </div>
              <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 flex items-baseline justify-between font-mono">
                <span className="text-xs text-slate-400">Моточасы</span>
                <span className="text-lg font-bold text-white">32.5 <span className="text-amber-400 text-xs">м/ч</span></span>
              </div>
              <div className="mt-3 text-xs space-y-1 text-slate-300">
                <div className="flex justify-between text-rose-300 font-semibold">
                  <span>Замена масла ДВС</span>
                  <span>-0.5 м/ч</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Промывка возд. фильтра</span>
                  <span>через 0.5 м/ч</span>
                </div>
              </div>
            </div>

            {/* Card 3: BMW F800GS */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xl">🏍️</span>
                  <h4 className="text-sm font-bold text-white mt-1">BMW F800GS</h4>
                  <div className="text-xs text-slate-400">Дорожный турэндуро</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  В порядке
                </span>
              </div>
              <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 flex items-baseline justify-between font-mono">
                <span className="text-xs text-slate-400">Одометр</span>
                <span className="text-lg font-bold text-white">42 300 <span className="text-amber-400 text-xs">км</span></span>
              </div>
              <div className="mt-3 text-xs space-y-1 text-slate-300">
                <div className="flex justify-between text-amber-300">
                  <span>Замена масла и фильтра</span>
                  <span>через 700 км</span>
                </div>
                <div className="flex justify-between text-slate-400">
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
