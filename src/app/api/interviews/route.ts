import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const invites = await prisma.interviewInvite.findMany({
      where,
      orderBy: { scheduledAt: "asc" }, // Closest time first
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        application: {
          include: {
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

    return NextResponse.json(invites);
  } catch (error) {
    console.error("Error fetching interview invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview invites" },
      { status: 500 }
    );
  }
}
