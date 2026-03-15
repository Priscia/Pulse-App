import type {
  Agent, Customer, Ticket, MajorIncident, KnowledgeArticle,
  ChannelMetric, FailedSearch, TicketStatus, TicketPriority,
  TicketChannel, TicketComment, TicketTimelineEvent, NetworkUpdate, CyberSecurityAlert
} from '../types';

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

export const AGENTS: Agent[] = [
  { id: 'a1', name: 'Sarah Chen', email: 'schen@company.com', role: 'agent', team: 'L1 General', avatar: 'SC', isOnline: true, currentLoad: 8, maxLoad: 12, skills: ['billing', 'account'] },
  { id: 'a2', name: 'Marcus Williams', email: 'mwilliams@company.com', role: 'agent', team: 'L1 General', avatar: 'MW', isOnline: true, currentLoad: 11, maxLoad: 12, skills: ['technical', 'api'] },
  { id: 'a3', name: 'Priya Sharma', email: 'psharma@company.com', role: 'agent', team: 'L2 Technical', avatar: 'PS', isOnline: true, currentLoad: 5, maxLoad: 8, skills: ['api', 'integrations', 'technical'] },
  { id: 'a4', name: 'James O\'Brien', email: 'jobrien@company.com', role: 'agent', team: 'L2 Technical', avatar: 'JO', isOnline: false, currentLoad: 3, maxLoad: 8, skills: ['security', 'compliance'] },
  { id: 'a5', name: 'Keiko Tanaka', email: 'ktanaka@company.com', role: 'agent', team: 'L1 General', avatar: 'KT', isOnline: true, currentLoad: 9, maxLoad: 12, skills: ['billing', 'payments'] },
  { id: 'a6', name: 'David Park', email: 'dpark@company.com', role: 'agent', team: 'L2 Technical', avatar: 'DP', isOnline: true, currentLoad: 6, maxLoad: 8, skills: ['integrations', 'webhook'] },
  { id: 'a7', name: 'Elena Rodriguez', email: 'erodriguez@company.com', role: 'agent', team: 'L1 General', avatar: 'ER', isOnline: false, currentLoad: 0, maxLoad: 12, skills: ['general', 'onboarding'] },
  { id: 'a8', name: 'Tom Nguyen', email: 'tnguyen@company.com', role: 'agent', team: 'L3 Expert', avatar: 'TN', isOnline: true, currentLoad: 2, maxLoad: 5, skills: ['security', 'api', 'compliance'] },
  { id: 'a9', name: 'Priscia Kibibi', email: 'pkibibi@company.com', role: 'manager', team: 'Support', avatar: 'PK', isOnline: true, currentLoad: 0, maxLoad: 0, skills: ['management'] },
  { id: 'a10', name: 'Rachel Kim', email: 'rkim@company.com', role: 'agent', team: 'L1 General', avatar: 'RK', isOnline: true, currentLoad: 10, maxLoad: 12, skills: ['billing', 'general'] },
];

