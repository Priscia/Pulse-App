import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Users, Star, TrendingDown, Shield, Zap } from 'lucide-react';
import KPITile from '../common/KPITile';
import CSATTrendChart from '../charts/CSATTrendChart';
import CategoryDonut from '../charts/CategoryDonut';
import AgenticAISection from '../ai/AgenticAISection';
import VoiceOfCustomer from './VoiceOfCustomer';
import NetworkStatusPanel from './NetworkStatusPanel';
import CyberSecurityPanel from './CyberSecurityPanel';
import LiveTACCall from './LiveTACCall';
import EndpointHealthPanel from './EndpointHealthPanel';
import { useApp } from '../../context/AppContext';
import { mockService } from '../../data/mockService';
import type { AgenticProps } from '../../pages/DashboardPage';

export default function ExecDashboard({ agenticProps }: { agenticProps: AgenticProps }) {
  const { tickets, setFilters } = useApp();
  const navigate = useNavigate();
  const kpis = mockService.getKPIs(tickets);
  const incidents = mockService.getIncidents();
  const csatTrend = mockService.getCSATTrend();
  const customers = mockService.getCustomers();
  const vipCustomers = customers.filter(c => c.isVIP);
  const categoryData = mockService.getCategoryBreakdown(tickets);
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  const vipTickets = tickets.filter(t => {
    const customer = mockService.getCustomerById(t.customerId);
    return customer?.isVIP && (t.status === 'open' || t.status === 'in_progress');
  });

  const handleCategoryClick = (category: string) => {
    setFilters({ category });
    navigate('/tickets');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile title="Active Incidents" value={activeIncidents.length} icon={AlertTriangle} variant={activeIncidents.length > 0 ? 'danger' : 'success'} subtitle={`${activeIncidents.reduce((a, i) => a + i.customerImpactCount, 0)} customers impacted`} onClick={() => navigate('/incidents')} />
        <KPITile title="CSAT Score" value={kpis.csat.toFixed(1) + '/5'} icon={Star} variant={kpis.csat >= 4 ? 'success' : kpis.csat >= 3.5 ? 'warning' : 'danger'} subtitle="Target: 4.2" />
        <KPITile title="VIP Open Tickets" value={vipTickets.length} icon={Shield} variant={vipTickets.length > 5 ? 'warning' : 'default'} subtitle={`${vipCustomers.length} VIP accounts`} onClick={() => navigate('/tickets')} />
        <KPITile title="SLA Health" value={`${(100 - (kpis.breachedSLA / kpis.openCount * 100)).toFixed(0)}%`} icon={TrendingDown} variant={kpis.breachedSLA > 10 ? 'danger' : 'success'} subtitle={`${kpis.breachedSLA} active breaches`} />
      </div>

      <LiveTACCall />
      <EndpointHealthPanel />
      <NetworkStatusPanel />
      <CyberSecurityPanel />

      {activeIncidents.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="font-semibold text-red-800">Active Major Incidents</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeIncidents.map(inc => (
              <div
                key={inc.id}
                className="bg-white border border-red-200 rounded-xl p-4 cursor-pointer hover:border-red-400 transition-all"
                onClick={() => navigate(`/incidents/${inc.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${inc.severity === 'sev1' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}>
                    {inc.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-deloitte-med-gray">{inc.linkedTicketIds.length} linked tickets</span>
                </div>
                <p className="text-sm font-semibold text-deloitte-black mb-2">{inc.title}</p>
                <div className="flex items-center gap-4 text-xs text-deloitte-med-gray">
                  <span className="flex items-center gap-1"><Users size={11} /> {inc.customerImpactCount} affected</span>
                  <span>{inc.affectedServices.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-deloitte-black">CSAT Trend</h3>
              <p className="text-xs text-deloitte-med-gray mt-0.5">Last 7 days — target: 4.2</p>
            </div>
            <div className={`text-lg font-bold ${kpis.csat >= 4.2 ? 'text-deloitte-green' : 'text-red-600'}`}>{kpis.csat.toFixed(2)}</div>
          </div>
          <CSATTrendChart data={csatTrend} target={4.2} />
        </div>

        <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-deloitte-black">Top Contact Drivers</h3>
              <p className="text-xs text-deloitte-med-gray mt-0.5">Click to drill down</p>
            </div>
          </div>
          <CategoryDonut data={categoryData} onSliceClick={handleCategoryClick} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
          <div className="px-5 py-4 border-b border-deloitte-light-gray flex items-center justify-between">
            <h3 className="font-semibold text-deloitte-black">VIP Account Health</h3>
            <button onClick={() => navigate('/tickets')} className="text-xs text-deloitte-green font-medium hover:text-deloitte-green/80">View tickets →</button>
          </div>
          <div className="divide-y divide-deloitte-light-gray/60">
            {vipCustomers.map(customer => {
              const custTickets = vipTickets.filter(t => t.customerId === customer.id);
              const breached = tickets.filter(t => t.customerId === customer.id && t.slaBreached);
              return (
                <div key={customer.id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-deloitte-black">{customer.company}</p>
                      {customer.isRegulatory && (
                        <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded-full font-medium">Regulatory</span>
                      )}
                    </div>
                    <p className="text-xs text-deloitte-med-gray">{customer.name} • {customer.region} • {customer.slaTier.toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <p className="text-sm font-bold text-deloitte-black">{custTickets.length}</p>
                      <p className="text-xs text-deloitte-med-gray">Open</p>
                    </div>
                    {breached.length > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                        {breached.length} breach
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium text-deloitte-dark-gray">{customer.csatAvg.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-deloitte-green" />
            <h3 className="font-semibold text-deloitte-black">Strategic KPIs</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Customer Satisfaction', value: kpis.csat.toFixed(2), target: '4.2', unit: '/5', progress: (kpis.csat / 5) * 100, color: kpis.csat >= 4.2 ? 'bg-deloitte-green' : 'bg-red-500' },
              { label: 'First Contact Resolution', value: kpis.fcrRate + '%', target: '80%', unit: '', progress: kpis.fcrRate, color: kpis.fcrRate >= 80 ? 'bg-deloitte-green' : 'bg-amber-500' },
              { label: 'SLA Compliance', value: `${(100 - (kpis.breachedSLA / Math.max(kpis.openCount, 1) * 100)).toFixed(0)}%`, target: '95%', unit: '', progress: 100 - (kpis.breachedSLA / Math.max(kpis.openCount, 1) * 100), color: 'bg-deloitte-dark-gray' },
              { label: 'Mean Time to Resolve', value: kpis.mttr + 'h', target: '6h', unit: '', progress: Math.min(100, 100 - (kpis.mttr / 24) * 50), color: kpis.mttr <= 6 ? 'bg-deloitte-green' : 'bg-amber-500' },
            ].map(kpi => (
              <div key={kpi.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-deloitte-dark-gray">{kpi.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-deloitte-black">{kpi.value}</span>
                    <span className="text-xs text-deloitte-med-gray">target: {kpi.target}</span>
                  </div>
                </div>
                <div className="h-2 bg-deloitte-light-gray/60 rounded-full">
                  <div className={`h-2 rounded-full transition-all ${kpi.color}`} style={{ width: `${Math.max(0, Math.min(100, kpi.progress))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <VoiceOfCustomer compact />

      <AgenticAISection {...agenticProps} />
    </div>
  );
}
