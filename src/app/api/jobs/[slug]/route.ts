import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        requirements: true,
        responsibilities: true,
        benefits: true,
        location: true,
        type: true,
        department: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        status: true,
        publishedAt: true,
        postedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();

    const job = await prisma.job.update({
      where: { slug: params.slug },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        requirements: body.requirements,
        responsibilities: body.responsibilities,
        benefits: body.benefits,
        location: body.location,
        type: body.type,
        department: body.department,
        salaryMin: body.salaryMin,
        salaryMax: body.salaryMax,
        status: body.status,
        publishedAt: body.status === "PUBLISHED" ? new Date() : null,
        closedAt: body.status === "CLOSED" ? new Date() : null,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.job.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
