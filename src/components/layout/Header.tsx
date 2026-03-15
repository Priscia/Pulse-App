import { Bell, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { mockService } from '../../data/mockService';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { tickets, refreshTickets } = useApp();
  const navigate = useNavigate();
  const kpis = mockService.getKPIs(tickets);
  const incidents = mockService.getIncidents().filter(i => i.status !== 'resolved');
  const alertCount = kpis.breachedSLA + incidents.length;

  return (
    <header className="bg-white border-b border-deloitte-light-gray px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-deloitte-black">{title}</h1>
        {subtitle && <p className="text-sm text-deloitte-med-gray mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={refreshTickets}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-deloitte-dark-gray hover:text-deloitte-black hover:bg-deloitte-light-gray/40 rounded-lg transition-all"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button
          onClick={() => navigate('/incidents')}
          className="relative p-2 text-deloitte-dark-gray hover:text-deloitte-black hover:bg-deloitte-light-gray/40 rounded-lg transition-all"
        >
          <Bell size={18} />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] min-h-[18px] text-[10px]">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>
        <div className="text-xs text-deloitte-med-gray hidden md:block">
          Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </header>
  );
}
