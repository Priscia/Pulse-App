import { useState, useMemo, useEffect } from 'react';
import {
  X, Download, Target, CheckCircle, AlertTriangle, XCircle,
  TrendingUp, FileText, Users, Clipboard, Clock, MapPin, Lightbulb,
  Calendar, Flag, Pencil
} from 'lucide-react';
import type { Role } from '../../types';
import type { SmartGoalMetric, SmartGoalReport, FiveWs } from '../../utils/smartGoalExport';
import { buildSmartGoalReport, exportSmartGoalCSV } from '../../utils/smartGoalExport';
import { useApp } from '../../context/AppContext';
import { fetchPlan } from '../../services/smartGoalPlanService';
import type { SmartGoalPlan, SmartGoalPlanItem } from '../../types/smartGoalPlan';
import { CURRENT_YEAR, CURRENT_QUARTER } from '../../types/smartGoalPlan';

interface Props {
  onClose: () => void;
  onOpenPlanModal: () => void;
}

const DIMENSION_COLORS: Record<SmartGoalMetric['dimension'], string> = {
  'Specific (5W)': 'bg-blue-100 text-blue-700 border-blue-200',
  Measurable: 'bg-teal-100 text-teal-700 border-teal-200',
  Achievable: 'bg-green-100 text-green-700 border-green-200',
  Relevant: 'bg-amber-100 text-amber-700 border-amber-200',
  'Time-Bound': 'bg-orange-100 text-orange-700 border-orange-200',
};

