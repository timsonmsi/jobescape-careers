import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Count unread messages from all candidates
    const count = await prisma.message.count({
      where: {
        read: false,
      },
    });

    console.log("Unread messages count:", count);
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching unread messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread messages" },
      { status: 500 }
    );
  }
}
