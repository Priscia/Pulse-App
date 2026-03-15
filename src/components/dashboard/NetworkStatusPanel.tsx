import { useState } from 'react';
import { Wifi, WifiOff, AlertTriangle, Wrench, CheckCircle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { mockService } from '../../data/mockService';
import type { NetworkUpdate, NetworkUpdateSeverity } from '../../types';

const SEVERITY_CONFIG: Record<NetworkUpdateSeverity, {
  label: string;
  icon: React.ElementType;
  dotClass: string;
  badgeClass: string;
  rowClass: string;
}> = {
  outage: {
    label: 'Outage',
    icon: WifiOff,
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    rowClass: 'border-l-red-500',
  },
  degraded: {
    label: 'Degraded',
    icon: AlertTriangle,
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    rowClass: 'border-l-amber-500',
  },
  maintenance: {
    label: 'Maintenance',
    icon: Wrench,
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    rowClass: 'border-l-blue-500',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle,
    dotClass: 'bg-deloitte-green',
    badgeClass: 'bg-green-100 text-green-700 border-green-200',
    rowClass: 'border-l-deloitte-green',
  },
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

function formatEta(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin <= 0) return 'soon';
  if (diffMin < 60) return `~${diffMin}m`;
  return `~${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
}

function NetworkUpdateRow({ update }: { update: NetworkUpdate }) {
  const cfg = SEVERITY_CONFIG[update.severity];
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 border-l-2 ${cfg.rowClass} hover:bg-deloitte-light-gray/10 transition-colors`}>
      <div className="mt-0.5 shrink-0">
        <Icon size={14} className={update.severity === 'outage' ? 'text-red-500' : update.severity === 'degraded' ? 'text-amber-500' : update.severity === 'maintenance' ? 'text-blue-500' : 'text-deloitte-green'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${cfg.badgeClass}`}>{cfg.label}</span>
          <span className="text-xs font-medium text-deloitte-black truncate">{update.title}</span>
        </div>
        <p className="text-xs text-deloitte-med-gray leading-relaxed">{update.status}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-deloitte-med-gray/80">{update.affectedRegions.join(', ')}</span>
          <span className="text-deloitte-light-gray">•</span>
          <span className="text-xs text-deloitte-med-gray/80">{update.affectedServices.slice(0, 2).join(', ')}{update.affectedServices.length > 2 ? ` +${update.affectedServices.length - 2}` : ''}</span>
          {update.estimatedResolution && update.severity !== 'resolved' && (
            <>
              <span className="text-deloitte-light-gray">•</span>
              <span className="flex items-center gap-1 text-xs text-deloitte-med-gray/80">
                <Clock size={10} />ETA {formatEta(update.estimatedResolution)}
              </span>
            </>
          )}
        </div>
      </div>
      <span className="text-xs text-deloitte-med-gray/60 shrink-0 mt-0.5">{formatRelativeTime(update.updatedAt)}</span>
    </div>
  );
}

export default function NetworkStatusPanel() {
  const updates = mockService.getNetworkUpdates();
  const [expanded, setExpanded] = useState(true);

  const activeUpdates = updates.filter(u => u.severity !== 'resolved');
  const resolvedUpdates = updates.filter(u => u.severity === 'resolved');
  const hasOutage = activeUpdates.some(u => u.severity === 'outage');
  const hasDegraded = activeUpdates.some(u => u.severity === 'degraded');

  const headerStatus = hasOutage
    ? { label: 'Service Outage', dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50 border-red-200' }
    : hasDegraded
    ? { label: 'Degraded Performance', dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' }
    : activeUpdates.length > 0
    ? { label: 'Maintenance in Progress', dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' }
    : { label: 'All Systems Operational', dot: 'bg-deloitte-green', text: 'text-green-700', bg: 'bg-green-50 border-green-200' };

  return (
    <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-deloitte-light-gray/10 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <Wifi size={15} className="text-deloitte-dark-gray shrink-0" />
        <span className="font-semibold text-sm text-deloitte-black">Network Status</span>
        <span className={`ml-1 flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${headerStatus.bg} ${headerStatus.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${headerStatus.dot} ${hasOutage || hasDegraded ? 'animate-pulse' : ''}`} />
          {headerStatus.label}
        </span>
        {activeUpdates.length > 0 && (
          <span className="ml-auto text-xs text-deloitte-med-gray mr-1">{activeUpdates.length} active</span>
        )}
        {expanded ? <ChevronUp size={14} className="text-deloitte-med-gray shrink-0" /> : <ChevronDown size={14} className="text-deloitte-med-gray shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-deloitte-light-gray/60">
          {updates.length === 0 ? (
            <div className="px-4 py-5 text-center text-sm text-deloitte-med-gray flex flex-col items-center gap-2">
              <CheckCircle size={20} className="text-deloitte-green" />
              <span>All systems are fully operational</span>
            </div>
          ) : (
            <div className="divide-y divide-deloitte-light-gray/40">
              {activeUpdates.map(u => <NetworkUpdateRow key={u.id} update={u} />)}
              {resolvedUpdates.length > 0 && (
                <>
                  {activeUpdates.length > 0 && <div className="px-4 py-1.5 bg-deloitte-light-gray/20"><span className="text-xs text-deloitte-med-gray font-medium">Recently Resolved</span></div>}
                  {resolvedUpdates.map(u => <NetworkUpdateRow key={u.id} update={u} />)}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
