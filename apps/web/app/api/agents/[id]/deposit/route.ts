import { NextRequest, NextResponse } from "next/server";
import { getAgent, getVault, addDeposit } from "@/lib/store";

// POST /api/agents/[id]/deposit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const agent = getAgent(id);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { amount, investor } = body;

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 }
      );
    }

    if (!investor || typeof investor !== "string") {
      return NextResponse.json(
        { error: "investor address is required" },
        { status: 400 }
      );
    }

    const deposit = addDeposit(id, investor, amount);

    if (!deposit) {
      return NextResponse.json(
        { error: "Vault not found for this agent" },
        { status: 404 }
      );
    }

    const vault = getVault(id);

    return NextResponse.json({ deposit, vault }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
