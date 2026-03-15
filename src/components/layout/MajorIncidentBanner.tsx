import { AlertTriangle, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockService } from '../../data/mockService';

const SEV_CONFIG: Record<string, { border: string; badge: string; dot: string }> = {
  sev1: { border: 'border-red-500/60', badge: 'bg-red-500/20 text-red-400 border border-red-500/40', dot: 'bg-red-500' },
  sev2: { border: 'border-orange-500/60', badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/40', dot: 'bg-orange-500' },
  sev3: { border: 'border-amber-500/60', badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/40', dot: 'bg-amber-500' },
  sev4: { border: 'border-yellow-500/60', badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40', dot: 'bg-yellow-500' },
};

export default function MajorIncidentBanner() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const navigate = useNavigate();
  const incidents = mockService.getIncidents().filter(
    i => i.status !== 'resolved' && !dismissed.includes(i.id)
  );

  if (incidents.length === 0) return null;

  return (
    <div className="space-y-px">
      {incidents.map(inc => {
        const cfg = SEV_CONFIG[inc.severity] ?? SEV_CONFIG.sev4;
        return (
          <div key={inc.id} className={`bg-deloitte-black border-b ${cfg.border} px-4 py-2.5 flex items-center gap-3`}>
            <AlertTriangle size={14} className="shrink-0 text-deloitte-light-gray animate-pulse" />
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${cfg.badge}`}>
              {inc.severity.toUpperCase()}
            </span>
            <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
              <span className="text-deloitte-white text-sm font-medium truncate">{inc.title}</span>
              <span className="text-deloitte-dark-gray text-xs shrink-0">{inc.customerImpactCount} impacted</span>
            </div>
            <button
              onClick={() => navigate(`/incidents/${inc.id}`)}
              className="flex items-center gap-1 text-xs font-semibold text-deloitte-green hover:text-deloitte-green/80 border border-deloitte-green/40 hover:border-deloitte-green/70 px-3 py-1 rounded transition-all whitespace-nowrap shrink-0"
            >
              View <ChevronRight size={11} />
            </button>
            <button
              onClick={() => setDismissed(d => [...d, inc.id])}
              className="p-1 hover:bg-white/10 rounded transition-all shrink-0 text-deloitte-dark-gray hover:text-deloitte-white"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
