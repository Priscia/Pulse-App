import { TICKETS, CUSTOMERS, AGENTS, MAJOR_INCIDENTS, KNOWLEDGE_ARTICLES, CHANNEL_METRICS, FAILED_SEARCHES, NETWORK_UPDATES, CYBER_ALERTS } from './mockData';
import type { Ticket, AppSettings, DashboardFilters } from '../types';

const STORAGE_KEY = 'cx_dashboard_tickets';
const SETTINGS_KEY = 'cx_dashboard_settings';

function loadTickets(): Ticket[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [...TICKETS];
}

function saveTickets(tickets: Ticket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {}
}

let _tickets: Ticket[] = loadTickets();

export const mockService = {
  getTickets: (filters?: Partial<DashboardFilters>): Ticket[] => {
    let result = [..._tickets];
    if (!filters) return result;
    if (filters.priority && filters.priority !== 'all') result = result.filter(t => t.priority === filters.priority);
    if (filters.status && filters.status !== 'all') result = result.filter(t => t.status === filters.status);
    if (filters.channel && filters.channel !== 'all') result = result.filter(t => t.channel === filters.channel);
    if (filters.product) result = result.filter(t => t.product === filters.product);
    if (filters.region) result = result.filter(t => t.region === filters.region);
    if (filters.assigneeId) result = result.filter(t => t.assigneeId === filters.assigneeId);
    if (filters.category) result = result.filter(t => t.category === filters.category);
    if (filters.tags && filters.tags.length > 0) result = result.filter(t => filters.tags!.some(tag => t.tags.includes(tag)));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(t => t.id.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    if (filters.dateRange) {
      const days: Record<string, number> = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 };
      const cutoff = new Date(Date.now() - days[filters.dateRange] * 86400000).toISOString();
      result = result.filter(t => t.createdAt >= cutoff);
    }
    return result;
  },

  getTicketById: (id: string): Ticket | undefined => _tickets.find(t => t.id === id),

  updateTicket: (id: string, updates: Partial<Ticket>): Ticket | undefined => {
    const idx = _tickets.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    _tickets[idx] = { ..._tickets[idx], ...updates, updatedAt: new Date().toISOString() };
    saveTickets(_tickets);
    return _tickets[idx];
  },

  bulkUpdateTickets: (ids: string[], updates: Partial<Ticket>): void => {
    ids.forEach(id => {
      const idx = _tickets.findIndex(t => t.id === id);
      if (idx !== -1) _tickets[idx] = { ..._tickets[idx], ...updates, updatedAt: new Date().toISOString() };
    });
    saveTickets(_tickets);
  },

  getCustomerById: (id: string) => CUSTOMERS.find(c => c.id === id),
  getAgentById: (id: string) => AGENTS.find(a => a.id === id),

  getKPIs: (tickets?: Ticket[]) => {
    const t = tickets || _tickets;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 86400000).toISOString();
    const open = t.filter(x => x.status === 'open' || x.status === 'in_progress' || x.status === 'pending');
    const newToday = t.filter(x => x.createdAt >= oneDayAgo);
    const breached = t.filter(x => x.slaBreached && (x.status === 'open' || x.status === 'in_progress'));
    const atRisk = t.filter(x => x.slaAtRisk && !x.slaBreached && (x.status === 'open' || x.status === 'in_progress'));
    const resolved = t.filter(x => x.resolvedAt);
    const withFirstResponse = t.filter(x => x.firstResponseAt);
    const avgMTTA = withFirstResponse.length > 0
      ? withFirstResponse.reduce((acc, x) => {
          return acc + (new Date(x.firstResponseAt!).getTime() - new Date(x.createdAt).getTime());
        }, 0) / withFirstResponse.length / 60000
      : 0;
    const avgMTTR = resolved.length > 0
      ? resolved.reduce((acc, x) => {
          return acc + (new Date(x.resolvedAt!).getTime() - new Date(x.createdAt).getTime());
        }, 0) / resolved.length / 3600000
      : 0;
    const reopened = t.filter(x => x.reopenCount > 0);
    const csatTickets = t.filter(x => x.csat !== null);
    const avgCsat = csatTickets.length > 0 ? csatTickets.reduce((a, x) => a + (x.csat || 0), 0) / csatTickets.length : 0;
    const fcrCount = resolved.filter(x => x.reopenCount === 0).length;
    const fcrRate = resolved.length > 0 ? fcrCount / resolved.length : 0;
    const agingBuckets = {
      '0-1d': open.filter(x => {
        const age = (now.getTime() - new Date(x.createdAt).getTime()) / 86400000;
        return age <= 1;
      }).length,
      '2-3d': open.filter(x => {
        const age = (now.getTime() - new Date(x.createdAt).getTime()) / 86400000;
        return age > 1 && age <= 3;
      }).length,
      '4-7d': open.filter(x => {
        const age = (now.getTime() - new Date(x.createdAt).getTime()) / 86400000;
        return age > 3 && age <= 7;
      }).length,
      '8d+': open.filter(x => {
        const age = (now.getTime() - new Date(x.createdAt).getTime()) / 86400000;
        return age > 7;
      }).length,
    };
    return {
      openCount: open.length,
      newToday: newToday.length,
      breachedSLA: breached.length,
      atRiskSLA: atRisk.length,
      mtta: Math.round(avgMTTA),
      mttr: parseFloat(avgMTTR.toFixed(1)),
      reopenRate: resolved.length > 0 ? parseFloat((reopened.length / resolved.length * 100).toFixed(1)) : 0,
      fcrRate: parseFloat((fcrRate * 100).toFixed(1)),
      csat: parseFloat(avgCsat.toFixed(2)),
      totalResolved: resolved.length,
      agingBuckets,
    };
  },

  getCategoryBreakdown: (tickets?: Ticket[]) => {
    const t = tickets || _tickets;
    const counts: Record<string, number> = {};
    t.forEach(x => { counts[x.category] = (counts[x.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  },

  getPriorityBreakdown: (tickets?: Ticket[]) => {
    const t = tickets || _tickets;
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    t.forEach(x => { counts[x.priority] = (counts[x.priority] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  },

  getStatusBreakdown: (tickets?: Ticket[]) => {
    const t = tickets || _tickets;
    const counts: Record<string, number> = {};
    t.forEach(x => { counts[x.status] = (counts[x.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  },

  getChannelBreakdown: (tickets?: Ticket[]) => {
    const t = tickets || _tickets;
    const counts: Record<string, number> = {};
    t.forEach(x => { counts[x.channel] = (counts[x.channel] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  },

  getCSATTrend: () => {
    const days = 7;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(Date.now() - (days - 1 - i) * 86400000);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        csat: parseFloat((3.8 + Math.random() * 0.8).toFixed(2)),
      };
    });
  },

  getIncidents: () => [...MAJOR_INCIDENTS],
  getIncidentById: (id: string) => MAJOR_INCIDENTS.find(i => i.id === id),
  getArticles: () => [...KNOWLEDGE_ARTICLES],
  getChannelMetrics: () => [...CHANNEL_METRICS],
  getFailedSearches: () => [...FAILED_SEARCHES],
  getCustomers: () => [...CUSTOMERS],
  getAgents: () => [...AGENTS],
  getNetworkUpdates: () => [...NETWORK_UPDATES],
  getCyberAlerts: () => [...CYBER_ALERTS],

  getSettings: (): AppSettings => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      sla: {
        criticalFirstResponse: 15, criticalResolution: 4,
        highFirstResponse: 60, highResolution: 8,
        mediumFirstResponse: 240, mediumResolution: 24,
        lowFirstResponse: 480, lowResolution: 72,
        atRiskThresholdPercent: 80,
      },
      alertRules: [
        { id: 'ar1', name: 'SLA Breach Alert', condition: 'sla_breached', threshold: 1, enabled: true, notifyRoles: ['agent', 'manager'] },
        { id: 'ar2', name: 'High Volume Spike', condition: 'hourly_volume', threshold: 20, enabled: true, notifyRoles: ['manager', 'exec'] },
        { id: 'ar3', name: 'CSAT Drop Warning', condition: 'csat_below', threshold: 3.5, enabled: true, notifyRoles: ['manager', 'exec'] },
        { id: 'ar4', name: 'VIP Ticket Unassigned', condition: 'vip_unassigned_minutes', threshold: 10, enabled: true, notifyRoles: ['manager'] },
      ],
      majorIncidentThreshold: 50,
      csatTarget: 4.2,
      fcrTarget: 80,
      mttaTarget: 30,
      mttrTarget: 6,
    };
  },

  saveSettings: (settings: AppSettings): void => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  },

  resetData: (): void => {
    localStorage.removeItem(STORAGE_KEY);
    _tickets = [...TICKETS];
  },
};
