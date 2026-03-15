import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';

interface DataPoint { date: string; csat: number }

interface Props {
  data: DataPoint[];
  target?: number;
}

export default function CSATTrendChart({ data, target = 4.2 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D0D0CE" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#747678' }} axisLine={false} tickLine={false} />
        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#747678' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#53565A', border: '1px solid #747678', borderRadius: 8, color: '#FFFFFF', fontSize: 12 }}
          formatter={(v: number | undefined) => [(v ?? 0).toFixed(2), 'CSAT'] as [string, string]}
        />
        <ReferenceLine y={target} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Target: ${target}`, fill: '#f59e0b', fontSize: 10 }} />
        <Line type="monotone" dataKey="csat" stroke="#86BC25" strokeWidth={2.5} dot={{ r: 4, fill: '#86BC25' }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
