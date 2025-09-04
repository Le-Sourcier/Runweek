import { FC } from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { weeklyData } from "../../pages/Statistics";
import Card from "../ui/Card";

export const weeklyDistance: FC = () => {

  return (
    <Card
      title="Weekly Distance"
      className="bg-card text-card-foreground border-border"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Bar
              dataKey="distance"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}