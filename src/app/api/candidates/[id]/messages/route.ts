import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get messages for a candidate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messages = await prisma.message.findMany({
      where: { candidateId: params.id },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

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

    const message = await prisma.message.create({
      data: {
        candidateId: params.id,
        senderName,
        content,
      },
    });

    // Create notification for the candidate
    await prisma.notification.create({
      data: {
        candidateId: params.id,
        type: "MESSAGE",
        title: `New message from ${senderName}`,
        message: content.substring(0, 200),
        relatedType: "Message",
        relatedId: message.id,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
