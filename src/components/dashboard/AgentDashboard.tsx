import { useNavigate } from 'react-router-dom';
import { Ticket, AlertTriangle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import KPITile from '../common/KPITile';
import StatusChip from '../common/StatusChip';
import PriorityChip from '../common/PriorityChip';
import SLATimer from '../common/SLATimer';
import AgingChart from '../charts/AgingChart';
import AgenticAISection from '../ai/AgenticAISection';
import VoiceOfCustomer from './VoiceOfCustomer';
import CustomerPainPoints from './CustomerPainPoints';
import NetworkStatusPanel from './NetworkStatusPanel';
import CyberSecurityPanel from './CyberSecurityPanel';
import LiveTACCall from './LiveTACCall';
import EndpointHealthPanel from './EndpointHealthPanel';
import { useApp } from '../../context/AppContext';
import { mockService } from '../../data/mockService';
import type { AgenticProps } from '../../pages/DashboardPage';

export default function AgentDashboard({ agenticProps }: { agenticProps: AgenticProps }) {
  const { tickets } = useApp();
  const navigate = useNavigate();
  const kpis = mockService.getKPIs(tickets);
  const urgentTickets = tickets
    .filter(t => (t.slaBreached || t.slaAtRisk) && (t.status === 'open' || t.status === 'in_progress'))
    .sort((a, b) => (b.slaBreached ? 1 : 0) - (a.slaBreached ? 1 : 0))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile title="Open Tickets" value={kpis.openCount} icon={Ticket} subtitle="Assigned to you & team" trend="up" trendValue="+12%" />
        <KPITile title="SLA Breached" value={kpis.breachedSLA} icon={AlertTriangle} variant={kpis.breachedSLA > 0 ? 'danger' : 'success'} subtitle="Immediate attention needed" />
        <KPITile title="At Risk" value={kpis.atRiskSLA} icon={Clock} variant={kpis.atRiskSLA > 5 ? 'warning' : 'default'} subtitle="SLA at risk" />
        <KPITile title="Resolved Today" value={kpis.newToday} icon={CheckCircle} variant="success" subtitle="First contact resolution" />
      </div>

      <LiveTACCall />
      <EndpointHealthPanel />
      <NetworkStatusPanel />
      <CyberSecurityPanel />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
          <div className="px-4 py-3 border-b border-deloitte-light-gray/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-deloitte-black">SLA Urgent Queue</h3>
              <span className="text-xs text-deloitte-med-gray text-deloitte-med-gray/70">({urgentTickets.length} tickets)</span>
            </div>
            <button onClick={() => navigate('/tickets')} className="text-xs text-deloitte-green font-medium hover:text-deloitte-green/80">View all →</button>
          </div>
          <div className="divide-y divide-deloitte-light-gray/30">
            {urgentTickets.length === 0 && (
              <div className="px-4 py-5 text-center text-deloitte-med-gray text-sm">No urgent tickets. Great work!</div>
            )}
            {urgentTickets.map(t => {
              const customer = mockService.getCustomerById(t.customerId);
              return (
                <div
                  key={t.id}
                  className={`px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-deloitte-light-gray/20 transition-colors ${t.slaBreached ? 'border-l-2 border-l-red-500' : t.slaAtRisk ? 'border-l-2 border-l-amber-400' : ''}`}
                  onClick={() => navigate(`/tickets/${t.id}`)}
                >
                  <span className="text-xs font-mono text-deloitte-med-gray/70 shrink-0 w-16">{t.id}</span>
                  {customer?.isVIP && (
                    <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-1 py-0.5 rounded font-semibold shrink-0">VIP</span>
                  )}
                  <p className="text-xs font-medium text-deloitte-black truncate flex-1 min-w-0">{t.subject}</p>
                  <span className="text-xs text-deloitte-med-gray/60 shrink-0 hidden sm:block">{customer?.company}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <PriorityChip priority={t.priority} size="sm" />
                    <StatusChip status={t.status} size="sm" />
                    <SLATimer dueAt={t.slaDueAt} breached={t.slaBreached} atRisk={t.slaAtRisk} compact />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
          <h3 className="font-semibold text-deloitte-black mb-1">Backlog Aging</h3>
          <p className="text-xs text-deloitte-med-gray mb-4">Open ticket age distribution</p>
          <AgingChart buckets={kpis.agingBuckets} />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {Object.entries(kpis.agingBuckets).map(([bucket, count]) => (
              <div key={bucket} className="text-center bg-deloitte-light-gray/30 rounded-lg p-2">
                <div className="text-sm font-bold text-deloitte-black">{count}</div>
                <div className="text-xs text-deloitte-med-gray">{bucket}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-deloitte-green/10 rounded-lg flex items-center justify-center"><Clock size={16} className="text-deloitte-green" /></div>
            <div>
              <p className="text-xs text-deloitte-med-gray">Mean Time to Acknowledge</p>
              <p className="text-xl font-bold text-deloitte-black">{kpis.mtta}m</p>
            </div>
          </div>
          <div className="h-1.5 bg-deloitte-light-gray/60 rounded-full"><div className="h-1.5 bg-deloitte-green rounded-full" style={{ width: `${Math.min(100, 100 - (kpis.mtta / 60) * 100)}%` }} /></div>
          <p className="text-xs text-deloitte-med-gray mt-1.5">Target: &lt; 30 min</p>
        </div>
        <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-deloitte-green/10 rounded-lg flex items-center justify-center"><CheckCircle size={16} className="text-deloitte-green" /></div>
            <div>
              <p className="text-xs text-deloitte-med-gray">Mean Time to Resolve</p>
              <p className="text-xl font-bold text-deloitte-black">{kpis.mttr}h</p>
            </div>
          </div>
          <div className="h-1.5 bg-deloitte-light-gray/60 rounded-full"><div className="h-1.5 bg-deloitte-green rounded-full" style={{ width: `${Math.min(100, 100 - (kpis.mttr / 24) * 50)}%` }} /></div>
          <p className="text-xs text-deloitte-med-gray mt-1.5">Target: &lt; 6 hours</p>
        </div>
        <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center"><TrendingUp size={16} className="text-amber-600" /></div>
            <div>
              <p className="text-xs text-deloitte-med-gray">First Contact Resolution</p>
              <p className="text-xl font-bold text-deloitte-black">{kpis.fcrRate}%</p>
            </div>
          </div>
          <div className="h-1.5 bg-deloitte-light-gray/60 rounded-full"><div className="h-1.5 bg-amber-500 rounded-full" style={{ width: `${kpis.fcrRate}%` }} /></div>
          <p className="text-xs text-deloitte-med-gray mt-1.5">Target: &gt; 80%</p>
        </div>
      </div>

      <CustomerPainPoints />
      <VoiceOfCustomer compact />

      <AgenticAISection {...agenticProps} />
    </div>
  );
}
