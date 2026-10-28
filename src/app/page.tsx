'use client';

import React, { useState, useMemo } from 'react';
import { useGarage } from '@/context/GarageContext';
import { Vehicle } from '@/types/garage';
import { getVehicleUrgency } from '@/lib/calculations';
import { LandingPage } from '@/components/LandingPage';
import { CategoryFilter } from '@/components/CategoryFilter';
import { VehicleCard } from '@/components/VehicleCard';
import { LogServiceModal } from '@/components/LogServiceModal';
import { QuickSpecsModal } from '@/components/QuickSpecsModal';
import { ServiceHistoryModal } from '@/components/ServiceHistoryModal';
import { AddVehicleModal } from '@/components/AddVehicleModal';
import { BackupModal } from '@/components/BackupModal';
import {
  Wrench,
  PlusCircle,
  History,
  Database,
  Plus,
  Search,
  LogOut,
  Layers,
  Cloud,
  CloudOff,
  Loader2,
  WifiOff,
} from 'lucide-react';

export default function Home() {
  const { user, logout, vehicles, isHydrated, loadDemoFleet, syncStatus, syncNow } = useGarage();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [activeSpecsVehicle, setActiveSpecsVehicle] = useState<Vehicle | null>(null);
  const [activeLogVehicle, setActiveLogVehicle] = useState<Vehicle | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTargetVehicle, setHistoryTargetVehicle] = useState<Vehicle | null>(null);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Compute fleet urgency stats
  const fleetStats = useMemo(() => {
    let overdueVehiclesCount = 0;
    let dueSoonVehiclesCount = 0;
    const urgentItems: {
      vehicleName: string;
      ruleName: string;
      desc: string;
      status: 'overdue' | 'due_soon';
      vehicle: Vehicle;
    }[] = [];

    vehicles.forEach((v) => {
      if (v.isArchived) return; // Do not alert for archived vehicles
      const urgency = getVehicleUrgency(v);
      if (urgency.overdueCount > 0) overdueVehiclesCount++;
      else if (urgency.dueSoonCount > 0) dueSoonVehiclesCount++;

      urgency.rulesStatus.forEach((rs) => {
        if (rs.status === 'overdue' || rs.status === 'due_soon') {
          urgentItems.push({
            vehicleName: v.name,
            ruleName: rs.rule.name,
            desc: rs.description,
            status: rs.status,
            vehicle: v,
          });
        }
      });
    });

    return {
      overdueVehiclesCount,
      dueSoonVehiclesCount,
      urgentItems,
    };
  }, [vehicles]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const activeVehicles = vehicles.filter((v) => !v.isArchived);
    const archivedVehicles = vehicles.filter((v) => v.isArchived);
    const counts: Record<string, number> = {
      all: activeVehicles.length,
      archived: archivedVehicles.length,
    };
    activeVehicles.forEach((v) => {
      counts[v.category] = (counts[v.category] || 0) + 1;
    });
    return counts;
  }, [vehicles]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (selectedCategory === 'archived') {
        if (!v.isArchived) return false;
      } else {
        if (v.isArchived) return false;
        if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
      }

      const matchesSearch =
        searchQuery.trim() === '' ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.specs.engineOil?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.specs.oilFilter?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [vehicles, selectedCategory, searchQuery]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-500 text-xs">
          <div className="w-4 h-4 border border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  // If not logged in -> render Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // If logged in -> render the full Garage App (Swiss Minimalist)
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-28 selection:bg-zinc-800 selection:text-zinc-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-zinc-100 leading-tight">
                ServiceKeeper
              </h1>
              <p className="text-[10px] text-zinc-500 font-medium">
                Сервисный учет
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setHistoryTargetVehicle(null);
                setIsHistoryModalOpen(true);
              }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-800/80"
              title="Общая история ТО"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">История</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBackupOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-800/80"
              title="Резервная копия (Офлайн)"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Бэкап</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddVehicleOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Добавить технику</span>
            </button>

            {/* User Session, Cloud Sync & Logout */}
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-zinc-900">
              {/* Cloud Sync Status Indicator */}
              {!user.isGuest && (
                <>
                  {syncStatus === 'synced' && (
                    <button
                      type="button"
                      onClick={() => syncNow()}
                      title="Гараж синхронизирован с облаком. Нажмите для обновления."
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-950/40 border border-emerald-900/50 text-[10px] text-emerald-400 font-medium hover:bg-emerald-900/30 transition-colors"
                    >
                      <Cloud className="w-3 h-3" />
                      <span className="hidden md:inline">Синхронизировано</span>
                    </button>
                  )}
                  {syncStatus === 'syncing' && (
                    <span
                      title="Идет обмен данными с сервером..."
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-950/40 border border-amber-900/50 text-[10px] text-amber-400 font-medium"
                    >
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="hidden md:inline">Синхронизация...</span>
                    </span>
                  )}
                  {syncStatus === 'unconfigured' && (
                    <button
                      type="button"
                      onClick={() => setIsBackupOpen(true)}
                      title="Подключите Vercel KV в панели Vercel для авто-синхронизации между устройствами."
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-900/80 border border-zinc-800 text-[10px] text-zinc-400 hover:text-amber-400 transition-colors"
                    >
                      <CloudOff className="w-3 h-3 text-amber-500/80" />
                      <span className="hidden md:inline">Только локально</span>
                    </button>
                  )}
                  {syncStatus === 'offline' && (
                    <span
                      title="Нет соединения с сетью. Данные сохранены на этом устройстве."
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-900/80 border border-zinc-800 text-[10px] text-zinc-500 font-medium"
                    >
                      <WifiOff className="w-3 h-3" />
                      <span className="hidden md:inline">Офлайн</span>
                    </span>
                  )}
                </>
              )}

              <span className="text-[10px] px-2 py-1 rounded bg-zinc-900 text-zinc-500 font-mono hidden md:inline truncate max-w-[140px]">
                {user.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
                title="Выйти из аккаунта (на главную)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {/* Urgent Service Attention Banner (Swiss Minimalist) */}
        {fleetStats.urgentItems.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
                <div>
                  <h2 className="text-xs sm:text-sm font-semibold text-zinc-100">
                    Требуется обслуживание техники
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {fleetStats.overdueVehiclesCount > 0 && (
                      <span className="text-rose-400 mr-2">
                        {fleetStats.overdueVehiclesCount} просрочено
                      </span>
                    )}
                    {fleetStats.dueSoonVehiclesCount > 0 && (
                      <span className="text-amber-400">
                        {fleetStats.dueSoonVehiclesCount} скоро срок
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveLogVehicle(fleetStats.urgentItems[0]?.vehicle || null);
                  setIsLogModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm self-start sm:self-auto transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Внести ТО
              </button>
            </div>

            {/* List of Urgent Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {fleetStats.urgentItems.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveLogVehicle(item.vehicle);
                    setIsLogModalOpen(true);
                  }}
                  className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:border-zinc-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-200 mb-0.5">
                    <span className="truncate">{item.vehicleName}</span>
                    <span
                      className={`text-[11px] font-mono ${
                        item.status === 'overdue' ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">{item.ruleName}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Categories Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            counts={categoryCounts}
          />

          {/* Minimal Search Field */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>
        </div>

        {/* Fleet Grid / Empty State */}
        {vehicles.length === 0 ? (
          <div className="py-12 sm:py-16 px-4">
            <div className="max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-zinc-850 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-300">
                <Layers className="w-6 h-6 text-zinc-400" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm sm:text-base font-semibold text-zinc-100">
                  Гараж пока пуст
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Добавьте вашу первую машину, мотоцикл, катер или садовую технику, чтобы вести учет наработки, регламенты ТО и шпаргалки расходников.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить технику</span>
                </button>
                <button
                  type="button"
                  onClick={loadDemoFleet}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-zinc-100 font-medium text-xs transition-colors"
                >
                  Загрузить демо-парк
                </button>
              </div>
            </div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <Wrench className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <h3 className="text-xs font-medium text-zinc-400">Техника не найдена</h3>
            <p className="text-[11px] text-zinc-500 mt-1">Попробуйте изменить категорию или поисковый запрос</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onOpenSpecs={(v) => setActiveSpecsVehicle(v)}
                onLogService={(v) => {
                  setActiveLogVehicle(v);
                  setIsLogModalOpen(true);
                }}
                onOpenHistory={(v) => {
                  setHistoryTargetVehicle(v);
                  setIsHistoryModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Action Button (Swiss Minimalist Pill) */}
      <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <button
          type="button"
          onClick={() => {
            setActiveLogVehicle(null);
            setIsLogModalOpen(true);
          }}
          className="pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-2xl shadow-black/80 active:scale-95 transition-all border border-white/20"
        >
          <PlusCircle className="w-4 h-4 text-zinc-950" />
          <span>Внести ТО</span>
        </button>
      </div>

      {/* Modals */}
      {activeSpecsVehicle && (
        <QuickSpecsModal
          vehicle={activeSpecsVehicle}
          onClose={() => setActiveSpecsVehicle(null)}
        />
      )}

      {isLogModalOpen && (
        <LogServiceModal
          initialVehicleId={activeLogVehicle?.id}
          onClose={() => {
            setIsLogModalOpen(false);
            setActiveLogVehicle(null);
          }}
        />
      )}

      {isHistoryModalOpen && (
        <ServiceHistoryModal
          vehicle={historyTargetVehicle}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setHistoryTargetVehicle(null);
          }}
        />
      )}

      {isAddVehicleOpen && (
        <AddVehicleModal onClose={() => setIsAddVehicleOpen(false)} />
      )}

      {isBackupOpen && <BackupModal onClose={() => setIsBackupOpen(false)} />}
    </div>
  );
}
