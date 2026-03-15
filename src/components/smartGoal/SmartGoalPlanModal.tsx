import { useState, useEffect, useCallback } from 'react';
import {
  X, Target, ChevronLeft, ChevronRight, Save, Send,
  CheckCircle, Users, Clipboard, Clock, MapPin, Lightbulb,
  AlertCircle, Loader2, FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchPlan, savePlan } from '../../services/smartGoalPlanService';
import type { SmartGoalPlan, SmartGoalPlanItem } from '../../types/smartGoalPlan';
import { DIMENSIONS, CURRENT_YEAR, emptyItem } from '../../types/smartGoalPlan';
import type { Dimension } from '../../types/smartGoalPlan';

interface Props {
  onClose: () => void;
}

const DIMENSION_META: Record<Dimension, { color: string; bg: string; border: string; desc: string }> = {
  'Specific (5W)': {
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    desc: 'Define exactly who, what, when, where, and why for your goal.',
  },
  Measurable: {
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    desc: 'Set a concrete KPI and numeric targets you can track each quarter.',
  },
  Achievable: {
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    desc: 'Confirm the goal is realistic within your capacity and resources.',
  },
  Relevant: {
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: 'Explain how this goal ties to team and business objectives.',
  },
  'Time-Bound': {
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    desc: 'Define quarterly milestones and a clear end-of-year target.',
  },
};

const FIVE_W_FIELDS: { key: keyof SmartGoalPlanItem; label: string; icon: typeof Users; placeholder: string }[] = [
  { key: 'five_ws_who', label: 'Who', icon: Users, placeholder: 'Who is responsible? Who is impacted?' },
  { key: 'five_ws_what', label: 'What', icon: Clipboard, placeholder: 'What exactly needs to be accomplished?' },
  { key: 'five_ws_when', label: 'When', icon: Clock, placeholder: 'What is the timeframe or deadline?' },
  { key: 'five_ws_where', label: 'Where', icon: MapPin, placeholder: 'Where will this goal be executed or tracked?' },
  { key: 'five_ws_why', label: 'Why', icon: Lightbulb, placeholder: 'Why does this goal matter to the business?' },
];

