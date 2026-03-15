import type { Ticket, Role } from '../types';
import { mockService } from '../data/mockService';

export interface FiveWs {
  who: string;
  what: string;
  when: string;
  where: string;
  why: string;
}

export interface SmartGoalMetric {
  dimension: 'Specific (5W)' | 'Measurable' | 'Achievable' | 'Relevant' | 'Time-Bound';
  goal: string;
  fiveWs?: FiveWs;
  kpi: string;
  target: string;
  actual: string;
  status: 'On Track' | 'At Risk' | 'Behind';
  variance: string;
  notes: string;
}

export interface SmartGoalReport {
  generatedAt: string;
  role: Role;
  reviewPeriod: string;
  metrics: SmartGoalMetric[];
  summary: {
    totalGoals: number;
    onTrack: number;
    atRisk: number;
    behind: number;
    overallScore: number;
  };
}

function goalStatus(actual: number, target: number, higherIsBetter: boolean): SmartGoalMetric['status'] {
  const ratio = actual / target;
  if (higherIsBetter) {
    if (ratio >= 0.95) return 'On Track';
    if (ratio >= 0.80) return 'At Risk';
    return 'Behind';
  } else {
    if (ratio <= 1.05) return 'On Track';
    if (ratio <= 1.25) return 'At Risk';
    return 'Behind';
  }
}

function varianceStr(actual: number, target: number, unit: string, higherIsBetter: boolean): string {
  const diff = actual - target;
  const sign = diff >= 0 ? '+' : '';
  const good = higherIsBetter ? diff >= 0 : diff <= 0;
  return `${sign}${diff.toFixed(1)}${unit} ${good ? '(favorable)' : '(unfavorable)'}`;
}

