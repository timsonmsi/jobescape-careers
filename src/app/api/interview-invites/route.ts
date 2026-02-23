import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      applicationId,
      candidateId,
      interviewerId,
      type,
      scheduledAt,
      duration,
      location,
      notes,
    } = body;

    // Create interview invite
    const invite = await prisma.interviewInvite.create({
      data: {
        applicationId,
        candidateId,
        interviewerId,
        type: type || "VIDEO",
        scheduledAt: new Date(scheduledAt),
        duration: duration || 30,
        location,
        notes,
        status: "PENDING",
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

    // Create notification for the candidate
    await prisma.notification.create({
      data: {
        candidateId,
        type: "INTERVIEW_INVITE",
        title: "Interview Invitation",
        message: `You've been invited for a ${type || "video"} interview for ${invite.application.job.title}. Please check your dashboard to accept or decline.`,
        relatedType: "InterviewInvite",
        relatedId: invite.id,
      },
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error("Error creating interview invite:", error);
    return NextResponse.json(
      { error: "Failed to create interview invite" },
      { status: 500 }
    );
  }
}
