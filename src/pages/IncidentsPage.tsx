import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Users, Clock, CheckCircle, ArrowLeft, MessageSquare, ExternalLink } from 'lucide-react';
import Header from '../components/layout/Header';
import { mockService } from '../data/mockService';
import type { IncidentSeverity, IncidentStatus } from '../types';

const SEV_STYLES: Record<IncidentSeverity, string> = {
  sev1: 'bg-red-600 text-white',
  sev2: 'bg-orange-500 text-white',
  sev3: 'bg-amber-500 text-white',
  sev4: 'bg-yellow-400 text-deloitte-black',
};

const STATUS_STYLES: Record<IncidentStatus, string> = {
  investigating: 'bg-red-100 text-red-700 border border-red-200',
  identified: 'bg-orange-100 text-orange-700 border border-orange-200',
  monitoring: 'bg-amber-100 text-amber-700 border border-amber-200',
  resolved: 'bg-deloitte-green/10 text-deloitte-green border border-deloitte-green/30',
};

const STATUS_DOTS: Record<IncidentStatus, string> = {
  investigating: 'bg-red-500 animate-pulse',
  identified: 'bg-orange-500',
  monitoring: 'bg-amber-500',
  resolved: 'bg-deloitte-green',
};

const TIMELINE_TYPE_COLORS: Record<string, string> = {
  update: 'bg-deloitte-light-gray/60 text-deloitte-dark-gray',
  escalation: 'bg-red-100 text-red-600',
  action: 'bg-deloitte-green/10 text-deloitte-green',
  comms: 'bg-deloitte-light-gray/40 text-deloitte-dark-gray',
  resolution: 'bg-deloitte-green/10 text-deloitte-green',
};

function formatDuration(startTime: string, endTime?: string | null): string {
  const end = endTime ? new Date(endTime) : new Date();
  const diff = end.getTime() - new Date(startTime).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function IncidentListPage() {
  const navigate = useNavigate();
  const incidents = mockService.getIncidents();
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  return (
    <div>
      <Header title="Major Incidents" subtitle={`${activeIncidents.length} active • ${resolvedIncidents.length} resolved`} />
      <div className="p-6 space-y-6">
        {activeIncidents.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-deloitte-dark-gray uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Active Incidents
            </h2>
            <div className="space-y-4">
              {activeIncidents.map(inc => (
                <IncidentCard key={inc.id} incident={inc} onClick={() => navigate(`/incidents/${inc.id}`)} />
              ))}
            </div>
          </div>
        )}
        {resolvedIncidents.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-deloitte-dark-gray uppercase tracking-wide mb-3">Resolved</h2>
            <div className="space-y-3">
              {resolvedIncidents.map(inc => (
                <IncidentCard key={inc.id} incident={inc} onClick={() => navigate(`/incidents/${inc.id}`)} />
              ))}
            </div>
          </div>
        )}
        {incidents.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-deloitte-light-gray">
            <CheckCircle size={40} className="text-deloitte-green mx-auto mb-3" />
            <p className="text-deloitte-dark-gray font-medium">No active incidents</p>
            <p className="text-sm text-deloitte-med-gray mt-1">All systems operational</p>
          </div>
        )}
      </div>
    </div>
  );
}

