import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { DailyNutrition } from "../../types/diet";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

interface WeeklyNutritionTrendProps {
  dailyNutrition: DailyNutrition[];
  type: "calories" | "protein" | "water";
}

const WeeklyNutritionTrend: React.FC<WeeklyNutritionTrendProps> = ({
  dailyNutrition,
  type,
}) => {
  // Generate last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const dayData =
      dailyNutrition && dailyNutrition.find((d) => d.date === date);

    let value = 0;
    switch (type) {
      case "calories":
        value = dayData?.totalCalories || 0;
        break;
      case "protein":
        value = dayData?.totalProtein || 0;
        break;
      case "water":
        value = dayData?.waterIntake || 0;
        break;
    }

    return {
      date,
      day: format(subDays(new Date(), 6 - i), "EEE", { locale: fr }),
      value,
      hasData: !!dayData,
    };
  });

  const getColor = () => {
    switch (type) {
      case "calories":
        return "#3B82F6";
      case "protein":
        return "#10B981";
      case "water":
        return "#06B6D4";
      default:
        return "#6366F1";
    }
  };

  const getUnit = () => {
    switch (type) {
      case "calories":
        return "cal";
      case "protein":
        return "g";
      case "water":
        return "ml";
      default:
        return "";
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            {Math.round(data.value)} {getUnit()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        {type === "water" ? (
          <BarChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={getColor()} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={getColor()}
              strokeWidth={3}
              dot={{ fill: getColor(), strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: getColor() }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyNutritionTrend;