export const CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Alice Thompson', company: 'Apex Dynamics', email: 'alice@apexdynamics.com', phone: '+1-555-0101', isVIP: true, slaTier: 'platinum', revenueImpact: 'critical', isRegulatory: true, region: 'AMER', csatAvg: 4.2 },
  { id: 'c2', name: 'Bob Martinez', company: 'Nexus Corp', email: 'bob@nexuscorp.com', phone: '+1-555-0102', isVIP: true, slaTier: 'platinum', revenueImpact: 'critical', isRegulatory: false, region: 'AMER', csatAvg: 3.8 },
  { id: 'c3', name: 'Claire Dubois', company: 'Euro Finance SA', email: 'cdubois@eurofinance.com', phone: '+33-555-0103', isVIP: true, slaTier: 'gold', revenueImpact: 'high', isRegulatory: true, region: 'EMEA', csatAvg: 4.5 },
  { id: 'c4', name: 'Hiroshi Yamamoto', company: 'Pacific Technologies', email: 'hyamamoto@pacifictech.co.jp', phone: '+81-555-0104', isVIP: true, slaTier: 'gold', revenueImpact: 'high', isRegulatory: false, region: 'APAC', csatAvg: 4.7 },
  { id: 'c5', name: 'Sandra Mills', company: 'Global Healthcare', email: 'smills@globalhealthcare.com', phone: '+1-555-0105', isVIP: true, slaTier: 'platinum', revenueImpact: 'critical', isRegulatory: true, region: 'AMER', csatAvg: 3.5 },
  { id: 'c6', name: 'Kevin Okafor', company: 'StartupHub', email: 'kokafor@startuphub.io', phone: '+1-555-0106', isVIP: false, slaTier: 'silver', revenueImpact: 'low', isRegulatory: false, region: 'AMER', csatAvg: 4.1 },
  { id: 'c7', name: 'Maria Santos', company: 'Iberian Retail', email: 'msantos@iberianretail.es', phone: '+34-555-0107', isVIP: false, slaTier: 'bronze', revenueImpact: 'low', isRegulatory: false, region: 'EMEA', csatAvg: 3.9 },
  { id: 'c8', name: 'Jake Wilson', company: 'Cloud Ventures', email: 'jwilson@cloudventures.com', phone: '+1-555-0108', isVIP: false, slaTier: 'gold', revenueImpact: 'medium', isRegulatory: false, region: 'AMER', csatAvg: 4.3 },
  { id: 'c9', name: 'Fatima Al-Rashid', company: 'Gulf Enterprises', email: 'falrashid@gulfent.ae', phone: '+971-555-0109', isVIP: false, slaTier: 'silver', revenueImpact: 'medium', isRegulatory: false, region: 'EMEA', csatAvg: 4.0 },
  { id: 'c10', name: 'Liam Murphy', company: 'Celtic Software', email: 'lmurphy@celticsoftware.ie', phone: '+353-555-0110', isVIP: false, slaTier: 'bronze', revenueImpact: 'low', isRegulatory: false, region: 'EMEA', csatAvg: 3.7 },
  { id: 'c11', name: 'Yuki Nakamura', company: 'Tokyo Digital', email: 'ynakamura@tokyodigital.co.jp', phone: '+81-555-0111', isVIP: false, slaTier: 'silver', revenueImpact: 'medium', isRegulatory: false, region: 'APAC', csatAvg: 4.6 },
  { id: 'c12', name: 'Omar Hassan', company: 'Cairo Solutions', email: 'ohassan@cairosolutions.eg', phone: '+20-555-0112', isVIP: false, slaTier: 'bronze', revenueImpact: 'none', isRegulatory: false, region: 'EMEA', csatAvg: 3.8 },
  { id: 'c13', name: 'Natalie Cheng', company: 'Singapore FinTech', email: 'ncheng@sgfintech.sg', phone: '+65-555-0113', isVIP: false, slaTier: 'gold', revenueImpact: 'high', isRegulatory: true, region: 'APAC', csatAvg: 4.4 },
  { id: 'c14', name: 'Brandon Lee', company: 'Austin Analytics', email: 'blee@austinanalytics.com', phone: '+1-555-0114', isVIP: false, slaTier: 'silver', revenueImpact: 'medium', isRegulatory: false, region: 'AMER', csatAvg: 4.2 },
  { id: 'c15', name: 'Sophia Grant', company: 'London Logistics', email: 'sgrant@londonlogistics.co.uk', phone: '+44-555-0115', isVIP: false, slaTier: 'silver', revenueImpact: 'medium', isRegulatory: false, region: 'EMEA', csatAvg: 3.9 },
];

const CATEGORIES = ['Billing & Payments', 'API Integration', 'Account Access', 'Performance Issues', 'Data Export', 'Security & Compliance', 'Onboarding', 'Feature Request', 'Bug Report', 'Webhook Configuration'];
const PRODUCTS = ['Core Platform', 'Analytics Suite', 'API Gateway', 'Mobile SDK', 'Data Pipeline', 'Security Module', 'Reporting Engine'];
const TAGS = ['vip-escalation', 'regression', 'needs-engineering', 'workaround-available', 'billing-sensitive', 'compliance', 'high-visibility', 'customer-frustrated', 'quick-win'];

