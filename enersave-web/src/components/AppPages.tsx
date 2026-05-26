"use client";

import { AlertTriangle, CalendarClock, FileText, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { BmsState, RoomState } from "@/lib/simState";

function roomLoad(room: RoomState) {
  return room.devices.reduce((total, device) => total + (device.enabled ? device.loadKw : 0), 0);
}

export function AlertsPage({ state, currentKw }: { state: BmsState | null; currentKw: number }) {
  const alerts = state?.systemAlerts ?? [];
  const highDemand = currentKw >= 85;

  return (
    <div className="space-y-5">
      <Card className={highDemand ? "border-red-500/30" : undefined}>
        <CardHeader>
          <CardTitle>Alert Center</CardTitle>
          <CardDescription>Plain-language events and response steps for building administrators.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className={highDemand ? "h-5 w-5 text-red-300" : "h-5 w-5 text-amber-200"} />
              <p className="font-semibold">{highDemand ? "Immediate attention needed" : "No critical alert right now"}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {highDemand
                ? `The building is drawing ${currentKw.toFixed(2)} kW. Start by turning off AC and outlets in empty or low-occupancy rooms.`
                : "Demand is below the high-alert threshold. Keep watching rooms with heavy equipment."}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted p-4">
            <p className="font-semibold">Response checklist</p>
            <div className="mt-3 space-y-3 text-sm text-muted-foreground">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="h-4 w-4 accent-emerald-500" />
                Check empty rooms with AC or outlets still on
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="h-4 w-4 accent-emerald-500" />
                Enable Eco-Mode if comfort requirements allow it
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="h-4 w-4 accent-emerald-500" />
                Re-check demand after three minutes
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event History</CardTitle>
          <CardDescription>Recent actions taken by the building control system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted p-4">
                <div>
                  <Badge variant={alert.type === "warning" ? "warning" : alert.type === "success" ? "success" : "info"}>
                    {alert.type}
                  </Badge>
                  <p className="mt-2 text-sm">{alert.message}</p>
                </div>
                <span className="text-sm text-muted-foreground">{alert.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ReportsPage({ state, currentKw }: { state: BmsState | null; currentKw: number }) {
  const rooms = state?.rooms ?? [];
  const totalRoomLoad = rooms.reduce((total, room) => total + roomLoad(room), 0);
  const topRoom = [...rooms].sort((a, b) => roomLoad(b) - roomLoad(a))[0];
  const activeDevices = rooms.reduce((total, room) => total + room.devices.filter((device) => device.enabled).length, 0);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Current building demand</p>
            <p className="mt-2 text-4xl font-semibold">{currentKw.toFixed(2)} kW</p>
            <p className="mt-2 text-sm text-muted-foreground">Latest reading from live telemetry.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Room equipment load</p>
            <p className="mt-2 text-4xl font-semibold">{totalRoomLoad.toFixed(1)} kW</p>
            <p className="mt-2 text-sm text-muted-foreground">Power from devices currently switched on.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active devices</p>
            <p className="mt-2 text-4xl font-semibold">{activeDevices}</p>
            <p className="mt-2 text-sm text-muted-foreground">Across all rooms in the building.</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Operations Report</CardTitle>
          <CardDescription>Fast summary a building administrator can read before making rounds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <p className="font-semibold">Today&apos;s plain-English summary</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {topRoom
                ? `${topRoom.name} is the highest active-load room right now at ${roomLoad(topRoom).toFixed(1)} kW. Check this room first if demand rises.`
                : "No room information is available yet."}
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Room</th>
                  <th className="px-4 py-3 font-semibold">Floor</th>
                  <th className="px-4 py-3 font-semibold">Devices On</th>
                  <th className="px-4 py-3 font-semibold">Active Load</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">{room.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{room.floor}</td>
                    <td className="px-4 py-3">{room.devices.filter((device) => device.enabled).length}</td>
                    <td className="px-4 py-3">{roomLoad(room).toFixed(1)} kW</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingsPage({ state }: { state: BmsState | null }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Building Settings</CardTitle>
          <CardDescription>Basic configuration that makes the app feel tied to a real site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-muted-foreground">Building name</span>
            <input
              className="h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary"
              defaultValue="Enersave Building 01"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-muted-foreground">Building ID</span>
            <input
              className="h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary"
              defaultValue={state?.buildingId ?? "enersave-bld-01"}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-muted-foreground">Efficiency target</span>
            <input
              className="h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary"
              defaultValue="30 kW"
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Rules</CardTitle>
          <CardDescription>Operational thresholds shown to administrators.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted p-4">
            <div>
              <p className="font-semibold">High demand alert</p>
              <p className="text-sm text-muted-foreground">Show red banner above 85 kW.</p>
            </div>
            <Switch checked aria-label="High demand alert" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted p-4">
            <div>
              <p className="font-semibold">Room event log</p>
              <p className="text-sm text-muted-foreground">Record room and Eco-Mode changes.</p>
            </div>
            <Switch checked aria-label="Room event log" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted p-4">
            <div>
              <p className="font-semibold">Daily summary</p>
              <p className="text-sm text-muted-foreground">Prepare a readable report at end of day.</p>
            </div>
            <Switch aria-label="Daily summary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Team</CardTitle>
          <CardDescription>Simple user roles for a complete operations setup.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["Building Administrator", "Can control rooms and Eco-Mode"],
            ["Maintenance Staff", "Can view alerts and reports"],
            ["Energy Auditor", "Can view analytics only"]
          ].map(([role, detail]) => (
            <div key={role} className="flex items-start gap-3 rounded-lg border border-border bg-muted p-4">
              <Users className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">{role}</p>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Schedule</CardTitle>
          <CardDescription>Tasks that keep the building running smoothly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["Monday 8:00 AM", "Inspect high-load rooms"],
            ["Wednesday 2:00 PM", "Review AI high-demand readings"],
            ["Friday 5:00 PM", "Export weekly energy report"]
          ].map(([time, task]) => (
            <div key={task} className="flex items-start gap-3 rounded-lg border border-border bg-muted p-4">
              <CalendarClock className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">{time}</p>
                <p className="text-sm text-muted-foreground">{task}</p>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
            <p className="text-sm text-emerald-100">These settings shape how the dashboard behaves today.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
