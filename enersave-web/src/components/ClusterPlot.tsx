"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Flame, Info } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ClusterPoint {
  hour: number;
  kw: number;
  temperature: number;
  cluster: 0 | 1 | 2;
}

const clusterColors: Record<number, string> = {
  0: "#22c55e",
  1: "#3b82f6",
  2: "#ef4444"
};

const clusterProfiles = {
  0: {
    label: "Efficient / Low Load",
    shortLabel: "Efficient",
    badge: "success" as const,
    color: "#22c55e",
    icon: CheckCircle2,
    description: "Usage is light for the time of day. Keep normal monitoring.",
    action: "Good candidate for keeping Eco-Mode enabled."
  },
  1: {
    label: "Normal Operations",
    shortLabel: "Normal",
    badge: "info" as const,
    color: "#3b82f6",
    icon: Info,
    description: "Expected activity for occupied building hours.",
    action: "No urgent action. Watch for rooms left on after occupancy drops."
  },
  2: {
    label: "High Demand / Possible Waste",
    shortLabel: "High Demand",
    badge: "destructive" as const,
    color: "#ef4444",
    icon: Flame,
    description: "Demand is higher than the usual profile.",
    action: "Check AC, computer lab, cafeteria, or unused rooms with active equipment."
  }
};

function HumanTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ClusterPoint }> }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;
  const profile = clusterProfiles[point.cluster];

  return (
    <div className="max-w-64 rounded-lg border border-border bg-card p-3 text-sm shadow-lg">
      <p className="font-semibold" style={{ color: profile.color }}>
        {profile.label}
      </p>
      <p className="mt-1 text-muted-foreground">Hour {point.hour}:00</p>
      <p>Demand: {point.kw.toFixed(2)} kW</p>
      <p>Temperature index: {point.temperature.toFixed(2)}</p>
      <p className="mt-2 text-xs text-muted-foreground">{profile.action}</p>
    </div>
  );
}

export function ClusterPlot() {
  const [points, setPoints] = useState<ClusterPoint[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  async function loadClusters() {
    setStatus("loading");
    try {
      const response = await fetch("/api/analytics/clusters", {
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error("Analytics service unavailable");
      }
      const payload = (await response.json()) as ClusterPoint[];
      setPoints(payload);
      setStatus("ready");
    } catch {
      setPoints([]);
      setStatus("error");
    }
  }

  useEffect(() => {
    void loadClusters();
  }, []);

  const counts = useMemo(
    () =>
      points.reduce<Record<number, number>>((acc, point) => {
        acc[point.cluster] = (acc[point.cluster] ?? 0) + 1;
        return acc;
      }, {}),
    [points]
  );
  const dominantCluster = useMemo(() => {
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries.length ? Number(entries[0][0]) : null;
  }, [counts]);
  const peakPoints = useMemo(() => points.filter((point) => point.cluster === 2).length, [points]);
  const totalSamples = points.length;
  const highDemandHours = useMemo(() => {
    const hourCounts = points
      .filter((point) => point.cluster === 2)
      .reduce<Record<number, number>>((acc, point) => {
        acc[point.hour] = (acc[point.hour] ?? 0) + 1;
        return acc;
      }, {});
    const sorted = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: Number(hour), count }))
      .sort((a, b) => b.count - a.count);
    return sorted.slice(0, 3);
  }, [points]);
  const highDemandRange = useMemo(() => {
    const hours = points.filter((point) => point.cluster === 2).map((point) => point.hour).sort((a, b) => a - b);
    if (!hours.length) return null;
    const start = hours[Math.floor(hours.length * 0.25)];
    const end = hours[Math.floor(hours.length * 0.75)];
    return { start, end };
  }, [points]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>AI Energy Profile Reader</CardTitle>
          <CardDescription>Plain-language interpretation of K-Means demand patterns.</CardDescription>
        </div>
        <Button variant="outline" onClick={() => void loadClusters()}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {status === "error" ? (
          <div className="rounded-lg border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground">
            Analytics is unavailable right now. Check the AI service connection, then refresh this panel.
          </div>
        ) : (
          <>
            <div className="mb-5 rounded-lg border border-border bg-muted p-4">
              <p className="text-sm font-semibold">Plain-English Summary</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {totalSamples
                  ? `Out of ${totalSamples} readings: ${counts[0] ?? 0} were EFFICIENT, ${counts[1] ?? 0} were NORMAL, and ${counts[2] ?? 0} were HIGH DEMAND.`
                  : "Loading readings..."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {peakPoints && highDemandRange
                  ? `Most high-demand readings happened between ${highDemandRange.start}:00 and ${highDemandRange.end}:00 — consider scheduling heavy equipment outside these hours.`
                  : peakPoints
                    ? "High-demand readings are present — check which rooms are active during peak times."
                    : "No high-demand readings detected in this sample."}
              </p>
              {highDemandHours.length ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Most common high-demand hours:{" "}
                  {highDemandHours.map((entry) => `${entry.hour}:00 (${entry.count})`).join(", ")}
                </p>
              ) : null}
            </div>

            <div className="mb-5 grid gap-3 lg:grid-cols-3">
              {[0, 1, 2].map((clusterId) => {
                const profile = clusterProfiles[clusterId as 0 | 1 | 2];
                const Icon = profile.icon;
                const count = counts[clusterId] ?? 0;
                const percent = totalSamples ? count / totalSamples : 0;

                return (
                  <div key={clusterId} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-md border"
                          style={{
                            borderColor: `${profile.color}40`,
                            backgroundColor: `${profile.color}22`,
                            color: profile.color
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <Badge variant={profile.badge} className="px-3 py-1.5 text-sm">
                            {profile.shortLabel}
                          </Badge>
                          <p className="mt-2 text-sm font-semibold">{profile.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{profile.action}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold">{count}</p>
                        <p className="text-xs text-muted-foreground">readings</p>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-border">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${Math.min(1, Math.max(0, percent)) * 100}%`, backgroundColor: profile.color }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{profile.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mb-5 rounded-lg border border-border bg-muted p-4">
              <p className="text-sm font-semibold">AI Reading</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dominantCluster === null
                  ? "Waiting for enough analytics samples."
                  : `${clusterProfiles[dominantCluster as 0 | 1 | 2].label} is the most common pattern in this sample. ${peakPoints} readings are marked as high demand, so administrators should inspect active room equipment before peak hours.`}
              </p>
            </div>

            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ left: 8, right: 24, top: 12, bottom: 14 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                  <XAxis
                    dataKey="hour"
                    name="Hour"
                    type="number"
                    domain={[0, 23]}
                    tickCount={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#e2e8f0" }}
                    label={{ value: "Hour of Day", position: "insideBottom", offset: -8 }}
                  />
                  <YAxis
                    dataKey="kw"
                    name="Demand"
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#e2e8f0" }}
                    label={{ value: "Power Used (kW)", angle: -90, position: "insideLeft" }}
                  />
                  <ZAxis dataKey="temperature" range={[70, 180]} name="Temperature" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<HumanTooltip />} />
                  <Legend
                    formatter={(value) => {
                      const id = Number(value);
                      return clusterProfiles[id as 0 | 1 | 2]?.label ?? value;
                    }}
                  />
                  {[0, 1, 2].map((clusterId) => (
                    <Scatter
                      key={clusterId}
                      name={String(clusterId)}
                      data={points.filter((point) => point.cluster === clusterId)}
                      fill={clusterColors[clusterId]}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
