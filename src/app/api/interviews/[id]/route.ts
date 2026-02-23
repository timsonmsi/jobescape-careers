import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const body = await request.json();

    const interview = await prisma.interview.update({
      where: { id: params.id },
      data: {
        type: body.type,
        status: body.status,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        duration: body.duration,
        location: body.location,
        notes: body.notes,
        feedback: body.feedback,
        score: body.score,
      },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
    });

    // If interview is completed, update application status
    if (body.status === "COMPLETED") {
      await prisma.application.update({
        where: { id: interview.applicationId },
        data: { status: "INTERVIEW" },
      });
    }

    return NextResponse.json(interview);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating interview:", error);
    return NextResponse.json(
      { error: "Failed to update interview" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    await prisma.interview.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error deleting interview:", error);
    return NextResponse.json(
      { error: "Failed to delete interview" },
      { status: 500 }
    );
  }
}
