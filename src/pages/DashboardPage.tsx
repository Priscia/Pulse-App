import { useState } from 'react';
import { Target, ClipboardList } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Header from '../components/layout/Header';
import AgentDashboard from '../components/dashboard/AgentDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import ExecDashboard from '../components/dashboard/ExecDashboard';
import SmartGoalExportModal from '../components/dashboard/SmartGoalExportModal';
import SmartGoalPlanModal from '../components/smartGoal/SmartGoalPlanModal';
import { useAgenticAI } from '../hooks/useAgenticAI';
import type { AgentMessage, AgentTask } from '../hooks/useAgenticAI';

export interface AgenticProps {
  messages: AgentMessage[];
  isRunning: boolean;
  activeTaskId: string | null;
  tasks: AgentTask[];
  onRunTask: (task: AgentTask) => void;
  onSendMessage: (content: string) => void;
  onClear: () => void;
}

export default function DashboardPage() {
  const { user, tickets } = useApp();
  const [showSmartExport, setShowSmartExport] = useState(false);
  const [showSmartPlan, setShowSmartPlan] = useState(false);

  const views = {
    agent: { title: 'My Queue', subtitle: 'Tickets assigned to you and team workload' },
    manager: { title: 'Operations Dashboard', subtitle: 'SLA performance, workload, and team health' },
    exec: { title: 'Executive Overview', subtitle: 'Customer impact, incidents, and strategic KPIs' },
  };

  const view = views[user?.role || 'agent'];
  const role = user?.role ?? 'agent';
  const { messages, isRunning, activeTaskId, tasks, runTask, sendMessage, clearMessages } = useAgenticAI(role, tickets);

  const agenticProps: AgenticProps = { messages, isRunning, activeTaskId, tasks, onRunTask: runTask, onSendMessage: sendMessage, onClear: clearMessages };

  return (
    <div>
      <Header title={view.title} subtitle={view.subtitle} />
      <div className="px-6 pt-4 pb-1 flex justify-end gap-2">
        <button
          onClick={() => setShowSmartPlan(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
        >
          <ClipboardList size={15} />
          Submit SMART Goal Plan
        </button>
        <button
          onClick={() => setShowSmartExport(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-deloitte-green/10 hover:bg-deloitte-green/20 text-deloitte-green text-sm font-medium rounded-lg border border-deloitte-green/20 hover:border-deloitte-green/40 transition-all"
        >
          <Target size={15} />
          SMART Goal Review
        </button>
      </div>
      <div className="p-6 pt-3">
        {user?.role === 'agent' && <AgentDashboard agenticProps={agenticProps} />}
        {user?.role === 'manager' && <ManagerDashboard agenticProps={agenticProps} />}
        {user?.role === 'exec' && <ExecDashboard agenticProps={agenticProps} />}
      </div>
      {showSmartExport && (
        <SmartGoalExportModal
          onClose={() => setShowSmartExport(false)}
          onOpenPlanModal={() => { setShowSmartExport(false); setShowSmartPlan(true); }}
        />
      )}
      {showSmartPlan && <SmartGoalPlanModal onClose={() => setShowSmartPlan(false)} />}
    </div>
  );
}
