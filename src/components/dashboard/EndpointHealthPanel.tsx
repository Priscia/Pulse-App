import { useState } from 'react';
import { Monitor, Apple, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, AlertTriangle, RefreshCw, WifiOff, HardDrive } from 'lucide-react';

interface OSFleet {
  os: 'windows' | 'mac';
  totalDevices: number;
  healthy: number;
  warning: number;
  critical: number;
  offline: number;
  pendingUpdates: number;
  encryptionCompliant: number;
  avgOsVersion: string;
  issues: FleetIssue[];
}

interface FleetIssue {
  id: string;
  severity: 'critical' | 'warning';
  message: string;
  count: number;
}

const MOCK_FLEET: OSFleet[] = [
  {
    os: 'windows',
    totalDevices: 4821,
    healthy: 4407,
    warning: 284,
    critical: 76,
    offline: 54,
    pendingUpdates: 312,
    encryptionCompliant: 4769,
    avgOsVersion: 'Win 11 23H2',
    issues: [
      { id: 'w1', severity: 'critical', message: 'Defender definitions outdated (>7 days)', count: 76 },
      { id: 'w2', severity: 'warning', message: 'Pending OS security patch (KB5034441)', count: 203 },
      { id: 'w3', severity: 'warning', message: 'BitLocker encryption key not escrowed', count: 52 },
      { id: 'w4', severity: 'warning', message: 'Disk usage >90%', count: 29 },
    ],
  },
  {
    os: 'mac',
    totalDevices: 2154,
    healthy: 2008,
    warning: 101,
    critical: 28,
    offline: 17,
    pendingUpdates: 89,
    encryptionCompliant: 2141,
    avgOsVersion: 'macOS 14.3 Sonoma',
    issues: [
      { id: 'm1', severity: 'critical', message: 'XProtect remediations blocked (SIP issue)', count: 28 },
      { id: 'm2', severity: 'warning', message: 'macOS 14.4 update available', count: 89 },
      { id: 'm3', severity: 'warning', message: 'FileVault recovery key not stored in MDM', count: 12 },
    ],
  },
];

const STATUS_COLORS = {
  healthy:  { bar: 'bg-deloitte-green',  text: 'text-green-700',  bg: 'bg-green-50' },
  warning:  { bar: 'bg-amber-400',       text: 'text-amber-700',  bg: 'bg-amber-50' },
  critical: { bar: 'bg-red-500',         text: 'text-red-700',    bg: 'bg-red-50' },
  offline:  { bar: 'bg-deloitte-med-gray', text: 'text-deloitte-med-gray', bg: 'bg-gray-50' },
};

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

