'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Vehicle, ServiceRecord, QuickSpecs, MaintenanceRule, SyncStatus } from '@/types/garage';
import { INITIAL_VEHICLES, INITIAL_SERVICE_LOGS, DEMO_VEHICLES, DEMO_SERVICE_LOGS } from '@/data/initialFleet';
import { CommunityPreset, INITIAL_COMMUNITY_PRESETS } from '@/data/communityPresets';

export type DesignConcept = 'garage_pro' | 'swiss_minimal' | 'cockpit';

export interface UserSession {
  email: string;
  isGuest?: boolean;
}

interface GarageContextType {
  user: UserSession | null;
  designConcept: DesignConcept;
  setDesignConcept: (concept: DesignConcept) => void;
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
  archiveVehicle: (vehicleId: string) => void;
  unarchiveVehicle: (vehicleId: string) => void;
  addRuleToVehicle: (vehicleId: string, rule: Omit<MaintenanceRule, 'id'>) => void;
  deleteRuleFromVehicle: (vehicleId: string, ruleId: string) => void;
  resetAllData: () => void;
  clearAllData: () => void;
  loadDemoFleet: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
  login: (email: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  communityPresets: CommunityPreset[];
  shareToCommunity: (vehicleId: string, authorName: string) => boolean;
  upvoteCommunityPreset: (presetId: string) => void;
  syncStatus: SyncStatus;
  syncMessage: string | null;
  lastSyncedAt: Date | null;
  syncNow: () => Promise<void>;
}

const STORAGE_KEY = 'moto_ledger_data_v1';
const USER_KEY = 'moto_ledger_user_v1';
const CONCEPT_KEY = 'moto_ledger_concept_v1';
const COMMUNITY_KEY = 'moto_ledger_community_v1';

const GarageContext = createContext<GarageContextType | null>(null);

export function GarageProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [designConcept, setDesignConceptState] = useState<DesignConcept>('garage_pro');
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [serviceLogs, setServiceLogs] = useState<ServiceRecord[]>(INITIAL_SERVICE_LOGS);
  const [communityPresets, setCommunityPresets] = useState<CommunityPreset[]>(INITIAL_COMMUNITY_PRESETS);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Облачная синхронизация между устройствами
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const isSyncingRef = useRef(false);
  const initialSyncDoneRef = useRef(false);
  const skipNextPushRef = useRef(false);
  const vehiclesRef = useRef(vehicles);
  const serviceLogsRef = useRef(serviceLogs);

  useEffect(() => {
    vehiclesRef.current = vehicles;
  }, [vehicles]);

  useEffect(() => {
    serviceLogsRef.current = serviceLogs;
  }, [serviceLogs]);

