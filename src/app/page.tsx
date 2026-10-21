'use client';

import React, { useState, useMemo } from 'react';
import { useGarage } from '@/context/GarageContext';
import { Vehicle } from '@/types/garage';
import { getVehicleUrgency } from '@/lib/calculations';
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
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function GarageDashboard() {
  const { vehicles, isHydrated } = useGarage();

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
    const urgentItems: { vehicleName: string; ruleName: string; desc: string; status: 'overdue' | 'due_soon'; vehicle: Vehicle }[] = [];

    vehicles.forEach((v) => {
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
    const counts: Record<string, number> = { all: vehicles.length };
    vehicles.forEach((v) => {
      counts[v.category] = (counts[v.category] || 0) + 1;
    });
    return counts;
  }, [vehicles]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesCat = selectedCategory === 'all' || v.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.specs.engineOil?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.specs.oilFilter?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [vehicles, selectedCategory, searchQuery]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Загрузка гаража...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Wrench className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                МотоЖурнал
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Гараж
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Сервисный учет моточасов и регламентов
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
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Общая история ТО"
            >
              <History className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">История</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBackupOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Резервная копия (Офлайн)"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Бэкап</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddVehicleOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Добавить технику</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* Urgent Service Attention Banner */}
        {fleetStats.urgentItems.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/30 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    Требуется обслуживание техники
                  </h2>
                  <p className="text-xs text-slate-400">
                    {fleetStats.overdueVehiclesCount > 0 && (
                      <span className="text-rose-400 font-semibold mr-2">
                        🔴 Просрочено ТО: {fleetStats.overdueVehiclesCount} ед.
                      </span>
                    )}
                    {fleetStats.dueSoonVehiclesCount > 0 && (
                      <span className="text-amber-400 font-semibold">
                        🟡 Скоро ТО: {fleetStats.dueSoonVehiclesCount} ед.
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
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                Внести ТО сейчас
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
                  className={`p-2.5 rounded-xl border cursor-pointer hover:scale-[1.01] transition-transform ${
                    item.status === 'overdue'
                      ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                      : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white mb-0.5">
                    <span className="truncate">{item.vehicleName}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        item.status === 'overdue'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{item.ruleName}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Categories Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              counts={categoryCounts}
            />

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск (модель, масло, фильтр)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Fleet Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-semibold text-slate-400">Техника не найдена</h3>
            <p className="text-xs text-slate-600 mt-1">
              Попробуйте сбросить фильтр или добавьте новый аппарат в гараж.
            </p>
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

      {/* Floating Bottom Greasy-Hands Action Button */}
      <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <button
          type="button"
          onClick={() => {
            setActiveLogVehicle(null);
            setIsLogModalOpen(true);
          }}
          className="pointer-events-auto flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-2xl shadow-amber-500/40 active:scale-95 transition-all border-2 border-amber-300/40"
        >
          <PlusCircle className="w-5 h-5 text-slate-950" />
          <span>+ Внести ТО</span>
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
