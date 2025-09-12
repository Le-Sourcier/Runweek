import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DailyNutrition, NutritionGoals } from '../../types/diet';

interface NutritionChartProps {
  currentDay: DailyNutrition | null;
  goals: NutritionGoals;
}

const NutritionChart: React.FC<NutritionChartProps> = ({ currentDay }) => {
  if (!currentDay) return null;

  const data = [
    {
      name: 'Protéines',
      value: currentDay.totalProtein * 4, // 4 cal per gram
      percentage: Math.round((currentDay.totalProtein * 4 / currentDay.totalCalories) * 100),
      color: '#10B981',
    },
    {
      name: 'Glucides',
      value: currentDay.totalCarbs * 4, // 4 cal per gram
      percentage: Math.round((currentDay.totalCarbs * 4 / currentDay.totalCalories) * 100),
      color: '#3B82F6',
    },
    {
      name: 'Lipides',
      value: currentDay.totalFat * 9, // 9 cal per gram
      percentage: Math.round((currentDay.totalFat * 9 / currentDay.totalCalories) * 100),
      color: '#F59E0B',
    },
  ];

  interface TooltipPayload {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: TooltipPayload }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {Math.round(data.value)} calories ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: { color: string }) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NutritionChart;