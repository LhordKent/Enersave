"use client";

import { Activity, Fan, LampCeiling, Leaf, PlugZap, Snowflake, Zap } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Switch } from "@/components/ui/switch";
import type { BmsState, RoomDevice, RoomState } from "@/lib/simState";
import { cn } from "@/lib/utils";

const alertClasses = {
  success: "border-emerald-500/25 bg-emerald-500/15 text-emerald-100",
  warning: "border-amber-500/25 bg-amber-500/15 text-amber-100",
  info: "border-blue-500/25 bg-blue-500/15 text-blue-100"
};

const deviceIcons = {
  lights: LampCeiling,
  fans: Fan,
  ac: Snowflake,
  outlets: PlugZap
};

function roomLoad(room: RoomState) {
  return room.devices.reduce((total, device) => total + (device.enabled ? device.loadKw : 0), 0);
}

function roomMaxLoad(room: RoomState) {
  return room.devices.reduce((total, device) => total + device.loadKw, 0);
}

function loadBarColor(percent: number) {
  if (percent >= 0.8) return "bg-red-500";
  if (percent >= 0.55) return "bg-amber-500";
  return "bg-emerald-500";
}

function RoomDeviceRow({
  device,
  disabled,
  onToggle
}: {
  device: RoomDevice;
  disabled: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  const Icon = deviceIcons[device.type];

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
            device.enabled ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{device.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Load: {device.loadKw.toFixed(1)} kW
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {device.enabled ? `Currently ON — using ${device.loadKw.toFixed(1)} kW` : "Currently OFF — not using power"}
          </p>
        </div>
      </div>
      <Switch checked={device.enabled} disabled={disabled} onCheckedChange={onToggle} aria-label={device.label} />
    </div>
  );
}

export function ControlPanel({
  state,
  busy,
  onToggle,
  onDeviceToggle
}: {
  state: BmsState | null;
  busy: boolean;
  onToggle: (ecoMode: boolean) => void;
  onDeviceToggle: (roomId: string, deviceId: string, enabled: boolean) => Promise<void>;
}) {
  const [selectedRoomId, setSelectedRoomId] = useState("lobby");
  const [ecoConfirmOpen, setEcoConfirmOpen] = useState(false);
  const [ecoNextValue, setEcoNextValue] = useState(false);
  const [roomOffConfirmOpen, setRoomOffConfirmOpen] = useState(false);

  const selectedRoom = useMemo(
    () => state?.rooms.find((room) => room.id === selectedRoomId) ?? state?.rooms[0] ?? null,
    [selectedRoomId, state?.rooms]
  );
  const activeDevices = selectedRoom?.devices.filter((device) => device.enabled).length ?? 0;
  const totalRoomLoad = state?.rooms.reduce((total, room) => total + roomLoad(room), 0) ?? 0;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Remote Operations & Room Controls</CardTitle>
          <CardDescription>Click a room, then turn lights, fans, AC, and outlets on or off individually.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-emerald-500/25 bg-emerald-500/15 text-emerald-200">
                <Leaf className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">Eco-Mode Monitoring</p>
                <p className="text-sm text-muted-foreground">
                  Reduces baseline energy use and helps keep demand closer to the efficiency target.
                </p>
              </div>
            </div>
            <Switch
              checked={state?.ecoMode ?? false}
              disabled={busy || !state}
              onCheckedChange={(next) => {
                setEcoNextValue(next);
                setEcoConfirmOpen(true);
              }}
              aria-label="Toggle Eco-Mode"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                Room Device Load
              </div>
              <p className="text-2xl font-semibold">{totalRoomLoad.toFixed(1)} kW</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                Building
              </div>
              <p className="text-sm font-semibold">{state?.buildingId ?? "Waiting for BMS"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Building Rooms</CardTitle>
            <CardDescription>Select a space to manage its connected equipment.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {(state?.rooms ?? []).map((room) => {
                const active = room.id === selectedRoom?.id;
                const activeCount = room.devices.filter((device) => device.enabled).length;
                const maxLoad = Math.max(1e-6, roomMaxLoad(room));
                const percent = roomLoad(room) / maxLoad;

                return (
                  <button
                    key={room.id}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-colors hover:bg-muted",
                      active ? "border-primary bg-cyan-50" : "border-border bg-card"
                    )}
                    onClick={() => setSelectedRoomId(room.id)}
                    type="button"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{room.name}</p>
                        <p className="text-xs text-muted-foreground">{room.floor}</p>
                        <div className="mt-2 h-2 w-full rounded-full bg-border">
                          <div
                            className={cn("h-2 rounded-full", loadBarColor(percent))}
                            style={{ width: `${Math.min(1, Math.max(0, percent)) * 100}%` }}
                          />
                        </div>
                      </div>
                      <Badge
                        variant={room.occupancy === "Empty" ? "default" : room.occupancy === "High" ? "warning" : "info"}
                        className="px-3 py-1.5 text-sm"
                      >
                        {room.occupancy}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{activeCount} devices on</span>
                      <span className="font-semibold">{roomLoad(room).toFixed(1)} kW</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{selectedRoom?.name ?? "Room Equipment"}</CardTitle>
              <CardDescription>
                {selectedRoom
                  ? `${activeDevices} of ${selectedRoom.devices.length} systems running in this room.`
                  : "Waiting for room status."}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              className="border-amber-500/25 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15"
              disabled={!selectedRoom || busy || activeDevices === 0}
              onClick={() => setRoomOffConfirmOpen(true)}
            >
              Turn Off All Devices
            </Button>
          </CardHeader>
          <CardContent>
            {selectedRoom ? (
              <div className="space-y-3">
                {selectedRoom.devices.map((device) => (
                  <RoomDeviceRow
                    key={device.id}
                    device={device}
                    disabled={busy}
                    onToggle={(enabled) => void onDeviceToggle(selectedRoom.id, device.id, enabled)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground">
                No room data is available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Event Log</CardTitle>
          <CardDescription>Operational state changes and system notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(state?.systemAlerts ?? []).map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border p-3 text-sm ${alertClasses[alert.type]}`}
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <Badge variant={alert.type}>{alert.type}</Badge>
                  <span className="text-xs">{alert.time}</span>
                </div>
                <p>{alert.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={ecoConfirmOpen}
        title={ecoNextValue ? "Turn ON Eco-Mode?" : "Turn OFF Eco-Mode?"}
        description={
          ecoNextValue
            ? "Eco-Mode reduces baseline electricity use. You may notice lower demand readings. Continue?"
            : "Turning Eco-Mode off allows full operation and may increase electricity demand. Continue?"
        }
        confirmText={ecoNextValue ? "Yes, turn ON Eco-Mode" : "Yes, turn OFF Eco-Mode"}
        onCancel={() => setEcoConfirmOpen(false)}
        onConfirm={async () => {
          setEcoConfirmOpen(false);
          onToggle(ecoNextValue);
        }}
      />

      <ConfirmDialog
        open={roomOffConfirmOpen}
        title="Turn off all devices in this room?"
        description={
          selectedRoom
            ? `This will switch OFF lights, fans, AC, and outlets in ${selectedRoom.name}. Use this when the room is not needed.`
            : "This will switch OFF all devices in the selected room."
        }
        confirmText="Yes, turn everything OFF"
        tone="warning"
        onCancel={() => setRoomOffConfirmOpen(false)}
        onConfirm={async () => {
          setRoomOffConfirmOpen(false);
          if (!selectedRoom) return;
          const enabledDevices = selectedRoom.devices.filter((device) => device.enabled);
          for (const device of enabledDevices) {
            await onDeviceToggle(selectedRoom.id, device.id, false);
          }
        }}
      />
    </div>
  );
}
