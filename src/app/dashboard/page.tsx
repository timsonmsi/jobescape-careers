"use client";

import { useEffect, useState } from "react";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  candidate: {
    name: string;
    email: string;
  };
  job: {
    title: string;
    slug: string;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewedApplicationIds, setViewedApplicationIds] = useState<Set<string>>(() => {
    // Load from localStorage on mount (server-side rendering safe)
    const saved = typeof window !== 'undefined' ? localStorage.getItem('viewedApplications') : null;
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Save viewed applications to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('viewedApplications', JSON.stringify(
      Array.from(viewedApplicationIds)
    ));
  }, [viewedApplicationIds]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch("/api/analytics");
      if (response.ok) {
        const result = await response.json();
        setData(result);
        // Filter only SUBMITTED applications (new ones)
        const newApplications = (result.recentApplications || []).filter(
          (app: Application) => app.status === "SUBMITTED"
        );
        setRecentApplications(newApplications);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark application as viewed when hovered
  const markApplicationAsViewed = (applicationId: string) => {
    setViewedApplicationIds(prev => {
      // Don't re-add if already viewed
      if (prev.has(applicationId)) {
        return prev;
      }
      
      const newSet = new Set(prev).add(applicationId);
      
      // Save to localStorage immediately
      localStorage.setItem('viewedApplications', JSON.stringify(
        Array.from(newSet)
      ));
      
      // Dispatch event to update sidebar with the viewed application ID
      window.dispatchEvent(new CustomEvent('applicationsViewed', { 
        detail: { 
          applicationId: applicationId
        } 
      }));
      
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return <div>Failed to load dashboard</div>;
  }

  // Count new applications (not yet viewed)
  const newApplicationsCount = recentApplications.filter(app => !viewedApplicationIds.has(app.id)).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your recruitment activities</p>
      </div>

      <DashboardStats {...data.overview} />

      <div className="grid lg:grid-cols-2 gap-6">
        <PipelineChart data={data.pipeline} />

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingInterviews?.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming interviews</p>
            ) : (
              <div className="space-y-4">
                {data.upcomingInterviews?.map((interview: any) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{interview.application.candidate.name}</div>
                      <div className="text-sm text-gray-600">{interview.application.job.title}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(interview.scheduledAt)}
                      </div>
                      <div className="text-xs text-gray-500">{interview.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications - Show all applications, badge shows unread count */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Applications</span>
            {newApplicationsCount > 0 && (
              <Badge variant="default" className="bg-red-500">
                {newApplicationsCount} new
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentApplications.length === 0 ? (
            <p className="text-gray-500 text-sm">No applications yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Candidate</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Position</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">AI Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr 
                      key={app.id} 
                      className={`border-b cursor-pointer transition-colors ${
                        !viewedApplicationIds.has(app.id) ? 'hover:bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onMouseEnter={() => markApplicationAsViewed(app.id)}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{app.candidate.name}</div>
                          <div className="text-sm text-gray-500">{app.candidate.email}</div>
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
