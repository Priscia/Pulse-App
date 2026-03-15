import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const BUCKET_COLORS: Record<string, string> = {
  '0-1d': '#86BC25',
  '2-3d': '#f59e0b',
  '4-7d': '#f97316',
  '8d+': '#ef4444',
};

interface Props {
  buckets: Record<string, number>;
}

export default function AgingChart({ buckets }: Props) {
  const data = Object.entries(buckets).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#747678' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#747678' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#53565A', border: '1px solid #747678', borderRadius: 8, color: '#FFFFFF', fontSize: 12 }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={BUCKET_COLORS[entry.name] || '#86BC25'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
