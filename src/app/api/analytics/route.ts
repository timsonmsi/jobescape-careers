import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    // Get counts
    const [
      totalCandidates,
      totalJobs,
      totalApplications,
      totalInterviews,
      newCandidates,
      publishedJobs,
    ] = await Promise.all([
      prisma.candidate.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.interview.count(),
      prisma.candidate.count({ where: { status: "NEW" } }),
      prisma.job.count({ where: { status: "PUBLISHED" } }),
    ]);

    // Get pipeline distribution
    const pipelineData = await prisma.application.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get recent applications
    const recentApplications = await prisma.application.findMany({
      take: 10,
      orderBy: { appliedAt: "desc" },
      include: {
        candidate: {
          select: {
            name: true,
            email: true,
            aiScore: true,
          },
        },
        job: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    // Get upcoming interviews
    const upcomingInterviews = await prisma.interview.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          gte: new Date(),
        },
      },
      take: 10,
      orderBy: { scheduledAt: "asc" },
      include: {
        application: {
          include: {
            candidate: {
              select: {
                name: true,
                email: true,
              },
            },
            job: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Get source distribution
    const sourceData = await prisma.candidate.groupBy({
      by: ["source"],
      _count: true,
    });

    return NextResponse.json({
      overview: {
        totalCandidates,
        totalJobs,
        totalApplications,
        totalInterviews,
        newCandidates,
        publishedJobs,
      },
      pipeline: pipelineData.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      sources: sourceData.reduce((acc, item) => {
        acc[item.source] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentApplications,
      upcomingInterviews,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
