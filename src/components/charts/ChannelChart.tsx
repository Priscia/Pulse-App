import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { ChannelMetric } from '../../types';

const CHANNEL_COLORS: Record<keyof Omit<ChannelMetric, 'date'>, string> = {
  email: '#86BC25',
  phone: '#53565A',
  chat: '#747678',
  web: '#6a9b1d',
  api: '#D0D0CE',
};

interface Props {
  data: ChannelMetric[];
}

export default function ChannelChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#747678' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#747678' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#53565A', border: '1px solid #747678', borderRadius: 8, color: '#FFFFFF', fontSize: 12 }}
          labelStyle={{ color: '#D0D0CE' }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        {(Object.keys(CHANNEL_COLORS) as (keyof typeof CHANNEL_COLORS)[]).map(key => (
          <Bar key={key} dataKey={key} stackId="a" fill={CHANNEL_COLORS[key]} radius={key === 'api' ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
