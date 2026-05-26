import { NextResponse } from "next/server";

import { addRoomToState, recordSystemAlert, setRoomDeviceStateInState, updateRoomInState } from "@/lib/state-model";
import { readBmsState, updateBmsState } from "@/lib/state-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readBmsState();
  return NextResponse.json({ success: true, state });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ecoMode, roomId, deviceId, enabled, room } = body;

    if (typeof ecoMode === "boolean") {
      const state = await updateBmsState((currentState) => {
        const nextState = recordSystemAlert(
          {
            ...currentState,
            ecoMode,
            baseKw: ecoMode ? 22.0 : 45.0
          },
          {
            id: String(Date.now()),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: ecoMode ? "success" : "warning",
            message: `Remote Event: Eco-Mode switched ${ecoMode ? "ON (Restricting load)" : "OFF (Full Operation)"}.`
          }
        );

        return nextState;
      });

      return NextResponse.json({ success: true, state });
    }

    if (typeof roomId === "string" && typeof deviceId === "string" && typeof enabled === "boolean") {
      let missingDevice = false;
      const state = await updateBmsState((currentState) => {
        const result = setRoomDeviceStateInState(currentState, roomId, deviceId, enabled);
        if (!result) {
          missingDevice = true;
          return currentState;
        }

        return recordSystemAlert(result.state, {
          id: String(Date.now()),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: enabled ? "info" : "success",
          message: `Room Control: ${result.device.label} in ${result.room.name} switched ${enabled ? "ON" : "OFF"}.`
        });
      });

      if (missingDevice) {
        return NextResponse.json({ success: false, error: "Unknown room or device" }, { status: 404 });
      }

      return NextResponse.json({ success: true, state });
    }

    if (action === "addRoom" && room && typeof room.name === "string" && typeof room.floor === "string") {
      let missingFields = false;
      const state = await updateBmsState((currentState) => {
        const result = addRoomToState(currentState, {
          name: room.name,
          floor: room.floor,
          occupancy: room.occupancy ?? "Low"
        });

        if (!result) {
          missingFields = true;
          return currentState;
        }

        return recordSystemAlert(result.state, {
          id: String(Date.now()),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "info",
          message: `Room Setup: ${result.room.name} added to ${result.room.floor}.`
        });
      });

      if (missingFields) {
        return NextResponse.json({ success: false, error: "Room name and floor are required" }, { status: 400 });
      }

      return NextResponse.json({ success: true, state });
    }

    if (action === "updateRoom" && typeof roomId === "string" && room) {
      let missingRoom = false;
      const state = await updateBmsState((currentState) => {
        const result = updateRoomInState(currentState, roomId, room);
        if (!result) {
          missingRoom = true;
          return currentState;
        }

        return recordSystemAlert(result.state, {
          id: String(Date.now()),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "info",
          message: `Room Setup: ${result.room.name} details updated.`
        });
      });

      if (missingRoom) {
        return NextResponse.json({ success: false, error: "Unknown room" }, { status: 404 });
      }

      return NextResponse.json({ success: true, state });
    }

    return NextResponse.json({ success: false, error: "Invalid Parameter Types" }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: "Malformed Payload" }, { status: 500 });
  }
}
