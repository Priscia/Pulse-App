import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  onClick?: () => void;
}

const VARIANT_STYLES = {
  default: { card: 'bg-white border-deloitte-light-gray', icon: 'bg-deloitte-light-gray/50 text-deloitte-dark-gray', value: 'text-deloitte-black' },
  danger: { card: 'bg-white border-red-200 ring-1 ring-red-100', icon: 'bg-red-100 text-red-600', value: 'text-red-600' },
  warning: { card: 'bg-white border-amber-200 ring-1 ring-amber-100', icon: 'bg-amber-100 text-amber-600', value: 'text-amber-700' },
  success: { card: 'bg-white border-deloitte-green/30', icon: 'bg-deloitte-green/10 text-deloitte-green', value: 'text-deloitte-green' },
  info: { card: 'bg-white border-deloitte-dark-gray/30', icon: 'bg-deloitte-light-gray/60 text-deloitte-dark-gray', value: 'text-deloitte-dark-gray' },
};

const TREND_CONFIG = {
  up: { icon: TrendingUp, color: 'text-deloitte-green' },
  down: { icon: TrendingDown, color: 'text-red-500' },
  neutral: { icon: Minus, color: 'text-deloitte-med-gray' },
};

export default function KPITile({ title, value, subtitle, icon: Icon, trend, trendValue, variant = 'default', onClick }: Props) {
  const styles = VARIANT_STYLES[variant];
  const TrendIcon = trend ? TREND_CONFIG[trend].icon : null;
  const trendColor = trend ? TREND_CONFIG[trend].color : '';

  return (
    <div
      className={`rounded-xl border p-5 ${styles.card} ${onClick ? 'cursor-pointer hover:shadow-md transition-all duration-200' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-deloitte-med-gray">{title}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles.icon}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className={`text-3xl font-bold ${styles.value} mb-1`}>{value}</div>
      {subtitle && <p className="text-xs text-deloitte-med-gray">{subtitle}</p>}
      {trend && trendValue && TrendIcon && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
          <TrendIcon size={12} />
          <span>{trendValue} vs last period</span>
        </div>
      )}
    </div>
  );
}