  // Сохранение изменений в облако
  const pushToCloud = useCallback(async (email: string, currentVehicles: Vehicle[], currentLogs: ServiceRecord[]) => {
    if (!email || email.includes('гость')) return;
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setSyncStatus('syncing');

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          vehicles: currentVehicles,
          serviceLogs: currentLogs,
          updatedAt: Date.now(),
        }),
      });
      const result = await res.json();

      if (!result.configured) {
        setSyncStatus('unconfigured');
        setSyncMessage('Облачное хранилище не подключено на Vercel (Blob/KV)');
        return;
      }

      if (!res.ok || !result.success) {
        console.error('Failed to push to cloud:', result.error);
        setSyncStatus('error');
        setSyncMessage(result.error || 'Ошибка сохранения в облако');
        return;
      }

      if (result.conflict && result.cloudData) {
        // Конфликт: в облаке есть более свежие изменения с другого устройства
        const cloudVehicles = result.cloudData.vehicles || [];
        const cloudLogs = result.cloudData.serviceLogs || [];
        skipNextPushRef.current = true;
        setVehicles(cloudVehicles);
        setServiceLogs(cloudLogs);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ vehicles: cloudVehicles, serviceLogs: cloudLogs }));
        } catch {}
      }

      setSyncStatus('synced');
      setLastSyncedAt(new Date());
      setSyncMessage(null);
    } catch (err) {
      console.error('Failed to push to cloud:', err);
      setSyncStatus('offline');
      setSyncMessage('Офлайн: изменения сохранены на устройстве');
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Получение актуального состояния гаража из облака
  const pullFromCloud = useCallback(async (email: string) => {
    if (!email || email.includes('гость')) return;
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setSyncStatus('syncing');

    try {
      const res = await fetch(`/api/sync?email=${encodeURIComponent(email)}`, {
        cache: 'no-store',
      });
      const result = await res.json();

      if (!result.configured) {
        setSyncStatus('unconfigured');
        setSyncMessage('Облачное хранилище не подключено на Vercel (Blob/KV)');
        return;
      }

      if (!res.ok) {
        console.error('Cloud pull failed:', result.error);
        setSyncStatus('error');
        setSyncMessage(result.error || 'Ошибка чтения из облака');
        return;
      }

      if (result.found && result.data) {
        const cloudVehicles = Array.isArray(result.data.vehicles) ? result.data.vehicles : [];
        const cloudLogs = Array.isArray(result.data.serviceLogs) ? result.data.serviceLogs : [];

        skipNextPushRef.current = true;
        setVehicles(cloudVehicles);
        setServiceLogs(cloudLogs);

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ vehicles: cloudVehicles, serviceLogs: cloudLogs }));
        } catch {}

        setSyncStatus('synced');
        setLastSyncedAt(new Date(result.data.updatedAt || Date.now()));
        setSyncMessage(null);
      } else {
        // В облаке ещё нет данных для этого email
        setSyncStatus('synced');
        setSyncMessage(null);
        // Если на этом устройстве уже есть техника, инициализируем облако
        const currentV = vehiclesRef.current;
        const currentL = serviceLogsRef.current;
        if (currentV.length > 0) {
          isSyncingRef.current = false;
          await pushToCloud(email, currentV, currentL);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to pull from cloud:', err);
      setSyncStatus('offline');
      setSyncMessage('Офлайн режим (синхронизация при появлении сети)');
    } finally {
      isSyncingRef.current = false;
      initialSyncDoneRef.current = true;
    }
  }, [pushToCloud]);

  const syncNow = async () => {
    if (!user || user.isGuest) return;
    await pullFromCloud(user.email);
  };

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const storedConcept = localStorage.getItem(CONCEPT_KEY);
      if (storedConcept === 'garage_pro' || storedConcept === 'swiss_minimal' || storedConcept === 'cockpit') {
        setDesignConceptState(storedConcept);
      }

      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const storedComm = localStorage.getItem(COMMUNITY_KEY);
      if (storedComm) {
        const parsed = JSON.parse(storedComm);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCommunityPresets(parsed);
        }
      }

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

  // Save community presets
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(COMMUNITY_KEY, JSON.stringify(communityPresets));
    } catch (e) {
      console.error('Failed to save community presets to localStorage', e);
    }
  }, [communityPresets, isHydrated]);

  // Save concept
  const setDesignConcept = (concept: DesignConcept) => {
    setDesignConceptState(concept);
    try {
      localStorage.setItem(CONCEPT_KEY, concept);
    } catch {}
  };

  // Save data to localStorage when state changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ vehicles, serviceLogs }));
    } catch (e) {
      console.error('Failed to save garage data to localStorage', e);
    }
  }, [vehicles, serviceLogs, isHydrated]);

  // Save user session
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  }, [user, isHydrated]);

  // 1. Автоматический Pull при монтировании сессии
  useEffect(() => {
    if (!isHydrated || !user || user.isGuest) return;
    pullFromCloud(user.email);
  }, [isHydrated, user?.email, pullFromCloud]);

  // 2. Фоновая синхронизация при возврате на вкладку (переключение между телефоном и ПК)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user && !user.isGuest) {
        pullFromCloud(user.email);
      }
    };
    const handleOnline = () => {
      if (user && !user.isGuest) {
        pullFromCloud(user.email);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [user, pullFromCloud]);

  // 3. Отложенный Push в облако при изменении техники или записей ТО
  useEffect(() => {
    if (!isHydrated || !user || user.isGuest) return;
    if (!initialSyncDoneRef.current) return;
    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      pushToCloud(user.email, vehicles, serviceLogs);
    }, 1200);
    return () => clearTimeout(timer);
  }, [vehicles, serviceLogs, isHydrated, user?.email, user?.isGuest, pushToCloud]);

  const login = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const newUser = { email: cleanEmail, isGuest: false };
    initialSyncDoneRef.current = false;
    setUser(newUser);
    await pullFromCloud(cleanEmail);
  };

  const loginAsGuest = () => {
    setUser({ email: 'гость (офлайн)', isGuest: true });
    setSyncStatus('idle');
  };

  const logout = () => {
    setUser(null);
    initialSyncDoneRef.current = false;
    setSyncStatus('idle');
    setSyncMessage(null);
  };

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

  const archiveVehicle = (vehicleId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, isArchived: true, archivedDate: today } : v))
    );
    if (selectedVehicleId === vehicleId) {
      setSelectedVehicleId(null);
    }
  };

  const unarchiveVehicle = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, isArchived: false, archivedDate: undefined } : v))
    );
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

  const clearAllData = () => {
    setVehicles([]);
    setServiceLogs([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear garage data', e);
    }
  };

  const loadDemoFleet = () => {
    setVehicles(DEMO_VEHICLES);
    setServiceLogs(DEMO_SERVICE_LOGS);
  };

  const resetAllData = () => {
    clearAllData();
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

  const shareToCommunity = (vehicleId: string, authorName: string): boolean => {
    const target = vehicles.find((v) => v.id === vehicleId);
    if (!target) return false;

    const newPreset: CommunityPreset = {
      id: 'comm-' + Date.now(),
      name: target.name,
      category: target.category,
      primaryMetric: target.primaryMetric,
      author: authorName.trim() || 'Гаражный механик',
      verifiedCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
      specs: { ...target.specs },
      rules: target.rules.map((r) => ({
        name: r.name,
        intervalHours: r.intervalHours,
        intervalKm: r.intervalKm,
        intervalMonths: r.intervalMonths,
      })),
    };

    setCommunityPresets((prev) => [newPreset, ...prev]);
    return true;
  };

  const upvoteCommunityPreset = (presetId: string) => {
    setCommunityPresets((prev) =>
      prev.map((p) => (p.id === presetId ? { ...p, verifiedCount: p.verifiedCount + 1 } : p))
    );
  };

  return (
    <GarageContext.Provider
      value={{
        user,
        designConcept,
        setDesignConcept,
        vehicles,
        serviceLogs,
        communityPresets,
        isHydrated,
        selectedVehicleId,
        setSelectedVehicleId,
        updateVehicleReading,
        logService,
        updateQuickSpecs,
        addVehicle,
        deleteVehicle,
        archiveVehicle,
        unarchiveVehicle,
        addRuleToVehicle,
        deleteRuleFromVehicle,
        resetAllData,
        clearAllData,
        loadDemoFleet,
        exportDataJson,
        importDataJson,
        login,
        loginAsGuest,
        logout,
        shareToCommunity,
        upvoteCommunityPreset,
        syncStatus,
        syncMessage,
        lastSyncedAt,
        syncNow,
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
