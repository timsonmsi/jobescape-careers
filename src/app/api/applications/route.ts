import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, extractTextFromPDF, extractTextFromDocx, getFileType } from "@/lib/upload";
import { parseResume, scoreCandidate } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const resumeFile = formData.get("resume") as File | null;
    const candidateData = JSON.parse(formData.get("candidate") as string || "{}");
    const jobId = formData.get("jobId") as string;
    const answers = formData.get("answers") as string || "[]";

    if (!resumeFile || !jobId) {
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

    if (!job || job.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Job not found or not accepting applications" },
        { status: 404 }
      );
    }

    // Save resume file
    const { path, url } = await saveUploadedFile(resumeFile);

    // Extract text from resume
    let resumeText = "";
    const fileType = getFileType(resumeFile.name);
    
    if (fileType === "pdf") {
      resumeText = await extractTextFromPDF(resumeFile);
    } else if (fileType === "docx") {
      resumeText = await extractTextFromDocx(resumeFile);
    } else {
      resumeText = await resumeFile.text();
    }

    // Parse resume with AI
    const parsedData = await parseResume(resumeText);

    // Score candidate against job description
    const scoringResult = await scoreCandidate(resumeText, job.description);

    // Create or update candidate
    let candidate = await prisma.candidate.findUnique({
      where: { email: candidateData.email },
    });

    if (candidate) {
      // Update existing candidate
      candidate = await prisma.candidate.update({
        where: { email: candidateData.email },
        data: {
          name: parsedData?.name || candidateData.name,
          phone: parsedData?.phone || candidateData.phone,
          linkedin: parsedData?.linkedin || candidateData.linkedin,
          website: parsedData?.website || candidateData.website,
          location: parsedData?.location || candidateData.location,
          resumeUrl: url,
          resumeText,
          skills: parsedData?.skills || candidateData.skills || [],
          experience: parsedData?.experience_years,
          education: parsedData?.education,
          aiScore: scoringResult?.score,
          aiSummary: scoringResult?.summary,
          redFlags: scoringResult?.redFlags || [],
        },
      });
    } else {
      // Create new candidate
      candidate = await prisma.candidate.create({
        data: {
          email: candidateData.email,
          name: parsedData?.name || candidateData.name,
          phone: parsedData?.phone || candidateData.phone,
          linkedin: parsedData?.linkedin || candidateData.linkedin,
          website: parsedData?.website || candidateData.website,
          location: parsedData?.location || candidateData.location,
          resumeUrl: url,
          resumeText,
          coverLetter: candidateData.coverLetter,
          skills: parsedData?.skills || candidateData.skills || [],
          experience: parsedData?.experience_years,
          education: parsedData?.education,
          aiScore: scoringResult?.score,
          aiSummary: scoringResult?.summary,
          redFlags: scoringResult?.redFlags || [],
        },
      });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId,
        coverLetter: candidateData.coverLetter,
        answers: JSON.parse(answers),
      },
      include: {
        candidate: true,
        job: true,
      },
    });

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
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
