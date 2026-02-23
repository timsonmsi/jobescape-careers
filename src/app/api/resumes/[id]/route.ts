import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // params.id could be application ID or filename
    let resumePath: string | null = null;
    
    // First try to find by application ID
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      select: {
        resumeUrl: true,
      },
    });

    if (application?.resumeUrl) {
      // resumeUrl is now just the filename
      const uploadDir = process.env.UPLOAD_DIR || "/tmp/uploads";
      resumePath = join(uploadDir, "resumes", application.resumeUrl);
    } else {
      // Try to find by filename directly
      const uploadDir = process.env.UPLOAD_DIR || "/tmp/uploads";
      resumePath = join(uploadDir, "resumes", params.id);
    }

    if (!resumePath) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    try {
      const file = await fs.readFile(resumePath);
      const fileName = resumePath.split("/").pop() || "resume.pdf";
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      // Set appropriate content type
      let contentType = "application/octet-stream";
      if (fileExtension === "pdf") {
        contentType = "application/pdf";
      } else if (fileExtension === "doc") {
        contentType = "application/msword";
      } else if (fileExtension === "docx") {
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      } else if (fileExtension === "txt") {
        contentType = "text/plain";
      }

      return new NextResponse(file, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${fileName}"`,
        },
      });
    } catch (fileError: any) {
      console.error("File not found:", resumePath);
      console.error("File error:", fileError.message);
      
      return NextResponse.json(
        { 
          error: "Resume file not found",
          details: fileError.message
        },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume", details: error.message },
      { status: 500 }
    );
  }
}
