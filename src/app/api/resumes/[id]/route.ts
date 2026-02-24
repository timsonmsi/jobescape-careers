import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the application to find the resume
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      select: {
        resumeUrl: true,
      },
    });

    if (!application?.resumeUrl) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    // The resumeUrl is like "/uploads/resumes/xxx.pdf"
    const resumePath = join(process.cwd(), application.resumeUrl);

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
      return NextResponse.json(
        { error: "Resume file not found on server" },
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
