"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export interface LivePoint {
  time: string;
  kw: number;
}

export function LiveChart({ data, targetKw = 30, highKw = 85 }: { data: LivePoint[]; targetKw?: number; highKw?: number }) {
  const latest = data.length ? data[data.length - 1] : null;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 18, top: 12, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
          <XAxis dataKey="time" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: "#e2e8f0" }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            unit=" kW"
            domain={["dataMin - 3", "dataMax + 3"]}
            tick={{ fill: "#e2e8f0" }}
          />

          <ReferenceLine
            y={targetKw}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="6 6"
            label={{ value: `Efficiency Target: ${targetKw} kW`, position: "insideTopLeft", fill: "#e2e8f0", fontSize: 12 }}
          />
          <ReferenceLine
            y={highKw}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="6 6"
            label={{
              value: `Overload Warning: ${highKw} kW`,
              position: "insideTopLeft",
              fill: "#e2e8f0",
              fontSize: 12
            }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: "#2a2d3a",
              backgroundColor: "#1a1d27",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
              color: "#e2e8f0"
            }}
            formatter={(value) => [`${value} kW`, "Demand"]}
          />
          <Line
            type="monotone"
            dataKey="kw"
            stroke="#00c9a7"
            strokeWidth={3}
            dot={{ r: 4, fill: "#00c9a7" }}
            activeDot={{ r: 6 }}
            isAnimationActive
          />
          {latest ? (
            <ReferenceLine
              x={latest.time}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{
                value: `Now: ${latest.kw.toFixed(2)} kW`,
                position: "insideTopRight",
                fill: "#e2e8f0",
                fontSize: 12
              }}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
