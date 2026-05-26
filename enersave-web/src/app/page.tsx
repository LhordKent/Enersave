"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Gauge, TrendingDown, TrendingUp, Zap } from "lucide-react";

import { AlertsPage, ReportsPage, SettingsPage } from "@/components/AppPages";
import { ClusterPlot } from "@/components/ClusterPlot";
import { ControlPanel } from "@/components/ControlPanel";
import { ForecastChart } from "@/components/ForecastChart";
import { LiveChart, type LivePoint } from "@/components/LiveChart";
import { RoomManagement } from "@/components/RoomManagement";
import { InfoDialog } from "@/components/ui/info-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarNav, type SectionKey } from "@/components/SidebarNav";
import { BuildingStatusBanner, HighDemandAlertBanner, getBuildingStatus } from "@/components/StatusBanners";
import { dashboardDescription, howItWorksSections, pageTitle } from "@/lib/productCopy";
import type { BmsState } from "@/lib/simState";
import { cn } from "@/lib/utils";

interface TelemetryPayload {
  buildingId: string;
  currentKw: number;
  voltage: number;
  activePowerFactor: number;
  ecoMode: boolean;
  baseKw: number;
  activeRoomLoadKw: number;
  rooms: BmsState["rooms"];
  alerts: BmsState["systemAlerts"];
  timestamp: string;
}

interface ControlResponse {
  success: boolean;
  state: BmsState;
}

function formatPointTime(timestamp: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(timestamp));
}

