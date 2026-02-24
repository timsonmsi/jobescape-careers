import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { read } = body;

    console.log("=== MARKING MESSAGE AS READ ===");
    console.log("Message ID:", params.id);
    console.log("Setting read to:", read);
    
    const message = await prisma.message.update({
      where: { id: params.id },
      data: { read },
    });

    console.log("Message updated:", message);
    console.log("==============================");

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}
