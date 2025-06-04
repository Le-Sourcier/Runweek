import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock data for heart rate trend - this should ideally be passed as a prop or fetched
const heartRateData = [
  { day: "Mar", value: 72 },
  { day: "Mer", value: 74 },
  { day: "Jeu", value: 71 },
  { day: "Ven", value: 73 },
  { day: "Sam", value: 70 },
  { day: "Dim", value: 71 },
  { day: "Lun", value: 72 },
];

const HeartRateTrendWidget: React.FC = () => {
  return (
    <div className="chart-container mb-8"> {/* Ensured mb-8 for spacing */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-card-foreground mb-1">
            Tendance de fréquence cardiaque
          </h3>
          <p className="text-sm text-muted-foreground">
            Moyenne des 7 derniers jours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Moy:</span>
          <span className="font-medium text-red-500 dark:text-red-400">72 BPM</span>
          <span className="text-green-500 dark:text-green-400">↑</span>
        </div>
      </div>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={heartRateData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(var(--destructive))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HeartRateTrendWidget;
