import { useState } from 'react';
import { Shield, ShieldCheck, Bug, Lock, Database, UserX, ChevronDown, ChevronUp, AlertCircle, ShieldAlert } from 'lucide-react';
import { mockService } from '../../data/mockService';
import type { CyberSecurityAlert, CyberAlertSeverity, CyberAlertCategory } from '../../types';

const SEVERITY_CONFIG: Record<CyberAlertSeverity, {
  label: string;
  dot: string;
  text: string;
  badge: string;
  bar: string;
  order: number;
}> = {
  critical: { label: 'C', dot: 'bg-red-600',    text: 'text-red-700',    badge: 'bg-red-50 border-red-200 text-red-700',       bar: 'bg-red-500',    order: 0 },
  high:     { label: 'H', dot: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-50 border-orange-200 text-orange-700', bar: 'bg-orange-400', order: 1 },
  medium:   { label: 'M', dot: 'bg-amber-400',  text: 'text-amber-700',  badge: 'bg-amber-50 border-amber-200 text-amber-700',  bar: 'bg-amber-400',  order: 2 },
  low:      { label: 'L', dot: 'bg-slate-400',  text: 'text-slate-600',  badge: 'bg-slate-50 border-slate-200 text-slate-600',  bar: 'bg-slate-300',  order: 3 },
};

const CATEGORY_CONFIG: Record<CyberAlertCategory, { label: string; icon: React.ElementType }> = {
  threat:        { label: 'Threat',   icon: ShieldAlert },
  vulnerability: { label: 'Vuln',    icon: Bug },
  compliance:    { label: 'Comply',  icon: AlertCircle },
  access:        { label: 'Access',  icon: UserX },
  data:          { label: 'Data',    icon: Database },
};

const STATUS_CONFIG: Record<CyberSecurityAlert['status'], { label: string; dot: string }> = {
  active:        { label: 'Active',        dot: 'bg-red-500 animate-pulse' },
  investigating: { label: 'Investigating', dot: 'bg-amber-400 animate-pulse' },
  mitigated:     { label: 'Mitigated',     dot: 'bg-blue-400' },
  resolved:      { label: 'Resolved',      dot: 'bg-deloitte-green' },
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function AlertRow({ alert }: { alert: CyberSecurityAlert }) {
  const sev = SEVERITY_CONFIG[alert.severity];
  const cat = CATEGORY_CONFIG[alert.category];
  const status = STATUS_CONFIG[alert.status];
  const CatIcon = cat.icon;

  return (
    <div className="flex items-center gap-2 px-3 py-2 hover:bg-deloitte-light-gray/10 transition-colors">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sev.dot}`} />
      <CatIcon size={11} className="shrink-0 text-deloitte-med-gray" />
      <span className="text-xs text-deloitte-black truncate flex-1 min-w-0">{alert.title}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`flex items-center gap-1 text-xs`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          <span className="text-deloitte-med-gray text-xs">{status.label}</span>
        </span>
        <span className={`text-xs font-bold px-1 py-0.5 rounded border ${sev.badge}`}>{sev.label}</span>
        <span className="text-xs text-deloitte-med-gray/60 w-5 text-right">{formatRelativeTime(alert.detectedAt)}</span>
      </div>
    </div>
  );
}

export default function CyberSecurityPanel() {
  const alerts = mockService.getCyberAlerts();
  const [expanded, setExpanded] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  const sorted = [...alerts].sort((a, b) => SEVERITY_CONFIG[a.severity].order - SEVERITY_CONFIG[b.severity].order);
  const active = sorted.filter(a => a.status !== 'resolved');
  const resolved = sorted.filter(a => a.status === 'resolved');

  const counts = {
    critical: active.filter(a => a.severity === 'critical').length,
    high:     active.filter(a => a.severity === 'high').length,
    medium:   active.filter(a => a.severity === 'medium').length,
    low:      active.filter(a => a.severity === 'low').length,
  };

  const criticalCount = counts.critical;
  const highCount = counts.high;

  const headerStatus = criticalCount > 0
    ? { label: `${criticalCount} Critical`, dotClass: 'bg-red-600 animate-pulse', textClass: 'text-red-700', bgClass: 'bg-red-50 border-red-200' }
    : highCount > 0
    ? { label: `${highCount} High`, dotClass: 'bg-orange-500 animate-pulse', textClass: 'text-orange-700', bgClass: 'bg-orange-50 border-orange-200' }
    : active.length > 0
    ? { label: `${active.length} Active`, dotClass: 'bg-amber-500', textClass: 'text-amber-700', bgClass: 'bg-amber-50 border-amber-200' }
    : { label: 'Secure', dotClass: 'bg-deloitte-green', textClass: 'text-green-700', bgClass: 'bg-green-50 border-green-200' };

  const total = active.length || 1;

  return (
    <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-deloitte-light-gray/10 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <Shield size={15} className="text-deloitte-dark-gray shrink-0" />
        <span className="font-semibold text-sm text-deloitte-black">Cyber Security</span>
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${headerStatus.bgClass} ${headerStatus.textClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${headerStatus.dotClass}`} />
          {headerStatus.label}
        </span>

        {active.length > 0 && (
          <div className="ml-auto flex items-center gap-1 mr-1">
            {counts.critical > 0 && <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">{counts.critical}C</span>}
            {counts.high > 0 && <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">{counts.high}H</span>}
            {counts.medium > 0 && <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">{counts.medium}M</span>}
            {counts.low > 0 && <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">{counts.low}L</span>}
          </div>
        )}

        {expanded ? <ChevronUp size={14} className="text-deloitte-med-gray shrink-0" /> : <ChevronDown size={14} className="text-deloitte-med-gray shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-deloitte-light-gray/60">
          {alerts.length === 0 ? (
            <div className="px-4 py-4 text-center text-sm text-deloitte-med-gray flex items-center justify-center gap-2">
              <ShieldCheck size={16} className="text-deloitte-green" />
              <span>No active security alerts</span>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <div className="flex h-1 w-full">
                  {counts.critical > 0 && <div className="bg-red-500 transition-all" style={{ width: `${(counts.critical / total) * 100}%` }} />}
                  {counts.high > 0 && <div className="bg-orange-400 transition-all" style={{ width: `${(counts.high / total) * 100}%` }} />}
                  {counts.medium > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${(counts.medium / total) * 100}%` }} />}
                  {counts.low > 0 && <div className="bg-slate-300 transition-all" style={{ width: `${(counts.low / total) * 100}%` }} />}
                </div>
              )}

              <div className="divide-y divide-deloitte-light-gray/30">
                {active.map(a => <AlertRow key={a.id} alert={a} />)}
              </div>

              {resolved.length > 0 && (
                <>
                  <button
                    className="w-full px-3 py-1.5 flex items-center gap-1.5 border-t border-deloitte-light-gray/40 hover:bg-deloitte-light-gray/10 transition-colors"
                    onClick={e => { e.stopPropagation(); setShowResolved(v => !v); }}
                  >
                    <ShieldCheck size={11} className="text-deloitte-green" />
                    <span className="text-xs text-deloitte-med-gray">{resolved.length} resolved</span>
                    {showResolved ? <ChevronUp size={11} className="text-deloitte-med-gray ml-auto" /> : <ChevronDown size={11} className="text-deloitte-med-gray ml-auto" />}
                  </button>
                  {showResolved && (
                    <div className="divide-y divide-deloitte-light-gray/30 bg-deloitte-light-gray/5">
                      {resolved.map(a => <AlertRow key={a.id} alert={a} />)}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
