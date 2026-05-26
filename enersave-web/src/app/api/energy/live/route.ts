import { NextResponse } from "next/server";

import { getActiveRoomLoadKw } from "@/lib/state-model";
import { readBmsState } from "@/lib/state-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readBmsState();
  const buildingBaseline = state.ecoMode ? 10.0 : 18.0;
  const activeRoomLoadKw = getActiveRoomLoadKw(state.rooms);
  const baseline = buildingBaseline + activeRoomLoadKw;
  const noise = (Math.random() - 0.5) * 4.0;
  const currentKw = Number((baseline + noise).toFixed(2));

  return NextResponse.json({
    buildingId: state.buildingId,
    currentKw,
    voltage: state.voltage,
    activePowerFactor: Number((0.92 + (Math.random() - 0.5) * 0.04).toFixed(2)),
    ecoMode: state.ecoMode,
    baseKw: Number(baseline.toFixed(2)),
    activeRoomLoadKw: Number(activeRoomLoadKw.toFixed(2)),
    rooms: state.rooms,
    alerts: state.systemAlerts,
    timestamp: new Date().toISOString()
  });
}
