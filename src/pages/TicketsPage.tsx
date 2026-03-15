import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  CheckSquare, Square, UserCheck, Tag, X, Star, Archive, type LucideIcon
} from 'lucide-react';
import Header from '../components/layout/Header';
import FilterBar from '../components/common/FilterBar';
import StatusChip from '../components/common/StatusChip';
import PriorityChip from '../components/common/PriorityChip';
import SLATimer from '../components/common/SLATimer';
import { useApp } from '../context/AppContext';
import { mockService } from '../data/mockService';
import type { Ticket, TicketStatus, TicketPriority } from '../types';

const PAGE_SIZE = 20;

type SortField = 'id' | 'subject' | 'priority' | 'status' | 'createdAt' | 'slaDueAt' | 'impactScore';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<TicketPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export default function TicketsPage() {
  const { tickets, selectedTicketIds, toggleTicketSelection, selectAllTickets, clearSelection, bulkUpdateTickets } = useApp();
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    return [...tickets].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'priority': cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]; break;
        case 'createdAt': cmp = a.createdAt.localeCompare(b.createdAt); break;
        case 'slaDueAt': cmp = a.slaDueAt.localeCompare(b.slaDueAt); break;
        case 'impactScore': cmp = a.impactScore - b.impactScore; break;
        case 'subject': cmp = a.subject.localeCompare(b.subject); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        default: cmp = a.id.localeCompare(b.id);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [tickets, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds = paged.map(t => t.id);
  const allSelected = pageIds.length > 0 && pageIds.every(id => selectedTicketIds.has(id));

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={12} className="text-deloitte-light-gray" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-deloitte-green" /> : <ChevronDown size={12} className="text-deloitte-green" />;
  };

  const toggleAll = () => {
    if (allSelected) clearSelection();
    else selectAllTickets(pageIds);
  };

  const selectedList = Array.from(selectedTicketIds);

  return (
    <div>
      <Header title="Ticket Queue" subtitle={`${sorted.length} tickets matching current filters`} />
      <FilterBar />

      {selectedList.length > 0 && (
        <div className="bg-deloitte-black text-white px-6 py-3 flex items-center gap-4">
          <span className="text-sm font-medium">{selectedList.length} tickets selected</span>
          <div className="flex items-center gap-2 ml-2">
            <BulkButton icon={UserCheck} label="Assign" onClick={() => { bulkUpdateTickets(selectedList, { assigneeId: 'a1' }); }} />
            <BulkButton icon={Tag} label="Tag: VIP" onClick={() => { bulkUpdateTickets(selectedList, {}); }} />
            <BulkButton icon={Archive} label="Close" onClick={() => { bulkUpdateTickets(selectedList, { status: 'closed' as TicketStatus }); }} />
            <BulkButton icon={Star} label="Priority: High" onClick={() => { bulkUpdateTickets(selectedList, { priority: 'high' as TicketPriority }); }} />
          </div>
          <button onClick={clearSelection} className="ml-auto p-1 hover:bg-white/20 rounded transition-all">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white border-b border-deloitte-light-gray overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-deloitte-light-gray bg-deloitte-light-gray/20">
              <th className="w-10 px-4 py-3">
                <button onClick={toggleAll} className="text-deloitte-med-gray hover:text-deloitte-dark-gray">
                  {allSelected ? <CheckSquare size={16} className="text-deloitte-green" /> : <Square size={16} />}
                </button>
              </th>
              <SortHeader label="ID" field="id" onSort={handleSort} Icon={SortIcon} />
              <SortHeader label="Subject" field="subject" onSort={handleSort} Icon={SortIcon} />
              <SortHeader label="Priority" field="priority" onSort={handleSort} Icon={SortIcon} />
              <SortHeader label="Status" field="status" onSort={handleSort} Icon={SortIcon} />
              <th className="px-4 py-3 text-left text-xs font-semibold text-deloitte-dark-gray uppercase tracking-wide">Channel</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-deloitte-dark-gray uppercase tracking-wide">Assignee</th>
              <SortHeader label="SLA Due" field="slaDueAt" onSort={handleSort} Icon={SortIcon} />
              <SortHeader label="Impact" field="impactScore" onSort={handleSort} Icon={SortIcon} />
              <SortHeader label="Created" field="createdAt" onSort={handleSort} Icon={SortIcon} />
            </tr>
          </thead>
          <tbody className="divide-y divide-deloitte-light-gray/40">
            {paged.map(t => <TicketRow key={t.id} ticket={t} selected={selectedTicketIds.has(t.id)} onSelect={() => toggleTicketSelection(t.id)} onClick={() => navigate(`/tickets/${t.id}`)} />)}
          </tbody>
        </table>
        {paged.length === 0 && (
          <div className="text-center py-16 text-deloitte-med-gray">
            <p className="text-sm">No tickets match your current filters.</p>
          </div>
        )}
      </div>

      <div className="bg-white border-t border-deloitte-light-gray px-6 py-3 flex items-center justify-between text-sm text-deloitte-dark-gray">
        <span>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 hover:bg-deloitte-light-gray/40 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={16} />
          </button>
          <span className="font-medium">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 hover:bg-deloitte-light-gray/40 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SortHeader({ label, field, onSort, Icon }: { label: string; field: SortField; onSort: (f: SortField) => void; Icon: React.ComponentType<{ field: SortField }> }) {
  return (
    <th className="px-4 py-3 text-left">
      <button onClick={() => onSort(field)} className="flex items-center gap-1 text-xs font-semibold text-deloitte-dark-gray uppercase tracking-wide hover:text-deloitte-black transition-colors">
        {label} <Icon field={field} />
      </button>
    </th>
  );
}

function BulkButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-all">
      <Icon size={13} /> {label}
    </button>
  );
}

function TicketRow({ ticket: t, selected, onSelect, onClick }: { ticket: Ticket; selected: boolean; onSelect: () => void; onClick: () => void }) {
  const customer = mockService.getCustomerById(t.customerId);
  const assignee = t.assigneeId ? mockService.getAgentById(t.assigneeId) : null;
  const CHANNEL_LABELS: Record<string, string> = { phone: '📞', chat: '💬', email: '✉️', web: '🌐', api: '⚡' };

  return (
    <tr className={`hover:bg-deloitte-light-gray/20 cursor-pointer transition-colors group ${selected ? 'bg-deloitte-green/5' : ''} ${t.slaBreached ? 'border-l-2 border-red-400' : t.slaAtRisk ? 'border-l-2 border-amber-400' : 'border-l-2 border-transparent'}`}>
      <td className="px-4 py-3" onClick={e => { e.stopPropagation(); onSelect(); }}>
        {selected ? <CheckSquare size={16} className="text-deloitte-green" /> : <Square size={16} className="text-deloitte-light-gray group-hover:text-deloitte-med-gray" />}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-deloitte-med-gray" onClick={onClick}>{t.id}</td>
      <td className="px-4 py-3 max-w-xs" onClick={onClick}>
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-deloitte-black truncate">{t.subject}</p>
          {customer?.isVIP && <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-1 py-0.5 rounded font-medium shrink-0">VIP</span>}
          {t.linkedIncidentId && <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-1 py-0.5 rounded font-medium shrink-0">INC</span>}
        </div>
        <p className="text-xs text-deloitte-med-gray truncate">{customer?.company} • {t.category}</p>
      </td>
      <td className="px-4 py-3" onClick={onClick}><PriorityChip priority={t.priority} size="sm" /></td>
      <td className="px-4 py-3" onClick={onClick}><StatusChip status={t.status} size="sm" /></td>
      <td className="px-4 py-3 text-sm" onClick={onClick}>
        <span className="capitalize">{CHANNEL_LABELS[t.channel]} {t.channel}</span>
      </td>
      <td className="px-4 py-3" onClick={onClick}>
        {assignee ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-deloitte-green rounded-full flex items-center justify-center text-deloitte-black text-xs font-bold shrink-0">{assignee.avatar}</div>
            <span className="text-xs text-deloitte-dark-gray truncate">{assignee.name}</span>
          </div>
        ) : (
          <span className="text-xs text-deloitte-med-gray italic">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-3" onClick={onClick}>
        <SLATimer dueAt={t.slaDueAt} breached={t.slaBreached} atRisk={t.slaAtRisk} compact />
      </td>
      <td className="px-4 py-3" onClick={onClick}>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-1.5 bg-deloitte-light-gray/60 rounded-full">
            <div className={`h-1.5 rounded-full ${t.impactScore > 70 ? 'bg-red-500' : t.impactScore > 40 ? 'bg-amber-500' : 'bg-deloitte-green'}`} style={{ width: `${t.impactScore}%` }} />
          </div>
          <span className="text-xs text-deloitte-dark-gray">{t.impactScore}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-deloitte-med-gray" onClick={onClick}>
        {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </td>
    </tr>
  );
}