export function buildSmartGoalReport(tickets: Ticket[], role: Role): SmartGoalReport {
  const kpis = mockService.getKPIs(tickets);
  const settings = mockService.getSettings();
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const reviewPeriod = `${periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (MTD)`;
  const periodEnd = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const periodStartStr = periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const slaCompliancePct = parseFloat((100 - (kpis.breachedSLA / Math.max(kpis.openCount, 1) * 100)).toFixed(1));

  const agentMetrics: SmartGoalMetric[] = [
    {
      dimension: 'Specific (5W)',
      goal: 'Eliminate SLA breaches on all assigned tickets',
      fiveWs: {
        who: 'Support Agent — individually responsible for assigned ticket queue',
        what: 'Ensure zero SLA breaches by proactively managing ticket response and resolution deadlines',
        when: `${periodStartStr} – ${periodEnd} (current review period)`,
        where: 'CX Support Portal — tickets assigned to this agent across all channels',
        why: 'SLA breaches directly reduce customer satisfaction, damage retention, and trigger penalty clauses for enterprise accounts',
      },
      kpi: 'SLA Breach Count',
      target: '0',
      actual: String(kpis.breachedSLA),
      status: goalStatus(kpis.breachedSLA, 1, false),
      variance: kpis.breachedSLA === 0 ? 'No breaches (favorable)' : `+${kpis.breachedSLA} breach(es) (unfavorable)`,
      notes: kpis.breachedSLA > 0 ? `${kpis.breachedSLA} ticket(s) currently in breach — immediate escalation required.` : 'All SLAs met for current period.',
    },
    {
      dimension: 'Measurable',
      goal: `Achieve First Contact Resolution rate ≥ ${settings.fcrTarget}%`,
      kpi: 'FCR Rate (%)',
      target: `${settings.fcrTarget}%`,
      actual: `${kpis.fcrRate}%`,
      status: goalStatus(kpis.fcrRate, settings.fcrTarget, true),
      variance: varianceStr(kpis.fcrRate, settings.fcrTarget, '%', true),
      notes: `${kpis.totalResolved} tickets resolved; ${kpis.fcrRate}% resolved without reopening. Tracked per ticket reopen flag in the system.`,
    },
    {
      dimension: 'Achievable',
      goal: `Maintain Mean Time to Acknowledge under ${settings.mttaTarget} minutes`,
      kpi: 'MTTA (minutes)',
      target: `${settings.mttaTarget}m`,
      actual: `${kpis.mtta}m`,
      status: goalStatus(kpis.mtta, settings.mttaTarget, false),
      variance: varianceStr(kpis.mtta, settings.mttaTarget, 'm', false),
      notes: `Target of ${settings.mttaTarget}m is set within agent capacity constraints. Current average: ${kpis.mtta}m. Achievable through queue monitoring and notification settings.`,
    },
    {
      dimension: 'Relevant',
      goal: 'Keep open ticket backlog at or below 20 tickets',
      kpi: 'Open Ticket Count',
      target: '≤ 20',
      actual: String(kpis.openCount),
      status: goalStatus(kpis.openCount, 20, false),
      variance: varianceStr(kpis.openCount, 20, ' tickets', false),
      notes: `Backlog aging breakdown — 0-1d: ${kpis.agingBuckets['0-1d']}, 2-3d: ${kpis.agingBuckets['2-3d']}, 4-7d: ${kpis.agingBuckets['4-7d']}, 8d+: ${kpis.agingBuckets['8d+']}. Directly aligned with team SLA health objectives.`,
    },
    {
      dimension: 'Time-Bound',
      goal: `Resolve all assigned tickets within a ${settings.mttrTarget}h mean resolution time by end of review period`,
      kpi: 'MTTR (hours)',
      target: `${settings.mttrTarget}h`,
      actual: `${kpis.mttr}h`,
      status: goalStatus(kpis.mttr, settings.mttrTarget, false),
      variance: varianceStr(kpis.mttr, settings.mttrTarget, 'h', false),
      notes: `Review period ends ${periodEnd}. ${kpis.totalResolved} tickets resolved to date. Reopen rate: ${kpis.reopenRate}%. Progress assessed monthly.`,
    },
  ];

  const managerMetrics: SmartGoalMetric[] = [
    {
      dimension: 'Specific (5W)',
      goal: 'Maintain team SLA compliance above 95% across all ticket priorities',
      fiveWs: {
        who: 'Operations Manager — accountable for team-wide SLA adherence and escalation processes',
        what: 'Drive SLA compliance to 95%+ by monitoring breach trends, coaching agents, and refining escalation workflows',
        when: `${periodStartStr} – ${periodEnd} (monthly review cycle)`,
        where: 'All support channels (phone, chat, email, web, API) managed by this team',
        why: 'SLA compliance is a contractual obligation for enterprise customers and a core KPI for operational excellence reporting',
      },
      kpi: 'SLA Compliance (%)',
      target: '95%',
      actual: `${slaCompliancePct}%`,
      status: goalStatus(slaCompliancePct, 95, true),
      variance: varianceStr(slaCompliancePct, 95, '%', true),
      notes: `${kpis.breachedSLA} active breaches out of ${kpis.openCount} open tickets. At-risk: ${kpis.atRiskSLA}.`,
    },
    {
      dimension: 'Measurable',
      goal: `Achieve team CSAT score ≥ ${settings.csatTarget}/5 across all resolved tickets`,
      kpi: 'CSAT Score (/5)',
      target: `${settings.csatTarget}/5`,
      actual: `${kpis.csat.toFixed(2)}/5`,
      status: goalStatus(kpis.csat, settings.csatTarget, true),
      variance: varianceStr(kpis.csat, settings.csatTarget, '/5', true),
      notes: `Measured from post-resolution customer surveys. Target benchmark: ${settings.csatTarget}/5. Tracked weekly via CSAT trend chart.`,
    },
    {
      dimension: 'Achievable',
      goal: `Sustain team FCR Rate at or above ${settings.fcrTarget}% through coaching and knowledge base improvements`,
      kpi: 'FCR Rate (%)',
      target: `${settings.fcrTarget}%`,
      actual: `${kpis.fcrRate}%`,
      status: goalStatus(kpis.fcrRate, settings.fcrTarget, true),
      variance: varianceStr(kpis.fcrRate, settings.fcrTarget, '%', true),
      notes: `Reopen rate is ${kpis.reopenRate}%. ${kpis.totalResolved} tickets resolved. Achievable via agent training and knowledge article expansion.`,
    },
    {
      dimension: 'Relevant',
      goal: `Reduce average team MTTA to under ${settings.mttaTarget} minutes to improve first-touch customer experience`,
      kpi: 'Avg MTTA (minutes)',
      target: `${settings.mttaTarget}m`,
      actual: `${kpis.mtta}m`,
      status: goalStatus(kpis.mtta, settings.mttaTarget, false),
      variance: varianceStr(kpis.mtta, settings.mttaTarget, 'm', false),
      notes: `Reflects average first response time across all agents. Directly tied to customer satisfaction and SLA first-response obligations.`,
    },
    {
      dimension: 'Time-Bound',
      goal: `Bring average MTTR to under ${settings.mttrTarget}h for critical and high-priority tickets by end of review period`,
      kpi: 'Avg MTTR (hours)',
      target: `${settings.mttrTarget}h`,
      actual: `${kpis.mttr}h`,
      status: goalStatus(kpis.mttr, settings.mttrTarget, false),
      variance: varianceStr(kpis.mttr, settings.mttrTarget, 'h', false),
      notes: `Review period ends ${periodEnd}. At-risk SLA tickets: ${kpis.atRiskSLA}. Aging 8d+: ${kpis.agingBuckets['8d+']}. Monthly cadence with bi-weekly check-ins.`,
    },
  ];

  const incidents = mockService.getIncidents();
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const customers = mockService.getCustomers();
  const vipCustomers = customers.filter(c => c.isVIP);
  const vipOpenTickets = tickets.filter(t => {
    const cust = mockService.getCustomerById(t.customerId);
    return cust?.isVIP && (t.status === 'open' || t.status === 'in_progress');
  });

  const execMetrics: SmartGoalMetric[] = [
    {
      dimension: 'Specific (5W)',
      goal: 'Achieve zero active SEV1 major incidents and minimize customer-impacting outages',
      fiveWs: {
        who: 'Executive Leadership — responsible for service reliability strategy and incident management governance',
        what: 'Reduce active SEV1 incidents to zero by reinforcing incident response protocols and investing in infrastructure resilience',
        when: `${periodStartStr} – ${periodEnd} (rolling monthly review)`,
        where: 'All production services and customer-facing platforms across all regions',
        why: 'SEV1 incidents cause direct revenue loss, customer churn risk, and reputational damage — zero-tolerance is a board-level commitment',
      },
      kpi: 'Active Major Incidents',
      target: '0',
      actual: String(activeIncidents.length),
      status: activeIncidents.length === 0 ? 'On Track' : activeIncidents.some(i => i.severity === 'sev1') ? 'Behind' : 'At Risk',
      variance: activeIncidents.length === 0 ? 'No active incidents (favorable)' : `${activeIncidents.length} incident(s) active (unfavorable)`,
      notes: activeIncidents.length > 0
        ? `Impacting ${activeIncidents.reduce((a, i) => a + i.customerImpactCount, 0)} customers. Services: ${activeIncidents.flatMap(i => i.affectedServices).join(', ')}.`
        : 'No active major incidents.',
    },
    {
      dimension: 'Measurable',
      goal: `Sustain enterprise CSAT at or above ${settings.csatTarget}/5 across all service lines`,
      kpi: 'CSAT Score (/5)',
      target: `${settings.csatTarget}/5`,
      actual: `${kpis.csat.toFixed(2)}/5`,
      status: goalStatus(kpis.csat, settings.csatTarget, true),
      variance: varianceStr(kpis.csat, settings.csatTarget, '/5', true),
      notes: `Measured across all channels and regions. 7-day trend monitored. CSAT is a primary customer health metric reported to executive stakeholders.`,
    },
    {
      dimension: 'Achievable',
      goal: 'Ensure no more than 5 VIP accounts have open tickets at any given time',
      kpi: 'VIP Open Tickets',
      target: '< 5',
      actual: String(vipOpenTickets.length),
      status: goalStatus(vipOpenTickets.length, 5, false),
      variance: varianceStr(vipOpenTickets.length, 5, ' tickets', false),
      notes: `${vipCustomers.length} VIP accounts under active monitoring. ${vipOpenTickets.length} currently have open tickets. Achievable via dedicated VIP routing and priority escalation paths.`,
    },
    {
      dimension: 'Relevant',
      goal: 'Maintain overall SLA compliance at or above 95% to protect contractual obligations',
      kpi: 'SLA Compliance (%)',
      target: '95%',
      actual: `${slaCompliancePct}%`,
      status: goalStatus(slaCompliancePct, 95, true),
      variance: varianceStr(slaCompliancePct, 95, '%', true),
      notes: `${kpis.breachedSLA} SLA breaches active. This KPI directly protects revenue, contractual SLA credits, and enterprise renewal rates.`,
    },
    {
      dimension: 'Time-Bound',
      goal: `Drive team-wide MTTR to under ${settings.mttrTarget}h by the end of the current review period`,
      kpi: 'Avg MTTR (hours)',
      target: `${settings.mttrTarget}h`,
      actual: `${kpis.mttr}h`,
      status: goalStatus(kpis.mttr, settings.mttrTarget, false),
      variance: varianceStr(kpis.mttr, settings.mttrTarget, 'h', false),
      notes: `Review period ends ${periodEnd}. FCR Rate: ${kpis.fcrRate}%. Reopen Rate: ${kpis.reopenRate}%. Total resolved: ${kpis.totalResolved}. Progress reviewed monthly at leadership ops review.`,
    },
  ];

  const metricsMap: Record<Role, SmartGoalMetric[]> = {
    agent: agentMetrics,
    manager: managerMetrics,
    exec: execMetrics,
  };

  const metrics = metricsMap[role];
  const onTrack = metrics.filter(m => m.status === 'On Track').length;
  const atRisk = metrics.filter(m => m.status === 'At Risk').length;
  const behind = metrics.filter(m => m.status === 'Behind').length;
  const overallScore = Math.round((onTrack / metrics.length) * 100);

  return {
    generatedAt: now.toISOString(),
    role,
    reviewPeriod,
    metrics,
    summary: { totalGoals: metrics.length, onTrack, atRisk, behind, overallScore },
  };
}

