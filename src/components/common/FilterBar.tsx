import { Search, X, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { mockService } from '../../data/mockService';
import type { TicketPriority, TicketStatus, TicketChannel } from '../../types';

export default function FilterBar() {
  const { filters, setFilters, resetFilters } = useApp();
  const agents = mockService.getAgents();
  const products = [...new Set(mockService.getTickets().map(t => t.product))];
  const regions = [...new Set(mockService.getTickets().map(t => t.region))];
  const categories = [...new Set(mockService.getTickets().map(t => t.category))];

  const hasActiveFilters =
    filters.priority !== 'all' || filters.status !== 'all' || filters.channel !== 'all' ||
    filters.product !== '' || filters.region !== '' || filters.assigneeId !== '' ||
    filters.category !== '' || filters.search !== '';

  return (
    <div className="bg-white border-b border-deloitte-light-gray px-6 py-3 space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-deloitte-med-gray" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={filters.search}
            onChange={e => setFilters({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm border border-deloitte-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-deloitte-green focus:border-transparent"
          />
        </div>

        <select
          value={filters.priority}
          onChange={e => setFilters({ priority: e.target.value as TicketPriority | 'all' })}
          className="text-sm border border-deloitte-light-gray rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-deloitte-green text-deloitte-dark-gray"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filters.status}
          onChange={e => setFilters({ status: e.target.value as TicketStatus | 'all' })}
          className="text-sm border border-deloitte-light-gray rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-deloitte-green text-deloitte-dark-gray"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="on_hold">On Hold</option>
        </select>

        <select
          value={filters.channel}
          onChange={e => setFilters({ channel: e.target.value as TicketChannel | 'all' })}
          className="text-sm border border-deloitte-light-gray rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-deloitte-green text-deloitte-dark-gray"
        >
          <option value="all">All Channels</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="chat">Chat</option>
          <option value="web">Web</option>
          <option value="api">API</option>
        </select>

        <select
          value={filters.category}
          onChange={e => setFilters({ category: e.target.value })}
          className="text-sm border border-deloitte-light-gray rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-deloitte-green text-deloitte-dark-gray"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filters.product}
          onChange={e => setFilters({ product: e.target.value })}
          className="text-sm border border-deloitte-light-gray rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-deloitte-green text-deloitte-dark-gray"
        >
          <option value="">All Products</option>
          {products.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select
          value={filters.region}
          onChange={e => setFilters({ region: e.target.value })}
          className="text-sm border border-deloitte-light-gray rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-deloitte-green text-deloitte-dark-gray"
        >
          <option value="">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          value={filters.assigneeId}
          onChange={e => setFilters({ assigneeId: e.target.value })}
          className="text-sm border border-deloitte-light-gray rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-deloitte-green text-deloitte-dark-gray"
        >
          <option value="">All Agents</option>
          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        <select
          value={filters.dateRange}
          onChange={e => setFilters({ dateRange: e.target.value as '1d' | '7d' | '30d' | '90d' })}
          className="text-sm border border-deloitte-light-gray rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-deloitte-green text-deloitte-dark-gray"
        >
          <option value="1d">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-all"
          >
            <X size={13} />
            Clear
          </button>
        )}

        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 text-xs text-deloitte-green font-medium">
            <Filter size={12} />
            Filters active
          </div>
        )}
      </div>
    </div>
  );
}
