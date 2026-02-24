import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get messages for a candidate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== GET /api/candidates/[id]/messages ===");
    console.log("Candidate ID:", params.id);
    console.log("Request URL:", request.url);
    
    const messages = await prisma.message.findMany({
      where: { candidateId: params.id },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    console.log("Messages returned:", messages.length);
    console.log("==============================");

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// Send a message to a candidate
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { senderName, content } = body;

    console.log("=== CREATING MESSAGE ===");
    console.log("Candidate ID:", params.id);
    console.log("Sender:", senderName);
    console.log("Content:", content.substring(0, 50));

    const message = await prisma.message.create({
      data: {
        candidateId: params.id,
        senderName,
        content,
        read: false, // Explicitly mark as unread for admin to see
      },
    });

    console.log("Message created:", message.id);
    console.log("Message read status:", message.read);
    console.log("======================");

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
