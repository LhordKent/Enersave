export interface BmsState {
  buildingId: string;
  ecoMode: boolean;
  baseKw: number;
  voltage: number;
  rooms: RoomState[];
  systemAlerts: Array<{
    id: string;
    time: string;
    type: "success" | "warning" | "info";
    message: string;
  }>;
}

export interface RoomDevice {
  id: string;
  label: string;
  type: "lights" | "fans" | "ac" | "outlets";
  loadKw: number;
  enabled: boolean;
}

export interface RoomState {
  id: string;
  name: string;
  floor: string;
  occupancy: "Empty" | "Low" | "Moderate" | "High";
  devices: RoomDevice[];
}

export interface RoomInput {
  name: string;
  floor: string;
  occupancy: RoomState["occupancy"];
}

export function createInitialBmsState(): BmsState {
  return {
    buildingId: "enersave-bld-01",
    ecoMode: false,
    baseKw: 45.0,
    voltage: 230,
    rooms: [
      {
        id: "lobby",
        name: "Main Lobby",
        floor: "Ground Floor",
        occupancy: "High",
        devices: [
          { id: "lights", label: "Lobby Lights", type: "lights", loadKw: 2.4, enabled: true },
          { id: "fans", label: "Ceiling Fans", type: "fans", loadKw: 1.2, enabled: true },
          { id: "ac", label: "Air Conditioning", type: "ac", loadKw: 6.8, enabled: true },
          { id: "outlets", label: "Service Outlets", type: "outlets", loadKw: 1.1, enabled: true }
        ]
      },
      {
        id: "office",
        name: "Admin Office",
        floor: "Second Floor",
        occupancy: "Moderate",
        devices: [
          { id: "lights", label: "Task Lights", type: "lights", loadKw: 1.8, enabled: true },
          { id: "fans", label: "Desk Fans", type: "fans", loadKw: 0.8, enabled: false },
          { id: "ac", label: "Office AC", type: "ac", loadKw: 5.2, enabled: true },
          { id: "outlets", label: "Workstations", type: "outlets", loadKw: 3.4, enabled: true }
        ]
      },
      {
        id: "conference",
        name: "Conference Room",
        floor: "Second Floor",
        occupancy: "Low",
        devices: [
          { id: "lights", label: "Panel Lights", type: "lights", loadKw: 1.5, enabled: false },
          { id: "fans", label: "Ventilation Fans", type: "fans", loadKw: 0.7, enabled: false },
          { id: "ac", label: "Room AC", type: "ac", loadKw: 4.9, enabled: false },
          { id: "outlets", label: "AV Equipment", type: "outlets", loadKw: 2.2, enabled: false }
        ]
      },
      {
        id: "lab",
        name: "Computer Lab",
        floor: "Third Floor",
        occupancy: "Moderate",
        devices: [
          { id: "lights", label: "Lab Lights", type: "lights", loadKw: 2.1, enabled: true },
          { id: "fans", label: "Exhaust Fans", type: "fans", loadKw: 1.4, enabled: true },
          { id: "ac", label: "Precision AC", type: "ac", loadKw: 7.3, enabled: true },
          { id: "outlets", label: "Computer Stations", type: "outlets", loadKw: 8.6, enabled: true }
        ]
      },
      {
        id: "storage",
        name: "Storage Area",
        floor: "Ground Floor",
        occupancy: "Empty",
        devices: [
          { id: "lights", label: "Storage Lights", type: "lights", loadKw: 0.9, enabled: false },
          { id: "fans", label: "Air Circulation", type: "fans", loadKw: 0.5, enabled: true },
          { id: "ac", label: "Cooling Unit", type: "ac", loadKw: 3.6, enabled: false },
          { id: "outlets", label: "Utility Outlets", type: "outlets", loadKw: 0.6, enabled: false }
        ]
      },
      {
        id: "cafeteria",
        name: "Cafeteria",
        floor: "Ground Floor",
        occupancy: "High",
        devices: [
          { id: "lights", label: "Dining Lights", type: "lights", loadKw: 2.7, enabled: true },
          { id: "fans", label: "Dining Fans", type: "fans", loadKw: 1.6, enabled: true },
          { id: "ac", label: "Dining AC", type: "ac", loadKw: 6.1, enabled: true },
          { id: "outlets", label: "Kitchen Support", type: "outlets", loadKw: 5.5, enabled: true }
        ]
      }
    ],
    systemAlerts: [
      {
        id: "init",
        time: "08:00 AM",
        type: "info",
        message: "Enersave baseline monitoring active."
      }
    ]
  };
}

function cloneState(state: BmsState): BmsState {
  return structuredClone(state);
}

export function getActiveRoomLoadKw(rooms: RoomState[]) {
  return rooms.reduce(
    (roomTotal, room) =>
      roomTotal + room.devices.reduce((deviceTotal, device) => deviceTotal + (device.enabled ? device.loadKw : 0), 0),
    0
  );
}

export function recordSystemAlert(
  state: BmsState,
  alert: BmsState["systemAlerts"][number]
) {
  const nextState = cloneState(state);
  nextState.systemAlerts.unshift(alert);
  return nextState;
}

export function setRoomDeviceStateInState(state: BmsState, roomId: string, deviceId: string, enabled: boolean) {
  const nextState = cloneState(state);
  const room = nextState.rooms.find((candidate) => candidate.id === roomId);
  const device = room?.devices.find((candidate) => candidate.id === deviceId);

  if (!room || !device) {
    return null;
  }

  device.enabled = enabled;
  return { state: nextState, room, device };
}

function createRoomId(rooms: RoomState[], name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const base = slug || "room";
  let id = base;
  let suffix = 2;

  while (rooms.some((room) => room.id === id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  return id;
}

export function addRoomToState(state: BmsState, input: RoomInput) {
  const name = input.name.trim();
  const floor = input.floor.trim();

  if (!name || !floor) {
    return null;
  }

  const nextState = cloneState(state);
  const room: RoomState = {
    id: createRoomId(nextState.rooms, name),
    name,
    floor,
    occupancy: input.occupancy,
    devices: [
      { id: "lights", label: `${name} Lights`, type: "lights", loadKw: 1.2, enabled: false },
      { id: "fans", label: `${name} Fans`, type: "fans", loadKw: 0.8, enabled: false },
      { id: "ac", label: `${name} AC`, type: "ac", loadKw: 4.5, enabled: false },
      { id: "outlets", label: `${name} Outlets`, type: "outlets", loadKw: 1.5, enabled: false }
    ]
  };

  nextState.rooms.push(room);
  return { state: nextState, room };
}

export function updateRoomInState(state: BmsState, roomId: string, input: Partial<RoomInput>) {
  const nextState = cloneState(state);
  const room = nextState.rooms.find((candidate) => candidate.id === roomId);

  if (!room) {
    return null;
  }

  if (typeof input.name === "string" && input.name.trim()) {
    room.name = input.name.trim();
  }

  if (typeof input.floor === "string" && input.floor.trim()) {
    room.floor = input.floor.trim();
  }

  if (input.occupancy && ["Empty", "Low", "Moderate", "High"].includes(input.occupancy)) {
    room.occupancy = input.occupancy;
  }

  return { state: nextState, room };
}
