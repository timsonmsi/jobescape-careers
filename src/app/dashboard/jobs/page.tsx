"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  slug: string;
  department: string | null;
  location: string;
  type: string;
  status: string;
  publishedAt: string | null;
  _count: {
    applications: number;
  };
}

const statusColors: Record<string, "default" | "success" | "destructive"> = {
  DRAFT: "default",
  PUBLISHED: "success",
  CLOSED: "destructive",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchJobs();
  }, [refreshKey]);

  // Listen for job update/delete events
  useEffect(() => {
    const handleJobUpdated = () => {
      console.log("Job updated event received, refreshing jobs list...");
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('jobUpdated', handleJobUpdated);
    return () => window.removeEventListener('jobUpdated', handleJobUpdated);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${slug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Job deleted successfully!");
        // Dispatch event to refresh jobs list
        window.dispatchEvent(new CustomEvent('jobUpdated'));
        fetchJobs();
      } else {
        const data = await response.json();
        alert(`Failed to delete job: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job");
    }
  };

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
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No jobs found</p>
            </div>
          ) : (
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
                        {job._count?.applications || 0}
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
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteJob(job.slug, job.title)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
