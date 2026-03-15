import { useState, useCallback } from 'react';
import type { Role, Ticket } from '../types';
import { mockService } from '../data/mockService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type TypingState = boolean;

const SUGGESTIONS: Record<Role, string[]> = {
  agent: [
    'Which tickets are at risk of breaching SLA?',
    'Summarize my current queue',
    'What are the top categories today?',
    'Show me VIP tickets needing attention',
  ],
  manager: [
    'Who has the highest workload right now?',
    'How is team SLA performance trending?',
    'Which contact drivers are spiking?',
    'Summarize today\'s key metrics',
  ],
  exec: [
    'What is our CSAT health?',
    'Are there active incidents impacting VIPs?',
    'How are we tracking against strategic KPIs?',
    'Summarize the top risk areas',
  ],
};

function generateResponse(query: string, role: Role, tickets: Ticket[]): string {
  const kpis = mockService.getKPIs(tickets);
  const q = query.toLowerCase();

  const breachedTickets = tickets.filter(t => t.slaBreached);
  const atRiskTickets = tickets.filter(t => t.slaAtRisk && !t.slaBreached);
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const vipTickets = tickets.filter(t => {
    const c = mockService.getCustomerById(t.customerId);
    return c?.isVIP && (t.status === 'open' || t.status === 'in_progress');
  });

  if (q.includes('sla') && (q.includes('breach') || q.includes('risk') || q.includes('at risk'))) {
    if (breachedTickets.length === 0 && atRiskTickets.length === 0) {
      return `Good news — no SLA breaches or at-risk tickets at the moment. All ${openTickets.length} open tickets are within their SLA windows.`;
    }
    let resp = '';
    if (breachedTickets.length > 0) {
      const top = breachedTickets.slice(0, 3).map(t => `**${t.id}** (${t.priority})`).join(', ');
      resp += `There are **${breachedTickets.length} breached tickets** requiring immediate escalation. Top ones: ${top}.\n\n`;
    }
    if (atRiskTickets.length > 0) {
      resp += `Additionally, **${atRiskTickets.length} tickets** are at risk of breaching. I recommend prioritizing any critical or high-priority items in that group first.`;
    }
    return resp.trim();
  }

  if (q.includes('queue') || q.includes('summarize') || q.includes('summary') || q.includes('overview')) {
    if (role === 'agent') {
      return `Your current queue has **${openTickets.length} open tickets**:\n- **${breachedTickets.length}** SLA breached\n- **${atRiskTickets.length}** at risk\n- **${vipTickets.length}** from VIP customers\n\nMTTA is ${kpis.mtta} min (target <30 min) and MTTR is ${kpis.mttr}h (target <6h). FCR rate stands at ${kpis.fcrRate}%.`;
    }
    if (role === 'manager') {
      const agents = mockService.getAgents().filter(a => a.role === 'agent');
      const overloaded = agents.filter(a => (a.currentLoad / a.maxLoad) > 0.9);
      return `Operations summary:\n- **${openTickets.length}** open tickets across all queues\n- **${kpis.breachedSLA}** SLA breaches, **${kpis.atRiskSLA}** at risk\n- CSAT at **${kpis.csat.toFixed(1)}/5**\n- FCR rate: **${kpis.fcrRate}%**\n${overloaded.length > 0 ? `\n⚠️ **${overloaded.length} agent(s)** at >90% capacity: ${overloaded.map(a => a.name).join(', ')}.` : ''}`;
    }
    if (role === 'exec') {
      const incidents = mockService.getIncidents().filter(i => i.status !== 'resolved');
      const impacted = incidents.reduce((sum, i) => sum + i.customerImpactCount, 0);
      return `Executive summary:\n- **${incidents.length} active incident(s)** impacting **${impacted} customers**\n- CSAT: **${kpis.csat.toFixed(2)}/5** (target 4.2)\n- SLA compliance: **${(100 - (kpis.breachedSLA / Math.max(kpis.openCount, 1) * 100)).toFixed(0)}%**\n- **${vipTickets.length}** open VIP tickets\n- FCR: **${kpis.fcrRate}%**`;
    }
  }

  if (q.includes('vip') || q.includes('vip ticket')) {
    if (vipTickets.length === 0) return 'No open VIP tickets right now. All VIP accounts appear healthy.';
    const top = vipTickets.slice(0, 3).map(t => {
      const c = mockService.getCustomerById(t.customerId);
      return `**${t.id}** — ${c?.company} (${t.priority})`;
    }).join('\n- ');
    return `There are **${vipTickets.length} open VIP tickets**:\n- ${top}\n\nEnsure these are assigned to senior agents and that SLA timers are actively monitored.`;
  }

  if (q.includes('workload') || q.includes('capacity') || q.includes('agent')) {
    const agents = mockService.getAgents().filter(a => a.role === 'agent');
    const sorted = agents.sort((a, b) => (b.currentLoad / b.maxLoad) - (a.currentLoad / a.maxLoad));
    const top3 = sorted.slice(0, 3).map(a => `**${a.name}** — ${Math.round((a.currentLoad / a.maxLoad) * 100)}% capacity`).join('\n- ');
    const offline = agents.filter(a => !a.isOnline);
    return `Current agent workload (highest first):\n- ${top3}\n\n${offline.length > 0 ? `${offline.map(a => a.name).join(', ')} ${offline.length === 1 ? 'is' : 'are'} currently offline.` : 'All agents are online.'}`;
  }

  if (q.includes('csat') || q.includes('satisfaction') || q.includes('score')) {
    const trend = mockService.getCSATTrend();
    const latest = trend[trend.length - 1]?.score ?? kpis.csat;
    const status = kpis.csat >= 4.2 ? 'above' : 'below';
    return `CSAT is currently **${kpis.csat.toFixed(2)}/5**, which is ${status} the 4.2 target. The most recent day score is **${latest.toFixed(2)}**.\n\nCategories with the most negative sentiment are typically billing and technical outages. Consider proactive outreach to recently resolved VIP tickets.`;
  }

  if (q.includes('incident') || q.includes('outage')) {
    const incidents = mockService.getIncidents().filter(i => i.status !== 'resolved');
    if (incidents.length === 0) return 'No active major incidents right now. All systems are operating normally.';
    const list = incidents.map(i => `**${i.id}** — ${i.title} (${i.severity.toUpperCase()}, ${i.customerImpactCount} customers impacted)`).join('\n- ');
    return `**${incidents.length} active major incident(s):**\n- ${list}\n\nNavigate to the Incidents page for full details, timeline, and action items.`;
  }

  if (q.includes('categor') || q.includes('driver') || q.includes('contact driver') || q.includes('spike')) {
    const cats = mockService.getCategoryBreakdown(tickets);
    const sorted = cats.sort((a, b) => b.count - a.count).slice(0, 4);
    const list = sorted.map(c => `**${c.category}** — ${c.count} tickets (${c.percentage}%)`).join('\n- ');
    return `Top contact drivers right now:\n- ${list}\n\nIf any category is spiking unexpectedly, check for a linked incident or recent product change.`;
  }

  if (q.includes('kpi') || q.includes('metric') || q.includes('strategic')) {
    return `Strategic KPI snapshot:\n- **CSAT:** ${kpis.csat.toFixed(2)}/5 (target 4.2)\n- **FCR:** ${kpis.fcrRate}% (target >80%)\n- **MTTA:** ${kpis.mtta} min (target <30 min)\n- **MTTR:** ${kpis.mttr}h (target <6h)\n- **SLA Compliance:** ${(100 - (kpis.breachedSLA / Math.max(kpis.openCount, 1) * 100)).toFixed(0)}% (target 95%)`;
  }

  if (q.includes('trend') || q.includes('trending') || q.includes('sla') && q.includes('trend')) {
    return `Based on current data, SLA breach rate is at **${((kpis.breachedSLA / Math.max(kpis.openCount, 1)) * 100).toFixed(1)}%** of open tickets. With **${kpis.atRiskSLA}** tickets at risk, this could increase over the next few hours. I recommend reviewing the SLA Urgent Queue and redistributing load from high-capacity agents.`;
  }

  const fallbacks = [
    `I can help you analyze ticket queues, SLA performance, CSAT trends, agent workload, incident status, and contact drivers. Try asking something like "${SUGGESTIONS[role][0]}".`,
    `I don't have a specific answer for that, but I can summarize your current queue, highlight SLA risks, or break down contact drivers. What would you like to know?`,
    `That's outside my current scope, but I can help with operational metrics, VIP ticket health, and team performance. Ask me about your dashboard data!`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export function useAIChat(role: Role, tickets: Ticket[]) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: role === 'agent'
        ? 'Hi! I\'m your CX AI assistant. I can help you prioritize your queue, surface SLA risks, and surface key insights. What would you like to know?'
        : role === 'manager'
        ? 'Hi! I\'m your CX AI assistant. Ask me about team workload, SLA health, contact drivers, or agent performance.'
        : 'Hi! I\'m your CX AI assistant. I can provide executive-level insights on CSAT, incidents, VIP health, and strategic KPIs.',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState<TypingState>(false);

  const sendMessage = useCallback((content: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const response = generateResponse(content, role, tickets);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, delay);
  }, [role, tickets]);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: 'welcome-reset',
      role: 'assistant',
      content: role === 'agent'
        ? 'Hi! I\'m your CX AI assistant. I can help you prioritize your queue, surface SLA risks, and surface key insights. What would you like to know?'
        : role === 'manager'
        ? 'Hi! I\'m your CX AI assistant. Ask me about team workload, SLA health, contact drivers, or agent performance.'
        : 'Hi! I\'m your CX AI assistant. I can provide executive-level insights on CSAT, incidents, VIP health, and strategic KPIs.',
      timestamp: new Date(),
    }]);
  }, [role]);

  return { messages, isTyping, sendMessage, clearMessages, suggestions: SUGGESTIONS[role] };
}
