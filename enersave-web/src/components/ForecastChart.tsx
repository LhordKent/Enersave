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

import type { LivePoint } from "./LiveChart";

export function ForecastChart({ data, targetKw = 30 }: { data: LivePoint[]; targetKw?: number }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 18, top: 12, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
          <XAxis dataKey="time" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: "#e2e8f0" }} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} unit=" kW" tick={{ fill: "#e2e8f0" }} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: "#2a2d3a",
              backgroundColor: "#1a1d27",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
              color: "#e2e8f0"
            }}
            formatter={(value) => [`${value} kW`, "Actual"]}
          />
          <ReferenceLine
            y={targetKw}
            stroke="#22c55e"
            strokeDasharray="6 6"
            label={{ value: `Target: ${targetKw} kW`, position: "insideTopLeft", fill: "#e2e8f0", fontSize: 12 }}
          />
          <Line type="monotone" dataKey="kw" stroke="#00c9a7" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
