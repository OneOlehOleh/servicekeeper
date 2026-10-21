'use client';

import React, { useState } from 'react';
import { useGarage } from '@/context/GarageContext';
import { Lock, Mail, ArrowRight, X } from 'lucide-react';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export function AuthModal({ initialMode = 'login', onClose }: AuthModalProps) {
  const { login, loginAsGuest } = useGarage();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Введите корректный email адрес');
      return;
    }

    if (password && password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }

    login(email.trim());
    onClose();
  };

  const handleGuestAccess = () => {
    loginAsGuest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
            </h3>
            <p className="text-[11px] text-zinc-500">
              {mode === 'login' ? 'Доступ к вашему гаражу' : 'Создайте аккаунт за 10 секунд'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="p-1 mx-5 mt-4 bg-zinc-900 border border-zinc-850 rounded-xl grid grid-cols-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Новый аккаунт
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoFocus
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] uppercase tracking-wider font-medium text-zinc-400">Пароль</label>
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <span>{mode === 'login' ? 'Войти в гараж' : 'Создать аккаунт'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Divider */}
          <div className="relative my-3 flex items-center justify-center">
            <div className="border-t border-zinc-900 w-full" />
            <span className="bg-zinc-950 px-2 text-[10px] text-zinc-600 uppercase font-medium">
              или
            </span>
          </div>

          {/* Fast Guest Mode Button */}
          <button
            type="button"
            onClick={handleGuestAccess}
            className="w-full py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Продолжить без регистрации (Офлайн)</span>
          </button>
        </form>
      </div>
    </div>
  );
}
