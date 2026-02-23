import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, recruiterNotes } = body;

    // Update application
    const application = await prisma.application.update({
      where: { id: params.id },
      data: {
        status,
        recruiterNotes,
      },
      include: {
        candidate: true,
        job: true,
      },
    });

    // Update candidate status
    await prisma.candidate.update({
      where: { id: application.candidateId },
      data: { status },
    });

    // Create notification based on status
    let notificationType = "STATUS_UPDATE";
    let notificationTitle = "Application Status Update";
    let notificationMessage = `Your application for ${application.job.title} has been updated to ${status}.`;

    switch (status) {
      case "SCREENING":
        notificationType = "APPLICATION_REVIEWED";
        notificationTitle = "Application Under Review";
        notificationMessage = `Great news! Your application for ${application.job.title} is being reviewed by our team.`;
        break;
      case "INTERVIEW":
        notificationType = "INTERVIEW_SCHEDULED";
        notificationTitle = "Interview Invitation";
        notificationMessage = `Congratulations! We'd like to invite you for an interview for ${application.job.title}. We'll contact you soon with details.`;
        break;
      case "OFFER":
        notificationType = "OFFER_SENT";
        notificationTitle = "Job Offer!";
        notificationMessage = `Congratulations! We're pleased to offer you the position of ${application.job.title}. Please check your email for details.`;
        break;
      case "HIRED":
        notificationType = "HIRED";
        notificationTitle = "Welcome Aboard!";
        notificationMessage = `We're thrilled to welcome you to the team as ${application.job.title}!`;
        break;
      case "REJECTED":
        notificationType = "REJECTED";
        notificationTitle = "Application Update";
        notificationMessage = `Thank you for your interest in ${application.job.title}. While we've decided to move forward with other candidates, we appreciate your time and encourage you to apply for future opportunities.`;
        break;
    }

    await prisma.notification.create({
      data: {
        candidateId: application.candidateId,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        relatedType: "Application",
        relatedId: application.id,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
}
