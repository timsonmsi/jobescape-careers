import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get ALL messages to debug
    const allMessages = await prisma.message.findMany({
      select: {
        id: true,
        read: true,
        senderName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    console.log("=== ALL MESSAGES (DEBUG) ===");
    allMessages.forEach((msg, i) => {
      console.log(`${i + 1}. [${msg.read ? "READ" : "UNREAD"}] ${msg.senderName} - ${msg.createdAt}`);
    });
    console.log("============================");

    // Count unread messages
    const unreadMessages = await prisma.message.count({
      where: {
        read: false,
      },
    });

    // Count new applications (SUBMITTED status)
    let unreadApplications = await prisma.application.count({
      where: {
        status: "SUBMITTED",
      },
    });

    console.log("=== ADMIN NOTIFICATIONS ===");
    console.log("Unread messages:", unreadMessages);
    console.log("Unread applications:", unreadApplications);
    console.log("Total:", unreadMessages + unreadApplications);
    console.log("===========================");

    return NextResponse.json({
      unreadApplications,
      unreadMessages,
      total: unreadApplications + unreadMessages,
    });
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ids } = body;

    if (type === "applications") {
      // Mark applications as viewed by changing status or adding viewed flag
      // For now, we'll just log it
      console.log("Applications marked as viewed:", ids);
    } else if (type === "messages") {
      // Mark messages as read
      if (ids && Array.isArray(ids)) {
        await Promise.all(
          ids.map((id: string) =>
            prisma.message.update({
              where: { id },
              data: { read: true },
            })
          )
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as viewed:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as viewed" },
      { status: 500 }
    );
  }
}
