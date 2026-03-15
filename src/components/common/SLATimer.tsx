import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
  dueAt: string;
  breached: boolean;
  atRisk: boolean;
  compact?: boolean;
}

function formatTimeLeft(dueAt: string): { text: string; isNegative: boolean } {
  const diff = new Date(dueAt).getTime() - Date.now();
  const abs = Math.abs(diff);
  const isNegative = diff < 0;
  const hours = Math.floor(abs / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);
  if (hours > 48) {
    const days = Math.floor(hours / 24);
    return { text: `${days}d ${hours % 24}h`, isNegative };
  }
  if (hours > 0) return { text: `${hours}h ${minutes}m`, isNegative };
  return { text: `${minutes}m`, isNegative };
}

export default function SLATimer({ dueAt, breached, atRisk, compact = false }: Props) {
  const { text, isNegative } = formatTimeLeft(dueAt);

  if (breached) {
    return (
      <span className={`inline-flex items-center gap-1 ${compact ? 'text-xs' : 'text-xs'} font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5`}>
        <AlertTriangle size={10} className="animate-pulse" />
        {isNegative ? `${text} overdue` : text}
      </span>
    );
  }

  if (atRisk) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
        <Clock size={10} />
        {text} left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-deloitte-dark-gray bg-deloitte-light-gray/30 border border-deloitte-light-gray rounded-full px-2 py-0.5">
      <Clock size={10} />
      {text}
    </span>
  );
}
