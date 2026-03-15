import { useState, useCallback } from 'react';
import type { Role, Ticket } from '../types';
import { mockService } from '../data/mockService';

export type AgentToolStatus = 'pending' | 'running' | 'done' | 'error';

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  status: AgentToolStatus;
  result?: string;
}

export type AgentMessageRole = 'user' | 'agent' | 'system';

export interface AgentStep {
  id: string;
  type: 'thought' | 'tool_call' | 'tool_result' | 'answer';
  content: string;
  tool?: AgentTool;
  timestamp: Date;
}

export interface AgentMessage {
  id: string;
  role: AgentMessageRole;
  content: string;
  steps?: AgentStep[];
  timestamp: Date;
  isStreaming?: boolean;
}

export interface AgentTask {
  id: string;
  label: string;
  goal: string;
}

const ROLE_TASKS: Record<Role, AgentTask[]> = {
  agent: [
    { id: 'triage', label: 'Auto-Triage Queue', goal: 'Analyze my open queue, identify SLA risks, and suggest reprioritization actions.' },
    { id: 'draft_response', label: 'Draft Response for Top Ticket', goal: 'Find the highest-priority ticket in my queue and draft a professional customer response.' },
    { id: 'find_knowledge', label: 'Find Knowledge Gaps', goal: 'Identify tickets that lack linked knowledge articles and recommend which articles to create.' },
    { id: 'daily_briefing', label: 'Daily Briefing', goal: 'Give me a concise briefing on my queue health, urgent items, and what I should focus on first today.' },
  ],
  manager: [
    { id: 'workload_rebalance', label: 'Rebalance Workload', goal: 'Analyze agent utilization, identify overloaded and underloaded agents, and provide specific ticket reassignment recommendations.' },
    { id: 'sla_risk_report', label: 'SLA Risk Report', goal: 'Identify all at-risk and breached tickets, group them by team and category, and recommend escalation steps.' },
    { id: 'csat_analysis', label: 'CSAT Root Cause Analysis', goal: 'Analyze current CSAT scores, identify the categories and agents with the lowest scores, and suggest improvement actions.' },
    { id: 'ops_briefing', label: 'Operations Briefing', goal: 'Compile a comprehensive operations briefing covering SLA health, team utilization, contact drivers, and incident status.' },
  ],
  exec: [
    { id: 'exec_briefing', label: 'Executive Briefing', goal: 'Provide a concise executive briefing on customer health, active incidents, strategic KPI status, and top risks.' },
    { id: 'vip_risk', label: 'VIP Risk Assessment', goal: 'Assess VIP account health by reviewing open tickets, SLA breaches, CSAT trends, and flag accounts at churn risk.' },
    { id: 'incident_impact', label: 'Incident Impact Summary', goal: 'Summarize all active incidents by severity, customer impact, revenue exposure, and recommended executive actions.' },
    { id: 'kpi_forecast', label: 'KPI Forecast & Gaps', goal: 'Compare current KPIs against targets, calculate trajectory, and identify which goals are at risk of being missed this period.' },
  ],
};

interface ToolDefinition {
  name: string;
  description: string;
  execute: (tickets: Ticket[]) => string;
}