const QUARTERS = [
  { key: 'q1_target' as keyof SmartGoalPlanItem, label: 'Q1', range: 'Jan – Mar' },
  { key: 'q2_target' as keyof SmartGoalPlanItem, label: 'Q2', range: 'Apr – Jun' },
  { key: 'q3_target' as keyof SmartGoalPlanItem, label: 'Q3', range: 'Jul – Sep' },
  { key: 'q4_target' as keyof SmartGoalPlanItem, label: 'Q4', range: 'Oct – Dec' },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {DIMENSIONS.map((dim, i) => {
        const meta = DIMENSION_META[dim];
        const active = i === current;
        const done = i < current;
        return (
          <div key={dim} className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done
                  ? 'bg-deloitte-green text-white'
                  : active
                  ? `${meta.bg} ${meta.color} ${meta.border} border`
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {done ? <CheckCircle size={14} /> : i + 1}
            </div>
            {i < total - 1 && (
              <div className={`w-5 h-0.5 rounded-full ${done ? 'bg-deloitte-green' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ItemForm({
  item,
  onChange,
}: {
  item: SmartGoalPlanItem;
  onChange: (updates: Partial<SmartGoalPlanItem>) => void;
}) {
  const meta = DIMENSION_META[item.dimension];
  const isSpecific = item.dimension === 'Specific (5W)';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Goal Statement <span className="text-red-500">*</span>
        </label>
        <textarea
          value={item.goal_statement}
          onChange={e => onChange({ goal_statement: e.target.value })}
          rows={2}
          placeholder={`Describe your ${item.dimension} goal clearly and concisely...`}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-deloitte-green/30 focus:border-deloitte-green/60 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            KPI Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={item.kpi}
            onChange={e => onChange({ kpi: e.target.value })}
            placeholder="e.g. CSAT Score, FCR Rate"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-deloitte-green/30 focus:border-deloitte-green/60 text-gray-800 placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Annual Target <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={item.annual_target}
            onChange={e => onChange({ annual_target: e.target.value })}
            placeholder="e.g. ≥ 4.5/5, < 2h, 95%"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-deloitte-green/30 focus:border-deloitte-green/60 text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Quarterly Targets
          <span className="ml-1.5 text-xs font-normal text-gray-400">(set milestones for each quarter)</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {QUARTERS.map(({ key, label, range }) => (
            <div key={key} className={`rounded-lg border ${meta.border} ${meta.bg} p-2.5`}>
              <p className={`text-xs font-bold ${meta.color} mb-0.5`}>{label}</p>
              <p className="text-[10px] text-gray-400 mb-1.5">{range}</p>
              <input
                type="text"
                value={(item[key] as string) || ''}
                onChange={e => onChange({ [key]: e.target.value })}
                placeholder={item.annual_target || 'Target'}
                className="w-full text-xs border border-white/80 rounded px-2 py-1.5 bg-white/80 focus:outline-none focus:ring-1 focus:ring-deloitte-green/40 text-gray-700 placeholder:text-gray-400"
              />
            </div>
          ))}
        </div>
      </div>

      {isSpecific && (
        <div className="rounded-lg border border-blue-100 overflow-hidden">
          <div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">5W Framework</p>
            <p className="text-xs text-blue-500 mt-0.5">Define the context for your goal</p>
          </div>
          <div className="divide-y divide-blue-50">
            {FIVE_W_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key} className="flex items-start gap-3 px-3 py-2.5">
                <div className="flex items-center gap-1.5 w-14 shrink-0 mt-2">
                  <Icon size={12} className="text-blue-500" />
                  <span className="text-xs font-semibold text-blue-600">{label}</span>
                </div>
                <input
                  type="text"
                  value={(item[key] as string) || ''}
                  onChange={e => onChange({ [key]: e.target.value })}
                  placeholder={placeholder}
                  className="flex-1 text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 text-gray-700 placeholder:text-gray-400"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewStep({
  items,
  managerName,
  onManagerNameChange,
}: {
  items: SmartGoalPlanItem[];
  managerName: string;
  onManagerNameChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className={`rounded-lg border border-deloitte-green/20 bg-deloitte-green/5 p-3`}>
        <div className="flex items-start gap-2.5">
          <FileCheck size={16} className="text-deloitte-green mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Ready to submit for manager approval</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Once submitted, your manager will review and approve your {CURRENT_YEAR} SMART Goal Plan.
              Your quarterly targets will be used to track progress in the SMART Goal Review throughout the year.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Manager's Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={managerName}
          onChange={e => onManagerNameChange(e.target.value)}
          placeholder="Enter your approving manager's name"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-deloitte-green/30 focus:border-deloitte-green/60 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Goal Summary</p>
        {items.map((item) => {
          const meta = DIMENSION_META[item.dimension];
          const filled = item.goal_statement && item.kpi && item.annual_target;
          return (
            <div key={item.dimension} className={`rounded-lg border ${meta.border} ${meta.bg} px-3 py-2.5 flex items-start gap-2.5`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${filled ? 'bg-green-500' : 'bg-red-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-bold ${meta.color}`}>{item.dimension}</span>
                  {!filled && <span className="text-[10px] text-red-500 font-medium">Incomplete</span>}
                </div>
                <p className="text-xs text-gray-600 truncate">{item.goal_statement || 'No goal statement entered'}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-gray-400">KPI: {item.kpi || '—'}</span>
                  <span className="text-[10px] text-gray-400">Target: {item.annual_target || '—'}</span>
                  <span className="text-[10px] text-gray-400">
                    Q1:{item.q1_target || '—'} Q2:{item.q2_target || '—'} Q3:{item.q3_target || '—'} Q4:{item.q4_target || '—'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SmartGoalPlanModal({ onClose }: Props) {
  const { user } = useApp();
  const [step, setStep] = useState(0);
  const [items, setItems] = useState<SmartGoalPlanItem[]>(() =>
    DIMENSIONS.map((dim, i) => emptyItem(dim, i + 1))
  );
  const [managerName, setManagerName] = useState('');
  const [existingPlan, setExistingPlan] = useState<SmartGoalPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');

  const totalSteps = DIMENSIONS.length + 1;
  const isReview = step === DIMENSIONS.length;
  const currentDimension = !isReview ? DIMENSIONS[step] : null;
  const currentItem = !isReview ? items[step] : null;

  useEffect(() => {
    if (!user) return;
    fetchPlan(user.id, CURRENT_YEAR).then(plan => {
      if (plan) {
        setExistingPlan(plan);
        if (plan.items && plan.items.length > 0) {
          const mapped = DIMENSIONS.map((dim, i) => {
            const found = plan.items!.find(it => it.dimension === dim);
            return found ?? emptyItem(dim, i + 1);
          });
          setItems(mapped);
        }
        if (plan.manager_name) setManagerName(plan.manager_name);
      }
      setLoading(false);
    });
  }, [user]);

  const updateItem = useCallback((updates: Partial<SmartGoalPlanItem>) => {
    setItems(prev => prev.map((it, i) => i === step ? { ...it, ...updates } : it));
  }, [step]);

  const handleSaveDraft = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      const plan: SmartGoalPlan = {
        ...(existingPlan ?? {}),
        id: existingPlan?.id,
        user_id: user.id,
        user_name: user.name,
        user_role: user.role,
        year: CURRENT_YEAR,
        status: 'draft',
        manager_name: managerName || undefined,
      };
      const saved = await savePlan(plan, items);
      setExistingPlan(saved);
      setSavedMsg('Draft saved');
      setTimeout(() => setSavedMsg(''), 2500);
    } catch {
      setError('Failed to save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !managerName.trim()) {
      setError("Please enter your manager's name before submitting.");
      return;
    }
    const incomplete = items.filter(it => !it.goal_statement || !it.kpi || !it.annual_target);
    if (incomplete.length > 0) {
      setError(`Please complete all required fields: ${incomplete.map(i => i.dimension).join(', ')}`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const plan: SmartGoalPlan = {
        ...(existingPlan ?? {}),
        id: existingPlan?.id,
        user_id: user.id,
        user_name: user.name,
        user_role: user.role,
        year: CURRENT_YEAR,
        status: 'submitted',
        manager_name: managerName,
        submitted_at: new Date().toISOString(),
      };
      const saved = await savePlan(plan, items);
      setExistingPlan(saved);
      setSavedMsg('Submitted for approval!');
      setTimeout(() => onClose(), 2000);
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = !isReview
    ? !!(currentItem?.goal_statement && currentItem?.kpi && currentItem?.annual_target)
    : true;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-deloitte-green animate-spin" />
          <p className="text-sm text-gray-500">Loading your SMART Goal plan...</p>
        </div>
      </div>
    );
  }

  const planStatusBadge = existingPlan?.status && existingPlan.status !== 'draft' && (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
      existingPlan.status === 'approved'
        ? 'bg-green-50 text-green-700 border-green-200'
        : existingPlan.status === 'submitted'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {existingPlan.status.charAt(0).toUpperCase() + existingPlan.status.slice(1)}
    </span>
  );

  const dimMeta = currentDimension ? DIMENSION_META[currentDimension] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-deloitte-green/10 rounded-xl flex items-center justify-center shrink-0">
                <Target size={20} className="text-deloitte-green" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">{CURRENT_YEAR} SMART Goal Plan</h2>
                  {planStatusBadge}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {existingPlan?.status === 'approved'
                    ? `Approved by ${existingPlan.manager_name}`
                    : existingPlan?.status === 'submitted'
                    ? `Pending approval by ${existingPlan.manager_name}`
                    : 'Set your annual goals and quarterly milestones'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <StepIndicator current={step} total={totalSteps} />
            <div className="text-xs text-gray-400 font-medium">
              Step {step + 1} of {totalSteps}
            </div>
          </div>
        </div>

        {currentDimension && dimMeta && (
          <div className={`px-6 py-3 border-b ${dimMeta.border} ${dimMeta.bg} shrink-0`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${dimMeta.color}`}>{currentDimension}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{dimMeta.desc}</p>
          </div>
        )}

        {isReview && (
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/60 shrink-0">
            <p className="text-sm font-bold text-gray-700">Review & Submit</p>
            <p className="text-xs text-gray-500 mt-0.5">Confirm all goals and submit to your manager for approval</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
          {savedMsg && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 mb-4">
              <CheckCircle size={14} className="text-green-600 shrink-0" />
              <p className="text-xs text-green-700 font-medium">{savedMsg}</p>
            </div>
          )}

          {!isReview && currentItem && (
            <ItemForm item={currentItem} onChange={updateItem} />
          )}

          {isReview && (
            <ReviewStep
              items={items}
              managerName={managerName}
              onManagerNameChange={setManagerName}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
              Back
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save Draft
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isReview ? (
              <button
                onClick={() => {
                  setError('');
                  setStep(s => s + 1);
                }}
                disabled={!canProceed}
                className="flex items-center gap-1.5 px-4 py-2 bg-deloitte-green text-white text-sm font-medium rounded-lg hover:bg-deloitte-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving || !managerName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-deloitte-green text-white text-sm font-medium rounded-lg hover:bg-deloitte-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Submit for Approval
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