function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  subtitle,
  trend,
  sparkline,
  pulse,
  status
}: {
  title: string;
  value: string;
  unit: string;
  icon: typeof Gauge;
  subtitle: string;
  trend: "up" | "down" | "stable";
  sparkline: number[];
  pulse?: boolean;
  status: "efficient" | "normal" | "high";
}) {
  const borderClass = {
    efficient: "border-l-4 border-l-emerald-500",
    normal: "border-l-4 border-l-blue-500",
    high: "border-l-4 border-l-red-500"
  };
  const iconClass = {
    efficient: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/25",
    normal: "bg-blue-500/15 text-blue-200 border border-blue-500/25",
    high: "bg-red-500/15 text-red-200 border border-red-500/25"
  };
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;

  const points = sparkline.length ? sparkline : [0];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1e-6, max - min);
  const coords = points
    .map((point, index) => {
      const x = (index / Math.max(1, points.length - 1)) * 64;
      const y = 20 - ((point - min) / range) * 18;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <Card className={cn("transition-shadow", borderClass[status], pulse && "metric-pulse")}>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground">{title}</span>
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-md", iconClass[status])}>
            <Icon className="h-5 w-5" />
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-end gap-2">
              <p className="text-5xl font-semibold tracking-normal">{value}</p>
              <p className="pb-2 text-sm text-muted-foreground">{unit}</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendIcon className="h-4 w-4" />
              {trend === "up" ? "Rising" : trend === "down" ? "Falling" : "Stable"}
            </div>
            <svg width="68" height="22" viewBox="0 0 68 22" aria-hidden="true">
              <polyline
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.2"
                points={coords}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [telemetry, setTelemetry] = useState<TelemetryPayload | null>(null);
  const [liveData, setLiveData] = useState<LivePoint[]>([]);
  const [bmsState, setBmsState] = useState<BmsState | null>(null);
  const [controlBusy, setControlBusy] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [section, setSection] = useState<SectionKey>("telemetry");
  const [dismissedHighDemand, setDismissedHighDemand] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  async function fetchTelemetry() {
    const response = await fetch("/api/energy/live", { cache: "no-store" });
    const payload = (await response.json()) as TelemetryPayload;
    setTelemetry(payload);
    setBmsState((current) => ({
      buildingId: payload.buildingId,
      ecoMode: payload.ecoMode,
      baseKw: payload.baseKw,
      voltage: payload.voltage,
      rooms: payload.rooms,
      systemAlerts: current?.systemAlerts ?? payload.alerts
    }));
    setLiveData((current) => [
      ...current.slice(-9),
      { time: formatPointTime(payload.timestamp), kw: payload.currentKw }
    ]);
  }

  async function fetchControlState() {
    const response = await fetch("/api/building/control", { cache: "no-store" });
    const payload = (await response.json()) as ControlResponse;
    if (payload.success) {
      setBmsState(payload.state);
    }
  }

  async function toggleEcoMode(ecoMode: boolean) {
    setControlBusy(true);
    try {
      const response = await fetch("/api/building/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ecoMode })
      });
      const payload = (await response.json()) as ControlResponse;
      if (payload.success) {
        setBmsState(payload.state);
        setHighlight(true);
        window.setTimeout(() => setHighlight(false), 950);
        await fetchTelemetry();
      }
    } finally {
      setControlBusy(false);
    }
  }

  async function toggleRoomDevice(roomId: string, deviceId: string, enabled: boolean) {
    setControlBusy(true);
    try {
      const response = await fetch("/api/building/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, deviceId, enabled })
      });
      const payload = (await response.json()) as ControlResponse;
      if (payload.success) {
        setBmsState(payload.state);
        setHighlight(true);
        window.setTimeout(() => setHighlight(false), 950);
        await fetchTelemetry();
      }
    } finally {
      setControlBusy(false);
    }
  }

  async function addRoom(room: { name: string; floor: string; occupancy: BmsState["rooms"][number]["occupancy"] }) {
    setControlBusy(true);
    try {
      const response = await fetch("/api/building/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addRoom", room })
      });
      const payload = (await response.json()) as ControlResponse;
      if (payload.success) {
        setBmsState(payload.state);
        await fetchTelemetry();
      }
    } finally {
      setControlBusy(false);
    }
  }

  async function updateRoom(
    roomId: string,
    room: { name: string; floor: string; occupancy: BmsState["rooms"][number]["occupancy"] }
  ) {
    setControlBusy(true);
    try {
      const response = await fetch("/api/building/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateRoom", roomId, room })
      });
      const payload = (await response.json()) as ControlResponse;
      if (payload.success) {
        setBmsState(payload.state);
        await fetchTelemetry();
      }
    } finally {
      setControlBusy(false);
    }
  }

  useEffect(() => {
    void fetchControlState();
    void fetchTelemetry();
    const interval = window.setInterval(() => {
      void fetchTelemetry();
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const operationalStatus = useMemo(() => {
    if (!bmsState) {
      return "Syncing";
    }
    return bmsState.ecoMode ? "Eco-Mode" : "Full Operation";
  }, [bmsState]);

  const targetKw = 30;
  const highKw = 85;
  const currentKw = telemetry?.currentKw ?? 0;
  const buildingStatus = useMemo(
    () => getBuildingStatus(currentKw, targetKw, highKw),
    [currentKw]
  );

  useEffect(() => {
    if (currentKw < highKw) {
      setDismissedHighDemand(false);
    }
  }, [currentKw, highKw]);

  const demandTrend = useMemo(() => {
    const values = liveData.map((point) => point.kw);
    if (values.length < 4) return "stable" as const;
    const a = values[values.length - 4];
    const b = values[values.length - 1];
    const delta = b - a;
    if (delta > 1.0) return "up" as const;
    if (delta < -1.0) return "down" as const;
    return "stable" as const;
  }, [liveData]);

  const voltageTrend = "stable" as const;
  const pfTrend = "stable" as const;

  return (
    <main className="min-h-screen">
      <HighDemandAlertBanner
        visible={!dismissedHighDemand && currentKw >= highKw}
        demandKw={currentKw}
        onDismiss={() => setDismissedHighDemand(true)}
      />
      <div className="flex min-h-screen w-full">
        <SidebarNav
          buildingId={telemetry?.buildingId ?? "enersave-bld-01"}
          section={section}
          onSectionChange={setSection}
          status={buildingStatus}
        />

        <div className="flex-1">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={bmsState?.ecoMode ? "success" : "info"}>{operationalStatus}</Badge>
                  <Badge variant="default">{telemetry?.buildingId ?? "enersave-bld-01"}</Badge>
                </div>
                <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">{pageTitle}</h1>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">{dashboardDescription}</p>
              </div>
              <div className="flex min-w-56 flex-col gap-3">
                <Button variant="outline" className="w-full justify-center" onClick={() => setHowItWorksOpen(true)}>
                  How this works
                </Button>
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Poll Rate</p>
                    <p className="font-semibold">3 sec</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Window</p>
                    <p className="font-semibold">10 samples</p>
                  </div>
                </div>
              </div>
            </header>

            <BuildingStatusBanner status={buildingStatus} lastTimestamp={telemetry?.timestamp ?? null} />

            {section === "telemetry" ? (
              <div className="space-y-5">
            <section className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Current Demand"
                value={telemetry ? telemetry.currentKw.toFixed(2) : "--"}
                unit="kW"
                icon={Zap}
                subtitle="Total electricity being used right now"
                trend={demandTrend}
                sparkline={liveData.map((point) => point.kw)}
                pulse={highlight}
                status={buildingStatus}
              />
              <MetricCard
                title="Line Voltage"
                value={telemetry ? String(telemetry.voltage) : "--"}
                unit="V"
                icon={Activity}
                subtitle="Electrical voltage — normal range is 220–240 V"
                trend={voltageTrend}
                sparkline={liveData.map(() => telemetry?.voltage ?? 0)}
                pulse={highlight}
                status={buildingStatus}
              />
              <MetricCard
                title="Power Factor"
                value={telemetry ? telemetry.activePowerFactor.toFixed(2) : "--"}
                unit="pf"
                icon={Gauge}
                subtitle="How efficiently power is being converted (1.0 is perfect)"
                trend={pfTrend}
                sparkline={liveData.map(() => telemetry?.activePowerFactor ?? 0)}
                pulse={highlight}
                status={buildingStatus}
              />
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Live Stream Plot</CardTitle>
                  <CardDescription>Rolling demand stream from the live building data feed.</CardDescription>
                </CardHeader>
                <CardContent>
                  <LiveChart data={liveData} targetKw={targetKw} highKw={highKw} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Target Tracking</CardTitle>
                  <CardDescription>Current demand compared with a 30 kW efficiency target.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ForecastChart data={liveData} />
                  <div className="mt-4 rounded-lg border border-border bg-muted p-4">
                    <p
                      className={cn(
                        "text-base font-semibold",
                        telemetry && telemetry.currentKw > targetKw ? "text-red-200" : "text-emerald-200"
                      )}
                    >
                      {telemetry
                        ? telemetry.currentKw > targetKw
                          ? `You are currently using ${(telemetry.currentKw - targetKw).toFixed(2)} kW above your 30 kW target`
                          : `You are currently using ${(targetKw - telemetry.currentKw).toFixed(2)} kW below your 30 kW target`
                        : "Waiting for the latest reading..."}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Keep demand below 30 kW when possible by turning off non-essential room equipment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
              </div>
            ) : null}

            {section === "controls" ? (
              <ControlPanel
                state={bmsState}
                busy={controlBusy}
                onToggle={(value) => void toggleEcoMode(value)}
                onDeviceToggle={(roomId, deviceId, enabled) => toggleRoomDevice(roomId, deviceId, enabled)}
              />
            ) : null}

            {section === "rooms" ? (
              <RoomManagement
                state={bmsState}
                busy={controlBusy}
                onAddRoom={(room) => addRoom(room)}
                onUpdateRoom={(roomId, room) => updateRoom(roomId, room)}
              />
            ) : null}

            {section === "analytics" ? <ClusterPlot /> : null}

            {section === "alerts" ? <AlertsPage state={bmsState} currentKw={currentKw} /> : null}

            {section === "reports" ? <ReportsPage state={bmsState} currentKw={currentKw} /> : null}

            {section === "settings" ? <SettingsPage state={bmsState} /> : null}
          </div>
        </div>
      </div>

      <InfoDialog
        open={howItWorksOpen}
        title="How this system works"
        description="A simple summary of what Enersave does today and why the dashboard is set up this way."
        onClose={() => setHowItWorksOpen(false)}
      >
        {howItWorksSections.map((section) => (
          <div key={section.title} className="rounded-lg border border-border bg-muted p-4">
            <p className="font-semibold">{section.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{section.body}</p>
          </div>
        ))}
      </InfoDialog>
    </main>
  );
}