const ALL_TOOLS: Record<string, ToolDefinition> = {
  get_queue_summary: {
    name: 'get_queue_summary',
    description: 'Retrieves KPI metrics and open ticket counts',
    execute: (tickets) => {
      const kpis = mockService.getKPIs(tickets);
      return JSON.stringify({ open: kpis.openCount, breached: kpis.breachedSLA, atRisk: kpis.atRiskSLA, csat: kpis.csat, fcrRate: kpis.fcrRate, mtta: kpis.mtta, mttr: kpis.mttr });
    },
  },
  get_sla_violations: {
    name: 'get_sla_violations',
    description: 'Lists tickets that have breached or are at risk of breaching SLA',
    execute: (tickets) => {
      const breached = tickets.filter(t => t.slaBreached).slice(0, 5).map(t => ({ id: t.id, subject: t.subject.slice(0, 50), priority: t.priority, category: t.category }));
      const atRisk = tickets.filter(t => t.slaAtRisk && !t.slaBreached).slice(0, 5).map(t => ({ id: t.id, subject: t.subject.slice(0, 50), priority: t.priority, category: t.category }));
      return JSON.stringify({ breachedCount: tickets.filter(t => t.slaBreached).length, atRiskCount: tickets.filter(t => t.slaAtRisk && !t.slaBreached).length, topBreached: breached, topAtRisk: atRisk });
    },
  },
  get_agent_workload: {
    name: 'get_agent_workload',
    description: 'Returns agent utilization data including load percentages',
    execute: () => {
      const agents = mockService.getAgents().filter(a => a.role === 'agent');
      const data = agents.map(a => ({
        name: a.name,
        team: a.team,
        utilization: Math.round((a.currentLoad / a.maxLoad) * 100),
        currentLoad: a.currentLoad,
        maxLoad: a.maxLoad,
        isOnline: a.isOnline,
      }));
      return JSON.stringify(data);
    },
  },
  get_category_breakdown: {
    name: 'get_category_breakdown',
    description: 'Returns ticket volume grouped by category',
    execute: (tickets) => {
      const cats = mockService.getCategoryBreakdown(tickets);
      return JSON.stringify(cats.sort((a, b) => b.count - a.count).slice(0, 6));
    },
  },
  get_vip_tickets: {
    name: 'get_vip_tickets',
    description: 'Retrieves open tickets belonging to VIP customers',
    execute: (tickets) => {
      const vip = tickets.filter(t => {
        const c = mockService.getCustomerById(t.customerId);
        return c?.isVIP && (t.status === 'open' || t.status === 'in_progress');
      }).slice(0, 8).map(t => {
        const c = mockService.getCustomerById(t.customerId);
        return { id: t.id, subject: t.subject.slice(0, 50), company: c?.company, priority: t.priority, slaBreached: t.slaBreached, slaAtRisk: t.slaAtRisk, csat: c?.csatAvg };
      });
      return JSON.stringify({ count: vip.length, tickets: vip });
    },
  },
  get_incidents: {
    name: 'get_incidents',
    description: 'Returns all active major incidents and their impact data',
    execute: () => {
      const incidents = mockService.getIncidents().filter(i => i.status !== 'resolved');
      return JSON.stringify(incidents.map(i => ({
        id: i.id,
        title: i.title,
        severity: i.severity,
        status: i.status,
        customerImpactCount: i.customerImpactCount,
        affectedServices: i.affectedServices,
        linkedTicketIds: i.linkedTicketIds.length,
      })));
    },
  },
  get_csat_trend: {
    name: 'get_csat_trend',
    description: 'Returns 7-day CSAT score trend data',
    execute: () => {
      const trend = mockService.getCSATTrend();
      const avg = trend.reduce((s, d) => s + d.score, 0) / trend.length;
      const direction = trend[trend.length - 1].score > trend[0].score ? 'improving' : 'declining';
      return JSON.stringify({ trend: trend.map(d => ({ date: d.date, score: d.score })), avg7d: avg.toFixed(2), direction, target: 4.2 });
    },
  },
  get_top_ticket: {
    name: 'get_top_ticket',
    description: 'Returns the highest-priority open ticket for focused action',
    execute: (tickets) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const open = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
      const sorted = open.sort((a, b) => {
        if (a.slaBreached !== b.slaBreached) return a.slaBreached ? -1 : 1;
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      const t = sorted[0];
      if (!t) return JSON.stringify({ found: false });
      const c = mockService.getCustomerById(t.customerId);
      return JSON.stringify({ id: t.id, subject: t.subject, category: t.category, priority: t.priority, customer: c?.name, company: c?.company, isVIP: c?.isVIP, description: t.description.slice(0, 200), status: t.status, slaBreached: t.slaBreached });
    },
  },
};

type GoalConfig = {
  thought: string;
  tools: string[];
  buildAnswer: (results: Record<string, string>, tickets: Ticket[]) => string;
};

const GOAL_CONFIGS: Record<string, GoalConfig> = {
  triage: {
    thought: 'I need to assess the overall queue health, identify SLA violations, and check which tickets are most urgent. Let me retrieve queue data and SLA violations.',
    tools: ['get_queue_summary', 'get_sla_violations', 'get_top_ticket'],
    buildAnswer: (results) => {
      const kpis = JSON.parse(results.get_queue_summary || '{}');
      const sla = JSON.parse(results.get_sla_violations || '{}');
      const top = JSON.parse(results.get_top_ticket || '{}');
      const lines: string[] = [];
      lines.push(`**Queue Triage Report**\n`);
      lines.push(`Your queue has **${kpis.open} open tickets**. SLA health: **${sla.breachedCount} breached**, **${sla.atRiskCount} at risk**.`);
      if (sla.topBreached?.length > 0) {
        lines.push(`\n**Immediate Escalations (SLA Breached):**`);
        sla.topBreached.forEach((t: { id: string; subject: string; priority: string }) => lines.push(`• ${t.id} — ${t.subject} (${t.priority})`));
      }
      if (sla.topAtRisk?.length > 0) {
        lines.push(`\n**At-Risk Tickets (action needed soon):**`);
        sla.topAtRisk.slice(0, 3).forEach((t: { id: string; subject: string; priority: string }) => lines.push(`• ${t.id} — ${t.subject} (${t.priority})`));
      }
      if (top.found !== false) {
        lines.push(`\n**Recommended First Action:** Focus on **${top.id}** — "${top.subject}" for ${top.company}${top.isVIP ? ' (VIP)' : ''}. It is ${top.slaBreached ? 'already breached' : 'your highest priority open item'}.`);
      }
      lines.push(`\n**Performance:** MTTA ${kpis.mtta}min vs 30min target. MTTR ${kpis.mttr}h vs 6h target. FCR ${kpis.fcrRate}%.`);
      return lines.join('\n');
    },
  },
  draft_response: {
    thought: 'I need to find the highest-priority ticket first, then craft a professional response addressing the customer\'s issue.',
    tools: ['get_top_ticket'],
    buildAnswer: (results) => {
      const t = JSON.parse(results.get_top_ticket || '{}');
      if (t.found === false) return 'No open tickets found in your queue to draft a response for.';
      return `**Draft Response for ${t.id}**\n\nTo: ${t.customer} (${t.company})\nSubject: Re: ${t.subject}\n\n---\n\nDear ${t.customer?.split(' ')[0]},\n\nThank you for contacting us regarding "${t.subject}". I sincerely apologize for any inconvenience this has caused${t.isVIP ? ' — as a valued VIP customer, your experience is our top priority' : ''}.\n\nI have reviewed your case and I am personally taking ownership of this issue. Here is what I am doing right now:\n\n1. Escalating this to our ${t.category} specialist team for immediate review\n2. Setting up real-time monitoring to track resolution progress\n3. Committing to an update within the next 2 hours\n\nYour ticket reference is **${t.id}**. You can reply to this email or call us directly to check status at any time.\n\nWe value your continued partnership and will resolve this as quickly as possible.\n\nBest regards,\n[Your Name]\nCustomer Experience Team\n\n---\n*Tip: Personalize the response based on specific issue details before sending.*`;
    },
  },
  find_knowledge: {
    thought: 'I need to look at which categories have the most tickets and cross-reference with knowledge article coverage to spot gaps.',
    tools: ['get_category_breakdown', 'get_queue_summary'],
    buildAnswer: (results) => {
      const cats = JSON.parse(results.get_category_breakdown || '[]');
      const kpis = JSON.parse(results.get_queue_summary || '{}');
      const lines: string[] = [`**Knowledge Gap Analysis**\n`];
      lines.push(`With **${kpis.open} open tickets**, here are the highest-volume categories that likely need better self-serve coverage:\n`);
      cats.slice(0, 5).forEach((c: { category: string; count: number; percentage: number }, i: number) => {
        const needsArticle = c.percentage > 10;
        lines.push(`${i + 1}. **${c.category}** — ${c.count} tickets (${c.percentage}%)${needsArticle ? ' ⚠ High volume — article recommended' : ''}`);
      });
      lines.push(`\n**Recommended Article Topics:**`);
      lines.push(`• Troubleshooting guide for **${cats[0]?.category}** issues (highest volume)`);
      lines.push(`• FAQ for **${cats[1]?.category}** common questions`);
      lines.push(`• Step-by-step self-service guide for **${cats[2]?.category}**`);
      lines.push(`\nCreating these articles could deflect an estimated 15-25% of incoming tickets in these categories.`);
      return lines.join('\n');
    },
  },
  daily_briefing: {
    thought: 'I need a complete picture of queue health, urgent items, and SLA risks to build a comprehensive daily briefing.',
    tools: ['get_queue_summary', 'get_sla_violations', 'get_vip_tickets'],
    buildAnswer: (results) => {
      const kpis = JSON.parse(results.get_queue_summary || '{}');
      const sla = JSON.parse(results.get_sla_violations || '{}');
      const vip = JSON.parse(results.get_vip_tickets || '{}');
      const health = kpis.breachedSLA === 0 ? 'Healthy' : kpis.breachedSLA > 5 ? 'Critical' : 'At Risk';
      return `**Daily Briefing — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}**\n\n**Queue Status: ${health}**\n• ${kpis.open} open tickets | ${sla.breachedCount} breached | ${sla.atRiskCount} at risk\n• MTTA: ${kpis.mtta}min | MTTR: ${kpis.mttr}h | FCR: ${kpis.fcrRate}%\n\n**Where to start:**\n${sla.breachedCount > 0 ? `1. Address ${sla.breachedCount} breached ticket(s) immediately — SLA already missed\n` : ''}${sla.atRiskCount > 0 ? `${sla.breachedCount > 0 ? '2' : '1'}. Triage ${sla.atRiskCount} at-risk ticket(s) before they breach\n` : ''}${vip.count > 0 ? `• Monitor ${vip.count} VIP ticket(s) — these require elevated handling\n` : ''}\n**Today's goal:** ${kpis.fcrRate < 80 ? `Push FCR above 80% (currently ${kpis.fcrRate}%). Try to resolve tickets in one contact where possible.` : `Maintain FCR above 80% (currently ${kpis.fcrRate}%). Keep up the great work.`}`;
    },
  },
  workload_rebalance: {
    thought: 'I need to assess each agent\'s current utilization and identify tickets that can be moved from overloaded to underloaded agents.',
    tools: ['get_agent_workload', 'get_queue_summary', 'get_sla_violations'],
    buildAnswer: (results) => {
      const agents: Array<{ name: string; team: string; utilization: number; currentLoad: number; maxLoad: number; isOnline: boolean }> = JSON.parse(results.get_agent_workload || '[]');
      const kpis = JSON.parse(results.get_queue_summary || '{}');
      const overloaded = agents.filter(a => a.utilization > 85 && a.isOnline).sort((a, b) => b.utilization - a.utilization);
      const underloaded = agents.filter(a => a.utilization < 55 && a.isOnline).sort((a, b) => a.utilization - b.utilization);
      const lines: string[] = [`**Workload Rebalancing Plan**\n`];
      lines.push(`Team has **${agents.filter(a => a.isOnline).length}/${agents.length} agents online**. Overall queue: ${kpis.open} open tickets.\n`);
      if (overloaded.length > 0) {
        lines.push(`**Overloaded Agents (action needed):**`);
        overloaded.forEach(a => lines.push(`• **${a.name}** — ${a.utilization}% capacity (${a.currentLoad}/${a.maxLoad} tickets)`));
      } else {
        lines.push(`No agents are critically overloaded.`);
      }
      if (underloaded.length > 0) {
        lines.push(`\n**Available Capacity:**`);
        underloaded.slice(0, 3).forEach(a => lines.push(`• **${a.name}** — ${a.utilization}% (can take ${a.maxLoad - a.currentLoad} more tickets)`));
      }
      if (overloaded.length > 0 && underloaded.length > 0) {
        lines.push(`\n**Recommended Actions:**`);
        lines.push(`1. Move ${Math.min(3, overloaded[0].currentLoad - Math.floor(overloaded[0].maxLoad * 0.75))} tickets from **${overloaded[0].name}** to **${underloaded[0].name}**`);
        if (overloaded.length > 1 && underloaded.length > 1) {
          lines.push(`2. Move tickets from **${overloaded[1].name}** to **${underloaded[1]?.name || underloaded[0].name}**`);
        }
        lines.push(`3. Prioritize reassigning breached and VIP tickets first`);
      }
      return lines.join('\n');
    },
  },
  sla_risk_report: {
    thought: 'I need to gather all SLA breaches and at-risk tickets, then group them by category and team for a targeted escalation plan.',
    tools: ['get_sla_violations', 'get_category_breakdown', 'get_agent_workload'],
    buildAnswer: (results) => {
      const sla = JSON.parse(results.get_sla_violations || '{}');
      const cats: Array<{ category: string; count: number; percentage: number }> = JSON.parse(results.get_category_breakdown || '[]');
      const lines: string[] = [`**SLA Risk Report**\n`];
      const riskScore = sla.breachedCount > 10 ? 'CRITICAL' : sla.breachedCount > 5 ? 'HIGH' : sla.breachedCount > 0 ? 'MEDIUM' : 'LOW';
      lines.push(`**Risk Level: ${riskScore}** — ${sla.breachedCount} breached, ${sla.atRiskCount} at risk\n`);
      if (sla.topBreached?.length > 0) {
        lines.push(`**Breached Tickets (escalate immediately):**`);
        sla.topBreached.forEach((t: { id: string; priority: string; subject: string; category: string }) => lines.push(`• ${t.id} [${t.priority.toUpperCase()}] — ${t.subject} | ${t.category}`));
      }
      if (sla.topAtRisk?.length > 0) {
        lines.push(`\n**At-Risk Tickets (action within 1 hour):**`);
        sla.topAtRisk.forEach((t: { id: string; priority: string; subject: string; category: string }) => lines.push(`• ${t.id} [${t.priority.toUpperCase()}] — ${t.subject} | ${t.category}`));
      }
      const topCat = cats[0];
      lines.push(`\n**Escalation Steps:**`);
      lines.push(`1. Page the on-call engineer for all Critical/High breached tickets`);
      lines.push(`2. ${topCat ? `Assign additional agents to **${topCat.category}** (highest volume: ${topCat.count} tickets)` : 'Review category distribution and assign specialists'}`);
      lines.push(`3. Send proactive status updates to all customers with breached SLA tickets`);
      lines.push(`4. Review at-risk tickets in next 30 minutes to prevent further breaches`);
      return lines.join('\n');
    },
  },
  csat_analysis: {
    thought: 'I need CSAT trend data, category breakdown, and agent workload to identify which areas are dragging down customer satisfaction.',
    tools: ['get_csat_trend', 'get_category_breakdown', 'get_queue_summary'],
    buildAnswer: (results) => {
      const csat = JSON.parse(results.get_csat_trend || '{}');
      const cats: Array<{ category: string; count: number; percentage: number }> = JSON.parse(results.get_category_breakdown || '[]');
      const kpis = JSON.parse(results.get_queue_summary || '{}');
      const lines: string[] = [`**CSAT Root Cause Analysis**\n`];
      const status = parseFloat(csat.avg7d) >= 4.2 ? 'above target' : 'below target';
      lines.push(`**7-Day CSAT: ${csat.avg7d}/5** (${status}, target 4.2) — trend is **${csat.direction}**\n`);
      lines.push(`**Key Drivers to Investigate:**`);
      lines.push(`• Tickets with negative outcomes in high-volume categories drive scores down`);
      cats.slice(0, 3).forEach((c, i) => lines.push(`${i + 1}. **${c.category}** (${c.count} tickets, ${c.percentage}% of volume) — check resolution quality`));
      lines.push(`\n**Performance Context:**`);
      lines.push(`• FCR at **${kpis.fcrRate}%** — tickets reopened more often tend to generate lower CSAT`);
      lines.push(`• ${kpis.breachedSLA} SLA breaches correlate directly with negative CSAT ratings`);
      lines.push(`\n**Improvement Actions:**`);
      lines.push(`1. Review last 20 tickets with CSAT below 3 — identify common failure patterns`);
      lines.push(`2. Coach agents with repeated negative scores on tone and resolution clarity`);
      lines.push(`3. Create follow-up outreach program for recently closed VIP tickets`);
      lines.push(`4. ${parseFloat(csat.avg7d) < 4.2 ? `Target +0.${Math.round((4.2 - parseFloat(csat.avg7d)) * 10)} improvement by focusing on first-contact resolution` : 'Maintain current performance standards to keep CSAT above target'}`);
      return lines.join('\n');
    },
  },
  ops_briefing: {
    thought: 'I need a full picture: queue health, agent workload, active incidents, and category trends for a complete operations briefing.',
    tools: ['get_queue_summary', 'get_agent_workload', 'get_incidents', 'get_category_breakdown'],
    buildAnswer: (results) => {
      const kpis = JSON.parse(results.get_queue_summary || '{}');
      const agents: Array<{ name: string; utilization: number; isOnline: boolean }> = JSON.parse(results.get_agent_workload || '[]');
      const incidents: Array<{ id: string; title: string; severity: string; customerImpactCount: number }> = JSON.parse(results.get_incidents || '[]');
      const cats: Array<{ category: string; count: number }> = JSON.parse(results.get_category_breakdown || '[]');
      const overloaded = agents.filter(a => a.utilization > 85);
      const lines: string[] = [`**Operations Briefing — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}**\n`];
      lines.push(`**Queue Health:**`);
      lines.push(`${kpis.open} open | ${kpis.breachedSLA} breached | ${kpis.atRiskSLA} at-risk | CSAT ${kpis.csat?.toFixed(1)}/5 | FCR ${kpis.fcrRate}%\n`);
      lines.push(`**Team Status:**`);
      lines.push(`${agents.filter(a => a.isOnline).length}/${agents.length} agents online${overloaded.length > 0 ? ` | ⚠ ${overloaded.length} agent(s) at >85% capacity: ${overloaded.map(a => a.name).join(', ')}` : ' | All agents within normal capacity'}\n`);
      if (incidents.length > 0) {
        lines.push(`**Active Incidents (${incidents.length}):**`);
        incidents.forEach(i => lines.push(`• ${i.severity.toUpperCase()} — ${i.title} | ${i.customerImpactCount} customers impacted`));
        lines.push('');
      }
      lines.push(`**Top Contact Drivers:**`);
      cats.slice(0, 4).forEach((c, i) => lines.push(`${i + 1}. ${c.category} — ${c.count} tickets`));
      lines.push(`\n**Recommended Focus Areas:**`);
      if (kpis.breachedSLA > 0) lines.push(`• Resolve ${kpis.breachedSLA} SLA breach(es) before end of shift`);
      if (overloaded.length > 0) lines.push(`• Rebalance workload for: ${overloaded.map(a => a.name).join(', ')}`);
      if (incidents.length > 0) lines.push(`• Monitor active incident(s) and update customer communications`);
      return lines.join('\n');
    },
  },
  exec_briefing: {
    thought: 'I need high-level KPIs, incident status, VIP health, and CSAT trends to build an executive briefing.',
    tools: ['get_queue_summary', 'get_incidents', 'get_vip_tickets', 'get_csat_trend'],
    buildAnswer: (results) => {
      const kpis = JSON.parse(results.get_queue_summary || '{}');
      const incidents: Array<{ id: string; severity: string; title: string; customerImpactCount: number }> = JSON.parse(results.get_incidents || '[]');
      const vip = JSON.parse(results.get_vip_tickets || '{}');
      const csat = JSON.parse(results.get_csat_trend || '{}');
      const csatStatus = parseFloat(csat.avg7d) >= 4.2 ? 'on target' : 'below target';
      const slaCompliance = Math.max(0, 100 - (kpis.breachedSLA / Math.max(kpis.open, 1) * 100)).toFixed(0);
      const lines: string[] = [`**Executive Briefing — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}**\n`];
      lines.push(`**Customer Health:** ${incidents.length > 0 ? `⚠ ${incidents.length} active incident(s) impacting ${incidents.reduce((s, i) => s + i.customerImpactCount, 0)} customers` : 'No active incidents — systems nominal'}`);
      lines.push(`**CSAT:** ${csat.avg7d}/5 (${csatStatus}, target 4.2) — ${csat.direction} trend`);
      lines.push(`**SLA Compliance:** ${slaCompliance}% (target 95%) — ${kpis.breachedSLA} active breach(es)`);
      lines.push(`**VIP Risk:** ${vip.count} open VIP ticket(s) requiring attention\n`);
      if (incidents.length > 0) {
        lines.push(`**Active Incidents:**`);
        incidents.forEach(i => lines.push(`• ${i.severity.toUpperCase()} — "${i.title}" — ${i.customerImpactCount} customers impacted`));
        lines.push('');
      }
      lines.push(`**Strategic KPIs vs Targets:**`);
      lines.push(`• CSAT: ${kpis.csat?.toFixed(2)} / 4.2 ${kpis.csat >= 4.2 ? '✓' : '✗'}`);
      lines.push(`• FCR: ${kpis.fcrRate}% / 80% ${parseFloat(kpis.fcrRate) >= 80 ? '✓' : '✗'}`);
      lines.push(`• SLA Compliance: ${slaCompliance}% / 95% ${parseFloat(slaCompliance) >= 95 ? '✓' : '✗'}`);
      lines.push(`• MTTR: ${kpis.mttr}h / 6h ${parseFloat(kpis.mttr) <= 6 ? '✓' : '✗'}`);
      return lines.join('\n');
    },
  },
  vip_risk: {
    thought: 'I need to review all open VIP tickets, their SLA status, and CSAT history to identify accounts at churn risk.',
    tools: ['get_vip_tickets', 'get_queue_summary', 'get_csat_trend'],
    buildAnswer: (results) => {
      const vip = JSON.parse(results.get_vip_tickets || '{}');
      const kpis = JSON.parse(results.get_queue_summary || '{}');
      const lines: string[] = [`**VIP Risk Assessment**\n`];
      lines.push(`**${vip.count} open VIP ticket(s)** across active accounts.\n`);
      if (vip.tickets?.length > 0) {
        lines.push(`**VIP Account Status:**`);
        vip.tickets.forEach((t: { company: string; id: string; priority: string; slaBreached: boolean; slaAtRisk: boolean; csat: number }) => {
          const riskFlag = t.slaBreached ? '🔴 BREACH' : t.slaAtRisk ? '🟡 AT RISK' : '🟢 OK';
          lines.push(`• ${t.company} — Ticket ${t.id} [${t.priority}] ${riskFlag}${t.csat ? ` | CSAT ${t.csat.toFixed(1)}` : ''}`);
        });
      }
      const breachedVip = vip.tickets?.filter((t: { slaBreached: boolean }) => t.slaBreached) || [];
      const atRiskVip = vip.tickets?.filter((t: { slaAtRisk: boolean; slaBreached: boolean }) => t.slaAtRisk && !t.slaBreached) || [];
      lines.push(`\n**Risk Summary:**`);
      lines.push(`• ${breachedVip.length} VIP account(s) with breached SLA — immediate churn risk`);
      lines.push(`• ${atRiskVip.length} VIP account(s) approaching SLA breach — escalate proactively`);
      lines.push(`\n**Recommended Actions:**`);
      if (breachedVip.length > 0) lines.push(`1. Executive sponsor outreach to ${breachedVip.map((t: { company: string }) => t.company).join(', ')} today`);
      lines.push(`2. Assign senior agents to all open VIP tickets`);
      lines.push(`3. Schedule proactive QBR touchpoints for accounts with CSAT below 3.5`);
      lines.push(`4. Brief Customer Success team on all active VIP issues by EOD`);
      return lines.join('\n');
    },
  },
  incident_impact: {
    thought: 'I need to pull all active incident data and cross-reference with VIP and ticket data to build a complete impact summary.',
    tools: ['get_incidents', 'get_vip_tickets', 'get_queue_summary'],
    buildAnswer: (results) => {
      const incidents: Array<{ id: string; title: string; severity: string; status: string; customerImpactCount: number; affectedServices: string[]; linkedTicketIds: number }> = JSON.parse(results.get_incidents || '[]');
      const vip = JSON.parse(results.get_vip_tickets || '{}');
      const lines: string[] = [`**Incident Impact Summary**\n`];
      if (incidents.length === 0) {
        lines.push(`No active major incidents at this time. All systems are operating within normal parameters.`);
        return lines.join('\n');
      }
      lines.push(`**${incidents.length} Active Incident(s)** — Total customer impact: **${incidents.reduce((s, i) => s + i.customerImpactCount, 0)} customers**\n`);
      incidents.forEach(i => {
        lines.push(`**${i.severity.toUpperCase()} — ${i.title}**`);
        lines.push(`• Status: ${i.status} | Impact: ${i.customerImpactCount} customers | ${i.linkedTicketIds} linked tickets`);
        lines.push(`• Affected: ${i.affectedServices.join(', ')}`);
        lines.push('');
      });
      if (vip.count > 0) lines.push(`**VIP Exposure:** ${vip.count} VIP tickets open — some may be incident-related\n`);
      lines.push(`**Executive Actions Required:**`);
      const criticalIncidents = incidents.filter(i => i.severity === 'sev1');
      if (criticalIncidents.length > 0) lines.push(`1. Convene war room for ${criticalIncidents.length} SEV1 incident(s) — CEO-level visibility required`);
      lines.push(`2. Prepare customer communication for all accounts with >100 impacted users`);
      lines.push(`3. Assign executive sponsor to incidents affecting VIP/strategic accounts`);
      lines.push(`4. Schedule 30-min incident review call for this afternoon`);
      return lines.join('\n');
    },
  },
  kpi_forecast: {
    thought: 'I need current KPI values and targets to calculate gaps and forecast trajectory based on trends.',
    tools: ['get_queue_summary', 'get_csat_trend', 'get_sla_violations'],
    buildAnswer: (results) => {
      const kpis = JSON.parse(results.get_queue_summary || '{}');
      const csat = JSON.parse(results.get_csat_trend || '{}');
      const sla = JSON.parse(results.get_sla_violations || '{}');
      const slaComp = Math.max(0, 100 - (sla.breachedCount / Math.max(kpis.open, 1) * 100));
      const lines: string[] = [`**KPI Forecast & Gap Analysis**\n`];
      lines.push(`**Period:** ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n`);

      const metrics = [
        { name: 'CSAT Score', current: parseFloat(kpis.csat?.toFixed(2)), target: 4.2, unit: '/5', higher: true },
        { name: 'FCR Rate', current: parseFloat(kpis.fcrRate), target: 80, unit: '%', higher: true },
        { name: 'SLA Compliance', current: parseFloat(slaComp.toFixed(1)), target: 95, unit: '%', higher: true },
        { name: 'MTTA', current: parseFloat(kpis.mtta), target: 30, unit: 'min', higher: false },
        { name: 'MTTR', current: parseFloat(kpis.mttr), target: 6, unit: 'h', higher: false },
      ];

      lines.push(`**KPI Status vs Targets:**`);
      metrics.forEach(m => {
        const onTrack = m.higher ? m.current >= m.target : m.current <= m.target;
        const gap = m.higher ? (m.target - m.current).toFixed(1) : (m.current - m.target).toFixed(1);
        const status = onTrack ? '✓ On Track' : `✗ Gap: ${gap}${m.unit}`;
        lines.push(`• **${m.name}:** ${m.current}${m.unit} / ${m.target}${m.unit} — ${status}`);
      });

      const offTrack = metrics.filter(m => m.higher ? m.current < m.target : m.current > m.target);
      if (offTrack.length > 0) {
        lines.push(`\n**At-Risk Goals (${offTrack.length} of 5 KPIs):**`);
        offTrack.forEach(m => {
          lines.push(`• **${m.name}:** Needs ${Math.abs(m.higher ? m.target - m.current : m.current - m.target).toFixed(1)}${m.unit} improvement to hit target`);
        });
      } else {
        lines.push(`\n**All KPIs are on track.** Focus on maintaining current performance levels.`);
      }

      lines.push(`\n**CSAT Trend:** ${csat.direction === 'improving' ? 'Improving — trajectory is positive' : 'Declining — intervention needed to reverse the trend'}`);
      return lines.join('\n');
    },
  },
};

export function useAgenticAI(role: Role, tickets: Ticket[]) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const tasks = ROLE_TASKS[role];

  const runTask = useCallback((task: AgentTask) => {
    if (isRunning) return;

    const config = GOAL_CONFIGS[task.id];
    if (!config) return;

    setIsRunning(true);
    setActiveTaskId(task.id);

    const msgId = `run-${Date.now()}`;
    const toolDefs = config.tools.map(toolId => ALL_TOOLS[toolId]).filter(Boolean);

    const agentMsg: AgentMessage = {
      id: msgId,
      role: 'agent',
      content: '',
      steps: [],
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, agentMsg]);

    const steps: AgentStep[] = [];
    let stepDelay = 400;

    const addStep = (step: AgentStep, delay: number) => {
      setTimeout(() => {
        steps.push(step);
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, steps: [...steps] } : m
        ));
      }, delay);
    };

    addStep({
      id: `thought-${msgId}`,
      type: 'thought',
      content: config.thought,
      timestamp: new Date(),
    }, stepDelay);
    stepDelay += 700;

    const toolResults: Record<string, string> = {};

    toolDefs.forEach((tool, idx) => {
      const toolCallStep: AgentStep = {
        id: `tool-call-${idx}-${msgId}`,
        type: 'tool_call',
        content: `Calling ${tool.name}`,
        tool: { id: tool.name, name: tool.name, description: tool.description, status: 'running' },
        timestamp: new Date(),
      };
      addStep(toolCallStep, stepDelay);
      stepDelay += 500;

      const toolDelay = stepDelay;
      setTimeout(() => {
        const result = tool.execute(tickets);
        toolResults[tool.name] = result;

        const toolResultStep: AgentStep = {
          id: `tool-result-${idx}-${msgId}`,
          type: 'tool_result',
          content: result,
          tool: { id: tool.name, name: tool.name, description: tool.description, status: 'done', result },
          timestamp: new Date(),
        };
        steps.push(toolResultStep);
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, steps: [...steps] } : m
        ));
      }, toolDelay + 300);

      stepDelay += 800;
    });

    const finalDelay = stepDelay + 600;
    setTimeout(() => {
      const answer = config.buildAnswer(toolResults, tickets);
      const answerStep: AgentStep = {
        id: `answer-${msgId}`,
        type: 'answer',
        content: answer,
        timestamp: new Date(),
      };
      steps.push(answerStep);
      setMessages(prev => prev.map(m =>
        m.id === msgId
          ? { ...m, steps: [...steps], content: answer, isStreaming: false }
          : m
      ));
      setIsRunning(false);
      setActiveTaskId(null);
    }, finalDelay);
  }, [isRunning, tickets]);

  const sendMessage = useCallback((content: string) => {
    if (isRunning) return;
    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    const matchedTask = tasks.find(t =>
      content.toLowerCase().includes(t.label.toLowerCase()) ||
      content.toLowerCase().includes(t.id.toLowerCase())
    );

    if (matchedTask) {
      setTimeout(() => runTask(matchedTask), 200);
    } else {
      setTimeout(() => {
        const replyMsg: AgentMessage = {
          id: `reply-${Date.now()}`,
          role: 'agent',
          content: `I can run specific agentic tasks for you. Try selecting one of the task buttons above, or ask me to run a task like "${tasks[0].label}".`,
          steps: [],
          timestamp: new Date(),
          isStreaming: false,
        };
        setMessages(prev => [...prev, replyMsg]);
      }, 500);
    }
  }, [isRunning, tasks, runTask]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsRunning(false);
    setActiveTaskId(null);
  }, []);

  return { messages, isRunning, activeTaskId, tasks, runTask, sendMessage, clearMessages };
}
