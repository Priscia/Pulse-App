import type { TicketStatus } from '../../types';

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: 'bg-deloitte-green/10 text-deloitte-green border-deloitte-green/30',
  in_progress: 'bg-deloitte-dark-gray/10 text-deloitte-dark-gray border-deloitte-dark-gray/30',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  resolved: 'bg-deloitte-light-gray/50 text-deloitte-dark-gray border-deloitte-light-gray',
  closed: 'bg-deloitte-light-gray/30 text-deloitte-med-gray border-deloitte-light-gray',
  on_hold: 'bg-deloitte-med-gray/10 text-deloitte-med-gray border-deloitte-med-gray/30',
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  pending: 'Pending',
  resolved: 'Resolved',
  closed: 'Closed',
  on_hold: 'On Hold',
};

const STATUS_DOTS: Record<TicketStatus, string> = {
  open: 'bg-deloitte-green',
  in_progress: 'bg-deloitte-dark-gray animate-pulse',
  pending: 'bg-amber-500',
  resolved: 'bg-deloitte-med-gray',
  closed: 'bg-deloitte-light-gray',
  on_hold: 'bg-deloitte-med-gray',
};

interface Props {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export default function StatusChip({ status, size = 'md' }: Props) {
  const base = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${base} ${STATUS_STYLES[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