const STATUS_CONFIG: Record<SmartGoalMetric['status'], { icon: typeof CheckCircle; color: string; bg: string; border: string }> = {
  'On Track': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  'At Risk': { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  'Behind': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

const ROLE_LABELS: Record<Role, string> = {
  agent: 'Agent',
  manager: 'Operations Manager',
  exec: 'Executive',
};

const FIVE_W_CONFIG: { key: keyof FiveWs; label: string; icon: typeof Users }[] = [
  { key: 'who', label: 'Who', icon: Users },
  { key: 'what', label: 'What', icon: Clipboard },
  { key: 'when', label: 'When', icon: Clock },
  { key: 'where', label: 'Where', icon: MapPin },
  { key: 'why', label: 'Why', icon: Lightbulb },
];

const QUARTER_KEYS: (keyof SmartGoalPlanItem)[] = ['q1_target', 'q2_target', 'q3_target', 'q4_target'];

function ScoreMeter({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-2.5 rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-2xl font-bold tabular-nums ${textColor}`}>{score}%</span>
    </div>
  );
}

function FiveWsPanel({ fiveWs }: { fiveWs: FiveWs }) {
  return (
    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 overflow-hidden">
      <div className="px-3 py-2 bg-blue-100/60 border-b border-blue-100">
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">5W Breakdown</p>
      </div>
      <div className="divide-y divide-blue-100/70">
        {FIVE_W_CONFIG.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-start gap-2.5 px-3 py-2">
            <div className="flex items-center gap-1.5 w-16 shrink-0 mt-0.5">
              <Icon size={12} className="text-blue-500" />
              <span className="text-xs font-semibold text-blue-600">{label}</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{fiveWs[key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuarterlyPlanBand({ planItem }: { planItem: SmartGoalPlanItem }) {
  const quarters = [
    { label: 'Q1', key: 'q1_target' as keyof SmartGoalPlanItem, q: 1 },
    { label: 'Q2', key: 'q2_target' as keyof SmartGoalPlanItem, q: 2 },
    { label: 'Q3', key: 'q3_target' as keyof SmartGoalPlanItem, q: 3 },
    { label: 'Q4', key: 'q4_target' as keyof SmartGoalPlanItem, q: 4 },
  ];

  return (
    <div className="mt-3 rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
        <Flag size={11} className="text-gray-400" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Approved Quarterly Targets</p>
        <span className="ml-auto text-[10px] text-gray-400">Annual: {planItem.annual_target}</span>
      </div>
      <div className="grid grid-cols-4 divide-x divide-gray-100">
        {quarters.map(({ label, key, q }) => {
          const target = (planItem[key] as string) || planItem.annual_target;
          const isCurrentQ = q === CURRENT_QUARTER;
          const isPast = q < CURRENT_QUARTER;
          return (
            <div
              key={label}
              className={`px-3 py-2 text-center ${isCurrentQ ? 'bg-deloitte-green/5' : ''}`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className={`text-xs font-bold ${isCurrentQ ? 'text-deloitte-green' : isPast ? 'text-gray-400' : 'text-gray-500'}`}>
                  {label}
                </span>
                {isCurrentQ && (
                  <span className="text-[9px] font-bold text-deloitte-green bg-deloitte-green/10 px-1 rounded">NOW</span>
                )}
              </div>
              <p className={`text-xs font-semibold ${isCurrentQ ? 'text-deloitte-green' : isPast ? 'text-gray-400' : 'text-gray-600'}`}>
                {target}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({
  metric,
  planItem,
}: {
  metric: SmartGoalMetric;
  planItem?: SmartGoalPlanItem;
}) {
  const { icon: StatusIcon, color, bg, border } = STATUS_CONFIG[metric.status];
  const dimColor = DIMENSION_COLORS[metric.dimension];

  return (
    <div className={`rounded-xl border ${border} ${bg} overflow-hidden`}>
      <div className="px-4 py-3 border-b border-white/60 flex items-center justify-between gap-2">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${dimColor}`}>
          {metric.dimension}
        </span>
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${color}`}>
          <StatusIcon size={13} />
          {metric.status}
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-gray-800 leading-snug mb-3">
          {planItem?.goal_statement || metric.goal}
        </p>

        {metric.fiveWs && <FiveWsPanel fiveWs={metric.fiveWs} />}

        {planItem && <QuarterlyPlanBand planItem={planItem} />}

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-white/80 rounded-lg p-2.5 text-center border border-white/60">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">KPI</p>
            <p className="text-xs font-semibold text-gray-700 leading-tight">{planItem?.kpi || metric.kpi}</p>
          </div>
          <div className="bg-white/80 rounded-lg p-2.5 text-center border border-white/60">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">
              {planItem ? `Q${CURRENT_QUARTER} Target` : 'Target'}
            </p>
            <p className="text-xs font-bold text-gray-700">
              {planItem
                ? (planItem[QUARTER_KEYS[CURRENT_QUARTER - 1]] as string) || planItem.annual_target
                : metric.target}
            </p>
          </div>
          <div className="bg-white/80 rounded-lg p-2.5 text-center border border-white/60">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Actual</p>
            <p className={`text-xs font-bold ${color}`}>{metric.actual}</p>
          </div>
        </div>

        <div className="mt-2.5 flex items-start gap-1.5">
          <span className="text-xs text-gray-400 italic shrink-0">Variance:</span>
          <span className="text-xs text-gray-500 italic">{metric.variance}</span>
        </div>

        {metric.notes && (
          <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-white/60 leading-relaxed">{metric.notes}</p>
        )}
      </div>
    </div>
  );
}

export default function SmartGoalExportModal({ onClose, onOpenPlanModal }: Props) {
  const { user, tickets } = useApp();
  const [exported, setExported] = useState(false);
  const [plan, setPlan] = useState<SmartGoalPlan | null>(null);

  const report: SmartGoalReport = useMemo(
    () => buildSmartGoalReport(tickets, user?.role ?? 'agent'),
    [tickets, user?.role]
  );

  useEffect(() => {
    if (!user) return;
    fetchPlan(user.id, CURRENT_YEAR).then(setPlan);
  }, [user]);

  const handleExport = () => {
    exportSmartGoalCSV(report, user?.name ?? 'Unknown');
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const generatedAt = new Date(report.generatedAt).toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const planStatusBadge = plan && (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
      plan.status === 'approved'
        ? 'bg-green-50 text-green-700 border-green-200'
        : plan.status === 'submitted'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-gray-100 text-gray-500 border-gray-200'
    }`}>
      Plan: {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
    </span>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-deloitte-green/10 rounded-xl flex items-center justify-center">
              <Target size={20} className="text-deloitte-green" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-gray-900">SMART Goal Performance Review</h2>
                {planStatusBadge}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {ROLE_LABELS[report.role]} — {report.reviewPeriod}
                {plan && ` · Q${CURRENT_QUARTER} ${CURRENT_YEAR}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>

        {!plan && (
          <div className="px-6 py-3 border-b border-amber-100 bg-amber-50/60 shrink-0 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <Calendar size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                <span className="font-semibold">No annual plan found.</span> Submit your {CURRENT_YEAR} SMART Goal Plan so quarterly targets can be tracked here.
              </p>
            </div>
            <button
              onClick={() => { onClose(); onOpenPlanModal(); }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Pencil size={11} />
              Set Plan
            </button>
          </div>
        )}

        {plan && (
          <div className="px-6 py-2.5 border-b border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={13} className="text-deloitte-green" />
              <p className="text-xs text-gray-600">
                <span className="font-semibold">{CURRENT_YEAR} Plan</span>
                {plan.manager_name && ` · ${plan.status === 'approved' ? 'Approved' : 'Pending'} by ${plan.manager_name}`}
                {' · '}Quarterly targets shown below each goal
              </p>
            </div>
            <button
              onClick={() => { onClose(); onOpenPlanModal(); }}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Pencil size={11} />
              Edit Plan
            </button>
          </div>
        )}

        <div className="px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-deloitte-green" />
              <span className="text-sm font-semibold text-gray-700">Overall Goal Attainment</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle size={11} /> {report.summary.onTrack} On Track
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <AlertTriangle size={11} /> {report.summary.atRisk} At Risk
              </span>
              <span className="flex items-center gap-1 text-red-500 font-medium">
                <XCircle size={11} /> {report.summary.behind} Behind
              </span>
            </div>
          </div>
          <ScoreMeter score={report.summary.overallScore} />
          <p className="text-xs text-gray-400 mt-1.5">
            {report.summary.onTrack} of {report.summary.totalGoals} SMART goals on track
            {plan && ` · Tracking against Q${CURRENT_QUARTER} targets`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {report.metrics.map((metric) => {
            const planItem = plan?.items?.find(it => it.dimension === metric.dimension);
            return (
              <MetricCard key={metric.dimension} metric={metric} planItem={planItem} />
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/60">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <FileText size={12} />
            <span>Generated {generatedAt}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
              Close
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-deloitte-green text-white text-sm font-medium rounded-lg hover:bg-deloitte-green/90 transition-all"
            >
              <Download size={14} />
              {exported ? 'Exported!' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
