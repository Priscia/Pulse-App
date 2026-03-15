export type Role = 'agent' | 'manager' | 'exec';
export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'on_hold';
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';
export type TicketChannel = 'phone' | 'chat' | 'email' | 'web' | 'api';
export type SLATier = 'platinum' | 'gold' | 'silver' | 'bronze';
export type IncidentSeverity = 'sev1' | 'sev2' | 'sev3' | 'sev4';
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export type ImpactLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  isVIP: boolean;
  slaTier: SLATier;
  revenueImpact: ImpactLevel;
  isRegulatory: boolean;
  region: string;
  csatAvg: number;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: Role;
  team: string;
  avatar: string;
  isOnline: boolean;
  currentLoad: number;
  maxLoad: number;
  skills: string[];
}

export interface SLAPolicy {
  id: string;
  name: string;
  tier: SLATier;
  priority: TicketPriority;
  firstResponseMinutes: number;
  resolutionHours: number;
}

export interface TicketComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'agent' | 'customer' | 'system';
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export interface TicketTimelineEvent {
  id: string;
  type: 'created' | 'assigned' | 'status_change' | 'priority_change' | 'comment' | 'sla_breach' | 'reopened' | 'linked_incident';
  description: string;
  actorName: string;
  createdAt: string;
  metadata?: Record<string, string>;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  category: string;
  product: string;
  region: string;
  customerId: string;
  assigneeId: string | null;
  teamId: string;
  slaDueAt: string;
  slaFirstResponseDue: string;
  slaBreached: boolean;
  slaAtRisk: boolean;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  reopenCount: number;
  csat: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  impactScore: number;
  tags: string[];
  linkedIncidentId: string | null;
  linkedArticleIds: string[];
  createdAt: string;
  updatedAt: string;
  comments: TicketComment[];
  timeline: TicketTimelineEvent[];
}

export interface MajorIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedServices: string[];
  impactSummary: string;
  startTime: string;
  identifiedTime: string | null;
  resolvedTime: string | null;
  incidentCommanderId: string;
  linkedTicketIds: string[];
  timeline: IncidentTimelineEvent[];
  communications: IncidentComm[];
  actionItems: ActionItem[];
  customerImpactCount: number;
  updatedAt: string;
}

export interface IncidentTimelineEvent {
  id: string;
  time: string;
  description: string;
  actorName: string;
  type: 'update' | 'escalation' | 'action' | 'comms' | 'resolution';
}

export interface IncidentComm {
  id: string;
  channel: 'status_page' | 'email' | 'slack' | 'internal';
  message: string;
  sentAt: string;
  sentBy: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueAt: string;
  completed: boolean;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  product: string;
  views: number;
  helpfulRate: number;
  unhelpfulCount: number;
  linkedTicketCount: number;
  lastUpdated: string;
  author: string;
  status: 'published' | 'draft' | 'archived';
  tags: string[];
}

export interface ChannelMetric {
  date: string;
  phone: number;
  chat: number;
  email: number;
  web: number;
  api: number;
}

export interface FailedSearch {
  query: string;
  count: number;
  hasArticle: boolean;
  lastSearched: string;
}

export interface SLASettings {
  criticalFirstResponse: number;
  criticalResolution: number;
  highFirstResponse: number;
  highResolution: number;
  mediumFirstResponse: number;
  mediumResolution: number;
  lowFirstResponse: number;
  lowResolution: number;
  atRiskThresholdPercent: number;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  notifyRoles: Role[];
}

export interface AppSettings {
  sla: SLASettings;
  alertRules: AlertRule[];
  majorIncidentThreshold: number;
  csatTarget: number;
  fcrTarget: number;
  mttaTarget: number;
  mttrTarget: number;
}

export type NetworkUpdateSeverity = 'outage' | 'degraded' | 'maintenance' | 'resolved';

export interface NetworkUpdate {
  id: string;
  title: string;
  severity: NetworkUpdateSeverity;
  affectedRegions: string[];
  affectedServices: string[];
  status: string;
  startTime: string;
  updatedAt: string;
  estimatedResolution?: string;
}

export type CyberAlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type CyberAlertCategory = 'threat' | 'vulnerability' | 'compliance' | 'access' | 'data';

export interface CyberSecurityAlert {
  id: string;
  title: string;
  severity: CyberAlertSeverity;
  category: CyberAlertCategory;
  description: string;
  affectedSystems: string[];
  status: 'active' | 'investigating' | 'mitigated' | 'resolved';
  detectedAt: string;
  updatedAt: string;
  recommendation?: string;
}

export interface DashboardFilters {
  priority: TicketPriority | 'all';
  status: TicketStatus | 'all';
  channel: TicketChannel | 'all';
  product: string;
  region: string;
  assigneeId: string;
  category: string;
  tags: string[];
  dateRange: '1d' | '7d' | '30d' | '90d';
  search: string;
}
