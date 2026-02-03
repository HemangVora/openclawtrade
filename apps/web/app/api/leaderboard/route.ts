import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/store";

// GET /api/leaderboard
export async function GET() {
  const leaderboard = getLeaderboard();
  return NextResponse.json(leaderboard);
}
