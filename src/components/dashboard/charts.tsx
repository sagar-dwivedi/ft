import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../theme-provider';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export function SpendingChart({
  data,
}: {
  data: {
    date: string;
    spending: number | null;
    income: number | null;
  }[];
}) {
  const { theme } = useTheme();

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="income"
          stroke={theme === 'dark' ? '#22c55e' : '#16a34a'}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="spending"
          stroke={theme === 'dark' ? '#ef4444' : '#dc2626'}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