export function exportSmartGoalCSV(report: SmartGoalReport, userName: string): void {
  const roleLabel = report.role.charAt(0).toUpperCase() + report.role.slice(1);
  const generated = new Date(report.generatedAt).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const lines: string[] = [
    `SMART Goal Performance Review`,
    `Reviewer: ${userName}`,
    `Role: ${roleLabel}`,
    `Review Period: ${report.reviewPeriod}`,
    `Generated: ${generated}`,
    `Overall Score: ${report.summary.overallScore}% (${report.summary.onTrack}/${report.summary.totalGoals} goals on track)`,
    '',
  ];

  report.metrics.forEach((m, i) => {
    lines.push(`--- Goal ${i + 1}: ${m.dimension} ---`);
    lines.push(`"Goal","${m.goal.replace(/"/g, '""')}"`);
    if (m.fiveWs) {
      lines.push(`"Who","${m.fiveWs.who.replace(/"/g, '""')}"`);
      lines.push(`"What","${m.fiveWs.what.replace(/"/g, '""')}"`);
      lines.push(`"When","${m.fiveWs.when.replace(/"/g, '""')}"`);
      lines.push(`"Where","${m.fiveWs.where.replace(/"/g, '""')}"`);
      lines.push(`"Why","${m.fiveWs.why.replace(/"/g, '""')}"`);
    }
    lines.push(`"KPI","${m.kpi}"`);
    lines.push(`"Target","${m.target}"`);
    lines.push(`"Actual","${m.actual}"`);
    lines.push(`"Status","${m.status}"`);
    lines.push(`"Variance","${m.variance.replace(/"/g, '""')}"`);
    lines.push(`"Notes","${m.notes.replace(/"/g, '""')}"`);
    lines.push('');
  });

  lines.push('SUMMARY');
  lines.push(`"On Track","At Risk","Behind","Overall Score"`);
  lines.push(`"${report.summary.onTrack}","${report.summary.atRisk}","${report.summary.behind}","${report.summary.overallScore}%"`);

  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SMART_Goal_Review_${roleLabel}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
