import { useState } from 'react';
import {
  Flame, TrendingUp, TrendingDown, Minus,
  AlertCircle, Users, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { mockService } from '../../data/mockService';

interface PainPoint {
  category: string;
  count: number;
  vipCount: number;
  criticalCount: number;
  trend: number;
  topIssue: string;
  impactLevel: 'critical' | 'high' | 'medium' | 'low';
  affectedCompanies: string[];
}

const TREND_DATA: Record<string, number> = {
  'Performance Issues': -18,
  'Billing & Payments': -8,
  'API Integration': 5,
  'Security & Compliance': -12,
  'Account Access': 3,
  'Data Export': -6,
  'Bug Report': 14,
  'Onboarding': 2,
  'Feature Request': 7,
  'Webhook Configuration': -4,
};

const TOP_ISSUES: Record<string, string> = {
  'Performance Issues': 'Dashboard & report latency degrading week-over-week',
  'Billing & Payments': 'Recurring invoice discrepancies not resolved after escalation',
  'API Integration': 'OAuth token expiry causing downstream failures',
  'Security & Compliance': 'Audit log gaps with active compliance implications',
  'Account Access': 'SSO misconfiguration locking out enterprise users',
  'Data Export': 'Large dataset exports failing silently',
  'Bug Report': 'Firefox UI regressions impacting daily workflows',
  'Onboarding': 'Admin provisioning taking longer than expected',
  'Feature Request': 'API bulk operation absence blocking automation',
  'Webhook Configuration': 'Signature verification failures on retries',
};

const IMPACT_ORDER: Record<PainPoint['impactLevel'], number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

const IMPACT_STYLE: Record<PainPoint['impactLevel'], { dot: string; badge: string; bar: string }> = {
  critical: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-500' },
  high: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-500' },
  medium: { dot: 'bg-blue-400', badge: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-400' },
  low: { dot: 'bg-gray-300', badge: 'bg-gray-100 text-gray-500 border-gray-200', bar: 'bg-gray-300' },
};

function getImpact(count: number, vipCount: number, criticalCount: number): PainPoint['impactLevel'] {
  if (criticalCount >= 2 || vipCount >= 3) return 'critical';
  if (count >= 20 || vipCount >= 1) return 'high';
  if (count >= 10) return 'medium';
  return 'low';
}

function usePainPoints(): { points: PainPoint[]; maxCount: number } {
  const { tickets } = useApp();
  const customers = mockService.getCustomers();

  const customerMap = Object.fromEntries(customers.map(c => [c.id, c]));
  const openTickets = tickets.filter(
    t => t.status === 'open' || t.status === 'in_progress' || t.status === 'pending'
  );

  const grouped: Record<string, PainPoint> = {};

  for (const ticket of openTickets) {
    const cat = ticket.category;
    const customer = customerMap[ticket.customerId];
    if (!grouped[cat]) {
      grouped[cat] = {
        category: cat,
        count: 0,
        vipCount: 0,
        criticalCount: 0,
        trend: TREND_DATA[cat] ?? 0,
        topIssue: TOP_ISSUES[cat] ?? '',
        impactLevel: 'low',
        affectedCompanies: [],
      };
    }
    grouped[cat].count++;
    if (customer?.isVIP) grouped[cat].vipCount++;
    if (ticket.priority === 'critical') grouped[cat].criticalCount++;
    if (customer && !grouped[cat].affectedCompanies.includes(customer.company)) {
      grouped[cat].affectedCompanies.push(customer.company);
    }
  }

  const points = Object.values(grouped).map(p => ({
    ...p,
    impactLevel: getImpact(p.count, p.vipCount, p.criticalCount),
  }));

  points.sort((a, b) => {
    const impactDiff = IMPACT_ORDER[a.impactLevel] - IMPACT_ORDER[b.impactLevel];
    if (impactDiff !== 0) return impactDiff;
    return b.count - a.count;
  });

  const maxCount = Math.max(...points.map(p => p.count), 1);
  return { points, maxCount };
}

function TrendBadge({ trend }: { trend: number }) {
  if (trend === 0) return <Minus size={10} className="text-gray-400" />;
  const isUp = trend > 0;
  return (
    <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${isUp ? 'text-red-500' : 'text-emerald-600'}`}>
      {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {Math.abs(trend)}%
    </div>
  );
}

export default function CustomerPainPoints() {
  const { points, maxCount } = usePainPoints();
  const [expanded, setExpanded] = useState(false);

  const display = expanded ? points : points.slice(0, 5);
  const criticalCount = points.filter(p => p.impactLevel === 'critical').length;
  const highCount = points.filter(p => p.impactLevel === 'high').length;

  return (
    <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
      <div className="px-4 py-3 border-b border-deloitte-light-gray/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
            <Flame size={13} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-deloitte-black text-sm">Customer Pain Points</h3>
            <p className="text-xs text-deloitte-med-gray">Open issues ranked by customer impact</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
              <AlertCircle size={10} className="text-red-500" />
              <span className="text-[10px] font-bold text-red-600">{criticalCount} Critical</span>
            </div>
          )}
          {highCount > 0 && (
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              <span className="text-[10px] font-bold text-amber-600">{highCount} High</span>
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-deloitte-light-gray/30">
        {display.map((point, idx) => {
          const style = IMPACT_STYLE[point.impactLevel];
          const barWidth = Math.round((point.count / maxCount) * 100);

          return (
            <div key={point.category} className="px-4 py-2.5 flex items-center gap-3 group hover:bg-gray-50/60 transition-colors">
              <span className="text-xs font-bold text-deloitte-med-gray/50 w-4 shrink-0 text-right tabular-nums">
                {idx + 1}
              </span>

              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-deloitte-black truncate">{point.category}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${style.badge}`}>
                    {point.impactLevel.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-deloitte-light-gray/40 rounded-full overflow-hidden">
                    <div
                      className={`h-1 rounded-full transition-all duration-500 ${style.bar}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  {point.topIssue && (
                    <p className="text-[10px] text-deloitte-med-gray truncate max-w-[160px] hidden sm:block">
                      {point.topIssue}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {point.vipCount > 0 && (
                  <div className="flex items-center gap-0.5">
                    <Users size={10} className="text-amber-500" />
                    <span className="text-[10px] font-semibold text-amber-600">{point.vipCount} VIP</span>
                  </div>
                )}
                <TrendBadge trend={point.trend} />
                <div className="text-right">
                  <span className="text-sm font-bold text-deloitte-black tabular-nums">{point.count}</span>
                  <span className="text-[10px] text-deloitte-med-gray ml-0.5">open</span>
                </div>
                <ArrowRight size={11} className="text-deloitte-light-gray group-hover:text-deloitte-green transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {points.length > 5 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full px-4 py-2 flex items-center justify-center gap-1.5 text-xs text-deloitte-med-gray hover:text-deloitte-green hover:bg-gray-50 transition-colors border-t border-deloitte-light-gray/40"
        >
          {expanded ? (
            <><ChevronUp size={12} /> Show less</>
          ) : (
            <><ChevronDown size={12} /> Show {points.length - 5} more categories</>
          )}
        </button>
      )}
    </div>
  );
}
