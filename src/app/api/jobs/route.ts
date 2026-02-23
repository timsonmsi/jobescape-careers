import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PUBLISHED";
    const department = searchParams.get("department");
    const type = searchParams.get("type");

    const where: any = { status: status as JobStatus };

    if (department) {
      where.department = department;
    }

    if (type) {
      where.type = type;
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        location: true,
        type: true,
        department: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        publishedAt: true,
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const job = await prisma.job.create({
      data: {
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/\s+/g, "-"),
        description: body.description,
        requirements: body.requirements || [],
        responsibilities: body.responsibilities || [],
        benefits: body.benefits || [],
        location: body.location,
        type: body.type,
        department: body.department,
        salaryMin: body.salaryMin,
        salaryMax: body.salaryMax,
        currency: body.currency || "USD",
        status: body.status || "DRAFT",
        postedById: body.postedById,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
