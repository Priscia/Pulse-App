import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, User, Building, Tag, Clock, MessageSquare, History, AlertTriangle, Star, Link, CheckCircle, type LucideIcon } from 'lucide-react';
import Header from '../components/layout/Header';
import StatusChip from '../components/common/StatusChip';
import PriorityChip from '../components/common/PriorityChip';
import SLATimer from '../components/common/SLATimer';
import { useApp } from '../context/AppContext';
import { mockService } from '../data/mockService';
import type { TicketStatus, TicketPriority } from '../types';

const TIMELINE_ICONS: Record<string, LucideIcon> = {
  created: MessageSquare,
  assigned: User,
  status_change: CheckCircle,
  priority_change: AlertTriangle,
  comment: MessageSquare,
  sla_breach: AlertTriangle,
  reopened: History,
  linked_incident: Link,
};

const TIMELINE_COLORS: Record<string, string> = {
  created: 'bg-deloitte-green/10 text-deloitte-green',
  assigned: 'bg-deloitte-light-gray/40 text-deloitte-dark-gray',
  status_change: 'bg-deloitte-green/10 text-deloitte-green',
  priority_change: 'bg-amber-100 text-amber-600',
  comment: 'bg-deloitte-light-gray/40 text-deloitte-dark-gray',
  sla_breach: 'bg-red-100 text-red-600',
  reopened: 'bg-orange-100 text-orange-600',
  linked_incident: 'bg-deloitte-dark-gray/10 text-deloitte-dark-gray',
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateTicket } = useApp();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'comments'>('details');
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const ticket = id ? mockService.getTicketById(id) : null;
  if (!ticket) return (
    <div>
      <Header title="Ticket Not Found" />
      <div className="p-6 text-center text-deloitte-med-gray">
        <p>Ticket not found. <button onClick={() => navigate('/tickets')} className="text-deloitte-green hover:underline">Back to queue</button></p>
      </div>
    </div>
  );

  const customer = mockService.getCustomerById(ticket.customerId);
  const assignee = ticket.assigneeId ? mockService.getAgentById(ticket.assigneeId) : null;
  const agents = mockService.getAgents().filter(a => a.role === 'agent');
  const incident = ticket.linkedIncidentId ? mockService.getIncidentById(ticket.linkedIncidentId) : null;

  const handleStatusChange = (status: TicketStatus) => updateTicket(ticket.id, { status });
  const handlePriorityChange = (priority: TicketPriority) => updateTicket(ticket.id, { priority });
  const handleAssigneeChange = (assigneeId: string) => updateTicket(ticket.id, { assigneeId: assigneeId || null });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const updated = {
      ...ticket,
      comments: [...ticket.comments, {
        id: `cmt-${Date.now()}`,
        authorId: 'a1',
        authorName: 'Sarah Chen',
        authorRole: 'agent' as const,
        content: newComment,
        createdAt: new Date().toISOString(),
        isInternal,
      }],
      timeline: [...ticket.timeline, {
        id: `tl-${Date.now()}`,
        type: 'comment' as const,
        description: isInternal ? 'Internal note added' : 'Reply sent to customer',
        actorName: 'Sarah Chen',
        createdAt: new Date().toISOString(),
      }],
    };
    updateTicket(ticket.id, updated);
    setNewComment('');
  };

  return (
    <div>
      <Header title={ticket.id} subtitle={ticket.subject} />
      <div className="p-6 max-w-7xl mx-auto">
        <button onClick={() => navigate('/tickets')} className="flex items-center gap-2 text-sm text-deloitte-dark-gray hover:text-deloitte-black mb-5 transition-colors">
          <ArrowLeft size={16} /> Back to Queue
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-mono text-sm text-deloitte-med-gray">{ticket.id}</span>
                    {customer?.isVIP && <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">VIP</span>}
                    {customer?.isRegulatory && <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">Regulatory</span>}
                    {ticket.slaBreached && <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><AlertTriangle size={10} /> SLA Breached</span>}
                    {incident && (
                      <button onClick={() => navigate(`/incidents/${incident.id}`)} className="text-xs bg-deloitte-dark-gray/10 text-deloitte-dark-gray border border-deloitte-dark-gray/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 hover:border-deloitte-dark-gray/40 transition-all">
                        <Link size={10} /> {incident.id.toUpperCase()} Active
                      </button>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-deloitte-black mb-1">{ticket.subject}</h2>
                  <p className="text-sm text-deloitte-med-gray">{ticket.category} • {ticket.product} • {ticket.region}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <SLATimer dueAt={ticket.slaDueAt} breached={ticket.slaBreached} atRisk={ticket.slaAtRisk} />
                </div>
              </div>
              <p className="text-sm text-deloitte-dark-gray leading-relaxed bg-deloitte-light-gray/20 rounded-lg p-4">{ticket.description}</p>
              {ticket.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Tag size={13} className="text-deloitte-med-gray" />
                  {ticket.tags.map(tag => (
                    <span key={tag} className="text-xs bg-deloitte-light-gray/40 text-deloitte-dark-gray px-2 py-0.5 rounded-full border border-deloitte-light-gray">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
              <div className="flex border-b border-deloitte-light-gray">
                {(['details', 'timeline', 'comments'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-deloitte-green border-b-2 border-deloitte-green bg-deloitte-green/5' : 'text-deloitte-dark-gray hover:text-deloitte-black'}`}
                  >
                    {tab} {tab === 'comments' && ticket.comments.length > 0 && `(${ticket.comments.length})`}
                    {tab === 'timeline' && `(${ticket.timeline.length})`}
                  </button>
                ))}
              </div>

              {activeTab === 'details' && (
                <div className="p-5 grid grid-cols-2 gap-4">
                  {[
                    { label: 'Channel', value: ticket.channel },
                    { label: 'Product', value: ticket.product },
                    { label: 'Region', value: ticket.region },
                    { label: 'Team', value: ticket.teamId },
                    { label: 'First Response Due', value: new Date(ticket.slaFirstResponseDue).toLocaleString() },
                    { label: 'Resolution Due', value: new Date(ticket.slaDueAt).toLocaleString() },
                    { label: 'First Response At', value: ticket.firstResponseAt ? new Date(ticket.firstResponseAt).toLocaleString() : 'Not yet' },
                    { label: 'Resolved At', value: ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : 'Not yet' },
                    { label: 'Reopen Count', value: ticket.reopenCount.toString() },
                    { label: 'Sentiment', value: ticket.sentiment || 'Unknown' },
                    { label: 'Impact Score', value: ticket.impactScore.toString() },
                    { label: 'CSAT', value: ticket.csat ? `${ticket.csat.toFixed(1)}/5` : 'Pending' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-deloitte-med-gray mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-deloitte-black capitalize">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="p-5">
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-deloitte-light-gray" />
                    <div className="space-y-4">
                      {ticket.timeline.map(event => {
                        const Icon = TIMELINE_ICONS[event.type] || History;
                        const colorClass = TIMELINE_COLORS[event.type] || 'bg-deloitte-light-gray/40 text-deloitte-dark-gray';
                        return (
                          <div key={event.id} className="flex items-start gap-4 relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative z-10 ${colorClass}`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 bg-deloitte-light-gray/20 rounded-lg p-3">
                              <p className="text-sm font-medium text-deloitte-black">{event.description}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-deloitte-dark-gray">{event.actorName}</span>
                                <span className="text-xs text-deloitte-med-gray">{new Date(event.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="p-5 space-y-4">
                  {ticket.comments.length === 0 && <p className="text-sm text-deloitte-med-gray text-center py-4">No comments yet.</p>}
                  {ticket.comments.map(comment => (
                    <div key={comment.id} className={`rounded-xl p-4 ${comment.isInternal ? 'bg-amber-50 border border-amber-200' : comment.authorRole === 'customer' ? 'bg-deloitte-light-gray/20 border border-deloitte-light-gray' : 'bg-deloitte-green/5 border border-deloitte-green/20'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-deloitte-black">{comment.authorName}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${comment.authorRole === 'agent' ? 'bg-deloitte-green/10 text-deloitte-green' : comment.authorRole === 'customer' ? 'bg-deloitte-light-gray/60 text-deloitte-dark-gray' : 'bg-deloitte-light-gray/40 text-deloitte-med-gray'}`}>
                            {comment.authorRole}
                          </span>
                          {comment.isInternal && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Internal</span>}
                        </div>
                        <span className="text-xs text-deloitte-med-gray">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-deloitte-dark-gray leading-relaxed">{comment.content}</p>
                    </div>
                  ))}
                  <div className="border-t border-deloitte-light-gray pt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <button onClick={() => setIsInternal(false)} className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${!isInternal ? 'bg-deloitte-green/10 text-deloitte-green' : 'text-deloitte-dark-gray hover:bg-deloitte-light-gray/40'}`}>Reply to Customer</button>
                      <button onClick={() => setIsInternal(true)} className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${isInternal ? 'bg-amber-100 text-amber-700' : 'text-deloitte-dark-gray hover:bg-deloitte-light-gray/40'}`}>Internal Note</button>
                    </div>
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder={isInternal ? 'Add internal note (not visible to customer)...' : 'Write a reply to the customer...'}
                      className="w-full border border-deloitte-light-gray rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-deloitte-green resize-none"
                      rows={3}
                    />
                    <button onClick={handleAddComment} disabled={!newComment.trim()} className="mt-2 px-4 py-2 bg-deloitte-green hover:bg-deloitte-green/90 disabled:bg-deloitte-light-gray disabled:cursor-not-allowed text-deloitte-black text-sm font-medium rounded-lg transition-all">
                      {isInternal ? 'Add Note' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-deloitte-light-gray p-5 space-y-4">
              <h3 className="font-semibold text-deloitte-black border-b border-deloitte-light-gray/60 pb-3">Ticket Properties</h3>
              <div>
                <label className="text-xs text-deloitte-med-gray font-medium mb-1.5 block">Status</label>
                <select value={ticket.status} onChange={e => handleStatusChange(e.target.value as TicketStatus)} className="w-full text-sm border border-deloitte-light-gray rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-deloitte-green bg-white">
                  {['open', 'in_progress', 'pending', 'resolved', 'closed', 'on_hold'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-deloitte-med-gray font-medium mb-1.5 block">Priority</label>
                <select value={ticket.priority} onChange={e => handlePriorityChange(e.target.value as TicketPriority)} className="w-full text-sm border border-deloitte-light-gray rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-deloitte-green bg-white">
                  {['critical', 'high', 'medium', 'low'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-deloitte-med-gray font-medium mb-1.5 block">Assignee</label>
                <select value={ticket.assigneeId || ''} onChange={e => handleAssigneeChange(e.target.value)} className="w-full text-sm border border-deloitte-light-gray rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-deloitte-green bg-white">
                  <option value="">Unassigned</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div><p className="text-xs text-deloitte-med-gray">Status</p><StatusChip status={ticket.status} size="sm" /></div>
                <div><p className="text-xs text-deloitte-med-gray">Priority</p><PriorityChip priority={ticket.priority} size="sm" /></div>
              </div>
            </div>

            {customer && (
              <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
                <h3 className="font-semibold text-deloitte-black border-b border-deloitte-light-gray/60 pb-3 mb-4 flex items-center gap-2">
                  <User size={14} className="text-deloitte-dark-gray" /> Customer
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-deloitte-green rounded-full flex items-center justify-center text-deloitte-black font-bold text-sm">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-deloitte-black">{customer.name}</p>
                      <p className="text-xs text-deloitte-med-gray">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building size={13} className="text-deloitte-med-gray" />
                    <p className="text-sm text-deloitte-dark-gray">{customer.company}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-deloitte-light-gray/20 rounded-lg p-2">
                      <p className="text-deloitte-med-gray">SLA Tier</p>
                      <p className="font-semibold text-deloitte-dark-gray capitalize mt-0.5">{customer.slaTier}</p>
                    </div>
                    <div className="bg-deloitte-light-gray/20 rounded-lg p-2">
                      <p className="text-deloitte-med-gray">Region</p>
                      <p className="font-semibold text-deloitte-dark-gray mt-0.5">{customer.region}</p>
                    </div>
                    <div className="bg-deloitte-light-gray/20 rounded-lg p-2">
                      <p className="text-deloitte-med-gray">Avg CSAT</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <p className="font-semibold text-deloitte-dark-gray">{customer.csatAvg.toFixed(1)}</p>
                      </div>
                    </div>
                    <div className="bg-deloitte-light-gray/20 rounded-lg p-2">
                      <p className="text-deloitte-med-gray">Impact</p>
                      <p className={`font-semibold capitalize mt-0.5 ${customer.revenueImpact === 'critical' ? 'text-red-600' : customer.revenueImpact === 'high' ? 'text-orange-600' : 'text-deloitte-dark-gray'}`}>{customer.revenueImpact}</p>
                    </div>
                  </div>
                  {customer.isVIP && <div className="text-xs bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg font-semibold text-center">VIP Account</div>}
                  {customer.isRegulatory && <div className="text-xs bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1.5 rounded-lg font-semibold text-center">Regulatory Compliance Required</div>}
                </div>
              </div>
            )}

            {assignee && (
              <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
                <h3 className="font-semibold text-deloitte-black border-b border-deloitte-light-gray/60 pb-3 mb-4">Assigned Agent</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-deloitte-green rounded-full flex items-center justify-center text-deloitte-black font-bold text-sm">{assignee.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-deloitte-black">{assignee.name}</p>
                    <p className="text-xs text-deloitte-med-gray">{assignee.team}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${assignee.isOnline ? 'bg-deloitte-green' : 'bg-deloitte-light-gray'}`} />
                      <span className="text-xs text-deloitte-med-gray">{assignee.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1 text-xs text-deloitte-med-gray">
                    <span>Workload</span>
                    <span>{assignee.currentLoad}/{assignee.maxLoad}</span>
                  </div>
                  <div className="h-1.5 bg-deloitte-light-gray/60 rounded-full">
                    <div className={`h-1.5 rounded-full ${(assignee.currentLoad / assignee.maxLoad) > 0.9 ? 'bg-red-500' : 'bg-deloitte-green'}`} style={{ width: `${(assignee.currentLoad / assignee.maxLoad) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-deloitte-dark-gray" />
                <h3 className="font-semibold text-deloitte-black">SLA</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-deloitte-dark-gray">First Response</span>
                  <span className={`font-medium ${ticket.firstResponseAt ? 'text-deloitte-green' : 'text-amber-600'}`}>
                    {ticket.firstResponseAt ? 'Sent' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-deloitte-dark-gray">Resolution Due</span>
                  <SLATimer dueAt={ticket.slaDueAt} breached={ticket.slaBreached} atRisk={ticket.slaAtRisk} />
                </div>
                <div className="flex justify-between">
                  <span className="text-deloitte-dark-gray">Created</span>
                  <span className="text-deloitte-med-gray text-xs">{new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
