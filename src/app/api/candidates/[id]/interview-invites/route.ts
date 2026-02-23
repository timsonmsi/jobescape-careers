import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get interview invites for a candidate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invites = await prisma.interviewInvite.findMany({
      where: { candidateId: params.id },
      orderBy: { createdAt: "desc" },
      include: {
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
