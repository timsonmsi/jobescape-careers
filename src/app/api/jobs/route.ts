import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const department = searchParams.get("department");
    const type = searchParams.get("type");

    console.log("Fetching jobs with filters:", { status, department, type });

    const where: any = {};

    if (status) {
      where.status = status as JobStatus;
    }

    if (department) {
      where.department = department;
    }

    if (type) {
      where.type = type;
    }

    console.log("Query where:", JSON.stringify(where, null, 2));

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    console.log("Jobs found:", jobs.length);
    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: error.message },
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
