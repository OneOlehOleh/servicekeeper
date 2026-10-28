'use client';

import React, { useState } from 'react';
import { useGarage } from '@/context/GarageContext';
import { Download, Upload, X, Check, Copy, Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface BackupModalProps {
  onClose: () => void;
}

export function BackupModal({ onClose }: BackupModalProps) {
  const { exportDataJson, importDataJson, clearAllData, loadDemoFleet, user, syncStatus, syncNow, lastSyncedAt } = useGarage();
  const [jsonInput, setJsonInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await syncNow();
    } finally {
      setIsManualSyncing(false);
    }
  };

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

  const handleClearAll = () => {
    if (confirm('Вы уверены, что хотите удалить ВСЮ технику и сервисные записи из гаража? Это действие необратимо, если нет скачанной резервной копии.')) {
      clearAllData();
      onClose();
    }
  };

  const handleLoadDemo = () => {
    if (confirm('Загрузить демонстрационный парк техники (BMW F800, Berkut Parsun 40, BRZ 250, Apollo и др.)?')) {
      loadDemoFleet();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-zinc-100">Резервная копия</h3>
            <p className="text-[11px] text-zinc-500">Экспорт и импорт локальной базы данных</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Cloud Synchronization Section */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-zinc-400" />
                Синхронизация между устройствами
              </h4>
              {user && !user.isGuest && syncStatus === 'synced' && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Активна
                </span>
              )}
            </div>

            {user?.isGuest ? (
              <p className="text-xs text-zinc-400 leading-relaxed">
                Вы находитесь в гостевом режиме. Данные хранятся только в этом браузере. Выйдите на главную и войдите с вашим Email, чтобы техника синхронизировалась между смартфоном и компьютером.
              </p>
            ) : syncStatus === 'synced' ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Ваш гараж привязан к аккаунту <span className="font-mono text-zinc-100">{user?.email}</span>. Все добавленные машины, регламенты и отметки ТО синхронизируются автоматически на всех ваших устройствах.
                </p>
                {lastSyncedAt && (
                  <div className="text-[10px] text-zinc-500">
                    Последний обмен: {lastSyncedAt.toLocaleTimeString('ru-RU')}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isManualSyncing}
                  className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isManualSyncing ? 'animate-spin' : ''}`} />
                  <span>{isManualSyncing ? 'Обновление...' : 'Синхронизировать сейчас'}</span>
                </button>
              </div>
            ) : syncStatus === 'unconfigured' ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40 text-amber-300/90 text-xs leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-200">Облако Vercel KV еще не подключено:</span>
                    <br />
                    Данные сохраняются локально на этом устройстве. Чтобы включить бесшовную синхронизацию между телефоном и ПК:
                    <ol className="list-decimal list-inside mt-1.5 space-y-0.5 text-zinc-400">
                      <li>Откройте проект на <span className="text-zinc-200">vercel.com</span></li>
                      <li>Вкладка <span className="text-zinc-200">Storage</span> → кнопка <span className="text-zinc-200">Create Database</span></li>
                      <li>Выберите <span className="text-zinc-200">KV</span> (Free) → нажмите <span className="text-zinc-200">Connect</span></li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : syncStatus === 'error' ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-200">Ошибка синхронизации</span>
                    <p className="mt-0.5 text-rose-300/80">Сервер сообщил об ошибке или токен не валиден. Попробуйте повторить.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isManualSyncing}
                  className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isManualSyncing ? 'animate-spin' : ''}`} />
                  <span>{isManualSyncing ? 'Обновление...' : 'Повторить попытку'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Статус: {syncStatus === 'syncing' ? 'Синхронизация...' : 'Офлайн режим'}</span>
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isManualSyncing}
                  className="py-1 px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isManualSyncing ? 'animate-spin' : ''}`} />
                  Повторить
                </button>
              </div>
            )}
          </div>

          {/* Export */}
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 space-y-2.5">
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              Экспорт (Сохранить копию)
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Все данные хранятся локально в вашем браузере. Вы можете в любой момент сохранить резервный файл на телефон или компьютер.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-2 px-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Скачать JSON-файл
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Скопировано!' : 'Копировать'}
              </button>
            </div>
          </div>

          {/* Import */}
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 space-y-2.5">
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              Импорт (Восстановить)
            </h4>
            <textarea
              rows={3}
              placeholder="Вставьте JSON-код резервной копии сюда..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs focus:outline-none focus:border-zinc-700 resize-none"
            />
            {importStatus && (
              <div
                className={`text-xs font-medium ${
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
              className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Применить импорт
            </button>
          </div>

          {/* Database management shortcuts */}
          <div className="pt-2 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleLoadDemo}
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Загрузить образцы техники (демо-парк)
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-zinc-500 hover:text-rose-400 transition-colors"
            >
              Очистить базу гаража
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
