import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, Ticket, Star } from 'lucide-react';
import KPITile from '../common/KPITile';
import ChannelChart from '../charts/ChannelChart';
import CategoryDonut from '../charts/CategoryDonut';
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

export default function ManagerDashboard({ agenticProps }: { agenticProps: AgenticProps }) {
  const { tickets, setFilters } = useApp();
  const navigate = useNavigate();
  const kpis = mockService.getKPIs(tickets);
  const agents = mockService.getAgents();
  const channelMetrics = mockService.getChannelMetrics();
  const categoryData = mockService.getCategoryBreakdown(tickets);

  const agentStats = agents.filter(a => a.role === 'agent').map(agent => {
    const agentTickets = tickets.filter(t => t.assigneeId === agent.id);
    const openCount = agentTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const breached = agentTickets.filter(t => t.slaBreached).length;
    const utilization = Math.round((agent.currentLoad / agent.maxLoad) * 100);
    return { agent, openCount, breached, utilization };
  });

  const handleCategoryClick = (category: string) => {
    setFilters({ category });
    navigate('/tickets');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile title="Open Tickets" value={kpis.openCount} icon={Ticket} subtitle={`${kpis.newToday} new today`} trend="up" trendValue="+8%" />
        <KPITile title="SLA Breached" value={kpis.breachedSLA} icon={AlertTriangle} variant={kpis.breachedSLA > 5 ? 'danger' : 'warning'} subtitle="Active breaches" onClick={() => { setFilters({ status: 'open' }); navigate('/tickets'); }} />
        <KPITile title="At-Risk SLA" value={kpis.atRiskSLA} icon={Clock} variant={kpis.atRiskSLA > 10 ? 'warning' : 'default'} subtitle="Approaching deadline" />
        <KPITile title="Avg CSAT" value={kpis.csat.toFixed(1)} icon={Star} variant={kpis.csat >= 4 ? 'success' : kpis.csat >= 3.5 ? 'warning' : 'danger'} subtitle="Last 30 days" />
      </div>

      <LiveTACCall />
      <EndpointHealthPanel />
      <NetworkStatusPanel />
      <CyberSecurityPanel />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-deloitte-black">Contact Volume by Channel</h3>
              <p className="text-xs text-deloitte-med-gray mt-0.5">Last 7 days</p>
            </div>
          </div>
          <ChannelChart data={channelMetrics} />
        </div>

        <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-deloitte-black">Top Contact Drivers</h3>
              <p className="text-xs text-deloitte-med-gray mt-0.5">Click a segment to filter tickets</p>
            </div>
          </div>
          <CategoryDonut data={categoryData} onSliceClick={handleCategoryClick} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
          <div className="px-5 py-4 border-b border-deloitte-light-gray/60">
            <h3 className="font-semibold text-deloitte-black">Agent Workload</h3>
            <p className="text-xs text-deloitte-med-gray mt-0.5">Queue load and SLA performance</p>
          </div>
          <div className="divide-y divide-deloitte-light-gray/40">
            {agentStats.map(({ agent, openCount, breached, utilization }) => (
              <div key={agent.id} className="px-5 py-3 flex items-center gap-4">
                <div className="w-8 h-8 bg-deloitte-green rounded-full flex items-center justify-center text-deloitte-black text-xs font-bold shrink-0">
                  {agent.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-deloitte-black">{agent.name}</p>
                    {!agent.isOnline && <span className="text-xs bg-deloitte-light-gray/60 text-deloitte-dark-gray px-1.5 rounded">Offline</span>}
                    {breached > 0 && <span className="text-xs bg-red-100 text-red-700 px-1.5 rounded">{breached} breached</span>}
                  </div>
                  <p className="text-xs text-deloitte-med-gray">{agent.team}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-bold text-deloitte-black">{openCount}</p>
                    <p className="text-xs text-deloitte-med-gray">Open</p>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-deloitte-dark-gray">{utilization}%</span>
                    </div>
                    <div className="h-1.5 bg-deloitte-light-gray/60 rounded-full">
                      <div
                        className={`h-1.5 rounded-full ${utilization > 90 ? 'bg-red-500' : utilization > 70 ? 'bg-amber-500' : 'bg-deloitte-green'}`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
          <h3 className="font-semibold text-deloitte-black mb-1">Backlog Aging</h3>
          <p className="text-xs text-deloitte-med-gray mb-4">Open tickets by age</p>
          <AgingChart buckets={kpis.agingBuckets} />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-deloitte-light-gray/30 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-deloitte-black">{kpis.fcrRate}%</p>
              <p className="text-xs text-deloitte-med-gray">FCR Rate</p>
            </div>
            <div className="bg-deloitte-light-gray/30 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-deloitte-black">{kpis.reopenRate}%</p>
              <p className="text-xs text-deloitte-med-gray">Reopen Rate</p>
            </div>
            <div className="bg-deloitte-light-gray/30 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-deloitte-black">{kpis.mtta}m</p>
              <p className="text-xs text-deloitte-med-gray">Avg MTTA</p>
            </div>
            <div className="bg-deloitte-light-gray/30 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-deloitte-black">{kpis.mttr}h</p>
              <p className="text-xs text-deloitte-med-gray">Avg MTTR</p>
            </div>
          </div>
        </div>
      </div>

      <CustomerPainPoints />
      <VoiceOfCustomer compact />

      <AgenticAISection {...agenticProps} />
    </div>
  );
}