const TICKET_SUBJECTS: Record<string, string[]> = {
  'Billing & Payments': ['Invoice discrepancy for Q4', 'Unable to update payment method', 'Unexpected charge on account', 'Billing cycle reset issue', 'Payment failed - card declined'],
  'API Integration': ['API rate limit exceeded unexpectedly', 'OAuth token expiry issue', 'Webhook payload malformed', 'API v2 migration breaking changes', 'SDK authentication failure'],
  'Account Access': ['Cannot log in after password reset', 'SSO configuration broken', 'User permissions not updating', 'MFA device lost access', 'Account suspended unexpectedly'],
  'Performance Issues': ['Dashboard loading extremely slow', 'Reports timing out on large datasets', 'Batch job taking 10x longer', 'High latency on data ingestion endpoint', 'Search queries degraded'],
  'Data Export': ['CSV export missing columns', 'Export fails for >100k rows', 'Data format changed in export', 'Scheduled export not delivered', 'Export contains duplicate records'],
  'Security & Compliance': ['GDPR data deletion request', 'Audit log gaps detected', 'Suspicious login alert', 'SOC2 evidence request', 'Data residency question'],
  'Onboarding': ['Need help with initial setup', 'Training materials request', 'Admin configuration walkthrough', 'User provisioning bulk setup', 'First integration setup'],
  'Feature Request': ['Need dark mode support', 'Request for advanced filtering', 'API bulk operations needed', 'Custom webhook headers', 'Multi-tenant dashboard view'],
  'Bug Report': ['UI button unresponsive in Firefox', 'Tooltip shows wrong data', 'Filter state lost on refresh', 'Notification not triggering', 'Date picker off by one day'],
  'Webhook Configuration': ['Webhook not firing on update events', 'Signature verification failing', 'Retry logic not working', 'Test webhook endpoint unreachable', 'Payload size limit hit'],
};

function getResolutionHours(priority: TicketPriority): number {
  const map: Record<TicketPriority, number> = { critical: 4, high: 8, medium: 24, low: 72 };
  return map[priority];
}

function getFirstResponseMinutes(priority: TicketPriority): number {
  const map: Record<TicketPriority, number> = { critical: 15, high: 60, medium: 240, low: 480 };
  return map[priority];
}

