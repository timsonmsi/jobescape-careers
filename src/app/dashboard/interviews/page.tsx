import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Calendar, Video, Phone, MapPin } from "lucide-react";

async function getInterviews() {
  const interviews = await prisma.interview.findMany({
    orderBy: { scheduledAt: "asc" },
    include: {
      application: {
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
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
  return interviews;
}

const statusColors: Record<string, "default" | "success" | "destructive" | "secondary"> = {
  SCHEDULED: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
};

const typeIcons: Record<string, any> = {
  PHONE: Phone,
  VIDEO: Video,
  ONSITE: MapPin,
  TECHNICAL: Calendar,
};

export default async function InterviewsPage() {
  const interviews = await getInterviews();

  const upcoming = interviews.filter(
    (i) => i.status === "SCHEDULED" && new Date(i.scheduledAt) >= new Date()
  );
  const past = interviews.filter(
    (i) => i.status !== "SCHEDULED" || new Date(i.scheduledAt) < new Date()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <p className="text-gray-600 mt-1">Schedule and manage interviews</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming interviews</p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((interview) => {
                  const TypeIcon = typeIcons[interview.type] || Calendar;
                  return (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-medium">
                          {interview.application.candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {interview.application.candidate.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {interview.application.job.title}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <TypeIcon className="w-4 h-4" />
                            {interview.type} • {interview.duration} min
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatDate(interview.scheduledAt)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {interview.scheduledAt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {interview.location && (
                          <div className="text-xs text-gray-500 mt-1">
                            {interview.location}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {past.length === 0 ? (
              <p className="text-gray-500 text-sm">No past interviews</p>
            ) : (
              <div className="space-y-4">
                {past.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">
                          {interview.application.candidate.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {interview.application.job.title}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={statusColors[interview.status] || "default"}>
                        {interview.status}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatDate(interview.scheduledAt)}
                      </div>
                      {interview.score && (
                        <div className="text-xs text-gray-500">
                          Score: {interview.score}/5
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
