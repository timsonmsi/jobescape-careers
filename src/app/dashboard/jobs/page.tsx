import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getJobs() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });
  return jobs;
}

const statusColors: Record<string, "default" | "success" | "destructive"> = {
  DRAFT: "default",
  PUBLISHED: "success",
  CLOSED: "destructive",
};

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-1">Manage your job postings</p>
        </div>
        <Link href="/dashboard/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Applications
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Posted
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{job.title}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {job.department || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {job.location}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {job.type}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusColors[job.status] || "default"}>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {job._count.applications}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(job.publishedAt || job.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/careers/${job.slug}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/jobs/${job.slug}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
