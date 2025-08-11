import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';

interface CategoryChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  title?: string;
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
}

const COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#f43f5e', // rose-500
];

export function CategoryChart({
  data,
  title = 'Spending by Category',
  height = 300,
  showLegend = true,
  showLabels = false,
}: CategoryChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Filter out zero values and sort by amount
  const filteredData = data
    .filter((item) => Math.abs(item.value) > 0)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 8); // Show top 8 categories

  // Calculate total for percentages
  const total = filteredData.reduce((sum, item) => sum + Math.abs(item.value), 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((Math.abs(data.value) / total) * 100).toFixed(1);

      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <div className="space-y-1">
            <p className="font-medium">{data.name}</p>
            <p className="text-sm">{formatCurrency(Math.abs(data.value), { showCode: true })}</p>
            <p className="text-xs text-muted-foreground">{percentage}% of total</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (!showLabels || percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <p className="text-sm text-muted-foreground">No spending data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={isDark ? '#1e293b' : '#ffffff'}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Summary below chart */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">{formatCurrency(total, { showCode: true })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Categories:</span>
            <span className="font-medium">{filteredData.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Alternative: Bar chart version
export function CategoryBarChart({ data, title = 'Spending by Category' }: CategoryChartProps) {
  const filteredData = data
    .filter((item) => Math.abs(item.value) > 0)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredData.map((item, index) => {
            const percentage =
              (Math.abs(item.value) / filteredData.reduce((sum, i) => sum + Math.abs(i.value), 0)) *
              100;

            return (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(Math.abs(item.value))}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Minimal version for mobile
export function CategoryChartMini({ data }: { data: Array<{ name: string; value: number }> }) {
  const filteredData = data.filter((item) => Math.abs(item.value) > 0);

  return (
    <div className="grid grid-cols-2 gap-2">
      {filteredData.map((item, index) => (
        <div key={item.name} className="flex items-center space-x-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
          />
          <div>
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(Math.abs(item.value))}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
