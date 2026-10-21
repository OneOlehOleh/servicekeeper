'use client';

import React, { useState } from 'react';
import { useGarage } from '@/context/GarageContext';
import { Database, Download, Upload, RefreshCw, X, Check, Copy } from 'lucide-react';

interface BackupModalProps {
  onClose: () => void;
}

export function BackupModal({ onClose }: BackupModalProps) {
  const { exportDataJson, importDataJson, resetAllData } = useGarage();
  const [jsonInput, setJsonInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportDataJson());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moto-ledger-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!jsonInput.trim()) return;
    const success = importDataJson(jsonInput);
    if (success) {
      setImportStatus('Данные успешно импортированы!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setImportStatus('Ошибка: неверный формат JSON');
    }
  };

  const handleReset = () => {
    if (confirm('Сбросить все данные к исходному гаражу (BMW, Berkut, BRZ, Apollo)?')) {
      resetAllData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Резервная копия и Офлайн-данные</h3>
              <p className="text-xs text-slate-400">Экспорт, импорт и безопасность ваших записей</p>
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Export */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-400" />
              Экспорт (Сохранить копию)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Все данные хранятся локально в вашем браузере. Вы можете в любой момент сохранить резервный файл на телефон или компьютер.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                Скачать JSON-файл
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Скопировано!' : 'Копировать'}
              </button>
            </div>
          </div>

          {/* Import */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-amber-400" />
              Импорт (Восстановить)
            </h4>
            <textarea
              rows={3}
              placeholder="Вставьте JSON-код резервной копии сюда..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500 resize-none"
            />
            {importStatus && (
              <div
                className={`text-xs font-semibold ${
                  importStatus.includes('успешно') ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {importStatus}
              </div>
            )}
            <button
              type="button"
              onClick={handleImport}
              disabled={!jsonInput.trim()}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Применить импорт
            </button>
          </div>

          {/* Reset */}
          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Сбросить к заводским демо-данным
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
