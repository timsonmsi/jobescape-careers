import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { CandidatesTable } from "@/components/candidates/CandidatesTable";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Plus, Calendar } from "lucide-react";

async function getDashboardData() {
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

  const pipelineData = await prisma.application.groupBy({
    by: ["status"],
    _count: true,
  });

  const recentApplications = await prisma.application.findMany({
    take: 5,
    orderBy: { appliedAt: "desc" },
    include: {
      candidate: {
        select: { name: true, email: true, aiScore: true },
      },
      job: {
        select: { title: true, slug: true },
      },
    },
  });

  const upcomingInterviews = await prisma.interview.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { gte: new Date() },
    },
    take: 5,
    orderBy: { scheduledAt: "asc" },
    include: {
      application: {
        include: {
          candidate: { select: { name: true, email: true } },
          job: { select: { title: true } },
        },
      },
    },
  });

  const pipeline = pipelineData.reduce((acc, item) => {
    acc[item.status] = item._count;
    return acc;
  }, {} as Record<string, number>);

  return {
    stats: {
      totalCandidates,
      totalJobs,
      totalApplications,
      totalInterviews,
      newCandidates,
      publishedJobs,
    },
    pipeline,
    recentApplications,
    upcomingInterviews,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your recruitment activities
          </p>
        </div>
        <Link href="/dashboard/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      <DashboardStats {...data.stats} />

      <div className="grid lg:grid-cols-2 gap-6">
        <PipelineChart data={data.pipeline} />

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingInterviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming interviews</p>
            ) : (
              <div className="space-y-4">
                {data.upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {interview.application.candidate.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {interview.application.job.title}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(interview.scheduledAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {interview.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentApplications.length === 0 ? (
            <p className="text-gray-500 text-sm">No applications yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Candidate
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Position
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      AI Score
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Applied
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentApplications.map((app) => (
                    <tr key={app.id} className="border-b">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">
                            {app.candidate.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.candidate.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/careers/${app.job.slug}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {app.job.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        {app.candidate.aiScore !== null && (
                          <Badge
                            variant={
                              app.candidate.aiScore! >= 70
                                ? "success"
                                : app.candidate.aiScore! >= 50
                                ? "warning"
                                : "destructive"
                            }
                          >
                            {app.candidate.aiScore}/100
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(app.appliedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
