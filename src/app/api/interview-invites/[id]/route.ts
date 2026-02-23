import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, candidateResponse } = body;

    const invite = await prisma.interviewInvite.update({
      where: { id: params.id },
      data: {
        status,
        candidateResponse,
        respondedAt: new Date(),
      },
      include: {
        application: {
          include: {
            job: true,
          },
        },
        candidate: true,
      },
    });

    // If accepted, create an actual Interview record
    if (status === "ACCEPTED") {
      await prisma.interview.create({
        data: {
          applicationId: invite.applicationId,
          type: invite.type,
          status: "SCHEDULED",
          scheduledAt: invite.scheduledAt,
          duration: invite.duration,
          location: invite.location,
          notes: invite.notes,
        },
      });
    }

    return NextResponse.json(invite);
  } catch (error) {
    console.error("Error responding to interview invite:", error);
    return NextResponse.json(
      { error: "Failed to respond to interview invite" },
      { status: 500 }
    );
  }
}
