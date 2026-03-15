import { useState, useEffect } from 'react';
import { Phone, Video, Users, Mic, MicOff, Clock, ChevronDown, ChevronUp, ExternalLink, RadioTower, Zap } from 'lucide-react';

type CallPlatform = 'zoom' | 'teams' | 'webex';

interface TACCall {
  id: string;
  title: string;
  incidentRef: string;
  severity: 'p1' | 'p2';
  platform: CallPlatform;
  joinUrl: string;
  hostName: string;
  startedAt: string;
  participantCount: number;
  description: string;
  bridgeNumber?: string;
  passcode?: string;
}

const MOCK_ACTIVE_CALLS: TACCall[] = [
  {
    id: 'tac1',
    title: 'Email Services Global Outage',
    incidentRef: 'INC-20480',
    severity: 'p1',
    platform: 'zoom',
    joinUrl: 'https://zoom.us/j/95012345678',
    hostName: 'J. Martinez (Incident Commander)',
    startedAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    participantCount: 47,
    description: 'Exchange Online intermittent failures impacting all EMEA & APAC regions. Network engineering, cloud ops, and vendor escalation on the call.',
    bridgeNumber: '+1 646-876-9923',
    passcode: '8812',
  },
  {
    id: 'tac2',
    title: 'ERP Authentication Service Degradation',
    incidentRef: 'INC-20475',
    severity: 'p2',
    platform: 'teams',
    joinUrl: 'https://teams.microsoft.com/l/meetup-join/demo',
    hostName: 'A. Patel (Lead Engineer)',
    startedAt: new Date(Date.now() - 92 * 60 * 1000).toISOString(),
    participantCount: 18,
    description: 'SSO login failures for SAP S/4HANA. Workaround via direct DB auth deployed — monitoring for full resolution.',
    bridgeNumber: '+1 800-555-0192',
    passcode: '4450#',
  },
];

const PLATFORM_CONFIG: Record<CallPlatform, { label: string; bgClass: string; textClass: string; borderClass: string; icon: React.ElementType }> = {
  zoom:  { label: 'Zoom',         bgClass: 'bg-blue-600',   textClass: 'text-blue-600',  borderClass: 'border-blue-600', icon: Video },
  teams: { label: 'Teams',        bgClass: 'bg-sky-600',    textClass: 'text-sky-600',   borderClass: 'border-sky-600', icon: Users },
  webex: { label: 'Webex',        bgClass: 'bg-teal-600',   textClass: 'text-teal-600',  borderClass: 'border-teal-600', icon: Phone },
};

const SEVERITY_CONFIG = {
  p1: { label: 'P1 — Critical', badgeClass: 'bg-red-100 text-red-700 border-red-200', pulseClass: 'bg-red-500' },
  p2: { label: 'P2 — High',    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200', pulseClass: 'bg-orange-500' },
};

function formatDuration(startedAt: string): string {
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function CallCard({ call }: { call: TACCall }) {
  const [expanded, setExpanded] = useState(call.severity === 'p1');
  const [duration, setDuration] = useState(() => formatDuration(call.startedAt));
  const platform = PLATFORM_CONFIG[call.platform];
  const severity = SEVERITY_CONFIG[call.severity];
  const PlatformIcon = platform.icon;

  useEffect(() => {
    const timer = setInterval(() => setDuration(formatDuration(call.startedAt)), 1000);
    return () => clearInterval(timer);
  }, [call.startedAt]);

  return (
    <div className="border border-deloitte-light-gray rounded-lg overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-deloitte-light-gray/10 transition-colors text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="relative shrink-0">
          <div className={`w-2 h-2 rounded-full ${severity.pulseClass} animate-pulse`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${severity.badgeClass}`}>{severity.label}</span>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded border bg-white ${platform.textClass} ${platform.borderClass}`}>
              {platform.label}
            </span>
            <span className="text-xs text-deloitte-med-gray font-mono">{call.incidentRef}</span>
          </div>
          <p className="text-sm font-semibold text-deloitte-black mt-0.5 truncate">{call.title}</p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-xs text-deloitte-med-gray">
            <Clock size={11} />
            <span className="font-mono">{duration}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-deloitte-med-gray">
            <Users size={11} />
            <span>{call.participantCount}</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-deloitte-med-gray shrink-0 ml-1" /> : <ChevronDown size={14} className="text-deloitte-med-gray shrink-0 ml-1" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-deloitte-light-gray/60 pt-3 space-y-3">
          <p className="text-xs text-deloitte-med-gray leading-relaxed">{call.description}</p>

          <div className="flex items-center gap-1.5 text-xs text-deloitte-med-gray">
            <Mic size={11} />
            <span className="font-medium text-deloitte-dark-gray">Host:</span>
            <span>{call.hostName}</span>
          </div>

          {call.bridgeNumber && (
            <div className="bg-deloitte-light-gray/20 rounded-lg px-3 py-2 flex flex-wrap gap-x-6 gap-y-1">
              <div className="flex items-center gap-1.5 text-xs">
                <Phone size={11} className="text-deloitte-med-gray" />
                <span className="text-deloitte-med-gray">Dial-in:</span>
                <span className="font-mono font-medium text-deloitte-black">{call.bridgeNumber}</span>
                {call.passcode && <span className="text-deloitte-med-gray ml-1">Code: <span className="font-mono font-medium text-deloitte-black">{call.passcode}</span></span>}
              </div>
            </div>
          )}

          <a
            href={call.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-semibold text-white ${platform.bgClass} hover:opacity-90 active:scale-[0.98] transition-all`}
          >
            <PlatformIcon size={14} />
            Join {platform.label} Call
            <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}

export default function LiveTACCall() {
  const [expanded, setExpanded] = useState(true);
  const calls = MOCK_ACTIVE_CALLS;
  const activeCount = calls.length;

  return (
    <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-deloitte-light-gray/10 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <RadioTower size={15} className="text-deloitte-dark-gray shrink-0" />
        <span className="font-semibold text-sm text-deloitte-black">Current Live TAC Calls</span>

        {activeCount > 0 ? (
          <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border bg-red-50 border-red-200 text-red-700 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {activeCount} Active {activeCount === 1 ? 'Call' : 'Calls'}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 border-green-200 text-green-700 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            No Active Calls
          </span>
        )}

        {activeCount > 0 && (
          <div className="ml-auto flex items-center gap-1 mr-1">
            <Zap size={12} className="text-red-500" />
            <span className="text-xs text-red-600 font-semibold">Hop On</span>
          </div>
        )}

        {expanded ? <ChevronUp size={14} className="text-deloitte-med-gray shrink-0" /> : <ChevronDown size={14} className="text-deloitte-med-gray shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-deloitte-light-gray/60 p-3 space-y-2">
          {activeCount === 0 ? (
            <div className="py-5 text-center text-sm text-deloitte-med-gray flex flex-col items-center gap-2">
              <MicOff size={20} className="text-deloitte-light-gray" />
              <span>No TAC calls in progress</span>
              <span className="text-xs text-deloitte-med-gray/70">Calls will appear here automatically when a critical incident is declared</span>
            </div>
          ) : (
            <>
              <p className="text-xs text-deloitte-med-gray px-1 pb-1">
                All staff are encouraged to join relevant calls. No invitation required.
              </p>
              {calls.map(call => <CallCard key={call.id} call={call} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
