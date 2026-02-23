import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, getFileType } from "@/lib/upload";
import { parseResume, scoreCandidate } from "@/lib/ai";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: { appliedAt: "desc" },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
            linkedin: true,
            website: true,
            skills: true,
            experience: true,
            education: true,
            aiScore: true,
            resumeUrl: true,
            resumeText: true,
            coverLetter: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    // Map to include application-specific data with fallbacks
    const applicationsWithData = applications.map(app => ({
      ...app,
      name: app.name || app.candidate.name,
      email: app.email || app.candidate.email,
      phone: app.phone || app.candidate.phone,
      location: app.location || app.candidate.location,
      linkedin: app.linkedin || app.candidate.linkedin,
      website: app.website || app.candidate.website,
      coverLetter: app.coverLetter || app.candidate.coverLetter,
      resumeUrl: app.resumeUrl || app.candidate.resumeUrl,
    }));

    return NextResponse.json({ applications: applicationsWithData });
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const resumeFile = formData.get("resume") as File | null;
    const candidateData = JSON.parse(formData.get("candidate") as string || "{}");
    const jobId = formData.get("jobId") as string;
    const answers = formData.get("answers") as string || "[]";

    console.log("Application received:", {
      jobId,
      candidateEmail: candidateData.email,
      candidateName: candidateData.name,
      hasResume: !!resumeFile,
    });

    if (!resumeFile || !jobId) {
      console.error("Missing resume or jobId");
      return NextResponse.json(
        { error: "Resume and job ID are required" },
        { status: 400 }
      );
    }

    // Verify job exists and is published
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, status: true, description: true },
    });

    if (!job) {
      console.error("Job not found:", jobId);
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.status !== "PUBLISHED") {
      console.error("Job not published:", jobId, job.status);
      return NextResponse.json(
        { error: "Job is not accepting applications" },
        { status: 404 }
      );
    }

    // Save resume file
    const { url } = await saveUploadedFile(resumeFile);
    console.log("Resume saved to:", url);

    // Extract text from resume
    let resumeText = "";
    try {
      resumeText = await resumeFile.text();
      // Remove null bytes which PostgreSQL doesn't allow
      resumeText = resumeText.replace(/\0/g, '');
      console.log("Resume text extracted:", resumeText.length, "characters");
    } catch (error) {
      console.error("Error extracting resume text:", error);
    }

    // Parse resume with AI (optional)
    let parsedData = null;
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        parsedData = await parseResume(resumeText);
        console.log("Resume parsed:", parsedData);
      } catch (error) {
        console.error("Error parsing resume:", error);
      }
    }

    // Score candidate (optional)
    let scoringResult = null;
    if (process.env.ANTHROPIC_API_KEY && job.description) {
      try {
        scoringResult = await scoreCandidate(resumeText, job.description);
        console.log("Candidate scored:", scoringResult);
      } catch (error) {
        console.error("Error scoring candidate:", error);
      }
    }

    // Find or create candidate
    let candidate = await prisma.candidate.findUnique({
      where: { email: candidateData.email },
    });

    if (!candidate) {
      console.log("Creating new candidate:", candidateData.email);
      candidate = await prisma.candidate.create({
        data: {
          email: candidateData.email,
          name: parsedData?.name || candidateData.name,
          phone: parsedData?.phone || candidateData.phone,
          linkedin: parsedData?.linkedin || candidateData.linkedin,
          website: parsedData?.website || candidateData.website,
          location: parsedData?.location || candidateData.location,
          skills: parsedData?.skills || [],
          experience: parsedData?.experience_years,
          education: parsedData?.education,
          aiScore: scoringResult?.score,
          aiSummary: scoringResult?.summary,
          redFlags: scoringResult?.redFlags || [],
        },
      });
      console.log("Candidate created:", candidate.id);
    } else {
      console.log("Existing candidate found:", candidate.id);
    }

    // Create application with application-specific data
    console.log("Creating application...");
    const application = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId,
        name: candidateData.name,
        email: candidateData.email,
        phone: candidateData.phone,
        location: candidateData.location,
        linkedin: candidateData.linkedin,
        website: candidateData.website,
        coverLetter: candidateData.coverLetter,
        resumeUrl: url,
        resumeText,
        answers: JSON.parse(answers),
      },
      include: {
        candidate: true,
        job: true,
      },
    });

    console.log("Application created:", application.id);

    // Create notification for candidate
    await prisma.notification.create({
      data: {
        candidateId: candidate.id,
        type: "APPLICATION_RECEIVED",
        title: "Application Received",
        message: `Your application for ${job.title} has been submitted successfully.`,
        relatedType: "Application",
        relatedId: application.id,
      },
    });

    console.log("Application submitted successfully");

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
      },
      aiAnalysis: {
        score: scoringResult?.score,
        summary: scoringResult?.summary,
        strengths: scoringResult?.strengths,
        weaknesses: scoringResult?.weaknesses,
      },
    });
  } catch (error: any) {
    console.error("=== APPLICATION ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error code:", error.code);
    console.error("Error meta:", error.meta);
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to submit application",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
