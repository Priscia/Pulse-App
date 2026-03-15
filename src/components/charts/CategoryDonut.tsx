import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#86BC25', '#53565A', '#747678', '#000000', '#D0D0CE', '#6a9b1d', '#3d4042', '#8fca28', '#5a5d60', '#a0d42e'];

interface DataPoint { name: string; value: number }

interface Props {
  data: DataPoint[];
  onSliceClick?: (category: string) => void;
}

export default function CategoryDonut({ data, onSliceClick }: Props) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const top8 = data.slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={top8}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          onClick={(entry) => onSliceClick?.(entry.name)}
          cursor={onSliceClick ? 'pointer' : 'default'}
        >
          {top8.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#53565A', border: '1px solid #747678', borderRadius: 8, color: '#FFFFFF', fontSize: 12 }}
          formatter={(value: number | undefined, name: string | undefined) => [`${value ?? 0} (${(((value ?? 0)/total)*100).toFixed(0)}%)`, name ?? ''] as [string, string]}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
