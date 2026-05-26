"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Clock, Flame, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BuildingStatus = "efficient" | "normal" | "high";

export function getBuildingStatus(currentKw: number, targetKw: number, highKw: number): BuildingStatus {
  if (currentKw >= highKw) return "high";
  if (currentKw <= targetKw) return "efficient";
  return "normal";
}

function statusMeta(status: BuildingStatus) {
  if (status === "high") {
    return {
      pill: "HIGH DEMAND — TAKE ACTION",
      description: "Electricity use is unusually high. Turn off non-essential equipment to reduce load.",
      pillClass: "bg-red-500/15 text-red-200 border border-red-500/25",
      Icon: Flame
    };
  }
  if (status === "efficient") {
    return {
      pill: "EFFICIENT — BELOW TARGET",
      description: "Electricity use is below the efficiency target. Keep monitoring and maintain Eco-Mode if possible.",
      pillClass: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/25",
      Icon: CheckCircle2
    };
  }
  return {
    pill: "NORMAL OPERATIONS",
    description: "Electricity use is within the normal range. Watch for devices left on in low-occupancy rooms.",
    pillClass: "bg-blue-500/15 text-blue-200 border border-blue-500/25",
    Icon: Info
  };
}

export function BuildingStatusBanner({
  status,
  lastTimestamp
}: {
  status: BuildingStatus;
  lastTimestamp: string | null;
}) {
  const meta = useMemo(() => statusMeta(status), [status]);
  const time = lastTimestamp ? new Date(lastTimestamp) : null;
  const timestampText = time
    ? new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(time)
    : "--:--:--";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-md bg-muted">
            <meta.Icon className="h-5 w-5" />
          </span>
          <div>
            <div className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold", meta.pillClass)}>
              {meta.pill}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{meta.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last reading: <span className="font-semibold text-foreground">{timestampText}</span>
        </div>
      </div>
    </div>
  );
}

export function HighDemandAlertBanner({
  visible,
  demandKw,
  onDismiss
}: {
  visible: boolean;
  demandKw: number;
  onDismiss: () => void;
}) {
  if (!visible) return null;

  return (
    <div className="border-b border-red-500/30 bg-red-500/15 px-4 py-3">
      <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
          <div>
            <p className="text-sm font-semibold text-red-100">
              HIGH DEMAND ALERT — Building is drawing {demandKw.toFixed(2)} kW.
            </p>
            <p className="text-sm text-red-200/80">Consider turning off non-essential equipment.</p>
          </div>
        </div>
        <Button variant="outline" className="h-9 border-red-500/30 bg-transparent text-red-100 hover:bg-red-500/15" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}

