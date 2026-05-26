"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  BellRing,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  RadioTower,
  Settings,
  Settings2
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SectionKey = "telemetry" | "rooms" | "controls" | "analytics" | "alerts" | "reports" | "settings";

function statusDotClass(status: "efficient" | "normal" | "high") {
  if (status === "high") return "bg-red-500";
  if (status === "efficient") return "bg-emerald-500";
  return "bg-blue-500";
}

export function SidebarNav({
  buildingId,
  section,
  onSectionChange,
  status
}: {
  buildingId: string;
  section: SectionKey;
  onSectionChange: (next: SectionKey) => void;
  status: "efficient" | "normal" | "high";
}) {
  const [collapsed, setCollapsed] = useState(false);

  const items = useMemo(
    () => [
      { key: "telemetry" as const, icon: RadioTower, label: "Live Telemetry" },
      { key: "rooms" as const, icon: DoorOpen, label: "Rooms" },
      { key: "controls" as const, icon: Settings2, label: "Room Controls" },
      { key: "analytics" as const, icon: BrainCircuit, label: "AI Insights" },
      { key: "alerts" as const, icon: BellRing, label: "Alerts" },
      { key: "reports" as const, icon: ClipboardList, label: "Reports" },
      { key: "settings" as const, icon: Settings, label: "Settings" }
    ],
    []
  );

  return (
    <aside
      className={cn(
        "sticky top-0 h-dvh border-r border-border bg-card",
        collapsed ? "w-[72px]" : "w-[268px]"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div className={cn("min-w-0", collapsed && "hidden")}>
            <div className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", statusDotClass(status))} />
              <p className="truncate text-sm font-semibold">Enersave</p>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">{buildingId}</p>
          </div>
          <Button
            variant="ghost"
            className="h-9 w-9 px-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 p-3">
          <div className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = item.key === section;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSectionChange(item.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-3 text-left text-sm font-semibold transition-colors",
                    active
                      ? "border-border bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className={cn("truncate", collapsed && "hidden")}>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className={cn("mt-6 rounded-lg border border-border bg-muted p-3", collapsed && "hidden")}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Quick Tips
            </div>
            <div className="mt-2 space-y-2 text-xs text-muted-foreground">
              <p>
                If demand is <Badge variant="destructive">High</Badge>, start by turning off non-essential AC and outlets in
                unused rooms.
              </p>
              <p>
                If demand is <Badge variant="success">Efficient</Badge>, keep Eco-Mode on and monitor peaks at midday.
              </p>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
