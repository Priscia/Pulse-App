import type { TicketPriority } from '../../types';
import { Flame, ArrowUp, Minus, ArrowDown, type LucideIcon } from 'lucide-react';

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
};

const PRIORITY_ICONS: Record<TicketPriority, LucideIcon> = {
  critical: Flame,
  high: ArrowUp,
  medium: Minus,
  low: ArrowDown,
};

interface Props {
  priority: TicketPriority;
  size?: 'sm' | 'md';
}

export default function PriorityChip({ priority, size = 'md' }: Props) {
  const Icon = PRIORITY_ICONS[priority];
  const base = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium capitalize ${base} ${PRIORITY_STYLES[priority]}`}>
      <Icon size={10} />
      {priority}
    </span>
  );
}