function generateTicket(id: number, createdDaysAgo: number): Ticket {
  const category = rand(CATEGORIES);
  const priority = rand<TicketPriority>(['critical', 'high', 'medium', 'medium', 'low', 'low']);
  const status = rand<TicketStatus>(['open', 'open', 'in_progress', 'in_progress', 'pending', 'resolved', 'resolved', 'closed']);
  const channel = rand<TicketChannel>(['email', 'email', 'phone', 'chat', 'web', 'api']);
  const customer = rand(CUSTOMERS);
  const assignee = Math.random() > 0.15 ? rand(AGENTS) : null;
  const createdAt = daysAgo(createdDaysAgo + Math.random());
  const resHours = getResolutionHours(priority);
  const frMinutes = getFirstResponseMinutes(priority);
  const slaDueAt = new Date(new Date(createdAt).getTime() + resHours * 3600000).toISOString();
  const slaFirstResponseDue = new Date(new Date(createdAt).getTime() + frMinutes * 60000).toISOString();
  const isOld = createdDaysAgo > resHours / 24;
  const slaBreached = (status === 'open' || status === 'in_progress') && isOld && Math.random() > 0.6;
  const slaAtRisk = !slaBreached && (status === 'open' || status === 'in_progress') && Math.random() > 0.65;
  const firstResponseAt = Math.random() > 0.2 ? new Date(new Date(createdAt).getTime() + frMinutes * 0.8 * 60000).toISOString() : null;
  const resolvedAt = (status === 'resolved' || status === 'closed') ? new Date(new Date(createdAt).getTime() + resHours * 0.9 * 3600000).toISOString() : null;
  const subjects = TICKET_SUBJECTS[category] || ['General support request'];
  const subject = rand(subjects);
  const numTags = Math.random() > 0.6 ? randInt(1, 3) : 0;
  const ticketTags = Array.from(new Set(Array.from({ length: numTags }, () => rand(TAGS))));
  if (customer.isVIP && !ticketTags.includes('vip-escalation')) ticketTags.push('vip-escalation');
  const linkedIncidentId = (priority === 'critical' && Math.random() > 0.7) ? (Math.random() > 0.5 ? 'inc1' : 'inc2') : null;
  const comments: TicketComment[] = [];
  const timeline: TicketTimelineEvent[] = [
    { id: `tl${id}-1`, type: 'created', description: `Ticket created via ${channel}`, actorName: customer.name, createdAt }
  ];
  if (assignee) {
    timeline.push({ id: `tl${id}-2`, type: 'assigned', description: `Assigned to ${assignee.name}`, actorName: 'System', createdAt: new Date(new Date(createdAt).getTime() + 600000).toISOString() });
  }
  if (firstResponseAt) {
    comments.push({ id: `cmt${id}-1`, authorId: assignee?.id || 'system', authorName: assignee?.name || 'System', authorRole: 'agent', content: `Thank you for reaching out. I'm looking into this issue now and will have an update for you shortly.`, createdAt: firstResponseAt, isInternal: false });
    timeline.push({ id: `tl${id}-3`, type: 'comment', description: 'First response sent to customer', actorName: assignee?.name || 'System', createdAt: firstResponseAt });
  }
  if (slaBreached) {
    timeline.push({ id: `tl${id}-4`, type: 'sla_breach', description: 'SLA resolution deadline breached', actorName: 'System', createdAt: slaDueAt });
  }

  return {
    id: `T-${String(id).padStart(5, '0')}`,
    subject,
    description: `Customer reported: "${subject}". This issue requires investigation and resolution. Customer is on ${customer.slaTier} SLA tier. Priority set based on customer impact assessment.`,
    status,
    priority,
    channel,
    category,
    product: rand(PRODUCTS),
    region: customer.region,
    customerId: customer.id,
    assigneeId: assignee?.id || null,
    teamId: assignee?.team || 'Unassigned',
    slaDueAt,
    slaFirstResponseDue,
    slaBreached,
    slaAtRisk,
    firstResponseAt,
    resolvedAt,
    closedAt: status === 'closed' ? resolvedAt : null,
    reopenCount: Math.random() > 0.9 ? 1 : 0,
    csat: resolvedAt ? randFloat(2.5, 5) : null,
    sentiment: rand(['positive', 'neutral', 'neutral', 'negative', null] as const),
    impactScore: customer.isVIP ? randInt(70, 100) : randInt(10, 60),
    tags: ticketTags,
    linkedIncidentId,
    linkedArticleIds: Math.random() > 0.7 ? [`kb${randInt(1, 10)}`] : [],
    createdAt,
    updatedAt: new Date(new Date(createdAt).getTime() + randInt(1, 120) * 60000).toISOString(),
    comments,
    timeline,
  };
}

let ticketIdCounter = 1000;
export const TICKETS: Ticket[] = Array.from({ length: 200 }, (_, i) => {
  const daysBack = Math.floor((i / 200) * 30);
  return generateTicket(ticketIdCounter++, daysBack);
});

// Ensure some critical + open tickets for demo impact
TICKETS[0] = { ...TICKETS[0], priority: 'critical', status: 'open', slaBreached: true, customerId: 'c1', impactScore: 95, linkedIncidentId: 'inc1' };
TICKETS[1] = { ...TICKETS[1], priority: 'critical', status: 'in_progress', slaAtRisk: true, customerId: 'c5', impactScore: 88 };
TICKETS[2] = { ...TICKETS[2], priority: 'high', status: 'open', slaBreached: true, customerId: 'c2', impactScore: 75 };
TICKETS[3] = { ...TICKETS[3], priority: 'high', status: 'open', slaAtRisk: true, customerId: 'c3', linkedIncidentId: 'inc2' };