function IncidentCard({ incident: inc, onClick }: { incident: ReturnType<typeof mockService.getIncidents>[0]; onClick: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-deloitte-light-gray hover:border-deloitte-dark-gray/40 hover:shadow-md cursor-pointer transition-all duration-200 overflow-hidden" onClick={onClick}>
      <div className="px-5 py-4 flex items-start gap-4">
        <div className={`text-xs font-bold px-2.5 py-1.5 rounded-lg shrink-0 ${SEV_STYLES[inc.severity]}`}>
          {inc.severity.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-sm font-semibold text-deloitte-black">{inc.title}</p>
              <p className="text-xs text-deloitte-med-gray mt-0.5 line-clamp-2">{inc.impactSummary}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize flex items-center gap-1.5 shrink-0 ${STATUS_STYLES[inc.status]}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[inc.status]}`} />
              {inc.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-deloitte-med-gray flex-wrap">
            <span className="flex items-center gap-1"><Users size={12} /> {inc.customerImpactCount} customers</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(inc.startTime, inc.resolvedTime)} duration</span>
            <span>{inc.affectedServices.slice(0, 2).join(', ')}{inc.affectedServices.length > 2 ? ` +${inc.affectedServices.length - 2}` : ''}</span>
            <span>{inc.linkedTicketIds.length} linked tickets</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const incident = id ? mockService.getIncidentById(id) : null;

  if (!incident) return (
    <div>
      <Header title="Incident Not Found" />
      <div className="p-6 text-center text-deloitte-med-gray">
        <p>Incident not found. <button onClick={() => navigate('/incidents')} className="text-deloitte-green hover:underline">Back to incidents</button></p>
      </div>
    </div>
  );

  const commander = mockService.getAgentById(incident.incidentCommanderId);
  const linkedTickets = incident.linkedTicketIds.map(id => mockService.getTicketById(id)).filter(Boolean);

  return (
    <div>
      <Header title={incident.id.toUpperCase()} subtitle={incident.title} />
      <div className="p-6 max-w-7xl mx-auto">
        <button onClick={() => navigate('/incidents')} className="flex items-center gap-2 text-sm text-deloitte-dark-gray hover:text-deloitte-black mb-5 transition-colors">
          <ArrowLeft size={16} /> Back to Incidents
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
              <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${SEV_STYLES[incident.severity]}`}>
                    {incident.severity.toUpperCase()}
                  </span>
                  <span className={`text-sm px-3 py-1.5 rounded-full font-medium capitalize flex items-center gap-1.5 ${STATUS_STYLES[incident.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[incident.status]}`} />
                    {incident.status.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
                  <Users size={14} /> {incident.customerImpactCount} customers impacted
                </span>
              </div>
              <h2 className="text-lg font-bold text-deloitte-black mb-2">{incident.title}</h2>
              <p className="text-sm text-deloitte-dark-gray leading-relaxed bg-deloitte-light-gray/20 rounded-lg p-4 mb-4">{incident.description}</p>
              <div>
                <p className="text-xs font-semibold text-deloitte-dark-gray uppercase mb-2">Affected Services</p>
                <div className="flex gap-2 flex-wrap">
                  {incident.affectedServices.map(svc => (
                    <span key={svc} className="text-xs bg-deloitte-light-gray/40 text-deloitte-dark-gray border border-deloitte-light-gray px-3 py-1 rounded-full">{svc}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
              <div className="px-5 py-4 border-b border-deloitte-light-gray/60">
                <h3 className="font-semibold text-deloitte-black">Incident Timeline</h3>
              </div>
              <div className="p-5">
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-deloitte-light-gray" />
                  <div className="space-y-4">
                    {incident.timeline.map(event => (
                      <div key={event.id} className="flex items-start gap-4 relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative z-10 ${TIMELINE_TYPE_COLORS[event.type] || 'bg-deloitte-light-gray/40 text-deloitte-dark-gray'}`}>
                          <AlertTriangle size={14} />
                        </div>
                        <div className="flex-1 bg-deloitte-light-gray/20 rounded-lg p-3">
                          <p className="text-sm font-medium text-deloitte-black">{event.description}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-deloitte-dark-gray">{event.actorName}</span>
                            <span className="text-xs text-deloitte-med-gray">{new Date(event.time).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
              <div className="px-5 py-4 border-b border-deloitte-light-gray/60">
                <h3 className="font-semibold text-deloitte-black">Communications Log</h3>
              </div>
              <div className="divide-y divide-deloitte-light-gray/40">
                {incident.communications.map(comm => (
                  <div key={comm.id} className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-deloitte-med-gray" />
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${comm.channel === 'status_page' ? 'bg-deloitte-green/10 text-deloitte-green' : comm.channel === 'email' ? 'bg-deloitte-light-gray/60 text-deloitte-dark-gray' : comm.channel === 'slack' ? 'bg-deloitte-dark-gray/10 text-deloitte-dark-gray' : 'bg-deloitte-light-gray/40 text-deloitte-dark-gray'}`}>
                          {comm.channel.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-deloitte-dark-gray">by {comm.sentBy}</span>
                      </div>
                      <span className="text-xs text-deloitte-med-gray">{new Date(comm.sentAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-deloitte-dark-gray bg-deloitte-light-gray/20 rounded-lg p-3">{comm.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
              <h3 className="font-semibold text-deloitte-black border-b border-deloitte-light-gray/60 pb-3 mb-4">Incident Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-deloitte-med-gray mb-0.5">Started</p>
                  <p className="font-medium text-deloitte-black">{new Date(incident.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-deloitte-med-gray mb-0.5">Duration</p>
                  <p className="font-medium text-deloitte-black">{formatDuration(incident.startTime, incident.resolvedTime)}</p>
                </div>
                {incident.identifiedTime && (
                  <div>
                    <p className="text-xs text-deloitte-med-gray mb-0.5">Root Cause Identified</p>
                    <p className="font-medium text-deloitte-black">{new Date(incident.identifiedTime).toLocaleString()}</p>
                  </div>
                )}
                {commander && (
                  <div>
                    <p className="text-xs text-deloitte-med-gray mb-1">Incident Commander</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-deloitte-green rounded-full flex items-center justify-center text-deloitte-black text-xs font-bold">{commander.avatar}</div>
                      <p className="font-medium text-deloitte-black">{commander.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
              <div className="px-5 py-4 border-b border-deloitte-light-gray/60">
                <h3 className="font-semibold text-deloitte-black">Action Items</h3>
              </div>
              <div className="divide-y divide-deloitte-light-gray/40">
                {incident.actionItems.map(ai => (
                  <div key={ai.id} className="px-5 py-3 flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${ai.completed ? 'bg-deloitte-green border-deloitte-green' : 'border-deloitte-light-gray'}`}>
                      {ai.completed && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${ai.completed ? 'text-deloitte-med-gray line-through' : 'text-deloitte-black'}`}>{ai.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-deloitte-med-gray">
                        <span>{ai.assignee}</span>
                        <span>Due: {new Date(ai.dueAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {linkedTickets.length > 0 && (
              <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
                <div className="px-5 py-4 border-b border-deloitte-light-gray/60 flex items-center justify-between">
                  <h3 className="font-semibold text-deloitte-black">Linked Tickets</h3>
                  <span className="text-xs text-deloitte-med-gray">{linkedTickets.length}</span>
                </div>
                <div className="divide-y divide-deloitte-light-gray/40 max-h-64 overflow-y-auto">
                  {linkedTickets.slice(0, 8).map(t => t && (
                    <button key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} className="w-full px-4 py-2.5 text-left hover:bg-deloitte-light-gray/20 flex items-center gap-3 transition-colors">
                      <span className="text-xs font-mono text-deloitte-med-gray">{t.id}</span>
                      <span className="text-xs text-deloitte-dark-gray truncate flex-1">{t.subject}</span>
                      <ExternalLink size={11} className="text-deloitte-light-gray shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IncidentsPage() {
  const { id } = useParams<{ id: string }>();
  return id ? <IncidentDetailPage /> : <IncidentListPage />;
}
