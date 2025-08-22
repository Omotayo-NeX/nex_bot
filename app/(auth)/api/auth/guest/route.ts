export const runtime = 'nodejs';

import { NextResponse } from "next/server";

// Simple health-check so we know the route works
export async function GET() {
  return NextResponse.json({ ok: true, route: "guest" });
}

// If your app posts here to create a guest session, keep the POST:
export async function POST() {
  // TODO: your guest creation logic
  return NextResponse.json({ ok: true, who: "guest" });
}