export const MAJOR_INCIDENTS: MajorIncident[] = [
  {
    id: 'inc1',
    title: 'API Gateway Degraded Performance - AMER Region',
    description: 'Multiple customers are experiencing elevated latency and intermittent 503 errors on the API Gateway in the AMER region. Root cause identified as database connection pool exhaustion following a config change deployed at 14:32 UTC.',
    severity: 'sev1',
    status: 'investigating',
    affectedServices: ['API Gateway', 'Core Platform', 'Data Pipeline'],
    impactSummary: 'Approximately 847 customers affected. API response times averaging 8.2s vs normal 120ms baseline.',
    startTime: hoursAgo(6),
    identifiedTime: hoursAgo(4),
    resolvedTime: null,
    incidentCommanderId: 'a8',
    linkedTicketIds: TICKETS.filter(t => t.linkedIncidentId === 'inc1').map(t => t.id).slice(0, 15),
    timeline: [
      { id: 'itl1-1', time: hoursAgo(6), description: 'First alerts triggered - API error rate spike detected', actorName: 'Monitoring System', type: 'update' },
      { id: 'itl1-2', time: hoursAgo(5.5), description: 'Incident declared SEV1. War room opened. Tom Nguyen assigned as IC.', actorName: 'Tom Nguyen', type: 'escalation' },
      { id: 'itl1-3', time: hoursAgo(4), description: 'Root cause identified: DB connection pool exhausted due to config change at 14:32 UTC', actorName: 'Priya Sharma', type: 'update' },
      { id: 'itl1-4', time: hoursAgo(3.5), description: 'Status page updated. Customer comms sent to top 50 impacted accounts.', actorName: 'Priscia Kibibi', type: 'comms' },
      { id: 'itl1-5', time: hoursAgo(2), description: 'Rollback of config change initiated. Monitoring recovery.', actorName: 'Tom Nguyen', type: 'action' },
      { id: 'itl1-6', time: hoursAgo(1), description: 'Partial recovery observed in AMER-East. AMER-West still degraded.', actorName: 'Tom Nguyen', type: 'update' },
    ],
    communications: [
      { id: 'ic1-1', channel: 'status_page', message: 'We are currently investigating elevated API latency and error rates in the AMER region. Our engineering team is actively working on a resolution.', sentAt: hoursAgo(5), sentBy: 'Priscia Kibibi' },
      { id: 'ic1-2', channel: 'email', message: 'Dear Customer, we are aware of the API performance issues affecting your account and are working urgently to restore normal service. We will provide updates every 30 minutes.', sentAt: hoursAgo(3.5), sentBy: 'Priscia Kibibi' },
      { id: 'ic1-3', channel: 'slack', message: '@here: SEV1 in progress. API Gateway degraded AMER. All hands on deck. War room: #incident-api-gateway-20240215', sentAt: hoursAgo(5.5), sentBy: 'Tom Nguyen' },
    ],
    actionItems: [
      { id: 'ai1-1', description: 'Complete rollback of connection pool config change', assignee: 'Tom Nguyen', dueAt: hoursFromNow(1), completed: false },
      { id: 'ai1-2', description: 'Write post-mortem draft', assignee: 'Priya Sharma', dueAt: hoursFromNow(24), completed: false },
      { id: 'ai1-3', description: 'Add config change gate to deployment pipeline', assignee: 'David Park', dueAt: hoursFromNow(72), completed: false },
      { id: 'ai1-4', description: 'Send customer impact report to Account team', assignee: 'Priscia Kibibi', dueAt: hoursFromNow(4), completed: false },
    ],
    customerImpactCount: 847,
    updatedAt: hoursAgo(0.5),
  },
  {
    id: 'inc2',
    title: 'Reporting Engine - Data Export Failures',
    description: 'Scheduled and on-demand data exports are failing for accounts with datasets over 50,000 rows. Issue traced to memory allocation bug introduced in v4.2.1 release.',
    severity: 'sev2',
    status: 'identified',
    affectedServices: ['Reporting Engine', 'Data Export', 'Analytics Suite'],
    impactSummary: 'Approximately 312 customers unable to complete exports. Workaround available for < 50k rows.',
    startTime: hoursAgo(18),
    identifiedTime: hoursAgo(14),
    resolvedTime: null,
    incidentCommanderId: 'a3',
    linkedTicketIds: TICKETS.filter(t => t.linkedIncidentId === 'inc2').map(t => t.id).slice(0, 8),
    timeline: [
      { id: 'itl2-1', time: hoursAgo(18), description: 'Customer reports began arriving about export failures', actorName: 'Sarah Chen', type: 'update' },
      { id: 'itl2-2', time: hoursAgo(16), description: 'Pattern identified - only affects exports > 50k rows', actorName: 'Marcus Williams', type: 'update' },
      { id: 'itl2-3', time: hoursAgo(14), description: 'Engineering identified memory allocation bug in v4.2.1. Incident declared SEV2.', actorName: 'Priya Sharma', type: 'escalation' },
      { id: 'itl2-4', time: hoursAgo(12), description: 'Workaround published: Use batch exports with < 50k rows filter', actorName: 'Priya Sharma', type: 'action' },
      { id: 'itl2-5', time: hoursAgo(8), description: 'Hotfix v4.2.2 in testing. Expected deploy in 6 hours.', actorName: 'Priya Sharma', type: 'update' },
    ],
    communications: [
      { id: 'ic2-1', channel: 'status_page', message: 'We have identified an issue affecting data exports for large datasets. A workaround is available and a fix is in progress.', sentAt: hoursAgo(13), sentBy: 'Priya Sharma' },
      { id: 'ic2-2', channel: 'email', message: 'We have identified the root cause of the export failures affecting your account. As a workaround, please use batched exports with filters to keep results under 50,000 rows. A permanent fix will be deployed within 6 hours.', sentAt: hoursAgo(11), sentBy: 'Priya Sharma' },
    ],
    actionItems: [
      { id: 'ai2-1', description: 'Deploy hotfix v4.2.2 to production', assignee: 'Priya Sharma', dueAt: hoursFromNow(2), completed: false },
      { id: 'ai2-2', description: 'Notify all affected customers of resolution', assignee: 'Sarah Chen', dueAt: hoursFromNow(4), completed: false },
      { id: 'ai2-3', description: 'Add regression test for large export scenario', assignee: 'Tom Nguyen', dueAt: hoursFromNow(48), completed: false },
    ],
    customerImpactCount: 312,
    updatedAt: hoursAgo(2),
  },
];

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  { id: 'kb1', title: 'Resetting Your Password and MFA Device', category: 'Account Access', product: 'Core Platform', views: 12450, helpfulRate: 0.87, unhelpfulCount: 180, linkedTicketCount: 45, lastUpdated: daysAgo(3), author: 'Elena Rodriguez', status: 'published', tags: ['password', 'mfa', 'login'] },
  { id: 'kb2', title: 'Understanding API Rate Limits and Best Practices', category: 'API Integration', product: 'API Gateway', views: 8920, helpfulRate: 0.91, unhelpfulCount: 89, linkedTicketCount: 38, lastUpdated: daysAgo(7), author: 'Priya Sharma', status: 'published', tags: ['api', 'rate-limit', 'performance'] },
  { id: 'kb3', title: 'Billing Cycle and Invoice Explanation', category: 'Billing & Payments', product: 'Core Platform', views: 15300, helpfulRate: 0.72, unhelpfulCount: 450, linkedTicketCount: 92, lastUpdated: daysAgo(15), author: 'Keiko Tanaka', status: 'published', tags: ['billing', 'invoice', 'payment'] },
  { id: 'kb4', title: 'Configuring Webhooks and Signature Verification', category: 'Webhook Configuration', product: 'API Gateway', views: 6780, helpfulRate: 0.83, unhelpfulCount: 120, linkedTicketCount: 29, lastUpdated: daysAgo(10), author: 'David Park', status: 'published', tags: ['webhook', 'security', 'integration'] },
  { id: 'kb5', title: 'Data Export: Formats, Scheduling, and Limits', category: 'Data Export', product: 'Reporting Engine', views: 9100, helpfulRate: 0.68, unhelpfulCount: 310, linkedTicketCount: 57, lastUpdated: daysAgo(21), author: 'Marcus Williams', status: 'published', tags: ['export', 'data', 'reporting'] },
  { id: 'kb6', title: 'SSO Configuration Guide (SAML & OIDC)', category: 'Account Access', product: 'Security Module', views: 4200, helpfulRate: 0.89, unhelpfulCount: 48, linkedTicketCount: 18, lastUpdated: daysAgo(5), author: 'James O\'Brien', status: 'published', tags: ['sso', 'saml', 'oidc', 'security'] },
  { id: 'kb7', title: 'GDPR Data Deletion Request Process', category: 'Security & Compliance', product: 'Core Platform', views: 3800, helpfulRate: 0.94, unhelpfulCount: 22, linkedTicketCount: 12, lastUpdated: daysAgo(2), author: 'Tom Nguyen', status: 'published', tags: ['gdpr', 'compliance', 'privacy'] },
  { id: 'kb8', title: 'Performance Troubleshooting Dashboard Slowness', category: 'Performance Issues', product: 'Analytics Suite', views: 7600, helpfulRate: 0.61, unhelpfulCount: 312, linkedTicketCount: 44, lastUpdated: daysAgo(30), author: 'Marcus Williams', status: 'published', tags: ['performance', 'slow', 'troubleshoot'] },
  { id: 'kb9', title: 'Getting Started: Onboarding Checklist', category: 'Onboarding', product: 'Core Platform', views: 22100, helpfulRate: 0.88, unhelpfulCount: 270, linkedTicketCount: 15, lastUpdated: daysAgo(1), author: 'Elena Rodriguez', status: 'published', tags: ['onboarding', 'setup', 'getting-started'] },
  { id: 'kb10', title: 'User Permissions and Role Management', category: 'Account Access', product: 'Core Platform', views: 11200, helpfulRate: 0.79, unhelpfulCount: 240, linkedTicketCount: 36, lastUpdated: daysAgo(8), author: 'Sarah Chen', status: 'published', tags: ['permissions', 'roles', 'users', 'admin'] },
];

