'use client';

import React, { useState, useEffect } from 'react';
import { useGarage } from '@/context/GarageContext';
import {
  X,
  Bug,
  Lightbulb,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

interface FeedbackModalProps {
  onClose: () => void;
  defaultType?: 'bug' | 'feature' | 'other';
}

export function FeedbackModal({ onClose, defaultType = 'bug' }: FeedbackModalProps) {
  const { user, syncStatus } = useGarage();
  const [type, setType] = useState<'bug' | 'feature' | 'other'>(defaultType);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [showDiagnosticsPreview, setShowDiagnosticsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Автоматический сбор диагностических данных устройства
  const [diagnostics, setDiagnostics] = useState<{
    platform: string;
    userAgent: string;
    screenSize: string;
    language: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    if (user && !user.isGuest && user.email) {
      setEmail(user.email);
    }

    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      let platform = 'Десктоп';
      if (/iPhone|iPad|iPod/i.test(ua)) platform = 'Apple iOS (iPhone/iPad)';
      else if (/Android/i.test(ua)) platform = 'Android';
      else if (/Mac/i.test(ua)) platform = 'macOS';
      else if (/Windows/i.test(ua)) platform = 'Windows';
      else if (/Linux/i.test(ua)) platform = 'Linux';

      setDiagnostics({
        platform,
        userAgent: ua,
        screenSize: `${window.innerWidth} × ${window.innerHeight} (DPR: ${window.devicePixelRatio || 1})`,
        language: navigator.language || 'ru',
        url: window.location.href,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 3) {
      setErrorMessage('Пожалуйста, напишите сообщение (минимум 3 символа)');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message: message.trim(),
          email: email.trim() || undefined,
          deviceInfo: includeDiagnostics ? diagnostics : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Не удалось отправить сообщение');
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error('Feedback submit error:', err);
      setErrorMessage(err.message || 'Произошла ошибка при отправке. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const placeholders = {
    bug: 'Опишите, что пошло не так: какие действия привели к ошибке, что именно произошло и как должно было сработать...',
    feature: 'Какую функцию или доработку вы хотели бы видеть в ServiceKeeper? Как это сделает учет удобнее?...',
    other: 'Ваш отзыв, впечатления или вопрос о работе ServiceKeeper...',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              {type === 'bug' ? (
                <Bug className="w-4 h-4 text-rose-400" />
              ) : type === 'feature' ? (
                <Lightbulb className="w-4 h-4 text-amber-400" />
              ) : (
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-zinc-100">Обратная связь</h3>
              <p className="text-[11px] text-zinc-500">Сообщить об ошибке или предложить идею</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {submitSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/80 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-semibold text-zinc-100">Спасибо за обратную связь!</h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Ваше сообщение сохранено в истории и передано разработчику.
                {email.trim() && ' При необходимости мы свяжемся с вами по указанной почте.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors"
              >
                Отлично, закрыть
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
            {/* Type selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-400">Тип обращения</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setType('bug')}
                  className={`py-2 px-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    type === 'bug'
                      ? 'bg-rose-950/30 border-rose-800/80 text-rose-300 shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Bug className={`w-4 h-4 ${type === 'bug' ? 'text-rose-400' : 'text-zinc-500'}`} />
                  <span className="font-medium text-[11px]">Баг / Ошибка</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('feature')}
                  className={`py-2 px-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    type === 'feature'
                      ? 'bg-amber-950/30 border-amber-800/80 text-amber-300 shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Lightbulb className={`w-4 h-4 ${type === 'feature' ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span className="font-medium text-[11px]">Идея / Фича</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('other')}
                  className={`py-2 px-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    type === 'other'
                      ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300 shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 ${type === 'other' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <span className="font-medium text-[11px]">Отзыв</span>
                </button>
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-1.5">
              <label htmlFor="feedback-email" className="text-[11px] font-medium text-zinc-400">
                Ваш Email <span className="text-zinc-500 font-normal">(для ответа, если требуется)</span>
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors text-xs"
              />
            </div>

            {/* Message field */}
            <div className="space-y-1.5">
              <label htmlFor="feedback-message" className="text-[11px] font-medium text-zinc-400">
                Описание <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="feedback-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={placeholders[type]}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors text-xs resize-none leading-relaxed"
              />
            </div>

            {/* Diagnostics toggle */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeDiagnostics}
                    onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-zinc-300 font-medium flex items-center gap-1.5">
                    <Smartphone className="w-3 h-3 text-zinc-400" />
                    Прикрепить диагностику устройства
                  </span>
                </label>
                {includeDiagnostics && diagnostics && (
                  <button
                    type="button"
                    onClick={() => setShowDiagnosticsPreview(!showDiagnosticsPreview)}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-0.5"
                  >
                    <span>{showDiagnosticsPreview ? 'Скрыть' : 'Показать'}</span>
                    {showDiagnosticsPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {includeDiagnostics && showDiagnosticsPreview && diagnostics && (
                <div className="pt-1.5 border-t border-zinc-800/80 text-[10px] text-zinc-400 font-mono space-y-0.5">
                  <div>Устройство: <span className="text-zinc-200">{diagnostics.platform}</span></div>
                  <div>Экран: <span className="text-zinc-200">{diagnostics.screenSize}</span></div>
                  <div>Синхронизация: <span className="text-zinc-200">{syncStatus}</span></div>
                  <div className="truncate">Браузер: <span className="text-zinc-400">{diagnostics.userAgent}</span></div>
                </div>
              )}
            </div>

            {/* Error display */}
            {errorMessage && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-1/3 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-2/3 py-2 px-4 rounded-xl bg-zinc-100 hover:bg-white disabled:opacity-50 text-zinc-950 font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Отправка...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Отправить</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
