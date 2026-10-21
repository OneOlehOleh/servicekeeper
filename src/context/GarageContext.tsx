'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vehicle, ServiceRecord, QuickSpecs, MaintenanceRule } from '@/types/garage';
import { INITIAL_VEHICLES, INITIAL_SERVICE_LOGS } from '@/data/initialFleet';

interface GarageContextType {
  vehicles: Vehicle[];
  serviceLogs: ServiceRecord[];
  isHydrated: boolean;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  updateVehicleReading: (vehicleId: string, hours?: number, km?: number) => void;
  logService: (record: Omit<ServiceRecord, 'id'>) => void;
  updateQuickSpecs: (vehicleId: string, specs: Partial<QuickSpecs>) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  deleteVehicle: (vehicleId: string) => void;
  addRuleToVehicle: (vehicleId: string, rule: Omit<MaintenanceRule, 'id'>) => void;
  deleteRuleFromVehicle: (vehicleId: string, ruleId: string) => void;
  resetAllData: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
}

const STORAGE_KEY = 'moto_ledger_data_v1';

const GarageContext = createContext<GarageContextType | null>(null);

export function GarageProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [serviceLogs, setServiceLogs] = useState<ServiceRecord[]>(INITIAL_SERVICE_LOGS);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.vehicles && Array.isArray(parsed.vehicles)) {
          setVehicles(parsed.vehicles);
        }
        if (parsed.serviceLogs && Array.isArray(parsed.serviceLogs)) {
          setServiceLogs(parsed.serviceLogs);
        }
      }
    } catch (e) {
      console.error('Failed to load garage data from localStorage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ vehicles, serviceLogs }));
    } catch (e) {
      console.error('Failed to save garage data to localStorage', e);
    }
  }, [vehicles, serviceLogs, isHydrated]);

  const updateVehicleReading = (vehicleId: string, hours?: number, km?: number) => {
    const today = new Date().toISOString().split('T')[0];
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== vehicleId) return v;
        return {
          ...v,
          currentHours: hours !== undefined ? hours : v.currentHours,
          currentKm: km !== undefined ? km : v.currentKm,
          lastUpdatedDate: today,
        };
      })
    );
  };

  const logService = (recordData: Omit<ServiceRecord, 'id'>) => {
    const id = 'log-' + Date.now();
    const newRecord: ServiceRecord = { ...recordData, id };

    setServiceLogs((prev) => [newRecord, ...prev]);

    const today = recordData.date || new Date().toISOString().split('T')[0];

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== recordData.vehicleId) return v;

        const updatedHours = recordData.hours !== undefined ? recordData.hours : v.currentHours;
        const updatedKm = recordData.km !== undefined ? recordData.km : v.currentKm;

        // Reset the serviced rules
        const updatedRules = v.rules.map((rule) => {
          if (recordData.servicedRuleIds.includes(rule.id)) {
            return {
              ...rule,
              lastPerformedDate: today,
              lastPerformedHours: updatedHours,
              lastPerformedKm: updatedKm,
            };
          }
          return rule;
        });

        return {
          ...v,
          currentHours: updatedHours,
          currentKm: updatedKm,
          lastUpdatedDate: today,
          rules: updatedRules,
        };
      })
    );
  };

  const updateQuickSpecs = (vehicleId: string, specs: Partial<QuickSpecs>) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== vehicleId) return v;
        return {
          ...v,
          specs: { ...v.specs, ...specs },
        };
      })
    );
  };

  const addVehicle = (newVehicleData: Omit<Vehicle, 'id'>) => {
    const id = 'veh-' + Date.now();
    const vehicle: Vehicle = { ...newVehicleData, id };
    setVehicles((prev) => [vehicle, ...prev]);
  };

  const deleteVehicle = (vehicleId: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    setServiceLogs((prev) => prev.filter((log) => log.vehicleId !== vehicleId));
    if (selectedVehicleId === vehicleId) {
      setSelectedVehicleId(null);
    }
  };

  const addRuleToVehicle = (vehicleId: string, ruleData: Omit<MaintenanceRule, 'id'>) => {
    const id = 'rule-' + Date.now();
    const newRule: MaintenanceRule = { ...ruleData, id };
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== vehicleId) return v;
        return {
          ...v,
          rules: [...v.rules, newRule],
        };
      })
    );
  };

  const deleteRuleFromVehicle = (vehicleId: string, ruleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== vehicleId) return v;
        return {
          ...v,
          rules: v.rules.filter((r) => r.id !== ruleId),
        };
      })
    );
  };

  const resetAllData = () => {
    setVehicles(INITIAL_VEHICLES);
    setServiceLogs(INITIAL_SERVICE_LOGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const exportDataJson = () => {
    return JSON.stringify({ vehicles, serviceLogs, exportedAt: new Date().toISOString() }, null, 2);
  };

  const importDataJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.vehicles && Array.isArray(parsed.vehicles)) {
        setVehicles(parsed.vehicles);
        if (parsed.serviceLogs && Array.isArray(parsed.serviceLogs)) {
          setServiceLogs(parsed.serviceLogs);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <GarageContext.Provider
      value={{
        vehicles,
        serviceLogs,
        isHydrated,
        selectedVehicleId,
        setSelectedVehicleId,
        updateVehicleReading,
        logService,
        updateQuickSpecs,
        addVehicle,
        deleteVehicle,
        addRuleToVehicle,
        deleteRuleFromVehicle,
        resetAllData,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </GarageContext.Provider>
  );
}

export function useGarage() {
  const context = useContext(GarageContext);
  if (!context) {
    throw new Error('useGarage must be used within a GarageProvider');
  }
  return context;
}