export const FAILED_SEARCHES: FailedSearch[] = [
  { query: 'bulk export api pagination', count: 143, hasArticle: false, lastSearched: hoursAgo(2) },
  { query: 'webhook retry exponential backoff', count: 89, hasArticle: false, lastSearched: hoursAgo(5) },
  { query: 'sso azure ad setup', count: 76, hasArticle: false, lastSearched: hoursAgo(1) },
  { query: 'mobile sdk offline mode', count: 64, hasArticle: false, lastSearched: hoursAgo(8) },
  { query: 'data residency region selection', count: 58, hasArticle: false, lastSearched: hoursAgo(3) },
  { query: 'two factor authentication app', count: 52, hasArticle: true, lastSearched: hoursAgo(4) },
  { query: 'csv export encoding utf8', count: 47, hasArticle: false, lastSearched: hoursAgo(6) },
  { query: 'api key rotation', count: 39, hasArticle: false, lastSearched: hoursAgo(12) },
];

export function generateChannelMetrics(): ChannelMetric[] {
  const metrics: ChannelMetric[] = [];
  for (let i = 6; i >= 0; i--) {
    metrics.push({
      date: new Date(now.getTime() - i * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      phone: randInt(18, 35),
      chat: randInt(25, 55),
      email: randInt(40, 80),
      web: randInt(15, 30),
      api: randInt(5, 15),
    });
  }
  return metrics;
}

export const CHANNEL_METRICS = generateChannelMetrics();

export const NETWORK_UPDATES: NetworkUpdate[] = [
  {
    id: 'nu1',
    title: 'API Gateway Elevated Latency — AMER',
    severity: 'degraded',
    affectedRegions: ['AMER'],
    affectedServices: ['API Gateway', 'Webhooks'],
    status: 'Identified — engineering actively investigating root cause',
    startTime: hoursAgo(3.5),
    updatedAt: hoursAgo(0.5),
    estimatedResolution: hoursFromNow(2),
  },
  {
    id: 'nu2',
    title: 'Scheduled Maintenance — Data Pipeline',
    severity: 'maintenance',
    affectedRegions: ['EMEA', 'APAC'],
    affectedServices: ['Data Pipeline', 'Reporting Engine'],
    status: 'Maintenance window in progress — read-only mode active',
    startTime: hoursAgo(1),
    updatedAt: hoursAgo(0.25),
    estimatedResolution: hoursFromNow(1.5),
  },
  {
    id: 'nu3',
    title: 'Authentication Service Intermittent Failures',
    severity: 'outage',
    affectedRegions: ['GLOBAL'],
    affectedServices: ['Auth Service', 'SSO', 'Mobile SDK'],
    status: 'Investigating — subset of users experiencing login failures',
    startTime: hoursAgo(0.75),
    updatedAt: hoursAgo(0.1),
  },
  {
    id: 'nu4',
    title: 'Analytics Suite Performance Degradation — Resolved',
    severity: 'resolved',
    affectedRegions: ['APAC'],
    affectedServices: ['Analytics Suite'],
    status: 'Resolved — normal performance restored',
    startTime: hoursAgo(6),
    updatedAt: hoursAgo(1),
  },
];

export const CYBER_ALERTS: CyberSecurityAlert[] = [
  {
    id: 'cy1',
    title: 'Brute Force Login Attempts Detected',
    severity: 'critical',
    category: 'threat',
    description: 'Automated credential stuffing attack targeting admin portal — 4,200 failed attempts in 10 minutes.',
    affectedSystems: ['Admin Portal', 'Auth Service'],
    status: 'investigating',
    detectedAt: hoursAgo(0.4),
    updatedAt: hoursAgo(0.1),
    recommendation: 'Enable IP rate-limiting and trigger MFA enforcement immediately.',
  },
  {
    id: 'cy2',
    title: 'Unpatched CVE-2024-3094 on 3 Nodes',
    severity: 'high',
    category: 'vulnerability',
    description: 'Three production nodes running xz-utils 5.6.0 with critical backdoor vulnerability (CVSS 10.0).',
    affectedSystems: ['Node-PROD-07', 'Node-PROD-11', 'Node-PROD-14'],
    status: 'active',
    detectedAt: hoursAgo(5),
    updatedAt: hoursAgo(1.5),
    recommendation: 'Patch immediately — downgrade to xz-utils 5.4.6.',
  },
  {
    id: 'cy3',
    title: 'Unusual Data Export by Service Account',
    severity: 'high',
    category: 'data',
    description: 'Service account svc-reporting exported 2.3 GB from the customer PII table outside business hours.',
    affectedSystems: ['Data Warehouse', 'Reporting Engine'],
    status: 'investigating',
    detectedAt: hoursAgo(2),
    updatedAt: hoursAgo(0.5),
    recommendation: 'Revoke service account token, audit export logs.',
  },
  {
    id: 'cy4',
    title: 'MFA Bypass Policy Violation',
    severity: 'medium',
    category: 'compliance',
    description: '12 user accounts found with MFA disabled, violating SOC 2 Type II access control policy.',
    affectedSystems: ['Identity Provider'],
    status: 'active',
    detectedAt: hoursAgo(8),
    updatedAt: hoursAgo(3),
    recommendation: 'Enforce MFA at the IdP level and notify account owners.',
  },
  {
    id: 'cy5',
    title: 'Stale Privileged Access — 9 Accounts',
    severity: 'medium',
    category: 'access',
    description: '9 admin accounts dormant for 90+ days still hold elevated privileges.',
    affectedSystems: ['IAM', 'AWS Console'],
    status: 'active',
    detectedAt: hoursAgo(24),
    updatedAt: hoursAgo(6),
    recommendation: 'Disable accounts and conduct quarterly access review.',
  },
  {
    id: 'cy6',
    title: 'SSL Certificate Expiry — API Gateway',
    severity: 'low',
    category: 'vulnerability',
    description: 'TLS certificate for api.internal expires in 14 days.',
    affectedSystems: ['API Gateway'],
    status: 'mitigated',
    detectedAt: hoursAgo(48),
    updatedAt: hoursAgo(12),
    recommendation: 'Renewal request submitted — auto-rotation pending approval.',
  },
];