function FleetCard({ fleet }: { fleet: OSFleet }) {
  const [showIssues, setShowIssues] = useState(false);
  const isWindows = fleet.os === 'windows';
  const Icon = isWindows ? Monitor : Apple;
  const label = isWindows ? 'Microsoft' : 'Apple Mac';
  const accentColor = isWindows ? 'text-sky-600' : 'text-deloitte-dark-gray';
  const borderAccent = isWindows ? 'border-sky-200' : 'border-deloitte-light-gray';

  const healthPct = pct(fleet.healthy, fleet.totalDevices);
  const criticalCount = fleet.critical;
  const hasProblems = criticalCount > 0 || fleet.warning > 0;

  const segments = [
    { key: 'healthy',  value: fleet.healthy,  width: pct(fleet.healthy, fleet.totalDevices) },
    { key: 'warning',  value: fleet.warning,  width: pct(fleet.warning, fleet.totalDevices) },
    { key: 'critical', value: fleet.critical, width: pct(fleet.critical, fleet.totalDevices) },
    { key: 'offline',  value: fleet.offline,  width: pct(fleet.offline, fleet.totalDevices) },
  ] as const;

  return (
    <div className={`border ${borderAccent} rounded-lg overflow-hidden`}>
      <div className="px-3 py-2.5 flex items-center gap-2">
        <Icon size={14} className={`${accentColor} shrink-0`} />
        <span className={`text-xs font-bold ${accentColor}`}>{label}</span>
        <span className="text-xs text-deloitte-med-gray ml-1">{fleet.totalDevices.toLocaleString()} devices</span>
        <span className="text-xs text-deloitte-med-gray ml-1">· {fleet.avgOsVersion}</span>

        <div className="ml-auto flex items-center gap-1.5">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700">
              <ShieldAlert size={10} />
              {criticalCount}
            </span>
          )}
          <span className={`text-xs font-semibold ${healthPct >= 95 ? 'text-green-700' : healthPct >= 88 ? 'text-amber-600' : 'text-red-600'}`}>
            {healthPct}% healthy
          </span>
        </div>
      </div>

      <div className="flex h-1.5 w-full rounded-none overflow-hidden">
        {segments.map(s => (
          <div
            key={s.key}
            className={`${STATUS_COLORS[s.key].bar} transition-all`}
            style={{ width: `${s.width}%` }}
          />
        ))}
      </div>

      <div className="px-3 py-2 flex items-center gap-3 flex-wrap">
        {segments.map(s => (
          <div key={s.key} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-sm ${STATUS_COLORS[s.key].bar}`} />
            <span className="text-xs text-deloitte-med-gray capitalize">{s.key}</span>
            <span className="text-xs font-semibold text-deloitte-black">{s.value.toLocaleString()}</span>
          </div>
        ))}

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-deloitte-med-gray">
            <RefreshCw size={10} />
            <span>{fleet.pendingUpdates} updates pending</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-deloitte-med-gray">
            <HardDrive size={10} />
            <span>{pct(fleet.encryptionCompliant, fleet.totalDevices)}% encrypted</span>
          </span>
        </div>
      </div>

      {hasProblems && (
        <button
          className="w-full px-3 py-1.5 flex items-center gap-1.5 border-t border-deloitte-light-gray/40 hover:bg-deloitte-light-gray/10 transition-colors"
          onClick={() => setShowIssues(v => !v)}
        >
          <AlertTriangle size={11} className="text-amber-500" />
          <span className="text-xs text-deloitte-med-gray">{fleet.issues.length} issues detected</span>
          {showIssues ? <ChevronUp size={11} className="text-deloitte-med-gray ml-auto" /> : <ChevronDown size={11} className="text-deloitte-med-gray ml-auto" />}
        </button>
      )}

      {showIssues && (
        <div className="border-t border-deloitte-light-gray/40 divide-y divide-deloitte-light-gray/30">
          {fleet.issues.map(issue => (
            <div key={issue.id} className="px-3 py-2 flex items-start gap-2">
              <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${issue.severity === 'critical' ? 'bg-red-500' : 'bg-amber-400'}`} />
              <span className="text-xs text-deloitte-dark-gray leading-relaxed flex-1">{issue.message}</span>
              <span className={`text-xs font-semibold shrink-0 ${issue.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
                {issue.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EndpointHealthPanel() {
  const [expanded, setExpanded] = useState(true);

  const totalDevices = MOCK_FLEET.reduce((s, f) => s + f.totalDevices, 0);
  const totalCritical = MOCK_FLEET.reduce((s, f) => s + f.critical, 0);
  const totalHealthy = MOCK_FLEET.reduce((s, f) => s + f.healthy, 0);
  const overallHealthPct = pct(totalHealthy, totalDevices);

  const headerStatus = totalCritical > 0
    ? { label: `${totalCritical} Critical`, dot: 'bg-red-500 animate-pulse', text: 'text-red-700', bg: 'bg-red-50 border-red-200' }
    : overallHealthPct >= 97
    ? { label: 'Fleet Healthy', dot: 'bg-deloitte-green', text: 'text-green-700', bg: 'bg-green-50 border-green-200' }
    : { label: 'Attention Needed', dot: 'bg-amber-500 animate-pulse', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };

  return (
    <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-deloitte-light-gray/10 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <ShieldCheck size={15} className="text-deloitte-dark-gray shrink-0" />
        <span className="font-semibold text-sm text-deloitte-black">Endpoint Health</span>
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${headerStatus.bg} ${headerStatus.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${headerStatus.dot}`} />
          {headerStatus.label}
        </span>
        <div className="ml-auto flex items-center gap-2 mr-1">
          <span className="text-xs text-deloitte-med-gray">{totalDevices.toLocaleString()} devices</span>
          <span className="flex items-center gap-1 text-xs text-deloitte-med-gray">
            <WifiOff size={10} />
            {MOCK_FLEET.reduce((s, f) => s + f.offline, 0)} offline
          </span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-deloitte-med-gray shrink-0" /> : <ChevronDown size={14} className="text-deloitte-med-gray shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-deloitte-light-gray/60 p-3 space-y-2">
          {MOCK_FLEET.map(fleet => <FleetCard key={fleet.os} fleet={fleet} />)}
        </div>
      )}
    </div>
  );
}
