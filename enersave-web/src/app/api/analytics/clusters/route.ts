import { NextResponse } from "next/server";

import { getAnalyticsServiceUrl } from "@/lib/deployment-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(getAnalyticsServiceUrl(), {
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Analytics service unavailable" }, { status: response.status });
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Analytics service unavailable" }, { status: 503 });
  }
}
