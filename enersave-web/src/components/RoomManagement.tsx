"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DoorOpen, Plus, Save, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BmsState, RoomState } from "@/lib/simState";
import { cn } from "@/lib/utils";

type Occupancy = RoomState["occupancy"];

function roomLoad(room: RoomState) {
  return room.devices.reduce((total, device) => total + (device.enabled ? device.loadKw : 0), 0);
}

function maxRoomLoad(room: RoomState) {
  return room.devices.reduce((total, device) => total + device.loadKw, 0);
}

function loadColor(percent: number) {
  if (percent >= 0.8) return "bg-red-500";
  if (percent >= 0.55) return "bg-amber-500";
  return "bg-emerald-500";
}

function Field({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <input
        className="h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function OccupancySelect({ value, onChange }: { value: Occupancy; onChange: (value: Occupancy) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-muted-foreground">Occupancy</span>
      <select
        className="h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary"
        value={value}
        onChange={(event) => onChange(event.target.value as Occupancy)}
      >
        <option>Empty</option>
        <option>Low</option>
        <option>Moderate</option>
        <option>High</option>
      </select>
    </label>
  );
}

export function RoomManagement({
  state,
  busy,
  onAddRoom,
  onUpdateRoom
}: {
  state: BmsState | null;
  busy: boolean;
  onAddRoom: (room: { name: string; floor: string; occupancy: Occupancy }) => Promise<void>;
  onUpdateRoom: (roomId: string, room: { name: string; floor: string; occupancy: Occupancy }) => Promise<void>;
}) {
  const rooms = useMemo(() => state?.rooms ?? [], [state?.rooms]);
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id ?? "");
  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? null,
    [rooms, selectedRoomId]
  );
  const [newName, setNewName] = useState("");
  const [newFloor, setNewFloor] = useState("");
  const [newOccupancy, setNewOccupancy] = useState<Occupancy>("Low");
  const [editName, setEditName] = useState("");
  const [editFloor, setEditFloor] = useState("");
  const [editOccupancy, setEditOccupancy] = useState<Occupancy>("Low");

  useEffect(() => {
    if (!selectedRoom) return;
    setEditName(selectedRoom.name);
    setEditFloor(selectedRoom.floor);
    setEditOccupancy(selectedRoom.occupancy);
  }, [selectedRoom]);

  function selectRoom(room: RoomState) {
    setSelectedRoomId(room.id);
    setEditName(room.name);
    setEditFloor(room.floor);
    setEditOccupancy(room.occupancy);
  }

  async function submitNewRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onAddRoom({ name: newName, floor: newFloor, occupancy: newOccupancy });
    setNewName("");
    setNewFloor("");
    setNewOccupancy("Low");
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRoom) return;
    await onUpdateRoom(selectedRoom.id, {
      name: editName || selectedRoom.name,
      floor: editFloor || selectedRoom.floor,
      occupancy: editOccupancy
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Room Directory</CardTitle>
            <CardDescription>Add spaces, review active load, and keep building inventory organized.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {rooms.map((room) => {
                const active = selectedRoom?.id === room.id;
                const maxLoad = Math.max(1e-6, maxRoomLoad(room));
                const percent = roomLoad(room) / maxLoad;

                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => selectRoom(room)}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-colors hover:bg-muted",
                      active ? "border-primary bg-muted" : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{room.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{room.floor}</p>
                      </div>
                      <Badge variant={room.occupancy === "High" ? "destructive" : room.occupancy === "Empty" ? "default" : "info"}>
                        {room.occupancy}
                      </Badge>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-border">
                      <div className={cn("h-2 rounded-full", loadColor(percent))} style={{ width: `${percent * 100}%` }} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{room.devices.length} devices</span>
                      <span className="font-semibold">{roomLoad(room).toFixed(1)} kW active</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Room</CardTitle>
            <CardDescription>Create a managed room with default lights, fans, AC, and outlets.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(event) => void submitNewRoom(event)}>
              <Field label="Room name" value={newName} onChange={setNewName} placeholder="e.g. Clinic Room" />
              <Field label="Floor / area" value={newFloor} onChange={setNewFloor} placeholder="e.g. Third Floor" />
              <OccupancySelect value={newOccupancy} onChange={setNewOccupancy} />
              <Button className="w-full" disabled={busy || !newName.trim() || !newFloor.trim()} type="submit">
                <Plus className="h-4 w-4" />
                Add Room
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Profile</CardTitle>
          <CardDescription>Edit the selected room and review its connected equipment.</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedRoom ? (
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <form className="space-y-4" onSubmit={(event) => void submitEdit(event)}>
                <Field
                  label="Room name"
                  value={editName}
                  onChange={setEditName}
                  placeholder={selectedRoom.name}
                />
                <Field
                  label="Floor / area"
                  value={editFloor}
                  onChange={setEditFloor}
                  placeholder={selectedRoom.floor}
                />
                <OccupancySelect value={editOccupancy} onChange={setEditOccupancy} />
                <Button type="submit" disabled={busy}>
                  <Save className="h-4 w-4" />
                  Save Room Details
                </Button>
              </form>

              <div className="grid gap-3 md:grid-cols-2">
                {selectedRoom.devices.map((device) => (
                  <div key={device.id} className="rounded-lg border border-border bg-muted p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <DoorOpen className="h-4 w-4 text-muted-foreground" />
                      <p className="font-semibold">{device.label}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Device load</span>
                      <span>{device.loadKw.toFixed(1)} kW</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current state</span>
                      <Badge variant={device.enabled ? "success" : "default"}>
                        {device.enabled ? "On" : "Off"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground">
              Add a room to start building your room directory.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <Zap className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Operational note</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New rooms start with all devices off so administrators can safely enable only what is needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
