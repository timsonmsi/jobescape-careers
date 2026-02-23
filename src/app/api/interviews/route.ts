import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const interviewerId = searchParams.get("interviewerId");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (interviewerId) {
      where.interviewerId = interviewerId;
    }

    const interviews = await prisma.interview.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: {
        application: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(interviews);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();

    const interview = await prisma.interview.create({
      data: {
        applicationId: body.applicationId,
        interviewerId: body.interviewerId,
        type: body.type,
        scheduledAt: new Date(body.scheduledAt),
        duration: body.duration || 30,
        location: body.location,
        status: body.status || "SCHEDULED",
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

    return NextResponse.json(interview, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { error: "Failed to create interview" },
      { status: 500 }
    );
  }
}
