import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Role, Ticket, DashboardFilters, AppSettings } from '../types';
import { mockService } from '../data/mockService';

interface AppUser {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}

const USERS: Record<Role, AppUser> = {
  agent: { id: 'a1', name: 'Sarah Chen', role: 'agent', avatar: 'SC' },
  manager: { id: 'a9', name: 'Priscia Kibibi', role: 'manager', avatar: 'PK' },
  exec: { id: 'exec1', name: 'Brian Whyte', role: 'exec', avatar: 'BW' },
};

interface AppContextType {
  user: AppUser | null;
  login: (role: Role) => void;
  logout: () => void;
  filters: DashboardFilters;
  setFilters: (f: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  tickets: Ticket[];
  refreshTickets: () => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  bulkUpdateTickets: (ids: string[], updates: Partial<Ticket>) => void;
  settings: AppSettings;
  saveSettings: (s: AppSettings) => void;
  selectedTicketIds: Set<string>;
  toggleTicketSelection: (id: string) => void;
  selectAllTickets: (ids: string[]) => void;
  clearSelection: () => void;
}

const DEFAULT_FILTERS: DashboardFilters = {
  priority: 'all',
  status: 'all',
  channel: 'all',
  product: '',
  region: '',
  assigneeId: '',
  category: '',
  tags: [],
  dateRange: '30d',
  search: '',
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [filters, setFiltersState] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [tickets, setTickets] = useState<Ticket[]>(() => mockService.getTickets());
  const [settings, setSettings] = useState<AppSettings>(() => mockService.getSettings());
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());

  const login = useCallback((role: Role) => setUser(USERS[role]), []);
  const logout = useCallback(() => setUser(null), []);

  const setFilters = useCallback((f: Partial<DashboardFilters>) => {
    setFiltersState(prev => ({ ...prev, ...f }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);

  const refreshTickets = useCallback(() => {
    setTickets(mockService.getTickets());
  }, []);

  const updateTicket = useCallback((id: string, updates: Partial<Ticket>) => {
    mockService.updateTicket(id, updates);
    refreshTickets();
  }, [refreshTickets]);

  const bulkUpdateTickets = useCallback((ids: string[], updates: Partial<Ticket>) => {
    mockService.bulkUpdateTickets(ids, updates);
    refreshTickets();
    setSelectedTicketIds(new Set());
  }, [refreshTickets]);

  const saveSettings = useCallback((s: AppSettings) => {
    mockService.saveSettings(s);
    setSettings(s);
  }, []);

  const toggleTicketSelection = useCallback((id: string) => {
    setSelectedTicketIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllTickets = useCallback((ids: string[]) => {
    setSelectedTicketIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => setSelectedTicketIds(new Set()), []);

  const filteredTickets = useMemo(() => mockService.getTickets(filters), [tickets, filters]);

  const value: AppContextType = {
    user, login, logout,
    filters, setFilters, resetFilters,
    tickets: filteredTickets,
    refreshTickets, updateTicket, bulkUpdateTickets,
    settings, saveSettings,
    selectedTicketIds, toggleTicketSelection, selectAllTickets, clearSelection,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
